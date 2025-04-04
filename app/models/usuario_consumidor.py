# app/models/usuario_consumidor.py
from app.extensions import db
from app.models.user import User

class UsuarioConsumidor(User):
    __tablename__ = 'usuario_consumidor'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)


    __mapper_args__ = {
        'polymorphic_identity': 'consumidor',
    }
