from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.usuario import User
from werkzeug.security import check_password_hash
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from flask_jwt_extended import create_access_token

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Faltan datos"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.contrasena, password):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=user.id_usuario)

    empleado = UsuarioEmpleado.query.filter_by(id_usuario=user.id_usuario).first()
    if empleado:
        return jsonify({
            "access_token": access_token,
            "id_usuario": user.id_usuario,
            "email": user.email,
            "nombre": user.nombre,
            "esAdmin": True,
            "id_servicio": empleado.id_servicio
        }), 200

    consumidor = UsuarioConsumidor.query.filter_by(id_usuario=user.id_usuario).first()
    if consumidor:
        return jsonify({
            "access_token": access_token,
            "id_usuario": user.id_usuario,
            "email": user.email,
            "nombre": user.nombre,
            "esAdmin": False
        }), 200
    return jsonify({"error": "Tipo de usuario no reconocido"}), 403
