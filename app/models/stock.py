# app/models/stock.py
from app.extensions import db

class Stock(db.Model):
    __tablename__ = 'stock'

    id_ingrediente = db.Column(db.Integer, db.ForeignKey('ingrediente.id_ingrediente'), primary_key=True)
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), primary_key=True)
    disponibilidad = db.Column(db.Float, nullable=False, default=0.0)

    ingrediente = db.relationship('Ingrediente', back_populates='stock')
    servicio = db.relationship('Servicio', back_populates='stock')
