import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

def responder_con_gemini(user_input: str, contexto: str, system_prompt: str) -> str:
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        headers = {"Content-Type": "application/json"}

        full_prompt = f"""{system_prompt.strip()}

CONTEXT:
{contexto.strip()}

Usuario pregunta: {user_input.strip()}"""

        body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": full_prompt}]
                }
            ]
        }

        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()

        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"[Error al llamar a Gemini: {e}]"
