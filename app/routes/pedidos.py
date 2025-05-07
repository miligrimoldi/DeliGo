from flask import Blueprint, jsonify, request
from app.models.pedido import Pedido
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

pedidos_bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')

@pedidos_bp.route('/mis', methods=['GET'])
@jwt_required()
def obtener_mis_pedidos():
    id_usuario = int(get_jwt_identity())
    pedidos = Pedido.query.filter_by(id_usuario_consumidor=id_usuario).order_by(Pedido.fecha.desc()).all()

    resultado = []
    for pedido in pedidos:
        detalles = [{
            "producto": d.producto.nombre,
            "foto": d.producto.foto,
            "cantidad": d.cantidad,
            "precio_unitario": float(d.precio_unitario),
            "subtotal": float(d.subtotal)
        } for d in pedido.detalles]

        resultado.append({
            "id": pedido.id_pedido,
            "fecha": pedido.fecha.isoformat(),
            "estado": pedido.estado,
            "total": float(pedido.total),
            "servicio": pedido.servicio.nombre,
            "entidad": pedido.entidad.nombre,
            "detalles": detalles,
            **({"tiempo_estimado_minutos": pedido.tiempo_estimado_minutos}
               if pedido.estado == "en_preparacion" else {})
        })

    return jsonify(resultado)

@pedidos_bp.route('', methods=['POST'])
@jwt_required()
def crear_pedido():
    id_usuario = int(get_jwt_identity())
    data = request.get_json()
    items = data.get("items", [])

    if not items:
        return jsonify({"error": "No hay productos en el pedido"}), 400

    from app.models.producto_servicio import ProductoServicio
    from app.models.detalle_pedido import DetallePedido
    from app.models.usuario_consumidor import UsuarioConsumidor

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    primer_producto = ProductoServicio.query.get(items[0]['id_producto'])
    if not primer_producto:
        return jsonify({"error": "Producto no válido"}), 404

    id_servicio = primer_producto.id_servicio
    id_entidad = primer_producto.servicio.id_entidad
    total = sum(item['precio_actual'] * item['cantidad'] for item in items)

    nuevo_pedido = Pedido(
        id_usuario_consumidor=id_usuario,
        id_entidad=id_entidad,
        id_servicio=id_servicio,
        total=total
    )
    db.session.add(nuevo_pedido)
    db.session.flush()

    for item in items:
        detalle = DetallePedido(
            id_pedido=nuevo_pedido.id_pedido,
            id_producto=item["id_producto"],
            cantidad=item["cantidad"],
            precio_unitario=item["precio_actual"],
            subtotal=item["precio_actual"] * item["cantidad"]
        )
        db.session.add(detalle)

    db.session.commit()
    return jsonify({"mensaje": "Pedido creado correctamente"}), 201

@pedidos_bp.route('/<int:id_pedido>', methods=['GET'])
@jwt_required()
def obtener_pedido_por_id(id_pedido):
    id_usuario = int(get_jwt_identity())
    pedido = Pedido.query.get_or_404(id_pedido)

    if pedido.id_usuario_consumidor != id_usuario:
        return jsonify({"error": "No tenés permiso para ver este pedido"}), 403

    detalles = []
    for d in pedido.detalles:
        producto = d.producto
        detalles.append({
            "id_producto": producto.id_producto,
            "producto": {
                "id_producto": producto.id_producto,
                "nombre": producto.nombre,
                "foto": producto.foto
            },
            "cantidad": d.cantidad,
            "precio_unitario": float(d.precio_unitario),
            "subtotal": float(d.subtotal)
        })

    servicio = pedido.servicio

    return jsonify({
        "id": pedido.id_pedido,
        "fecha": pedido.fecha.isoformat(),
        "estado": pedido.estado,
        "total": float(pedido.total),
        "servicio": {
            "id_servicio": servicio.id_servicio,
            "nombre": servicio.nombre
        },
        "entidad": pedido.entidad.nombre,
        "detalles": detalles,
        **({"tiempo_estimado_minutos": pedido.tiempo_estimado_minutos}
           if pedido.estado == "en_preparacion" else {})
    })

