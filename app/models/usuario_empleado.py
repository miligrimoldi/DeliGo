# app/models/usuario_empleado.py
from app.extensions import db
from app.models.usuario import User
from app.models.servicio import Servicio  # asegurate de importar esto

class UsuarioEmpleado(User):
    __tablename__ = 'usuario_empleado'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
    dni = db.Column(db.String(8), nullable=False)
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), nullable=True)
    esAdmin = db.Column(db.Boolean, nullable=False)

    servicio = db.relationship('Servicio', backref='empleados')

    __mapper_args__ = {
        'polymorphic_identity': 'empleado',
    }