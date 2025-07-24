from app.extensions import db
from datetime import datetime

class ResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False)
    expiration = db.Column(db.DateTime, nullable=False)

    def is_valid(self):
        return datetime.utcnow() < self.expiration