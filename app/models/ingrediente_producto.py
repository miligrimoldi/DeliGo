
from app.extensions import db

class IngredienteProducto(db.Model):
    __tablename__ = 'ingrediente_producto'

    id_producto = db.Column(db.Integer, db.ForeignKey('producto_servicio.id_producto'), primary_key=True)
    id_ingrediente = db.Column(db.Integer, db.ForeignKey('ingrediente.id_ingrediente'), primary_key=True)

