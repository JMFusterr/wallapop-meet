# Patrones de UI v1 - Wallapop Meet

## Objetivo
Definir pantallas y patrones de interacción para cubrir el ciclo completo de un meetup desde propuesta hasta seguimiento.

## 0. Punto de entrada en producto
- Wallapop Meet se lanza desde el chat de Wallapop, dentro de una conversación activa entre vendedor y comprador.
- No se contempla acceso standalone a la creación del meetup fuera del contexto del chat.
- El contexto de chat (anuncio, participantes y acuerdo previo) alimenta la propuesta inicial.

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
- Debe existir una referencia navegable en Storybook: `Design System/Meetup Timeline`.

## 4. Banner del día del meetup
Comportamiento:
- Persistente en inicio durante el día del evento.
- Muestra hora, lugar y CTA de navegación.

Variantes:
- Normal (faltan más de 15 minutos).
- Ventana activa de llegada.
- Evento expirado.
- Referencia de implementacion: `src/components/meetup/meetup-day-banner.tsx`.

## 5. Check-in "I'm here"
Regla de negocio:
- Habilitado entre 15 minutos antes y 2 horas después de la hora pactada.

Comportamiento:
- CTA principal visible en banner/tarjeta usando `Button.variant=primary`.
- Fuera de ventana: botón deshabilitado + mensaje explicativo.
- Al confirmar: transición a `ARRIVED`.
- Debe poder validarse en entorno de simulación con hora controlada (`Design System/Meetup Simulator`).
- Referencia de implementacion en tarjeta: `src/components/meetup/meetup-card.tsx`.

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

## Referencias implementadas (2026-02-20)
- Entrada desde chat con CTA de propuesta: `src/components/meetup/chat-meetup-entry.tsx`.
- Simulador interactivo de flujo: `src/components/meetup/meetup-simulator.tsx`.
- Timeline reusable de estados: `src/components/meetup/meetup-timeline.tsx`.
- Tarjeta contextual de acciones: `src/components/meetup/meetup-card.tsx`.
- Banner del dia con variante de ventana: `src/components/meetup/meetup-day-banner.tsx`.
- Stories de validacion visual:
  - `src/components/meetup/chat-meetup-entry.stories.tsx`
  - `src/components/meetup/meetup-simulator.stories.tsx`
  - `src/components/meetup/meetup-timeline.stories.tsx`
  - `src/components/meetup/meetup-card.stories.tsx`
  - `src/components/meetup/meetup-day-banner.stories.tsx`
