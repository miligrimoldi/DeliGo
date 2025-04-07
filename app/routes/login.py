from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash
from app.models.entidad import Entidad
from app.models.usuario_consumidor import UsuarioConsumidor
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.usuario_entidad import UsuarioEntidad


main = Blueprint('main', __name__)