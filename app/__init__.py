from flask import Flask, send_from_directory
from flask_cors import CORS
from app.extensions import db
from app.main import main
import os

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    app.config.from_object('app.config')

    CORS(app)

    db.init_app(app)

    with app.app_context():
        from app.models.user import User
        from app.models.usuario_consumidor import UsuarioConsumidor
        from app.models.usuario_empleado import UsuarioEmpleado
        from app.models.entidad import Entidad
        from app.models.usuario_entidad import UsuarioEntidad
        from app.models.servicio import Servicio
        db.create_all()

        # entidades
        if not Entidad.query.first():
            entidades = [
                Entidad(
                    nombre='Universidad Austral',
                    ubicacion='Pilar',
                    logo_url='https://d2975dej41kw79.cloudfront.net/jsjc/wp-content/uploads/20211221172432/Universidad-Austral-Logo-2.jpg',
                    descripcion='Institución académica privada, reconocida por su excelencia educativa y su enfoque en la formación integral de profesionales.'
                ),
                Entidad(
                    nombre='Colegio Oakhill Pilar',
                    ubicacion='Pilar',
                    logo_url='https://th.bing.com/th/id/OIP.f3cMSZ6rr1gRxhY4KH9DHQHaHa?rs=1&pid=ImgDetMain',
                    descripcion='El Colegio OakHill de Pilar es un centro de enseñanza bilingüe con nivel inicial, primaria y secundaria, con más de 15 años de historia.'
                ),
            ]
            db.session.add_all(entidades)
            db.session.commit()

    # Blueprints
    app.register_blueprint(main)
    from app.routes.entidades import entidades_bp
    app.register_blueprint(entidades_bp)

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
