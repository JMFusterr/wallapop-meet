La funcionalidad se llama **Wallapop Meet**, un sistema para formalizar encuentros presenciales de compraventa dentro de Wallapop.

### Resumen de la funcionalidad

Wallapop Meet transforma acuerdos informales de chat en un "evento de encuentro" estructurado dentro de la app.
Objetivos:

- Reducir errores logísticos, olvidos y "ghosting" al formalizar fecha, hora, lugar y precio.
- Permitir que el vendedor inicie la propuesta de encuentro.
- Permitir que el comprador acepte o envíe una contraoferta.
- Ofrecer notificaciones push interactivas con botón de acción en pantalla bloqueada ("Ya estoy aquí").
- Mostrar un banner o aviso persistente en inicio el día del encuentro.
- Exportar los detalles del encuentro a calendario (`.ics`).
- Preguntar después del evento si la venta se completó para impulsar valoraciones.

---

### Reglas de negocio esperadas

- Solo el vendedor puede iniciar una propuesta de encuentro.
- El comprador puede aceptar o contraofertar.
- El evento sigue una máquina de estados clara:
  `PROPOSED -> COUNTER_PROPOSED -> CONFIRMED -> ARRIVED -> COMPLETED/EXPIRED/CANCELLED`.
- Las notificaciones push deben ser interactivas y funcionar desde la pantalla bloqueada en iOS y Android.
- La lógica de llegada debe respetar una ventana temporal: 15 minutos antes y hasta 2 horas después de la hora programada.
- La integración con mapas debe sugerir puntos de encuentro seguros en lugares públicos (por ejemplo, estaciones, centros comerciales o comisarías).
- Debe existir seguimiento posterior para confirmar el estado de la venta entre 24 y 48 horas después.
