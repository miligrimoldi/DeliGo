from sqlalchemy import func
from flask import jsonify
from app.models.chat_message import ChatMessage
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio
from app.models.entidad import Entidad
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.extensions import db
from app.intents.chat_intents_admin import responder_admin_intents
import re

STOPWORDS = {"el", "la", "un", "una", "cuanto", "cuesta", "es", "en", "del", "de", "por", "a", "y", "los", "las", "con", "al", "que"}

def procesar_mensaje(user_id: int, user_input: str):
    input_lower = user_input.lower()

    # Ver si es empleado o admin
    admin_response = responder_admin_intents(user_id, user_input)
    if admin_response:
        return admin_response

    # Ver si es consumidor o empleado
    consumidor = UsuarioConsumidor.query.get(user_id)
    empleado = UsuarioEmpleado.query.get(user_id)
    id_servicio = empleado.id_servicio if empleado else None

    palabras = [p for p in re.findall(r'\w+', input_lower) if p not in STOPWORDS and len(p) > 2]

    # Precio de producto
    if "precio" in input_lower or "cuesta" in input_lower:
        query = ProductoServicio.query
        if id_servicio:
            query = query.filter(ProductoServicio.id_servicio == id_servicio)
        productos = query.all()

        coincidentes = []
        for producto in productos:
            nombre_lower = producto.nombre.lower()
            coincidencias = sum(1 for palabra in palabras if palabra in nombre_lower)
            if coincidencias > 0:
                coincidentes.append((coincidencias, producto))

        coincidentes.sort(reverse=True)

        if coincidentes:
            _, producto = coincidentes[0]
            nombre_servicio = producto.servicio.nombre
            if producto.es_desperdicio_cero and producto.precio_oferta:
                reply = (
                    f"'{producto.nombre}' en {nombre_servicio} cuesta ${producto.precio_actual:.2f}, "
                    f"pero tiene una oferta a ${producto.precio_oferta:.2f} por ser Desperdicio Cero."
                )
            else:
                reply = f"'{producto.nombre}' en {nombre_servicio} cuesta ${producto.precio_actual:.2f}."
        else:
            reply = "No encontré productos que coincidan con ese nombre."

        db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
        db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
        db.session.commit()
        return jsonify({"reply": reply})

    # Servicios por entidad (solo consumidor puede ver todos)
    if "servicios" in input_lower and consumidor:
        entidades = Entidad.query.all()
        for entidad in entidades:
            if entidad.nombre.lower() in input_lower:
                servicios = Servicio.query.filter_by(id_entidad=entidad.id_entidad).all()
                if servicios:
                    nombres = ", ".join([s.nombre for s in servicios])
                    reply = f"La entidad {entidad.nombre} ofrece los siguientes servicios: {nombres}."
                else:
                    reply = f"La entidad {entidad.nombre} no tiene servicios registrados."
                db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
                db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
                db.session.commit()
                return jsonify({"reply": reply})

    # Ubicación de entidad
    if any(pal in input_lower for pal in ["dónde", "ubicación", "ubicacion", "donde"]):
        entidades = Entidad.query.all()
        for entidad in entidades:
            if entidad.nombre.lower() in input_lower:
                reply = f"La entidad {entidad.nombre} está ubicada en {entidad.ubicacion}."
                db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
                db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
                db.session.commit()
                return jsonify({"reply": reply})

    # Productos por servicio
    if any(pal in input_lower for pal in ["productos", "ofrece"]):
        servicios = [Servicio.query.get(id_servicio)] if id_servicio else Servicio.query.all()
        for servicio in servicios:
            if not servicio or servicio.nombre.lower() not in input_lower:
                continue

            productos = servicio.productos
            categorias_mencionadas = [c for c in servicio.categorias if c.nombre.lower() in input_lower]
            if categorias_mencionadas:
                productos = [p for p in productos if p.categoria in categorias_mencionadas]

            if productos:
                nombres = ", ".join([p.nombre for p in productos])
                cat_str = f" de la categoría {categorias_mencionadas[0].nombre}" if categorias_mencionadas else ""
                reply = f"El servicio {servicio.nombre} ofrece los siguientes productos{cat_str}: {nombres}."
            else:
                reply = f"No encontré productos en {servicio.nombre} con esa categoría." if categorias_mencionadas else f"{servicio.nombre} no tiene productos cargados."

            db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
            db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
            db.session.commit()
            return jsonify({"reply": reply})

    # Ingredientes de producto
    if any(pal in input_lower for pal in ["ingrediente", "lleva", "tiene"]):
        query = ProductoServicio.query
        if id_servicio:
            query = query.filter(ProductoServicio.id_servicio == id_servicio)
        productos = query.all()

        for producto in productos:
            if producto.nombre.lower() in input_lower:
                ingredientes = [ip.ingrediente.nombre for ip in producto.ingredientes]
                if ingredientes:
                    lista = ", ".join(ingredientes)
                    reply = f"El producto '{producto.nombre}' lleva: {lista}."
                else:
                    reply = f"El producto '{producto.nombre}' no tiene ingredientes cargados."

                db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
                db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
                db.session.commit()
                return jsonify({"reply": reply})

    return None
