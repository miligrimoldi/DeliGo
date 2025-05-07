from datetime import datetime
from app.extensions import db

class OpinionServicio(db.Model):
    __tablename__ = 'opinion_servicio'

    id_opinion = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='CASCADE'), nullable=False)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id_pedido'), unique=True, nullable=False)
    id_servicio = db.Column(db.Integer, db.ForeignKey('servicio.id_servicio'), nullable=False)

    comentario = db.Column(db.Text)
    puntaje = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('User', back_populates='opiniones_servicio')
    pedido = db.relationship('Pedido', backref=db.backref('opinion_servicio', uselist=False))
    servicio = db.relationship('Servicio', backref='opiniones')
