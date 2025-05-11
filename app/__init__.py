from datetime import timedelta

from flask import Flask, send_from_directory, jsonify
from app.extensions import db
from app.main import main
import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.models.ingrediente import Ingrediente
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.producto_servicio import ProductoServicio


def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    app.config.from_object('app.config')

    # Configurar JWT
    app.config["JWT_SECRET_KEY"] = "deligo-mili-pili"
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Missing token"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has been revoked"}), 401

    CORS(app,
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         expose_headers=["Authorization"])

    db.init_app(app)

    with app.app_context():
        from app.models.usuario import User
        from app.models.usuario_consumidor import UsuarioConsumidor
        from app.models.usuario_empleado import UsuarioEmpleado
        from app.models.entidad import Entidad
        from app.models.usuario_entidad import UsuarioEntidad
        from app.models.servicio import Servicio
        from app.models.categoria import Categoria
        from app.models.producto_servicio import ProductoServicio
        from app.models.pedido import Pedido
        from app.models.detalle_pedido import DetallePedido
        from app.models.favoritos_servicios import FavoritoServicio
        from app.models.favoritos_productos import FavoritoProducto
        from app.models.opinion_servicio import OpinionServicio
        from app.models.opinion_producto import OpinionProducto
        from app.models.ingrediente import Ingrediente
        from app.models.ingrediente_producto import IngredienteProducto
        from app.models.stock import Stock
        db.create_all()

        Ingrediente.productos = db.relationship(
            'IngredienteProducto', back_populates='ingrediente', cascade='all, delete-orphan'
        )

        IngredienteProducto.ingrediente = db.relationship(
            'Ingrediente', back_populates='productos'
        )

        IngredienteProducto.producto = db.relationship(
            'ProductoServicio', back_populates='ingredientes'
        )

        ProductoServicio.ingredientes = db.relationship(
            'IngredienteProducto', back_populates='producto', cascade='all, delete-orphan'
        )


        # ENTIDADES
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

        # SERVICIOS
        if not Servicio.query.first():
            austral = Entidad.query.filter_by(nombre='Universidad Austral').first()
            oakhill = Entidad.query.filter_by(nombre='Colegio Oakhill Pilar').first()

            servicios = [
                Servicio(nombre='Comedor Aus', descripcion='Comedor universitario.', entidad=austral),
                Servicio(nombre='Foodtruck', descripcion='Foodtruck campus.', entidad=austral),
                Servicio(nombre='Cafetería', descripcion='Café y snacks.', entidad=austral),
                Servicio(nombre='Comedor Oak', descripcion='Comedor escolar.', entidad=oakhill),
                Servicio(nombre='Kiosko', descripcion='Kiosko con snacks y útiles.', entidad=oakhill)
            ]
            db.session.add_all(servicios)
            db.session.commit()

        # CATEGORÍAS
        if not Categoria.query.first():
            menu = Categoria(nombre='MENÚ')
            ensalada = Categoria(nombre='ENSALADA')
            extras = Categoria(nombre='EXTRAS')
            bebidas = Categoria(nombre='BEBIDAS')
            dulce = Categoria(nombre='DULCE')
            salado = Categoria(nombre='SALADO')
            kiosko = Categoria(nombre='KIOSKO')
            guarniciones = Categoria(nombre='GUARNICIONES')
            principales = Categoria(nombre='PRINCIPALES')

            db.session.add_all([menu, ensalada, extras, bebidas, dulce, salado, kiosko, guarniciones, principales])
            db.session.commit()

            comedor_aus = Servicio.query.filter_by(nombre='Comedor Aus').first()
            comedor_oak = Servicio.query.filter_by(nombre='Comedor Oak').first()
            cafeteria = Servicio.query.filter_by(nombre='Cafetería').first()
            kiosko_servicio = Servicio.query.filter_by(nombre='Kiosko').first()
            foodtruck = Servicio.query.filter_by(nombre='Foodtruck').first()

            # asociar categorias
            comedor_aus.categorias.extend([menu, ensalada, extras, bebidas])
            comedor_oak.categorias.extend([menu, ensalada, extras, bebidas])
            cafeteria.categorias.extend([dulce, salado, kiosko, bebidas])
            kiosko_servicio.categorias.extend([dulce, salado, kiosko, bebidas])
            foodtruck.categorias.extend([guarniciones, principales, extras, bebidas])
            db.session.commit()

        # Cargamos ingredientes basicos
        if not Ingrediente.query.first():
            ingredientes_basicos = [
                Ingrediente(nombre="Pan"),
                Ingrediente(nombre="Lechuga"),
                Ingrediente(nombre="Tomate"),
                Ingrediente(nombre="Queso"),
                Ingrediente(nombre="Jamón"),
                Ingrediente(nombre="Carne"),
                Ingrediente(nombre="Pollo"),
                Ingrediente(nombre="Huevos"),
                Ingrediente(nombre="Papas"),
                Ingrediente(nombre="Arroz"),
                Ingrediente(nombre="Harina"),
                Ingrediente(nombre="Leche"),
                Ingrediente(nombre="Café"),
                Ingrediente(nombre="Azúcar"),
                Ingrediente(nombre="Sal"),
                Ingrediente(nombre="Aceite")
            ]
            db.session.add_all(ingredientes_basicos)
            db.session.commit()


    # Blueprints
    app.register_blueprint(main)
    from app.routes.entidades import entidades_bp
    app.register_blueprint(entidades_bp)
    from app.routes.registro import registro_bp
    app.register_blueprint(registro_bp)
    from app.routes.login import login_bp
    app.register_blueprint(login_bp)
    from app.routes.asociar_entidad import asociar_bp
    app.register_blueprint(asociar_bp)
    from app.routes.desasociar_entidad import desasociar_bp
    app.register_blueprint(desasociar_bp)
    from app.routes.servicios import servicios_bp
    app.register_blueprint(servicios_bp)
    from app.routes.empleado import info_servicio_bp
    app.register_blueprint(info_servicio_bp)
    from app.routes.empleado import categorias_servicio_bp
    app.register_blueprint(categorias_servicio_bp)
    from app.routes.empleado import productos_servicio_bp
    app.register_blueprint(productos_servicio_bp)
    from app.routes.productos_servicio_usuario import producto_servicio_usuario_bp
    app.register_blueprint(producto_servicio_usuario_bp)
    from app.routes.empleado import pedidos_servicio_bp
    app.register_blueprint(pedidos_servicio_bp)
    from app.routes.pedidos import pedidos_bp
    app.register_blueprint(pedidos_bp)
    from app.routes.favoritos import favoritos_bp
    app.register_blueprint(favoritos_bp)
    from app.routes.cambiar_contrasena import cambiar_contrasena_bp
    app.register_blueprint(cambiar_contrasena_bp)
    from app.routes.eliminar_usuario import eliminar_usuario_bp
    app.register_blueprint(eliminar_usuario_bp)
    from app.routes.opinion import opinion_bp
    app.register_blueprint(opinion_bp)
    from app.routes.admin import empleados_bp
    app.register_blueprint(empleados_bp)
    from app.routes.ingredientes import ingredientes_bp
    app.register_blueprint(ingredientes_bp)

    # Rutas frontend
    @app.route('/')
    def serve_react():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def static_proxy(path):
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')


    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory(app.static_folder, 'index.html')

    return app
