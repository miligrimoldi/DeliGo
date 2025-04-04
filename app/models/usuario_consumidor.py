# app/models/usuario_consumidor.py
from app.extensions import db
from app.models.user import User

class UsuarioConsumidor(User):
    __tablename__ = 'usuario_consumidor'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)

    # acá podrías agregar campos propios del consumidor si los tuvieras

    __mapper_args__ = {
        'polymorphic_identity': 'consumidor',
    }
