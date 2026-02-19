# Inventario de `Chat Composer` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: conversacion abierta, foco alternado en caja de mensaje

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

## Tokens candidatos
- `tokens.color.composer.background = #FFFFFF`
- `tokens.color.composer.border.default = #ECEFF1`
- `tokens.color.composer.border.focus = #3DD2BA`
- `tokens.color.composer.text = #000000`
- `tokens.color.composer.placeholder = #90A4AE`
- `tokens.radius.composer = 24px`

## Notas de normalizacion DS
- El estado visual relevante esta en el contenedor (`textarea-component`), no en el `textarea`.
- Mantener `resize: none` para preservar layout fijo del footer de chat.
