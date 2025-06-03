from flask import jsonify
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.stock import Stock
from app.models.chat_message import ChatMessage
from app.models.producto_servicio import ProductoServicio
from app.models.detalle_pedido import DetallePedido
from app.extensions import db
from sqlalchemy import func


def responder_admin_intents(user_id: int, user_input: str):
    input_lower = user_input.lower()

    empleado = UsuarioEmpleado.query.get(user_id)
    if not (empleado and empleado.esAdmin):
        return None

    reply = None

    # Cuánto stock
    if "cuánto" in input_lower and "stock" in input_lower:
        if empleado.id_servicio is None:
            reply = "No tenés un servicio asignado."
        else:
            registros = Stock.query.filter_by(id_servicio=empleado.id_servicio).all()
            if registros:
                detalles = [f"{r.ingrediente.nombre}: {r.cantidad} unidades" for r in registros]
                reply = "Stock actual:\n" + "\n".join(detalles)
            else:
                reply = "No hay registros de stock para tu servicio."

    # Producto más vendido
    elif "más vendido" in input_lower or "mas vendido" in input_lower:
        result = (
            db.session.query(
                ProductoServicio.nombre,
                func.sum(DetallePedido.cantidad).label("total")
            )
            .join(DetallePedido, ProductoServicio.id_producto == DetallePedido.id_producto)
            .filter(ProductoServicio.id_servicio == empleado.id_servicio)
            .group_by(ProductoServicio.id_producto)
            .order_by(func.sum(DetallePedido.cantidad).desc())
            .first()
        )
        if result:
            reply = f"El producto más vendido es '{result[0]}' con {result[1]} unidades vendidas."
        else:
            reply = "No hay datos de ventas para tu servicio."

    # Producto con menor stock
    elif "por acabarse" in input_lower or "menos stock" in input_lower:
        menor = (
            db.session.query(Stock)
            .filter(Stock.id_servicio == empleado.id_servicio)
            .order_by(Stock.cantidad.asc())
            .first()
        )
        if menor:
            reply = f"El producto con menos stock es '{menor.ingrediente.nombre}' con {menor.cantidad} unidades."
        else:
            reply = "No hay datos de stock para tu servicio."

    if reply:
        db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
        db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
        db.session.commit()
        return jsonify({"reply": reply})

    return None
