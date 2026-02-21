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

## Referencias de implementacion
- Componente: `src/components/ui/chat-counterpart-card.tsx`
- Storybook: `src/components/ui/chat-counterpart-card.stories.tsx`
- Integracion desktop: `src/components/meetup/wallapop-chat-workspace.tsx`
