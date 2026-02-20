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
- La integracion con mapas debe sugerir puntos de encuentro seguros en lugares publicos (por ejemplo, estaciones, centros comerciales o comisarias).
- Debe existir seguimiento posterior para confirmar el estado de la venta entre 24 y 48 horas despues.

---

### Estado de implementacion actual (2026-02-20)

- Entrada desde chat integrada en `wallapop-chat-workspace`.
- CTA secundario circular en `ChatComposer` para iniciar propuesta (`Proponer quedar`).
- Overlay de propuesta responsive:
  - Centrado en desktop/tablet horizontal.
  - Entrada desde abajo en movil.
- Formulario de propuesta con:
  - Fecha y hora.
  - Punto de encuentro seguro sugerido.
  - Precio final acordado.
- `ChatSecurityBanner` fijado sobre el composer en formato compacto.
- `MeetupCard` mostrando datos de propuesta (lugar y precio final) una vez creado el meetup.
