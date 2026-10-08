# Demo Sites: Four Stacks, Four Fictional Practices

**Date:** 2026-10-07
**Status:** Draft — awaiting review

## Purpose

Polished partner/sales demos that show `@zocdoc/api-components` dropping into four different
development environments — React, Vue, ASP.NET, and PHP — and taking on four very different
brands. Believability and visual quality are the primary goal; each site should look like a real
(if absurd) practice website that happens to have Zocdoc booking built in.

Each site also demonstrates a *different integration pattern*, so the set together covers the
range of ways a partner can adopt the library:

| Stack | Practice | Specialty | Integration pattern |
| --- | --- | --- | --- |
| React | Hillbilly Dentistry | Dentist | Full `zd-booking` funnel in modal mode via the typed `/react` wrappers |
| Vue | Eye Caramba Optometry | Optometrist | Composed pieces wired together with Vue events, host books via the client |
| ASP.NET Core | Corporate Wellness Synergy Partners LLC | General practice | Server-rendered multi-page site: provider roster, profile pages, booking per provider |
| PHP | Toe Truck Podiatry | Podiatrist | One `<script>` tag and one `<zd-booking>` tag in a WordPress-style template; no build, no JS of our own |

## Non-goals

- Deployment, hosting, or CI wiring for the sites.
- Live-sandbox runs by default. Live mode works when explicitly configured, but every site
  defaults to fixtures.
- Changes to the component library itself. If a site needs something the library can't do, that
  is recorded as a follow-up, not patched around inside the site.

## Layout

```
packages/demo/sites/
  hillbilly-dentistry/   React 19 + Vite + TS          package: demo-site-hillbilly-dentistry
  eye-caramba/           Vue 3 + Vite + TS             package: demo-site-eye-caramba
  synergy-partners/      ASP.NET Core (net10.0) Razor Pages   package: demo-site-synergy-partners
  toe-truck/             PHP (Homebrew current, 8.4+)  package: demo-site-toe-truck
  sync-assets.ts         copies the IIFE bundle + theme CSS into the server sites
  smoke.ts               Playwright + axe smoke check across all four
  README.md
```

- `pnpm-workspace.yaml` gains `'./packages/demo/sites/*'`. All four sites are workspace packages
  with a `dev` script, so every site starts the same way: `pnpm --filter <package> dev`.
- Root `package.json` gains:
  - `demo:sites` — runs all four `dev` scripts in parallel (`pnpm --filter "./packages/demo/sites/*" --parallel dev`).
  - `demo:sites:smoke` — runs `smoke.ts`.
- Fixed ports so the README and smoke check can rely on them:
  React **5181**, Vue **5182**, PHP **8081**, ASP.NET **8082**.

### Toolchains

PHP and the .NET SDK are installed locally via Homebrew (`brew install php`, and the .NET SDK — the
machine has the `dotnet` host but no SDKs). No Docker. The README lists both as prerequisites with
the install commands. ASP.NET targets **net10.0** (current LTS) rather than 9.

### How each site gets the library

- **React / Vue** depend on `@zocdoc/api-components` and `@zocdoc/api-primitive-components` via
  `workspace:*` and import them exactly as an npm consumer would, following
  `guides/frameworks.mdx`: the `/react` wrappers for React; `isCustomElement` plus
  `types/vue` for Vue. Both import `@zocdoc/api-primitive-components/theme/all.css`.
- **ASP.NET / PHP** consume only built artifacts — `dist/bundle/zocdoc.js` (IIFE, global
  `Zocdoc`) and `theme/all.css` — loaded with plain `<script>` / `<link>` tags. `sync-assets.ts`
  copies them from `packages/*/dist` into `synergy-partners/wwwroot/zocdoc/` and
  `toe-truck/public/zocdoc/`; both destinations are gitignored. Each server site's `dev` script
  runs `sync-assets` first. If the dist files are missing, `sync-assets` fails with a message
  naming the build command to run (`pnpm build` + `pnpm --filter @zocdoc/api-components build:bundle`).
  This mirrors what a PHP or .NET shop actually does: download two files, add a script tag.

## Mock vs. live

Fixtures are the default everywhere, for the same safety reason as `packages/demo/src/config.ts`:
a demo that defaults to live posts patient details to a real API the first time someone clicks
through.

- **React / Vue:** a `config.ts` per site using the same env vars as the existing demo
  (`VITE_ZOCDOC_MODE=live`, `VITE_ZOCDOC_TOKEN`, `VITE_ZOCDOC_BASE_URL`), loaded from the
  workspace-root `.env.local` via `envDir`. Live without a token falls back to fixtures with a
  visible warning. `getToken` is always a function (CLIENT-002).
- **ASP.NET / PHP:** the bundle configures itself from its script tag. Fixtures:
  `<script src="/zocdoc/zocdoc.js" zd-mock>`. Live, when `ZOCDOC_MODE=live` and `ZOCDOC_TOKEN` are
  set in the server's environment: `zd-token="…"` (and `zd-base-url` if `ZOCDOC_BASE_URL` is set).
  ASP.NET reads these through configuration, with the token in `dotnet user-secrets` or the
  environment and never in a committed `appsettings*.json`. PHP reads `getenv()`. One shared
  partial per site (`_ZocdocScript.cshtml`, `partials/zocdoc-script.php`) emits the tag.
- **Every site** shows a small fixed "Demo mode — sample data, no real appointments" ribbon
  in mock mode, and "Live sandbox" in live mode, so a booking on screen is never mistaken for a real
  one.

### Fixture coverage per site

The mock fixtures come from the published sandbox test-data guide. They list Primary Care
(`sp_153`), Dentist (`sp_154`), and Optometrist (`sp_155`) as specialties, but only Primary Care and
Dentist have fixture providers. Search filters by specialty.

- Hillbilly Dentistry searches `sp_154` and Synergy Partners `sp_153`.
- **Eye Caramba has no optometrist fixture.** It searches `sp_153` in mock mode and `sp_155` in live
  mode (overridable with `VITE_ZOCDOC_SPECIALTY_ID`), on the same reasoning as Toe Truck below.
- **Toe Truck Podiatry has no podiatry fixture.** It searches `sp_153` (Primary Care) in mock
  mode, and the specialty is a single constant in its config so live mode can use a real podiatry
  specialty. We don't add an invented podiatrist to the fixtures, which would break the "nothing
  invented" rule in `fixtures.ts` (PHI-002 / TEST-003). The site copy doesn't name the search
  specialty, so this reads naturally.
- All sites search ZIP `11201` (the documented results scenario).

## Sites

Each site has 2–4 pages of satirical copy, one `<h1>` per page, semantic landmarks
(`header`/`nav`/`main`/`footer`), and its own `theme.css` overriding the `--zd-*` design tokens
(colors, font family, radii, button and surface tokens) so the components look native to the brand.
Token names are taken from `@zocdoc/api-primitive-components/dist/theme/tokens.css` during
implementation, not guessed.

### Hillbilly Dentistry (React)

*"We'll fix what the moonshine took."*

- **Look:** rustic barn wood and gingham, mason-jar greens, a slab-serif display face (Google
  Fonts) over a readable body face, hand-drawn SVG accents (tooth with a straw hat).
- **Pages (React Router):** Home (hero and services: *Moonshine Damage Repair*, *Full Set of Teeth
  — Not Just Some*, *Banjo-Assisted Sedation*), Meet the Doc, Book.
- **Integration:** the Book page renders `<ZdBooking modal zipCode="11201" specialtyId="sp_154">`
  from `@zocdoc/api-components/react`. The search and results stay on the page; the time, patient,
  and confirmation steps run in the dialog. "Book Now" CTAs elsewhere route to `/book`
  (`zd-booking` has no open method; the dialog opens when a provider is chosen).
  `onBookingComplete` shows a "Yeehaw, you're booked!" toast that uses only `appointmentId` and
  `status` and never patient fields (PHI-001). `onBookingError` shows a generic friendly message,
  never the error's text (CLIENT-003).

### Eye Caramba Optometry (Vue)

*"Seeing is believing (with corrective lenses)."*

- **Look:** loud 80s retro, with neon magenta and teal on near-black, a display face for the hero,
  an eye-chart hero whose lines shrink row by row, and subtle scan-line overlay. All text pairs are
  contrast-checked to AA despite the palette.
- **Pages (Vue Router):** Home, Frames Gallery (joke products: *The Monocle Pro Max*, *Bifocals
  for Your Bifocals*), Book.
- **Integration:** the composed flow built in a single `BookingFlow.vue` with a reactive state
  machine:
  1. `<zd-provider-search zip-code="11201" :specialty-id>` (specialty per fixture coverage above), where `@provider-results` stores
     `providers`, `totalCount`, and the resolved visit reason.
  2. `<zd-provider-results :providers :total-count>`, where `@provider-select` stores the chosen
     location and `@page-change` re-runs the search for that page.
  3. `<zd-availability-picker :provider-location-id :visit-reason-id>`, where `@slot-select` stores
     `startTime`.
  4. `<zd-patient-form :insurance-plan-id :required-fields>`. On `@patient-submit`, the host itself
     calls `createAppointment` from `@zocdoc/api-components`, setting `busy` while it runs.
     This is the "book your own way" path `zd-patient-form` documents.
  5. `<zd-booking-confirmation :appointment-id :start-time :status :provider-name>`.

  Each step change moves focus to the step heading (A11Y-003). A "Back" button steps back. A
  collapsible **"Under the hood"** panel logs each event *name* as it fires (`provider-select`,
  `slot-select`, …), never its payload, so partners can see the props-in/events-out wiring without
  any patient data on screen (PHI-001).

### Corporate Wellness Synergy Partners LLC (ASP.NET Core Razor Pages)

*"Leveraging holistic care verticals."*

- **Look:** a parody enterprise site: navy and slate gray, a corporate sans-serif, stock-photo
  hero imagery (CDN), buzzword copy ("Our Value Proposition", "Wellness KPIs", "Synergize your
  sinuses"), and a footer with a fake 10-K and "Investor Relations (for your health)" link.
- **Pages:** Home, Our Thought Leaders (provider roster), Thought Leader detail
  (`/leaders/{providerLocationId}`), About.
- **Integration:**
  - The roster's search parameters (ZIP, specialty, insurance plan) live in `appsettings.json`
    under `Zocdoc:Roster`. C# owns the configuration the way a real CMS would, and Razor renders it
    into `data-*` attributes on the page.
  - `zd-provider-card` and `zd-provider-profile` take a `provider` **object** (no id attribute),
    so a small page script (`wwwroot/js/roster.js`, plain JS, no build) calls
    `Zocdoc.searchProviderLocations(...)` from the IIFE global and assigns each result to a
    server-rendered `<zd-provider-card>`. `profile-request` navigates to the detail page.
  - The detail page runs the same search, finds its location, assigns it to `<zd-provider-profile>`,
    and renders a "Request a Synergy Session" `<zd-booking modal>` with `providers` set to that one
    location and `providerLocationId` set to it. That starts the flow at the time step.
    `visit-reason-id` is set from the location's `default_visit_reason_id`. If handing a single
    provider in doesn't start the flow cleanly, that is recorded as a library follow-up (see
    Non-goals).
  - An unknown id on the detail page renders a friendly "This leader has pivoted to new
    opportunities" state with a link back, not an error page.

### Toe Truck Podiatry (PHP)

*"We'll tow you back on your feet."*

- **Look:** a tow yard: safety yellow and black hazard stripes, a chunky condensed display face,
  a riveted-metal card style, and a WordPress-classic layout with a "Latest from the Shop"
  sidebar. Hazard yellow is used only behind dark text, to keep contrast.
- **Pages:** Home (blog index: *5 Signs Your Bunion Needs a Tow*, *Arch Support: A Love Story*),
  a single-post template (`post.php?slug=…`), Book a Tow.
- **Structure:** WordPress-shaped on purpose (`header.php`, `footer.php`, `sidebar.php`,
  `index.php`, `post.php`, `book.php`) so a WordPress developer recognizes where the tags go.
  Posts are a PHP array in `posts.php`, with no database. `php -S` uses a small `router.php` to
  serve `public/` and route pages.
- **Integration:** deliberately minimal and the point of this site.
  - `header.php` holds the `<link>` to `theme/all.css`, the site theme, and the one script tag
    partial.
  - `book.php` is just `<zd-booking zip-code="11201" specialty-id="<?= SEARCH_SPECIALTY ?>">`.
  - The sidebar's "Get Towed In" widget, on every page, links to Book a Tow.
  - No JavaScript authored by us. The README's PHP section shows the whole integration as a
    three-line snippet.

## Cross-cutting rules

- **Third-party assets:** Google Fonts and CDN imagery (stock photos, icon sets) are allowed in
  these demo sites. The sites README states this is a demo-only exemption to PHI-003 for fonts and
  images, which must not be copied into the library. Booking data still only ever goes to the
  configured Zocdoc `baseUrl`. Provider photos come from the fixtures and Zocdoc's CDN as usual.
  No analytics or tracking of any kind. Any links to zocdoc.com carry referrer query params, not
  click handlers (TS-019).
- **Accessibility (A11Y-001):** each site must pass axe-core with no violations on every page:
  AA contrast with each theme's palette, visible focus styles, landmarks, one `<h1>`, alt text on
  all imagery (decorative images get `alt=""`). Component headings sit below the page `<h1>`.
- **Semantic HTML (TS-019):** landmarks and `article`/`section` over div soup. SVGs are optimized
  `.svg` files referenced via `<img>`, not inlined components.
- **i18n:** CSS logical properties throughout site styles (I18N-003). `Intl.DateTimeFormat` for any
  dates in the copy, such as blog post dates (I18N-002). `lang` set on `<html>`.
- **PHI:** no patient field values in any log, toast, panel, or console output (PHI-001). Sample
  data only from documented scenarios (PHI-002 / TEST-003).
- **Styles:** CSS nesting and plain semantic class names, no BEM (STYLE-001/002), applied to site
  stylesheets as well.

## Verification

- **Smoke check** (`packages/demo/sites/smoke.ts`, run with `pnpm demo:sites:smoke`). It uses
  the root's existing `playwright` and `axe-core` dev dependencies and adds no new test framework.
  For each site it:
  1. waits for the dev server on its fixed port (the script expects `pnpm demo:sites` to be running
     and fails clearly if a port isn't up);
  2. loads every page, asserts the expected `zd-*` elements are defined (`customElements.get`) and
     have rendered shadow content;
  3. on each site's booking page (for Synergy Partners, the first leader's detail page), runs the
     happy path once in fixtures: search, pick the first
     provider, pick the first slot. It stops before submitting the patient form;
  4. runs axe on each page and on the booking page at the time step, and fails on any violation.

  Per TS-003 this stays a minimal happy-path E2E check. Edge and error states are already covered by
  the library's own Vitest suites and aren't repeated here.
- **Visual check:** screenshots of each site's home and booking pages, reviewed during
  implementation in light mode at desktop and mobile widths.
- `pnpm lint` and `pnpm format:check` pass on the new TS/Vue files.

## Docs

- `packages/docs/src/content/docs/guides/frameworks.mdx` gains a closing section, **"See it in
  other stacks"**: one row per site with the integration pattern and the run command. It also gains
  a short **"Plain HTML, PHP, ASP.NET, and other server-rendered sites"** section showing the
  script-tag integration (`zd-mock` / `zd-token`), which the guide currently lacks.
- `packages/demo/sites/README.md`: prerequisites (Node/pnpm, `brew install php`, .NET SDK),
  build-then-run commands, ports, mock/live configuration per stack, the third-party-asset
  exemption note, and the fixture-coverage note for Toe Truck.

## Risks and open questions

- **Single-provider booking on the ASP.NET detail page.** Handing `zd-booking` a one-item
  `providers` list plus `providerLocationId` should start at the time step, according to
  `willUpdate`. This needs confirming early in implementation. If it doesn't work, the fallback is
  to render the search-first `zd-booking` on that page and note the gap.
- **Token CSS names.** Theme overrides depend on the token names in `tokens.css`. If a brand needs a
  knob the tokens don't expose, use `::part()` where the component offers a part, and otherwise
  record a follow-up. No reaching into shadow DOM.
- **`zd-mock` in the IIFE bundle** must already be built with the current fixtures. `sync-assets`
  copies whatever is in `dist`, so the README's build step comes before `dev`.
