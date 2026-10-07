# Demo Sites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four themed, satirical practice websites (React, Vue, ASP.NET Core, PHP) under `packages/demo/sites/`, each embedding the Zocdoc API components through a different integration pattern, plus a Playwright + axe smoke check and docs.

**Architecture:** Each site is a pnpm workspace package with a `dev` script on a fixed port. React and Vue import the library from `workspace:*` like npm consumers. ASP.NET and PHP load only the prebuilt IIFE bundle and theme CSS, which `sync-assets.ts` copies in. Every site defaults to mock fixtures. Branding comes from overriding `--zd-*` palette and font tokens in a per-site `theme.css`.

**Tech Stack:** React 19, React Router 7, Vue 3.5, Vue Router 4, Vite 7, TypeScript 5.9, ASP.NET Core Razor Pages on .NET 10 (SDK 10.0.401 installed), PHP 8.5 (`php -S`), Playwright 1.62 + axe-core 4.12 (already root devDependencies), `oxnode` for TS scripts.

**Spec:** `docs/superpowers/specs/2026-10-07-demo-sites-design.md`

## Global Constraints

- Ports: React **5181**, Vue **5182**, PHP **8081**, ASP.NET **8082**. Use `--strictPort` / explicit URLs so a busy port fails rather than drifting.
- Package names: `demo-site-hillbilly-dentistry`, `demo-site-eye-caramba`, `demo-site-synergy-partners`, `demo-site-toe-truck`.
- Fixtures by default. Live only when `VITE_ZOCDOC_MODE=live` (React/Vue) or `ZOCDOC_MODE=live` (ASP.NET/PHP) **and** a token is set. Live without a token falls back to fixtures with a visible warning.
- Search inputs: ZIP `11201` everywhere. Specialty `sp_154` for Hillbilly and `sp_153` for Synergy Partners. Eye Caramba and Toe Truck search `sp_153` in mock mode, because no fixture provider has `sp_155` or a podiatry specialty. Their live-mode specialty is configurable.
- Every page shows a demo-mode ribbon: "Demo mode — sample data, no real appointments" (mock) / "Live sandbox" (live).
- No patient field values in any console output, toast, panel, or DOM text written by site code (PHI-001). Error UI never shows an error's message (CLIENT-003).
- Google Fonts and CDN images are allowed. No analytics or tracking. Links to zocdoc.com use `?referrerType=demo-site&component=<site>` (TS-019).
- One `<h1>` per page. `header`/`nav`/`main`/`footer` landmarks. `lang="en"` on `<html>`. Visible `:focus-visible` styles. AA contrast. axe must report zero violations.
- Site CSS: native nesting with `&`, plain semantic class names, no BEM (STYLE-001/002). Logical properties only (`margin-inline`, `padding-block`, `inset-inline-start`), with no `left`/`right`/`margin-left` etc. (I18N-003). Blog dates via `Intl.DateTimeFormat` (I18N-002).
- SVG art lives in `.svg` files referenced via `<img>` (TS-019).
- Don't edit anything under `packages/api-components` or `packages/primitives`. If a site needs a library change, stop and record it in `packages/demo/sites/README.md` under "Library follow-ups".
- Never read `**/custom-elements.json` or `packages/*/dist/` contents (CLAUDE.md). Listing filenames in `dist` is fine.
- Commits end with:
  ```
  Generated with AI

  Co-Authored-By: Claude Code
  ```

## Review Focus

1. **Server sites started before the library is built.** `dist/bundle/zocdoc.js` is missing. Expected: `sync-assets` exits non-zero with a message naming the build commands, not a page that silently 404s its script. Test in Task 2.
2. **Live mode requested without a token.** Expected: fixtures and a visible warning on the ribbon, never unauthenticated live requests. Checked per site in Tasks 3, 4, 5 and 6 (manual env check step).
3. **Unknown provider id on the ASP.NET detail page** (`/leaders/pr_nope|lo_nope`). Expected: the "pivoted to new opportunities" state with a link back, HTTP 200, no exception page. Test in Task 5.
4. **Unknown blog slug in PHP** (`/post.php?slug=nope`). Expected: a 404 page in the site's theme, not a PHP warning. Test in Task 6.
5. **`booking_failed` arriving on a 200 in the Vue host-books path.** Expected: a friendly retry message, not the confirmation and not the error text. Test in Task 4 Step 2b (`isBooked` unit test).

---

## File Structure

```
pnpm-workspace.yaml                          (modify) add sites glob
package.json                                 (modify) demo:sites, demo:sites:smoke, sites:sync
.gitignore                                   (modify) synced assets, .NET bin/obj
tsconfig.json                                (modify) include sites/*.ts scripts
packages/demo/sites/
  README.md                                  prerequisites, run, modes, exemptions, follow-ups
  sync-assets.ts                             copy bundle + theme + fixture images into server sites
  sync-assets.test.ts                        node:test check for missing-dist failure
  smoke.ts                                   Playwright + axe across all four
  hillbilly-dentistry/
    package.json  index.html  vite.config.ts  tsconfig.json
    src/art/tooth-hat.svg   (imported; publicDir is the repo's static/ for fixture photos)
    src/main.tsx            entry: CSS, config, router
    src/config.ts           mock/live switch (Vite env)
    src/Layout.tsx          header/nav/ribbon/footer
    src/pages/Home.tsx  src/pages/MeetTheDoc.tsx  src/pages/Book.tsx
    src/theme.css           --zd-* overrides
    src/site.css            site styles
  eye-caramba/
    package.json  index.html  vite.config.ts  tsconfig.json  env.d.ts
    src/art/eye.svg
    src/booking-status.ts  src/booking-status.test.ts   isBooked() status rule
    src/main.ts  src/config.ts  src/App.vue
    src/router.ts
    src/pages/Home.vue  src/pages/Frames.vue  src/pages/Book.vue
    src/components/BookingFlow.vue   composed state machine
    src/components/EventLog.vue      "Under the hood" panel (names only)
    src/theme.css  src/site.css
  synergy-partners/
    package.json  SynergyPartners.csproj  Program.cs  appsettings.json  Properties/launchSettings.json
    ZocdocOptions.cs
    Pages/_ViewImports.cshtml  Pages/_ViewStart.cshtml
    Pages/Shared/_Layout.cshtml  Pages/Shared/_ZocdocScript.cshtml
    Pages/Index.cshtml  Pages/About.cshtml
    Pages/Leaders/Index.cshtml  Pages/Leaders/Detail.cshtml(+.cs)
    wwwroot/css/theme.css  wwwroot/css/site.css
    wwwroot/js/roster.js   wwwroot/js/leader.js
    wwwroot/art/synergy.svg
  toe-truck/
    package.json  router.php
    public/index.php  public/post.php  public/book.php  public/404.php
    public/css/theme.css  public/css/site.css  public/art/tow-hook.svg
    includes/config.php  includes/posts.php
    includes/header.php  includes/footer.php  includes/sidebar.php  includes/zocdoc-script.php
packages/docs/src/content/docs/guides/frameworks.mdx   (modify) script-tag + "see it" sections
```

---

### Task 1: Workspace wiring

**Files:**
- Modify: `pnpm-workspace.yaml`, `package.json`, `.gitignore`, `tsconfig.json`

**Interfaces:**
- Produces: workspace glob `./packages/demo/sites/*`; root scripts `sites:sync`, `demo:sites`, `demo:sites:smoke`.

- [ ] **Step 1: Add the workspace glob**

`pnpm-workspace.yaml`:
```yaml
packages:
  - './packages/*'
  - './packages/demo/sites/*'
```

- [ ] **Step 2: Add root scripts** (in `package.json` `scripts`, after `"demo"`):
```json
"sites:sync": "oxnode packages/demo/sites/sync-assets.ts",
"demo:sites": "pnpm run sites:sync && pnpm --filter \"./packages/demo/sites/*\" --parallel dev",
"demo:sites:smoke": "oxnode packages/demo/sites/smoke.ts",
```

- [ ] **Step 3: Ignore generated files.** Append to `.gitignore`:
```
# Demo sites: copied library assets and .NET build output
packages/demo/sites/synergy-partners/wwwroot/zocdoc/
packages/demo/sites/synergy-partners/wwwroot/images/
packages/demo/sites/toe-truck/public/zocdoc/
packages/demo/sites/toe-truck/public/images/
packages/demo/sites/synergy-partners/bin/
packages/demo/sites/synergy-partners/obj/
```

- [ ] **Step 4: Typecheck the scripts.** In `tsconfig.json` `include`, add `"packages/demo/sites/*.ts"`.

- [ ] **Step 5: Commit** (`git add pnpm-workspace.yaml package.json .gitignore tsconfig.json`; message `wire demo sites into the workspace`). Task 1 doesn't run `pnpm install`: the glob matches nothing yet. Task 3 runs it.

---

### Task 2: `sync-assets.ts`

Copies built library files into the two server sites.

**Files:**
- Create: `packages/demo/sites/sync-assets.ts`, `packages/demo/sites/sync-assets.test.ts`

**Interfaces:**
- Produces: `syncAssets(options?: { root?: string; targets?: string[] }): Promise<void>`, exported. It throws `Error` with a message containing `pnpm build` when a source is missing. Run as a script, it syncs into `synergy-partners/wwwroot` and `toe-truck/public`, creating `zocdoc/zocdoc.js`, `zocdoc/zocdoc.js.map`, `zocdoc/all.css`, and `images/*`.

- [ ] **Step 1: Write the failing test** (`node:test`, so no new framework is added):

```ts
// packages/demo/sites/sync-assets.test.ts
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncAssets } from './sync-assets.ts';

test('fails with the build command when the bundle has not been built', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sync-'));
  await assert.rejects(syncAssets({ root, targets: [join(root, 'out')] }), /pnpm build/);
});

test('copies bundle, theme, and fixture images into each target', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sync-'));
  await mkdir(join(root, 'packages/api-components/dist/bundle'), { recursive: true });
  await mkdir(join(root, 'packages/primitives/dist/theme'), { recursive: true });
  await mkdir(join(root, 'static/images'), { recursive: true });
  await writeFile(join(root, 'packages/api-components/dist/bundle/zocdoc.js'), 'js');
  await writeFile(join(root, 'packages/api-components/dist/bundle/zocdoc.js.map'), '{}');
  await writeFile(join(root, 'packages/primitives/dist/theme/all.css'), 'css');
  await writeFile(join(root, 'static/images/a.png'), 'png');

  const target = join(root, 'out');
  await syncAssets({ root, targets: [target] });

  assert.equal(await readFile(join(target, 'zocdoc/zocdoc.js'), 'utf8'), 'js');
  assert.equal(await readFile(join(target, 'zocdoc/all.css'), 'utf8'), 'css');
  assert.equal(await readFile(join(target, 'images/a.png'), 'utf8'), 'png');
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run: `node --experimental-strip-types --test packages/demo/sites/sync-assets.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// packages/demo/sites/sync-assets.ts
/**
 * Copies the built library into the two server-rendered demo sites.
 *
 * The ASP.NET and PHP sites deliberately know nothing about the monorepo: they serve two files
 * and a folder of fixture photos, exactly what a partner on those stacks would download. This
 * script is the "download" step. It copies whatever is in `dist`, so it refuses to run against a
 * missing build rather than leaving a page whose script tag 404s.
 */
import { access, cp, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '../../..');

const BUILD_HINT =
  'Build the library first: `pnpm build && pnpm --filter @zocdoc/api-components build:bundle`.';

export interface SyncOptions {
  root?: string;
  targets?: string[];
}

export async function syncAssets({
  root = DEFAULT_ROOT,
  targets = [join(HERE, 'synergy-partners/wwwroot'), join(HERE, 'toe-truck/public')],
}: SyncOptions = {}): Promise<void> {
  const files = {
    'zocdoc/zocdoc.js': join(root, 'packages/api-components/dist/bundle/zocdoc.js'),
    'zocdoc/zocdoc.js.map': join(root, 'packages/api-components/dist/bundle/zocdoc.js.map'),
    'zocdoc/all.css': join(root, 'packages/primitives/dist/theme/all.css'),
  };
  const images = join(root, 'static/images');

  for (const source of [...Object.values(files), images]) {
    try {
      await access(source);
    } catch {
      throw new Error(`Missing ${source}. ${BUILD_HINT}`);
    }
  }

  for (const target of targets) {
    for (const [name, source] of Object.entries(files)) {
      const destination = join(target, name);
      await mkdir(dirname(destination), { recursive: true });
      await cp(source, destination);
    }
    await cp(images, join(target, 'images'), { recursive: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await syncAssets();
  } catch (error) {
    // A build hint, not data — safe to print.
    process.stderr.write(`${(error as Error).message}\n`);
    process.exit(1);
  }
}
```

- [ ] **Step 4: Run the tests and confirm they pass.** Same command. Expected: 2 passing.

- [ ] **Step 5: Smoke the real script.** Run `pnpm build && pnpm --filter @zocdoc/api-components build:bundle && pnpm sites:sync`. Expected: exit 0, and `packages/demo/sites/toe-truck/public/zocdoc/zocdoc.js` exists.

- [ ] **Step 6: Lint, format, commit.** `pnpm lint && pnpm format:check`. Commit both files: `add sync-assets for server-rendered demo sites`.

---

### Task 3: Hillbilly Dentistry (React)

**Files:** everything under `packages/demo/sites/hillbilly-dentistry/` listed in File Structure.

**Interfaces:**
- Consumes: `ZdBooking`, `type ZdBookingElementEvent` from `@zocdoc/api-components/react`; `configureZocdoc`, `type BookingCompleteDetail` from `@zocdoc/api-components`; `configureZocdocMock` from `@zocdoc/api-components/mock`.
- Produces: dev server at `http://localhost:5181`, routes `/`, `/meet-the-doc`, `/book`. Ribbon element `.demo-ribbon`.

- [ ] **Step 1: Package and config**

`package.json`:
```json
{
  "name": "demo-site-hillbilly-dentistry",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5181 --strictPort",
    "build": "tsc --noEmit && vite build"
  },
  "dependencies": {
    "@zocdoc/api-components": "workspace:*",
    "@zocdoc/api-primitive-components": "workspace:*",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router": "^7.9.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.9.3",
    "vite": "^7.1.5"
  }
}
```

`vite.config.ts`:
```ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One token file for the whole repo, as in packages/demo.
  envDir: resolve(import.meta.dirname, '../../../..'),
  // Fixture provider photos are root-relative (`/images/…`), so serve the repo's static folder.
  publicDir: resolve(import.meta.dirname, '../../../../static'),
});
```
Because `publicDir` points at the repo's `static/`, the site's own art goes in `src/art/` and is imported (Vite fingerprints it), not in `public/`. 

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "jsx": "react-jsx", "strict": true, "skipLibCheck": true, "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Run `pnpm install` from the repo root. Expected: the new package is linked and the lockfile is updated.

- [ ] **Step 2: `src/config.ts`.** The mock/live switch is copied in shape from `packages/demo/src/config.ts`:

```ts
import { configureZocdoc } from '@zocdoc/api-components';
import { configureZocdocMock } from '@zocdoc/api-components/mock';

const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

export interface SiteMode {
  mode: 'mock' | 'live';
  warning?: string;
}

/** Fixtures unless live is asked for *and* possible. See packages/demo/src/config.ts. */
export function configureSite(): SiteMode {
  const token = import.meta.env.VITE_ZOCDOC_TOKEN;
  if (import.meta.env.VITE_ZOCDOC_MODE === 'live') {
    if (!token) {
      configureZocdocMock();
      return { mode: 'mock', warning: 'Live mode needs VITE_ZOCDOC_TOKEN — showing sample data.' };
    }
    configureZocdoc({
      baseUrl: import.meta.env.VITE_ZOCDOC_BASE_URL ?? SANDBOX_BASE_URL,
      getToken: () => token, // a function, per request (CLIENT-002)
    });
    return { mode: 'live' };
  }
  configureZocdocMock();
  return { mode: 'mock' };
}
```

- [ ] **Step 3: `index.html` and `src/main.tsx`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hillbilly Dentistry</title>
    <link rel="icon" href="data:," />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Rye&family=Zilla+Slab:wght@400;600;700&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
// src/main.tsx
import '@zocdoc/api-primitive-components/theme/all.css';
import './theme.css';
import './site.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { configureSite } from './config.ts';
import { Layout } from './Layout.tsx';
import { Home } from './pages/Home.tsx';
import { MeetTheDoc } from './pages/MeetTheDoc.tsx';
import { Book } from './pages/Book.tsx';

const mode = configureSite();

const router = createBrowserRouter([
  {
    element: <Layout mode={mode} />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/meet-the-doc', element: <MeetTheDoc /> },
      { path: '/book', element: <Book /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```
`configureZocdoc` imports from the package root, which registers every API component (frameworks guide caution).

- [ ] **Step 4: `src/Layout.tsx`**

```tsx
import { NavLink, Outlet } from 'react-router';
import type { SiteMode } from './config.ts';
import toothHat from './art/tooth-hat.svg';

export function Layout({ mode }: { mode: SiteMode }) {
  return (
    <>
      <p className="demo-ribbon" role="note">
        {mode.mode === 'live' ? 'Live sandbox' : 'Demo mode — sample data, no real appointments'}
        {mode.warning ? ` · ${mode.warning}` : null}
      </p>
      <header className="site-header">
        <NavLink to="/" className="brand">
          <img src={toothHat} alt="" width="56" height="56" />
          <span>Hillbilly Dentistry</span>
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/meet-the-doc">Meet the Doc</NavLink>
          <NavLink to="/book" className="cta">Book Now</NavLink>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Hillbilly Dentistry · Est. whenever Pa found the pliers · Open till the cows come home</p>
        <p>
          Booking powered by{' '}
          <a href="https://www.zocdoc.com/?referrerType=demo-site&component=hillbilly-dentistry">
            Zocdoc
          </a>
        </p>
      </footer>
    </>
  );
}
```

- [ ] **Step 5: Pages**

```tsx
// src/pages/Home.tsx
import { Link } from 'react-router';

const SERVICES = [
  { name: 'Moonshine Damage Repair', blurb: 'What the still took, we give back. Mostly.' },
  { name: 'Full Set of Teeth — Not Just Some', blurb: 'Why settle for the seven you got?' },
  { name: 'Banjo-Assisted Sedation', blurb: 'Dueling banjos until you plumb forget the drill.' },
  { name: 'Gold Tooth Appraisals', blurb: 'Free with any cleaning. Pawn shop not included.' },
];

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">We'll fix what the moonshine took.</h1>
        <p>Family dentistry for families, cousins, and folks who are both.</p>
        <Link to="/book" className="button-link">Book a cleanin'</Link>
      </section>
      <section aria-labelledby="services-title" className="services">
        <h2 id="services-title">Our Services</h2>
        <ul>
          {SERVICES.map((service) => (
            <li key={service.name} className="service">
              <h3>{service.name}</h3>
              <p>{service.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

```tsx
// src/pages/MeetTheDoc.tsx
export function MeetTheDoc() {
  return (
    <article className="prose">
      <h1>Meet the Doc</h1>
      <p>
        Doc earned a dental degree by correspondence course and a black belt in tooth-pulling
        on the county fair circuit. Three-time winner of the Apple Bobbing Smile Contest.
      </p>
      <h2>Our Promise</h2>
      <p>No appointment will ever be interrupted by a goat. We cannot promise the same for chickens.</p>
    </article>
  );
}
```

```tsx
// src/pages/Book.tsx
import { useState } from 'react';
import type { BookingCompleteDetail } from '@zocdoc/api-components';
import { ZdBooking, type ZdBookingElementEvent } from '@zocdoc/api-components/react';

type CompleteEvent = ZdBookingElementEvent<CustomEvent<BookingCompleteDetail>>;

export function Book() {
  const [toast, setToast] = useState<string>();

  return (
    <section className="book" aria-labelledby="book-title">
      <h1 id="book-title">Book a Visit</h1>
      <p>Pick a dentist, pick a time. We'll leave the porch light on.</p>
      <ZdBooking
        modal
        zipCode="11201"
        specialtyId="sp_154"
        onBookingComplete={(event) => {
          // appointmentId and status only. The patient's details are PHI and stay out of the UI (PHI-001).
          const { appointmentId, status } = (event as CompleteEvent).detail;
          setToast(
            status === 'confirmed'
              ? `Yeehaw, you're booked! Confirmation #${appointmentId}.`
              : `Request sent! Confirmation #${appointmentId} — the practice will holler back.`
          );
        }}
        onBookingError={() => setToast('Well, shoot. That booking did not go through — try another time.')}
      />
      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Art.** `src/art/tooth-hat.svg` is a simple tooth with a straw hat, 64×64, flat colors. Run it through SVGO: `pnpm dlx svgo src/art/tooth-hat.svg`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fffdf5" stroke="#3b2a1a" stroke-width="2" d="M18 30c0-6 6-8 14-8s14 2 14 8c0 8-3 12-4 20-1 6-6 6-7 0l-3-8-3 8c-1 6-6 6-7 0-1-8-4-12-4-20z"/><ellipse cx="32" cy="22" fill="#e7c06a" stroke="#3b2a1a" stroke-width="2" rx="22" ry="5"/><path fill="#e7c06a" stroke="#3b2a1a" stroke-width="2" d="M22 21c0-8 4-12 10-12s10 4 10 12z"/><path fill="none" stroke="#b5482b" stroke-width="3" d="M22 19h20"/></svg>
```

- [ ] **Step 7: `src/theme.css`.** Palette and type overrides. Semantic tokens resolve through these with `var()`, so the components re-brand.

```css
/*
 * Hillbilly Dentistry brand. Only palette and type primitives are overridden; every semantic
 * token (buttons, surfaces, focus) resolves through these, so the components follow along.
 * Brand = mason-jar green, accent = barn red. 600+ steps carry white text at AA.
 */
:root {
  color-scheme: light;
  --zd-color-brand-50: #eef6ec;
  --zd-color-brand-100: #d5e9cf;
  --zd-color-brand-200: #b0d4a6;
  --zd-color-brand-300: #86ba79;
  --zd-color-brand-400: #5f9d52;
  --zd-color-brand-500: #3f7f35;
  --zd-color-brand-600: #2f6628;
  --zd-color-brand-700: #234d1e;
  --zd-color-brand-800: #183515;
  --zd-color-brand-900: #0f220d;
  --zd-color-brand-950: #081307;
  --zd-color-on-brand-400: #ffffff;
  --zd-color-on-brand-500: #ffffff;
  --zd-color-on-brand-600: #ffffff;
  --zd-color-on-brand-700: #ffffff;
  --zd-color-accent-500: #b5482b;
  --zd-color-accent-600: #933720;
  --zd-color-accent-700: #702917;
  --zd-font-family-base: 'Zilla Slab', Georgia, serif;
  --zd-font-family-accent: 'Rye', 'Zilla Slab', Georgia, serif;
  --zd-body-bg-color: #fbf5e6;
  --zd-body-fg-color: #2b1d10;
  --zd-border-radius-md: 2px;
  --zd-border-radius-lg: 4px;
}
```
Before you commit, check the overridden names exist: `grep -c -E -- "--zd-color-on-brand-500:|--zd-font-family-accent:|--zd-body-bg-color:" packages/primitives/dist/theme/tokens.css` should print `3`. If an `on-brand` step isn't defined, delete that line instead of inventing it.

- [ ] **Step 8: `src/site.css`.** Barn wood, gingham, logical properties, nesting:

```css
body {
  margin: 0;
  background-color: var(--zd-body-bg-color);
  color: var(--zd-body-fg-color);
  font-family: var(--zd-font-family-base);
  font-size: 1.125rem;
  line-height: 1.6;
}

:focus-visible {
  outline: 3px solid var(--zd-color-accent-600);
  outline-offset: 2px;
}

h1, h2, h3 {
  font-family: var(--zd-font-family-accent);
  font-weight: 400;
  line-height: 1.2;
}

.demo-ribbon {
  margin: 0;
  padding-block: 0.375rem;
  padding-inline: 1rem;
  background: #2b1d10;
  color: #fbf5e6;
  font-size: 0.875rem;
  text-align: center;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding-block: 1rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  /* Barn-wood planks: repeating dark stripes over walnut. */
  background:
    repeating-linear-gradient(180deg, transparent 0 46px, rgb(0 0 0 / 0.25) 46px 48px),
    #6b4423;
  color: #fff8e7;

  & a {
    color: inherit;
    text-decoration: none;
  }

  & .brand {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-family: var(--zd-font-family-accent);
    font-size: 1.75rem;
  }

  & nav {
    display: flex;
    gap: 1.25rem;
    align-items: center;

    & a {
      padding-block: 0.25rem;
      border-block-end: 2px solid transparent;

      &[aria-current='page'] {
        border-block-end-color: currentColor;
      }
    }

    & .cta {
      padding-inline: 1rem;
      border-radius: 2px;
      background: var(--zd-color-accent-600);
    }
  }
}

main {
  max-inline-size: 72rem;
  margin-inline: auto;
  padding-block: 2rem 4rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
}

.hero {
  padding: clamp(2rem, 6vw, 4rem);
  border: 4px solid #6b4423;
  /* Red gingham. */
  background:
    linear-gradient(90deg, rgb(181 72 43 / 0.18) 50%, transparent 50%) 0 0 / 32px 32px,
    linear-gradient(rgb(181 72 43 / 0.18) 50%, transparent 50%) 0 0 / 32px 32px,
    #fffaf0;
  text-align: center;

  & h1 {
    margin-block: 0 0.5rem;
    font-size: clamp(2rem, 5vw, 3.5rem);
  }
}

.button-link {
  display: inline-block;
  margin-block-start: 1rem;
  padding-block: 0.75rem;
  padding-inline: 1.5rem;
  background: var(--zd-color-brand-600);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: var(--zd-color-brand-700);
  }
}

.services ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
}

.service {
  padding: 1.25rem;
  border: 2px dashed #6b4423;
  background: #fffaf0;

  & h3 {
    margin-block: 0 0.5rem;
    color: var(--zd-color-accent-700);
  }
}

.prose {
  max-inline-size: 40rem;
}

.toast:not(:empty) {
  margin-block-start: 1.5rem;
  padding: 1rem;
  border-inline-start: 6px solid var(--zd-color-brand-600);
  background: var(--zd-color-brand-50);
}

.site-footer {
  padding-block: 2rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: #2b1d10;
  color: #fbf5e6;
  font-size: 0.9375rem;

  & a {
    color: #e7c06a;
  }
}
```

- [ ] **Step 9: Build and look**
  - Run `pnpm --filter demo-site-hillbilly-dentistry build`. Expected: typecheck and build pass.
  - Run `pnpm --filter demo-site-hillbilly-dentistry dev` and open `http://localhost:5181/book`. Search runs on load with dentists. Choosing a provider opens the dialog. Pick a time, fill the patient form with values from the testing-data guide, and submit. The toast shows a confirmation number.
  - Screenshot `/` and `/book` at 1280px and 390px (`pnpm dlx playwright screenshot`).
  - Review Focus #2: run with `VITE_ZOCDOC_MODE=live` and no token. The ribbon should show the warning.

- [ ] **Step 10: Lint, format, commit.** Run `pnpm lint && pnpm format`, then commit the package and `pnpm-lock.yaml`: `add Hillbilly Dentistry React demo site`.

---

### Task 4: Eye Caramba Optometry (Vue)

**Files:** everything under `packages/demo/sites/eye-caramba/`.

**Interfaces:**
- Consumes: from `@zocdoc/api-components`: `createAppointment`, `getAvailability`, `providerHeading`, the types `AppointmentStatus`, `Patient`, `PatientType`, `ProviderLocation`, `ProviderResultsDetail`, `ProviderSelectDetail`, `ProviderDaySelectDetail`, `SlotSelectDetail`, `PatientTypeChangeDetail`, `PatientSubmitDetail`, `PageChangeDetail`, `AvailabilityWindowDetail`, and `ProviderLocationAvailability`. Uses `configureZocdocMock` from `/mock`.
- Produces: dev server `http://localhost:5182`, routes `/`, `/frames`, `/book`. Step containers carry `data-step="search|time|patient|booked"`.

- [ ] **Step 1: Package and config**

`package.json`:
```json
{
  "name": "demo-site-eye-caramba",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5182 --strictPort",
    "build": "vue-tsc --noEmit && vite build"
  },
  "dependencies": {
    "@zocdoc/api-components": "workspace:*",
    "@zocdoc/api-primitive-components": "workspace:*",
    "vue": "^3.5.0",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "typescript": "^5.9.3",
    "vite": "^7.1.5",
    "vue-tsc": "^3.0.0"
  }
}
```

`vite.config.ts`:
```ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('zd-') } },
    }),
  ],
  envDir: resolve(import.meta.dirname, '../../../..'),
  publicDir: resolve(import.meta.dirname, '../../../../static'),
});
```

`env.d.ts`:
```ts
/// <reference types="vite/client" />
import type {} from '@zocdoc/api-components/types/vue';
import type {} from '@zocdoc/api-primitive-components/types/vue';
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "noEmit": true, "jsx": "preserve"
  },
  "include": ["env.d.ts", "src/**/*.ts", "src/**/*.vue"]
}
```
Art goes in `src/art/eye.svg`, imported for the same reason as Task 3.

Run `pnpm install`.

- [ ] **Step 2: `src/config.ts`.** It has the same shape as Task 3, plus a search specialty. No sandbox fixture provider has `sp_155` (Optometrist), so in mock mode the site searches Primary Care, the same way Toe Truck does. Live mode searches `sp_155`, or whatever `VITE_ZOCDOC_SPECIALTY_ID` names.

```ts
import { configureZocdoc } from '@zocdoc/api-components';
import { configureZocdocMock } from '@zocdoc/api-components/mock';

const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

export interface SiteMode {
  mode: 'mock' | 'live';
  warning?: string;
}

/** Fixtures unless live is asked for *and* possible. See packages/demo/src/config.ts. */
export function configureSite(): SiteMode {
  const token = import.meta.env.VITE_ZOCDOC_TOKEN;
  if (import.meta.env.VITE_ZOCDOC_MODE === 'live') {
    if (!token) {
      configureZocdocMock();
      return { mode: 'mock', warning: 'Live mode needs VITE_ZOCDOC_TOKEN — showing sample data.' };
    }
    configureZocdoc({
      baseUrl: import.meta.env.VITE_ZOCDOC_BASE_URL ?? SANDBOX_BASE_URL,
      getToken: () => token, // a function, per request (CLIENT-002)
    });
    return { mode: 'live' };
  }
  configureZocdocMock();
  return { mode: 'mock' };
}

/**
 * The sandbox fixtures have no optometrist, so mock mode searches Primary Care (sp_153).
 * The site copy never names the specialty, so this reads naturally either way.
 */
export function searchSpecialty(mode: SiteMode): string {
  return mode.mode === 'live' ? (import.meta.env.VITE_ZOCDOC_SPECIALTY_ID ?? 'sp_155') : 'sp_153';
}
```

- [ ] **Step 2b: Write a failing test for the booking-status rule.** This is Review Focus #5. No search result includes the `booking_failed` fixture, so clicking through the UI can't reach it. Instead, pull the decision into a pure module and pin it:

```ts
// src/booking-status.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBooked } from './booking-status.ts';

test('confirmed and pending count as booked', () => {
  assert.equal(isBooked('confirmed'), true);
  assert.equal(isBooked('pending_booking'), true);
});

test('booking_failed on a 200 is not booked', () => {
  assert.equal(isBooked('booking_failed'), false);
  assert.equal(isBooked('cancelled'), false);
});
```

Run `node --experimental-strip-types --test packages/demo/sites/eye-caramba/src/booking-status.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 2c: Implement**

```ts
// src/booking-status.ts
import type { AppointmentStatus } from '@zocdoc/api-components';


/** `createAppointment` resolves on a 200 even when booking failed — branch on the status. */
export function isBooked(status: AppointmentStatus): boolean {
  return BOOKED.has(status);
}
```

Run the test again. Expected: 2 pass. (`import type` is erased by strip-types, so node never resolves the package.)

- [ ] **Step 3: Entry, router, shell**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Eye Caramba Optometry</title>
    <link rel="icon" href="data:," />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Monoton&family=Space+Grotesk:wght@400;500;700&display=swap"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/main.ts`:
```ts
import '@zocdoc/api-primitive-components/theme/all.css';
import './theme.css';
import './site.css';
import '@zocdoc/api-components';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router.ts';
import { configureSite, searchSpecialty } from './config.ts';

const mode = configureSite();
createApp(App, { mode }).provide('searchSpecialty', searchSpecialty(mode)).use(router).mount('#app');
```

`src/router.ts`:
```ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Frames from './pages/Frames.vue';
import Book from './pages/Book.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/frames', component: Frames },
    { path: '/book', component: Book },
  ],
});
```

`src/App.vue`:
```vue
<script setup lang="ts">
import type { SiteMode } from './config.ts';
import eye from './art/eye.svg';

defineProps<{ mode: SiteMode }>();
</script>

<template>
  <p class="demo-ribbon" role="note">
    {{ mode.mode === 'live' ? 'Live sandbox' : 'Demo mode — sample data, no real appointments' }}
    <template v-if="mode.warning"> · {{ mode.warning }}</template>
  </p>
  <header class="site-header">
    <RouterLink to="/" class="brand">
      <img :src="eye" alt="" width="48" height="48" />
      <span>Eye Caramba</span>
    </RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/frames">Frames</RouterLink>
      <RouterLink to="/book" class="cta">Book an Exam</RouterLink>
    </nav>
  </header>
  <main id="main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <p>Eye Caramba Optometry · Now with 20% more 20/20</p>
    <p>
      Booking powered by
      <a href="https://www.zocdoc.com/?referrerType=demo-site&amp;component=eye-caramba">Zocdoc</a>
    </p>
  </footer>
</template>
```

- [ ] **Step 4: Content pages**

`src/pages/Home.vue`:
```vue
<template>
  <section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title">Seeing is believing <span class="aside">(with corrective lenses)</span></h1>
    <ol class="eye-chart" aria-label="Eye chart">
      <li>E</li>
      <li>YE CA</li>
      <li>RAMBA</li>
      <li>BOOK NOW</li>
      <li>IF YOU CAN READ THIS</li>
      <li>you probably don't need us, but come anyway</li>
    </ol>
    <RouterLink to="/book" class="button-link">Book an eye exam</RouterLink>
  </section>
  <section aria-labelledby="why-title" class="features">
    <h2 id="why-title">Why Eye Caramba?</h2>
    <ul>
      <li><h3>Laser Focus</h3><p>Our optometrists stare at things professionally.</p></li>
      <li><h3>Same-Day Squints</h3><p>Walk in blurry, walk out slightly less blurry.</p></li>
      <li><h3>Rad Frames</h3><p>Every pair tested on a neon-lit roller rink.</p></li>
    </ul>
  </section>
</template>
```

`src/pages/Frames.vue`:
```vue
<script setup lang="ts">
const FRAMES = [
  { name: 'The Monocle Pro Max', price: '$1,299', note: 'Half the lens. Twice the attitude.' },
  { name: 'Bifocals for Your Bifocals', price: '$420', note: 'For reading the fine print on your fine print.' },
  { name: 'The Night Driver 3000', price: '$88', note: 'Polarized against oncoming synthwave.' },
  { name: 'Aviator, But Make It Pharmacy', price: '$19.99', note: 'Comes clipped to a lanyard.' },
];
</script>

<template>
  <h1>Frames Gallery</h1>
  <p class="lede">Every frame is fictional. Our optometrists, however, are fixtures.</p>
  <ul class="frames">
    <li v-for="frame in FRAMES" :key="frame.name" class="frame">
      <h2>{{ frame.name }}</h2>
      <p class="price">{{ frame.price }}</p>
      <p>{{ frame.note }}</p>
    </li>
  </ul>
</template>
```

`src/pages/Book.vue`:
```vue
<script setup lang="ts">
import { inject } from 'vue';
import BookingFlow from '../components/BookingFlow.vue';

const specialtyId = inject<string>('searchSpecialty', 'sp_153');
</script>

<template>
  <h1>Book an Eye Exam</h1>
  <p class="lede">
    This page builds the booking from individual components and wires them together in Vue.
    Open “Under the hood” to watch the events go by.
  </p>
  <BookingFlow zip-code="11201" :specialty-id="specialtyId" />
</template>
```

- [ ] **Step 5: `src/components/EventLog.vue`.** It logs event names only:

```vue
<script setup lang="ts">
defineProps<{ entries: readonly string[] }>();
</script>

<template>
  <details class="event-log">
    <summary>Under the hood</summary>
    <p>Events fired by the components, newest first. Payloads are not shown — they can hold patient details.</p>
    <ol reversed>
      <li v-for="(name, index) in entries" :key="index"><code>{{ name }}</code></li>
    </ol>
  </details>
</template>
```

- [ ] **Step 6: `src/components/BookingFlow.vue`.** A port of `packages/demo/src/composed.ts` to Vue state:

```vue
<script setup lang="ts">
/**
 * The composed booking funnel, wired in Vue. Same five components and the same rules as
 * packages/demo/src/composed.ts: properties down, events up (COMP-002). The host books
 * through the client itself on `patient-submit`.
 */
import { computed, nextTick, ref } from 'vue';
import {
  createAppointment,
  getAvailability,
  providerHeading,
  type AppointmentStatus,
  type AvailabilityWindowDetail,
  type PageChangeDetail,
  type PatientSubmitDetail,
  type PatientType,
  type PatientTypeChangeDetail,
  type ProviderDaySelectDetail,
  type ProviderLocation,
  type ProviderLocationAvailability,
  type ProviderResultsDetail,
  type ProviderSelectDetail,
  type SlotSelectDetail,
} from '@zocdoc/api-components';
import EventLog from './EventLog.vue';
import { isBooked } from '../booking-status.ts';

const props = defineProps<{ zipCode: string; specialtyId: string }>();

const AVAILABILITY_DAYS = 14;

const providers = ref<ProviderLocation[]>([]);
const totalCount = ref<number>();
const page = ref(0);
const pageSize = ref<number>();
const insuranceName = ref<string>();
const insurancePlanId = ref<string>();
const visitReasonId = ref<string>();
const availability = ref<ProviderLocationAvailability[]>();
const availabilityStart = ref<string>();
const patientType = ref<PatientType>('new');
const selected = ref<ProviderLocation>();
const pickerStart = ref<string>();
const startTime = ref<string>();
const busy = ref(false);
const bookingError = ref(false);
const booked = ref<{ appointmentId: string; status: AppointmentStatus; startTime: string }>();
const events = ref<string[]>([]);

const step = computed(() =>
  booked.value ? 'booked' : startTime.value ? 'patient' : selected.value ? 'time' : 'search'
);
const requiredFields = computed(
  () => selected.value?.booking_requirements?.required_fields ?? []
);

const stepRefs: Record<string, HTMLElement | null> = {};
let availabilityRequest = 0;

function log(name: string): void {
  events.value = [name, ...events.value].slice(0, 30);
}

async function focusStep(name: string): Promise<void> {
  await nextTick();
  stepRefs[name]?.focus(); // A11Y-003
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function windowEnd(startDate: string): string {
  const end = new Date(`${startDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + AVAILABILITY_DAYS - 1);
  return end.toISOString().slice(0, 10);
}

async function loadAvailability(startDate: string): Promise<void> {
  const ids = providers.value.map((location) => location.provider_location_id);
  if (!visitReasonId.value || ids.length === 0) return;
  const request = (availabilityRequest += 1);
  try {
    const entries = await getAvailability({
      providerLocationIds: ids,
      visitReasonId: visitReasonId.value,
      patientType: patientType.value,
      startDate,
      endDate: windowEnd(startDate),
      insurancePlanId: insurancePlanId.value,
    });
    if (request === availabilityRequest) availability.value = entries;
  } catch {
    // The list works without day counts; nothing to show.
    if (request === availabilityRequest) availability.value = undefined;
  }
}

function onResults(event: CustomEvent<ProviderResultsDetail>): void {
  log('provider-results');
  const { detail } = event;
  providers.value = detail.providers;
  totalCount.value = detail.totalCount;
  page.value = detail.page;
  pageSize.value = detail.pageSize;
  insuranceName.value = detail.insurancePlanName;
  insurancePlanId.value = detail.insurancePlanId;
  visitReasonId.value = detail.searchParameters?.visit_reason_id;
  availability.value = undefined;
  availabilityStart.value = today();
  void loadAvailability(availabilityStart.value);
}

function choose(provider: ProviderLocation, day?: string): void {
  selected.value = provider;
  pickerStart.value = day;
  startTime.value = undefined;
  bookingError.value = false;
  void focusStep('time');
}

function onSelect(event: CustomEvent<ProviderSelectDetail>): void {
  log('provider-select');
  choose(event.detail.provider);
}

function onDaySelect(event: CustomEvent<ProviderDaySelectDetail>): void {
  log('day-select');
  choose(event.detail.provider, event.detail.day);
}

function onWindow(event: CustomEvent<AvailabilityWindowDetail>): void {
  log('window-change');
  void loadAvailability(event.detail.startDate);
}

function onPage(event: CustomEvent<PageChangeDetail>): void {
  log('page-change');
  page.value = event.detail.page; // bound back to the search, which refetches
}

function onSlot(event: CustomEvent<SlotSelectDetail>): void {
  log('slot-select');
  startTime.value = event.detail.startTime;
  void focusStep('patient');
}

function onPatientType(event: CustomEvent<PatientTypeChangeDetail>): void {
  log('patient-type-change');
  patientType.value = event.detail.patientType;
}

async function onSubmit(event: CustomEvent<PatientSubmitDetail>): Promise<void> {
  log('patient-submit');
  const provider = selected.value;
  const time = startTime.value;
  if (!provider || !time || !visitReasonId.value || busy.value) return;
  busy.value = true;
  bookingError.value = false;
  try {
    const appointment = await createAppointment({
      providerLocationId: provider.provider_location_id,
      visitReasonId: visitReasonId.value,
      startTime: time,
      patientType: patientType.value,
      patient: event.detail.patient,
      notes: event.detail.notes,
    });
    if (!isBooked(appointment.appointment_status)) {
      bookingError.value = true;
      return;
    }
    booked.value = {
      appointmentId: appointment.appointment_id,
      status: appointment.appointment_status,
      startTime: time,
    };
    void focusStep('booked');
  } catch {
    bookingError.value = true; // never the error's text (CLIENT-003, PHI-001)
  } finally {
    busy.value = false;
  }
}

function back(): void {
  if (step.value === 'patient') startTime.value = undefined;
  else if (step.value === 'time') selected.value = undefined;
  void focusStep(step.value);
}

function startOver(): void {
  booked.value = undefined;
  startTime.value = undefined;
  selected.value = undefined;
  void focusStep('search');
}
</script>

<template>
  <div class="flow">
    <section
      v-show="step === 'search'"
      :ref="(el) => (stepRefs.search = el as HTMLElement)"
      data-step="search"
      tabindex="-1"
      aria-labelledby="step-search"
    >
      <h2 id="step-search">1. Find an optometrist</h2>
      <zd-provider-search
        :zip-code="props.zipCode"
        :specialty-id="props.specialtyId"
        :page="page"
        @provider-results="onResults"
      />
      <zd-provider-results
        :providers="providers"
        :total-count="totalCount"
        :page="page"
        :page-size="pageSize"
        :insurance-name="insuranceName"
        :availability="availability"
        :availability-start="availabilityStart"
        @provider-select="onSelect"
        @day-select="onDaySelect"
        @window-change="onWindow"
        @page-change="onPage"
      />
    </section>

    <section
      v-if="step === 'time' && selected"
      :ref="(el) => (stepRefs.time = el as HTMLElement)"
      data-step="time"
      tabindex="-1"
      aria-labelledby="step-time"
    >
      <h2 id="step-time">2. Pick a time with {{ providerHeading(selected) }}</h2>
      <zd-availability-picker
        :provider-location-id="selected.provider_location_id"
        :visit-reason-id="visitReasonId"
        :patient-type="patientType"
        :start-date="pickerStart"
        @slot-select="onSlot"
        @patient-type-change="onPatientType"
      />
      <button type="button" class="back" @click="back">Back to results</button>
    </section>

    <section
      v-if="step === 'patient'"
      :ref="(el) => (stepRefs.patient = el as HTMLElement)"
      data-step="patient"
      tabindex="-1"
      aria-labelledby="step-patient"
    >
      <h2 id="step-patient">3. Tell us about you</h2>
      <p v-if="bookingError" class="booking-error" role="alert">
        Eye caramba! That booking didn't go through. Please choose another time.
      </p>
      <zd-patient-form
        :insurance-plan-id="insurancePlanId"
        :required-fields="requiredFields"
        :busy="busy"
        @patient-submit="onSubmit"
      />
      <button type="button" class="back" @click="back">Back to times</button>
    </section>

    <section
      v-if="step === 'booked' && booked && selected"
      :ref="(el) => (stepRefs.booked = el as HTMLElement)"
      data-step="booked"
      tabindex="-1"
      aria-labelledby="step-booked"
    >
      <h2 id="step-booked">4. You're booked!</h2>
      <zd-booking-confirmation
        :appointment-id="booked.appointmentId"
        :status="booked.status"
        :start-time="booked.startTime"
        :provider-name="providerHeading(selected)"
      />
      <button type="button" class="back" @click="startOver">Book another</button>
    </section>

    <EventLog :entries="events" />
  </div>
</template>
```
Vue sets properties (not attributes) on custom elements when the element has a matching property, so `:providers` passes the array directly. If `vue-tsc` reports a mismatch between the `CustomEvent<...>` handler types and the generated Vue types, keep the handler signatures. Cast at the template binding with `($event as CustomEvent<...>)` only if needed, and don't widen to `any`.

- [ ] **Step 7: `src/art/eye.svg`** (SVGO it)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#0b0b1a" stroke="#ff3ea5" stroke-width="3" d="M4 32s10-18 28-18 28 18 28 18-10 18-28 18S4 32 4 32z"/><circle cx="32" cy="32" r="11" fill="#00d1c1"/><circle cx="32" cy="32" r="5" fill="#0b0b1a"/><circle cx="35" cy="29" r="2" fill="#fff"/></svg>
```

- [ ] **Step 8: `src/theme.css`**

```css
/*
 * Eye Caramba brand: neon magenta brand, teal accent, on a near-black page. Dark scheme, so
 * the light-dark() tokens take their dark branch. Brand 400/500 carry near-black text at AA;
 * check any new pair with a contrast tool before using it.
 */
:root {
  color-scheme: dark;
  --zd-color-brand-50: #ffe6f4;
  --zd-color-brand-100: #ffc2e3;
  --zd-color-brand-200: #ff94cd;
  --zd-color-brand-300: #ff66b8;
  --zd-color-brand-400: #ff3ea5;
  --zd-color-brand-500: #e41d8a;
  --zd-color-brand-600: #b8106d;
  --zd-color-brand-700: #8a0a51;
  --zd-color-brand-800: #5c0636;
  --zd-color-brand-900: #33031e;
  --zd-color-brand-950: #1c0110;
  --zd-color-on-brand-400: #0b0b1a;
  --zd-color-on-brand-500: #0b0b1a;
  --zd-color-on-brand-600: #ffffff;
  --zd-color-accent-400: #00d1c1;
  --zd-color-accent-500: #00a89b;
  --zd-font-family-base: 'Space Grotesk', system-ui, sans-serif;
  --zd-font-family-accent: 'Monoton', 'Space Grotesk', system-ui, sans-serif;
  --zd-body-bg-color: #0b0b1a;
  --zd-body-fg-color: #f4f1ff;
  --zd-border-radius-md: 0;
  --zd-border-radius-lg: 0;
}
```
Check the overridden names with the same grep as Task 3 Step 7.

- [ ] **Step 9: `src/site.css`**

```css
body {
  margin: 0;
  background-color: var(--zd-body-bg-color);
  color: var(--zd-body-fg-color);
  font-family: var(--zd-font-family-base);
  line-height: 1.6;

  /* Scan lines. Decorative, under everything, ignores the pointer. */
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    background: repeating-linear-gradient(0deg, rgb(255 255 255 / 0.03) 0 1px, transparent 1px 4px);
    pointer-events: none;
  }
}

:focus-visible {
  outline: 3px solid #00d1c1;
  outline-offset: 3px;
}

h1, h2 {
  line-height: 1.15;
}

h1 {
  font-family: var(--zd-font-family-accent);
  font-weight: 400;
  color: #ff66b8;
  text-shadow: 0 0 12px rgb(255 62 165 / 0.6);
}

a {
  color: #00d1c1;
}

.demo-ribbon {
  margin: 0;
  padding-block: 0.375rem;
  background: #00d1c1;
  color: #0b0b1a;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding-block: 1rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  border-block-end: 2px solid #ff3ea5;

  & a {
    color: #f4f1ff;
    text-decoration: none;
  }

  & .brand {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-family: var(--zd-font-family-accent);
    font-size: 1.5rem;
  }

  & nav {
    display: flex;
    gap: 1.25rem;
    align-items: center;

    & .router-link-exact-active {
      color: #ff66b8;
    }

    & .cta {
      padding-block: 0.5rem;
      padding-inline: 1rem;
      border: 2px solid #00d1c1;
      color: #00d1c1;
    }
  }
}

main {
  max-inline-size: 72rem;
  margin-inline: auto;
  padding-block: 2rem 4rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
}

.hero {
  text-align: center;

  & .aside {
    display: block;
    font-family: var(--zd-font-family-base);
    font-size: 0.45em;
    color: #f4f1ff;
    text-shadow: none;
  }
}

.eye-chart {
  margin-block: 2rem;
  padding: 0;
  list-style: none;
  font-weight: 700;
  letter-spacing: 0.2em;

  & li:nth-child(1) { font-size: 5rem; line-height: 1; }
  & li:nth-child(2) { font-size: 3rem; }
  & li:nth-child(3) { font-size: 2.25rem; }
  & li:nth-child(4) { font-size: 1.5rem; }
  & li:nth-child(5) { font-size: 1.125rem; }
  & li:nth-child(6) { font-size: 0.875rem; letter-spacing: 0.05em; }
}

.button-link {
  display: inline-block;
  padding-block: 0.75rem;
  padding-inline: 1.75rem;
  background: #ff3ea5;
  color: #0b0b1a;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 0 18px rgb(255 62 165 / 0.6);
}

.features ul,
.frames {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
}

.features li,
.frame {
  padding: 1.25rem;
  border: 2px solid #00d1c1;
  background: rgb(0 209 193 / 0.06);

  & h2, & h3 {
    margin-block-start: 0;
    color: #00d1c1;
    font-family: var(--zd-font-family-base);
  }
}

.frame .price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff66b8;
}

.lede {
  max-inline-size: 44rem;
}

.flow {
  display: grid;
  gap: 2rem;

  & section {
    padding: 1.5rem;
    border: 1px solid rgb(244 241 255 / 0.2);

    &:focus-visible {
      outline-offset: -3px;
    }
  }
}

.back {
  margin-block-start: 1rem;
  padding-block: 0.5rem;
  padding-inline: 1rem;
  border: 2px solid #f4f1ff;
  background: transparent;
  color: #f4f1ff;
  font: inherit;
  cursor: pointer;
}

.booking-error {
  padding: 1rem;
  border-inline-start: 6px solid #ff3ea5;
  background: rgb(255 62 165 / 0.12);
}

.event-log {
  padding: 1rem;
  background: #15152b;
  font-size: 0.875rem;

  & summary {
    cursor: pointer;
    font-weight: 700;
    color: #00d1c1;
  }
}

.site-footer {
  padding-block: 2rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  border-block-start: 2px solid #ff3ea5;
  font-size: 0.9375rem;
}
```

- [ ] **Step 10: Build and look**
  - Run `pnpm --filter demo-site-eye-caramba build`. Expected: `vue-tsc` and the build pass.
  - Dev on 5182 at `/book`: search runs, choose a provider, then time, then form, then confirmation. Focus lands on each step's section, and the event log fills with names.
  - Review Focus #2: live with no token shows the ribbon warning.
  - Take screenshots as in Task 3.

- [ ] **Step 11: Lint, format, commit:** `add Eye Caramba Vue demo site`.

---

### Task 5: Corporate Wellness Synergy Partners LLC (ASP.NET Core)

**Files:** everything under `packages/demo/sites/synergy-partners/`.

**Interfaces:**
- Consumes: the IIFE global `Zocdoc` (from `wwwroot/zocdoc/zocdoc.js`, synced by Task 2). It uses `Zocdoc.searchProviderLocations({ zipCode, specialtyId, insurancePlanId })`, which returns `{ providerLocations, totalCount, pageSize, searchParameters }`.
- Produces: `http://localhost:8082`, with routes `/`, `/about`, `/leaders`, and `/leaders/{id}` (id URL-encoded, e.g. `pr_a%7Clo_b`).

- [ ] **Step 1: Project files**

`SynergyPartners.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>SynergyPartners</RootNamespace>
    <UserSecretsId>demo-site-synergy-partners</UserSecretsId>
  </PropertyGroup>
</Project>
```

`ZocdocOptions.cs`:
```csharp
namespace SynergyPartners;

/// <summary>
/// How the page loads the Zocdoc bundle, plus the roster's search. Mode and token come from the
/// environment (ZOCDOC_MODE, ZOCDOC_TOKEN, ZOCDOC_BASE_URL) or user-secrets, never from a
/// committed appsettings file.
/// </summary>
public sealed class ZocdocOptions
{
    public string Mode { get; set; } = "mock";
    public string? Token { get; set; }
    public string? BaseUrl { get; set; }
    public RosterOptions Roster { get; set; } = new();

    public bool IsLive => Mode == "live" && !string.IsNullOrEmpty(Token);
    public bool LiveRequestedWithoutToken => Mode == "live" && string.IsNullOrEmpty(Token);
}

public sealed class RosterOptions
{
    public string ZipCode { get; set; } = "11201";
    public string SpecialtyId { get; set; } = "sp_153";
    public string? InsurancePlanId { get; set; }
}
```

`Program.cs`:
```csharp
using SynergyPartners;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.Configure<ZocdocOptions>(builder.Configuration.GetSection("Zocdoc"));
builder.Services.PostConfigure<ZocdocOptions>(options =>
{
    // Flat env var names, matching the PHP site and the README.
    options.Mode = Environment.GetEnvironmentVariable("ZOCDOC_MODE") ?? options.Mode;
    options.Token = Environment.GetEnvironmentVariable("ZOCDOC_TOKEN") ?? options.Token;
    options.BaseUrl = Environment.GetEnvironmentVariable("ZOCDOC_BASE_URL") ?? options.BaseUrl;
});

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Run();
```

`appsettings.json`:
```json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "Zocdoc": {
    "Mode": "mock",
    "Roster": { "ZipCode": "11201", "SpecialtyId": "sp_153" }
  }
}
```

`Properties/launchSettings.json`:
```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "applicationUrl": "http://localhost:8082",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  }
}
```

`package.json`:
```json
{
  "name": "demo-site-synergy-partners",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "oxnode ../sync-assets.ts && dotnet watch run --launch-profile http --non-interactive",
    "build": "dotnet build"
  }
}
```

Run `dotnet build` in the site directory. Expected: Build succeeded, 0 warnings.

- [ ] **Step 2: Shared layout and script partial**

`Pages/_ViewImports.cshtml`:
```cshtml
@using SynergyPartners
@using Microsoft.Extensions.Options
@namespace SynergyPartners.Pages
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

`Pages/_ViewStart.cshtml`:
```cshtml
@{ Layout = "_Layout"; }
```

`Pages/Shared/_ZocdocScript.cshtml`:
```cshtml
@inject IOptions<ZocdocOptions> Zocdoc
@{
    var options = Zocdoc.Value;
}
@* The bundle configures itself from these attributes (see packages/api-components/src/bundle.ts). *@
@if (options.IsLive)
{
    <script src="~/zocdoc/zocdoc.js" zd-token="@options.Token" zd-base-url="@options.BaseUrl"></script>
}
else
{
    <script src="~/zocdoc/zocdoc.js" zd-mock></script>
}
```
Razor drops `zd-base-url` when `BaseUrl` is null, so the bundle's sandbox default applies.

`Pages/Shared/_Layout.cshtml`:
```cshtml
@inject IOptions<ZocdocOptions> Zocdoc
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@ViewData["Title"] · Corporate Wellness Synergy Partners LLC</title>
    <link rel="icon" href="data:," />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@600&display=swap" />
    <link rel="stylesheet" href="~/zocdoc/all.css" />
    <link rel="stylesheet" href="~/css/theme.css" asp-append-version="true" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
    <partial name="_ZocdocScript" />
</head>
<body>
    <p class="demo-ribbon" role="note">
        @(Zocdoc.Value.IsLive ? "Live sandbox" : "Demo mode — sample data, no real appointments")
        @if (Zocdoc.Value.LiveRequestedWithoutToken)
        {
            <text> · Live mode needs ZOCDOC_TOKEN — showing sample data.</text>
        }
    </p>
    <header class="site-header">
        <a href="/" class="brand">
            <img src="~/art/synergy.svg" alt="" width="40" height="40" />
            <span>Corporate Wellness Synergy Partners <small>LLC</small></span>
        </a>
        <nav aria-label="Main">
            <a href="/">Value Proposition</a>
            <a href="/leaders">Thought Leaders</a>
            <a href="/about">About</a>
            <a href="/leaders" class="cta">Request a Synergy Session</a>
        </nav>
    </header>
    <main id="main">
        @RenderBody()
    </main>
    <footer class="site-footer">
        <p>© Corporate Wellness Synergy Partners LLC. All synergies reserved.</p>
        <ul>
            <li><a href="/about#10k">Form 10-K (for your health)</a></li>
            <li><a href="/about#investors">Investor Relations</a></li>
            <li><a href="https://www.zocdoc.com/?referrerType=demo-site&amp;component=synergy-partners">Booking powered by Zocdoc</a></li>
        </ul>
    </footer>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

- [ ] **Step 3: Home and About** (static Razor pages, no page model)

`Pages/Index.cshtml`:
```cshtml
@page
@{ ViewData["Title"] = "Our Value Proposition"; }
<section class="hero" aria-labelledby="hero-title">
    <div>
        <h1 id="hero-title">Leveraging holistic care verticals.</h1>
        <p>We align best-in-class physicians with your core wellness KPIs to deliver scalable, patient-centric outcomes across the full health value chain.</p>
        <a class="button-link" href="/leaders">Meet our Thought Leaders</a>
    </div>
    <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&amp;q=70&amp;auto=format" alt="A team in a meeting room nodding at a whiteboard" width="900" height="600" />
</section>
<section aria-labelledby="pillars-title" class="pillars">
    <h2 id="pillars-title">Our Four Pillars of Synergy</h2>
    <ul>
        <li><h3>Synergize Your Sinuses</h3><p>Cross-functional nasal alignment for the modern workforce.</p></li>
        <li><h3>Blood Pressure as a Service</h3><p>Monthly recurring readings, billed annually.</p></li>
        <li><h3>Agile Annual Physicals</h3><p>Two-week sprints. Retrospective included.</p></li>
        <li><h3>Circle-Back Care</h3><p>We'll take your symptoms offline and circle back.</p></li>
    </ul>
</section>
```

`Pages/About.cshtml`:
```cshtml
@page
@{ ViewData["Title"] = "About"; }
<article class="prose">
    <h1>About the Partnership</h1>
    <p>Founded during an offsite, Corporate Wellness Synergy Partners LLC exists at the intersection of medicine and the word "intersection."</p>
    <h2 id="10k">Form 10-K (for your health)</h2>
    <p>Risk factors include: Mondays, open-plan offices, and reply-all.</p>
    <h2 id="investors">Investor Relations</h2>
    <p>Our shareholders are our patients, and our patients are mostly tired.</p>
</article>
```
Unsplash is allowed by the spec's demo exemption. Pick a photo that loads; if that ID 404s, choose another office-meeting photo and keep the descriptive `alt`.

- [ ] **Step 4: Roster page**

`Pages/Leaders/Index.cshtml`:
```cshtml
@page
@inject IOptions<ZocdocOptions> Zocdoc
@{
    ViewData["Title"] = "Our Thought Leaders";
    var roster = Zocdoc.Value.Roster;
}
<h1>Our Thought Leaders</h1>
<p class="lede">Hand-picked physicians with deep expertise in moving the needle on your vitals.</p>
@* The search parameters are the server's: C# owns the roster the way a CMS would. *@
<section id="roster" class="roster" aria-labelledby="roster-title"
         data-zip-code="@roster.ZipCode"
         data-specialty-id="@roster.SpecialtyId"
         data-insurance-plan-id="@roster.InsurancePlanId">
    <h2 id="roster-title" class="visually-hidden">Physicians</h2>
    <p class="roster-status" role="status" aria-live="polite">Aligning stakeholders…</p>
    <ul class="roster-list"></ul>
</section>
@section Scripts {
    <script src="~/js/roster.js" asp-append-version="true"></script>
}
```

`wwwroot/js/roster.js`:
```js
/*
 * Fills the roster from one provider search. `zd-provider-card` renders a `provider` object
 * rather than an id, so the server renders the container and its search parameters and this
 * script hands each card its data. Plain JS, no build — the IIFE bundle's `Zocdoc` global is
 * all it needs.
 */
(async () => {
  const roster = document.getElementById('roster');
  const list = roster.querySelector('.roster-list');
  const status = roster.querySelector('.roster-status');
  const { zipCode, specialtyId, insurancePlanId } = roster.dataset;

  try {
    const { providerLocations } = await Zocdoc.searchProviderLocations({
      zipCode,
      specialtyId,
      insurancePlanId: insurancePlanId || undefined,
    });

    if (providerLocations.length === 0) {
      status.textContent = 'Our leaders are all in a strategy session. Please check back.';
      return;
    }

    for (const location of providerLocations) {
      const item = document.createElement('li');
      const card = document.createElement('zd-provider-card');
      card.provider = location;
      card.addEventListener('profile-request', () => {
        window.location.href = `/leaders/${encodeURIComponent(location.provider_location_id)}`;
      });
      const link = document.createElement('a');
      link.href = `/leaders/${encodeURIComponent(location.provider_location_id)}`;
      link.className = 'roster-link';
      link.textContent = 'View profile & book';
      item.append(card, link);
      list.append(item);
    }
    status.textContent = `${providerLocations.length} thought leaders available.`;
  } catch {
    // Never the error's own text (CLIENT-003).
    status.textContent = 'We hit a synergy blocker loading our leaders. Please refresh.';
  }
})();
```
The card emits `profile-request` when the name is clicked. The extra link gives a visible, keyboard-reachable path too.

- [ ] **Step 5: Write the detail page test first.** This covers Review Focus #3. There's no C# test project (YAGNI). The check is an HTTP assertion that goes into `smoke.ts` in Task 7. Record it now so it isn't lost: `GET /leaders/pr_nope%7Clo_nope` returns 200, and the page contains `pivoted to new opportunities`. The page model below renders that state on the client after the search finds no match. So the smoke check asserts on the rendered DOM, not the raw HTML.

- [ ] **Step 6: Detail page**

`Pages/Leaders/Detail.cshtml.cs`:
```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;

namespace SynergyPartners.Pages.Leaders;

public sealed class DetailModel(IOptions<ZocdocOptions> zocdoc) : PageModel
{
    public string ProviderLocationId { get; private set; } = "";
    public RosterOptions Roster => zocdoc.Value.Roster;

    public void OnGet(string id) => ProviderLocationId = id;
}
```

`Pages/Leaders/Detail.cshtml`:
```cshtml
@page "/leaders/{id}"
@model SynergyPartners.Pages.Leaders.DetailModel
@{ ViewData["Title"] = "Thought Leader"; }
<p><a href="/leaders">← All Thought Leaders</a></p>
<h1 id="leader-title">Thought Leader Profile</h1>
<section id="leader" class="leader"
         data-provider-location-id="@Model.ProviderLocationId"
         data-zip-code="@Model.Roster.ZipCode"
         data-specialty-id="@Model.Roster.SpecialtyId"
         data-insurance-plan-id="@Model.Roster.InsurancePlanId">
    <p class="leader-status" role="status" aria-live="polite">Synergizing…</p>
    <zd-provider-profile hidden></zd-provider-profile>
    <div class="leader-booking" hidden>
        <h2>Request a Synergy Session</h2>
        <zd-booking modal></zd-booking>
    </div>
    <div class="leader-missing" hidden>
        <p>This leader has pivoted to new opportunities.</p>
        <p><a href="/leaders">Explore our other Thought Leaders</a></p>
    </div>
</section>
@section Scripts {
    <script src="~/js/leader.js" asp-append-version="true"></script>
}
```

`wwwroot/js/leader.js`:
```js
/*
 * One provider's page. Runs the roster search, finds this location, and hands it to the profile
 * and to `zd-booking`. Setting `providers` to just this location plus `providerLocationId`
 * starts the booking at the time step, with no search in front of it.
 */
(async () => {
  const leader = document.getElementById('leader');
  const status = leader.querySelector('.leader-status');
  const profile = leader.querySelector('zd-provider-profile');
  const bookingWrap = leader.querySelector('.leader-booking');
  const booking = bookingWrap.querySelector('zd-booking');
  const missing = leader.querySelector('.leader-missing');
  const { providerLocationId, zipCode, specialtyId, insurancePlanId } = leader.dataset;

  try {
    const { providerLocations } = await Zocdoc.searchProviderLocations({
      zipCode,
      specialtyId,
      insurancePlanId: insurancePlanId || undefined,
    });
    const location = providerLocations.find((l) => l.provider_location_id === providerLocationId);

    if (!location) {
      status.textContent = '';
      missing.hidden = false;
      return;
    }

    document.getElementById('leader-title').textContent = Zocdoc.providerHeading(location);
    profile.provider = location;
    profile.hidden = false;
    booking.zipCode = zipCode;
    booking.specialtyId = specialtyId;
    booking.providers = [location];
    booking.providerLocationId = location.provider_location_id;
    bookingWrap.hidden = false;
    status.textContent = '';

    booking.addEventListener('booking-complete', (event) => {
      // Ids only. Patient details are PHI (PHI-001).
      status.textContent = `Synergy Session secured. Reference ${event.detail.appointmentId}.`;
    });
    booking.addEventListener('booking-error', () => {
      status.textContent = 'That session could not be actioned. Please select another time.';
    });
  } catch {
    status.textContent = 'We hit a synergy blocker loading this leader. Please refresh.';
  }
})();
```

**Spec risk check (do this now):** run the site (Step 9) and open a leader. If `zd-booking` with one provider doesn't show the time step, *or* closing the dialog leaves a dead search UI, replace the booking block with a search-first `<zd-booking modal zip-code specialty-id>`. Then add this line to the README's "Library follow-ups": "zd-booking cannot start at the time step from a host-supplied single provider." Don't change the library.

- [ ] **Step 7: Theme, styles, art**

`wwwroot/css/theme.css`:
```css
/* Synergy Partners: navy brand, slate accent, Plex type. Light scheme only. */
:root {
  color-scheme: light;
  --zd-color-brand-50: #eef2f9;
  --zd-color-brand-100: #d6e0f0;
  --zd-color-brand-200: #adc0e0;
  --zd-color-brand-300: #7f9bcb;
  --zd-color-brand-400: #4f73b0;
  --zd-color-brand-500: #2c5394;
  --zd-color-brand-600: #1f3f76;
  --zd-color-brand-700: #172f59;
  --zd-color-brand-800: #10213e;
  --zd-color-brand-900: #0a1527;
  --zd-color-brand-950: #050b15;
  --zd-color-on-brand-500: #ffffff;
  --zd-color-on-brand-600: #ffffff;
  --zd-color-on-brand-700: #ffffff;
  --zd-font-family-base: 'IBM Plex Sans', system-ui, sans-serif;
  --zd-font-family-accent: 'IBM Plex Serif', Georgia, serif;
  --zd-body-bg-color: #f5f7fa;
  --zd-body-fg-color: #1b2333;
  --zd-border-radius-md: 4px;
  --zd-border-radius-lg: 6px;
}
```

`wwwroot/css/site.css`:
```css
body {
  margin: 0;
  background-color: var(--zd-body-bg-color);
  color: var(--zd-body-fg-color);
  font-family: var(--zd-font-family-base);
  line-height: 1.6;
}

:focus-visible {
  outline: 3px solid #e0a800;
  outline-offset: 2px;
}

h1, h2, h3 {
  font-family: var(--zd-font-family-accent);
  line-height: 1.2;
  color: var(--zd-color-brand-700);
}

a {
  color: var(--zd-color-brand-600);
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.demo-ribbon {
  margin: 0;
  padding-block: 0.375rem;
  background: #e0a800;
  color: #1b2333;
  font-size: 0.875rem;
  text-align: center;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding-block: 1rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: var(--zd-color-brand-800);
  color: #ffffff;

  & a {
    color: inherit;
    text-decoration: none;
  }

  & .brand {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-weight: 600;

    & small {
      font-weight: 400;
      opacity: 0.8;
    }
  }

  & nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;

    & .cta {
      padding-block: 0.5rem;
      padding-inline: 1rem;
      border-radius: 4px;
      background: #ffffff;
      color: var(--zd-color-brand-800);
      font-weight: 600;
    }
  }
}

main {
  max-inline-size: 76rem;
  margin-inline: auto;
  padding-block: 2.5rem 4rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 2.5rem;
  align-items: center;

  & h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-block-start: 0;
  }

  & img {
    inline-size: 100%;
    block-size: auto;
    border-radius: 6px;
    box-shadow: 0 20px 40px rgb(16 33 62 / 0.2);
  }
}

.button-link {
  display: inline-block;
  padding-block: 0.75rem;
  padding-inline: 1.5rem;
  border-radius: 4px;
  background: var(--zd-color-brand-600);
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.pillars ul,
.roster-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
}

.pillars li {
  padding: 1.5rem;
  border-block-start: 4px solid var(--zd-color-brand-500);
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(16 33 62 / 0.12);
}

.roster-list li {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(16 33 62 / 0.12);
}

.roster-link {
  font-weight: 600;
}

.lede,
.prose {
  max-inline-size: 44rem;
}

.leader {
  display: grid;
  gap: 2rem;
}

.site-footer {
  padding-block: 2rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: var(--zd-color-brand-900);
  color: #d6e0f0;
  font-size: 0.875rem;

  & ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 0;
    list-style: none;
  }

  & a {
    color: #ffffff;
  }
}
```

`wwwroot/art/synergy.svg` (SVGO it):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="15" cy="20" r="11" fill="none" stroke="#fff" stroke-width="3"/><circle cx="25" cy="20" r="11" fill="none" stroke="#7f9bcb" stroke-width="3"/></svg>
```

- [ ] **Step 8: `.gitignore` check:** `git status --short packages/demo/sites/synergy-partners`. It must not list `bin/`, `obj/`, `wwwroot/zocdoc/` or `wwwroot/images/`.

- [ ] **Step 9: Run and look**
  - Run `pnpm --filter demo-site-synergy-partners dev`. Open `http://localhost:8082/leaders`: cards render. Open a leader: the profile renders, choosing a time continues, booking completes, and the status shows the reference.
  - Open `/leaders/pr_nope%7Clo_nope`: the pivoted message shows.
  - Review Focus #2: `ZOCDOC_MODE=live pnpm --filter demo-site-synergy-partners dev` with no token shows the warning on the ribbon.
  - Take screenshots.

- [ ] **Step 10: Commit:** `add Synergy Partners ASP.NET demo site`.

---

### Task 6: Toe Truck Podiatry (PHP)

**Files:** everything under `packages/demo/sites/toe-truck/`.

**Interfaces:**
- Consumes: the bundle tag attributes `zd-mock` / `zd-token` / `zd-base-url`, and synced `public/zocdoc/*` and `public/images/*`.
- Produces: `http://localhost:8081`, with routes `/`, `/post.php?slug=<slug>`, `/book.php`, and a themed 404.

- [ ] **Step 1: `package.json` and router**

```json
{
  "name": "demo-site-toe-truck",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "oxnode ../sync-assets.ts && php -S localhost:8081 -t public router.php"
  }
}
```

`router.php`:
```php
<?php
// Dev-server router: serve real files as-is, send everything else to a page or the 404.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . '/public' . $path;

if ($path !== '/' && is_file($file)) {
    return false; // let php -S serve the static file
}

$pages = ['/' => 'index.php', '/index.php' => 'index.php', '/post.php' => 'post.php', '/book.php' => 'book.php'];
require __DIR__ . '/public/' . ($pages[$path] ?? '404.php');
```

- [ ] **Step 2: Config and posts**

`includes/config.php`:
```php
<?php
/*
 * Mock unless live is asked for and possible. SEARCH_SPECIALTY is Primary Care in mock mode
 * because the published sandbox fixtures have no podiatrist; set ZOCDOC_SPECIALTY_ID in live
 * mode to search a real podiatry specialty.
 */
$mode = getenv('ZOCDOC_MODE') ?: 'mock';
$token = getenv('ZOCDOC_TOKEN') ?: '';

define('ZOCDOC_LIVE', $mode === 'live' && $token !== '');
define('ZOCDOC_LIVE_WITHOUT_TOKEN', $mode === 'live' && $token === '');
define('ZOCDOC_TOKEN', $token);
define('ZOCDOC_BASE_URL', getenv('ZOCDOC_BASE_URL') ?: '');
define('SEARCH_SPECIALTY', ZOCDOC_LIVE ? (getenv('ZOCDOC_SPECIALTY_ID') ?: 'sp_153') : 'sp_153');

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
```

`includes/posts.php`:
```php
<?php
return [
    'bunion-needs-a-tow' => [
        'title' => '5 Signs Your Bunion Needs a Tow',
        'date' => '2026-09-14',
        'excerpt' => 'If your shoe has a check-engine light, read on.',
        'body' => [
            'Sign one: your bunion has its own zip code. Sign two: it has started receiving mail.',
            'Signs three through five are best discussed in person, ideally with your shoes off and our windows open.',
        ],
    ],
    'arch-support-a-love-story' => [
        'title' => 'Arch Support: A Love Story',
        'date' => '2026-08-30',
        'excerpt' => 'They met at a shoe store. It was a perfect fit.',
        'body' => [
            'Every arch deserves someone who will hold it up when times get flat.',
            'Our orthotics are hand-fitted by technicians who have seen things. Foot things.',
        ],
    ],
    'winter-toe-tips' => [
        'title' => 'Winterizing Your Toes',
        'date' => '2026-08-02',
        'excerpt' => 'Antifreeze is not a foot cream. We cannot stress this enough.',
        'body' => [
            'Wool socks, dry boots, and absolutely no antifreeze.',
            'If a toe turns a color found on a paint swatch, call us.',
        ],
    ],
];
```

- [ ] **Step 3: Template partials**

`includes/zocdoc-script.php`:
```php
<?php // The whole integration is this tag, plus <zd-booking> wherever you want booking. ?>
<?php if (ZOCDOC_LIVE): ?>
<script src="/zocdoc/zocdoc.js" zd-token="<?= e(ZOCDOC_TOKEN) ?>"<?php if (ZOCDOC_BASE_URL !== ''): ?> zd-base-url="<?= e(ZOCDOC_BASE_URL) ?>"<?php endif; ?>></script>
<?php else: ?>
<script src="/zocdoc/zocdoc.js" zd-mock></script>
<?php endif; ?>
```

`includes/header.php`:
```php
<?php
require_once __DIR__ . '/config.php';
/** @var string $pageTitle */
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> · Toe Truck Podiatry</title>
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;600&display=swap">
  <link rel="stylesheet" href="/zocdoc/all.css">
  <link rel="stylesheet" href="/css/theme.css">
  <link rel="stylesheet" href="/css/site.css">
  <?php require __DIR__ . '/zocdoc-script.php'; ?>
</head>
<body>
  <p class="demo-ribbon" role="note">
    <?= ZOCDOC_LIVE ? 'Live sandbox' : 'Demo mode — sample data, no real appointments' ?>
    <?php if (ZOCDOC_LIVE_WITHOUT_TOKEN): ?> · Live mode needs ZOCDOC_TOKEN — showing sample data.<?php endif; ?>
  </p>
  <header class="site-header">
    <a href="/" class="brand">
      <img src="/art/tow-hook.svg" alt="" width="48" height="48">
      <span>Toe Truck Podiatry</span>
    </a>
    <p class="tagline">We'll tow you back on your feet.</p>
    <nav aria-label="Main">
      <a href="/">The Shop Blog</a>
      <a href="/book.php" class="cta">Book a Tow</a>
    </nav>
  </header>
  <div class="layout">
    <main id="main">
```

`includes/sidebar.php`:
```php
<?php $posts = require __DIR__ . '/posts.php'; ?>
<aside class="sidebar" aria-label="Sidebar">
  <section class="widget widget-cta">
    <h2>Stuck on the Shoulder?</h2>
    <p>Bunions, heel spurs, ingrowns. We haul 'em all.</p>
    <a href="/book.php" class="button-link">Get Towed In</a>
  </section>
  <section class="widget">
    <h2>Latest from the Shop</h2>
    <ul>
      <?php foreach ($posts as $slug => $post): ?>
        <li><a href="/post.php?slug=<?= e($slug) ?>"><?= e($post['title']) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </section>
</aside>
```

`includes/footer.php`:
```php
    </main>
    <?php require __DIR__ . '/sidebar.php'; ?>
  </div>
  <footer class="site-footer">
    <p>Toe Truck Podiatry · 24/7 Roadside Foot Assistance · No toe left behind</p>
    <p>Booking powered by <a href="https://www.zocdoc.com/?referrerType=demo-site&amp;component=toe-truck">Zocdoc</a></p>
  </footer>
</body>
</html>
```

- [ ] **Step 4: Pages**

`public/index.php`:
```php
<?php
$pageTitle = 'The Shop Blog';
require __DIR__ . '/../includes/header.php';
$posts = require __DIR__ . '/../includes/posts.php';
$dates = new IntlDateFormatter('en-US', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'UTC');
?>
<h1>The Shop Blog</h1>
<?php foreach ($posts as $slug => $post): ?>
  <article class="post-summary">
    <h2><a href="/post.php?slug=<?= e($slug) ?>"><?= e($post['title']) ?></a></h2>
    <p class="meta"><time datetime="<?= e($post['date']) ?>"><?= e($dates->format(new DateTimeImmutable($post['date'], new DateTimeZone('UTC')))) ?></time></p>
    <p><?= e($post['excerpt']) ?></p>
  </article>
<?php endforeach; ?>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```
`IntlDateFormatter` is PHP's binding to ICU, the same engine behind the JS `Intl` APIs (I18N-002). Check that the extension is loaded with `php -m | grep intl`. If it's missing, run `brew reinstall php`; Homebrew's PHP ships with intl.

`public/post.php`:
```php
<?php
$posts = require __DIR__ . '/../includes/posts.php';
$slug = $_GET['slug'] ?? '';
if (!is_string($slug) || !isset($posts[$slug])) {
    require __DIR__ . '/404.php';
    return;
}
$post = $posts[$slug];
$pageTitle = $post['title'];
require __DIR__ . '/../includes/header.php';
$dates = new IntlDateFormatter('en-US', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'UTC');
?>
<article class="post">
  <h1><?= e($post['title']) ?></h1>
  <p class="meta"><time datetime="<?= e($post['date']) ?>"><?= e($dates->format(new DateTimeImmutable($post['date'], new DateTimeZone('UTC')))) ?></time></p>
  <?php foreach ($post['body'] as $paragraph): ?>
    <p><?= e($paragraph) ?></p>
  <?php endforeach; ?>
  <p><a href="/book.php" class="button-link">Book a Tow</a></p>
</article>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```

`public/book.php`:
```php
<?php
$pageTitle = 'Book a Tow';
require __DIR__ . '/../includes/header.php';
?>
<h1>Book a Tow</h1>
<p>Find a foot pro near you and pick a time. Our dispatcher (the component below) handles the rest.</p>
<zd-booking zip-code="11201" specialty-id="<?= e(SEARCH_SPECIALTY) ?>"></zd-booking>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```

`public/404.php`:
```php
<?php
http_response_code(404);
$pageTitle = 'Page Not Found';
require __DIR__ . '/../includes/header.php';
?>
<h1>Wrong Exit</h1>
<p>That page got towed. Try <a href="/">the Shop Blog</a> instead.</p>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```

- [ ] **Step 5: Theme, styles, art**

`public/css/theme.css`:
```css
/* Toe Truck: hazard-yellow brand behind black text, black accent. Light scheme only. */
:root {
  color-scheme: light;
  --zd-color-brand-50: #fffbe6;
  --zd-color-brand-100: #fff3b3;
  --zd-color-brand-200: #ffe980;
  --zd-color-brand-300: #ffdf4d;
  --zd-color-brand-400: #ffd21a;
  --zd-color-brand-500: #f5c400;
  --zd-color-brand-600: #d6aa00;
  --zd-color-brand-700: #a88500;
  --zd-color-brand-800: #7a6100;
  --zd-color-brand-900: #4d3d00;
  --zd-color-brand-950: #2b2200;
  --zd-color-on-brand-400: #111111;
  --zd-color-on-brand-500: #111111;
  --zd-color-on-brand-600: #111111;
  --zd-color-on-brand-700: #111111;
  --zd-font-family-base: 'Work Sans', system-ui, sans-serif;
  --zd-font-family-accent: 'Anton', Impact, sans-serif;
  --zd-body-bg-color: #f2f2ef;
  --zd-body-fg-color: #111111;
  --zd-border-radius-md: 0;
  --zd-border-radius-lg: 0;
}
```

`public/css/site.css`:
```css
body {
  margin: 0;
  background-color: var(--zd-body-bg-color);
  color: var(--zd-body-fg-color);
  font-family: var(--zd-font-family-base);
  line-height: 1.6;
}

:focus-visible {
  outline: 3px solid #111111;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px #f5c400;
}

h1, h2 {
  font-family: var(--zd-font-family-accent);
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.1;
}

a {
  color: #111111;
}

.demo-ribbon {
  margin: 0;
  padding-block: 0.375rem;
  background: #111111;
  color: #f5c400;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

.site-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 1rem;
  align-items: center;
  padding-block: 1.25rem 1.75rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: #f5c400;
  /* Hazard stripe along the bottom edge. */
  border-block-end: 14px solid transparent;
  border-image: repeating-linear-gradient(-45deg, #111111 0 14px, #f5c400 14px 28px) 14;

  & .brand {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-family: var(--zd-font-family-accent);
    font-size: 2rem;
    text-decoration: none;
    text-transform: uppercase;
  }

  & .tagline {
    grid-column: 1;
    margin: 0;
    font-weight: 600;
  }

  & nav {
    grid-row: 1 / span 2;
    grid-column: 2;
    display: flex;
    gap: 1rem;
    align-items: center;

    & .cta {
      padding-block: 0.5rem;
      padding-inline: 1rem;
      background: #111111;
      color: #f5c400;
      font-weight: 600;
      text-decoration: none;
    }
  }
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 2.5rem;
  max-inline-size: 76rem;
  margin-inline: auto;
  padding-block: 2rem 4rem;
  padding-inline: clamp(1rem, 4vw, 3rem);

  @media (width < 52rem) {
    grid-template-columns: 1fr;
  }
}

.post-summary,
.post,
.widget {
  padding: 1.5rem;
  margin-block-end: 1.5rem;
  border: 3px solid #111111;
  background: #ffffff;
  /* Riveted corners. */
  background-image:
    radial-gradient(circle at 10px 10px, #8a8a85 3px, transparent 4px),
    radial-gradient(circle at calc(100% - 10px) 10px, #8a8a85 3px, transparent 4px);

  & h2 {
    margin-block-start: 0;
  }
}

.meta {
  color: #4a4a46;
  font-size: 0.875rem;
}

.widget-cta {
  background-color: #f5c400;
}

.button-link {
  display: inline-block;
  padding-block: 0.625rem;
  padding-inline: 1.25rem;
  background: #111111;
  color: #f5c400;
  font-weight: 600;
  text-decoration: none;
}

.site-footer {
  padding-block: 2rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: #111111;
  color: #f2f2ef;

  & a {
    color: #f5c400;
  }
}
```

`public/art/tow-hook.svg` (SVGO it):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="6" height="18" x="21" y="2" fill="#111"/><path fill="none" stroke="#111" stroke-linecap="round" stroke-width="6" d="M24 20v10a8 8 0 1 1-8-8"/></svg>
```

- [ ] **Step 6: Run and check the 404** (Review Focus #4)
  - Run `pnpm --filter demo-site-toe-truck dev`.
  - Run `curl -s -o /dev/null -w '%{http_code}' 'http://localhost:8081/post.php?slug=nope'`. Expected: `404`.
  - Run `curl -s 'http://localhost:8081/post.php?slug=nope' | grep -c 'Wrong Exit'`. Expected: `1`.
  - Run `curl -s 'http://localhost:8081/post.php?slug[]=x' | grep -c -i 'warning'`. Expected: `0`.
  - Browser: `/book.php` runs the full booking. Review Focus #2: `ZOCDOC_MODE=live` with no token shows the warning.
  - Take screenshots.

- [ ] **Step 7: Commit:** `add Toe Truck PHP demo site`.

---

### Task 7: Smoke check

**Files:**
- Create: `packages/demo/sites/smoke.ts`

**Interfaces:**
- Consumes: the four dev servers on their ports (started by `pnpm demo:sites`), and the `data-step` attributes (Vue).
- Produces: `pnpm demo:sites:smoke` exits 0 when every check passes, and non-zero with a per-check report otherwise.

- [ ] **Step 1: Write the script**

```ts
/**
 * Smoke check for the demo sites: every page renders its components and passes axe, and each
 * site's booking reaches the time step on fixtures. Minimal on purpose (TS-003): edge and
 * error states belong to the library's own suites. Expects `pnpm demo:sites` to be running.
 */
import { createRequire } from 'node:module';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const AXE_SOURCE: string = require('node:fs').readFileSync(require.resolve('axe-core'), 'utf8');

interface Check {
  site: string;
  url: string;
  elements: string[];
  /** Drives the page to the time step, if this page books. */
  book?: (page: Page) => Promise<void>;
  /** Text the page must show once rendered. */
  expectText?: string;
}

const pickFirstProviderAndSlot = async (page: Page) => {
  await page.locator('zd-provider-results').locator('[part="provider"]').first().click();
  await page.locator('zd-availability-picker').locator('[part="slot"]').first().click();
};

const CHECKS: Check[] = [
  { site: 'hillbilly', url: 'http://localhost:5181/', elements: [] },
  { site: 'hillbilly', url: 'http://localhost:5181/meet-the-doc', elements: [] },
  { site: 'hillbilly', url: 'http://localhost:5181/book', elements: ['zd-booking'], book: pickFirstProviderAndSlot },
  { site: 'eye-caramba', url: 'http://localhost:5182/', elements: [] },
  { site: 'eye-caramba', url: 'http://localhost:5182/frames', elements: [] },
  {
    site: 'eye-caramba',
    url: 'http://localhost:5182/book',
    elements: ['zd-provider-search', 'zd-provider-results'],
    book: async (page) => {
      await pickFirstProviderAndSlot(page);
      await page.locator('[data-step="patient"]').waitFor();
    },
  },
  { site: 'synergy', url: 'http://localhost:8082/', elements: [] },
  { site: 'synergy', url: 'http://localhost:8082/about', elements: [] },
  { site: 'synergy', url: 'http://localhost:8082/leaders', elements: ['zd-provider-card'] },
  {
    site: 'synergy',
    url: 'http://localhost:8082/leaders/pr_nope%7Clo_nope',
    elements: [],
    expectText: 'pivoted to new opportunities',
  },
  { site: 'toe-truck', url: 'http://localhost:8081/', elements: [] },
  { site: 'toe-truck', url: 'http://localhost:8081/post.php?slug=bunion-needs-a-tow', elements: [] },
  { site: 'toe-truck', url: 'http://localhost:8081/book.php', elements: ['zd-booking'], book: pickFirstProviderAndSlot },
];

async function assertRendered(page: Page, tag: string): Promise<void> {
  await page.waitForFunction(
    (name) => {
      const el = document.querySelector(name);
      return !!customElements.get(name) && !!el?.shadowRoot?.childElementCount;
    },
    tag,
    { timeout: 10_000 }
  );
}

async function axe(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: AXE_SOURCE });
  const violations = await page.evaluate(async () => {
    // @ts-expect-error injected global
    const result = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] });
    return result.violations.map((v: { id: string; nodes: unknown[] }) => `${v.id} (${v.nodes.length})`);
  });
  return violations;
}

const browser = await chromium.launch();
const failures: string[] = [];

for (const check of CHECKS) {
  const page = await browser.newPage();
  const label = `${check.site} ${new URL(check.url).pathname}${new URL(check.url).search}`;
  try {
    const response = await page.goto(check.url, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    for (const tag of check.elements) await assertRendered(page, tag);
    if (check.expectText) await page.getByText(check.expectText).waitFor({ timeout: 10_000 });
    let violations = await axe(page);
    if (check.book) {
      await check.book(page);
      violations = [...violations, ...(await axe(page)).map((v) => `${v} [after booking steps]`)];
    }
    if (violations.length) throw new Error(`axe: ${violations.join(', ')}`);
    process.stdout.write(`ok   ${label}\n`);
  } catch (error) {
    failures.push(label);
    process.stdout.write(`FAIL ${label} — ${(error as Error).message.split('\n')[0]}\n`);
  } finally {
    await page.close();
  }
}

// Synergy detail page for a real leader: the first card's link.
{
  const page = await browser.newPage();
  const label = 'synergy /leaders/{first}';
  try {
    await page.goto('http://localhost:8082/leaders', { waitUntil: 'networkidle' });
    await page.locator('.roster-link').first().click();
    await assertRendered(page, 'zd-provider-profile');
    await page.locator('zd-availability-picker').locator('[part="slot"]').first().click();
    const violations = await axe(page);
    if (violations.length) throw new Error(`axe: ${violations.join(', ')}`);
    process.stdout.write(`ok   ${label}\n`);
  } catch (error) {
    failures.push(label);
    process.stdout.write(`FAIL ${label} — ${(error as Error).message.split('\n')[0]}\n`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  process.stdout.write(`\n${failures.length} check(s) failed. Is \`pnpm demo:sites\` running?\n`);
  process.exit(1);
}
process.stdout.write('\nAll demo sites healthy.\n');
```
The script only clicks provider and slot buttons and never fills the patient form, so no patient data is entered.

Playwright locators pierce open shadow roots, so `[part="provider"]` inside `zd-provider-results` resolves. If a selector misses, look up the part names in `.claude/skills/api-components/references/*.md`. Don't guess.

- [ ] **Step 2: Run it against a stopped server.** Run `pnpm demo:sites:smoke` with nothing running. Expected: every line FAIL, exit 1, and the "Is `pnpm demo:sites` running?" hint.

- [ ] **Step 3: Run it for real.** In one terminal run `pnpm demo:sites`, then in another run `pnpm demo:sites:smoke`. Expected: all `ok`, exit 0. Fix site markup or theme contrast for any axe violation. Never disable axe rules.

- [ ] **Step 4: Lint, format, commit:** `add Playwright + axe smoke check for demo sites`.

---

### Task 8: README and docs

**Files:**
- Create: `packages/demo/sites/README.md`
- Modify: `packages/docs/src/content/docs/guides/frameworks.mdx` (append sections at the end)

- [ ] **Step 1: README**

````markdown
# Demo Sites

Four fictional practices, four stacks, one component library. Built for partner demos.

| Site | Stack | Pattern | URL |
| --- | --- | --- | --- |
| Hillbilly Dentistry | React 19 | `<ZdBooking modal>` via `/react` wrappers | http://localhost:5181 |
| Eye Caramba Optometry | Vue 3 | Composed components wired with Vue events; host books via the client | http://localhost:5182 |
| Corporate Wellness Synergy Partners LLC | ASP.NET Core 10 | Server-rendered roster and profile pages, script-tag bundle | http://localhost:8082 |
| Toe Truck Podiatry | PHP | One `<script>` tag and one `<zd-booking>` tag | http://localhost:8081 |

## Prerequisites

- Node and pnpm (repo root `pnpm install`)
- PHP 8.4+ with `intl`: `brew install php`
- .NET 10 SDK: `brew install --cask dotnet-sdk`

## Run

```sh
pnpm build && pnpm --filter @zocdoc/api-components build:bundle   # once, and after library changes
pnpm demo:sites                                                    # all four
pnpm --filter demo-site-toe-truck dev                              # or one
pnpm demo:sites:smoke                                              # with the sites running
```

The ASP.NET and PHP sites load copies of `zocdoc.js` and `all.css`. `pnpm sites:sync` (run automatically by their `dev` scripts) refreshes those copies from `dist`.

## Sample data vs. live sandbox

Every site serves fixtures by default. No token is needed and no request leaves the page. To use the live developer sandbox:

| Stack | Set |
| --- | --- |
| React, Vue | `VITE_ZOCDOC_MODE=live` and `VITE_ZOCDOC_TOKEN` in the repo-root `.env.local` |
| ASP.NET, PHP | `ZOCDOC_MODE=live` and `ZOCDOC_TOKEN` in the environment (ASP.NET also reads `dotnet user-secrets`) |

Asking for live without a token falls back to fixtures and says so on the page ribbon.

The sandbox fixtures have no optometrist or podiatrist, so Eye Caramba and Toe Truck search Primary Care in fixture mode. In live mode, Eye Caramba searches `sp_155` (override with `VITE_ZOCDOC_SPECIALTY_ID`), and Toe Truck uses `ZOCDOC_SPECIALTY_ID`.

## Exemption: fonts and images

These sites load Google Fonts and stock photos from CDNs to look like real practice websites. That's a **demo-only** exemption to PHI-003 and must never be copied into the component library. Booking data still goes only to the configured Zocdoc base URL. No analytics.

## Library follow-ups

None yet. Record here anything a site needed that the library couldn't do.
````

- [ ] **Step 2: Append to `frameworks.mdx`**

````mdx
## Plain HTML, PHP, ASP.NET, and other server-rendered sites

No bundler is needed. Load the prebuilt bundle and the theme, and the bundle configures itself from its own `<script>` tag:

```html
<link rel="stylesheet" href="/zocdoc/all.css" />
<script src="/zocdoc/zocdoc.js" zd-token="TOKEN_FROM_YOUR_BACKEND"></script>

<zd-booking zip-code="11201"></zd-booking>
```

`zocdoc.js` is `@zocdoc/api-components/bundle/iife`, and `all.css` is `@zocdoc/api-primitive-components/theme/all.css`. Use `zd-mock` instead of `zd-token` to serve sample data with no network calls, and `zd-base-url` to point at another environment. Everything the package exports is also on the `Zocdoc` global. For example, `Zocdoc.searchProviderLocations()` loads providers for `zd-provider-card`, which takes a `provider` object.

## See it in other stacks

The repo's `packages/demo/sites` folder has four themed demo sites, each using a different integration pattern:

| Site | Stack | Pattern |
| --- | --- | --- |
| Hillbilly Dentistry | React | `ZdBooking` in modal mode via the React wrappers |
| Eye Caramba Optometry | Vue | Composed components wired with Vue events, booking through the client |
| Corporate Wellness Synergy Partners LLC | ASP.NET Core | Script-tag bundle, server-rendered roster and profile pages |
| Toe Truck Podiatry | PHP | One script tag and one `zd-booking` tag |

Run them with `pnpm demo:sites`. See the folder's README for prerequisites.
````

- [ ] **Step 3: Check the docs build:** `pnpm --filter docs build`. Expected: success.

- [ ] **Step 4: Commit:** `document demo sites and script-tag integration`.

---

### Task 9: Final verification

- [ ] **Step 1:** Run `pnpm lint && pnpm format:check && pnpm typecheck`. Expected: all pass.
- [ ] **Step 2:** Run `node --experimental-strip-types --test packages/demo/sites/sync-assets.test.ts packages/demo/sites/eye-caramba/src/booking-status.test.ts`. Expected: 4 pass.
- [ ] **Step 3:** With `pnpm demo:sites` running, run `pnpm demo:sites:smoke`. Expected: all ok.
- [ ] **Step 4:** Make sure the library suites still pass. `pnpm test` is unaffected by the new packages.
- [ ] **Step 5:** Run `git status`. Expected: clean, with no synced assets, `bin/` or `obj/` tracked.
