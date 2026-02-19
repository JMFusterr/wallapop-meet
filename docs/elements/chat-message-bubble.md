# Inventario de `Message Bubble` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: conversacion abierta en bandeja

## Especificacion visual del componente

### 1) `message_bubble.received`
- Elemento/clase: `.CurrentConversation__notMessageOwner .message-cloud`
- Dimensiones observadas: `119.05x37.6px`
- Padding: `8px 12px`
- Fondo: `transparent`
- Borde: `0.8px solid #ECEFF1`
- Radio: `20px`
- Tipografia del texto:
  - `16px/20px`, `400`, `Wallie, Helvetica`
  - Color: `#253238`

### 2) `message_bubble.sent`
- Elemento/clase: `.CurrentConversation__messageOwner .message-cloud`
- Dimensiones observadas: `144.99x37.6px`
- Padding: `8px 32px 8px 12px`
- Fondo: `#ECEFF1`
- Borde: `0.8px solid #ECEFF1`
- Radio: `20px`
- Tipografia del texto:
  - `16px/20px`, `400`, `Wallie, Helvetica`
  - Color: `#253238`

## Tokens candidatos
- `tokens.color.chat.bubble.sent.background = #ECEFF1`
- `tokens.color.chat.bubble.received.background = transparent`
- `tokens.color.chat.bubble.border = #ECEFF1`
- `tokens.color.chat.bubble.text = #253238`
- `tokens.radius.chat.bubble = 20px`
- `tokens.spacing.chat.bubble.received.padding = 8 12`
- `tokens.spacing.chat.bubble.sent.padding = 8 32 8 12`

## Notas de normalizacion DS
- Mantener variantes separadas `sent` y `received` por diferencia de relleno y fondo.
- No acoplar timestamps al bubble; se renderizan como metadato externo en la lista vertical.
