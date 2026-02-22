# Tokens de diseño v1 - Wallapop Meet

## Objetivo
Definir una base de tokens consistente, escalable y lista para implementación técnica de Wallapop Meet.

## Estructura propuesta

```text
brand
  name
  system
  typography

tokens
  color
    brand
    neutral
    semantic
    text
    background
    border
    overlay
  typography
    family
    weight
    size
    line_height
    letter_spacing
  spacing
  radius
  border
  shadow
  opacity
  motion

components
  button
  card
  banner
  toast
  modal
  input
  badge
  bottom_nav
```

## Convenciones de naming
- Usar jerarquía semántica: `group.category.item.state`.
- Evitar nombres ambiguos como `primary`/`secondary` cuando no expresen intención.
- Ejemplos correctos:
  - `color.text.primary`
  - `color.background.surface`
  - `color.semantic.success.base`

## Reglas de diseño
- Todos los componentes consumen tokens; no usar hex, px o ms hardcodeados.
- Los tokens semánticos representan intención (`success`, `warning`, `error`, `info`).
- `spacing` y `radius` se consumen por escala (`100`, `200`, ...).
- `motion` define duración + easing reutilizable para transiciones y feedback.

## Mapeo base de botones extraidos de web (2026-02-18)

### Color (`tokens.color.button`)
- `primary.background`: `#3DD2BA`
- `primary.text`: `#29363D`
- `nav.background`: `transparent`
- `nav.text`: `#29363D`
- `tab.background`: `transparent`
- `tab.text`: `#000000`
- `inline_action.background`: `#3DAABF`
- `inline_action.text`: `#FFFFFF`
- `icon.background`: `#ECEFF1`
- `icon.foreground`: `#000000`
- `menu_close.background`: `#FFFFFF`
- `menu_close.foreground`: `#000000`

### Radius (`tokens.radius.button`)
- `pill`: `100px` (`primary`)
- `inline_pill`: `25px` (`inline_action`)
- `menu_close`: `12px`
- `circular`: `50%` (`icon`)

### Border (`tokens.border.button`)
- `primary.width`: `1.6px`
- `primary.color`: `#3DD2BA`
- `inline_action.width`: `0.8px`
- `inline_action.color`: `transparent`

### Typography (`tokens.typography.button`)
- `primary.family`: `WallieChunky`
- `primary.size`: `16px`
- `primary.line_height`: `24px`
- `nav.family`: `WallieFit`
- `nav.size`: `16px`
- `nav.line_height`: `24px`
- `tab.family`: `Wallie, Helvetica`
- `tab.size`: `16px`
- `tab.line_height`: `24px`
- `inline_action.family`: `Wallie, Helvetica`
- `inline_action.size`: `14px`
- `inline_action.line_height`: `21px`

### Shadow (`tokens.shadow.button`)
- `icon`: `0 4px 4px 0 rgba(37, 50, 56, 0.15)`

## Mapeo base de input extraido de web (2026-02-18)

### Color (`tokens.color.input`)
- `text`: `#29363D`
- `label`: `#5C7A89`
- `placeholder_focus`: `#A3B8C1`
- `ring.default`: `#5C7A89`
- `ring.hover`: `#29363D`
- `ring.error`: `#CE3528`
- `ring.success`: `#228618`

### Radius (`tokens.radius.input`)
- `container`: `8px`

### Spacing (`components.input`)
- `padding_y_default`: `20px`
- `padding_y_compact`: `10px`
- `padding_x`: `16px`

### Opacity (`tokens.opacity.input_disabled`)
- `disabled`: `0.4`

## Mapeo mínimo para Wallapop Meet
- Línea de estados del meetup:
  - Estado activo: `color.brand.primary`
  - Estado completado: `color.semantic.success.base`
  - Estado expirado/cancelado: `color.semantic.error.base`
- Banner del día del meetup:
  - Fondo: `color.background.accent`
  - Texto: `color.text.primary`
- Acción "I'm here":
  - Botón principal: `components.button.primary`
  - Estado deshabilitado fuera de ventana: `components.button.primary.disabled`
- Chips/labels de estado en `MeetupCard`:
  - `pendiente`: `color.background.base` + `color.border.default` + `color.text.secondary`
  - `contraoferta`: `color.semantic.warning.base` (tinte de fondo)
  - `confirmada`: `color.semantic.success.base` (tinte de fondo)
  - `llegada`: `color.semantic.info.base` (tinte de fondo)
  - `completada`: `color.list_item.leading_indicator` (morado de sistema, tinte de fondo)
  - `expirada`: `color.neutral.400/700` (fondo neutral)
  - `cancelada`: `color.semantic.error.base` (tinte de fondo)
- Campos de formulario de meetup:
  - Input base: `components.input`
  - Estado error: `components.input.ring_color_error`
  - Estado success: `components.input.ring_color_success`
- Botones de acciones criticas en card:
  - `components.button.critical` debe usar radio tipo pill alineado con `components.button.inline_action`.

## Mapeo de inbox movil (2026-02-19)

### Color (`tokens.color.bottom_nav`)
- `background`: `#FFFFFF`
- `border`: `#D3DEE2`
- `icon_default`: `#6E8792`
- `icon_active`: `#253238`
- `label_default`: `#6E8792`
- `label_active`: `#253238`

### Size & typography (`tokens.bottom_nav`)
- `icon_size`: `20px`
- `label.size`: `11px`
- `label.line_height`: `14px`

### Color (`tokens.color.list_item`)
- `leading_indicator`: `#AC2B8B`
- `delivery.sent`: `#C2CDD3`
- `delivery.read`: `#13C1AC`

## Checklist de aceptación v1
- Estructura documentada y aplicada en `styles.json`.
- Cobertura de tokens para color, tipografía, spacing, radius, border, shadow, opacity y motion.
- Componentes críticos (`button`, `card`, `banner`, `toast`, `modal`, `input`, `badge`) definidos por referencia a tokens.
- Preparado para exportación futura a web/app sin romper naming.

## Decisiones abiertas (para validar con diseño oficial)
1. Nombre exacto y fallback de familia tipográfica oficial.
2. Escala final de grises neutros.
3. Duraciones finales de motion en iOS y Android.
4. Reglas de elevación por plataforma (si divergen).
