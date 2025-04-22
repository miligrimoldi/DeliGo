from flask import Blueprint, jsonify, request
from app.models.pedido import Pedido
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

pedidos_bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')

@pedidos_bp.route('/mis', methods=['GET'])
@jwt_required()
def obtener_mis_pedidos():
    id_usuario = get_jwt_identity()
    pedidos = Pedido.query.filter_by(id_usuario_consumidor=id_usuario).order_by(Pedido.fecha.desc()).all()

    resultado = []
    for pedido in pedidos:
        detalles = [{
            "producto": d.producto.nombre,
            "foto": d.producto.foto,
            "cantidad": d.cantidad,
            "precio_unitario": float(d.precio_unitario),
            "subtotal": float(d.subtotal)
        } for d in pedido.detalles]

        resultado.append({
            "id": pedido.id_pedido,
            "fecha": pedido.fecha.isoformat(),
            "estado": pedido.estado,
            "total": float(pedido.total),
            "servicio": pedido.servicio.nombre,
            "entidad": pedido.entidad.nombre,
            "detalles": detalles
        })

    return jsonify(resultado)
