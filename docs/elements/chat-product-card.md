# Inventario de `Product Card` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle`
- Viewport de referencia: `1536x678` (`devicePixelRatio: 1.25`)
- Contexto: panel derecho de conversacion con card del item

## Especificacion visual del componente

### 1) Contenedor `card`
- Elemento/clase: `a.card`
- Dimensiones observadas: `301.6x321.6px`
- Fondo: `#FFFFFF`
- Borde: `none`
- Radio: `10px`
- Sombra: `none`

### 2) Imagen
- Nodo: `img.card-img-top`
- Dimensiones: `301.6x180px`
- Borde: `4px solid #FFFFFF`
- Radio: `10px`

### 3) Bloque de acciones
- Nodo: `.actions-block`
- Altura observada: `39.6px`
- Padding: `12px 20px 0`

Botones embebidos:
- `.btn.btn-reserve`
  - `120.8x27.6px`
  - Padding: `4px 20px`
  - Fondo: `#4368CC`
  - Texto: `#FFFFFF`
  - Borde: `0.8px solid transparent`
  - Radio: `25px`
  - Tipografia: `12px/18px`, `400`, `Wallie, Helvetica`
- `.btn.btn-sold`
  - `120.8x27.6px`
  - Padding: `4px 20px`
  - Fondo: `#F75883`
  - Texto: `#FFFFFF`
  - Borde: `0.8px solid transparent`
  - Radio: `25px`
  - Tipografia: `12px/18px`, `400`, `Wallie, Helvetica`

### 4) Boton de editar superpuesto
- Nodo: `a.btn.btn-edit`
- Dimensiones: `40x40px`
- Fondo: `#FFFFFF`
- Borde: `1.6px solid rgba(207, 216, 220, 0.5)`
- Radio: `8px`

### 5) Bloque de contenido
- Nodo: `.card-block`
- Padding: `12px`

Texto:
- `.card-title`
  - `16px/20px`, `700`, `Wallie, Helvetica`
  - Color: `#253238`
  - Margen inferior: `12px`
- `.price`
  - `16px/24px`, `400`, `Wallie, Helvetica`
  - Color: `#253238`
- `.stats`
  - `12px/26px`, `400`, `Wallie, Helvetica`
  - Color: `#607D8B`

## Tokens candidatos
- `tokens.color.card.background = #FFFFFF`
- `tokens.color.card.title = #253238`
- `tokens.color.card.meta = #607D8B`
- `tokens.color.card.action.reserve = #4368CC`
- `tokens.color.card.action.sold = #F75883`
- `tokens.radius.card.base = 10px`
- `tokens.radius.card.action_pill = 25px`

## Notas de normalizacion DS
- Esta card mezcla preview de producto y quick actions del vendedor; para Meetup se recomienda separar:
  - `ProductCard` (informacion)
  - `ProductCardActions` (acciones contextuales)
