from flask import Flask, send_from_directory
from app.extensions import db
from app.main import main
import os

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    app.config.from_object('app.config')

    db.init_app(app)

    with app.app_context():
        from app.models import User
        db.create_all()

    app.register_blueprint(main)

    # Servir el index.html de React si accedés a "/"
    @app.route('/')
    def serve_react():
        return send_from_directory(app.static_folder, 'index.html')

    # Si usás rutas como "/about", "/contact", etc., para frontend
    @app.route('/<path:path>')
    def static_proxy(path):
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app
