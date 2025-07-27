from flask import Blueprint, request, jsonify
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.reset_token import ResetToken
from app.extensions import db
from app.utils.email_utils import send_reset_email
from datetime import datetime, timedelta
import secrets

recuperacion_bp = Blueprint("recuperacion", __name__)

@recuperacion_bp.route('/recuperar', methods=['POST'])
def solicitar_recuperacion():
    email = request.json.get("email")
    if not email:
        return jsonify({"msg": "Falta el email"}), 400

    usuario = UsuarioConsumidor.query.filter_by(email=email).first() \
        or UsuarioEmpleado.query.filter_by(email=email).first()

    if usuario:
        token = secrets.token_urlsafe(32)
        expiracion = datetime.utcnow() + timedelta(hours=1)
        nuevo = ResetToken(email=email, token=token, expiration=expiracion)
        db.session.add(nuevo)
        db.session.commit()
        send_reset_email(email, token)

    return jsonify({"msg": "Si el email existe, se enviará un link para restablecer la contraseña."}), 200

@recuperacion_bp.route('/reset-password', methods=['POST'])
def cambiar_con_token():
    data = request.json
    token = data.get("token")
    nueva = data.get("nueva")

    if not token or not nueva:
        return jsonify({"msg": "Faltan datos"}), 400

    reset = ResetToken.query.filter_by(token=token).first()
    if not reset or not reset.is_valid():
        return jsonify({"msg": "Token inválido o vencido"}), 400

    user = UsuarioConsumidor.query.filter_by(email=reset.email).first() \
        or UsuarioEmpleado.query.filter_by(email=reset.email).first()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    from werkzeug.security import generate_password_hash
    user.contrasena = generate_password_hash(nueva, method='pbkdf2:sha256')

    db.session.delete(reset)
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente"}), 200
