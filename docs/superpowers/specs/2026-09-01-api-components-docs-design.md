# API Components Documentation Site

A comprehensive documentation site for external developers integrating the Powered by Zocdoc booking components.

## Overview

**Package:** `packages/docs/`  
**Framework:** Astro Starlight  
**Deployment:** GitHub Pages  
**Audience:** External companies integrating Zocdoc booking into their sites

## Content Structure

### Getting Started

| Page | Purpose |
|------|---------|
| `installation.mdx` | npm install, peer dependencies, bundler setup |
| `quick-start.mdx` | Configure client, render first `<zd-booking>`, handle completion event |
| `authentication.mdx` | `getToken` function patterns, token refresh, error handling |

### Guides

| Page | Purpose |
|------|---------|
| `architecture.mdx` | Props-down/events-up pattern, no shared state, component isolation |
| `composed-vs-single.mdx` | `<zd-booking>` all-in-one vs manual wiring with individual components |
| `testing.mdx` | Mock transport setup, documented test scenarios, ZIP codes for different outcomes |

### Client API

| Page | Purpose |
|------|---------|
| `configuration.mdx` | `configureZocdoc({ baseUrl, getToken })`, when to call, singleton pattern |
| `endpoints.mdx` | `searchProviderLocations()`, `getAvailability()`, `createAppointment()`, reference data functions |
| `errors.mdx` | `ZocdocAuthError`, `ZocdocNotFoundError`, error hierarchy, user-facing messaging |

### Components

One page per component with unified structure:

| Component | Tag | Description |
|-----------|-----|-------------|
| Booking | `<zd-booking>` | Complete booking funnel orchestrator |
| Provider Search | `<zd-provider-search>` | Search criteria collector |
| Provider Results | `<zd-provider-results>` | Provider list with pagination |
| Provider Card | `<zd-provider-card>` | Individual provider display |
| Provider Profile | `<zd-provider-profile>` | Full provider details |
| Provider Summary | `<zd-provider-summary>` | Compact provider info |
| Availability Grid | `<zd-availability-grid>` | Day-count calendar view |
| Availability Picker | `<zd-availability-picker>` | Time slot selection |
| Availability Window | `<zd-availability-window>` | Date range navigation |
| Patient Form | `<zd-patient-form>` | Patient details collection |
| Booking Confirmation | `<zd-booking-confirmation>` | Appointment result display |

## Component Page Template

Each component page follows this structure:

```markdown
# Component Name

Brief description of what the component does.

## Usage

Live preview showing basic usage.

## Examples

### Example 1: Common case
Live preview + explanation

### Example 2: Variant or edge case
Live preview + explanation

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| ... | ... | ... | ... |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| ... | ... | ... |

## Slots

| Slot | Description |
|------|-------------|
| ... | ... |

## Accessibility

- ARIA roles and states
- Keyboard navigation
- Screen reader behavior

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| ... | ... | ... |
```

## Live Preview System

### Remark Plugin

A remark plugin transforms fenced code blocks with the `preview` flag:

````markdown
```html preview
<zd-provider-card
  .provider=${sampleProvider}
  show-photo
></zd-provider-card>
```
````

Transforms into:

```html
<ComponentPreview>
  <div slot="preview"><!-- rendered component --></div>
  <div slot="code"><!-- syntax-highlighted source --></div>
</ComponentPreview>
```

### ComponentPreview.astro

Renders:
1. The live component in an isolated container
2. The source code with syntax highlighting below
3. Optional "expand" toggle for longer examples

### Preview Runtime

- Components bundled via Vite for client-side hydration
- Uses mock transport so previews work without API credentials
- Sample data (providers, timeslots) embedded for realistic rendering
- Scoped styles prevent docs CSS from affecting component rendering

## Package Structure

```
packages/docs/
├── astro.config.mjs           # Starlight config, plugins, sidebar
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts          # Content collection schema
│   │   └── docs/
│   │       ├── index.mdx
│   │       ├── getting-started/
│   │       ├── guides/
│   │       ├── client/
│   │       └── components/
│   ├── components/
│   │   └── ComponentPreview.astro
│   ├── plugins/
│   │   └── remark-component-preview.js
│   ├── styles/
│   │   ├── custom.css         # Starlight overrides
│   │   └── preview.css        # Preview container styles
│   └── data/
│       └── sample-data.ts     # Mock providers, timeslots for previews
```

## Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkComponentPreview from './src/plugins/remark-component-preview.js';

export default defineConfig({
  site: 'https://zocdoc.github.io',
  base: '/powered-by-zocdoc',
  integrations: [
    starlight({
      title: 'Powered by Zocdoc',
      social: {
        github: 'https://github.com/burton-smith-zocdoc/powered-by-zocdoc',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Authentication', slug: 'getting-started/authentication' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Architecture', slug: 'guides/architecture' },
            { label: 'Composed vs Single Element', slug: 'guides/composed-vs-single' },
            { label: 'Testing', slug: 'guides/testing' },
          ],
        },
        {
          label: 'Client API',
          items: [
            { label: 'Configuration', slug: 'client/configuration' },
            { label: 'Endpoints', slug: 'client/endpoints' },
            { label: 'Errors', slug: 'client/errors' },
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
  markdown: {
    remarkPlugins: [remarkComponentPreview],
  },
  vite: {
    resolve: {
      alias: {
        '@powered-by-zocdoc/api-components': '../api-components/src/index.ts',
      },
    },
  },
});
```

## Sidebar Structure

```
Getting Started
  ├── Installation
  ├── Quick Start
  └── Authentication
Guides
  ├── Architecture
  ├── Composed vs Single Element
  └── Testing
Client API
  ├── Configuration
  ├── Endpoints
  └── Errors
Components
  ├── Availability Grid
  ├── Availability Picker
  ├── Availability Window
  ├── Booking
  ├── Booking Confirmation
  ├── Patient Form
  ├── Provider Card
  ├── Provider Profile
  ├── Provider Results
  ├── Provider Search
  └── Provider Summary
```

## Dependencies

```json
{
  "dependencies": {
    "@astrojs/starlight": "^0.41.0",
    "astro": "^5.0.0",
    "shiki": "^1.0.0"
  },
  "devDependencies": {
    "@powered-by-zocdoc/api-components": "workspace:*",
    "@powered-by-zocdoc/primitives": "workspace:*"
  }
}
```

## GitHub Pages Deployment

Extend existing GitHub Pages workflow to include docs build:

1. Build docs: `pnpm --filter docs build`
2. Output to `packages/docs/dist/`
3. Deploy alongside existing demo content

## Success Criteria

- External developer can go from zero to working booking flow using only the docs
- Live previews render correctly with mock data
- All 11 components documented with attributes, events, and examples
- Client configuration and error handling fully explained
- Testing patterns documented with specific ZIP codes and scenarios
