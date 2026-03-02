# Wallapop Meet

Wallapop Meet es la funcionalidad que convierte acuerdos informales de chat en un encuentro presencial estructurado, trazable y accionable dentro de Wallapop.

El objetivo de producto es reducir friccion operativa (olvidos, cambios de ultima hora, no-shows) mediante una maquina de estados explicita, reglas por rol y evidencias de asistencia.

## Que resuelve

- Formaliza fecha, hora, punto de encuentro y precio final dentro del chat.
- Limita acciones por rol: el vendedor inicia, el comprador acepta o contraoferta.
- Gestiona el ciclo completo del meetup desde propuesta hasta cierre o cancelacion.
- Habilita check-in con ventana temporal controlada y validacion de proximidad.
- Permite exportar la cita a calendario (`.ics`) y ejecutar seguimiento post-encuentro.

## Logica funcional de Wallapop Meet

### Punto de entrada

Wallapop Meet siempre nace desde una conversacion de chat vinculada a un anuncio (`conversationId`, `listingId`, `sellerUserId`, `buyerUserId`).

### Estados de negocio

- `PROPOSED`
- `COUNTER_PROPOSED`
- `CONFIRMED`
- `ARRIVED`
- `COMPLETED`
- `CANCELLED`

### Reglas por rol (resumen)

- `SELLER`:
  - Puede `PROPOSE` desde estado inicial (`null`), desde `COUNTER_PROPOSED` y tras `CANCELLED`.
  - Puede `COMPLETE` unicamente cuando el meetup esta en `ARRIVED`.
  - Puede reportar no-show (`REPORT_NO_SHOW`) y confirmar contradiccion (`CONFIRM_NO_SHOW_FINAL`).
- `BUYER`:
  - Puede `ACCEPT`, `COUNTER_PROPOSE` y `CANCEL` cuando aplica segun estado.
  - No puede iniciar meetup desde estado inicial.

### Reglas temporales criticas

- Ventana de llegada (`MARK_ARRIVED`): desde **30 minutos antes** hasta **2 horas despues** de `scheduledAt`.
- Zona roja de cancelacion: ultimos **30 minutos** antes de `scheduledAt` (genera impacto de fiabilidad).
- No-show: requiere **5 minutos de cortesia** tras la hora pactada antes de poder reportarse.

### Flujo principal

1. `SELLER` envia `PROPOSE`.
2. `BUYER` acepta (`ACCEPT`) o plantea cambios (`COUNTER_PROPOSE`).
3. Con aceptacion valida, pasa a `CONFIRMED`.
4. En ventana activa, cualquiera puede marcar llegada (`MARK_ARRIVED`) y el estado pasa a `ARRIVED`.
5. Solo `SELLER` cierra venta (`COMPLETE`) y pasa a `COMPLETED`.
6. Si hay incidencia, puede terminar en `CANCELLED` con motivo explicito (`MANUAL_CANCEL`, `NO_SHOW_BUYER`, etc.).

## Arquitectura del proyecto

- `src/meetup/`: dominio de Wallapop Meet (tipos, maquina de estados, reglas temporales).
- `src/components/meetup/`: componentes y reglas de UI del flujo meetup.
- `src/`: aplicacion React + TypeScript (Vite).
- `tests/`: pruebas unitarias e integracion de reglas de dominio y UI.
- `docs/`: objetivos y user flow funcional.
- `plans/design-system/`: contrato y especificaciones del Design System.
- `styles.json`: fuente canonica de tokens de diseno.

## Stack tecnico

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Storybook
- Convex
- Vitest

## Puesta en marcha

```bash
npm install
npm run dev
```

## Scripts disponibles

- `npm run dev`: arranca entorno local.
- `npm run build`: compila TypeScript y build de Vite.
- `npm run preview`: sirve build de produccion localmente.
- `npm test`: ejecuta pruebas con Vitest.
- `npm run storybook`: levanta Storybook en local.
- `npm run build-storybook`: genera build estatico de Storybook.
- `npm run ds:sync`: sincroniza catalogo de Design System.
- `npm run ds:check`: valida sincronizacion DS (componentes/stories/tokens).
- `npm run audit:design-system`: detecta hardcodes visuales prohibidos en `src`.
- `npm run audit:design-system:baseline`: actualiza baseline del auditor DS.
- `npm run lint`: ejecuta auditoria DS + validacion + ESLint.

## Criterio obligatorio antes de cerrar cambios

Si hay modificaciones en el proyecto, validar:

1. `npm run lint`
2. `npm test`
3. `npm run build`
4. `npx convex dev --once`

## Calidad y pruebas

La suite cubre, entre otros, estos casos:

- Transiciones validas e invalidas por estado y rol.
- Ventana de llegada y limites exactos de tiempo.
- No-show con cortesia minima de 5 minutos.
- Impacto de fiabilidad en cancelacion en zona roja.
- Reapertura del flujo tras `CANCELLED` por parte del vendedor.

## Documentacion relevante

- Objetivos de producto: `docs/objectives.md`
- User flow oficial: `docs/wallapop-meet-user-flow.md`
- Contrato de gobernanza DS: `DESIGN_SYSTEM.md`
- Tokens DS: `plans/design-system/design-tokens-v1.md`
- Componentes DS: `plans/design-system/components-spec-v1.md`
- Patrones meetup: `plans/design-system/meetup-ui-patterns-v1.md`
- Checklist QA/accesibilidad: `plans/design-system/accessibility-qa-checklist.md`

## Convenciones de contribucion

- Mantener los estados de maquina exactamente como estan definidos (`PROPOSED`, `CONFIRMED`, etc.).
- Evitar hardcodes visuales en `src`; usar siempre tokens.
- Todo cambio de UI debe apoyarse en componentes reutilizables del Design System.
- El subject de los commits debe ir en ingles.
