from app.extensions import db
from datetime import datetime

class Pedido(db.Model):
    __tablename__ = 'pedido'

    id_pedido = db.Column(db.Integer, primary_key=True)
    id_usuario_consumidor = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    id_entidad = db.Column(db.Integer, db.ForeignKey('entidade.id_entidade'), nullable=False)
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), nullable=False)

    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(30), nullable=False, default='en_preparacion')
    total = db.Column(db.Numeric(10, 2), nullable=False)

    usuario = db.relationship('User', back_populates='pedidos')
    entidad = db.relationship('Entidad', backref='pedidos')
    servicio = db.relationship('Servicio', backref='pedidos')
    detalles = db.relationship('DetallePedido', back_populates='pedido', cascade="all, delete-orphan")




