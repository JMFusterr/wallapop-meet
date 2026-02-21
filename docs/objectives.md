La funcionalidad se llama **Wallapop Meet**, un sistema para formalizar encuentros presenciales de compraventa dentro de Wallapop.

### Resumen de la funcionalidad

Wallapop Meet transforma acuerdos informales de chat en un "evento de encuentro" estructurado dentro de la app.
El flujo se inicia siempre desde una conversacion de chat entre vendedor y comprador dentro de Wallapop (no existe entrada independiente fuera del chat).
Objetivos:

- Reducir errores logisticos, olvidos y "ghosting" al formalizar fecha, hora, lugar y precio.
- Permitir que el vendedor inicie la propuesta de encuentro.
- Permitir que el comprador acepte o envie una contraoferta.
- Ofrecer notificaciones push interactivas con boton de accion en pantalla bloqueada ("Ya estoy aqui").
- Mostrar un banner o aviso persistente en inicio el dia del encuentro.
- Exportar los detalles del encuentro a calendario (`.ics`).
- Preguntar despues del evento si la venta se completo para impulsar valoraciones.

---

### Reglas de negocio esperadas

- El punto de entrada de Wallapop Meet es el chat con comprador asociado al anuncio; todas las acciones de propuesta/aceptacion nacen en ese contexto.
- Solo el vendedor puede iniciar una propuesta de encuentro.
- El comprador puede aceptar o contraofertar.
- El evento sigue una maquina de estados clara:
  `PROPOSED -> COUNTER_PROPOSED -> CONFIRMED -> ARRIVED -> COMPLETED/EXPIRED/CANCELLED`.
- Las notificaciones push deben ser interactivas y funcionar desde la pantalla bloqueada en iOS y Android.
- La logica de llegada debe respetar una ventana temporal: 15 minutos antes y hasta 2 horas despues de la hora programada.
- La integracion con mapas debe sugerir puntos de encuentro seguros en lugares publicos (por ejemplo, estaciones, centros comerciales o comisarias), permitiendo tambien seleccion personalizada con advertencia de seguridad.
- Debe existir seguimiento posterior para confirmar el estado de la venta entre 24 y 48 horas despues.

---

### Estado de implementacion actual (2026-02-21)

- Entrada desde chat integrada en `wallapop-chat-workspace`.
- CTA secundario circular en `ChatComposer` para iniciar propuesta (`Proponer quedar`) con icono calendario, ubicado a la derecha (junto al boton enviar), visible solo para el vendedor cuando no hay meetup activo.
- Overlay de propuesta responsive:
  - Centrado en desktop/tablet horizontal.
  - Entrada desde abajo en movil.
- Overlay en 3 pasos:
  - Paso 1: selector de punto de encuentro con 2 opciones visibles y acceso a mapa para elegir otro punto seguro o personalizado.
  - Paso 2: fecha y hora.
  - Paso 3: precio final y preferencia de pago (`CASH`, `BIZUM`, `WALLET`).
  - Los pasos posteriores no son navegables si el paso actual no esta completo.
  - Las validaciones del wizard se muestran dentro del overlay (no como error en el hilo de chat).
- Reglas actuales del paso 1 (selector de ubicacion):
  - Siempre hay exactamente 2 puntos seleccionables visibles.
  - El sistema mantiene una cola de las 2 ultimas selecciones.
  - Si se selecciona un punto nuevo desde mapa, entra en primera posicion y desplaza el anterior a segunda.
  - Si se selecciona la opcion inferior en lista, no desaparece la superior; solo cambia el punto activo.
  - Los puntos seguros muestran labels `Punto seguro` + `N ventas`.
  - Los puntos personalizados se muestran con icono de puntero de mapa.
- Mapa en selector de punto:
  - Implementado sobre OpenStreetMap (`react-leaflet`).
  - Permite seleccionar puntos seguros y tambien cualquier punto personalizado pulsando sobre el mapa.
  - Al seleccionar punto personalizado se muestra direccion (reverse geocoding con fallback), distancia y aviso de que no es un punto seguro verificado.
  - El panel inferior de seleccion en mapa se superpone por encima del mapa con prioridad visual.
  - En flujo movil no se muestran controles de zoom `+/-` (zoom por gesto tactil).
- `ChatSecurityBanner` fijado sobre el composer en formato compacto.
- `MeetupCard` mostrando datos de propuesta (lugar, precio final y metodo de pago) una vez creado el meetup.
- `WallapopChatWorkspace` en ancho fluido completo (`w-full`) sin `max-width` en desktop, para evitar margenes laterales blancos y adaptarse al ancho de cada dispositivo.
- Header de buzon simplificado sin accion de menu tipo hamburguesa.
- Accion de "mas opciones" (`ellipsis_horizontal`) ubicada en la cabecera de cada conversacion, alineada a la derecha.
- Cabecera de conversacion con avatar circular de perfil del comprador junto al menu de tres puntos para mayor fidelidad al patron de Wallapop.
- En cabecera de conversacion, la primera linea del bloque contextual muestra el precio del articulo en lugar del nombre del usuario.
- Footer del wizard de propuesta en movil con layout estable en una sola fila:
  - Bloque contextual (articulo/comprador) a la izquierda.
  - CTA principal (`Siguiente`/`Proponer quedada`) a la derecha sin desplazamiento vertical.
  - Titulo de articulo truncado con elipsis para evitar salto de layout.
- Estado de entrega con icono `double_check` unificado en listado y burbujas (`sent` gris, `read` verde), con bubble enviada usando padding horizontal simetrico.
- Buzon de conversaciones con escenario realista: multiples interesados por articulo, textos de chat plausibles e imagen de producto por conversacion.
- Estados comerciales representados en el listado de conversaciones con los indicadores visuales del sistema de diseno:
  - `WithBookmark` (`leadingIndicator="bookmark"`) para anuncios reservados.
  - `WithDeal` (`leadingIndicator="deal"`) para anuncios vendidos.
