from app.extensions import db

class Servicio(db.Model):
    __tablename__ = 'servicio'

    id_servicio = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    logo_url = db.Column(db.String(255))

    id_entidad = db.Column(db.Integer, db.ForeignKey('entidad.id_entidad'), nullable=False)
    entidad = db.relationship('Entidad', back_populates='servicios') #back_populates es para relacion bidireccional