from sqlalchemy import func
from flask import jsonify
from app.models.chat_message import ChatMessage
from app.models.producto_servicio import ProductoServicio
from app.models.servicio import Servicio
from app.models.entidad import Entidad
from app.extensions import db
import re

STOPWORDS = {"el", "la", "un", "una", "cuanto", "cuesta", "es", "en", "del", "de", "por", "a", "y", "los", "las", "con", "al", "que"}

def procesar_mensaje(user_id: int, user_input: str):
    input_lower = user_input.lower()

    palabras = [p for p in re.findall(r'\w+', input_lower) if p not in STOPWORDS and len(p) > 2]

    # Precio de producto
    if "precio" in input_lower or "cuesta" in input_lower:
        query = ProductoServicio.query

        servicio_mencionado = None
        for servicio in Servicio.query.all():
            if servicio.nombre.lower() in input_lower:
                servicio_mencionado = servicio
                break

        if servicio_mencionado:
            query = query.filter(ProductoServicio.id_servicio == servicio_mencionado.id_servicio)

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

    # Servicios por entidad
    if "servicios" in input_lower:
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

    return None
