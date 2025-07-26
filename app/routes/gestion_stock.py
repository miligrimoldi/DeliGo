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
            'cantidad': stock.cantidad
        }
        for stock, ingrediente in stock_items
    ]

    return jsonify(resultado), 200

@stock_bp.route('/stock/<int:id_servicio>/<int:id_ingrediente>', methods=['PUT'])
@jwt_required()
def actualizar_stock(id_servicio, id_ingrediente):
    data = request.get_json()
    nueva_cantidad = data.get('cantidad')


    stock_item = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=id_ingrediente).first()
    if not stock_item:
        return jsonify({'error': 'Ingrediente no asociado al servicio'}), 404

    stock_item.cantidad = nueva_cantidad

    db.session.commit()

    return jsonify({'mensaje': 'Disponibilidad actualizada correctamente'}), 200

@stock_bp.route('/stock/<int:id_servicio>/nuevo', methods=['POST'])
@jwt_required()
def crear_ingrediente_en_stock(id_servicio):
    data = request.get_json()
    nombre = data.get("nombre")
    cantidad = data.get("cantidad", 0)

    if not nombre:
        return jsonify({"error": "Falta el nombre del ingrediente"}), 400

    # Crear ingrediente si no existe
    ingrediente = Ingrediente.query.filter_by(nombre=nombre).first()
    if not ingrediente:
        ingrediente = Ingrediente(nombre=nombre)
        db.session.add(ingrediente)
        db.session.flush()

    # Verificar si ya está en stock
    existente = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=ingrediente.id_ingrediente).first()
    if existente:
        return jsonify({"error": "Ingrediente ya existe en el stock"}), 400

    nuevo_stock = Stock(id_servicio=id_servicio, id_ingrediente=ingrediente.id_ingrediente, cantidad=cantidad)
    db.session.add(nuevo_stock)
    db.session.commit()

    return jsonify({"mensaje": "Ingrediente agregado correctamente"}), 201

@stock_bp.route('/stock/<int:id_servicio>/<int:id_ingrediente>', methods=['DELETE'])
@jwt_required()
def eliminar_ingrediente_de_stock(id_servicio, id_ingrediente):
    stock_item = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=id_ingrediente).first()
    if not stock_item:
        return jsonify({'error': 'Ingrediente no encontrado en el stock'}), 404

    db.session.delete(stock_item)
    db.session.commit()
    return jsonify({'mensaje': 'Ingrediente eliminado del stock'}), 200



