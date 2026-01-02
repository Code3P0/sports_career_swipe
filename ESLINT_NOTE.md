# ESLint Configuration Note

ESLint 9.x has compatibility issues with Next.js's `next lint` command when using the legacy `.eslintrc.json` format.

**Current Status:** ESLint is configured but `npm run lint` may fail due to Next.js/ESLint 9 compatibility issues.

**Workaround:** 
- Use `npm run check` (skips lint) for CI/CD
- Use `npm run check:full` (includes lint) for local development
- ESLint rules are defined in `.eslintrc.json` and will work once compatibility is resolved

**Future:** Consider migrating to ESLint flat config (`eslint.config.mjs`) when Next.js fully supports it.

