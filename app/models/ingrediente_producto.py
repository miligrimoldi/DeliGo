# app/models/ingrediente_producto.py
from app.extensions import db

class IngredienteProducto(db.Model):
    __tablename__ = 'ingrediente_producto'

    id_producto = db.Column(db.Integer, db.ForeignKey('producto.id_producto'), primary_key=True)
    id_ingrediente = db.Column(db.Integer, db.ForeignKey('ingrediente.id_ingrediente'), primary_key=True)
    cantidad_necesaria = db.Column(db.Float, nullable=False)

    producto = db.relationship('Producto', back_populates='ingredientes')
    ingrediente = db.relationship('Ingrediente', back_populates='productos')
