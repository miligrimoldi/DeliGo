# app/models/usuario_empleado.py
from app.extensions import db
from app.models.user import User

class UsuarioEmpleado(User):
    __tablename__ = 'usuario_empleado'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
    dni = db.Column(db.String(8), nullable=False)
    esAdmin = db.Column(db.Boolean, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'empleado',
    }
