import smtplib
from email.message import EmailMessage
import os
frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:5000")

def send_reset_email(to_email: str, token: str):
    link = f"{frontend_url}/reset-password/{token}"

    subject = "Restablecer contraseña - DeliGo"
    body = f"""Hola

Recibimos un pedido para restablecer tu contraseña.

Hacé click en el siguiente enlace para establecer una nueva contraseña:
{link}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignorá este mensaje."""

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("EMAIL_FROM") or "no-reply@deligo.com"
    msg["To"] = to_email

    try:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except Exception as e:
        print(f"[DEBUG] Error al enviar mail: {e}")
        print(f"[DEBUG] Link de recuperación: {link}")
