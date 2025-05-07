from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.opinion_producto import OpinionProducto
from app.models.opinion_servicio import OpinionServicio
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio

opinion_bp = Blueprint("opinion", __name__, url_prefix="/api/opinion")


def actualizar_puntaje_promedio_producto(producto):
    opiniones = OpinionProducto.query.filter_by(id_producto=producto.id_producto).all()
    if opiniones:
        promedio = sum(o.puntaje for o in opiniones) / len(opiniones)
        cantidad = len(opiniones)
    else:
        promedio = 0
        cantidad = 0
    producto.puntaje_promedio = promedio
    producto.cantidad_opiniones = cantidad
    db.session.add(producto)
    db.session.commit()


def actualizar_puntaje_promedio_servicio(servicio):
    opiniones = OpinionServicio.query.filter_by(id_servicio=servicio.id_servicio).all()
    if opiniones:
        promedio = sum(o.puntaje for o in opiniones) / len(opiniones)
        cantidad = len(opiniones)
    else:
        promedio = 0
        cantidad = 0
    servicio.puntaje_promedio = promedio
    servicio.cantidad_opiniones = cantidad
    db.session.add(servicio)
    db.session.commit()


@opinion_bp.route('/producto', methods=['POST'])
@jwt_required()
def dejar_opinion_producto():
    id_usuario = int(get_jwt_identity())
    data = request.get_json()

    id_producto = data.get("id_producto")
    comentario = data.get("comentario", "")
    puntaje = data.get("puntaje")

    if not id_producto or puntaje is None:
        return jsonify({"error": "Faltan campos"}), 400

    opinion = OpinionProducto(
        id_usuario=id_usuario,
        id_producto=id_producto,
        id_pedido=data.get("id_pedido"),
        comentario=comentario,
        puntaje=puntaje
    )
    db.session.add(opinion)
    db.session.commit()

    producto = ProductoServicio.query.get(id_producto)
    if producto:
        actualizar_puntaje_promedio_producto(producto)

    return jsonify({"msg": "Opinión de producto guardada"}), 201


@opinion_bp.route('/servicio', methods=['POST'])
@jwt_required()
def dejar_opinion_servicio():
    id_usuario = int(get_jwt_identity())
    data = request.get_json()

    id_servicio = data.get("id_servicio")
    comentario = data.get("comentario", "")
    puntaje = data.get("puntaje")

    if not id_servicio or puntaje is None:
        return jsonify({"error": "Faltan campos"}), 400

    opinion = OpinionServicio(
        id_usuario=id_usuario,
        id_pedido=data.get("id_pedido"),
        id_servicio=id_servicio,
        comentario=comentario,
        puntaje=puntaje
    )
    db.session.add(opinion)
    db.session.commit()

    servicio = Servicio.query.get(id_servicio)
    if servicio:
        actualizar_puntaje_promedio_servicio(servicio)

    return jsonify({"msg": "Opinión de servicio guardada"}), 201


@opinion_bp.route('/ya-opino/<int:id_pedido>', methods=['GET'])
@jwt_required()
def ya_opino(id_pedido):
    id_usuario = int(get_jwt_identity())

    servicio_ya_opinado = OpinionServicio.query.filter_by(
        id_usuario=id_usuario, id_pedido=id_pedido
    ).first() is not None

    productos_opinados = OpinionProducto.query.filter_by(
        id_usuario=id_usuario, id_pedido=id_pedido
    ).with_entities(OpinionProducto.id_producto).all()

    productos_ids = [p.id_producto for p in productos_opinados]

    return jsonify({
        "servicio": servicio_ya_opinado,
        "productos": productos_ids
    })