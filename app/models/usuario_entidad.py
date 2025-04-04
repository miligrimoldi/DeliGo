from app.extensions import db

class UsuarioEntidad(db.Model):
    __tablename__ = 'usuario_entidad'

    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
    id_entidad = db.Column(db.Integer, db.ForeignKey('entidad.id_entidad'), primary_key=True)