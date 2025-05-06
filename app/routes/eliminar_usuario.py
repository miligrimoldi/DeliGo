from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.favoritos_productos import FavoritoProducto
from app.models.favoritos_servicios import FavoritoServicio
from app.models.usuario import User
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.opinion_producto import OpinionProducto
from app.models.opinion_servicio import OpinionServicio

eliminar_usuario_bp = Blueprint('eliminar_usuario', __name__, url_prefix='/api')

@eliminar_usuario_bp.route('/usuario', methods=['DELETE'])
@jwt_required()
def eliminar_usuario():
    id_usuario = int(get_jwt_identity())

    # Eliminar favoritos
    FavoritoProducto.query.filter_by(id_usuario_consumidor=id_usuario).delete()
    FavoritoServicio.query.filter_by(id_usuario_consumidor=id_usuario).delete()

    # Eliminar opiniones
    OpinionProducto.query.filter_by(id_usuario=id_usuario).delete()
    OpinionServicio.query.filter_by(id_usuario=id_usuario).delete()


    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if consumidor:
        db.session.delete(consumidor)
    else:
        empleado = UsuarioEmpleado.query.get(id_usuario)
        if empleado:
            db.session.delete(empleado)


    usuario = User.query.get(id_usuario)
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({"msg": "Usuario eliminado"}), 200

    return jsonify({"error": "Usuario no encontrado"}), 404
