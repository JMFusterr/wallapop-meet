# Inventario de `Chat Composer` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: conversacion abierta, foco alternado en caja de mensaje

## Validacion movil (responsive)
- Fecha de validacion: 2026-02-19
- Viewport: `390x844` (`devicePixelRatio: 1`)
- `CurrentConversation__sendMessageWrapper`: `390.4x74.4px`, `padding: 12px 20px`
- `textarea-component`: `350.4x49.6px`, `padding: 4px 4px 4px 20px`, `border-radius: 24px`
- `textarea.textarea-element`: `284.8x28px`, `16px/24px`, `color: #000000`

## Estructura observada
- Wrapper principal: `.CurrentConversation__sendMessageWrapper`
- Control de entrada: `.textarea-component`
- Campo real: `textarea.textarea-element`

## Especificacion visual del componente

### 1) Wrapper de envio
- Elemento/clase: `div.CurrentConversation__sendMessageWrapper`
- Dimensiones observadas: `640x74.4px`
- Padding: `12px 20px`
- Fondo: `#FFFFFF`

### 2) Caja del composer (`textarea-component`)
- Dimensiones observadas: `600x49.6px`
- Padding: `4px 4px 4px 20px`
- Radio: `24px`
- Sombra: `none`

Estados observados:
- `selected` (sin foco):
  - Clase: `textarea-component selected`
  - Borde: `0.8px solid #ECEFF1`
- `focus + selected`:
  - Clase: `textarea-component selected focus`
  - Borde: `0.8px solid #3DD2BA`

### 3) Textarea interno
- Elemento/clase: `textarea.textarea-element`
- Dimensiones observadas: `534.4x28px`
- Tipografia:
  - `16px/24px`, `400`, `Wallie, Helvetica`
- Color texto: `#000000`
- Fondo: `transparent`
- Borde: `none`
- Resize: `none`
- Placeholder:
  - Color: `#90A4AE`
  - `16px/24px`

### 4) Boton de envio
- Implementacion observada en referencia: control icon-only (avion de papel) en extremo derecho.
- Comportamiento esperado:
  - `disabled`: fondo gris claro, borde neutro, no interactivo.
  - `enabled` (cuando hay texto): fondo y borde en color marca (`#3DD2BA`).
- Accesibilidad: incluir `aria-label` descriptivo del envio.

## Tokens candidatos
- `tokens.color.composer.background = #FFFFFF`
- `tokens.color.composer.border.default = #ECEFF1`
- `tokens.color.composer.border.focus = #3DD2BA`
- `tokens.color.composer.text = #000000`
- `tokens.color.composer.placeholder = #90A4AE`
- `tokens.radius.composer = 24px`
- `tokens.color.composer.submit.enabled = #3DD2BA`
- `tokens.color.composer.submit.disabled = #C9D3D8`

## Notas de normalizacion DS
- El estado visual relevante esta en el contenedor (`textarea-component`), no en el `textarea`.
- Mantener `resize: none` para preservar layout fijo del footer de chat.
- El boton de envio debe depender del contenido no vacio (`trim().length > 0`).

## Implementacion actual en el repositorio (2026-02-20)
- Componente: `src/components/ui/chat-composer.tsx`.
- Storybook: `Design System/Chat Composer`.
- Layout actual:
  - Wrapper: padding uniforme (`p-2` en movil, `p-3` en desktop).
  - Caja interna del input: padding simetrico en los cuatro lados (`p-1.5`).
  - El boton de envio (`paper_plane`) se renderiza fuera de la caja del input, alineado a la derecha como accion primaria independiente.
- Acciones disponibles:
  - Accion primaria: boton circular de envio con icono `paper_plane` (externo al input).
  - Accion secundaria opcional: boton circular de meetup con icono `calendar`, dentro de la caja del input y situado a la derecha del textarea.
  - Alineacion vertical: input y botones alineados al centro (`items-center`) para evitar desfase visual.
  - Ancho estable del textarea: cuando no existe accion secundaria se reserva el mismo hueco visual del boton (`11x11`/`10x10`) para evitar saltos de tamaño entre variantes.
  - Radio del contenedor del input: `rounded-full` para mantener capsula completamente redonda en todos los estados.
- Props adicionales de integracion meetup:
  - `secondaryActionLabel`
  - `secondaryActionAriaLabel`
  - `secondaryActionIconName`
  - `onSecondaryAction`
  - `secondaryActionDisabled`
