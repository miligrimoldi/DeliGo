from app.extensions import db

class DetallePedido(db.Model):
    _tablename_ = 'detalle_pedido'

    id_detalle = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id_pedido'), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey('producto.id_producto'), nullable=False)

    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    # Relaciones
    pedido = db.relationship('Pedido', back_populates='detalles')
    producto = db.relationship('Producto')