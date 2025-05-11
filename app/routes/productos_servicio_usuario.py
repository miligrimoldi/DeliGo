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
        "ingredientes": ingredientes_serializados
    })
