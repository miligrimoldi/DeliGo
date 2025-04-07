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
