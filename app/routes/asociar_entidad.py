from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.usuario import User
from app.models.entidad import Entidad
from app.models.usuario_entidad import UsuarioEntidad
from flask_jwt_extended import jwt_required, get_jwt_identity

asociar_bp = Blueprint('asociar_entidad', __name__)

@asociar_bp.route('/api/asociar', methods=['POST'])
@jwt_required()
def asociar_usuario_a_entidad():
    data = request.get_json()
    id_usuario = get_jwt_identity()
    id_entidad = data.get('id_entidad')

    # Validaciones básicas
    if not id_usuario or not id_entidad:
        return jsonify({'error': 'Faltan datos'}), 400

    usuario = User.query.get(id_usuario)
    entidad = Entidad.query.get(id_entidad)

    if not usuario or not entidad:
        return jsonify({'error': 'Usuario o entidad no encontrada'}), 404

    # Verificar si ya están asociados
    ya_asociado = UsuarioEntidad.query.filter_by(id_usuario=id_usuario, id_entidad=id_entidad).first()
    if ya_asociado:
        return jsonify({'message': 'Ya está asociado'}), 200

    # Crear nueva asociación
    nueva = UsuarioEntidad(id_usuario=id_usuario, id_entidad=id_entidad)
    db.session.add(nueva)
    db.session.commit()

    return jsonify({'message': 'Usuario asociado a entidad exitosamente'}), 201
