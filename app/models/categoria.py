from app.extensions import db
from app.models.servicio_categoria import ServicioCategoria

class Categoria(db.Model):
    __tablename__ = 'categoria'
    id_categoria = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    imagen_url = db.Column(db.String(255), nullable=True)
    servicios = db.relationship(
        'Servicio',
        secondary='servicio_categoria',
        back_populates='categorias'
    )
