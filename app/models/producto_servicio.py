from app.extensions import db

class ProductoServicio(db.Model):
    __tablename__ = 'producto_servicio'

    id_producto = db.Column(db.Integer, primary_key=True)
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(500))
    informacion_nutricional = db.Column(db.Text)
    precio_actual = db.Column(db.Float, nullable=False)
    foto = db.Column(db.String(255))
    activo = db.Column(db.Boolean, default=True)

    servicio = db.relationship('Servicio', backref='productos')
    categoria = db.relationship('Categoria', backref='productos')
