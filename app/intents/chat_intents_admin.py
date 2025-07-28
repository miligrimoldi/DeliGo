from flask import jsonify
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.stock import Stock
from app.models.chat_message import ChatMessage
from app.models.producto_servicio import ProductoServicio
from app.models.detalle_pedido import DetallePedido
from app.extensions import db
from app.models.ingrediente import Ingrediente
from sqlalchemy import func


def responder_admin_intents(user_id: int, user_input: str):
    input_lower = user_input.lower()

    empleado = UsuarioEmpleado.query.get(user_id)
    if not (empleado):
        return None

    reply = None

    # Cuánto stock
    if ("cuanto" in input_lower or "cuánto" in input_lower) and "stock" in input_lower:
        if empleado.id_servicio is None:
            reply = "No tenés un servicio asignado."
        else:
            resultados = (
                db.session.query(Ingrediente.nombre, Stock.cantidad)
                .join(Ingrediente, Ingrediente.id_ingrediente == Stock.id_ingrediente)
                .filter(Stock.id_servicio == empleado.id_servicio)
                .all()
            )

            if not resultados:
                reply = "No hay registros de stock para tu servicio."
            else:
                mencionados = [
                    (nombre, cantidad)
                    for nombre, cantidad in resultados
                    if nombre.lower() in input_lower
                ]

                if mencionados:
                    detalles = [f"{nombre}: {cantidad} unidades" for nombre, cantidad in mencionados]
                else:
                    detalles = [f"{nombre}: {cantidad} unidades" for nombre, cantidad in resultados]

                reply = "Stock actual:\n" + "\n".join(detalles)

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

    # Ingrediente con menor stock
    elif "por acabarse" in input_lower or "menos stock" in input_lower:
        result = (
            db.session.query(Stock.cantidad, func.lower(Ingrediente.nombre))
            .join(Ingrediente, Ingrediente.id_ingrediente == Stock.id_ingrediente)
            .filter(Stock.id_servicio == empleado.id_servicio)
            .order_by(Stock.cantidad.asc())
            .first()
        )
        if result:
            cantidad, nombre_ingrediente = result
            reply = f"El ingrediente con menos stock es '{nombre_ingrediente}' con {cantidad} unidades."
        else:
            reply = "No hay datos de stock para tu servicio."

    if reply:
        db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
        db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
        db.session.commit()
        return jsonify({"reply": reply})

    return None
