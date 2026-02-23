# Componentes v1 - Wallapop Meet

## Objetivo
Definir la API visual mínima de componentes para implementar los flujos de Wallapop Meet con consistencia.

## 1. Botón (`Button`)
Propiedades visuales:
- `variant`: `primary | nav_expandable | tab | inline_action | icon | menu_close`
- `size`: `sm | md | lg | tab`
- `state`: `default | hover | pressed | focused | disabled | loading`
- `icon`: `none | leading | trailing | only`

Tokens base:
- `primary`:
  - Fondo: `tokens.color.button.primary.background`
  - Texto: `tokens.color.button.primary.text`
  - Radio: `tokens.radius.button.pill`
  - Tipografia: `tokens.typography.button.primary`
- `nav_expandable`:
  - Fondo: `tokens.color.button.nav.background`
  - Texto: `tokens.color.button.nav.text`
  - Radio: `tokens.radius.none`
  - Tipografia: `tokens.typography.button.nav`
- `tab`:
  - Fondo: `tokens.color.button.tab.background`
  - Texto: `tokens.color.button.tab.text`
  - Fondo (`selected`): `tokens.color.button.tab.background_selected`
  - Texto (`selected`): `tokens.color.button.tab.text_selected`
  - Texto (`disabled`): `tokens.color.button.tab.text_disabled`
  - Radio: `tokens.radius.button.pill`
  - Tipografia: `tokens.typography.button.tab`
- `inline_action`:
  - Fondo: `tokens.color.button.inline_action.background`
  - Texto: `tokens.color.button.inline_action.text`
  - Radio: `tokens.radius.button.inline_pill`
  - Tipografia: `tokens.typography.button.inline_action`
- `icon`:
  - Fondo: `tokens.color.button.icon.background`
  - Icono: `tokens.color.button.icon.foreground`
  - Radio: `tokens.radius.button.circular`
  - Sombra: `tokens.shadow.button.icon`
- `menu_close`:
  - Fondo: `tokens.color.button.menu_close.background`
  - Icono: `tokens.color.button.menu_close.foreground`
  - Radio: `tokens.radius.button.menu_close`

Reglas:
- Variantes definidas desde captura oficial de `https://es.wallapop.com/app/chat` (2026-02-18).
- `loading` mantiene ancho para evitar cambios de layout.
- `icon` y `menu_close` requieren `aria-label` obligatorio.
- En móvil, cualquier acción crítica mantiene área táctil mínima de `44x44` aunque el icono visual sea menor.

## 2. Campo de entrada (`Input`)
Propiedades visuales:
- `type`: `text | number | date | time`
- `state`: `default | hover | focused | filled | error | success | disabled`
- `helper`: `none | hint | error`
- `label`: `floating | hidden`
- `counter`: `visible | hidden` (cuando existe `maxLength`)

Tokens base:
- Texto input: `tokens.color.input.text`
- Label/subtext/counter: `tokens.color.input.label`
- Placeholder en foco: `tokens.color.input.placeholder_focus`
- Ring default: `tokens.color.input.ring.default`
- Ring hover/focus: `tokens.color.input.ring.hover`
- Ring error: `tokens.color.input.ring.error`
- Ring success: `tokens.color.input.ring.success`
- Opacidad disabled: `tokens.opacity.input_disabled`
- Radio: `tokens.radius.300`
- Padding base: `components.input.padding_y_default` + `components.input.padding_x`
- Padding compacto (`filled/focused`): `components.input.padding_y_compact` + `components.input.padding_x`

Reglas:
- Basado en captura oficial de `https://es.wallapop.com/app/catalog/upload/consumer-goods` (2026-02-18).
- Usar `box-shadow inset` para representar borde/ring; no usar `border` físico.
- `label` flotante: tamaño `16px/24px` en `default`, `14px/20px` en `filled/focused`.
- Mostrar ayuda/error siempre debajo del campo, nunca en placeholder.
- Si existe `error`, prevalece sobre `hint`.
- `counter` se muestra con formato `actual/max` cuando existe `maxLength`.
- En estado `error`, mostrar indicador visual a la derecha (`error-indicator`) con exclamacion sobre fondo rojo.

## 3. Selector (`Select`)
Propiedades visuales:
- `state`: `default | focused | error | disabled`
- `size`: `md | lg`
- `dropdownDirection`: `down | up`
- `maxVisibleOptions`: número de opciones visibles antes de scroll

Reglas:
- Debe soportar lista de puntos de encuentro sugeridos.
- Altura táctil mínima de 44 px.
- El panel del dropdown debe tener altura fija y scroll interno para listas largas.
- En overlays móviles, permitir desplegar hacia arriba (`dropdownDirection=up`) para no ocultar opciones fuera de viewport.

## Matriz de estados (fase inicial)

### `Button`
| Estado | Qué cambia visualmente | Comportamiento |
| --- | --- | --- |
| `default` | Según `variant` real (`primary`, `nav_expandable`, `tab`, `inline_action`, `icon`, `menu_close`) | Acción disponible |
| `hover` | Ajuste de color/fondo sin alterar dimensiones | Solo feedback visual |
| `pressed` | Ajuste de contraste o elevación según variante | Mantiene semántica de la variante |
| `focused` | `focus ring` visible con `tokens.color.border.focus` | Navegación por teclado accesible |
| `disabled` | Opacidad reducida + cursor no interactivo | No dispara `onClick` |
| `loading` | Spinner + texto de carga; ancho estable | Bloquea interacción temporalmente |

### `Input`
| Estado | Qué cambia visualmente | Comportamiento |
| --- | --- | --- |
| `default` | Ring `1px inset` en `tokens.color.input.ring.default`, label `16px/24px` | Entrada editable |
| `hover` | Ring `2px inset` en `tokens.color.input.ring.hover` | Solo feedback visual |
| `focused` | Ring `2px inset` en `tokens.color.input.ring.hover`, padding compacto, label flotante compacta | Foco visible y edición activa |
| `filled` | Mantiene label compacta (`14px/20px`) y padding compacto | Conserva jerarquía label/valor |
| `error` | Ring `2px inset` en `tokens.color.input.ring.error`, label y helper en error | `aria-invalid=true` |
| `success` | Ring `2px inset` en `tokens.color.input.ring.success`, helper en success | Confirmación visual de validez |
| `disabled` | Opacidad `tokens.opacity.input_disabled`, sin hover interactivo | No editable |

Notas:
- `helper` siempre bajo el campo (`hint` o `error`), nunca en placeholder.
- Si existe `error`, prevalece sobre `hint`.

### `Select`
| Estado | Qué cambia visualmente | Comportamiento |
| --- | --- | --- |
| `default` | Borde `tokens.color.border.default` + icono de desplegable | Selección disponible |
| `focused` | `focus ring` + borde `tokens.color.border.focus` | Navegable por teclado |
| `error` | Borde `2px` en `tokens.color.input.ring.error` + mensaje de error | `aria-invalid=true` |
| `disabled` | Opacidad reducida + cursor no interactivo | No se puede abrir |

Notas:
- Tamaños soportados: `md` (44 px) y `lg` (48 px).
- Debe aceptar opciones de puntos de encuentro sugeridos.
- Cuando la lista supere `maxVisibleOptions`, usar scroll interno sin desplazar layout general.

## 4. Chip / Etiqueta (`Chip/Tag`)
Propiedades visuales:
- `variant`: `neutral | success | warning | error | info`
- `state`: `default | selected | disabled`

Uso:
- Mostrar estado de meetup y filtros rápidos de propuestas.

## 5. Tarjeta (`Card`)
Propiedades visuales:
- `variant`: `base | elevated | outlined | interactive`
- `state`: `default | pressed | focused`

Uso:
- Tarjeta principal de meetup confirmado.
- Resumen de propuesta y contraoferta.

## 6. Banner
Propiedades visuales:
- `variant`: `info | success | warning | error | meetup_day`
- `dismissible`: `true | false`

Uso:
- Banner persistente del día del meetup.
- Alertas de ventana de llegada y expiración.

## 7. Mensaje emergente (`Toast`)
Propiedades visuales:
- `variant`: `neutral | success | warning | error`
- `duration`: `short | medium | long`

Reglas:
- No usar para errores bloqueantes.
- Mostrar un solo `toast` a la vez.

## 8. Modal
Propiedades visuales:
- `variant`: `confirmation | destructive | form`
- `size`: `sm | md | lg`

Uso:
- Confirmar cancelación.
- Confirmar resultado post meetup.

## 9. Elemento de lista (`List Item`)
Propiedades visuales:
- `variant`: `default | selectable | navigable`
- `state`: `default | pressed | selected | disabled`

Uso:
- Listado de ubicaciones sugeridas por mapa.
- Historial de propuestas de fecha/hora.

## 10. Insignia (`Badge`)
Propiedades visuales:
- `variant`: `success | error | warning | info | neutral`

Uso:
- Estado compacto en chat o línea temporal.

## 11. Iconografia (`WallapopIcon`)
Propiedades visuales:
- `name`: naming Wallapop (`arrow_left`, `cross`, `chevron_right`, `shield`, `paper_plane`, etc.)
- `size`: `small | medium | large`
- `state`: `default | disabled`

Reglas:
- Fuente de verdad de nombres: `docs/elements/icons.md`.
- El wrapper de implementacion en app es `src/components/ui/wallapop-icon.tsx`.
- Mientras no exista libreria publica oficial, mapear a iconos equivalentes en `lucide-react` manteniendo naming Wallapop en la API.
- En movil, mantener escala `16px` (`small`) y `24px` (`medium`) con area tactil minima de `44x44` en controles accionables.
- Para estado de entrega de mensajes, `double_check` debe verse compacto y de bajo protagonismo visual frente al texto/hora.
- Para acciones contextuales de conversacion, usar `ellipsis_horizontal` en cabecera de `ConversationPane` y evitar su uso en preview de lista.

## 12. Navegacion inferior de inbox (`InboxBottomNav`)
Propiedades visuales:
- `items`: lista de 5 acciones de primer nivel (`Inicio`, `Favoritos`, `Vender`, `Buzon`, `Tu`)
- `activeItemId`: item activo (`aria-current="page"`)
- `badgeCount`: opcional por item para notificaciones no leidas
- `state`: `default | active | focused`

Reglas:
- Altura visual objetivo similar a runtime movil de Wallapop Chat (footer fijo con borde superior).
- Cada accion mantiene layout vertical (icono arriba, etiqueta abajo).
- En `active`, usar mayor contraste de color y peso tipografico en etiqueta.
- Todos los items usan el mismo ancho, altura y separacion horizontal para evitar solapamientos.
- En etiquetas de item, garantizar legibilidad sin corte de texto en viewport movil de referencia.
- Todos los items deben ser navegables por teclado y exponer nombre accesible.

## 13. Linea temporal de meetup (`MeetupTimeline`)
Propiedades visuales:
- `currentStatus`: `null | PROPOSED | COUNTER_PROPOSED | CONFIRMED | ARRIVED | COMPLETED | EXPIRED | CANCELLED`

Reglas:
- Debe mantener orden fijo de estados para facilitar lectura del progreso.
- En estado `null`, todos los pasos se muestran como pendientes.
- Estado actual resaltado visualmente.
- Estados anteriores al actual se muestran como completados.
- Estados finales (`COMPLETED`, `EXPIRED`, `CANCELLED`) deben comunicarse tambien con texto, no solo color.

## 14. Simulador de flujo (`MeetupSimulator`)
Propiedades visuales:
- Composicion de `Button`, `MeetupTimeline` y bloque de contexto temporal.
- Selector de rol activo (`SELLER` / `BUYER`) con `Button.variant=tab`.
- Acciones contextuales segun estado y reglas de negocio.

Reglas:
- Debe exponer errores de transicion para QA funcional.
- Debe permitir simular hora para validar ventana de llegada (`-15m` a `+2h`).
- Se considera herramienta de validacion interna, no UI final de produccion.

## 15. Tarjeta de meetup (`MeetupCard`)
Propiedades visuales:
- `meetup`: estado actual de la entidad.
- `actorRole`: `SELLER | BUYER`.
- `currentTime`: hora de referencia para reglas temporales.
- `onMeetupChange`: callback de transicion valida.
- `onError`: callback de error de transicion.
- `onEditProposal`: callback para reabrir el wizard en modo edicion.
- `onOpenMapPreview`: callback para abrir previsualizacion de mapa en grande.

Reglas:
- Debe renderizar acciones contextuales por estado de negocio y por rol visible en chat.
- En `SELLER`, la card se alinea en el lado derecho del hilo cuando existe propuesta activa.
- En `BUYER`, la card se alinea en el lado izquierdo del hilo cuando recibe una propuesta en `PROPOSED`.
- Titulo fijo en card para todos los estados: `Quedada con <counterpartName>`.
- Debe mostrar label de estado traducida en minusculas:
  - `PROPOSED` -> `pendiente`
  - `COUNTER_PROPOSED` -> `contraoferta`
  - `CONFIRMED` -> `confirmada`
  - `ARRIVED` -> `llegada`
  - `COMPLETED` -> `completada`
  - `EXPIRED` -> `expirada`
  - `CANCELLED` -> `cancelada`
- Colores de label por estado:
  - `pendiente`: blanco/neutro
  - `contraoferta`: warning
  - `confirmada`: success
  - `llegada`: info
  - `completada`: acento de vendido (`#D32069`)
  - `expirada`: neutral
  - `cancelada`: error
- El bloque informativo de la propuesta debe renderizar exactamente 3 filas con icono a la izquierda:
  - Calendario: dia y hora.
  - Mapa: direccion.
  - Billete: metodo de pago y precio.
- El copy de la accion critica en card debe usar sufijo de contexto: `Cancelar quedada` o `Rechazar quedada`.
- El separador visual de las filas de contenido usa `\u00B7`:
  - `dia \u00B7 hora`
  - `metodo \u00B7 precio`
- La miniatura superior debe ser un render real de mapa, sin texto superpuesto.
- La miniatura superior debe ocultar controles de zoom `+/-`.
- Tap en miniatura abre modal de mapa en grande, solo lectura, con cierre por `X`.
- `I'm here` solo habilitado en `CONFIRMED` y ventana valida (`-15m`, `+2h`).
- Debe comunicar motivo de deshabilitado fuera de ventana.
- Debe permitir `Editar` para `SELLER` en `PROPOSED` y `COUNTER_PROPOSED`.
- En propuesta recibida por comprador (`BUYER` + `PROPOSED`) debe mostrar 3 acciones:
  - `Aceptar`
  - `Rechazar quedada`
  - `Proponer cambios`
- Tipologia de botones en `MeetupCard`:
  - `principal`: accion primaria del estado (`Aceptar`, `I'm here`, `Confirmar venta`, etc.).
  - `outline`: accion secundaria de continuidad (`Editar`, `Proponer cambios`, `Anadir a Calendar`, `Reenviar propuesta`).
  - `texto`: accion destructiva suave (`Cancelar quedada`, `Rechazar quedada`).
- Tipografia de botones en `MeetupCard`:
  - Todos los botones de accion (`principal`, `outline`, `texto`) usan `16px`.
- Hora de envio en card:
  - Se muestra en esquina inferior derecha.
  - Debe quedar alineada verticalmente con el ultimo elemento visible de la card.
  - No debe crear un bloque extra de espacio en blanco al final del componente.

## 16. Banner del dia (`MeetupDayBanner`)
Propiedades visuales:
- `meetup`: estado actual del meetup.
- `currentTime`: hora de referencia.
- `onNavigate`: accion a vista de detalle.
- `onMarkArrived`: accion directa de llegada.

Reglas:
- Variantes visuales: `default | arrival_window | expired`.
- En `arrival_window`, mostrar CTA `I'm here`.
- En `expired`, priorizar feedback de estado final y ocultar CTA incompatibles.

## 17. Composer de chat (`ChatComposer`)
Propiedades visuales:
- `onSubmit`: envio de mensaje.
- `submitLabel` / `submitAriaLabel`: accesibilidad del boton de envio.
- `secondaryActionLabel`: etiqueta accesible para accion secundaria.
- `secondaryActionAriaLabel`: alternativa accesible.
- `secondaryActionIconName`: icono de accion secundaria (`WallapopIconName`).
- `onSecondaryAction`: apertura de flujo contextual (meetup).
- `secondaryActionDisabled`: bloqueo de accion secundaria.

Reglas:
- El footer usa padding simetrico para mantener equilibrio visual entre botones izquierdo/derecho.
- El boton de envio y el secundario son circulares y mantienen area tactil minima de `40x40` (`sm`) y `44x44` (movil).
- La accion secundaria se usa para iniciar `Proponer quedar` sin ocupar ancho con texto.
- En workspace de meetup, la accion secundaria se ubica a la derecha, justo antes de `paper_plane`.
- El icono por defecto para esta accion en meetup es `calendar`.
- La accion secundaria debe ocultarse cuando el actor no es `SELLER`; para `BUYER` solo se renderiza el boton de envio.

## 18. Banner de seguridad de chat (`ChatSecurityBanner`)
Propiedades visuales:
- `message`: mensaje principal.
- `linkText`: accion secundaria contextual.
- `onLinkClick`: callback opcional.
- `showIcon`: muestra/oculta escudo.

Reglas:
- Debe mostrarse fijo sobre el composer en el chat workspace.
- En footer fijo se usa variante compacta (menos alto) para no desplazar demasiado los mensajes.
- No reemplaza errores bloqueantes ni toast; es aviso contextual persistente.

## 19. Mapa de ubicacion de meetup (`MeetupLocationMap`)
Propiedades visuales:
- `center`: centro actual del mapa (`lat`, `lng`).
- `safePoints`: puntos seguros sugeridos.
- `selectedPointId`: punto seleccionado.
- `selectedCustomPoint`: marcador de seleccion manual.
- `onMapClick`: callback al pulsar en mapa.
- `onSafePointClick`: callback al pulsar en marcador seguro.

Reglas:
- Implementado con `react-leaflet` + teselas OpenStreetMap.
- Debe permitir seleccionar ubicacion custom con click en mapa.
- Debe mostrar marcadores de puntos seguros en azul Wallapop.
- Al seleccionar un punto seguro, mostrar tooltip persistente con formato `<nombre> - Punto seguro`.
- Debe poder convivir dentro de un overlay con alto maximo y scroll interno sin desbordar viewport.
- En contexto del wizard movil, ocultar controles de zoom `+/-` y mantener zoom por gesto tactil.

## 20. Overlay de propuesta meetup (`MeetupProposalOverlay`)
Propiedades visuales:
- `step`: `1 | 2 | 3`
- `selectedOptionId`: opcion actualmente seleccionada para propuesta.
- `selectableOptions`: cola visual de 2 opciones seleccionables en paso 1.
- `mapPickerOpen`: estado de vista de mapa para seleccion.
- `errorMessage`: validacion contextual del wizard.

Reglas:
- Wizard en 3 pasos: punto, fecha/hora, preferencia de pago.
- Paso 1 siempre muestra exactamente 2 opciones seleccionables.
- El modelo de paso 1 es una cola de las 2 ultimas selecciones:
  - Una seleccion nueva entra en primera posicion.
  - La anterior pasa a segunda posicion.
  - Si habia una tercera, se descarta.
- Las cards de punto seguro muestran:
  - Nombre
  - Direccion
  - Labels `Punto seguro` y `<N> ventas`.
- Las cards de punto personalizado muestran:
  - Icono `map pin`
  - Direccion seleccionada
  - Label `Personalizado`.
- No existe boton `Cancelar` en el footer del wizard; cierre mediante boton `X` de cabecera.
- Footer del wizard en movil:
  - Bloque contextual de articulo/comprador alineado a la izquierda.
  - CTA principal (`Siguiente` o `Enviar propuesta`) alineado a la derecha.
  - Texto de articulo truncado con elipsis para no desplazar la CTA.
- Validaciones del wizard:
  - El CTA no se deshabilita por campos incompletos.
  - Mensaje global unificado: `Faltan campos por rellenar`.
  - Cada bloque incompleto debe mostrar helper/error debajo del propio componente o grupo.
  - El estado de error debe usar mismo color y grosor que `Input` (`tokens.color.input.ring.error`, `2px`).
  - En paso 3, el importe admite hasta `99999 €` con maximo `2` decimales.
  - En paso 3, si el importe supera `2000 €`, mostrar alerta destacada de normativa DAC7 con enlace de ayuda (`Más información`).
- En vista de mapa:
  - Permitir seleccion de punto seguro y punto personalizado (tap libre sobre mapa).
  - Al seleccionar personalizado, mostrar aviso de punto no verificado.
  - Mostrar distancia `m/km` en chip de una sola linea (`no-wrap`).
  - Bottom sheet de seleccion debe renderizarse por encima del mapa (`z-index` superior).

## 21. Card de contraparte en chat (`ChatCounterpartCard`)
Propiedades visuales:
- `name`: nombre del usuario contraparte.
- `rating`: puntuacion en estrellas (soporta media estrella).
- `distanceLabel`: texto de distancia relativa (`N km de ti`).
- `locationLabel`: texto de ubicacion o estado (`Desconocido`).
- `profileImageSrc`: avatar circular opcional.

Reglas:
- Uso previsto en desktop dentro del sidebar derecho del workspace de chat.
- Debe mantener jerarquia de lectura: nombre > rating > distancia/ubicacion.
- El nombre comparte tamaño base con metadatos y se diferencia por peso tipografico.

## 22. Card de producto en chat (`ChatProductCard`)
Propiedades visuales:
- `viewerRole`: `seller | buyer`.
- `imageSrc`, `title`, `price`.
- `viewsCount`, `likesCount` (solo `seller`).
- `statusLabel` (solo `buyer`).
- `onEdit`, `onReserve`, `onSold` (acciones solo `seller`).

Reglas:
- `seller`: mostrar lapiz sobre imagen, CTAs de publicacion y metricas (ojo/corazon) junto al precio.
- `buyer`: ocultar lapiz, ocultar CTAs y ocultar metricas de publicacion.
- Debe ser reutilizable en la columna lateral desktop del chat.
- Color de acciones comerciales:
  - `Reservar`: `tokens.color.card.action.reserve` (`#86418A`).
  - `Vendido`: `tokens.color.card.action.sold` (`#D32069`).
- Badge de estado comercial en modo `buyer`:
  - `Reservado`: icono/texto en `tokens.color.list_item.leading_indicator.reserved` (`#86418A`).
  - `Vendido`: icono/texto en `tokens.color.list_item.leading_indicator.sold` (`#D32069`).

## 23. Selector de calendario (`CalendarPicker`)
Propiedades visuales:
- `monthDate`: mes visible actual.
- `selectedDateValue`: fecha seleccionada en formato local (`YYYY-MM-DD`).
- `minDateValue`: fecha mínima seleccionable.
- `onMonthChange`: navegación de mes.
- `onSelectDate`: selección de día.
- `state`: `default | error`.
- `error`: texto de ayuda/error inferior opcional.

Reglas:
- Grid fijo de 6 semanas (42 celdas) para evitar saltos de layout entre meses.
- Días fuera del mes visible se muestran con menor contraste.
- Días bloqueados por fecha mínima deben estar deshabilitados visual y semánticamente.
- Día seleccionado usa borde oscuro + texto oscuro (sin fondo de acción principal).
- Flechas de navegación izquierda/derecha deben compartir el mismo lenguaje visual (`chevron`).
- En `error`, usar borde `2px` en `tokens.color.input.ring.error` y helper inferior en el mismo color.

## 24. Cabecera de paso de wizard (`MeetupWizardStepHeading`)
Propiedades visuales:
- `caption`: texto contextual de paso.
- `title`: título opcional del bloque.
- `onBack`: acción de volver.

Reglas:
- Botón de vuelta circular con iconografía `arrow_left`.
- `caption` siempre visible para contexto, incluso si no existe título.
- Si `title` existe, usar jerarquía tipográfica de encabezado de paso (`20/22`).

## 25. Footer de propuesta (`MeetupProposalFooter`)
Propiedades visuales:
- `listingImageSrc`, `itemTitle`, `userName`: contexto de la propuesta.
- `actionLabel`: etiqueta de CTA final.
- `actionDisabled`: estado deshabilitado.
- `actionTextTone`: `dark | light` para ajustar contraste del CTA.
- `onAction`: callback de CTA.

Reglas:
- Layout de 2 zonas: contexto de ítem/comprador (izquierda) + CTA (derecha).
- Debe truncar textos largos sin desplazar la CTA.
- En estado deshabilitado, CTA mantiene fondo gris y texto oscuro.

## 26. Cabecera de propuesta (`MeetupProposalHeader`)
Propiedades visuales:
- `currentStep`: paso actual.
- `totalSteps`: total de pasos del wizard.
- `steps`: metadatos de cada paso (`id`, `label`, `disabled`).
- `onClose`: cierre de overlay.
- `onStepChange`: navegación por paso.
- `helpLabel`: texto de ayuda contextual.

Reglas:
- Estructura en 2 bloques: fila superior (cerrar, título, ayuda) + barra de progreso clicable.
- La barra de progreso debe reflejar estado activo/inactivo por paso.
- Los pasos bloqueados deben deshabilitar interacción manteniendo señal visual.

## Criterio de completitud
- Cada componente define propiedades, estados, tokens y regla de uso.
- No hay ambigüedad entre uso de `badge`, `chip`, `banner` y `toast`.

---

## Addendum v2 (2026-02-23) - Componentes y contratos para flujo completo por rol

Si hay conflicto con especificaciones anteriores de este documento, prevalece este addendum v2.

## A. Ajustes de contrato en `MeetupCard`

Reglas funcionales actualizadas:
- El CTA manual `Expirar meetup` queda fuera del contrato UI.
- `EXPIRE` se considera cierre automatico del sistema y no se renderiza como accion del usuario.
- En `CONFIRMED`, ambos roles muestran:
  - `I'm here` (segun ventana de llegada).
  - `Anadir a Calendar` (fuera de ventana).
  - `Cancelar quedada`.
- En `ARRIVED`, `COMPLETE` (`Confirmar venta`) solo para `SELLER`.

Estados y disponibilidad:
- `I'm here`: solo dentro de `-15 min` a `+2 h`.
- `Cancelar quedada`: permitido siempre en estados no terminales, con comportamiento especial en zona roja.

## B. Nuevo patron de accion de retraso (`LATE_NOTICE`)

Componente recomendado:
- Reusar `Button.variant=inline_action` para activar selector rapido.
- Usar `Modal.variant=confirmation` o `List Item.selectable` en bottom sheet para seleccionar ETA.

API funcional esperada:
- Evento de dominio: `LATE_NOTICE`.
- Payload: `etaMinutes: 10 | 20`.
- Efecto en UI:
  - No cambia estado de meetup.
  - Muestra confirmacion local y dispara notificacion a contraparte.

Estado actual:
- El patron `LATE_NOTICE` no esta expuesto como CTA en la UI actual.
- Si se retoma en una version futura, debe documentarse en un addendum nuevo.

## C. Modal de cancelacion en zona roja (`< 30 min`)

Componente:
- `Modal.variant=destructive`.
- `size=md`.

Props minimas:
- `isRedZone: boolean`
- `minutesToMeetup: number`
- `onConfirmCancel`

Comportamiento:
- Fuera de zona roja: confirmacion de cancelacion estandar.
- En zona roja:
  - Mensaje de impacto en fiabilidad.
  - Confirmacion explicita para continuar con cancelacion.

Copy base en zona roja:
- Titulo: `Faltan menos de 30 min para la quedada`.
- Cuerpo: `Cancelar ahora afectara a tu fiabilidad.`
- CTA primario: `Cerrar`
- CTA critico: `Cancelar igualmente`

## D. Feedback visual de fiabilidad

Objetivo:
- Comunicar impacto reputacional sin lenguaje punitivo.

Componente sugerido:
- `Banner.variant=warning` en modal/confirmacion de cancelacion en zona roja.
- `Chip/Tag.variant=info` o `Badge.neutral` para representar indicador de asistencia en perfil.

Contrato de contenido:
- Mostrar mensaje orientado a transparencia:
  - `Tu porcentaje de asistencia ayuda a generar confianza en futuras quedadas.`
- Evitar copy de castigo directo.

## E. Metadata funcional requerida (para siguiente fase de implementacion)

Aunque esta iteracion es documental, se fija el contrato que debera soportar el dominio:
- Check-in por rol:
  - timestamp por actor (`SELLER`/`BUYER`).
  - resultado de geovalidacion.
  - distancia al punto acordado.
- Resolucion no-show:
  - actor reportante.
  - actor ausente inferido.
  - fuente de evidencia.
- Impacto de fiabilidad:
  - indicador de cancelacion en zona roja.
  - fecha/hora del evento reputacional.

## F. Escenarios de QA vinculados a componentes

Los siguientes escenarios deben tener story de estado o caso de prueba visual:
1. `MeetupCard` en `CONFIRMED` sin CTA de expirar.
2. `MeetupCard` en `CONFIRMED` con `Anadir a Calendar` fuera de ventana.
3. Modal de cancelacion fuera de zona roja.
4. Modal de cancelacion en zona roja con warning de fiabilidad.
5. `MeetupCard` con `Cancelar quedada` en estilo texto.
6. `MeetupCard` en `ARRIVED` con `Confirmar venta` solo para `SELLER`.

---

## Addendum v3 (2026-02-23) - API visual implementada

Si hay conflicto entre addendum v2 y v3, prevalece v3.

## A. `MeetupCard` (contrato vigente)

Ajustes de props:
- Añadido `counterpartName?: string` para titulado contextual tras confirmacion.

Titulos:
- Todos los estados:
  - `Quedada con <counterpartName>`.

Acciones en `CONFIRMED`:
- Dentro de ventana `-30 min` a `+2 h`: `I'm here` + `Cancelar quedada`.
- Fuera de ventana: `Anadir a Calendar` + `Cancelar quedada`.
- `Anadir a Calendar` genera descarga local de archivo `.ics`.

Tipologia de botones en `MeetupCard`:
- `principal`: accion principal del estado.
- `outline`: accion secundaria no destructiva.
- `texto`: accion destructiva suave.
- Tamano tipografico unificado en acciones: `16px`.

Hora en card:
- Hora de envio visible en esquina inferior derecha.
- Debe quedar alineada con el ultimo elemento visible de la card.
- No se reserva un bloque de altura adicional solo para la hora.

Etiqueta de estado:
- `COUNTER_PROPOSED` se muestra como `pendiente`.

Flujo de cambios comprador:
- `Proponer cambios` en propuesta recibida abre overlay de edicion (reusa `onEditProposal`).

## B. `ChatCounterpartCard` (contrato vigente)

Props actuales:
- `name: string`
- `rating: number`
- `ratingCount?: number`
- `distanceLabel: string`
- `attendanceRate?: number`
- `attendanceMeetups?: number`
- `profileImageSrc?: string`
- `profileImageAlt?: string`

Reglas de contenido:
- Rating:
  - Mostrar estrellas + `(<ratingCount>)` a la derecha cuando exista dato.
- Distancia:
  - Mantener `distanceLabel` en `14px`.
- Asistencia:
  - `>90`: `X% de asistencia (N)` en success.
  - `70-89`: `X% de asistencia (N)` en warning.
  - `<70`: ocultar porcentaje y mostrar `Baja asistencia a quedadas` en error.

Reglas de color:
- Solo usar colores/tokens ya existentes del sistema.
- Warning de asistencia media: `semantic.warning.base` (en implementacion actual: `#F4A000`).

## C. QA minimo actualizado

Casos que deben seguir cubiertos en story/test visual:
1. `MeetupCard` en `CONFIRMED` dentro de ventana (mensaje de proximidad + `I'm here`).
2. `MeetupCard` en `CONFIRMED` fuera de ventana (solo `Anadir a Calendar` + `Cancelar quedada`).
3. `MeetupCard` con titulo post-confirmacion `Quedada con <nombre>`.
4. `COUNTER_PROPOSED` renderizado como `pendiente`.
5. `ChatCounterpartCard` asistencia alta (`>90`).
6. `ChatCounterpartCard` asistencia media (`70-89`, warning).
7. `ChatCounterpartCard` asistencia baja (`<70`, mensaje rojo sin porcentaje).

## Inventarios de referencia (captura oficial)
- `docs/elements/buttons.md`
- `docs/elements/Input.md`
- `docs/elements/chat-list-item.md`
- `docs/elements/chat-message-bubble.md`
- `docs/elements/chat-security-banner.md`
- `docs/elements/chat-product-card.md`
- `docs/elements/chat-counterpart-card.md`
- `docs/elements/chat-composer.md`
- `docs/elements/badge.md`
- `docs/elements/icons.md`
- `docs/elements/inbox-bottom-nav.md`
- `docs/elements/meetup-proposal-overlay.md`
- `src/components/meetup/meetup-timeline.tsx`
- `src/components/meetup/meetup-simulator.tsx`
- `src/components/meetup/meetup-card.tsx`
- `src/components/meetup/meetup-day-banner.tsx`
- `src/components/meetup/meetup-location-map.tsx`
- `src/components/meetup/meetup-location-map.stories.tsx`

Notas:
- Fuente runtime de chat: `https://es.wallapop.com/app/chat`.
- Fecha de captura de los nuevos inventarios: `2026-02-19`.
- Cuando se actualice cualquier inventario de `docs/elements/`, revisar impacto en tokens (`styles.json`) antes de implementar componentes.
- Regla de implementacion para nuevas secciones:
  - Reutilizar primero componentes existentes del DS.
  - Si falta un componente, crearlo y documentarlo siguiendo tokens/estados del DS antes de usarlo en una nueva seccion.
