from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.usuario import User
from werkzeug.security import check_password_hash, generate_password_hash

cambiar_contrasena_bp = Blueprint('cambiar_contrasena', __name__, url_prefix='/api')

@cambiar_contrasena_bp.route('/usuario/contrasena', methods=['PUT'])
@jwt_required()
def cambiar_contrasena():
    id_usuario = int(get_jwt_identity())
    data = request.get_json()

    actual = data.get("actual")
    nueva = data.get("nueva")
    confirmar = data.get("confirmar")

    if not all([actual, nueva, confirmar]):
        return jsonify({"error": "Faltan campos"}), 400

    if nueva != confirmar:
        return jsonify({"error": "Las nuevas contraseñas no coinciden"}), 400

    usuario = User.query.get(id_usuario)
    if not usuario or not check_password_hash(usuario.contrasena, actual):
        return jsonify({"error": "La contraseña actual no es válida"}), 400

    if check_password_hash(usuario.contrasena, nueva):
        return jsonify({"error": "La nueva contraseña debe ser distinta a la anterior"}), 400

    usuario.contrasena = generate_password_hash(nueva)
    db.session.commit()
    return jsonify({"msg": "Contraseña actualizada con éxito"}), 200
