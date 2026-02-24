# Inventario de botones observados en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools + `getComputedStyle` (incluyendo Shadow DOM)
- Viewport de referencia: `1440x900` y validacion responsive en `390x844`
- Contexto: sesion iniciada (bandeja + conversacion abierta)

## Especificacion visual por tipo de boton

### 1) `button.primary` (CTA principal)
- Ejemplo: `Vender`
- Elemento/clase: `a[role="button"].walla-button__anchor.walla-button__anchor--medium.walla-button__anchor--primary`
- Dimensiones: `138x40px`
- Padding: `0 24px`
- Tipografia:
  - Font family: `WallieChunky`
  - Font size: `16px`
  - Font weight: `400`
  - Line-height: `24px`
- Color:
  - Texto: `rgb(41, 54, 61)` (`#29363D`)
  - Fondo: `rgb(61, 210, 186)` (`#3DD2BA`)
- Borde:
  - `1.6px solid rgb(61, 210, 186)`
  - Radio: `100px` (pill)
- Sombra: `none`
- Iconos: `0`
- Cursor: `pointer`

### 2) `button.nav.expandable` (navegacion superior)
- Ejemplos: `Todas las categorias`, `Tecnologia y electronica`, `Cine, libros y musica`, `Moda y accesorios`, `Hogar y jardin`
- Elemento/clase: `button.wallapop-category-vertical-navigation-desktop-module_CategoryVerticalNavigationDesktop__topItem__o0qdB`
- Dimensiones:
  - Alto fijo: `47px`
  - Ancho variable por etiqueta (`114px` a `192px` observado)
- Padding: `0 2px`
- Tipografia:
  - Font family: `WallieFit`
  - Font size: `16px`
  - Font weight: `400`
  - Line-height: `24px`
- Color:
  - Texto: `rgb(41, 54, 61)` (`#29363D`)
  - Fondo: `transparent`
- Borde: `none`
- Radio: `0`
- Sombra: `none`
- Iconos: `0` (el chevron expandible no se expone como icono interno en este nodo)
- Cursor: `pointer`

### 3) `button.tab` (tabs del buzon)
- Ejemplos: `Mensajes` (`enabled/selected`), `Notificaciones` (`disabled`)
- Elemento/clase: `button[role="tab"].TabsBar__element`
- Dimensiones:
  - Alto fijo: `40px`
  - Ancho variable por etiqueta
- Padding: `0 16px`
- Tipografia:
  - Font family: `WallieChunky`
  - Font size: `16px`
  - Font weight: `400`
  - Line-height: `24px`
- Color:
  - `enabled/selected`: texto `#FFFFFF`, fondo `#253238`
  - `disabled`: texto `#102A43`, fondo `transparent`
- Borde: `none`
- Radio: `999px` (pill)
- Sombra: `none`
- Iconos: `0`
- Cursor: `pointer`
- Estado: el estado seleccionado se representa con pill oscuro; `disabled` mantiene aspecto de etiqueta de texto sin fondo.

### 4) `button.inline.action` (accion contextual en timeline de chat)
- Ejemplo: `Ver`
- Elemento/clase: `button.btn.btn-third-voice`
- Dimensiones: `88x40px`
- Padding: `8px 32px`
- Tipografia:
  - Font family: `Wallie, Helvetica`
  - Font size: `14px`
  - Font weight: `400`
  - Line-height: `21px`
- Color:
  - Texto: `rgb(255, 255, 255)` (`#FFFFFF`)
  - Fondo: `rgb(61, 170, 191)` (`#3DAABF`)
- Borde:
  - `0.8px solid rgba(0, 0, 0, 0)`
  - Radio: `25px`
- Sombra: `none`
- Iconos: `0`
- Cursor: `pointer`
- Estado observado: `enabled` (no se detecto una variante `disabled` en la captura final).

### 5) `button.icon` (control icon-only lateral)
- Ejemplo: boton colapsable del sidebar (sin etiqueta textual)
- Elemento/clase: `button.Sidebar__collapse.p-0.d-flex.align-items-center.justify-content-center`
- Dimensiones: `24x24px`
- Padding: `0`
- Tipografia base heredada:
  - Font family: `Wallie, Helvetica`
  - Font size: `16px`
  - Line-height: `24px`
- Color:
  - Icono/texto: `rgb(0, 0, 0)` (`#000000`)
  - Fondo: `rgb(236, 239, 241)` (`#ECEFF1`)
- Borde: `none`
- Radio: `50%` (circular)
- Sombra: `rgba(37, 50, 56, 0.15) 0px 4px 4px 0px`
- Iconos internos: `1`
- Cursor: `pointer`

### 6) `button.menu.close` (cierre de panel de categorias)
- Ejemplo: `Close Menu`
- Elemento/clase: `button.wallapop-categories-module_CategoryNavigation__closeButton__1jdrK`
- Dimensiones: `40x40px`
- Padding: `0`
- Tipografia base: `Wallie, Helvetica`, `16px`, `400`, `24px`
- Color:
  - Texto/icono: `rgb(0, 0, 0)` (`#000000`)
  - Fondo: `rgb(255, 255, 255)` (`#FFFFFF`)
- Borde: `none`
- Radio: `12px`
- Sombra: `none`
- Cursor: `pointer`

## CTA de lista (no expuesto como boton semantico)
- Texto: `CARGAR MAS`
- Nodo observado: `div.load-more-container`
- Estilo visual:
  - Alto: `48px`
  - Font: `16px / 48px`, `Wallie, Helvetica`, `400`
  - Color: `rgb(33, 37, 41)` (`#212529`)
- Nota: no aparece como `button` en el arbol semantico; decidir en DS si mantenerlo como texto interactivo o migrarlo a boton accesible.

## Tokens candidatos (extraidos de botones)
- Colores:
  - `#3DD2BA` (primary surface)
  - `#3DAABF` (inline action)
  - `#29363D` (primary text dark)
  - `#253238` (tab/tag selected background)
  - `#102A43` (tab/tag disabled text)
  - `#ECEFF1` (icon button bg neutral)
  - `#FFFFFF` (text on colored buttons)
  - `#000000` (icon text)
- Radios:
  - `100px` (pill CTA principal)
  - `25px` (pill acciones inline)
  - `12px` (icon close menu)
  - `50%` (icon circular)
- Tipografias:
  - `WallieChunky` (CTA principal)
  - `WallieFit` (navegacion de categorias)
  - `Wallie, Helvetica` (tabs, acciones, iconos)

## Limitaciones de captura
- No se han extraido estados `hover`, `focus-visible` y `active` porque requieren simulacion de estados pseudo-clase por variante.
- Algunos componentes usan Shadow DOM; la medicion ya contempla ese arbol.

## Iconografia runtime (2026-02-19)
- Tecnologia: web component `walla-icon`.
- Nombres detectados relevantes para acciones: `arrow_left`, `cross`, `chevron_right`, `ellipsis_horizontal`, `burguer_menu`.
- Tamano base observado: `24px`; iconos secundarios de lista: `16px`.

## Normalizacion para el sistema de diseno de Wallapop Meet

Esta seccion traduce el inventario real de la web a componentes reutilizables del sistema de diseno, manteniendo naming estable y trazable.

### Canon DS propuesto (`Button`)
- `variant`:
  - `primary` (antes: `button.primary`)
  - `nav_expandable` (antes: `button.nav.expandable`)
  - `tab` (antes: `button.tab`)
  - `inline_action` (antes: `button.inline.action`)
  - `icon` (antes: `button.icon`)
  - `menu_close` (antes: `button.menu.close`)
- `size`:
  - `sm` (`24x24`) para `icon`
  - `md` (`40px` de alto) para `primary`, `inline_action`, `menu_close`
  - `lg` (`47px` de alto) para `nav_expandable`
  - `tab` mantiene `40px` de alto (tamano propio por patron)
- `state`: `default | hover | pressed | focused | disabled | loading`

### Reglas de mapeo
- Mantener `secondary` como variante `outline` para acciones de continuidad (ejemplo: `Anadir a Calendar`).
- Mantener `ghost` como boton de texto sin borde ni fondo.
- Mantener `link` para acciones inline con texto subrayado.
- Para acciones destructivas de Meetup (por ejemplo cancelacion), usar patron de confirmacion (`Modal`) + semantica `error` en texto/badge, sin forzar una nueva variante de boton.
- `button.icon` y `button.menu.close` son controles `icon-only`: requieren `aria-label` obligatorio y area tactil minima de `44x44` en contextos moviles.

### Fuente de verdad
- Inventario base: este documento (`docs/elements/buttons.md`).
- Especificacion de componente: `plans/design-system/components-spec-v1.md`.
- Tokens: `plans/design-system/design-tokens-v1.md` y `styles.json`.
