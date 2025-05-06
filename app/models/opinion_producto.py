from datetime import datetime
from app.extensions import db
from app.models.producto_servicio import ProductoServicio

class OpinionProducto(db.Model):
    __tablename__ = 'opinion_producto'

    id_opinion_producto = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id_pedido'), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey('producto_servicio.id_producto'), nullable=False)

    comentario = db.Column(db.Text)
    puntaje = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('id_pedido', 'id_producto', name='uq_opinion_pedido_producto'),
    )

    usuario = db.relationship('User', backref='opiniones_producto')
    pedido = db.relationship('Pedido', backref='opiniones_producto')
    producto = db.relationship('ProductoServicio', backref='opiniones')
