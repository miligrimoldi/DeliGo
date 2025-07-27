from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.chat_message import ChatMessage
from app.extensions import db
from datetime import datetime
from dotenv import load_dotenv
import os
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado

def obtener_tipo_usuario(user_id: int) -> str:
    if UsuarioEmpleado.query.get(user_id):
        return "administrador" if UsuarioEmpleado.query.get(user_id).esAdmin else "empleado"
    elif UsuarioConsumidor.query.get(user_id):
        return "consumidor"
    return "desconocido"

system_prompt = """
Sos un asistente amigable y profesional para una aplicación de gestión de servicios de comida llamada DeliGo.

Normas de comportamiento:
- Saludá solo si el usuario te saluda primero. No repitas saludos en cada mensaje.
- Respondé con precisión y brevedad. Sé directo en respuestas cerradas. Si el usuario hace una pregunta puntual, no des contexto adicional innecesario. Respondé con un tono cordial pero concreto. Si la respuesta es sencilla (sí/no, un dato puntual), no la extiendas innecesariamente. Evitá repetir saludos en cada respuesta.
- Si el usuario pide la descripción de un producto, devolvé el texto exacto de la descripción (no sus ingredientes).
- Si el usuario pide los ingredientes, listalos claramente.
- Si no hay datos disponibles para la pregunta, indicálo de forma breve y amable.
- Si no podés responder algo porque no hay datos en el contexto, respondé claramente "No tengo esa información disponible" de forma breve y cordial. No inventes la respuesta.
- Adaptá las respuestas según el tipo de usuario:
  - Consumidor: ayudalo a descubrir entidades, servicios, productos y descripciones.
  - Empleado: informá sobre stock de ingredientes de su servicio.
  - Administrador: además del stock, también puede consultar los empleados asociados.

- Nunca inventes información ni respondas temas que no estén relacionados con DeliGo. Si el usuario pregunta algo fuera del sistema, respondé amablemente que solo podés ayudar con preguntas sobre DeliGo.
"""

# Cargar .env
load_dotenv()
FAKE_MODE = os.getenv("FAKE_MODE") == "1"

from app.intents.chat_intents import procesar_mensaje
from app.ai.context_builder import obtener_contexto_para_usuario
from app.ai.gemini_client import responder_con_gemini

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    user_input = data.get("message", "").lower().strip()

    # Historial guardado (para mostrar en frontend si hace falta)
    history = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.timestamp).all()
    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": user_input})

    # Primero procesar con intents personalizados
    custom_response = procesar_mensaje(user_id, user_input)
    if custom_response:
        return custom_response

    # Si no se matcheó ningún intent
    if FAKE_MODE:
        if "comer" in user_input:
            reply = "Hoy tenemos milanesas con puré y ensalada mixta"
        elif "dónde" in user_input and "comedor" in user_input:
            reply = "El comedor está en planta baja"
        elif "precio" in user_input:
            reply = "Los menús arrancan desde $2500 según el plato."
        elif "horario" in user_input:
            reply = "El comedor abre de lunes a viernes de 12 a 15 hs"
        else:
            reply = f"(Respuesta simulada a: '{user_input}')"
    else:
        try:
            # Inyectar contexto personalizado para este usuario
            contexto = obtener_contexto_para_usuario(user_id)
            tipo_usuario = obtener_tipo_usuario(user_id)

            reply = responder_con_gemini(
                user_input=user_input,
                contexto=f"Tipo de usuario: {tipo_usuario.upper()}\n\n{contexto}",
                system_prompt=system_prompt
            )
        except Exception as e:
            reply = f"[Error en Gemini: {str(e)}]"

    # Guardar interacción
    db.session.add(ChatMessage(user_id=user_id, role='user', content=user_input))
    db.session.add(ChatMessage(user_id=user_id, role='assistant', content=reply))
    db.session.commit()

    return jsonify({"reply": reply})


@chatbot_bp.route('/api/chat/clear', methods=['POST'])
@jwt_required()
def clear_history():
    user_id = int(get_jwt_identity())
    ChatMessage.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"msg": "Historial eliminado"})
