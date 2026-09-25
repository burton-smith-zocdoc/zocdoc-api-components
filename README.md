# Zocdoc API Components

Embed Zocdoc booking flows directly into your website with a single HTML tag.

**[Live Demo](https://burton-smith-zocdoc.github.io/zocdoc-api-components/)**

## Why Use This?

Partner websites typically link users away to Zocdoc to book appointments. That handoff loses context, breaks the user's flow, and makes the booking feel disconnected from your brand.

These web components let you embed the full booking experience—search, availability, patient form, confirmation—without leaving your site. Users stay in your environment while getting Zocdoc's provider network and scheduling infrastructure.

## Features

- **Framework-agnostic** — Standard web components work in React, Vue, Angular, Svelte, or plain HTML
- **Accessible** — WCAG 2.2 AA conformant with full keyboard navigation and screen reader support
- **Themeable** — CSS custom properties adapt to your brand colors and typography
- **Privacy-first** — Patient data goes directly to Zocdoc's API; nothing is logged or sent elsewhere
- **Internationalization-ready** — RTL support, locale-aware date formatting, browser-translatable text

## Quick Start

```html
<script type="module">
  import { configure } from '@zocdoc/api-components';
  
  configure({
    getToken: () => fetchTokenFromYourServer(),
  });
</script>

<zd-booking
  specialty="dentist-general"
  location="10001"
></zd-booking>
```

The `<zd-booking>` component handles the entire flow: searching providers, selecting a time slot, collecting patient information, and confirming the appointment.

## Components

| Component | Purpose |
|-----------|---------|
| `<zd-booking>` | Complete booking flow in one component |
| `<zd-provider-search>` | Search form for specialty, location, insurance |
| `<zd-provider-results>` | Provider cards with availability preview |
| `<zd-availability-picker>` | Full calendar for a single provider |
| `<zd-patient-form>` | Patient information collection |

Use `<zd-booking>` for a drop-in solution, or compose the individual components for custom layouts.

## Packages

| Package | Description |
|---------|-------------|
| `@zocdoc/api-primitive-components` | UI primitives (buttons, inputs, cards) with Zocdoc theming |
| `@zocdoc/api-components` | Booking components that call the Zocdoc API |

## Status

Proof of concept. Not yet published to npm.

## Documentation

- [Zocdoc Public API](https://api-docs.zocdoc.com/guides) — API reference and sandbox access
- [Contributing](CONTRIBUTING.md) — Development setup and guidelines
