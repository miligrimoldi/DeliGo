from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.usuario_entidad import UsuarioEntidad

desasociar_bp = Blueprint('desasociar_entidad', __name__)

@desasociar_bp.route('/api/desasociar', methods=['POST'])
def desasociar_usuario_de_entidad():
    data = request.get_json()
    id_usuario = data.get('id_usuario')
    id_entidad = data.get('id_entidad')

    if not id_usuario or not id_entidad:
        return jsonify({'error': 'Faltan datos'}), 400

    asociacion = UsuarioEntidad.query.filter_by(id_usuario=id_usuario, id_entidad=id_entidad).first()
    if not asociacion:
        return jsonify({'error': 'Asociación no encontrada'}), 404

    db.session.delete(asociacion)
    db.session.commit()

    return jsonify({'message': 'Usuario desasociado exitosamente'}), 200

