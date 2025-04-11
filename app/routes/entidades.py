from flask import Blueprint, jsonify
from app.models.entidad import Entidad
from app.models.usuario_entidad import UsuarioEntidad
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

entidades_bp = Blueprint('entidades', __name__)

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

@entidades_bp.route('/api/entidades/usuario', methods=['GET'])
@jwt_required()
def obtener_entidades_usuario():
    current_user_id = int(get_jwt_identity())
    asociaciones = UsuarioEntidad.query.filter_by(id_usuario=current_user_id).all()

    entidades = [Entidad.query.get(a.id_entidad) for a in asociaciones]
    return jsonify([{
        'id_entidad': e.id_entidad,
        'nombre': e.nombre,
        'ubicacion': e.ubicacion,
        'logo_url': e.logo_url,
        'descripcion': e.descripcion,
    } for e in entidades])