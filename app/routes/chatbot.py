from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.chat_message import ChatMessage
from app.extensions import db
from datetime import datetime
from dotenv import load_dotenv
import os

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
            prompt = f"{contexto}\n\nUsuario pregunta: {user_input}"
            reply = responder_con_gemini(prompt)
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
