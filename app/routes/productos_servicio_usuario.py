from flask import Blueprint, jsonify, request

from app import db, Ingrediente
from app.models.ingrediente_producto import IngredienteProducto
from app.models.producto_servicio import ProductoServicio
from app.models.stock import Stock

producto_servicio_usuario_bp = Blueprint('producto_servicio_usuario', __name__)

def calcular_max_disponible(id_producto, id_servicio):
    asociaciones = IngredienteProducto.query.filter_by(id_producto=id_producto).all()
    maximos = []

    for asoc in asociaciones:
        stock_entry = Stock.query.filter_by(
            id_servicio=id_servicio,
            id_ingrediente=asoc.id_ingrediente
        ).first()

        if not stock_entry or asoc.cantidad_necesaria == 0:
            return 0

        maximo = stock_entry.cantidad // asoc.cantidad_necesaria
        maximos.append(maximo)

    return min(maximos) if maximos else 0


@producto_servicio_usuario_bp.route('/api/productos/<int:id_producto>', methods=['GET'])
def obtener_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)

    ingredientes = (db.session.query(Ingrediente).join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente).filter(IngredienteProducto.id_producto == id_producto).all())
    ingredientes_serializados = [
        {"id_ingrediente": ingr.id_ingrediente, "nombre": ingr.nombre}
        for ingr in ingredientes
    ]

    max_disponible = calcular_max_disponible(producto.id_producto, producto.id_servicio)

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
        "max_disponible": max_disponible,
        "es_desperdicio_cero": producto.es_desperdicio_cero,
        "precio_oferta": producto.precio_oferta,
        "cantidad_restante": producto.cantidad_restante,
        "tiempo_limite": producto.tiempo_limite.isoformat() if producto.tiempo_limite else None
    })

