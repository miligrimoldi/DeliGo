from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.favoritos_servicios import FavoritoServicio
from app.models.favoritos_productos import FavoritoProducto
from app.models.usuario_consumidor import UsuarioConsumidor

favoritos_bp = Blueprint('favoritos', __name__, url_prefix='/api/favoritos')

# SERVICIOS FAVORITOS

@favoritos_bp.route('/servicios', methods=['GET'])
@jwt_required()
def obtener_servicios_favoritos():
    id_usuario = int(get_jwt_identity())

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    favoritos = FavoritoServicio.query.filter_by(id_usuario_consumidor=id_usuario).all()
    return jsonify([f.id_servicio for f in favoritos]), 200


@favoritos_bp.route('/servicios', methods=['POST'])
@jwt_required()
def agregar_favorito_servicio():
    id_usuario = int(get_jwt_identity())
    id_servicio = request.json.get("id_servicio")

    if not id_servicio:
        return jsonify({"error": "Falta id_servicio"}), 400

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    ya_existe = FavoritoServicio.query.filter_by(id_usuario_consumidor=id_usuario, id_servicio=id_servicio).first()
    if ya_existe:
        return jsonify({"msg": "Ya estaba en favoritos"}), 400

    nuevo = FavoritoServicio(id_usuario_consumidor=id_usuario, id_servicio=id_servicio)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Agregado a favoritos"}), 201


@favoritos_bp.route('/servicios', methods=['DELETE'])
@jwt_required()
def eliminar_favorito_servicio():
    id_usuario = int(get_jwt_identity())
    id_servicio = request.json.get("id_servicio")

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    favorito = FavoritoServicio.query.filter_by(id_usuario_consumidor=id_usuario, id_servicio=id_servicio).first()
    if not favorito:
        return jsonify({"error": "No se encontraba en favoritos"}), 404

    db.session.delete(favorito)
    db.session.commit()
    return jsonify({"msg": "Eliminado de favoritos"}), 200

# PRODUCTOS FAVORITOS

@favoritos_bp.route('/productos', methods=['GET'])
@jwt_required()
def obtener_productos_favoritos():
    id_usuario = int(get_jwt_identity())

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    favoritos = FavoritoProducto.query.filter_by(id_usuario_consumidor=id_usuario).all()
    return jsonify([f.id_producto for f in favoritos]), 200


@favoritos_bp.route('/productos', methods=['POST'])
@jwt_required()
def agregar_favorito_producto():
    id_usuario = int(get_jwt_identity())
    id_producto = request.json.get("id_producto")

    if not id_producto:
        return jsonify({"error": "Falta id_producto"}), 400

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    ya_existe = FavoritoProducto.query.filter_by(id_usuario_consumidor=id_usuario, id_producto=id_producto).first()
    if ya_existe:
        return jsonify({"msg": "Ya estaba en favoritos"}), 400

    nuevo = FavoritoProducto(id_usuario_consumidor=id_usuario, id_producto=id_producto)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"msg": "Agregado a favoritos"}), 201


@favoritos_bp.route('/productos', methods=['DELETE'])
@jwt_required()
def eliminar_favorito_producto():
    id_usuario = int(get_jwt_identity())
    id_producto = request.json.get("id_producto")

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    favorito = FavoritoProducto.query.filter_by(id_usuario_consumidor=id_usuario, id_producto=id_producto).first()
    if not favorito:
        return jsonify({"error": "No se encontraba en favoritos"}), 404

    db.session.delete(favorito)
    db.session.commit()
    return jsonify({"msg": "Eliminado de favoritos"}), 200
