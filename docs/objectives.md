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

### Estado de implementacion actual (2026-02-22)

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
- Reglas actuales del paso 2 (fecha/hora):
  - El paso arranca sin valor precargado al abrir propuesta, obligando a seleccion manual de dia y hora.
  - El calendario muestra label superior `Dia`, alineado con el patron visual del selector `Hora`.
  - El calendario es interactivo y reutilizable (`CalendarPicker`), con dia seleccionado reforzado en tonos verdes Wallapop.
  - El selector de hora usa `Select` reutilizable con panel de altura fija y scroll interno.
  - El selector de hora ofrece franjas de 15 minutos (`HH:00`, `HH:15`, `HH:30`, `HH:45`) durante todo el dia.
  - En movil, el dropdown de hora se despliega hacia arriba para evitar recorte por viewport.
  - El boton `Siguiente` no se deshabilita; al pulsar sin completar, muestra error global y marca en error los campos faltantes.
- Reglas actuales del paso 3 (importe y pago):
  - El importe usa el componente `Input` del design system.
  - Los metodos de pago usan cards seleccionables con iconografia contextual (`CASH`, `BIZUM`, `WALLET`).
  - El CTA final usa el texto `Enviar propuesta`.
  - El CTA no se deshabilita; al pulsar sin completar, muestra error global y marca en error los campos faltantes.
  - Se permite importe `0` como valor valido.
- Reglas actuales de validacion visual:
  - Mensaje global unificado: `Faltan campos por rellenar`.
  - Cada seccion incompleta muestra mensaje inferior especifico.
  - El color y grosor de error se unifican con la linea de `Input` (`tokens.color.input.ring.error`, 2px).
  - En paso 3, si falta metodo de pago, cada card se marca en error por separado (no con borde envolvente unico).
- Header y footer del wizard componentizados:
  - Cabecera superior del overlay extraida a `MeetupProposalHeader` (paso actual, cierre y barra de progreso).
  - Cabecera interna de pasos extraida a `MeetupWizardStepHeading`.
  - Footer contextual con CTA extraido a `MeetupProposalFooter`.
- Reglas actuales del paso 1 (selector de ubicacion):
  - Siempre hay exactamente 2 puntos seleccionables visibles.
  - El sistema mantiene una cola de las 2 ultimas selecciones.
  - Si se selecciona un punto nuevo desde mapa, entra en primera posicion y desplaza el anterior a segunda.
  - Si se selecciona la opcion inferior en lista, no desaparece la superior; solo cambia el punto activo.
  - Cada card muestra indicador visual `selected` / `unselected` a la derecha:
    - `unselected`: aro fino con centro blanco.
    - `selected`: aro oscuro grueso con centro blanco reducido.
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
- `MeetupCard` adaptada al estilo de mensaje de sistema de Wallapop:
  - Titulo visible: `Propuesta de quedada`.
  - Cuando el actor del chat es `SELLER`, la card se renderiza en el lado derecho de la conversacion.
  - Estado visible en label traducida y en minusculas (`pendiente`, `contraoferta`, `confirmada`, `llegada`, `completada`, `expirada`, `cancelada`).
  - Resumen de datos en 3 filas con icono a la izquierda:
    - Calendario: dia y hora.
    - Mapa: direccion.
    - Billete: metodo de pago + precio.
  - Formato visual del tiempo en card:
    - `dia \u00B7 hora` en la fila de calendario.
    - `metodo \u00B7 precio` en la fila de pago.
  - Boton `Editar` disponible para vendedor mientras la propuesta no este confirmada (`PROPOSED`, `COUNTER_PROPOSED`).
  - Accion critica abreviada en card: `Cancelar`.
  - `Editar` abre el overlay de propuesta reutilizando los datos ya cargados.
- Mapa en card de propuesta:
  - Miniatura superior con render real de mapa (sin controles `+/-`).
  - Sin texto superpuesto sobre la miniatura para evitar crecimiento vertical por direcciones largas.
  - Tap en miniatura abre una previsualizacion en grande, solo lectura, con cierre por `X`.
  - La previsualizacion en grande no incluye buscador ni acciones de seleccion.
- Robustez de datos de ubicacion:
  - La propuesta guarda latitud/longitud (`proposedLocationLat`, `proposedLocationLng`) junto a `proposedLocation`.
  - Se evita depender de geocodificacion en tiempo de render para dibujar mapa en card.
- `WallapopChatWorkspace` en ancho fluido completo (`w-full`) sin `max-width` en desktop, para evitar margenes laterales blancos y adaptarse al ancho de cada dispositivo.
- Layout mobile del workspace ajustado para mantener el composer anclado al fondo sin hueco inferior.
- Header de buzon simplificado sin accion de menu tipo hamburguesa.
- Accion de "mas opciones" (`ellipsis_horizontal`) ubicada en la cabecera de cada conversacion, alineada a la derecha.
- Cabecera de conversacion con avatar circular de perfil del comprador junto al menu de tres puntos para mayor fidelidad al patron de Wallapop.
- En cabecera de conversacion, la primera linea del bloque contextual muestra el precio del articulo en lugar del nombre del usuario.
- Footer del wizard de propuesta en movil con layout estable en una sola fila:
  - Bloque contextual (articulo/comprador) a la izquierda.
  - CTA principal (`Siguiente`/`Enviar propuesta`) a la derecha sin desplazamiento vertical.
  - Titulo de articulo truncado con elipsis para evitar salto de layout.
- Ajuste de botones:
  - `Button.variant=critical` usa radio tipo pill consistente con el resto de botones de accion Wallapop.
- Estado de entrega con icono `double_check` unificado en listado y burbujas (`sent` gris, `read` verde), con bubble enviada usando padding horizontal simetrico.
- Buzon de conversaciones con escenario realista: multiples interesados por articulo, textos de chat plausibles e imagen de producto por conversacion.
- Estados comerciales representados en el listado de conversaciones con los indicadores visuales del sistema de diseno:
  - `WithBookmark` (`leadingIndicator="bookmark"`) para anuncios reservados.
  - `WithDeal` (`leadingIndicator="deal"`) para anuncios vendidos.

---

### Norma interna de implementacion de nuevas secciones

- Al crear una nueva seccion/apartado de UI, reutilizar primero componentes existentes del design system.
- Si el componente necesario no existe:
  - Definirlo y documentarlo siguiendo tokens y reglas del design system.
  - Registrar su story bajo `Design System/*` en Storybook.
  - Implementar despues la seccion funcional consumiendo ese componente (no con UI ad-hoc).
- Antes de mergear, sincronizar cambios de implementacion y documentacion en `plans/design-system/` y `docs/elements/`.
