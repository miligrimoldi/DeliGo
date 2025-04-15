from app.extensions import db
from app.models.servicio_categoria import ServicioCategoria

class Servicio(db.Model):
    __tablename__ = 'servicio'

    id_servicio = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    id_entidad = db.Column(db.Integer, db.ForeignKey('entidad.id_entidad'), nullable=False)
    entidad = db.relationship('Entidad', back_populates='servicios') #back_populates es para relacion bidireccional
    categorias = db.relationship(
        'Categoria',
        secondary='servicio_categoria',
        back_populates='servicios'
    )