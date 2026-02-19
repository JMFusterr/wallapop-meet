# Inventario de `Security Banner` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: conversacion abierta (banner de seguridad visible)

## Especificacion visual del componente

### 1) `banner.security`
- Elemento/clase: `div.ChatSecurityNotification.ChatSecurityNotification__variant`
- Dimensiones observadas: `548x60px`
- Padding: `16px 16px 8px`
- Fondo: `#FFFFFF`
- Borde: `none`
- Radio: `0`

### 2) Texto principal
- Nodo: `span.me-1`
- Tipografia:
  - `12px/18px`, `400`, `Wallie, Helvetica`
- Color: `#212529`
- Ejemplo: `Quedate en Wallapop. Mas facil, mas seguro...`

### 3) Enlace secundario
- Nodo: enlace interno del banner
- Texto: `Preguntas? Habla con nuestro chatbot`
- Tipografia:
  - `12px/16px`, `400`, `WallieFit`
- Color: `#038673`
- Decoracion: `underline`

## Tokens candidatos
- `tokens.color.banner.security.background = #FFFFFF`
- `tokens.color.banner.security.text = #212529`
- `tokens.color.banner.security.link = #038673`
- `tokens.typography.banner.security.body = 12/18`
- `tokens.typography.banner.security.link = 12/16`

## Notas de normalizacion DS
- En Wallapop chat este banner funciona como aviso persistente contextual (no toast).
- Para Meetup conviene mapearlo a `Banner` no descartable mientras la condicion de seguridad siga activa.
