from flask import Blueprint, jsonify, request
from app.models.producto_servicio import ProductoServicio

producto_servicio_usuario_bp = Blueprint('producto_servicio_usuario', __name__)

@producto_servicio_usuario_bp.route('/api/productos/<int:id_producto>', methods=['GET'])
def obtener_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)
    return jsonify({
        "id_producto": producto.id_producto,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio_actual": producto.precio_actual,
        "foto": producto.foto,
        "id_servicio": producto.id_servicio,
        "nombre_servicio": producto.servicio.nombre,
        "puntaje_promedio": producto.puntaje_promedio,
        "cantidad_opiniones": producto.cantidad_opiniones
        # "ingredientes": producto.ingredientes or []
    })
