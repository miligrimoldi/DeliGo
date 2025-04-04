from flask import Blueprint, request, jsonify
from flask_cors import CORS
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash
from app.models.entidad import Entidad
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.usuario_entidad import UsuarioEntidad


main = Blueprint('main', __name__)
CORS(main)

# Registrar un nuevo usuario
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
            password=hashed_password,
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
            password=hashed_password
        )
        db.session.add(nuevo_usuario_consumidor)

    db.session.commit()
    return jsonify({"message": "Registro exitoso"}), 201



















# Obtener todos los usuarios (GET)
@main.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = User.query.all()
    return jsonify([{
        'id': usuario.id_usuario,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'email': usuario.email
    } for usuario in usuarios])

# Crear usuario (POST)
@main.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    nuevo_usuario = User(
        nombre=data['nombre'],
        apellido=data['apellido'],
        email=data['email'],
        contrasena=data['contrasena']
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario creado'}), 201

# Obtener un usuario por ID (GET)
@main.route('/usuarios/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    usuario = User.query.get_or_404(id_usuario)
    return jsonify({
        'id': usuario.id_usuario,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'email': usuario.email
    })

# Actualizar usuario (PUT)
@main.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    usuario = User.query.get_or_404(id_usuario)
    data = request.get_json()
    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.email = data.get('email', usuario.email)
    usuario.contrasena = data.get('contrasena', usuario.contrasena)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario actualizado'})

# Eliminar usuario (DELETE)
@main.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    usuario = User.query.get_or_404(id_usuario)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario eliminado'})
