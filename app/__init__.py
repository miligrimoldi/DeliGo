from flask import Flask
from app.extensions import db
from app.main import main


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config')

    db.init_app(app)

    with app.app_context():
        from app.models import User
        db.create_all()             # Esto crea las tablas

    app.register_blueprint(main)  # <-- esto conecta tus rutas
    return app
