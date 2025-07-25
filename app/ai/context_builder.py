from app.models.usuario import User
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.entidad import Entidad
from app.models.servicio import Servicio
from app.models.producto_servicio import ProductoServicio
from app.models.ingrediente import Ingrediente
from app.models.stock import Stock
from app.extensions import db


def obtener_contexto_para_usuario(user_id: int) -> str:
    empleado = UsuarioEmpleado.query.get(user_id)
    if empleado:
        if empleado.esAdmin:
            return contexto_admin(empleado)
        else:
            return contexto_empleado(empleado)

    # Si no es empleado, asumimos que es consumidor
    return contexto_consumidor()


def contexto_consumidor() -> str:
    entidades = Entidad.query.all()
    servicios = Servicio.query.all()
    productos = ProductoServicio.query.all()

    contexto = "ENTIDADES Y SUS SERVICIOS:\n"
    for entidad in entidades:
        servicios_entidad = [s.nombre for s in entidad.servicios]
        contexto += f"- {entidad.nombre}: {', '.join(servicios_entidad)}\n"

    contexto += "\nPRODUCTOS POR SERVICIO:\n"
    for servicio in servicios:
        productos_serv = [p.nombre for p in servicio.productos]
        contexto += f"- {servicio.nombre}: {', '.join(productos_serv)}\n"

    return contexto


def contexto_empleado(empleado: UsuarioEmpleado) -> str:
    servicio = empleado.servicio
    contexto = f"Sos empleado del servicio '{servicio.nombre}'\n"

    stock = (
        db.session.query(Ingrediente.nombre, Stock.cantidad)
        .join(Stock)
        .filter(Stock.id_servicio == servicio.id_servicio)
        .all()
    )

    contexto += "STOCK ACTUAL:\n"
    for nombre, cantidad in stock:
        contexto += f"- {nombre}: {cantidad} unidades\n"

    return contexto


def contexto_admin(admin: UsuarioEmpleado) -> str:
    servicio = admin.servicio
    contexto = f"Estás viendo datos del servicio '{servicio.nombre}'\n"

    # Stock actual
    stock = (
        db.session.query(Ingrediente.nombre, Stock.cantidad)
        .join(Stock)
        .filter(Stock.id_servicio == servicio.id_servicio)
        .all()
    )
    contexto += "STOCK ACTUAL:\n"
    for nombre, cantidad in stock:
        contexto += f"- {nombre}: {cantidad} unidades\n"

    # Empleados del servicio
    empleados = UsuarioEmpleado.query.filter_by(id_servicio=servicio.id_servicio).all()
    contexto += "\nEMPLEADOS ASIGNADOS A ESTE SERVICIO:\n"
    for empleado in empleados:
        rol = "Administrador" if empleado.esAdmin else "Empleado"
        contexto += f"- {empleado.nombre} ({rol})\n"

    return contexto
