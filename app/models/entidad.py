from app.extensions import db

class Entidad(db.Model):
    __tablename__ = 'entidad'

    id_entidad = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ubicacion = db.Column(db.String(100), nullable=False)
    logo_url = db.Column(db.String(255))
    descripcion = db.Column(db.String(255))

    # Relacion con usuarios
    usuarios = db.relationship('User', secondary='usuario_entidad', back_populates='entidades')