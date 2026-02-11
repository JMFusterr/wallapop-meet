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
  - Estado deshabilitado fuera de ventana: `components.button.disabled`

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
