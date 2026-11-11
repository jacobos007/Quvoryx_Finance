# Quvoryx Finance Local Prototype

Preservation snapshot of the existing August 2026 React/Vite prototype, not the Lovable application and not a production implementation. No new functionality was implemented for this handover. Three customer-specific funding labels were generalized in `src/data.js`; other eight-file source contents are preserved. Original/publication hashes are in the Factory Financial Module `provenance.json`.

## Run Locally

Use Node 24 LTS (historically Node 24.14) and pnpm 11.7.0. Lockfile pins React 19.2.8, Vite 8.2.0, React plugin 6.0.5 and lucide-react 1.28.0. Do not resolve `latest` again.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

The dev command binds to loopback. Alternatively use `pnpm preview` after building. The historical `server.mjs` expects `dist-latest`; build with `pnpm exec vite build --outDir dist-latest` before `node server.mjs`. Optional environment variable `PORT` sets its local port. No database credentials are required. Do not host this development helper publicly.

## Limitations

State is in memory and resets on reload. No authentication, tenancy, durable database, migration runner, test script or approval engine. Configuration, effective-dated rates, budgets, EVM and imports are incomplete or mocked. Do not use for real finance, payable processing or production data. Build success is not feature acceptance.

Authoritative design, defects, scope decisions and Cloud continuation: [Financial Module handover](https://github.com/jacobos007/Quvoryx-AI-Factory/blob/codex/financial-module-cloud-handover-20261111/work-items/FINANCIAL-MODULE/continuation.md).

Lovable remains a separate unpublished project at https://lovable.dev/projects/0be93027-bce1-4b2b-9f4a-9437ba9f286e with recorded source commit `8c1c6b538ab0030193f9db901972814f69e66b79`. Do not replace its connected branch with this prototype. No application merge, deployment, database change or ownership transfer is authorised by this archive.
