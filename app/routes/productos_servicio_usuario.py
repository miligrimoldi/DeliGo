from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db, Ingrediente
from app.models.ingrediente_producto import IngredienteProducto
from app.models.producto_servicio import ProductoServicio
from app.models.stock import Stock
from datetime import datetime

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
@jwt_required()
def obtener_producto(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)

    ingredientes = (db.session.query(Ingrediente).join(IngredienteProducto,
                                                       Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente).filter(
        IngredienteProducto.id_producto == id_producto).all())
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
        "tiempo_limite": producto.tiempo_limite.strftime("%Y-%m-%d %H:%M:%S") if producto.tiempo_limite else None
    })


# Nueva ruta específica para productos desperdicio cero
@producto_servicio_usuario_bp.route('/producto/<int:id_producto>', methods=['GET'])
@jwt_required(optional=True)  # Hacer opcional para permitir acceso sin autenticación si es necesario
def obtener_producto_desperdicio(id_producto):
    try:
        producto = ProductoServicio.query.get_or_404(id_producto)

        # Verificar si el producto sigue siendo válido para desperdicio cero
        ahora = datetime.now()
        es_valido = True

        if producto.es_desperdicio_cero:
            if producto.tiempo_limite and ahora > producto.tiempo_limite:
                # El tiempo límite ha pasado, marcar como no disponible
                producto.es_desperdicio_cero = False
                producto.precio_oferta = None
                producto.cantidad_restante = 0
                producto.tiempo_limite = None
                db.session.commit()
                es_valido = False
            elif producto.cantidad_restante <= 0:
                es_valido = False

        return jsonify({
            "id_producto": producto.id_producto,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio_actual": producto.precio_actual,
            "foto": producto.foto,
            "id_servicio": producto.id_servicio,
            "nombre_servicio": producto.servicio.nombre,
            "es_desperdicio_cero": producto.es_desperdicio_cero,
            "precio_oferta": producto.precio_oferta,
            "cantidad_restante": producto.cantidad_restante,
            "tiempo_limite": producto.tiempo_limite.strftime("%Y-%m-%d %H:%M:%S") if producto.tiempo_limite else None,
            "es_valido": es_valido
        })
    except Exception as e:
        return jsonify({"error": "Producto no encontrado o no disponible"}), 404


@producto_servicio_usuario_bp.route("/producto/<int:id_producto>/max_disponible", methods=["GET"])
@jwt_required()
def obtener_max_disponible(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)
    maximo = calcular_max_disponible(producto.id_producto, producto.id_servicio)
    return jsonify({"max_disponible": maximo})