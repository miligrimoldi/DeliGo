from app.extensions import db

class FavoritoProducto(db.Model):
    __tablename__ = 'favoritos_productos'

    id_producto = db.Column(db.Integer, db.ForeignKey('producto_servicio.id_producto'), primary_key=True)
    id_usuario_consumidor = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
