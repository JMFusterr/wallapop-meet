# Patrones de UI v1 - Wallapop Meet

## Objetivo
Definir pantallas y patrones de interacción para cubrir el ciclo completo de un meetup desde propuesta hasta seguimiento.

## 0. Punto de entrada en producto
- Wallapop Meet se lanza desde el chat de Wallapop, dentro de una conversación activa entre vendedor y comprador.
- No se contempla acceso standalone a la creación del meetup fuera del contexto del chat.
- El contexto de chat (anuncio, participantes y acuerdo previo) alimenta la propuesta inicial.
- En implementacion actual, la vista de buzon evita accion global de hamburguesa y delega acciones contextuales al header de cada conversacion (icono de tres puntos verticales).
- El header de cada conversacion incluye avatar circular del usuario comprador junto al icono de tres puntos para reforzar el contexto del interlocutor.
- El avatar de perfil en conversacion abierta y sidebar puede ser persona o contenido no-personal (paisaje/objeto) para reflejar casuistica real de Wallapop.
- En la cabecera abierta de conversacion, la linea principal muestra el precio del articulo; el titulo del anuncio queda en la linea secundaria.

## 1. Propuesta inicial (vendedor)
Contenido:
- Fecha y hora propuestas.
- Punto de encuentro sugerido.
- Precio final acordado.
- Entrada desde composer de chat con CTA secundario circular (`Proponer quedar`) y icono `calendar`, ubicado a la derecha junto al boton de envio.
  - Esta CTA solo se muestra cuando el actor del chat es `SELLER` y no existe meetup activo.
  - Si el actor es `BUYER`, el composer muestra solo la accion de enviar mensaje.
- Overlay de configuracion:
  - Desktop/tablet horizontal: centrado.
  - Movil: aparece desde abajo.
- Wizard en 3 pasos:
  - Paso 1: seleccion de punto de encuentro en lista (2 opciones visibles) con entrada a mapa para elegir punto seguro o personalizado.
  - Paso 2: fecha y hora.
  - Paso 3: importe final y preferencia de pago.
  - En paso 2, usar componentes de DS reutilizables:
    - `CalendarPicker` para día.
    - `Select` para hora con `dropdownDirection="up"` dentro de overlay móvil.
    - `MeetupProposalHeader` para cabecera superior del wizard (paso actual + progreso + cierre).
    - `MeetupWizardStepHeading` para cabecera de pasos con navegación hacia atrás.
    - `MeetupProposalFooter` para contexto + CTA fijo en la parte inferior del wizard.
- Reglas de avance del wizard:
  - Los pasos futuros se bloquean hasta completar validaciones de pasos previos.
  - El feedback de error se renderiza dentro del overlay.
  - El mensaje global de validacion es: `Faltan campos por rellenar`.
  - Cada campo/seccion incompleta muestra mensaje inferior especifico.
  - Los CTA de paso (`Siguiente` / `Enviar propuesta`) no se deshabilitan por falta de campos; validan al pulsar.
  - En paso 1 siempre hay 2 opciones seleccionables visibles.
  - La lista de paso 1 funciona como cola de las 2 ultimas selecciones.
  - Al seleccionar un punto nuevo desde mapa, se inserta arriba y desplaza el anterior a segunda posicion.
  - Al pulsar la opcion inferior no desaparece la superior; solo cambia el estado seleccionado.
- CTA final de confirmacion: `Enviar propuesta`.
- En el footer del wizard no se muestra boton `Cancelar`; el cierre se realiza con boton `X` en cabecera.
- En movil, footer de wizard en una sola fila: contexto de articulo/comprador + CTA principal.

Estados:
- `PROPOSED` al enviar.
- Error de validación si faltan campos.
- En UI de chat, `PROPOSED` se muestra como label `pendiente`.

## 2. Revisión de propuesta (comprador)
Contenido:
- Resumen en tarjeta.
- CTAs:
  - `Aceptar` usando `Button.variant=primary`.
  - `Contraofertar` usando `Button.variant=inline_action`.

Estados:
- `CONFIRMED` al aceptar.
- `COUNTER_PROPOSED` al contraofertar.

Patron adicional (edicion pre-confirmacion por vendedor):
- Si la propuesta esta en `PROPOSED`, vendedor puede usar `Editar` para corregir datos sin cambiar de estado.
- Si esta en `COUNTER_PROPOSED`, vendedor puede editar y reenviar propuesta.
- Una vez `CONFIRMED`, no se permite editar desde card.

## 3. Línea temporal de estado
Estados soportados:
- `PROPOSED`
- `COUNTER_PROPOSED`
- `CONFIRMED`
- `ARRIVED`
- `COMPLETED`
- `EXPIRED`
- `CANCELLED`

Etiquetas visibles en UI (español, minusculas):
- `pendiente`
- `contraoferta`
- `confirmada`
- `llegada`
- `completada`
- `expirada`
- `cancelada`

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

## Referencias implementadas (2026-02-21)
- Workspace de chat con entrada de propuesta desde composer + overlay: `src/components/meetup/wallapop-chat-workspace.tsx`.
- Mapa interactivo de seleccion de ubicacion: `src/components/meetup/meetup-location-map.tsx`.
- Reglas de elegibilidad de entrada desde chat: `src/components/meetup/chat-meetup-entry-rules.ts`.
- Simulador interactivo de flujo: `src/components/meetup/meetup-simulator.tsx`.
- Timeline reusable de estados: `src/components/meetup/meetup-timeline.tsx`.
- Tarjeta contextual de acciones: `src/components/meetup/meetup-card.tsx`.
- Banner del dia con variante de ventana: `src/components/meetup/meetup-day-banner.tsx`.
- Sidebar derecho desktop con contexto de contraparte + producto:
  - `src/components/ui/chat-counterpart-card.tsx`
  - `src/components/ui/chat-product-card.tsx`
  - `src/components/meetup/wallapop-chat-workspace.tsx`
- Stories de validacion visual:
  - `src/components/meetup/chat-meetup-entry.stories.tsx`
  - `src/components/meetup/meetup-simulator.stories.tsx`
  - `src/components/meetup/meetup-timeline.stories.tsx`
  - `src/components/meetup/meetup-card.stories.tsx`
  - `src/components/meetup/meetup-day-banner.stories.tsx`
  - `src/components/meetup/meetup-location-map.stories.tsx`
  - `src/components/ui/chat-counterpart-card.stories.tsx`
  - `src/components/ui/chat-product-card.stories.tsx`

Notas de UI del workspace (2026-02-21):
- Header de `InboxPane`: sin boton `burguer_menu`.
- Header de `ConversationPane`: avatar circular del comprador + boton `ellipsis_horizontal` alineado a la derecha (placeholder sin accion funcional por ahora).
- Indicador de entrega en `ChatMessageBubble` y `ChatListItem` unificado con `WallapopIcon.name=double_check`.
- Contenedor principal del workspace en desktop con ancho fluido completo (sin `max-w`), para ocupar todo el viewport horizontal y eliminar margenes laterales.
- En desktop `lg+` el chat usa 3 columnas: inbox, conversacion y sidebar contextual.
- El sidebar contextual agrupa 2 cards verticales:
  - Card de contraparte (nombre, rating, distancia, ubicacion, avatar).
  - Card de producto con variante por rol (`seller`/`buyer`).
- Regla por rol en card de producto:
  - `seller`: lapiz, `Reservar`, `Vendido`, metricas de visitas/likes.
  - `buyer`: sin lapiz, sin CTAs comerciales y sin metricas.
- Estado comercial en items del buzon reutilizando componentes documentados:
  - `Chat List Item With Bookmark` para reservado (`leadingIndicator="bookmark"`).
  - `Chat List Item With Deal` para vendido (`leadingIndicator="deal"`).
  - Colores oficiales de icono/acento por estado:
    - `Reservado`: `#86418A`.
    - `Vendido`: `#D32069`.
- Mock del buzon extendido con conversaciones realistas e imagen de articulo por cada chat.
- En `InboxPane`, la miniatura de cada fila corresponde al articulo (`listingImageSrc`), no al avatar de perfil.
- Overlay de propuesta (actualizado 2026-02-21):
  - Paso 1 con 2 cards visibles (seguras y/o personalizadas) y truncado defensivo de textos largos.
  - Punto personalizado representado con icono de puntero; punto seguro con icono de escudo.
  - Cards seleccionables de paso 1 y paso 3 con indicador visual `selected/unselected` en el lateral derecho:
    - `unselected`: aro fino con centro blanco.
    - `selected`: aro oscuro grueso tipo donut con centro blanco reducido.
  - Vista de mapa con buscador visual (icono lupa + placeholder), seleccion por marcador y por tap libre.
  - Bottom sheet de mapa siempre en una linea para distancia (`m/km`) y con prioridad de capa sobre teselas.
  - Controles `+/-` de zoom ocultos en mapa del wizard (zoom por gesto).
  - Paso 2 actualizado (2026-02-22):
    - Label `Dia` en la parte superior del calendario para consistencia con `Hora`.
    - Calendario compacto y reutilizable (`src/components/ui/calendar-picker.tsx`).
    - Dia seleccionado con mayor contraste en verde Wallapop.
    - Selector de hora con panel de altura fija y scroll interno para no forzar scroll de pantalla, con franjas de 15 minutos.
    - Error visual/tokenizado consistente con `Input` (`tokens.color.input.ring.error`, 2px).
  - Paso 3 actualizado (2026-02-22):
    - Importe final con `Input`.
    - Moneda mostrada en UI con simbolo `€`.
    - Validacion de importe con limite maximo `99999 €` y hasta `2` decimales.
    - Si el importe supera `2000 €`, se muestra alerta destacada (estilo warning) sobre DAC7 + link `Más información` a ayuda Wallapop.
    - Metodos de pago en cards seleccionables con iconografia.
    - En error de metodo, cada card se marca en rojo de forma independiente (sin borde global envolvente).

Notas de UI del workspace (actualizado 2026-02-22):
- `MeetupCard` con patron de mensaje de sistema y titulo `Propuesta de quedada`.
- En hilo de chat con actor `SELLER`, la card se alinea a la derecha.
- Estado mostrado en label traducida (minusculas) con color semantico por estado.
- Bloque de datos en 3 filas con iconos: calendario, ubicacion y billete.
- Formato de contenido en filas:
  - Calendario: `dia \u00B7 hora`.
  - Pago: `metodo \u00B7 precio`.
- Boton de accion critica en card: `Cancelar` (sin sufijo adicional).
- Miniatura superior con render real de mapa y sin texto superpuesto.
- La miniatura oculta controles de zoom `+/-`.
- Tap en miniatura abre modal de mapa en grande, solo lectura:
  - Sin buscador.
  - Sin seleccion de punto.
  - Con boton `X` de cierre.
