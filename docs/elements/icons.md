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
- `arrow_left` (volver en wizard y cabeceras)
- `burguer_menu` (menu principal en header de inbox, contrato disponible)
- `chevron_right` (navegacion de calendario)
- `cross` (cierre de overlays y cabeceras)
- `ellipsis_horizontal` (acciones contextuales en cabecera de conversacion)
- `paper_plane` (boton de envio del `ChatComposer`)
- `shield` (banner de seguridad y punto seguro en mapa)
- `edit` (edicion en `ChatProductCard`)
- `eye` (metricas de visualizaciones en `ChatProductCard`)
- `home`, `heart`, `plus`, `mail`, `user` (navegacion inferior de inbox)
- `bookmark`, `deal` (indicadores de estado en listado y card de producto)
- `calendar` (accion de propuesta de quedada)
- `double_check` (estado de entrega en listado y mensajes)
- `bot` (asistente / mensajes de sistema; `ChatMeetRatingPromptBubble` tras venta completada)

## Matriz de accion principal (Design System)

| Icono | Accion principal | Referencia de uso |
| --- | --- | --- |
| `arrow_left` | Volver a la pantalla anterior | `MeetupWizardStepHeading`, cabeceras |
| `burguer_menu` | Abrir menu principal | Header de inbox (contrato) |
| `chevron_right` | Navegar pasos/meses | `CalendarPicker` |
| `cross` | Cerrar modal o drawer | `MeetupProposalHeader`, overlays |
| `edit` | Editar anuncio o propuesta | `ChatProductCard` |
| `eye` | Mostrar visualizaciones | `ChatProductCard` |
| `heart` | Gestionar favoritos | `ChatProductCard`, `InboxBottomNav` |
| `home` | Ir a inicio | `InboxBottomNav` |
| `mail` | Ir a buzon | `InboxBottomNav` |
| `user` | Ir a perfil | `InboxBottomNav` |
| `plus` | Iniciar alta/publicacion | `InboxBottomNav` |
| `calendar` | Iniciar propuesta de quedada | `ChatComposer` |
| `paper_plane` | Enviar mensaje | `ChatComposer` |
| `ellipsis_horizontal` | Abrir acciones contextuales | Header de conversacion |
| `shield` | Señalar punto seguro | `ChatSecurityBanner`, mapas |
| `deal` | Señalar trato/punto personalizado | `ChatListItem`, mapas |
| `bookmark` | Señalar estado reservado | `ChatListItem`, `ChatProductCard` |
| `double_check` | Mostrar estado de entrega | `ChatMessageBubble`, `ChatListItem` |
| `bot` | Identificar mensaje de asistente o sistema | `ChatMeetRatingPromptBubble` |

Notas de uso en workspace (2026-02-20):
- `burguer_menu` no se usa en el header del buzon de la implementacion actual.
- `ellipsis_horizontal` se usa en el header de la conversacion abierta (accion contextual placeholder).
- `double_check` se resuelve en el wrapper local con un icono de checks compactos para estado `sent/read`.

Nota:
- `paper_plane` se mantiene en la API del wrapper local aunque no se haya capturado explicitamente en el inventario runtime anterior.

## Chip de estado en `MeetupCard` (Lucide directo)
Los tags de estado junto al titulo de la card no usan `WallapopIcon`; se renderizan con iconos de `lucide-react` a la izquierda del texto (`Label`), tamaño `var(--wm-size-12)`, `aria-hidden` en el icono.

| Texto visible | Icono Lucide | Notas |
| --- | --- | --- |
| `pendiente` | `Clock` | También para `COUNTER_PROPOSED` |
| `confirmada` | `CheckCircle2` | |
| `has llegado` | `MapPin` | Estado `ARRIVED` |
| `completada` | `Handshake` | Misma semantica de venta cerrada que `WallapopIcon` `deal` |
| `cancelada` | `XCircle` | |
| `sin propuesta` | `CircleDashed` | Estado inicial sin meetup |

Fuente de verdad: `plans/design-system/components-spec-v1.md` seccion 15 e implementacion en `src/components/meetup/meetup-card.tsx` (`statusPill`).

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
