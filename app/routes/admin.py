from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.categoria import Categoria
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio

# Obtener info del servivio especifico (nombre + entidad)

info_servicio_bp = Blueprint('info_servicio', __name__)

@info_servicio_bp.route('/admin/servicio/<int:id_servicio>', methods=['GET'])
@jwt_required()
def info_servicio(id_servicio):
    servicio = Servicio.query.get_or_404(id_servicio)
    entidad = servicio.entidad
    return jsonify({
        "nombre_servicio": servicio.nombre,
        "nombre_entidad": entidad.nombre
    })

# Obtener categorias del servicio

categorias_servicio_bp = Blueprint('categorias_servicio', __name__)

@categorias_servicio_bp.route('/admin/servicio/<int:id_servicio>/categorias', methods=['GET'])
@jwt_required()
def categorias_servicio(id_servicio):
    servicio = Servicio.query.get_or_404(id_servicio)
    categorias = servicio.categorias
    return jsonify([
        {"id_categoria": c.id_categoria, "nombre": c.nombre}
        for c in categorias
    ])

# Obtener productos de un servicio

productos_servicio_bp = Blueprint('productos_servicio', __name__)
@productos_servicio_bp.route('/admin/servicio/<int:id_servicio>/categoria/<int:id_categoria>/productos', methods=['GET'])
@jwt_required()
def productos_servicio(id_servicio, id_categoria):
    productos = ProductoServicio.query.filter_by(id_servicio = id_servicio, id_categoria = id_categoria).all()
    return jsonify([{
            "id_producto": p.id_producto,
            "nombre": p.nombre,
            "precio_actual": p.precio_actual,
            "descripcion": p.descripcion,
            "info_nutricional": p.info_nutricional,
            "foto": p.foto
        } for p in productos])
