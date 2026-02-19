# Inventario de iconos observados en Wallapop Chat (movil)

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-19
- Metodo: inspeccion con MCP Chrome DevTools (`walla-icon` + Shadow DOM)
- Viewport: `390x844` (`devicePixelRatio: 1`)
- Contexto: bandeja + conversacion abierta

## Tecnologia observada en runtime
- Wallapop renderiza iconos con web component `walla-icon`.
- Se detectan atributos `icon` y `size` (`small`, `medium`), con `viewBox` de `0 0 24 24`.
- En esta sesion no se detecta paquete npm publico oficial reutilizable en el proyecto para `walla-icon`.

## Nombres de icono detectados
- `burguer_menu`
- `arrow_left`
- `cross`
- `chevron_right`
- `ellipsis_horizontal`
- `categories`
- `car`
- `motorbike`
- `helmet`
- `tshirt`
- `house`
- `chip`
- `basketball`
- `bike`
- `sofa`
- `washing_machine`
- `open_book`
- `pram`
- `painting`
- `bricks`
- `sickle`
- `briefcase`
- `wrench`

## Nombres de icono usados en implementacion Wallapop Meet
- `paper_plane` (boton de envio del `ChatComposer`)
- `home`, `heart`, `plus`, `mail`, `user` (navegacion inferior de inbox)
- `bookmark`, `deal` (indicadores en miniatura de `ChatListItem`)
- `double_check` (estado de entrega en listado y mensajes)

Nota:
- `paper_plane` se mantiene en la API del wrapper local aunque no se haya capturado explicitamente en el inventario runtime anterior.

## Tamano observado
- `small`: `16x16px` (iconos de categoria)
- `medium`: `24x24px` (navegacion y acciones principales)

Nota de implementacion:
- En `InboxBottomNav` de Wallapop Meet se ajusta a `20px` para evitar solapes de etiqueta en viewport movil reducido.

## Decision de implementacion en Wallapop Meet
- Implementar wrapper local `WallapopIcon` en `src/components/ui/wallapop-icon.tsx`.
- Mantener API por nombre Wallapop (`arrow_left`, `cross`, `chevron_right`, etc.).
- Resolver internamente a `lucide-react` como fallback estable hasta disponer de libreria oficial.
- Priorizar equivalencia visual y consistencia de tamano (`16` y `24`) en componentes de chat.
