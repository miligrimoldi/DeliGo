from flask import Blueprint, jsonify, request

from app import ProductoServicio, db, Ingrediente
from app.models.ingrediente_producto import IngredienteProducto

ingredientes_bp = Blueprint('ingredientes', __name__)

@ingredientes_bp.route('/ingredientes/por-servicio/<int:id_servicio>', methods=['GET'])
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
def asociar_ingredientes_a_producto(id_producto):
    data = request.get_json()
    ingredientes = data.get('ingredientes', [])

    if not isinstance(ingredientes, list):
        return jsonify({'error': 'Formato inválido para ingredientes'}), 400

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

    db.session.commit()
    return jsonify({'mensaje': 'Ingredientes asociados correctamente'}), 200
