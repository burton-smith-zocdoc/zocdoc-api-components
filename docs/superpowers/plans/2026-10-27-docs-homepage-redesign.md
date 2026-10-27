# Docs Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default Starlight splash page with a branded homepage (hero → live playground → "Two ways to use it" → closing CTA). Retheme the whole docs site in Zocdoc colors and a free self-hosted font.

**Architecture:** The site-wide look lives in `custom.css` and a new `fonts.css`, wired through `astro.config.mjs`. The homepage stays on Starlight's `splash` template:
- The hero uses frontmatter. `hero.title` is rendered with `set:html`, so it can carry a `<mark>`.
- The two new sections are Astro components imported into `index.mdx`.
- The playground puts Starlight `<Tabs>` with four static code blocks next to **one** live `<zd-booking>`, loaded through the existing `PreviewRuntime`.

Verification is a Playwright smoke script against `astro preview`, modeled on `packages/demo/sites/smoke.ts`. It checks rendering, axe in both color modes, a click-through to the time step, and that no requests go to other origins.

**Tech Stack:** Astro 7.3, Starlight 0.41, `@fontsource-variable/figtree`, Playwright + axe-core (already root devDependencies), oxnode.

**Spec:** `docs/superpowers/specs/2026-10-27-docs-homepage-redesign-design.md`

## Global Constraints

- The site base path is `/zocdoc-api-components`. Every internal link includes it, e.g. `/zocdoc-api-components/getting-started/installation/`.
- Live components load only through `packages/docs/src/components/PreviewRuntime.astro`. Don't add a second runtime.
- Keep the anti-flash rule in `custom.css` (`@property --zd-wc-loaded` …) unchanged.
- Colors:
  - Yellow `#fdd832` / `#e4ae00` is for highlights only, never for text on a light background.
  - Teal `#45b1cd` / `#19809a` is for links and accents. On light backgrounds, link text is `#19809a` or darker.
- Primary buttons are near-black `#1b1b1b` with white text in light mode, and a light fill with dark text in dark mode. Secondary buttons stay outlined.
- Fonts: self-hosted only. No font CDN and no third-party requests (PHI-003). The same font goes into `--sl-font` and `--zd-font-family-base`.
- Copy is fixed:
  - Hero: "Zocdoc booking, anywhere on the web." / "A few lines of HTML. Any framework. Fully themeable."
  - Section: "Two ways to use it" / "Start with one tag. Break it apart when you need control."
- The demo uses `<zd-booking zip-code="11201">` inline (no `modal`) on the existing mock fixtures (PHI-002).
- CSS follows STYLE-001/002 (nesting, no BEM) and I18N-003 (logical properties). Markup uses semantic elements: `<section>`, `<header>`, `<h2>`. No `&nbsp;` for spacing (TS-019).
- Never read `**/custom-elements.json` or `packages/*/dist/`.
- **No commits unless the user asks.** At each "Checkpoint" step, stop, summarize the diff, and wait.

## Review Focus

1. **Dark mode on every page.** The near-black button must flip to a light fill, and teal links must stay legible on the dark background. The smoke script runs axe with `data-theme="dark"` on the home, a component page, and a guide page (Task 1).
2. **Narrow viewports (≤ 50rem).** The playground stacks with code above the preview, and nothing overflows horizontally. The smoke script checks `scrollWidth <= clientWidth` at 375px wide (Task 2).
3. **Switching tabs must not reset the demo.** A visitor partway through the booking flow who switches from HTML to React keeps their place. The smoke script picks a provider, switches tabs, and asserts the same element is still at the time step (Task 2).
4. **Existing previews and code blocks keep working under the new theme.** `preview.css` maps Shiki tokens to `--sl-color-*`, and the accent change must not make code unreadable. axe on `components/booking/` covers contrast (Task 1).
5. **Links work with the base path.** Every homepage link resolves to 200 under `/zocdoc-api-components/`. The smoke script follows every `a[href^="/zocdoc-api-components/"]` on the home page (Task 3).

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/docs/smoke.ts` (create) | Playwright smoke checks against `astro preview` |
| `packages/docs/package.json` (modify) | adds the `smoke` script and the font dependency |
| `packages/docs/src/styles/fonts.css` (create) | font import and the `--sl-font` / `--zd-font-family-base` mapping |
| `packages/docs/src/styles/custom.css` (modify) | accent palette, link color, primary-button override, `mark` highlight |
| `packages/docs/src/assets/wordmark.svg` (create) | text wordmark logo (yellow "Z" chip) |
| `packages/docs/astro.config.mjs` (modify) | `logo`, `customCss` order |
| `packages/docs/src/components/HomePlayground.astro` (create) | tabbed code panel and one live `<zd-booking>` |
| `packages/docs/src/components/HomeUsage.astro` (create) | the "Two ways to use it" section |
| `packages/docs/src/components/HomeClosing.astro` (create) | the closing line and CTA |
| `packages/docs/src/content/docs/index.mdx` (rewrite) | hero frontmatter and the three sections |

---

### Task 1: Smoke harness and site-wide theme

**Files:**
- Create: `packages/docs/smoke.ts`, `packages/docs/src/styles/fonts.css`, `packages/docs/src/assets/wordmark.svg`
- Modify: `packages/docs/package.json`, `packages/docs/src/styles/custom.css`, `packages/docs/astro.config.mjs`

**Interfaces:**
- Produces:
  - `smoke.ts` exports nothing and runs top-level, like the demo smoke.
  - Later tasks add entries to its `CHECKS: Check[]` array and add standalone `run(label, body)` blocks.
  - `interface Check { label: string; path: string; elements: string[]; themes: ('light' | 'dark')[]; body?: (page: Page) => Promise<void> }`. `path` is relative to `BASE = 'http://localhost:4321/zocdoc-api-components'`.
  - Shared helpers: `assertRendered(page, tag)`, `axe(page)` (both copied from the demo smoke), and `setTheme(page, theme)`, which sets `localStorage['starlight-theme']` before navigation and asserts `document.documentElement.dataset.theme`.
  - CSS custom properties available site-wide: `--zd-docs-ink: #1b1b1b`, `--zd-docs-yellow: #fdd832`, `--zd-docs-yellow-strong: #e4ae00`, `--zd-docs-teal: #45b1cd`, `--zd-docs-teal-strong: #19809a`. Tasks 2 and 3 use these, never raw hex values.

- [ ] **Step 1: Write the smoke script with theme checks**

  `CHECKS` covers `/` (elements `[]` for now), `/components/booking/` (`['zd-booking']`), and `/guides/theming/` (`[]`), each run in `['light', 'dark']`. Every check:
  - fails on a non-OK response,
  - waits for `elements`,
  - runs axe with the demo smoke's `runOnly` tags,
  - and fails on any request whose origin isn't `http://localhost:4321`. Collect these with `page.on('request')`.

  Add one standalone check, `font: docs and components share the stand-in`, on `/components/booking/`:

  ```ts
  const [docsFont, zdFont] = await page.evaluate(() => [
    getComputedStyle(document.body).fontFamily,
    getComputedStyle(document.documentElement).getPropertyValue('--zd-font-family-base'),
  ]);
  if (!docsFont.includes('Figtree')) throw new Error(`docs font: ${docsFont}`);
  if (!zdFont.includes('Figtree')) throw new Error(`component font: ${zdFont}`);
  ```

  Add one standalone check, `primary button is near-black`. It reads `getComputedStyle(document.querySelector('.sl-link-button.primary')).backgroundColor` on `/` in light mode and expects `rgb(27, 27, 27)`. In dark mode it expects any color with luminance > 0.8.

  Finish with `process.exit(1)` if anything failed, and print `Is \`pnpm --filter docs preview\` running?`.

- [ ] **Step 2: Add the script and dependency, then run the smoke to confirm it fails**

  - In `packages/docs/package.json`, add the script `"smoke": "oxnode smoke.ts"`.
  - Run `pnpm --filter docs add @fontsource-variable/figtree`.
  - Run `pnpm --filter docs build && (pnpm --filter docs preview &) && pnpm --filter docs smoke`.

  Expected: `FAIL font …` (docs font is the system stack) and `FAIL primary button …` (accent blue). The axe checks may pass. Write down any axe failure on the existing site so it isn't blamed on later tasks.

- [ ] **Step 3: Implement the theme**

  - **`fonts.css`:**
    - `@import '@fontsource-variable/figtree';`
    - on `:root`, set `--sl-font: 'Figtree Variable', system-ui, sans-serif;` and `--zd-font-family-base` to the same value,
    - and add a comment saying to drop the `--zd-*` override once licensed Sharp Sans is available.
  - **`custom.css`, palette:**
    - Add the `--zd-docs-*` properties from Interfaces.
    - Replace the blue `--sl-color-accent-*` with teal steps, separately per theme:
      - dark: `accent-low` deep teal, `accent` `#45b1cd`, `accent-high` a pale teal
      - light: `accent` `#19809a`, `accent-high` darker than `#19809a` (Starlight uses `accent-high` for link text in light mode)
  - **`custom.css`, primary buttons:** under `.sl-link-button.primary`, set `background` and `border-color` to `var(--zd-docs-ink)`, `color` to white, and a yellow focus ring (`outline-color: var(--zd-docs-yellow-strong)`). Under `:root[data-theme='dark'] &`, invert to a light fill with ink text.
  - **`custom.css`, highlight:** add `.hero mark` with a yellow marker underline: `background: linear-gradient(transparent 60%, var(--zd-docs-yellow) 60%)`, `color: inherit`.
  - **Logo:** `wordmark.svg` is a yellow rounded "Z" chip next to "API Components" in `currentColor` text, optimized with SVGO. In `astro.config.mjs`, set `logo: { src: './src/assets/wordmark.svg', alt: 'Zocdoc API Components' }` and `replacesTitle: true`.
  - **`astro.config.mjs`:** set `customCss` to `['./src/styles/fonts.css', './src/styles/custom.css', './src/styles/preview.css']`.

- [ ] **Step 4: Rebuild and run the smoke to confirm it passes**

  Run the Step 2 command again. Expected: every line is `ok`, ending with `All docs checks passed.`

- [ ] **Step 5: Look at it**

  Screenshot `/`, `/components/booking/`, and `/guides/theming/` in both themes with the `playwright-cli` skill. Confirm by eye that code blocks and previews are readable and that the wordmark shows in both themes.

- [ ] **Step 6: Checkpoint.** Stop and summarize the diff for the user. Commit only if asked.

---

### Task 2: Homepage playground

**Files:**
- Create: `packages/docs/src/components/HomePlayground.astro`
- Modify: `packages/docs/smoke.ts`

**Interfaces:**
- Consumes: the `--zd-docs-*` properties and the `smoke.ts` helpers from Task 1. `PreviewRuntime.astro`, as it stands.
- Produces: `<HomePlayground />`, which takes no props. Its root is `<section class="playground not-content" aria-labelledby="playground-heading">`, and it holds a visually hidden `<h2 id="playground-heading">Try it live</h2>`. Task 3 places it right after the hero.

- [ ] **Step 1: Add the playground checks to the smoke script**

  Change the `/` check's `elements` to `['zd-booking']`. Add these standalone checks:
  - **`playground: tabs keep the demo in place`**
    - Open `/`. Tag the element with `zd.dataset.smoke = '1'`.
    - Submit the search and pick a provider, reusing the demo smoke's `searchAndPickProvider` on `zd-booking` and copying it in.
    - Click the tab named `React` with `page.getByRole('tab', { name: 'React' })`.
    - Assert that `zd-booking[data-smoke="1"]` still exists and that its `zd-availability-picker [part="slot"]` is still visible.
    - Assert that the visible code panel contains `ZdBooking`.
  - **`playground: four tabs`**: the tab names are exactly `['HTML', 'React', 'Vue', 'npm']`.
  - **`playground: narrow viewport`**: at viewport `375×800`, assert that `document.documentElement.scrollWidth <= clientWidth`, and that the code panel's `getBoundingClientRect().top` is less than the preview's.

- [ ] **Step 2: Run the smoke to confirm the new checks fail**

  Run the same build, preview, and smoke command. Expected: the `/` and `playground:` checks FAIL (there's no `zd-booking` on the home page yet). The Task 1 checks still pass.

- [ ] **Step 3: Implement `HomePlayground.astro`**

  - **Layout:** a two-column CSS grid, with code on the left and the preview on the right. It stacks at `max-width: 50rem` with code first.
  - **Code panel:**
    - It's always dark: `background: var(--zd-docs-ink)`, in both themes.
    - Starlight `<Tabs>` with `<TabItem label="HTML|React|Vue|npm">`, each holding one fenced block rendered with Starlight's `<Code>` (Expressive Code, so it has a copy button).
    - Tab content is fixed:
      - **HTML:** the `<link>` and `<script src=".../bundle/iife" zd-token="TOKEN_FROM_YOUR_BACKEND">` lines from `getting-started/installation.mdx`, then `<zd-booking zip-code="11201"></zd-booking>`.
      - **React:** `import { configureZocdoc } from '@zocdoc/api-components'; import { ZdBooking } from '@zocdoc/api-components/react';`, then `configureZocdoc({ getToken })` and `<ZdBooking zipCode="11201" />`. Check the prop spelling against `guides/frameworks.mdx`.
      - **Vue:** the `<template><zd-booking zip-code="11201" /></template>` snippet in the style of `guides/frameworks.mdx`.
      - **npm:** `npm install @zocdoc/api-components @zocdoc/api-primitive-components`, then `import '@zocdoc/api-primitive-components/theme/all.css';`.
  - **Preview:**
    - A light card: `background: var(--sl-color-bg)`, a subtle border, and a shadow.
    - A small "● Live preview" label as a text node (I18N-001).
    - `<zd-booking zip-code="11201"></zd-booking>` as plain markup outside the Tabs, so it renders once.
  - **Runtime:** include `<PreviewRuntime />` here, so pages using the playground get the runtime without importing it separately.

- [ ] **Step 4: Rebuild and run the smoke to confirm it passes**

  Expected: all `ok`.

- [ ] **Step 5: Look at it.** Take screenshots at 1280px and 375px wide in both themes.

- [ ] **Step 6: Checkpoint.** Stop and summarize. Commit only if asked.

---

### Task 3: Homepage hero, "Two ways to use it", closing

**Files:**
- Create: `packages/docs/src/components/HomeUsage.astro`, `packages/docs/src/components/HomeClosing.astro`
- Rewrite: `packages/docs/src/content/docs/index.mdx`
- Modify: `packages/docs/smoke.ts`

**Interfaces:**
- Consumes: `<HomePlayground />` (Task 2), and the `--zd-docs-*` properties and `.hero mark` style (Task 1).
- Produces: `<HomeUsage />` and `<HomeClosing />`, both with no props.

- [ ] **Step 1: Add the homepage checks to the smoke script**

  - **`home: copy and order`**
    - `h1` text is `Zocdoc booking, anywhere on the web.`
    - `.hero .tagline` is `A few lines of HTML. Any framework. Fully themeable.`
    - The section `h2`s appear in this order: the playground heading, then `Two ways to use it`.
    - The page has exactly two `.sl-link-button.primary` named "Get started" (hero and closing).
    - There's no `.card-grid`, so the old cards are gone.
  - **`home: usage cards link out`**
    - The "All-in-one" card links to `/zocdoc-api-components/components/booking/`.
    - The "Compose your own" card links to `/zocdoc-api-components/guides/composed-vs-single/`.
    - A "See all 13 components" link goes to `/zocdoc-api-components/components/appointment/`. That's the first page in the sidebar's alphabetically autogenerated "API Components" section, and the sidebar lists the other 12 from there.
  - **`home: every internal link resolves`**: for each unique `a[href^="/zocdoc-api-components/"]` on `/`, `page.request.get(BASE_ORIGIN + href)` is OK.

- [ ] **Step 2: Run the smoke to confirm the new checks fail.** Expected: the three `home:` checks FAIL because the old tagline and card grid are still there.

- [ ] **Step 3: Implement**

  - **`index.mdx` frontmatter:**
    - Keep `title: Zocdoc API Components` (used for `<title>`) and `template: splash`.
    - `hero.title: 'Zocdoc booking, <mark>anywhere on the web.</mark>'`
    - `hero.tagline`: the fixed copy.
    - Actions:
      - `{ text: 'Get started', link: '/zocdoc-api-components/getting-started/installation/', icon: right-arrow, variant: primary }`
      - `{ text: 'GitHub', link: 'https://github.com/burton-smith-zocdoc/zocdoc-api-components', icon: external, variant: minimal }` (or `secondary` if `minimal` reads too weak against the black primary)
  - **`index.mdx` body:** import and render `<HomePlayground />`, `<HomeUsage />`, `<HomeClosing />`, and nothing else.
  - **`HomeUsage.astro`:**
    - `<section>` with an `<h2>` and a lead `<p>` using the fixed copy.
    - Two `<article>` cards in a two-column grid that stacks under 50rem. Each card has an `<h3>`, a one-line description, a `<Code>` block, and a link:
      - **All-in-one:** "The whole booking flow, ready to use." with `<zd-booking zip-code="11201"></zd-booking>`, linking to "Booking component →".
      - **Compose your own:** "Use only the pieces you need, in your own layout." with a short snippet: `<zd-provider-card>`, `<zd-availability-picker>`, and a `addEventListener('slot-select', …)` line. It links to "Composed vs single element →", with a second link, "See all 13 components →".
    - These are code only, with no live elements.
  - **`HomeClosing.astro`:** a centered `<section>` with one line ("Ready to add Zocdoc to your site?") and a Starlight `<LinkButton>` "Get started" pointing at Installation, variant `primary`, icon `right-arrow`.

- [ ] **Step 4: Rebuild and run the smoke to confirm it passes.** Expected: every check `ok` → `All docs checks passed.`

- [ ] **Step 5: Final verification**
  - `pnpm lint && pnpm format:check`
  - `node --test packages/docs/src/plugins/remark-component-preview.test.js`, which should still pass.
  - Full-page screenshots of `/` in both themes at 1280px and 375px. Compare them with the approved mockups in `.superpowers/brainstorm/` (hero/playground option B, usage option C).

- [ ] **Step 6: Checkpoint.** Stop and summarize the whole change for the user. Commit only if asked.
