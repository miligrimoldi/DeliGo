from gemini_client import responder_con_gemini

if __name__ == "__main__":
    mensaje = "Hola, ¿qué podés hacer?"
    respuesta = responder_con_gemini(mensaje)
    print("Respuesta de Gemini:")
    print(respuesta)
