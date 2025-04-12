from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.usuario_entidad import UsuarioEntidad
from app.models.servicio import Servicio
from app.models.entidad import Entidad
from app.extensions import db

servicios_bp = Blueprint('servicios', __name__)

@servicios_bp.route('/api/entidades/<int:id_entidad>/servicios', methods=['GET'])
@jwt_required()
def obtener_servicios_entidad(id_entidad):
    current_user_id = int(get_jwt_identity())

    # Verificar si el usuario está asociado
    asociacion = UsuarioEntidad.query.filter_by(id_usuario = current_user_id, id_entidad=id_entidad).first()

    if not asociacion:
        return jsonify({'error': 'Debes asociarte a la entidad para ver sus servicios.'}), 403

    servicios = Servicio.query.filter_by(id_entidad=id_entidad).all()
    return jsonify([{'id_servicio': s.id_servicio, 'nombre': s.nombre, 'descripcion': s.descripcion} for s in servicios])
