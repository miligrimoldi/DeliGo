from flask import Blueprint, jsonify, request

from app import db, Ingrediente
from app.models.ingrediente_producto import IngredienteProducto
from app.models.producto_servicio import ProductoServicio

producto_servicio_usuario_bp = Blueprint('producto_servicio_usuario', __name__)

@producto_servicio_usuario_bp.route('/api/productos/<int:id_producto>', methods=['GET'])
def obtener_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)

    ingredientes = (db.session.query(Ingrediente).join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente).filter(IngredienteProducto.id_producto == id_producto).all())
    ingredientes_serializados = [
        {"id_ingrediente": ingr.id_ingrediente, "nombre": ingr.nombre}
        for ingr in ingredientes
    ]

    return jsonify({
        "id_producto": producto.id_producto,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio_actual": producto.precio_actual,
        "foto": producto.foto,
        "id_servicio": producto.id_servicio,
        "nombre_servicio": producto.servicio.nombre,
        "puntaje_promedio": producto.puntaje_promedio,
        "cantidad_opiniones": producto.cantidad_opiniones,
        "ingredientes": ingredientes_serializados,
        "disponible": producto.disponible,
        "es_desperdicio_cero": bool(producto.es_desperdicio_cero),
        "precio_oferta": producto.precio_oferta,
        "cantidad_restante": producto.cantidad_restante,
        "tiempo_limite": producto.tiempo_limite.isoformat() if producto.tiempo_limite else None
    })

@producto_servicio_usuario_bp.route('/api/servicio/<int:id_servicio>/categoria/<int:id_categoria>/productos', methods=['GET'])
def productos_por_categoria_usuario(id_servicio, id_categoria):
    productos = ProductoServicio.query.filter_by(
        id_servicio=id_servicio,
        id_categoria=id_categoria
    ).all()

    return jsonify([
        {
            "id_producto": p.id_producto,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio_actual": p.precio_actual,
            "foto": p.foto,
            "puntaje_promedio": p.puntaje_promedio,
            "cantidad_opiniones": p.cantidad_opiniones,
            "es_desperdicio_cero": bool(p.es_desperdicio_cero),
            "precio_oferta": p.precio_oferta,
            "cantidad_restante": p.cantidad_restante,
            "tiempo_limite": p.tiempo_limite.isoformat() if p.tiempo_limite else None
        } for p in productos
    ])

@producto_servicio_usuario_bp.route("/servicio/<int:id_servicio>/desperdicio", methods=["GET"])
def productos_desperdicio(id_servicio):
    productos = ProductoServicio.query.filter_by(
        id_servicio=id_servicio,
        es_desperdicio_cero=True
    ).all()
    return jsonify([
        {
            "id_producto": p.id_producto,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "foto": p.foto,
            "precio_original": p.precio_actual,
            "precio_oferta": p.precio_oferta,
            "cantidad_restante": p.cantidad_restante,
            "tiempo_limite": p.tiempo_limite.strftime("%H:%M") if p.tiempo_limite else None
        }
        for p in productos
    ])