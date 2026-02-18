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
- `state`: `default | focused | error | disabled`
- `helper`: `none | hint | error`

Tokens base:
- Borde: `tokens.color.border.default`
- Foco: `tokens.color.border.focus`
- Error: `tokens.color.border.error`
- Texto: `tokens.color.text.primary`

Reglas:
- Mostrar ayuda/error siempre debajo del campo, nunca en placeholder.

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
| `default` | Borde `tokens.color.border.default` | Entrada editable |
| `focused` | `focus ring` + borde `tokens.color.border.focus` | Prioriza legibilidad y foco visible |
| `error` | Borde `tokens.color.border.error` + texto de error | `aria-invalid=true` |
| `disabled` | Opacidad reducida + cursor no interactivo | No editable |

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

## Criterio de completitud
- Cada componente define propiedades, estados, tokens y regla de uso.
- No hay ambigüedad entre uso de `badge`, `chip`, `banner` y `toast`.
