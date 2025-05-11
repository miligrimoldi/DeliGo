from app import db

class Ingrediente(db.Model):
    __tablename__ = 'ingrediente'

    id_ingrediente = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
