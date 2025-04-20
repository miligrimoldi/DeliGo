from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.categoria import Categoria
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio
from app.extensions import db
from app.models.producto_servicio import ProductoServicio


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
            "informacion_nutricional": p.informacion_nutricional,
            "foto": p.foto
        } for p in productos])

@productos_servicio_bp.route('/admin/servicio/<int:id_servicio>/categoria/<int:id_categoria>/producto', methods=['POST'])
@jwt_required()
def nuevo_producto(id_servicio, id_categoria):
    data = request.get_json()

    nuevo_producto = ProductoServicio(
        id_servicio=id_servicio,
        id_categoria=id_categoria,
        nombre=data.get("nombre"),
        descripcion=data.get("descripcion"),
        informacion_nutricional=data.get("informacion_nutricional"),
        precio_actual=data.get("precio_actual"),
        foto=data.get("foto")
    )

    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({"mensaje": "Producto creado con éxito"}), 201