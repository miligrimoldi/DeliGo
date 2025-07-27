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
from app.models.pedido import Pedido
from app.extensions import db
from app.models.ingrediente_producto import IngredienteProducto
from app.routes.productos_servicio_usuario import calcular_max_disponible
from decimal import Decimal


def obtener_contexto_para_usuario(user_id: int) -> str:
    empleado = UsuarioEmpleado.query.get(user_id)
    if empleado:
        if empleado.esAdmin:
            return contexto_admin(empleado)
        else:
            return contexto_empleado(empleado)

    # Si no es empleado, asumimos que es consumidor
    return contexto_consumidor(user_id)

from app.models.pedido import Pedido

from difflib import get_close_matches
def contexto_consumidor(user_id: int) -> str:
    # Aquí el código para obtener el contexto del consumidor con productos y favoritos
    # Mejorando el filtro de productos y detalles

    entidades = Entidad.query.all()

    favoritos_productos_ids = {
        f.id_producto for f in FavoritoProducto.query.filter_by(id_usuario_consumidor=user_id).all()
    }
    favoritos_servicios_ids = {
        f.id_servicio for f in FavoritoServicio.query.filter_by(id_usuario_consumidor=user_id).all()
    }

    lines = ["Información para consumidor:\n"]

    # Favoritos
    if favoritos_productos_ids:
        productos_fav = ProductoServicio.query.filter(ProductoServicio.id_producto.in_(favoritos_productos_ids)).all()
        lines.append("Productos en favoritos:")
        for p in productos_fav:
            if p.nombre and len(p.nombre.strip()) > 2:
                lines.append(f"- {p.nombre}")
        lines.append("")
    if favoritos_servicios_ids:
        servicios_fav = Servicio.query.filter(Servicio.id_servicio.in_(favoritos_servicios_ids)).all()
        lines.append("Servicios en favoritos:")
        for s in servicios_fav:
            lines.append(f"- {s.nombre}")
        lines.append("")

    # Desperdicio Cero
    productos_dc = ProductoServicio.query.filter_by(es_desperdicio_cero=True).all()
    if productos_dc:
        lines.append("Productos en oferta (Desperdicio Cero):")
        for p in productos_dc:
            if p.precio_oferta and p.precio_actual and p.nombre and len(p.nombre.strip()) > 2:
                lines.append(f"- {p.nombre} (${p.precio_oferta:.2f}, antes ${p.precio_actual:.2f})")
        lines.append("")

    # Entidades, servicios y productos
    for entidad in entidades:
        lines.append(f"Entidad: {entidad.nombre}")
        lines.append(f"  Ubicación: {entidad.ubicacion}")
        if entidad.descripcion:
            lines.append(f"  Descripción: {entidad.descripcion}")
        servicios = entidad.servicios
        lines.append(f"  Servicios disponibles: {', '.join(s.nombre for s in servicios)}")

        productos = [p for s in servicios for p in s.productos if p.nombre and len(p.nombre.strip()) > 2]
        lines.append(f"  Productos: {', '.join(p.nombre for p in productos)}\n")

    # Detalles de productos
    lines.append("Detalles de productos:\n")

    for entidad in entidades:
        for servicio in entidad.servicios:
            for producto in servicio.productos:
                if not producto.nombre or len(producto.nombre.strip()) <= 2:
                    continue

                lines.append(f"Producto: {producto.nombre}{' ⭐' if producto.id_producto in favoritos_productos_ids else ''}")
                lines.append(f"  Servicio: {servicio.nombre}{' (Favorito)' if servicio.id_servicio in favoritos_servicios_ids else ''}")
                lines.append(f"  Precio: ${producto.precio_actual:.2f}")
                if producto.descripcion:
                    lines.append(f"  Descripción: {producto.descripcion}")
                if producto.informacion_nutricional:
                    lines.append(f"  Info nutricional: {producto.informacion_nutricional}")

                # Ingredientes
                ingredientes = (
                    db.session.query(Ingrediente.nombre, IngredienteProducto.cantidad_necesaria)
                    .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
                    .filter(IngredienteProducto.id_producto == producto.id_producto)
                    .all()
                )
                if ingredientes:
                    ingredientes_str = ", ".join(f"{nom} ({cant})" for nom, cant in ingredientes)
                    lines.append(f"  Ingredientes: {ingredientes_str}")
                else:
                    lines.append("  Ingredientes: No especificados")

                if producto.es_desperdicio_cero and producto.precio_oferta:
                    lines.append(f"  Desperdicio Cero: Sí (precio en oferta: ${producto.precio_oferta:.2f})")
                else:
                    lines.append("  Desperdicio Cero: No")

                max_disp = calcular_max_disponible(producto.id_producto, servicio.id_servicio)
                lines.append(f"  Máx. unidades disponibles: {max_disp}")

                if producto.opiniones:
                    prom = round(sum(o.puntaje for o in producto.opiniones) / len(producto.opiniones), 2)
                    lines.append(f"  Opiniones: {prom}/5 ({len(producto.opiniones)} opiniones)")

                lines.append("")

    # Últimos pedidos
    pedidos = Pedido.query.filter_by(id_usuario_consumidor=user_id).order_by(Pedido.fecha.desc()).limit(5).all()
    if pedidos:
        lines.append("Últimos pedidos realizados:")
        for pedido in pedidos:
            lines.append(f"- Pedido #{pedido.id_pedido} en {pedido.servicio.nombre} ({pedido.fecha.strftime('%Y-%m-%d')}):")
            total = 0.0
            for detalle in pedido.detalles:
                precio_unitario = detalle.precio_unitario or detalle.producto.precio_actual
                subtotal = detalle.cantidad * float(precio_unitario)
                total += subtotal
                lines.append(f"   · {detalle.producto.nombre} x{detalle.cantidad} = ${subtotal:.2f}")
            lines.append(f"   Total del pedido: ${total:.2f}")
        lines.append("")

    # Opiniones del usuario
    opiniones_prod = OpinionProducto.query.filter_by(id_usuario=user_id).all()
    opiniones_serv = OpinionServicio.query.filter_by(id_usuario=user_id).all()
    if opiniones_prod or opiniones_serv:
        lines.append("Opiniones del usuario:")
        for op in opiniones_prod:
            lines.append(f"- Producto: {op.producto.nombre}, Puntaje: {op.puntaje}, Comentario: {op.comentario or 'Sin comentario'}")
        for op in opiniones_serv:
            lines.append(f"- Servicio: {op.servicio.nombre}, Puntaje: {op.puntaje}, Comentario: {op.comentario or 'Sin comentario'}")

    return "\n".join(lines)
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
