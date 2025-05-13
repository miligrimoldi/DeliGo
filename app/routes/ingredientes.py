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

    for item in ingredientes:
        nombre = item.get("nombre")
        cantidad = item.get("cantidad", 1)
        ingrediente = Ingrediente.query.filter_by(nombre=nombre).first()
        if not ingrediente:
            ingrediente = Ingrediente(nombre=nombre)
            db.session.add(ingrediente)
            db.session.flush()

        existe_asociacion = IngredienteProducto.query.filter_by(
            id_producto=id_producto,
            id_ingrediente=ingrediente.id_ingrediente
        ).first()

        if existe_asociacion:
            existe_asociacion.cantidad_necesaria = cantidad
        else:
            nueva_asociacion = IngredienteProducto(
                id_producto=id_producto,
                id_ingrediente=ingrediente.id_ingrediente,
                cantidad_necesaria=cantidad
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

    asociaciones = (
        db.session.query(Ingrediente, IngredienteProducto.cantidad_necesaria)
        .join(IngredienteProducto, IngredienteProducto.id_ingrediente == Ingrediente.id_ingrediente)
        .filter(IngredienteProducto.id_producto == id_producto)
        .all()
    )

    lista_ingredientes_necesarios = [
        {
            'id_ingrediente': ingr.id_ingrediente,
            'nombre': ingr.nombre,
            'cantidad': cantidad_necesaria
        }
        for ingr, cantidad_necesaria in asociaciones
    ]

    return jsonify({'ingredientes_necesarios': lista_ingredientes_necesarios}), 200


@ingredientes_bp.route('/productos/<int:id_producto>/ingredientes', methods=['DELETE'])
@jwt_required()
def desasociar_ingredientes_de_producto(id_producto):
    data = request.get_json()
    ids_ingredientes = data.get('ingredientes', [])

    if not isinstance(ids_ingredientes, list):
        return jsonify({'error': 'Formato inválido para ingredientes'}), 400

    for id_ingrediente in ids_ingredientes:
        asociacion = IngredienteProducto.query.filter_by(
            id_producto=id_producto,
            id_ingrediente=id_ingrediente
        ).first()

        if asociacion:
            db.session.delete(asociacion)

    db.session.commit()
    return jsonify({'mensaje': 'Ingredientes desasociados correctamente'}), 200