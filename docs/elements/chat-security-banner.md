# Inventario de `Security Banner` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: conversacion abierta (banner de seguridad visible)

## Validacion movil (responsive)
- Fecha de validacion: 2026-02-19
- Viewport: `390x844` (`devicePixelRatio: 1`)
- `ChatSecurityNotification`: `390.4x78px`
- Padding: `16px 16px 8px`
- El texto y enlace mantienen la misma jerarquia tipografica.

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

### 4) Icono de seguridad
- Nodo: `walla-icon.ChatSecurityNotification__shieldIconWrapper`
- Tamano contenedor: `24x24px`
- Background contenedor: `#F0F3F5`
- Radio: `8px`
- Iconografia: web component `walla-icon` (icono de escudo)
- Color del glyph observado: `#13C1AC`

## Tokens candidatos
- `tokens.color.banner.security.background = #FFFFFF`
- `tokens.color.banner.security.text = #212529`
- `tokens.color.banner.security.link = #038673`
- `tokens.typography.banner.security.body = 12/18`
- `tokens.typography.banner.security.link = 12/16`

## Notas de normalizacion DS
- En Wallapop chat este banner funciona como aviso persistente contextual (no toast).
- Para Meetup conviene mapearlo a `Banner` no descartable mientras la condicion de seguridad siga activa.
- Alineacion vertical recomendada: icono y bloque de texto centrados sobre el eje Y (`align-items: center`).

## Implementacion actual en el repositorio (2026-02-20)
- Componente: `src/components/ui/chat-security-banner.tsx`.
- Storybook: `Design System/Chat Security Banner`.
- Integracion en chat workspace:
  - Se renderiza fijo justo encima del composer en `src/components/meetup/wallapop-chat-workspace.tsx`.
  - Variante compacta para no ocupar demasiado alto en footer:
    - Wrapper externo: `px-3 pt-1` (movil) / `sm:px-4`.
    - Banner: `className="px-0 pt-1 pb-1"`.
