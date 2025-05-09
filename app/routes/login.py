from flask import Blueprint, request, jsonify
from app.extensions import db
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

    # Intentar encontrar un UsuarioEmpleado
    empleado = UsuarioEmpleado.query.filter_by(email=email).first()
    if empleado and check_password_hash(empleado.contrasena, password):
        access_token = create_access_token(identity=str(empleado.id))
        return jsonify({
            "access_token": access_token,
            "id_usuario": empleado.id,
            "email": empleado.email,
            "nombre": empleado.nombre,
            "apellido": empleado.apellido,
            "esAdmin": empleado.esAdmin,
            "id_servicio": empleado.id_servicio,
            "tipo": "empleado"
        }), 200

    # Intentar encontrar un UsuarioConsumidor.
    consumidor = UsuarioConsumidor.query.filter_by(email=email).first()
    if consumidor and check_password_hash(consumidor.contrasena, password):
        access_token = create_access_token(identity=str(consumidor.id))
        return jsonify({
            "access_token": access_token,
            "id_usuario": consumidor.id,
            "email": consumidor.email,
            "nombre": consumidor.nombre,
            "apellido": consumidor.apellido,
            "esAdmin": False,
            "tipo": "consumidor"
        }), 200

    return jsonify({"error": "Email o contraseña incorrectos"}), 401
