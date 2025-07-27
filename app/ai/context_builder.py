from sqlalchemy.orm import joinedload

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
            lines.append(f"- {p.nombre}")
        lines.append("")
    else:
        lines.append("No tenés productos en favoritos.\n")

    if favoritos_servicios_ids:
        servicios_fav = Servicio.query.filter(Servicio.id_servicio.in_(favoritos_servicios_ids)).all()
        lines.append("Servicios en favoritos:")
        for s in servicios_fav:
            lines.append(f"- {s.nombre}")
        lines.append("")
    else:
        lines.append("No tenés servicios en favoritos.\n")

    # Productos en oferta
    productos_dc = ProductoServicio.query.filter_by(es_desperdicio_cero=True).all()
    if productos_dc:
        lines.append("Productos en oferta (Desperdicio Cero):")
        for p in productos_dc:
            if p.precio_oferta and p.precio_actual:
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
        if productos:
            lines.append(f"  Productos: {', '.join(p.nombre for p in productos)}\n")
        else:
            lines.append(f"  Productos: No hay productos disponibles\n")

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
                    ing_str = ", ".join(f"{nom} ({cant})" for nom, cant in ingredientes)
                    lines.append(f"  Ingredientes: {ing_str}")
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

    # Pedidos: activos y antiguos
    pedidos = Pedido.query.filter_by(id_usuario_consumidor=user_id).order_by(Pedido.fecha.desc()).all()
    pedidos_activos = [p for p in pedidos if p.estado not in ("entregado", "cancelado")]
    pedidos_antiguos = [p for p in pedidos if p.estado == "entregado"]

    if pedidos_activos:
        lines.append("Pedidos activos:")
        for pedido in pedidos_activos:
            lines.append(f"- Pedido #{pedido.id_pedido} en {pedido.servicio.nombre} ({pedido.fecha.strftime('%Y-%m-%d')}):")
            total = 0.0
            for det in pedido.detalles:
                precio_unitario = det.precio_unitario or det.producto.precio_actual
                subtotal = det.cantidad * float(precio_unitario)
                total += subtotal
                lines.append(f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}")
            lines.append(f"   Total del pedido: ${total:.2f}")
        lines.append("")

    if pedidos_antiguos:
        lines.append("Pedidos antiguos (entregados):")
        for pedido in pedidos_antiguos:
            lines.append(f"- Pedido #{pedido.id_pedido} en {pedido.servicio.nombre} ({pedido.fecha.strftime('%Y-%m-%d')}):")
            total = 0.0
            for det in pedido.detalles:
                precio_unitario = det.precio_unitario or det.producto.precio_actual
                subtotal = det.cantidad * float(precio_unitario)
                total += subtotal
                lines.append(f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}")
            lines.append(f"   Total del pedido: ${total:.2f}")
        lines.append("")

    # Opiniones del usuario
    opiniones_prod = OpinionProducto.query.filter_by(id_usuario=user_id).all()
    opiniones_serv = OpinionServicio.query.filter_by(id_usuario=user_id).all()

    lines.append("")

    if opiniones_prod or opiniones_serv:
        lines.append("Opiniones del usuario:")

        # Contador de productos opinados en pedidos antiguos
        ids_pedidos_entregados = {
            p.id_pedido for p in Pedido.query.filter_by(id_usuario_consumidor=user_id, estado="entregado").all()
        }

        opiniones_prod_entregadas = [op for op in opiniones_prod if op.id_pedido in ids_pedidos_entregados]
        opiniones_serv_entregadas = [op for op in opiniones_serv if op.id_pedido in ids_pedidos_entregados]

        # Resumen
        lines.append(
            f"Total de productos opinados: {len(opiniones_prod)} ({len(opiniones_prod_entregadas)} en pedidos antiguos)")
        lines.append(
            f"Total de servicios opinados: {len(opiniones_serv)} ({len(opiniones_serv_entregadas)} en pedidos antiguos)\n")

        # Detalles de opiniones
        for op in opiniones_prod:
            comentario = op.comentario or "Sin comentario"
            lines.append(f"- Producto: {op.producto.nombre}, Puntaje: {op.puntaje}, Comentario: {comentario}")
        for op in opiniones_serv:
            comentario = op.comentario or "Sin comentario"
            lines.append(f"- Servicio: {op.servicio.nombre}, Puntaje: {op.puntaje}, Comentario: {comentario}")
    else:
        lines.append("No dejaste opiniones sobre productos ni servicios.")

    return "\n".join(lines)


def contexto_admin(admin: UsuarioEmpleado) -> str:
    servicio = admin.servicio
    entidad = servicio.entidad
    contexto = f"Estás viendo datos del servicio '{servicio.nombre}', que pertenece a la entidad '{entidad.nombre}'.\n\n"


    # STOCK ACTUAL
    stock = (
        db.session.query(Ingrediente.nombre, Stock.cantidad)
        .join(Stock)
        .filter(Stock.id_servicio == servicio.id_servicio)
        .all()
    )
    contexto += "STOCK ACTUAL:\n"
    for nombre, cantidad in stock:
        contexto += f"- {nombre}: {cantidad} unidades\n"
    contexto += "\n"

    # CATEGORÍAS DEL SERVICIO
    categorias = servicio.categorias
    contexto += "CATEGORÍAS ASOCIADAS A ESTE SERVICIO:\n"
    for cat in categorias:
        contexto += f"- {cat.nombre}\n"
    contexto += "\n"

    # PRODUCTOS
    productos = servicio.productos
    contexto += "PRODUCTOS ASOCIADOS A ESTE SERVICIO:\n"
    for producto in productos:
        contexto += f"Producto: {producto.nombre} (Categoría: {producto.categoria.nombre if producto.categoria else 'Sin categoría'})\n"
        contexto += f"  Precio: ${producto.precio_actual:.2f}\n"
        if producto.descripcion:
            contexto += f"  Descripción: {producto.descripcion}\n"
        if producto.informacion_nutricional:
            contexto += f"  Info nutricional: {producto.informacion_nutricional}\n"

        # Ingredientes
        ingredientes = (
            db.session.query(Ingrediente.nombre, IngredienteProducto.cantidad_necesaria)
            .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
            .filter(IngredienteProducto.id_producto == producto.id_producto)
            .all()
        )
        if ingredientes:
            ing_str = ", ".join(f"{n} ({c})" for n, c in ingredientes)
            contexto += f"  Ingredientes: {ing_str}\n"
        else:
            contexto += f"  Ingredientes: No especificados\n"

        max_disp = calcular_max_disponible(producto.id_producto, producto.id_servicio)
        contexto += f"  Máx. unidades disponibles: {max_disp}\n"

        # Opiniones
        if producto.opiniones:
            prom = round(sum(o.puntaje for o in producto.opiniones) / len(producto.opiniones), 2)
            contexto += f"  Opiniones: {prom}/5 ({len(producto.opiniones)} opiniones)\n"
        contexto += "\n"
    contexto += "\n"

    # PEDIDOS (activos y antiguos)
    pedidos = Pedido.query.filter_by(id_servicio=servicio.id_servicio).order_by(Pedido.fecha.desc()).all()
    activos = [p for p in pedidos if p.estado not in ("entregado", "cancelado")]
    antiguos = [p for p in pedidos if p.estado in ("entregado", "cancelado")]

    if activos:
        contexto += "PEDIDOS ACTIVOS:\n"
        for pedido in activos:
            contexto += f"- Pedido #{pedido.id_pedido} de {pedido.usuario.nombre} ({pedido.estado})\n"
            total = 0
            for det in pedido.detalles:
                subtotal = det.cantidad * float(det.precio_unitario or det.producto.precio_actual)
                total += subtotal
                contexto += f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}\n"
            contexto += f"   Total: ${total:.2f} | Fecha: {pedido.fecha.strftime('%Y-%m-%d')}\n"
        contexto += "\n"

    if antiguos:
        contexto += "PEDIDOS ANTIGUOS:\n"
        for pedido in antiguos:
            contexto += f"- Pedido #{pedido.id_pedido} de {pedido.usuario.nombre} ({pedido.estado})\n"
            total = 0
            for det in pedido.detalles:
                subtotal = det.cantidad * float(det.precio_unitario or det.producto.precio_actual)
                total += subtotal
                contexto += f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}\n"
            contexto += f"   Total: ${total:.2f} | Fecha: {pedido.fecha.strftime('%Y-%m-%d')}\n"
        contexto += "\n"

    # EMPLEADOS
    empleados = UsuarioEmpleado.query.filter_by(id_servicio=servicio.id_servicio).all()
    contexto += "EMPLEADOS ASIGNADOS A ESTE SERVICIO:\n"
    for empleado in empleados:
        rol = "Administrador" if empleado.esAdmin else "Empleado"
        contexto += f"- {empleado.nombre} ({rol})\n"
    contexto += "\n"

    # OPINIONES SOBRE EL SERVICIO
    opiniones_servicio = OpinionServicio.query.filter_by(id_servicio=servicio.id_servicio).all()
    if opiniones_servicio:
        contexto += "OPINIONES SOBRE EL SERVICIO:\n"
        for o in opiniones_servicio:
            contexto += f"- Puntaje: {o.puntaje}/5 | Comentario: {o.comentario or 'Sin comentario'} | Usuario: {o.usuario.nombre}\n"
        contexto += "\n"

    return contexto


def contexto_empleado(empleado: UsuarioEmpleado) -> str:
    servicio = empleado.servicio
    entidad = servicio.entidad
    contexto = f"Sos empleado del servicio '{servicio.nombre}', que pertenece a la entidad '{entidad.nombre}'. Tenés acceso a la gestión del stock, productos y pedidos de este servicio.\n\n"

    # STOCK ACTUAL
    stock = (
        db.session.query(Ingrediente.nombre, Stock.cantidad)
        .join(Stock)
        .filter(Stock.id_servicio == servicio.id_servicio)
        .all()
    )
    contexto += "STOCK ACTUAL:\n"
    for nombre, cantidad in stock:
        contexto += f"- {nombre}: {cantidad} unidades\n"
    contexto += "\n"

    # CATEGORÍAS
    categorias = servicio.categorias
    contexto += "CATEGORÍAS:\n"
    for cat in categorias:
        contexto += f"- {cat.nombre}\n"
    contexto += "\n"

    # PRODUCTOS
    productos = servicio.productos
    contexto += "PRODUCTOS:\n"
    for producto in productos:
        contexto += f"Producto: {producto.nombre} (Categoría: {producto.categoria.nombre if producto.categoria else 'Sin categoría'})\n"
        contexto += f"  Precio: ${producto.precio_actual:.2f}\n"
        if producto.descripcion:
            contexto += f"  Descripción: {producto.descripcion}\n"
        if producto.informacion_nutricional:
            contexto += f"  Info nutricional: {producto.informacion_nutricional}\n"

        # Ingredientes
        ingredientes = (
            db.session.query(Ingrediente.nombre, IngredienteProducto.cantidad_necesaria)
            .join(IngredienteProducto, Ingrediente.id_ingrediente == IngredienteProducto.id_ingrediente)
            .filter(IngredienteProducto.id_producto == producto.id_producto)
            .all()
        )
        if ingredientes:
            ing_str = ", ".join(f"{n} ({c})" for n, c in ingredientes)
            contexto += f"  Ingredientes: {ing_str}\n"
        else:
            contexto += f"  Ingredientes: No especificados\n"

        max_disp = calcular_max_disponible(producto.id_producto, producto.id_servicio)
        contexto += f"  Máx. unidades disponibles: {max_disp}\n\n"

    # PEDIDOS (activos y antiguos)
    pedidos = (
        db.session.query(Pedido)
        .options(joinedload(Pedido.usuario))
        .filter_by(id_servicio=servicio.id_servicio)
        .order_by(Pedido.fecha.desc())
        .all()
    )
    activos = [p for p in pedidos if p.estado not in ("entregado", "cancelado")]
    antiguos = [p for p in pedidos if p.estado in ("entregado", "cancelado")]

    if activos:
        contexto += "PEDIDOS ACTIVOS:\n"
        for pedido in activos:
            contexto += f"- Pedido #{pedido.id_pedido} realizado por el usuario '{pedido.usuario.nombre}' (estado: {pedido.estado})\n"
            total = 0
            for det in pedido.detalles:
                subtotal = det.cantidad * float(det.precio_unitario or det.producto.precio_actual)
                total += subtotal
                contexto += f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}\n"
            contexto += f"   Total del pedido: ${total:.2f} | Fecha: {pedido.fecha.strftime('%Y-%m-%d')}\n"
        contexto += "\n"

    if antiguos:
        contexto += "PEDIDOS ANTIGUOS:\n"
        for pedido in antiguos:
            contexto += f"- Pedido #{pedido.id_pedido} realizado por el usuario '{pedido.usuario.nombre}' (estado: {pedido.estado})\n"
            total = 0
            for det in pedido.detalles:
                subtotal = det.cantidad * float(det.precio_unitario or det.producto.precio_actual)
                total += subtotal
                contexto += f"   · {det.producto.nombre} x{det.cantidad} = ${subtotal:.2f}\n"
            contexto += f"   Total del pedido: ${total:.2f} | Fecha: {pedido.fecha.strftime('%Y-%m-%d')}\n"
        contexto += "\n"

    return contexto
