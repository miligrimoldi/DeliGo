import os
from difflib import get_close_matches

import requests
from dotenv import load_dotenv

from app import db
from app.models.ingrediente_producto import IngredienteProducto
from app.models.producto_servicio import ProductoServicio
from app.models.ingrediente import Ingrediente
from typing import Optional




# Cargar la clave de la API desde el archivo .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")


def responder_con_gemini(user_input: str, contexto: str, system_prompt: str) -> str:
    try:
        # Paso 1: Detectar tipo de pregunta
        if "ingredientes" in user_input.lower():
            return obtener_ingredientes(user_input)

        # Paso 2: Si la pregunta no está relacionada con ingredientes, proceder normalmente con Gemini
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

        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json=body)
        response.raise_for_status()

        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"[Error al llamar a Gemini: {e}]"


def obtener_ingredientes(user_input: str) -> str:
    productos = ProductoServicio.query.all()

    # Extraer nombre del producto de la pregunta
    posibles_nombres = extraer_nombre_de_producto(user_input)

    for nombre in posibles_nombres:
        producto = buscar_producto_por_nombre(nombre, productos)
        if producto:
            ingredientes = (
                db.session.query(Ingrediente.nombre, IngredienteProducto.cantidad_necesaria)
                .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
                .filter(IngredienteProducto.id_producto == producto.id_producto)
                .all()
            )
            if ingredientes:
                ingredientes_str = ", ".join(f"{nom} ({cant})" for nom, cant in ingredientes)
                return f"Los ingredientes de {producto.nombre} son: {ingredientes_str}."
            else:
                return f"El producto {producto.nombre} no tiene ingredientes cargados."

    # Si no se encontró un producto relacionado
    return "No encontré ningún producto que coincida con ese nombre o ingredientes."


def extraer_nombre_de_producto(texto: str) -> list[str]:
    # Usar una lógica más robusta para extraer nombres de productos.
    palabras = texto.split()
    return [p.strip(".,?!").lower() for p in palabras if len(p.strip()) > 2]


def buscar_producto_por_nombre(nombre_buscado: str, productos: list) -> Optional[ProductoServicio]:
    nombre_buscado = nombre_buscado.strip().lower()

    # Paso 1: Match exacto (case-insensitive)
    for producto in productos:
        if producto.nombre and producto.nombre.strip().lower() == nombre_buscado:
            return producto

    # Paso 2: Match case-insensitive parcial
    for producto in productos:
        if producto.nombre and nombre_buscado in producto.nombre.strip().lower():
            return producto

    # Paso 3: Fuzzy matching (difflib)
    nombres = [p.nombre.strip() for p in productos if p.nombre and len(p.nombre.strip()) > 2]
    coincidencias = get_close_matches(nombre_buscado, nombres, n=1, cutoff=0.7)

    if coincidencias:
        nombre_match = coincidencias[0]
        for producto in productos:
            if producto.nombre.strip() == nombre_match:
                return producto

    return None
