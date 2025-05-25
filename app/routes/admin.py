# Rutas empleados del servicio
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.security import generate_password_hash

from app import db
from app.models import User
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.producto_servicio import ProductoServicio

empleados_bp = Blueprint('empleados', __name__)
@empleados_bp.route('/servicios/<int:id_servicio>/empleados', methods=['POST'])
@jwt_required()
def alta_empleados(id_servicio):
    data = request.get_json()

    contrasena = data.get('contrasena')
    email = data.get('email')
    hashed_password = generate_password_hash(contrasena)
    dni = data.get('dni')

    usuario_existente = User.query.filter_by(email=email).first()
    if usuario_existente:
        return jsonify({"error": "Ya existe un usuario con ese email"}), 409

    if len(dni) != 8:
        return jsonify({"error": "Numero incorrecto de digitos para el dni"}), 400

    nuevo_empleado = UsuarioEmpleado(
        id_servicio=id_servicio,
        nombre=data['nombre'],
        apellido=data['apellido'],
        email=data['email'],
        contrasena=hashed_password,
        dni=data['dni'],
        esAdmin=False,
    )

    db.session.add(nuevo_empleado)
    db.session.commit()
    return jsonify({'mensaje': 'Empleado creado exitosamente'}), 201

@empleados_bp.route('/servicios/<int:id_servicio>/empleados/<int:id_empleado>', methods=['DELETE'])
@jwt_required()
def baja_empleado(id_servicio, id_empleado):
    empleado = UsuarioEmpleado.query.get_or_404(id_empleado)

    if empleado.id_servicio != id_servicio:
        return jsonify({'error': 'Empleado no pertenece a este servicio'}), 403

    db.session.delete(empleado)
    db.session.commit()
    return jsonify({'mensaje': 'Empleado eliminado correctamente'}), 200

@empleados_bp.route('/servicios/<int:id_servicio>/empleados/<int:id_empleado>', methods=['PUT'])
@jwt_required()
def modificar_empleado(id_servicio, id_empleado):
    empleado = UsuarioEmpleado.query.get_or_404(id_empleado)
    data = request.get_json()

    if empleado.id_servicio != id_servicio:
        return jsonify({'error': 'Empleado no pertenece a este servicio'}), 403

    empleado.nombre = data.get('nombre', empleado.nombre)
    empleado.apellido = data.get('apellido', empleado.apellido)
    empleado.email = data.get('email', empleado.email)
    empleado.dni = data.get('dni', empleado.dni)
    empleado.esAdmin = data.get('esAdmin', empleado.esAdmin)

    db.session.commit()
    return jsonify({'mensaje': 'Empleado modificado correctamente'}), 200

@empleados_bp.route('/servicios/<int:id_servicio>/empleados', methods=['GET'])
@jwt_required()
def listar_empleados(id_servicio):
    empleados = UsuarioEmpleado.query.filter_by(id_servicio=id_servicio).all()
    return jsonify([
        {
            'id': e.id,
            'nombre': e.nombre,
            'apellido': e.apellido,
            'email': e.email,
            'dni': e.dni,
            'esAdmin': e.esAdmin
        } for e in empleados
    ])

@empleados_bp.route("/producto/<int:id_producto>/desperdicio", methods=["POST"])
@jwt_required()
def marcar_como_desperdicio(id_producto):
    data = request.json
    producto = ProductoServicio.query.get_or_404(id_producto)
    producto.es_desperdicio_cero = True
    producto.precio_oferta = data["precio_oferta"]
    producto.cantidad_restante = data.get("cantidad_restante", 1)
    producto.tiempo_limite = data.get("tiempo_limite")  # string tipo "21:00"
    db.session.commit()
    return jsonify({"message": "Producto marcado como Desperdicio Cero"})

@empleados_bp.route("/admin/producto/<int:id_producto>/desperdicio", methods=["DELETE"])
@jwt_required()
def quitar_desperdicio_cero(id_producto):
    producto = ProductoServicio.query.get_or_404(id_producto)
    producto.es_desperdicio_cero = False
    producto.precio_oferta = None
    producto.cantidad_restante = None
    producto.tiempo_limite = None
    db.session.commit()
    return jsonify({"message": "Producto desmarcado de Desperdicio Cero"})
