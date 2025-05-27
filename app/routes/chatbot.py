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

if not FAKE_MODE:
    import openai
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY no está definida. Verificá tu archivo .env")
    openai.api_key = api_key

# Importar lógica personalizada
from app.intents.chat_intents import procesar_mensaje

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    user_input = data.get("message", "").lower().strip()

    # Historial guardado
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
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "Sos un asistente amable del comedor universitario."}] + messages
            )
            reply = response.choices[0].message.content.strip()
        except Exception as e:
            return jsonify({"reply": f"Error en OpenAI: {str(e)}"}), 500

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
