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


    stock_item = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=id_ingrediente).first()
    if not stock_item:
        return jsonify({'error': 'Ingrediente no asociado al servicio'}), 404

    stock_item.disponibilidad = disponible

    db.session.commit()

    return jsonify({'mensaje': 'Disponibilidad actualizada correctamente'}), 200




