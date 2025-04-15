# app/models/servicio_categoria.py
from app.extensions import db

class ServicioCategoria(db.Model):
    __tablename__ = 'servicio_categoria'
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), primary_key=True)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria'), primary_key=True)
