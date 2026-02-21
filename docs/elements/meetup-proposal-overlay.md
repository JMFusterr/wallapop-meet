# Inventario de `Meetup Proposal Overlay` (Wallapop Meet)

## Fuente de analisis
- Implementacion de referencia: `src/components/meetup/wallapop-chat-workspace.tsx`
- Fecha de actualizacion: 2026-02-21
- Contexto: flujo `Proponer quedada` iniciado desde `ChatComposer`.

## Estructura funcional
- Wizard de 3 pasos:
  - Paso 1: seleccion de punto de encuentro.
  - Paso 2: fecha y hora.
  - Paso 3: preferencia de pago y precio final.
- Cierre del overlay:
  - Boton `X` en cabecera.
  - No existe boton `Cancelar` en footer.

## Paso 1: seleccion de punto

### Regla base de visibilidad
- Siempre hay exactamente 2 opciones seleccionables visibles.

### Modelo de datos visual
- El paso 1 usa una cola de 2 elementos (`selectableOptions`) basada en las ultimas selecciones.
- Insercion de nueva seleccion:
  - Entra en posicion 1.
  - La anterior pasa a posicion 2.
  - Se descarta cualquier tercera.

### Comportamiento esperado
- Si se pulsa la opcion inferior, no desaparece la superior.
- Cambia solo la seleccion activa (`selectedOptionId`).
- Si se selecciona un nuevo punto desde mapa:
  - Aparece arriba.
  - Empuja al anterior hacia abajo.
  - Se mantienen 2 opciones visibles.

### Tipos de opcion
- Punto seguro:
  - Icono escudo.
  - Nombre + direccion.
  - Labels: `Punto seguro` y `<N> ventas`.
- Punto personalizado:
  - Icono puntero de mapa (`map pin`).
  - Direccion seleccionada.
  - Label: `Personalizado`.

## Vista de mapa (selector)

### Interaccion
- Permite seleccionar:
  - Marcadores de puntos seguros.
  - Cualquier punto personalizado con tap libre sobre mapa.
- Al seleccionar personalizado:
  - Se genera direccion (reverse geocoding con fallback a coordenadas).
  - Se calcula distancia desde posicion de referencia.
  - Se muestra aviso de punto no verificado.

### Bottom sheet de seleccion
- Contenido:
  - Titulo del punto.
  - Direccion.
  - Chip de distancia en `m/km`.
  - Mensaje de seguridad para puntos no seguros.
  - CTA `Seleccionar`.
- Reglas:
  - Debe renderizarse por encima del mapa (`z-index` superior).
  - Distancia debe permanecer en una sola linea (`no-wrap`).

### Movil
- Controles de zoom `+/-` ocultos.
- Zoom por gesto tactil.

## Footer del wizard
- Layout movil en una sola fila:
  - Izquierda: contexto de articulo/comprador.
  - Derecha: CTA principal del paso.
- Texto de articulo truncado con elipsis para no desplazar boton.

## Tokens/estilo recomendados
- Estado seleccionado en cards:
  - Borde oscuro + `inset` de refuerzo.
- Estado neutro:
  - Borde gris claro.
- Labels:
  - `Punto seguro`: fondo verde claro.
  - `Ventas`: fondo neutro claro.
  - `Personalizado`: fondo neutro claro.

## QA rapido
- Caso 1: seleccionar seguro recomendado superior, luego inferior.
  - Resultado: ambos siguen visibles; cambia seleccion activa.
- Caso 2: seleccionar personalizado en mapa repetidas veces.
  - Resultado: nuevo personalizado arriba; anterior baja.
- Caso 3: seleccionar seguro tras personalizado en mapa.
  - Resultado: desaparece pin personalizado del mapa.
- Caso 4: titulo/direccion largos en mapa.
  - Resultado: chip distancia permanece en una sola linea.
