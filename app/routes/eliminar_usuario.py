from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.usuario import User
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado

eliminar_usuario_bp = Blueprint('eliminar_usuario', __name__, url_prefix='/api')

@eliminar_usuario_bp.route('/usuario', methods=['DELETE'])
@jwt_required()
def eliminar_usuario():
    id_usuario = int(get_jwt_identity())

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