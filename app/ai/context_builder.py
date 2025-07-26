from app.models.usuario import User
from app.models.usuario_empleado import UsuarioEmpleado
from app.models.entidad import Entidad
from app.models.servicio import Servicio
from app.models.producto_servicio import ProductoServicio
from app.models.ingrediente import Ingrediente
from app.models.opinion_producto import OpinionProducto
from app.models.opinion_servicio import OpinionServicio
from app.models.favoritos_servicios import FavoritoServicio
from app.models.favoritos_productos import FavoritoProducto
from sqlalchemy import func
from app.models.stock import Stock
from app.extensions import db
from app.models.ingrediente_producto import IngredienteProducto
from app.routes.productos_servicio_usuario import calcular_max_disponible


def obtener_contexto_para_usuario(user_id: int) -> str:
    empleado = UsuarioEmpleado.query.get(user_id)
    if empleado:
        if empleado.esAdmin:
            return contexto_admin(empleado)
        else:
            return contexto_empleado(empleado)

    # Si no es empleado, asumimos que es consumidor
    return contexto_consumidor(user_id)

def contexto_consumidor(user_id: int) -> str:
    entidades = Entidad.query.all()
    favoritos_productos_ids = {
        f.id_producto for f in FavoritoProducto.query.filter_by(id_usuario_consumidor=user_id).all()
    }
    favoritos_servicios_ids = {
        f.id_servicio for f in FavoritoServicio.query.filter_by(id_usuario_consumidor=user_id).all()
    }
    contexto = "Información para consumidor:\n"

    for entidad in entidades:
        contexto += f"\nEntidad: {entidad.nombre}\n"
        total_productos_entidad = 0

        for servicio in entidad.servicios:
            servicio_fav = " (Favorito)" if servicio.id_servicio in favoritos_servicios_ids else ""
            contexto += f"  Servicio: {servicio.nombre}{servicio_fav}\n"

            # Opiniones del servicio
            opiniones_servicio = servicio.opiniones
            if opiniones_servicio:
                promedio = round(
                    sum(o.puntaje for o in opiniones_servicio) / len(opiniones_servicio), 2
                )
                contexto += f"    Opiniones del servicio: {promedio}/5 ({len(opiniones_servicio)} opiniones)\n"

            total_productos_servicio = 0

            for producto in servicio.productos:
                total_productos_servicio += 1
                total_productos_entidad += 1

                prod_fav = " ⭐" if producto.id_producto in favoritos_productos_ids else ""
                contexto += f"    Producto: {producto.nombre}{prod_fav}\n"
                contexto += f"      - Precio actual: ${producto.precio_actual:.2f}\n"

                # Desperdicio cero
                if producto.es_desperdicio_cero:
                    contexto += f"      - DESPERDICIO CERO: Sí\n"
                    if producto.precio_oferta:
                        contexto += f"        * Precio en oferta: ${producto.precio_oferta:.2f}\n"
                    if producto.cantidad_restante is not None:
                        contexto += f"        * Cantidad restante: {producto.cantidad_restante}\n"
                    if producto.tiempo_limite:
                        contexto += (
                            f"        * Disponible hasta: "
                            f"{producto.tiempo_limite.strftime('%Y-%m-%d %H:%M:%S')}\n"
                        )
                else:
                    contexto += f"      - DESPERDICIO CERO: No\n"

                # Disponibilidad
                max_disponible = calcular_max_disponible(producto.id_producto, servicio.id_servicio)
                disponible = max_disponible > 0
                contexto += f"      - Disponible: {'Sí' if disponible else 'No'}\n"

                # Ingredientes
                ingredientes = (
                    db.session.query(Ingrediente.nombre, IngredienteProducto.cantidad_necesaria)
                    .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
                    .filter(IngredienteProducto.id_producto == producto.id_producto)
                    .all()
                )
                if ingredientes:
                    contexto += "      - Ingredientes: " + ", ".join(
                        f"{nom} ({cant})" for nom, cant in ingredientes
                    ) + "\n"

                # Opiniones del producto
                if producto.opiniones:
                    promedio_prod = round(
                        sum(o.puntaje for o in producto.opiniones) / len(producto.opiniones), 2
                    )
                    contexto += f"      - Opiniones: {promedio_prod}/5 ({len(producto.opiniones)} opiniones)\n"

            contexto += f"    Total de productos en este servicio: {total_productos_servicio}\n"

        contexto += f"  Total de productos en esta entidad: {total_productos_entidad}\n"

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
