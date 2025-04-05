from app.extensions import db

class Entidad(db.Model):
    __tablename__ = 'entidad'

    id_entidad = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ubicacion = db.Column(db.String(100), nullable=False)
    logo_url = db.Column(db.Text)
    descripcion = db.Column(db.Text)

    # Relacion con usuarios
    usuarios = db.relationship('User', secondary='usuario_entidad', back_populates='entidades')

    # Relacion con servicios (uno a muchos)\
    servicios = db.relationship('Servicio', back_populates='entidad', cascade="all, delete-orphan") # lo de cascade es para si se borra una entidad, se borran los servicios
