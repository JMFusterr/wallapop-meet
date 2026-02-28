# Inventario de `Chat Counterpart Card` observado en Wallapop Chat

## Fuente de analisis
- URL: `https://es.wallapop.com/app/chat`
- Fecha de captura: 2026-02-21
- Metodo: inspeccion con MCP Chrome DevTools
- Viewport de referencia: `1920x1080`
- Contexto: columna derecha de conversacion en desktop

## Especificacion visual del componente

### 1) Contenedor
- Card de fondo blanco sobre panel lateral gris claro.
- Radio redondeado suave (`~12px` en implementacion DS).
- Padding interno uniforme.

### 2) Bloque principal
- Distribucion horizontal:
  - Columna izquierda: nombre + rating + distancia + ubicacion.
  - Columna derecha: avatar circular.

### 3) Tipografia
- Nombre:
  - Estilo destacado (negrita).
  - En DS actual: mismo tamano que metadatos (`16px`) y mayor peso.
- Metadatos:
  - Distancia (`N km de ti`) y ubicacion (`Desconocido`).
  - Menor contraste que el nombre.

### 4) Rating
- 5 estrellas con posibilidad de media estrella.
- Color principal oscuro para estrellas activas y gris suave para inactivas.

### 5) Avatar
- Imagen circular en el extremo derecho.
- Tamaño compacto para no competir con la informacion textual.

## Reglas de uso
- Solo se muestra en desktop dentro del sidebar derecho del workspace de chat.
- Debe aceptar tanto comprador como vendedor como contraparte de la conversacion.
- Debe mantener lectura rapida: nombre primero, contexto de distancia/ubicacion despues.

---

## Actualizacion v2 (2026-02-23)

Esta seccion refleja la implementacion actual del componente.
Si hay conflicto con la descripcion original, prevalece v2.

### 1) Cambio de metrica secundaria
- Se reemplaza la linea de ubicacion por metrica de asistencia a quedadas.
- Formato actual:
  - Alta/media asistencia: `X% de asistencia (N)`.
  - Baja asistencia (`<70`): `Baja asistencia a quedadas`.

### 2) Semaforo de asistencia
- `>90`: color success.
- `70-89`: color warning (`semantic.warning.base`, implementado como `#F4A000`).
- `<70`: color error y sin mostrar porcentaje.
- `0 meetups`: estado neutral en gris con `0% de asistencia (0)`.

### 3) Rating con volumen
- Junto a las estrellas se muestra el total de valoraciones:
  - `(<numero valoraciones>)`
- Ejemplo: `(110)`.
- Si `ratingCount` es `0`, no se renderiza el contador y el perfil se considera sin historial de valoraciones.

### 4) Jerarquia tipografica actual
- Nombre: `16px` destacado.
- Distancia (`N km de ti`): `14px`.
- Asistencia: `14px`.
- Conteo de valoraciones `(N)`: `14px`.

### 5) API de props actual
- `name: string`
- `rating: number`
- `ratingCount?: number`
- `distanceLabel: string`
- `attendanceRate?: number`
- `attendanceMeetups?: number`
- `profileImageSrc?: string`
- `profileImageAlt?: string`

## Referencias de implementacion
- Componente: `src/components/ui/chat-counterpart-card.tsx`
- Storybook: `src/components/ui/chat-counterpart-card.stories.tsx`
- Integracion desktop: `src/components/meetup/wallapop-chat-workspace.tsx`
- Design System vivo: `src/pages/design-system-page.tsx` (renderizado desde stories `Design System/*`).
