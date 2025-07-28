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


    return None
