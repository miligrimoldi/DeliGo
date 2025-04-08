from flask import Blueprint, jsonify
from app.models.entidad import Entidad
from app.models.usuario_entidad import UsuarioEntidad
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

entidades_bp = Blueprint('entidades', __name__)

# Obtener todas las entidades
@entidades_bp.route('/api/entidades', methods=['GET'])
def obtener_entidades():
    entidades = Entidad.query.all()
    return jsonify([{
        'id_entidad': e.id_entidad,
        'nombre': e.nombre,
        'ubicacion': e.ubicacion,
        'logo_url': e.logo_url,
        'descripcion': e.descripcion
    } for e in entidades])

# Obtener entidades asociadas a un usuario
@entidades_bp.route('/api/entidades/usuario', methods=['GET'])
@jwt_required()
def obtener_entidades_usuario():
    id_usuario = get_jwt_identity()
    entidades = db.session.query(Entidad).join(UsuarioEntidad).filter(
        UsuarioEntidad.id_usuario == id_usuario
    ).all()
    return jsonify([{
        'id_entidad': e.id_entidad,
        'nombre': e.nombre,
        'ubicacion': e.ubicacion,
        'logo_url': e.logo_url,
        'descripcion': e.descripcion
    } for e in entidades])
