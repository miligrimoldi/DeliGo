from app.extensions import db

class FavoritoServicio(db.Model):
    __tablename__ = 'favoritos_servicios'

    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), primary_key=True)
    id_usuario_consumidor = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
