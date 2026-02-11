# Guía del Repositorio

Wallapop Meet formaliza encuentros presenciales de compraventa dentro de Wallapop. Convierte acuerdos de chat en un evento estructurado con estados claros, notificaciones interactivas y seguimiento posterior.

## Idioma de trabajo

- A partir de este punto, toda la documentación, propuestas y entregables deben redactarse en español.
- Excepción: identificadores técnicos y estados de máquina (`PROPOSED`, `CONFIRMED`, etc.) se mantienen en inglés para evitar inconsistencias en implementación.

## Estructura del proyecto

- `docs/objectives.md`: objetivos de producto y reglas de negocio de Wallapop Meet.
- `styles.json`: tokens de diseño y configuración base de componentes.
- `plans/design-system/`: documentación del sistema de diseño (plan, tokens, componentes, patrones y QA).
- Actualmente no existen `src/`, `tests/` ni `assets/`.

Si se añade implementación:
- Lógica de dominio en `src/meetup/`.
- Integraciones (push, mapas, calendario) en `src/integrations/`.

## Comandos de build, test y desarrollo

No hay scripts configurados todavía. Cuando se incorporen herramientas, documentarlas aquí.

Ejemplos de referencia:
- `npm run dev`: ejecutar app/simulador local.
- `npm test`: ejecutar pruebas unitarias e integración de flujos de meetup.

## Estilo de código y nomenclatura

- Usar indentación de 4 espacios en archivos JSON (alineado con `styles.json`).
- Mantener nombres de estado alineados con la máquina de estados:
  `PROPOSED`, `COUNTER_PROPOSED`, `CONFIRMED`, `ARRIVED`, `COMPLETED`, `EXPIRED`, `CANCELLED`.
- Mantener reglas de negocio explícitas y cercanas a la funcionalidad (ventana de llegada, inicio exclusivo del vendedor, etc.).
- Evitar valores hardcodeados en componentes cuando existan tokens.

## Directrices específicas del sistema de diseño

- El plan maestro está en `plans/design-system/design-system-wallapop-meet-plan.md`.
- La especificación de tokens está en `plans/design-system/design-tokens-v1.md`.
- La especificación de componentes está en `plans/design-system/components-spec-v1.md`.
- Los patrones de flujo de meetup están en `plans/design-system/meetup-ui-patterns-v1.md`.
- El checklist de validación está en `plans/design-system/accessibility-qa-checklist.md`.

Al modificar tokens o componentes:
- Actualizar `styles.json` y la documentación correspondiente en `plans/design-system/`.
- Verificar que estados críticos (`disabled`, `loading`, `error`) estén cubiertos.

## Guía de testing

No hay framework de testing configurado todavía. Si se agregan pruebas, cubrir como mínimo:
- Transiciones válidas e inválidas de estado.
- Ventana de llegada (15 minutos antes a 2 horas después).
- Lógica de propuesta exclusiva del vendedor y contraoferta del comprador.

Ubicar pruebas en `tests/` con nombres claros (ejemplo: `meetup.state.test.js`).

## Commits y Pull Requests

Usar mensajes consistentes, por ejemplo:
- `feat(meetup): añadir flujo de contraoferta`
- `fix(notifications): corregir acción en pantalla bloqueada`

Las PR deben incluir:
- Descripción clara del cambio.
- Issue enlazada (si aplica).
- Capturas o logs para cambios de UX (push, banners, estados visuales).

## Seguridad y configuración

- No hardcodear claves de API (mapas, push, calendario).
- Usar configuración por entorno y documentar variables requeridas.
- Registrar fuente y fecha cuando se use una referencia oficial de diseño para evitar desalineaciones futuras.
