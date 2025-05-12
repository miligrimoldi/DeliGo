from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db, Ingrediente, ProductoServicio
from app.models.ingrediente_producto import IngredienteProducto
from app.models.stock import Stock

stock_bp = Blueprint('stock', __name__)

@stock_bp.route('/stock/<int:id_servicio>', methods=['GET'])
@jwt_required()
def get_stock(id_servicio):
    stock_items = (
        db.session.query(Stock, Ingrediente).join(Ingrediente, Stock.id_ingrediente == Ingrediente.id_ingrediente).filter(Stock.id_servicio == id_servicio).all()
    )

    resultado = [
        {
            'id_ingrediente': ingrediente.id_ingrediente,
            'nombre': ingrediente.nombre,
            'disponible': stock.disponibilidad
        }
        for stock, ingrediente in stock_items
    ]

    return jsonify(resultado), 200

@stock_bp.route('/stock/<int:id_servicio>/<int:id_ingrediente>', methods=['PUT'])
@jwt_required()
def actualizar_stock(id_servicio, id_ingrediente):
    data = request.get_json()
    disponible = data.get('disponible')
    if disponible is None or not isinstance(disponible, bool):
        return jsonify({'error': 'Se requiere el campo booleano "disponible"'}), 400


    stock_item = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=id_ingrediente).first()
    if not stock_item:
        return jsonify({'error': 'Ingrediente no asociado al servicio'}), 404

    stock_item.disponibilidad = disponible

    # Busco los productos afectados
    productos_afectados = (
        db.session.query(ProductoServicio)
        .join(IngredienteProducto, ProductoServicio.id_producto == IngredienteProducto.id_producto)
        .filter(
            ProductoServicio.id_servicio == id_servicio,
            IngredienteProducto.id_ingrediente == id_ingrediente
        ).all()
    )
    if not disponible:
        # Si el ingrediente fue marcado como NO disponible, los productos que lo usan también deben serlo
        for producto in productos_afectados:
            producto.disponible = False
    else:
        # Si el ingrediente fue marcado como disponible, verificar si todos los ingredientes del producto están disponibles
        for producto in productos_afectados:
            ingredientes_del_producto = (
                db.session.query(Ingrediente, Stock)
                .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
                .join(Stock, (Stock.id_ingrediente == Ingrediente.id_ingrediente) & (Stock.id_servicio == id_servicio))
                .filter(IngredienteProducto.id_producto == producto.id_producto)
                .all()
            )

            # Verificar si todos los ingredientes están disponibles
            if all(stock_item.disponibilidad for _, stock_item in ingredientes_del_producto):
                producto.disponible = True  # Reactivar el producto si todos sus ingredientes están disponibles

    db.session.commit()

    return jsonify({'mensaje': 'Disponibilidad actualizada correctamente'}), 200




