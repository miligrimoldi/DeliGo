from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

from app.main import obtener_usuario
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio
from app.models.opinion_servicio import OpinionServicio
from app.models.opinion_producto import OpinionProducto
from app.models.usuario import User
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.categoria import Categoria

from app.extensions import db
from sqlalchemy import func
from statistics import mean


# Obtener info del servivio especifico (nombre + entidad)

info_servicio_bp = Blueprint('info_servicio', __name__)

@info_servicio_bp.route('/empleado/servicio/<int:id_servicio>', methods=['GET'])
@jwt_required()
def info_servicio(id_servicio):
    servicio = Servicio.query.get_or_404(id_servicio)
    entidad = servicio.entidad
    return jsonify({
        "nombre_servicio": servicio.nombre,
        "nombre_entidad": entidad.nombre
    })

# Obtener categorias del servicio

categorias_servicio_bp = Blueprint('categorias_servicio', __name__)

@categorias_servicio_bp.route('/empleado/servicio/<int:id_servicio>/categorias', methods=['GET'])
@jwt_required()
def categorias_servicio(id_servicio):
    servicio = Servicio.query.get_or_404(id_servicio)
    categorias = servicio.categorias
    return jsonify([
        {"id_categoria": c.id_categoria, "nombre": c.nombre}
        for c in categorias
    ])

# Obtener productos de un servicio

productos_servicio_bp = Blueprint('productos_servicio', __name__)
@productos_servicio_bp.route('/empleado/servicio/<int:id_servicio>/categoria/<int:id_categoria>/productos', methods=['GET'])
@jwt_required()
def productos_servicio(id_servicio, id_categoria):
    productos = ProductoServicio.query.filter_by(
        id_servicio=id_servicio,
        id_categoria=id_categoria,
        activo=True
    ).all()

    return jsonify([{
        "id_producto": p.id_producto,
        "nombre": p.nombre,
        "precio_actual": p.precio_actual,
        "descripcion": p.descripcion,
        "informacion_nutricional": p.informacion_nutricional,
        "foto": p.foto,
        "disponible": p.disponible
    } for p in productos])


@productos_servicio_bp.route('/empleado/servicio/<int:id_servicio>/categoria/<int:id_categoria>/producto', methods=['POST'])
@jwt_required()
def nuevo_producto(id_servicio, id_categoria):
    data = request.get_json()

    nuevo_producto = ProductoServicio(
        id_servicio=id_servicio,
        id_categoria=id_categoria,
        nombre=data.get("nombre"),
        descripcion=data.get("descripcion"),
        informacion_nutricional=data.get("informacion_nutricional"),
        precio_actual=data.get("precio_actual"),
        foto=data.get("foto"),
        disponible = True
    )

    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({
        "mensaje": "Producto creado con éxito",
        "id_producto": nuevo_producto.id_producto
    }), 201

# Ruta para modificar producto
@productos_servicio_bp.route('/empleado/producto/<int:id_producto>', methods=['PUT'])
@jwt_required()
def editar_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)
    data = request.get_json()

    producto.nombre = data.get("nombre", producto.nombre)
    producto.descripcion = data.get("descripcion", producto.descripcion)
    producto.informacion_nutricional = data.get("informacion_nutricional", producto.informacion_nutricional)
    producto.precio_actual = data.get("precio_actual", producto.precio_actual)
    producto.foto = data.get("foto", producto.foto)

    db.session.commit()

    return jsonify({"mensaje": "Producto actualizado con éxito"}), 200

# Ruta para eliminar producto
@productos_servicio_bp.route('/empleado/producto/<int:id_producto>', methods=['DELETE'])
@jwt_required()
def eliminar_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)
    producto.activo = False
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado con éxito"}), 200

# Ruta para obtener pedidos de un servicio
pedidos_servicio_bp = Blueprint('pedidos_servicio', __name__)
@pedidos_servicio_bp.route('/servicios/<int:id_servicio>/pedidos', methods=['GET'])
@jwt_required()
def pedidos_servicio(id_servicio):
    pedidos = Pedido.query.filter_by(id_servicio=id_servicio).all()
    return jsonify([
        {
            'id_pedido': p.id_pedido,
            'estado': p.estado,
            'tiempo_estimado_minutos': p.tiempo_estimado_minutos,
            'id_usuario_consumidor': p.id_usuario_consumidor,
            'email_usuario': User.query.get(p.id_usuario_consumidor).email,
            'detalles': [
                {
                    'id_detalle': d.id_detalle,
                    'cantidad': d.cantidad,
                    'producto': {
                        'nombre': d.producto.nombre
                    }
                } for d in p.detalles
            ]
        } for p in pedidos
    ])

# Editar pedido
@pedidos_servicio_bp.route('/pedidos/<int:id_pedido>/estado', methods=['PUT'])
@jwt_required()
def cambiar_estado_pedido(id_pedido):
    data = request.json
    pedido = Pedido.query.get_or_404(id_pedido)

    nuevo_estado = data.get('estado')
    nuevo_tiempo = data.get('tiempo_estimado_minutos')

    if nuevo_estado:
        if nuevo_estado == "en_preparacion" and nuevo_tiempo is None:
            return jsonify({"mensaje": "Se requiere un tiempo estimado de entrega al pasar a 'en_preparacion'"}), 400
        pedido.estado = nuevo_estado

    # Permitir cambiar el tiempo mientras está en preparación
    if nuevo_tiempo is not None:
        if pedido.estado != "en_preparacion" and (not nuevo_estado or nuevo_estado != "en_preparacion"):
            return jsonify({"mensaje": "Solo se puede modificar el tiempo estimado cuando el pedido está en preparación"}), 400
        pedido.tiempo_estimado_minutos = nuevo_tiempo

    db.session.commit()
    return jsonify({"mensaje": "Pedido actualizado correctamente"})

opiniones_bp = Blueprint('opiniones_bp', __name__)


@opiniones_bp.route('/admin/servicio/<int:id_servicio>/opiniones', methods=['GET'])
@jwt_required()
def opiniones_generales_servicio(id_servicio):
    servicio = Servicio.query.get_or_404(id_servicio)
    opiniones = OpinionServicio.query.filter_by(id_servicio=id_servicio).all()

    data = [{
        "usuario": op.usuario.nombre,
        "comentario": op.comentario,
        "puntaje": op.puntaje,
        "fecha": op.fecha.strftime("%Y-%m-%d") if op.fecha else ""
    } for op in opiniones]

    promedio = round(mean([op.puntaje for op in opiniones]), 1) if opiniones else 0.0

    return jsonify({"promedio": promedio, "opiniones": data})


@opiniones_bp.route('/admin/servicio/<int:id_servicio>/productos-opinados', methods=['GET'])
@jwt_required()
def productos_opinados(id_servicio):
    resultados = db.session.query(
        OpinionProducto.id_producto,
        func.avg(OpinionProducto.puntaje).label("puntaje_promedio"),
        func.count(OpinionProducto.id_opinion_producto).label("cantidad_opiniones")
    ).join(ProductoServicio, OpinionProducto.id_producto == ProductoServicio.id_producto)\
     .filter(ProductoServicio.id_servicio == id_servicio)\
     .group_by(OpinionProducto.id_producto).all()

    productos = []
    for r in resultados:
        producto = ProductoServicio.query.get(r.id_producto)
        productos.append({
            "id_producto": producto.id_producto,
            "nombre": producto.nombre,
            "foto": producto.foto,
            "puntaje_promedio": round(r.puntaje_promedio, 1) if r.puntaje_promedio else 0.0,
            "cantidad_opiniones": r.cantidad_opiniones
        })

    return jsonify({"productos": productos})


@opiniones_bp.route('/admin/producto/<int:id_producto>/opiniones', methods=['GET'])
@jwt_required()
def opiniones_por_producto(id_producto):
    opiniones = OpinionProducto.query.filter_by(id_producto=id_producto).all()

    data = [{
        "usuario": op.usuario.nombre,
        "comentario": op.comentario,
        "puntaje": op.puntaje,
        "fecha": op.fecha.strftime("%Y-%m-%d") if op.fecha else ""
    } for op in opiniones]

    promedio = round(mean([op.puntaje for op in opiniones]), 1) if opiniones else 0.0

    return jsonify({"promedio": promedio, "opiniones": data})


    

