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

Reglas:
- Debe soportar lista de puntos de encuentro sugeridos.
- Altura táctil mínima de 44 px.

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
| `error` | Borde `tokens.color.border.error` + mensaje de error | `aria-invalid=true` |
| `disabled` | Opacidad reducida + cursor no interactivo | No se puede abrir |

Notas:
- Tamaños soportados: `md` (44 px) y `lg` (48 px).
- Debe aceptar opciones de puntos de encuentro sugeridos.

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

Reglas:
- Debe renderizar acciones contextuales por estado de negocio.
- `I'm here` solo habilitado en `CONFIRMED` y ventana valida (`-15m`, `+2h`).
- Debe comunicar motivo de deshabilitado fuera de ventana.
- Debe integrar `MeetupTimeline` como referencia de progreso.

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
- Debe poder convivir dentro de un overlay con alto maximo y scroll interno sin desbordar viewport.

## Criterio de completitud
- Cada componente define propiedades, estados, tokens y regla de uso.
- No hay ambigüedad entre uso de `badge`, `chip`, `banner` y `toast`.

## Inventarios de referencia (captura oficial)
- `docs/elements/buttons.md`
- `docs/elements/Input.md`
- `docs/elements/chat-list-item.md`
- `docs/elements/chat-message-bubble.md`
- `docs/elements/chat-security-banner.md`
- `docs/elements/chat-product-card.md`
- `docs/elements/chat-composer.md`
- `docs/elements/badge.md`
- `docs/elements/icons.md`
- `docs/elements/inbox-bottom-nav.md`
- `src/components/meetup/meetup-timeline.tsx`
- `src/components/meetup/meetup-simulator.tsx`
- `src/components/meetup/meetup-card.tsx`
- `src/components/meetup/meetup-day-banner.tsx`

Notas:
- Fuente runtime de chat: `https://es.wallapop.com/app/chat`.
- Fecha de captura de los nuevos inventarios: `2026-02-19`.
- Cuando se actualice cualquier inventario de `docs/elements/`, revisar impacto en tokens (`styles.json`) antes de implementar componentes.
