# Wallapop Meet

Wallapop Meet formaliza acuerdos de chat en encuentros presenciales con estados de negocio claros y UI reutilizable.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Storybook
- Convex
- Vitest

## Estructura

- `src/`: app y componentes.
- `src/meetup/`: dominio (maquina de estados, reglas y tipos).
- `plans/design-system/`: especificaciones modulares del Design System.
- `DESIGN_SYSTEM.md`: contrato maestro de gobernanza del DS.
- `styles.json`: fuente canonica de tokens.
- `scripts/audit-design-system.mjs`: auditoria de hardcodes visuales.

## Comandos

- `npm run dev`: desarrollo local.
- `npm run build`: build de produccion.
- `npm run preview`: preview del build.
- `npm run test`: pruebas con Vitest.
- `npm run storybook`: Storybook local.
- `npm run build-storybook`: build estatico de Storybook.
- `npm run audit:design-system`: valida que no entren nuevos hardcodes visuales en `src`.
- `npm run audit:design-system:baseline`: actualiza baseline del auditor DS.
- `npm run lint`: ejecuta auditoria DS + ESLint.

## Regla obligatoria de cierre

Si hay cambios en el proyecto, ejecutar y validar:

1. `npm run lint`
2. `npm test`
3. `npm run build`
4. `npx convex dev --once`

## Documentacion DS

- Contrato maestro: `DESIGN_SYSTEM.md`
- Tokens: `plans/design-system/design-tokens-v1.md`
- Componentes: `plans/design-system/components-spec-v1.md`
- Patrones: `plans/design-system/meetup-ui-patterns-v1.md`
- QA y accesibilidad: `plans/design-system/accessibility-qa-checklist.md`
