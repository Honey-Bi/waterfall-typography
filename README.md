# Waterfall Typography

An interactive canvas animation of falling letters, built with React and TypeScript.

## Development

Use Node.js 24 LTS. Install locked dependencies with `npm ci`, then run `npm start`
to open the development server at `http://127.0.0.1:3000/waterfall-typography/`.

## Checks

- `npm run build` checks TypeScript, creates `build/`, and verifies generated HTML and asset paths.
- `npm test` checks canvas animation, pointer interaction, resizing and cleanup.
- `npm run check:dependencies` verifies that retired vulnerable build dependencies are absent.
- `npm run preview` serves the production build locally.

## Deployment

`npm run deploy` builds and publishes `build/` to the `gh-pages` branch, as before.
The page base path is `/waterfall-typography/`.

## Dependency maintenance

Dependabot checks npm dependencies every Monday at 09:00 Asia/Seoul and groups
security fixes. Pull requests run installation, build, tests and a local check
for retired build dependencies. These local checks do not replace a full
advisory audit. A full dependency audit is required before enabling automatic
merging.

Create React App and its deprecated webpack/Jest tree were replaced with Vite
and Vitest to remove the reported build-tool dependency chains.
