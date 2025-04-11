from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.usuario_entidad import UsuarioEntidad
from flask_jwt_extended import jwt_required, get_jwt_identity

desasociar_bp = Blueprint('desasociar_entidad', __name__)

@desasociar_bp.route('/api/desasociar', methods=['POST'])
@jwt_required()
def desasociar_usuario_de_entidad():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    id_entidad = data.get('id_entidad')

    if not id_entidad:
        return jsonify({'error': 'Faltan datos'}), 400

    asociacion = UsuarioEntidad.query.filter_by(id_usuario=current_user_id, id_entidad=id_entidad).first()
    if not asociacion:
        return jsonify({'error': 'Asociación no encontrada'}), 404

    db.session.delete(asociacion)
    db.session.commit()

    return jsonify({'message': 'Usuario desasociado exitosamente'}), 200