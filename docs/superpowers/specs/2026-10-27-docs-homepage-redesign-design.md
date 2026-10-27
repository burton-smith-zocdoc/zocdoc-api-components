# Docs homepage and site theme redesign

**Date:** 2026-10-27
**Package:** `packages/docs` (Astro 7 + Starlight 0.41)
**Status:** Draft for review

## Intent

These components are loosely modeled on Shopify's Storefront Web Components, and their message is the same: you can add the Zocdoc booking experience to any web project with a few lines of HTML. Today the docs don't show that. The homepage is Starlight's default splash: a tagline, a "Get Started" button, and four generic feature cards. It has no code and no live component, and the site's generic blue accent doesn't look like Zocdoc.

When a developer lands on the homepage, they should see right away:

1. what these components do: Zocdoc booking inside their own site,
2. that the components work in whatever stack they already use,
3. how to get started,

and the components should look good while showing this.

Reference sites: vitest.dev (calm centered hero), supabase.com/docs (install steps and frameworks up front), docs.stripe.com/api (code beside explanation), and shopify.dev Storefront Web Components (the message, plus live presets).

## Goals

- A homepage made of three sections: a hero, a live playground, and "Two ways to use it." It ends with a single closing call to action.
- The real `<zd-booking>` runs on the homepage on mock data, and visitors can click through the whole flow.
- The homepage shows "any framework" through framework-tabbed code, not just by saying it.
- The whole docs site gets a Zocdoc look: yellow and teal on a free substitute font, with light and dark modes.

## Non-goals

- **Redesigning the component reference pages.** A Stripe-style layout with code pinned beside the explanation is a separate follow-up project with its own design round. Theme changes will reach those pages automatically, but their layout stays as it is.
- **A component gallery, theme switcher, framework logo grid, or footer link grid on the homepage.** These were considered and left out. The page ends after "Two ways to use it."
- Sharp Sans or an official Zocdoc logo. Free substitutes are used for now (see Constraints).
- New components or changes to component behavior.

## Anti-goals (failure even if it "works")

- Mock data in the demo that looks like real patients. PHI-002 / TEST-003 apply: use only the documented test scenarios and the existing mock transport fixtures.
- Yellow text or links on a white background that fail WCAG AA contrast. The docs follow the same A11Y-001 target as the components.
- A busy, dense first screen. The hero should feel calm, like Vitest's.
- Demo previews that are faked with screenshots or static HTML instead of the real component.
- Third-party network calls added to the docs site, such as Google Fonts or analytics. Fonts are self-hosted.

## Decided design

### Page structure (top to bottom)

1. **Hero** (centered, short)
   - Headline: "Zocdoc booking, anywhere on the web."
   - Subhead: "A few lines of HTML. Any framework. Fully themeable."
   - Primary button "Get started →" goes to `getting-started/installation/`. Secondary button "GitHub" goes to the repo.
   - Highlight treatment on part of the headline: a yellow marker underline behind "anywhere on the web."
2. **Live playground** (directly under the hero, full content width)
   - Left side is a dark code panel with tabs: **HTML**, **React**, **Vue**, **npm**. Each tab shows how to drop in `<zd-booking zip-code="11201">` for that setup.
     - **HTML:** a `<link>` to the theme CSS, a `<script>` for the IIFE bundle, then the tag. Copy this from `getting-started/installation.mdx`.
     - **React:** the `ZdBooking` wrapper from `@zocdoc/api-components/react`, trimmed down from `guides/frameworks.mdx`.
     - **Vue:** the `<zd-booking>` template snippet from `guides/frameworks.mdx`.
     - **npm:** the install command plus the CSS import.
   - Right side is the real `<zd-booking zip-code="11201">` in **inline** mode (not modal), running on the mock transport.
   - Switching tabs changes only the code. The preview stays the same, which is the point: one component in any stack.
3. **"Two ways to use it"**
   - Heading "Two ways to use it", lead line "Start with one tag. Break it apart when you need control."
   - Two cards side by side, showing code only with no live previews:
     - **All-in-one:** a short `<zd-booking zip-code="11201">` snippet, linking to `components/booking/`.
     - **Compose your own:** a short snippet placing `<zd-provider-card>` and `<zd-availability-picker>` and listening for `slot-select`, linking to `guides/composed-vs-single/`. It also has a small "See all 13 components →" link to the components section.
4. **Closing:** one centered line and a single "Get started →" button that goes to Installation. No footer link grid.

The approved mockups are in `.superpowers/brainstorm/` (option B for the hero and playground, option C for the "fits together" section).

### Site-wide theme

- Replace the blue `--sl-color-accent-*` values in `src/styles/custom.css` with Zocdoc colors from `packages/primitives/src/theme/zocdoc.ts`:
  - **Brand yellow** (`#fdd832` / `#e4ae00`) for highlights and marker underlines, and as an accent (such as a focus ring or hover detail) on primary buttons. Never use it for text on light backgrounds.
  - **Teal** (`#45b1cd` / `#19809a`) for links, the accent color, and code-token accents. On light backgrounds, link text uses `#19809a` or darker so it meets AA.
- **Primary buttons are near-black** (`#1b1b1b`, white text) site-wide. This covers the hero and closing buttons and Starlight `LinkButton`s, and matches mockup B. In dark mode they invert to a light fill with dark text. The builder chooses the exact dark-mode values, as long as contrast passes. Starlight fills primary buttons with the accent color by default, so this needs a targeted button override, not an accent change. Secondary buttons stay outlined.
- Light and dark modes both stay. The playground code panel is dark in both themes.
- **Font:** use a free, self-hosted geometric sans as the stand-in for Sharp Sans, loaded through a local package such as `@fontsource/*` and never from a font CDN. Wire it through Starlight's `--sl-font`. **Live previews use the same font:** set `--zd-font-family-base` to the stand-in font on the docs site so the components match the pages around them, since the docs can't serve Sharp Sans and the components would otherwise fall back to Arial. This trades exact "out of the box" fidelity for consistency, and that's an accepted choice. When licensed Sharp Sans becomes available, drop the override. Keep the monospace font at Starlight's default unless the builder finds a clear improvement.
- **Logo:** a text wordmark in the top bar (e.g. a small yellow "Z" chip plus "API Components"), built in HTML/CSS or SVG. Configure it in Starlight so a real mark can replace it later.

## Constraints

- The site lives under `base: /zocdoc-api-components`. Every internal link must include the base path, as the existing pages do.
- Live components must load through the existing `PreviewRuntime.astro`, which registers primitives and API components, loads theme CSS, and calls `configureZocdocMock`. Don't build a second runtime.
- The `custom.css` anti-flash rule, which hides the body until custom elements are defined, must keep working on the homepage.
- Docs styles follow STYLE-001/002 (CSS nesting, no BEM) and I18N-003 (logical properties).
- The playground's tab control must be keyboard accessible and must pass axe in both color modes (A11Y-001). Starlight's `<Tabs>` already meets that.
- Don't read `**/custom-elements.json` or `packages/*/dist/`.
- Package direction stays `primitives ← api-components ← docs/demo` (PBZD-005). The docs only consume the packages.

## Left to the builder

- Whether the homepage stays on Starlight's `splash` template with custom MDX sections, or uses a custom page or a `Hero` component override. Choose whichever gives the cleanest result without fighting Starlight.
- How the playground is built. It could be a new Astro component combining Starlight `<Tabs>` with one live preview, or an extension of `ComponentPreview`. The constraint is that the preview renders once and doesn't re-render per tab.
- The exact free font. It should feel close to Sharp Sans: geometric, friendly, and readable at small sizes.
- Exact spacing, sizes, and the responsive layout. On narrow screens the playground should stack, code above preview.
- Whether top-bar navigation links (Docs / Components / Themes) are worth a Starlight `Header` override. The mockup showed them, but they aren't required. Starlight's sidebar and search may be enough.
- Fine-tuning the exact color steps for each Starlight variable, as long as contrast passes.

## Verification

- `pnpm` docs dev server renders the homepage. The `<zd-booking>` flow can be completed end to end on mock data.
- axe passes on the homepage in light and dark modes.
- A spot check of a component page and a guide page in both modes confirms the new theme didn't break code blocks, previews (`preview.css`), or asides.
- The browser network tab shows no requests beyond the docs origin and the mock image assets.
- `pnpm build` for the docs succeeds.
