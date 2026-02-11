# Repository Guidelines

Wallapop Meet formalizes in-person transaction meetups inside the Wallapop app. The feature turns chat agreements into a structured meetup event with clear states, interactive notifications, and post-meet follow-up.

## Project Structure & Module Organization

- `docs/objectives.md`: product goals and business rules for Wallapop Meet.
- `styles.json`: design tokens and component defaults (if used by the feature).
- No `src/`, `tests/`, or `assets/` directories are present in this checkout.

If you add implementation code, keep domain logic under a dedicated module (e.g., `src/meetup/`) and separate integrations (push, maps, calendar) into `src/integrations/`.

## Build, Test, and Development Commands

No build, test, or dev scripts are configured. When tooling is added, document the commands here. Example placeholders:

- `npm run dev`: run the local app or simulator.
- `npm test`: run unit and integration tests for meetup flows.

## Coding Style & Naming Conventions

- Use 4-space indentation in JSON files (match `styles.json`).
- Prefer clear state naming aligned with the meetup state machine: `PROPOSED`, `COUNTER_PROPOSED`, `CONFIRMED`, `ARRIVED`, `COMPLETED`, `EXPIRED`, `CANCELLED`.
- Keep business rules explicit and co-located with the feature (e.g., arrival window validation and seller-only initiation).

If you introduce linters/formatters, add their commands and configuration paths.

## Testing Guidelines

No testing framework is configured. If tests are added, include coverage for:

- State transitions and invalid transitions.
- Arrival time window (15 minutes before to 2 hours after).
- Seller-only proposal logic and buyer counterproposal flow.

Place tests under `tests/` and name files clearly (e.g., `meetup.state.test.js`).

## Commit & Pull Request Guidelines

No commit history is available in this checkout. Use a consistent format such as:

- `feat(meetup): add counterproposal flow`
- `fix(notifications): handle lock screen action`

PRs should include a clear description, linked issue (if any), and screenshots or logs for UX-facing changes (push notifications, banners).

## Security & Configuration Tips

Do not hardcode API keys for maps or push services. Use environment-specific configuration files and document required variables when you add them.
