from flask import Blueprint, jsonify
from app.models.entidad import Entidad
from app.models.usuario_entidad import UsuarioEntidad
from app.extensions import db

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

@entidades_bp.route('/api/entidades/usuario/<int:id_usuario>', methods=['GET'])
def obtener_entidades_usuario(id_usuario):
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