# app/models/user.py
from app.extensions import db

class User(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contrasena = db.Column(db.String(256), nullable=False)

    # Relacion con entidades
    entidades = db.relationship('Entidad', secondary='usuario_entidad', back_populates='usuarios')

    __mapper_args__ = {
        'polymorphic_identity': 'usuario',
    }

