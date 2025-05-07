from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.main import obtener_usuario
from app.models.categoria import Categoria
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio
from app.extensions import db
from app.models.usuario import User
from app.models.producto_servicio import ProductoServicio
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.usuario_empleado import UsuarioEmpleado

# Obtener info del servivio especifico (nombre + entidad)

info_servicio_bp = Blueprint('info_servicio', __name__)

@info_servicio_bp.route('/admin/servicio/<int:id_servicio>', methods=['GET'])
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

@categorias_servicio_bp.route('/admin/servicio/<int:id_servicio>/categorias', methods=['GET'])
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
@productos_servicio_bp.route('/admin/servicio/<int:id_servicio>/categoria/<int:id_categoria>/productos', methods=['GET'])
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
        "foto": p.foto
    } for p in productos])


@productos_servicio_bp.route('/admin/servicio/<int:id_servicio>/categoria/<int:id_categoria>/producto', methods=['POST'])
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
        foto=data.get("foto")
    )

    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({"mensaje": "Producto creado con éxito"}), 201

# Ruta para modificar producto
@productos_servicio_bp.route('/admin/producto/<int:id_producto>', methods=['PUT'])
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
@productos_servicio_bp.route('/admin/producto/<int:id_producto>', methods=['DELETE'])
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

# Ruta para dar de alta empleados
empleados_bp = Blueprint('empleados', __name__)
@empleados_bp.route('/servicios/<int:id_servicio>/empleados', methods=['POST'])
@jwt_required()
def alta_empleados(id_servicio):
    data = request.get_json()

    nuevo_empleado = UsuarioEmpleado(
        id_servicio=id_servicio,
        nombre=data['nombre'],
        apellido=data['apellido'],
        email=data['email'],
        contrasena=data['contrasena'],
        dni=data['dni'],
        esAdmin=False,
    )

    db.session.add(nuevo_empleado)
    db.session.commit()
    return jsonify({'mensaje': 'Empleado creado exitosamente'}), 201

@empleados_bp.route('/servicios/<int:id_servicio>/empleados/<int:id_empleado>', methods=['DELETE'])
@jwt_required()
def baja_empleado(id_servicio, id_empleado):
    empleado = UsuarioEmpleado.query.get_or_404(id_empleado)

    if empleado.id_servicio != id_servicio:
        return jsonify({'error': 'Empleado no pertenece a este servicio'}), 403

    db.session.delete(empleado)
    db.session.commit()
    return jsonify({'mensaje': 'Empleado eliminado correctamente'}), 200

@empleados_bp.route('/servicios/<int:id_servicio>/empleados/<int:id_empleado>', methods=['PUT'])
@jwt_required()
def modificar_empleado(id_servicio, id_empleado):
    empleado = UsuarioEmpleado.query.get_or_404(id_empleado)
    data = request.get_json()

    if empleado.id_servicio != id_servicio:
        return jsonify({'error': 'Empleado no pertenece a este servicio'}), 403

    empleado.nombre = data.get('nombre', empleado.nombre)
    empleado.apellido = data.get('apellido', empleado.apellido)
    empleado.email = data.get('email', empleado.email)
    empleado.dni = data.get('dni', empleado.dni)
    empleado.esAdmin = data.get('esAdmin', empleado.esAdmin)

    db.session.commit()
    return jsonify({'mensaje': 'Empleado modificado correctamente'}), 200

@empleados_bp.route('/servicios/<int:id_servicio>/empleados', methods=['GET'])
@jwt_required()
def listar_empleados(id_servicio):
    empleados = UsuarioEmpleado.query.filter_by(id_servicio=id_servicio).all()
    return jsonify([
        {
            'id': e.id,
            'nombre': e.nombre,
            'apellido': e.apellido,
            'email': e.email,
            'dni': e.dni,
            'esAdmin': e.esAdmin
        } for e in empleados
    ])

    

