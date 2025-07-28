import os
import requests
from dotenv import load_dotenv

# Cargar la clave de la API desde el archivo .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")


def responder_con_gemini(user_input: str, contexto: str, system_prompt: str, historial: list[tuple[str, str]] = []) -> str:
    """
    historial: lista de tuplas (usuario, bot) representando los últimos intercambios
    """
    try:
        # Construir el cuerpo con partes estructuradas
        contents = []

        # System prompt como parte inicial (si lo usás como guía general para el modelo)
        contents.append({"role": "user", "parts": [{"text": f"{system_prompt.strip()}\n\nCONTEXT:\n{contexto.strip()}"}]})
        contents.append({"role": "model", "parts": [{"text": "Entendido. Responderé según ese contexto."}]})

        # Agregar historial (máximo 6 intercambios recientes)
        for user_msg, bot_msg in historial[-6:]:
            contents.append({"role": "user", "parts": [{"text": user_msg}]})
            contents.append({"role": "model", "parts": [{"text": bot_msg}]})

        # Agregar nueva pregunta del usuario
        contents.append({"role": "user", "parts": [{"text": user_input.strip()}]})

        # Enviar la solicitud
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": contents}
        )
        response.raise_for_status()
        data = response.json()

        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"[Error al llamar a Gemini: {e}]"
