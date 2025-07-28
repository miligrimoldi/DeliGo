import os
import requests
from dotenv import load_dotenv

# Cargar la clave de la API desde el archivo .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")


def responder_con_gemini(user_input: str, contexto: str, system_prompt: str, historial: list[str] = []) -> str:
    try:
        # Construir historial textual de forma simple
        historial_texto = ""
        if historial:
            historial_texto = "\nCONVERSACIÓN ANTERIOR:\n" + "\n".join(historial[-6:])  # Limitar a las últimas 6 entradas

        # Construir el prompt completo
        full_prompt = f"""{system_prompt.strip()}

CONTEXT:
{contexto.strip()}
{historial_texto}

USUARIO AHORA PREGUNTA:
{user_input.strip()}"""

        # Preparar el body para Gemini
        body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": full_prompt}]
                }
            ]
        }

        # Hacer la solicitud a la API de Gemini
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json=body
        )
        response.raise_for_status()
        data = response.json()

        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"[Error al llamar a Gemini: {e}]"
