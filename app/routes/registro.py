from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.usuario import User
from werkzeug.security import generate_password_hash
from app.models.entidad import Entidad
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.usuario_entidad import UsuarioEntidad


main = Blueprint('main', __name__)

@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    password = data.get('password')
    es_admin = data.get('esAdmin', False)
    id_servicio = data.get('id_servicio')
    dni = data.get('dni')

    # Validacion basica (que esten los datos)
    if not all([nombre, apellido, email, password]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if es_admin and not all([id_servicio, dni]):
        return jsonify({"error": "Faltan datos de administrador"}), 400

    # Verificamos que el usuario no exista
    usuario_existente = User.query.filter_by(email=email).first()
    if usuario_existente:
        return jsonify({"error": "Ya existe un usuario con ese email"}), 409

    # Hasheo de contrasena
    hashed_password = generate_password_hash(password)

    if es_admin:
        nuevo_admin = UsuarioEmpleado(
            nombre=nombre,
            apellido=apellido,
            email=email,
            contrasena=hashed_password,
            id_servicio=id_servicio,
            dni=dni,
            esAdmin=True
        )
        db.session.add(nuevo_admin)
    else:
        nuevo_usuario_consumidor = UsuarioConsumidor(
            nombre=nombre,
            apellido=apellido,
            email=email,
            contrasena=hashed_password
        )
        db.session.add(nuevo_usuario_consumidor)

    db.session.commit()
    return jsonify({"message": "Registro exitoso"}), 201
