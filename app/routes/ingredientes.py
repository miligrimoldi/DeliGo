from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import ProductoServicio, db, Ingrediente
from app.models.ingrediente_producto import IngredienteProducto
from app.models.stock import Stock

ingredientes_bp = Blueprint('ingredientes', __name__)

@ingredientes_bp.route('/ingredientes/por-servicio/<int:id_servicio>', methods=['GET'])
@jwt_required()
def get_ingredientes_por_servicio(id_servicio):
    subquery_products = db.session.query(ProductoServicio.id_producto).filter_by(id_servicio=id_servicio).subquery()

    ingredientes = (
        db.session.query(Ingrediente).join(IngredienteProducto, IngredienteProducto.id_ingrediente == Ingrediente.id_ingrediente).filter(IngredienteProducto.id_producto.in_(subquery_products))
        .distinct().all()
    )

    resultado = [
        {'id': ingr.id_ingrediente, 'nombre': ingr.nombre}
        for ingr in ingredientes
    ]

    return jsonify(resultado)

@ingredientes_bp.route('/productos/<int:id_producto>/ingredientes', methods=['POST'])
@jwt_required()
def asociar_ingredientes_a_producto(id_producto):
    data = request.get_json()
    ingredientes = data.get('ingredientes', [])

    if not isinstance(ingredientes, list):
        return jsonify({'error': 'Formato inválido para ingredientes'}), 400

    producto = ProductoServicio.query.get(id_producto)
    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404

    id_servicio = producto.id_servicio


    for nombre in ingredientes:
        ingrediente = Ingrediente.query.filter_by(nombre=nombre).first()
        if not ingrediente:
            ingrediente = Ingrediente(nombre=nombre)
            db.session.add(ingrediente)
            db.session.flush()  # Para obtener el id_ingrediente antes de commit

        existe_asociacion = IngredienteProducto.query.filter_by(
            id_producto=id_producto,
            id_ingrediente=ingrediente.id_ingrediente
        ).first()

        if not existe_asociacion:
            nueva_asociacion = IngredienteProducto(
                id_producto=id_producto,
                id_ingrediente=ingrediente.id_ingrediente
            )
            db.session.add(nueva_asociacion)

        # Agregar ingrediente al stock del servicio

        stock_entry = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=ingrediente.id_ingrediente).first()
        if not stock_entry:
            nuevo_stock = Stock(
                id_servicio=id_servicio,
                id_ingrediente=ingrediente.id_ingrediente,
                disponibilidad=True
            )
            db.session.add(nuevo_stock)

    db.session.commit()
    return jsonify({'mensaje': 'Ingredientes asociados correctamente'}), 200

# Buscar ingredientes de un producto
@ingredientes_bp.route('/productos/<int:id_producto>/ingredientes', methods=['GET'])
@jwt_required()
def obtener_ingredientes_de_producto(id_producto):
    producto = ProductoServicio.query.get(id_producto)
    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404

    ingredientes = (
        db.session.query(Ingrediente.nombre)
        .join(IngredienteProducto, IngredienteProducto.id_ingrediente == Ingrediente.id_ingrediente)
        .filter(IngredienteProducto.id_producto == id_producto)
        .all()
    )

    lista_ingredientes = [ingrediente[0] for ingrediente in ingredientes]
    return jsonify({'ingredientes': lista_ingredientes}), 200

