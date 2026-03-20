# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router pages, feature modules, and shared UI components (e.g. `app/components/`, `app/alpha/`, `app/insight/`).
- `app/store/` holds Redux slices and the store setup.
- `app/i18n/` and `public/locales/` contain i18n configuration and translations.
- `public/` is for static assets (images, icons, etc.).
- `pages/` exists but most routes appear under `app/`; check for legacy pages before adding new ones.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server on port 3002.
- `npm run build` — production build.
- `npm run build:test` — build with test environment settings.
- `npm run start` — run the production server.
- `npm run lint` — run ESLint (Next.js config).
- `npm run deploy:test` — build + restart test PM2 process.

## Coding Style & Naming Conventions
- TypeScript + React (Next.js App Router). Use 2‑space indentation in TS/TSX.
- Components: PascalCase file and component names (e.g. `AlphaCard.tsx`).
- Hooks and local state: camelCase.
- Styles: `.scss` modules per feature (e.g. `Alpha.scss`) plus Tailwind utility classes.

## Testing Guidelines
- No test framework is configured. If adding tests, document the framework and add scripts in `package.json`.
- Keep component logic testable and avoid side‑effects in render.

## Commit & Pull Request Guidelines
- Commits follow a simple prefix style: `feat: ...`, `fix: ...`, `styles: ...`.
- PRs should include: a short description, linked issue (if any), and screenshots/GIFs for UI changes.

## Configuration & Security Tips
- Environment variables live in `.env.*` files; do not commit secrets.
- i18n keys should be added to all locales in `public/locales/*/common.json`.
