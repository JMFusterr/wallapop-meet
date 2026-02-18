# Patrones de UI v1 - Wallapop Meet

## Objetivo
Definir pantallas y patrones de interacción para cubrir el ciclo completo de un meetup desde propuesta hasta seguimiento.

## 1. Propuesta inicial (vendedor)
Contenido:
- Fecha y hora propuestas.
- Punto de encuentro sugerido.
- Precio final acordado.
- CTA: `Enviar propuesta` usando `Button.variant=primary`.
- Inputs del formulario con patrón `Input` de label flotante + helper/counter.

Estados:
- `PROPOSED` al enviar.
- Error de validación si faltan campos.

## 2. Revisión de propuesta (comprador)
Contenido:
- Resumen en tarjeta.
- CTAs:
  - `Aceptar` usando `Button.variant=primary`.
  - `Contraofertar` usando `Button.variant=inline_action`.

Estados:
- `CONFIRMED` al aceptar.
- `COUNTER_PROPOSED` al contraofertar.

## 3. Línea temporal de estado
Estados soportados:
- `PROPOSED`
- `COUNTER_PROPOSED`
- `CONFIRMED`
- `ARRIVED`
- `COMPLETED`
- `EXPIRED`
- `CANCELLED`

Reglas visuales:
- Estado actual resaltado.
- Estados finales (`COMPLETED`, `EXPIRED`, `CANCELLED`) bloquean acciones incompatibles.

## 4. Banner del día del meetup
Comportamiento:
- Persistente en inicio durante el día del evento.
- Muestra hora, lugar y CTA de navegación.

Variantes:
- Normal (faltan más de 15 minutos).
- Ventana activa de llegada.
- Evento expirado.

## 5. Check-in "I'm here"
Regla de negocio:
- Habilitado entre 15 minutos antes y 2 horas después de la hora pactada.

Comportamiento:
- CTA principal visible en banner/tarjeta usando `Button.variant=primary`.
- Fuera de ventana: botón deshabilitado + mensaje explicativo.
- Al confirmar: transición a `ARRIVED`.

## 6. Notificación interactiva
Contenido:
- Título contextual según estado.
- Acción directa: `I'm here`.

Reglas:
- La acción en pantalla bloqueada debe reflejarse en estado interno sin reabrir flujo completo.
- Fallback: abrir app en vista de meetup si no hay acción directa disponible.

## 7. Seguimiento 24-48h
Contenido:
- Pregunta: "¿Se completó la venta?"
- Respuestas: `Sí, completada` / `No, cancelada`.

Estados:
- `COMPLETED` si se confirma la venta.
- `CANCELLED` si no se realizó.
- `EXPIRED` si no hay respuesta tras la ventana definida por producto.

## 8. Estados empty, loading y error
Patrones mínimos:
- Empty: no hay meetup activo.
- Loading: skeleton en tarjeta de timeline y botones.
- Error: acción de reintento y mensaje claro.

## 9. Mapeo de botones por patrón
- Navegación superior de categorías o secciones: `Button.variant=nav_expandable`.
- Cambio entre secciones tipo pestaña: `Button.variant=tab`.
- Acciones secundarias contextuales dentro de timeline: `Button.variant=inline_action`.
- Control lateral colapsable: `Button.variant=icon`.
- Cierre de panel contextual: `Button.variant=menu_close`.

## Criterio de completitud
- Todos los estados de negocio tienen UI y CTA asociada.
- Se cubren happy path y rutas de error/expiración.
