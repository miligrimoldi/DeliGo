from app.extensions import db


class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedido'

    id_detalle = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id_pedido'), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey('producto_servicio.id_producto'), nullable=False)

    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)


    cantidad_oferta = db.Column(db.Integer, default=0)
    cantidad_normal = db.Column(db.Integer, default=0)
    precio_oferta = db.Column(db.Numeric(10, 2), nullable=True)
    precio_original = db.Column(db.Numeric(10, 2), nullable=True)
    es_oferta = db.Column(db.Boolean, default=False)

    # Relaciones
    pedido = db.relationship('Pedido', back_populates='detalles')
    producto = db.relationship('ProductoServicio')