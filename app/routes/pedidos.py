from flask import Blueprint, jsonify, request
from app.models.pedido import Pedido
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.ingrediente_producto import IngredienteProducto
from app.models.stock import Stock
from sqlalchemy.exc import IntegrityError
from app.models.producto_servicio import ProductoServicio
from app.models.detalle_pedido import DetallePedido
from app.models.usuario_consumidor import UsuarioConsumidor


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

    consumidor = UsuarioConsumidor.query.get(id_usuario)
    if not consumidor:
        return jsonify({"error": "Usuario no válido"}), 403

    primer_producto = ProductoServicio.query.get(items[0]['id_producto'])
    if not primer_producto:
        return jsonify({"error": "Producto no válido"}), 404

    id_servicio = primer_producto.id_servicio
    id_entidad = primer_producto.servicio.id_entidad

    total = 0
    nuevo_pedido = Pedido(
        id_usuario_consumidor=id_usuario,
        id_entidad=id_entidad,
        id_servicio=id_servicio,
        total=0  # se actualizará más abajo
    )
    db.session.add(nuevo_pedido)
    db.session.flush()

    ingredientes_a_descontar = {}

    for item in items:
        id_producto = item["id_producto"]
        cantidad_producto = item["cantidad"]

        producto = ProductoServicio.query.get(id_producto)
        if not producto:
            return jsonify({"error": f"Producto con id {id_producto} no encontrado"}), 404

        # Determinar el precio a usar
        if producto.es_desperdicio_cero and producto.precio_oferta is not None:
            precio_unitario = producto.precio_oferta
            # Verificar cantidad restante en oferta
            if producto.cantidad_restante is None or producto.cantidad_restante < cantidad_producto:
                return jsonify({"error": f"No hay suficiente cantidad disponible en oferta para '{producto.nombre}'"}), 400
            producto.cantidad_restante -= cantidad_producto
        else:
            precio_unitario = producto.precio_actual

        if producto.es_desperdicio_cero and producto.cantidad_restante is not None:
            producto.cantidad_restante -= item["cantidad"]
            if producto.cantidad_restante <= 0:
                producto.cantidad_restante = 0
                producto.es_desperdicio_cero = False
                producto.precio_oferta = None
                producto.tiempo_limite = None

        subtotal = precio_unitario * cantidad_producto
        total += subtotal

        detalle = DetallePedido(
            id_pedido=nuevo_pedido.id_pedido,
            id_producto=id_producto,
            cantidad=cantidad_producto,
            precio_unitario=precio_unitario,
            subtotal=subtotal
        )
        db.session.add(detalle)

        asociaciones = IngredienteProducto.query.filter_by(id_producto=id_producto).all()
        for asociacion in asociaciones:
            id_ingrediente = asociacion.id_ingrediente
            cantidad_necesaria = asociacion.cantidad_necesaria * cantidad_producto
            ingredientes_a_descontar[id_ingrediente] = ingredientes_a_descontar.get(id_ingrediente, 0) + cantidad_necesaria

    # Actualizar stock de ingredientes
    for id_ingrediente, cantidad_a_restar in ingredientes_a_descontar.items():
        stock_entry = Stock.query.filter_by(id_servicio=id_servicio, id_ingrediente=id_ingrediente).first()
        if not stock_entry:
            return jsonify({"error": f"No hay stock registrado para el ingrediente ID {id_ingrediente}"}), 400

        if stock_entry.cantidad < cantidad_a_restar:
            return jsonify({"error": f"Stock insuficiente para realizar el pedido."}), 400

        stock_entry.cantidad -= cantidad_a_restar

    nuevo_pedido.total = total
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

