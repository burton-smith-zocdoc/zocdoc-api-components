# API Components Documentation Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive Astro Starlight documentation site for external developers integrating the Powered by Zocdoc booking components.

**Architecture:** New `packages/docs/` package using Astro Starlight. Live previews render actual web components using the mock transport. Content organized into Getting Started, Guides, Client API, and Components sections.

**Tech Stack:** Astro 5.x, Starlight 0.41.x, custom remark plugin for previews, workspace dependency on api-components/primitives

**Spec:** `docs/superpowers/specs/2026-09-01-api-components-docs-design.md`

## Global Constraints

- Node 22+ (matches workspace)
- pnpm workspace protocol for internal deps (`workspace:*`)
- Components must use mock transport — no real API calls in previews
- All component imports via `@powered-by-zocdoc/api-components`
- CSS from `@powered-by-zocdoc/primitives/theme/`

---

### Task 1: Scaffold Docs Package

Create the docs package with Astro Starlight and verify it builds.

**Files:**
- Create: `packages/docs/package.json`
- Create: `packages/docs/astro.config.mjs`
- Create: `packages/docs/tsconfig.json`
- Create: `packages/docs/src/content/config.ts`
- Create: `packages/docs/src/content/docs/index.mdx`
- Create: `packages/docs/src/styles/custom.css`
- Create: `packages/docs/public/favicon.svg`

**Interfaces:**
- Consumes: Nothing (first task)
- Produces: Working `pnpm --filter docs dev` that serves a landing page

- [ ] **Step 1: Create package.json**

```json
{
  "name": "docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/starlight": "^0.41.0",
    "astro": "^5.9.0",
    "sharp": "^0.34.3"
  },
  "devDependencies": {
    "@powered-by-zocdoc/api-components": "workspace:*",
    "@powered-by-zocdoc/primitives": "workspace:*"
  }
}
```

Write to `packages/docs/package.json`.

- [ ] **Step 2: Create astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://burton-smith-zocdoc.github.io',
  base: '/powered-by-zocdoc',
  integrations: [
    starlight({
      title: 'Powered by Zocdoc',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/burton-smith-zocdoc/powered-by-zocdoc',
        },
      ],
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
});
```

Write to `packages/docs/astro.config.mjs`.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Write to `packages/docs/tsconfig.json`.

- [ ] **Step 4: Create content config**

```typescript
import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
};
```

Write to `packages/docs/src/content/config.ts`.

- [ ] **Step 5: Create landing page**

```mdx
---
title: Powered by Zocdoc
description: Web components for the Zocdoc public API
template: splash
hero:
  tagline: Embed booking flows in your application with a single tag
  actions:
    - text: Get Started
      link: /powered-by-zocdoc/getting-started/installation/
      icon: right-arrow
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Quick Setup" icon="rocket">
    One script tag, one component. Start booking in minutes.
  </Card>
  <Card title="Composable" icon="puzzle">
    Use the all-in-one booking flow or wire individual components yourself.
  </Card>
  <Card title="Accessible" icon="heart">
    WCAG 2.2 AA compliant with full keyboard and screen reader support.
  </Card>
  <Card title="Themeable" icon="seti:css">
    Match your brand with CSS custom properties.
  </Card>
</CardGrid>
```

Write to `packages/docs/src/content/docs/index.mdx`.

- [ ] **Step 6: Create custom CSS**

```css
:root {
  --sl-color-accent-low: hsl(212, 70%, 20%);
  --sl-color-accent: hsl(212, 92%, 45%);
  --sl-color-accent-high: hsl(212, 70%, 90%);
}
```

Write to `packages/docs/src/styles/custom.css`.

- [ ] **Step 7: Create favicon**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#2563eb"/>
  <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="white">Z</text>
</svg>
```

Write to `packages/docs/public/favicon.svg`.

- [ ] **Step 8: Install dependencies**

Run: `pnpm install`

- [ ] **Step 9: Verify dev server starts**

Run: `pnpm --filter docs dev`

Expected: Dev server starts, landing page renders at http://localhost:4321/powered-by-zocdoc/

- [ ] **Step 10: Commit**

```bash
git add packages/docs/
git commit -m "feat(docs): scaffold Astro Starlight docs package"
```

---

### Task 2: Create Live Preview System

Build the remark plugin and preview infrastructure so code blocks with `preview` render as working components.

**Files:**
- Create: `packages/docs/src/plugins/remark-component-preview.js`
- Create: `packages/docs/src/components/ComponentPreview.astro`
- Create: `packages/docs/src/components/PreviewRuntime.astro`
- Create: `packages/docs/src/data/sample-data.ts`
- Create: `packages/docs/src/styles/preview.css`
- Modify: `packages/docs/astro.config.mjs` (add remark plugin, custom CSS)

**Interfaces:**
- Consumes: Task 1's working Astro setup
- Produces: `ComponentPreview` component, `remarkComponentPreview` plugin, sample data exports (`sampleProvider`, `sampleTimeslots`, `sampleAppointment`)

- [ ] **Step 1: Create sample data**

```typescript
import type {
  ProviderLocation,
  Timeslot,
  Appointment,
} from '@powered-by-zocdoc/api-components';

export const sampleProvider: ProviderLocation = {
  id: 'pl_sandbox_001',
  provider_id: 'pr_sandbox_001',
  first_name: 'Sarah',
  last_name: 'Chen',
  credentials: 'MD',
  specialty: 'Internal Medicine',
  practice_name: 'Downtown Medical Group',
  address: {
    street_line_1: '123 Main Street',
    street_line_2: 'Suite 400',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
  },
  phone_number: '(555) 123-4567',
  accepts_new_patients: true,
  photo_url: 'https://placehold.co/150x150/e2e8f0/475569?text=SC',
  insurance_accepted: true,
  distance_miles: 0.3,
};

export const sampleTimeslots: Timeslot[] = [
  { start_time: '2026-09-02T09:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T09:30:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T10:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T14:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T14:30:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
];

export const sampleAppointment: Appointment = {
  id: 'apt_sandbox_001',
  status: 'confirmed',
  start_time: '2026-09-02T09:00:00',
  provider_location_id: 'pl_sandbox_001',
  visit_reason_id: 'vr_001',
};
```

Write to `packages/docs/src/data/sample-data.ts`.

- [ ] **Step 2: Create ComponentPreview.astro**

```astro
---
import { Code } from '@astrojs/starlight/components';

interface Props {
  code: string;
  lang?: string;
}

const { code, lang = 'html' } = Astro.props;
---

<div class="component-preview">
  <div class="component-preview__canvas not-content">
    <slot />
  </div>
  <div class="component-preview__code">
    <Code code={code} lang={lang} />
  </div>
</div>
```

Write to `packages/docs/src/components/ComponentPreview.astro`.

- [ ] **Step 3: Create PreviewRuntime.astro**

This component loads the api-components bundle and configures the mock transport. Include once per page that has previews.

```astro
---
/**
 * Loads the component bundle and configures the mock transport.
 * Include this component once on any page with live previews.
 */
---

<script>
  import '@powered-by-zocdoc/primitives/theme/reset.css';
  import '@powered-by-zocdoc/primitives/theme/utilities.css';
  import { configureZocdocMock } from '@powered-by-zocdoc/api-components/mock';
  import '@powered-by-zocdoc/api-components';

  configureZocdocMock();
</script>
```

Write to `packages/docs/src/components/PreviewRuntime.astro`.

- [ ] **Step 4: Create preview CSS**

```css
.component-preview {
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-block: 1.5rem;
}

.component-preview__canvas {
  padding: 1.5rem;
  background: var(--sl-color-gray-7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-preview__code {
  border-top: 1px solid var(--sl-color-gray-5);
}

.component-preview__code pre {
  margin: 0;
  border-radius: 0;
}
```

Write to `packages/docs/src/styles/preview.css`.

- [ ] **Step 5: Create remark plugin**

```javascript
import { visit } from 'unist-util-visit';

/**
 * Remark plugin that transforms fenced code blocks with `preview` meta
 * into ComponentPreview elements with the code rendered inside.
 *
 * Usage in MDX:
 *   ```html preview
 *   <zd-provider-card></zd-provider-card>
 *   ```
 */
export function remarkComponentPreview() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!node.meta?.includes('preview')) return;

      const code = node.value;
      const lang = node.lang || 'html';

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'ComponentPreview',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'code', value: code },
          { type: 'mdxJsxAttribute', name: 'lang', value: lang },
        ],
        children: [
          {
            type: 'html',
            value: code,
          },
        ],
      };
    });
  };
}

export default remarkComponentPreview;
```

Write to `packages/docs/src/plugins/remark-component-preview.js`.

- [ ] **Step 6: Update astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkComponentPreview from './src/plugins/remark-component-preview.js';

export default defineConfig({
  site: 'https://burton-smith-zocdoc.github.io',
  base: '/powered-by-zocdoc',
  integrations: [
    starlight({
      title: 'Powered by Zocdoc',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/burton-smith-zocdoc/powered-by-zocdoc',
        },
      ],
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
      customCss: [
        './src/styles/custom.css',
        './src/styles/preview.css',
      ],
      components: {
        // Auto-import custom components for MDX
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkComponentPreview],
  },
});
```

Write to `packages/docs/astro.config.mjs`.

- [ ] **Step 7: Add unist-util-visit dependency**

Run: `pnpm --filter docs add unist-util-visit`

- [ ] **Step 8: Test preview with a sample page**

Create a test page to verify previews work:

```mdx
---
title: Preview Test
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

## Test Preview

```html preview
<zd-booking modal zip-code="10001"></zd-booking>
```
```

Write to `packages/docs/src/content/docs/preview-test.mdx`.

- [ ] **Step 9: Verify preview renders**

Run: `pnpm --filter docs dev`

Navigate to http://localhost:4321/powered-by-zocdoc/preview-test/

Expected: Page shows a rendered `<zd-booking>` component with code below it.

- [ ] **Step 10: Remove test page and commit**

```bash
rm packages/docs/src/content/docs/preview-test.mdx
git add packages/docs/
git commit -m "feat(docs): add live preview system with remark plugin"
```

---

### Task 3: Create Getting Started Section

Write the three Getting Started pages: Installation, Quick Start, and Authentication.

**Files:**
- Create: `packages/docs/src/content/docs/getting-started/installation.mdx`
- Create: `packages/docs/src/content/docs/getting-started/quick-start.mdx`
- Create: `packages/docs/src/content/docs/getting-started/authentication.mdx`

**Interfaces:**
- Consumes: Task 2's preview system
- Produces: Three navigable pages under Getting Started

- [ ] **Step 1: Create installation.mdx**

```mdx
---
title: Installation
description: Install the Powered by Zocdoc components in your project
---

import { Tabs, TabItem, Code } from '@astrojs/starlight/components';

## Package Installation

Install the components package and its peer dependencies:

<Tabs>
  <TabItem label="npm">
    ```bash
    npm install @powered-by-zocdoc/api-components @powered-by-zocdoc/primitives
    ```
  </TabItem>
  <TabItem label="pnpm">
    ```bash
    pnpm add @powered-by-zocdoc/api-components @powered-by-zocdoc/primitives
    ```
  </TabItem>
  <TabItem label="yarn">
    ```bash
    yarn add @powered-by-zocdoc/api-components @powered-by-zocdoc/primitives
    ```
  </TabItem>
</Tabs>

## Required CSS

Import the theme reset and utilities before using any components:

```javascript
import '@powered-by-zocdoc/primitives/theme/reset.css';
import '@powered-by-zocdoc/primitives/theme/utilities.css';
```

These provide CSS custom properties that all components resolve against. Without them, components will render with missing styles.

## Script Tag Alternative

For pages without a build step, use the IIFE bundle:

```html
<script src="https://unpkg.com/@powered-by-zocdoc/api-components/bundle/iife"></script>
```

This registers all components globally and includes the required CSS.

## TypeScript

The packages include TypeScript definitions. For component types:

```typescript
import type { ProviderLocation, Timeslot, Appointment } from '@powered-by-zocdoc/api-components';
```

## Next Steps

Once installed, [configure the client](/powered-by-zocdoc/getting-started/quick-start/) with your API credentials.
```

Write to `packages/docs/src/content/docs/getting-started/installation.mdx`.

- [ ] **Step 2: Create quick-start.mdx**

```mdx
---
title: Quick Start
description: Get your first booking flow running in minutes
---

import { Steps } from '@astrojs/starlight/components';
import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

This guide walks through rendering a complete booking flow with a single component.

<Steps>

1. **Configure the client**

   Before rendering any component, configure the API client with your credentials:

   ```javascript
   import { configureZocdoc } from '@powered-by-zocdoc/api-components';

   configureZocdoc({
     baseUrl: 'https://api.zocdoc.com',
     getToken: async () => {
       // Return a valid API token
       return await fetchTokenFromYourBackend();
     },
   });
   ```

   The `getToken` function is called before each API request, so you can implement token refresh here.

2. **Add the booking component**

   The `<zd-booking>` component provides the complete booking funnel:

   ```html preview
   <zd-booking
     modal
     show-photos
     zip-code="10001"
     insurance-name="Blue Cross Blue Shield"
   ></zd-booking>
   ```

3. **Handle the completion event**

   Listen for `booking-complete` to know when a patient finishes booking:

   ```javascript
   const booking = document.querySelector('zd-booking');

   booking.addEventListener('booking-complete', (event) => {
     const { appointmentId, startTime, status } = event.detail;
     console.log(`Appointment ${appointmentId} booked for ${startTime}`);
   });
   ```

</Steps>

## What Just Happened?

The `<zd-booking>` component:

1. Showed a search form for specialty, location, and insurance
2. Fetched matching providers from the Zocdoc API
3. Let the patient pick a provider and time slot
4. Collected patient details and submitted the booking
5. Displayed the confirmation

All from a single tag.

## Next Steps

- Learn about [authentication patterns](/powered-by-zocdoc/getting-started/authentication/)
- Understand the [component architecture](/powered-by-zocdoc/guides/architecture/)
- Build a [custom flow with individual components](/powered-by-zocdoc/guides/composed-vs-single/)
```

Write to `packages/docs/src/content/docs/getting-started/quick-start.mdx`.

- [ ] **Step 3: Create authentication.mdx**

```mdx
---
title: Authentication
description: Configure API authentication for production use
---

## Token Setup

The `getToken` option in `configureZocdoc` is a function that returns a valid API token. It's called before each request, which enables several patterns:

### Static Token

For development or server-rendered pages where the token is available at load time:

```javascript
const token = 'your-api-token';

configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken: () => token,
});
```

### Async Token Fetch

For client-side apps that fetch tokens from your backend:

```javascript
configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken: async () => {
    const response = await fetch('/api/zocdoc-token');
    const { token } = await response.json();
    return token;
  },
});
```

### Token Refresh

Because `getToken` is called per-request, you can implement refresh logic:

```javascript
let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch('/api/zocdoc-token');
  const { token, expiresIn } = await response.json();

  cachedToken = token;
  tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // Refresh 1 min early

  return token;
}

configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken,
});
```

## Error Handling

If `getToken` throws or returns `null`, the request fails with `ZocdocAuthError`. Components handle this gracefully and show an error state:

```javascript
configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken: async () => {
    const response = await fetch('/api/zocdoc-token');
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    const { token } = await response.json();
    return token;
  },
});
```

## Security Considerations

- **Never expose your API secret in client-side code.** The `getToken` function should call your backend, which mints tokens using your secret.
- **Use short-lived tokens.** The Zocdoc API supports tokens with configurable expiry. Shorter is better.
- **Rotate tokens on auth errors.** If you receive a `ZocdocAuthError`, clear any cached token and fetch a new one.

## Next Steps

- Learn the [component architecture](/powered-by-zocdoc/guides/architecture/)
- See the [full client configuration options](/powered-by-zocdoc/client/configuration/)
```

Write to `packages/docs/src/content/docs/getting-started/authentication.mdx`.

- [ ] **Step 4: Verify pages render**

Run: `pnpm --filter docs dev`

Navigate to each page:
- http://localhost:4321/powered-by-zocdoc/getting-started/installation/
- http://localhost:4321/powered-by-zocdoc/getting-started/quick-start/
- http://localhost:4321/powered-by-zocdoc/getting-started/authentication/

Expected: All three pages render with correct content and navigation works.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/
git commit -m "docs: add Getting Started section (installation, quick-start, auth)"
```

---

### Task 4: Create Guides Section

Write the three Guides pages: Architecture, Composed vs Single Element, and Testing.

**Files:**
- Create: `packages/docs/src/content/docs/guides/architecture.mdx`
- Create: `packages/docs/src/content/docs/guides/composed-vs-single.mdx`
- Create: `packages/docs/src/content/docs/guides/testing.mdx`

**Interfaces:**
- Consumes: Task 2's preview system
- Produces: Three navigable pages under Guides

- [ ] **Step 1: Create architecture.mdx**

```mdx
---
title: Architecture
description: Understand how Powered by Zocdoc components communicate
---

## Props Down, Events Up

All Powered by Zocdoc components follow a strict unidirectional data flow:

- **Properties flow down** — Parent components pass data to children via attributes and properties
- **Events flow up** — Children emit custom events to notify parents of user actions or state changes

There is no shared state container, no context protocol, and no global store. Each component is self-contained.

## Component Hierarchy

```
┌─────────────────────────────────────────────┐
│  <zd-booking>                               │
│  ┌─────────────────────────────────────────┐│
│  │ <zd-provider-search>                    ││
│  │   ↓ emits: provider-results             ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │ <zd-provider-results>                   ││
│  │   ↓ emits: provider-select              ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │ <zd-availability-picker>                ││
│  │   ↓ emits: slot-select                  ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │ <zd-patient-form>                       ││
│  │   ↓ emits: patient-submit               ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │ <zd-booking-confirmation>               ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

The `<zd-booking>` component listens for events from its children and updates their properties in response. You can replicate this wiring yourself for custom flows.

## Standalone Capability

Every child component works without its parent. You can render `<zd-provider-card>` by itself, pass it a provider object, and it renders correctly. Components never reach upward for context or depend on a specific parent.

This enables:

- **Testing in isolation** — Unit test any component without mounting the full tree
- **Custom compositions** — Mix and match components in layouts we didn't anticipate
- **Progressive enhancement** — Start with `<zd-booking>` and decompose later if needed

## Event Types

Each component exports TypeScript types for its events:

```typescript
import type { ZdProviderSearchEvents, DetailOf } from '@powered-by-zocdoc/api-components';

element.addEventListener('provider-results', (event: DetailOf<ZdProviderSearchEvents['provider-results']>) => {
  const { providers, totalCount } = event.detail;
});
```

## No Global State

The components don't use Redux, MobX, signals, or any state management library. State lives in:

1. **Component properties** — The source of truth for what a component displays
2. **Component internal state** — Managed by Lit's reactive properties
3. **Your application** — If you need cross-component state, manage it yourself and pass it down

This makes components predictable and easy to integrate into any framework.
```

Write to `packages/docs/src/content/docs/guides/architecture.mdx`.

- [ ] **Step 2: Create composed-vs-single.mdx**

```mdx
---
title: Composed vs Single Element
description: Choose between the all-in-one booking flow or manual composition
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

## Two Approaches

You can integrate Powered by Zocdoc in two ways:

1. **Single element** — Use `<zd-booking>` for the complete flow in one tag
2. **Composed** — Wire individual components together for custom layouts and behavior

## Single Element

The `<zd-booking>` component handles the entire booking funnel:

```html preview
<zd-booking
  modal
  show-photos
  zip-code="10001"
></zd-booking>
```

**Pros:**
- Zero wiring required
- Handles all state transitions
- One event to handle (`booking-complete`)

**Cons:**
- Fixed layout and flow
- Limited customization points
- All-or-nothing

**Best for:** Quick integrations, standard booking flows, proof of concepts.

## Composed Flow

For custom layouts, wire the components yourself:

```html
<zd-provider-search
  id="search"
  zip-code="10001"
></zd-provider-search>

<zd-provider-results
  id="results"
></zd-provider-results>

<zd-availability-picker
  id="picker"
  style="display: none;"
></zd-availability-picker>

<zd-patient-form
  id="form"
  style="display: none;"
></zd-patient-form>

<zd-booking-confirmation
  id="confirmation"
  style="display: none;"
></zd-booking-confirmation>
```

Then handle the events:

```javascript
const search = document.getElementById('search');
const results = document.getElementById('results');
const picker = document.getElementById('picker');
const form = document.getElementById('form');
const confirmation = document.getElementById('confirmation');

// Search emits results
search.addEventListener('provider-results', (e) => {
  results.providers = e.detail.providers;
  results.totalCount = e.detail.totalCount;
});

// Results emit provider selection
results.addEventListener('provider-select', (e) => {
  picker.providerLocationId = e.detail.providerLocationId;
  picker.visitReasonId = e.detail.visitReasonId;
  picker.style.display = 'block';
});

// Picker emits slot selection
picker.addEventListener('slot-select', (e) => {
  form.slot = e.detail;
  form.style.display = 'block';
});

// Form emits patient data
form.addEventListener('patient-submit', async (e) => {
  const { createAppointment } = await import('@powered-by-zocdoc/api-components');
  const appointment = await createAppointment({
    slot: form.slot,
    patient: e.detail,
  });
  confirmation.appointment = appointment;
  confirmation.style.display = 'block';
});
```

**Pros:**
- Full control over layout
- Custom step order and logic
- Insert your own UI between steps

**Cons:**
- More code to write and maintain
- You handle error states
- You manage visibility and transitions

**Best for:** Custom designs, multi-step wizards, embedded in existing flows.

## Hybrid Approach

You can also use `<zd-booking>` and intercept events to inject custom behavior:

```javascript
const booking = document.querySelector('zd-booking');

booking.addEventListener('provider-select', (e) => {
  // Log analytics, show a custom modal, etc.
  trackEvent('provider_selected', { providerId: e.detail.providerLocationId });
});
```

The event still bubbles to `<zd-booking>`, which continues the flow. You're just observing.
```

Write to `packages/docs/src/content/docs/guides/composed-vs-single.mdx`.

- [ ] **Step 3: Create testing.mdx**

```mdx
---
title: Testing
description: Test your integration with mock data and documented scenarios
---

## Mock Transport

For testing without real API calls, use the mock transport:

```javascript
import { configureZocdocMock } from '@powered-by-zocdoc/api-components/mock';

configureZocdocMock();
```

This replaces the HTTP client with one that returns fixture data. Components work identically — they just receive recorded responses instead of live data.

## Test Scenarios

The mock transport responds to specific ZIP codes with different scenarios:

| ZIP Code | Scenario |
|----------|----------|
| `10001` | Returns providers with availability |
| `10002` | Returns providers with no availability |
| `10003` | Returns no providers (empty results) |
| `10004` | Returns an error response |
| `99999` | Simulates network timeout |

Use these in your tests to verify your integration handles each case:

```javascript
import { configureZocdocMock } from '@powered-by-zocdoc/api-components/mock';

describe('booking flow', () => {
  beforeEach(() => {
    configureZocdocMock();
  });

  it('shows providers for valid ZIP', async () => {
    const el = document.createElement('zd-provider-search');
    el.zipCode = '10001';
    document.body.appendChild(el);

    // Trigger search and verify results appear
  });

  it('shows empty state for no results', async () => {
    const el = document.createElement('zd-provider-search');
    el.zipCode = '10003';
    document.body.appendChild(el);

    // Verify empty state renders
  });
});
```

## Test Patient Data

When testing patient form submission, use data from the [Zocdoc Testing Guide](https://api-docs.zocdoc.com/guides/testing-data):

| Field | Test Value |
|-------|------------|
| First Name | `Test` |
| Last Name | `Patient` |
| Date of Birth | `1990-01-15` |
| Phone | `(555) 000-0000` |
| Email | `test@example.com` |

Never use real-looking names, phone numbers, or addresses in tests.

## Component Testing

Each component can be tested in isolation:

```javascript
import '@powered-by-zocdoc/api-components';

it('renders provider card', () => {
  const card = document.createElement('zd-provider-card');
  card.provider = {
    id: 'test_001',
    first_name: 'Test',
    last_name: 'Provider',
    specialty: 'Internal Medicine',
    // ... other required fields
  };

  document.body.appendChild(card);

  expect(card.shadowRoot.textContent).toContain('Test Provider');
});
```

## Integration Testing

For end-to-end testing with Playwright or Cypress:

```javascript
// playwright.spec.ts
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  await page.goto('/booking');

  // Fill search form
  await page.fill('zd-provider-search input[name="zipCode"]', '10001');
  await page.click('zd-provider-search button[type="submit"]');

  // Select a provider
  await page.click('zd-provider-card:first-child');

  // Select a time slot
  await page.click('zd-availability-picker button:first-child');

  // Fill patient form
  await page.fill('zd-patient-form input[name="firstName"]', 'Test');
  // ... fill remaining fields

  await page.click('zd-patient-form button[type="submit"]');

  // Verify confirmation
  await expect(page.locator('zd-booking-confirmation')).toBeVisible();
});
```

## Accessibility Testing

All components pass axe-core. Include accessibility checks in your tests:

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const el = document.createElement('zd-provider-card');
  el.provider = sampleProvider;
  document.body.appendChild(el);

  const results = await axe(el);
  expect(results).toHaveNoViolations();
});
```
```

Write to `packages/docs/src/content/docs/guides/testing.mdx`.

- [ ] **Step 4: Verify pages render**

Run: `pnpm --filter docs dev`

Navigate to each page:
- http://localhost:4321/powered-by-zocdoc/guides/architecture/
- http://localhost:4321/powered-by-zocdoc/guides/composed-vs-single/
- http://localhost:4321/powered-by-zocdoc/guides/testing/

Expected: All three pages render with correct content.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/content/docs/guides/
git commit -m "docs: add Guides section (architecture, composed-vs-single, testing)"
```

---

### Task 5: Create Client API Section

Write the three Client API pages: Configuration, Endpoints, and Errors.

**Files:**
- Create: `packages/docs/src/content/docs/client/configuration.mdx`
- Create: `packages/docs/src/content/docs/client/endpoints.mdx`
- Create: `packages/docs/src/content/docs/client/errors.mdx`

**Interfaces:**
- Consumes: Task 2's preview system
- Produces: Three navigable pages under Client API

- [ ] **Step 1: Create configuration.mdx**

```mdx
---
title: Configuration
description: Configure the Zocdoc API client
---

## configureZocdoc

Call `configureZocdoc` once before rendering any components:

```javascript
import { configureZocdoc } from '@powered-by-zocdoc/api-components';

configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken: () => fetchTokenFromBackend(),
});
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `baseUrl` | `string` | Yes | The Zocdoc API base URL |
| `getToken` | `() => string \| Promise<string>` | Yes | Function that returns a valid API token |

### baseUrl

The base URL for API requests. Use the production URL for live traffic:

```javascript
baseUrl: 'https://api.zocdoc.com'
```

Or the sandbox for testing:

```javascript
baseUrl: 'https://api-developer-sandbox.zocdoc.com'
```

### getToken

A function called before each API request. It can be synchronous or async:

```javascript
// Sync
getToken: () => localStorage.getItem('zocdoc_token')

// Async
getToken: async () => {
  const res = await fetch('/api/token');
  const { token } = await res.json();
  return token;
}
```

See [Authentication](/powered-by-zocdoc/getting-started/authentication/) for patterns including token refresh.

## Singleton Behavior

`configureZocdoc` sets global configuration. Calling it again replaces the previous config:

```javascript
configureZocdoc({ baseUrl: 'https://api.zocdoc.com', getToken: () => token1 });

// Later...
configureZocdoc({ baseUrl: 'https://sandbox.zocdoc.com', getToken: () => token2 });
// All subsequent requests use token2 and sandbox URL
```

## Mock Transport

For testing, use `configureZocdocMock` instead:

```javascript
import { configureZocdocMock } from '@powered-by-zocdoc/api-components/mock';

configureZocdocMock();
```

This configures the client to return fixture data without making network requests. See [Testing](/powered-by-zocdoc/guides/testing/) for details.

## Timing

Configure the client before any component renders. A common pattern:

```javascript
// config.js
import { configureZocdoc } from '@powered-by-zocdoc/api-components';

export function initZocdoc() {
  configureZocdoc({
    baseUrl: import.meta.env.VITE_ZOCDOC_URL,
    getToken: () => getStoredToken(),
  });
}
```

```javascript
// main.js
import { initZocdoc } from './config.js';
import '@powered-by-zocdoc/api-components';

initZocdoc();
// Now safe to render components
```
```

Write to `packages/docs/src/content/docs/client/configuration.mdx`.

- [ ] **Step 2: Create endpoints.mdx**

```mdx
---
title: Endpoints
description: API endpoint functions for direct data access
---

The client layer exposes typed functions for each API endpoint. Use these when building custom flows or fetching data outside components.

## Provider Search

### searchProviderLocations

Search for providers by location, specialty, and insurance:

```typescript
import { searchProviderLocations } from '@powered-by-zocdoc/api-components';

const results = await searchProviderLocations({
  zipCode: '10001',
  specialtyId: 'sp_internal_medicine',
  insurancePlanId: 'ip_blue_cross_ppo',
  page: 1,
  pageSize: 10,
});

// results.providers: ProviderLocation[]
// results.totalCount: number
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `zipCode` | `string` | Yes | 5-digit ZIP code |
| `specialtyId` | `string` | No | Filter by specialty |
| `insurancePlanId` | `string` | No | Filter by insurance |
| `page` | `number` | No | Page number (default: 1) |
| `pageSize` | `number` | No | Results per page (default: 10) |

## Availability

### getAvailability

Fetch available time slots for a provider:

```typescript
import { getAvailability } from '@powered-by-zocdoc/api-components';

const timeslots = await getAvailability({
  providerLocationId: 'pl_001',
  visitReasonId: 'vr_new_patient',
  startDate: '2026-09-01',
  endDate: '2026-09-07',
});

// timeslots: Timeslot[]
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `providerLocationId` | `string` | Yes | Provider location ID |
| `visitReasonId` | `string` | Yes | Visit reason ID |
| `startDate` | `string` | Yes | Start of date range (YYYY-MM-DD) |
| `endDate` | `string` | Yes | End of date range (YYYY-MM-DD) |

## Appointments

### createAppointment

Book an appointment:

```typescript
import { createAppointment } from '@powered-by-zocdoc/api-components';

const appointment = await createAppointment({
  providerLocationId: 'pl_001',
  visitReasonId: 'vr_new_patient',
  startTime: '2026-09-02T09:00:00',
  patient: {
    firstName: 'Test',
    lastName: 'Patient',
    dateOfBirth: '1990-01-15',
    sexAtBirth: 'female',
    phoneNumber: '5550000000',
    emailAddress: 'test@example.com',
    address: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  },
});

// appointment.id: string
// appointment.status: 'confirmed' | 'pending_booking'
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `providerLocationId` | `string` | Yes | Provider location ID |
| `visitReasonId` | `string` | Yes | Visit reason ID |
| `startTime` | `string` | Yes | Slot start time (ISO 8601) |
| `patient` | `PatientData` | Yes | Patient details |

## Reference Data

### getSpecialties

Fetch available specialties:

```typescript
import { getSpecialties } from '@powered-by-zocdoc/api-components';

const specialties = await getSpecialties();
// [{ id: 'sp_001', name: 'Internal Medicine' }, ...]
```

### getInsurancePlans

Fetch insurance plans, optionally filtered:

```typescript
import { getInsurancePlans } from '@powered-by-zocdoc/api-components';

const plans = await getInsurancePlans({ carrierName: 'Blue Cross' });
// [{ id: 'ip_001', name: 'Blue Cross PPO', carrier: 'Blue Cross' }, ...]
```

### getVisitReasons

Fetch visit reasons for a specialty:

```typescript
import { getVisitReasons } from '@powered-by-zocdoc/api-components';

const reasons = await getVisitReasons({ specialtyId: 'sp_internal_medicine' });
// [{ id: 'vr_001', name: 'New Patient Visit' }, ...]
```

## Caching

Reference data (specialties, insurance plans, visit reasons) is cached in memory. The first call fetches from the API; subsequent calls return the cached data.

```typescript
// First call: network request
const specialties1 = await getSpecialties();

// Second call: returns cached data
const specialties2 = await getSpecialties();
```

The cache persists for the page lifetime. To force a refresh, reload the page.
```

Write to `packages/docs/src/content/docs/client/endpoints.mdx`.

- [ ] **Step 3: Create errors.mdx**

```mdx
---
title: Errors
description: Handle API errors gracefully
---

## Error Hierarchy

The client throws typed errors you can catch and handle:

```typescript
import {
  ZocdocError,
  ZocdocAuthError,
  ZocdocNotFoundError,
  ZocdocNetworkError,
} from '@powered-by-zocdoc/api-components';
```

### ZocdocError

Base class for all client errors. All errors extend this.

```typescript
try {
  await searchProviderLocations({ zipCode: '10001' });
} catch (error) {
  if (error instanceof ZocdocError) {
    console.error('API error:', error.message);
  }
}
```

### ZocdocAuthError

Thrown when authentication fails (401 response or `getToken` failure):

```typescript
try {
  await searchProviderLocations({ zipCode: '10001' });
} catch (error) {
  if (error instanceof ZocdocAuthError) {
    // Redirect to login, refresh token, etc.
    await refreshToken();
    // Retry the request
  }
}
```

### ZocdocNotFoundError

Thrown when a resource doesn't exist (404 response):

```typescript
try {
  await getAvailability({ providerLocationId: 'invalid_id', ... });
} catch (error) {
  if (error instanceof ZocdocNotFoundError) {
    // Show "provider not found" message
  }
}
```

### ZocdocNetworkError

Thrown when the request fails due to network issues:

```typescript
try {
  await searchProviderLocations({ zipCode: '10001' });
} catch (error) {
  if (error instanceof ZocdocNetworkError) {
    // Show "check your connection" message
  }
}
```

## Component Error Handling

Components handle errors internally and emit error events:

```javascript
const search = document.querySelector('zd-provider-search');

search.addEventListener('provider-search-error', (event) => {
  const { error, message } = event.detail;

  if (error instanceof ZocdocAuthError) {
    showLoginPrompt();
  } else {
    showErrorBanner(message);
  }
});
```

The `message` in the event detail is a user-friendly string. The `error` is the original error object for programmatic handling.

## User-Facing Messages

Never show raw API error messages to users. The error classes provide `message` properties, but these are for developers:

```typescript
// Don't do this
alert(error.message); // "Request failed with status 401"

// Do this
if (error instanceof ZocdocAuthError) {
  alert('Please sign in to continue');
}
```

Components display appropriate user-facing messages in their error states. If you're handling errors manually, provide your own copy.

## Retry Logic

For transient errors, implement retry with backoff:

```typescript
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ZocdocNetworkError && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

const results = await fetchWithRetry(() =>
  searchProviderLocations({ zipCode: '10001' })
);
```

Don't retry authentication errors — they require user action.
```

Write to `packages/docs/src/content/docs/client/errors.mdx`.

- [ ] **Step 4: Verify pages render**

Run: `pnpm --filter docs dev`

Navigate to each page:
- http://localhost:4321/powered-by-zocdoc/client/configuration/
- http://localhost:4321/powered-by-zocdoc/client/endpoints/
- http://localhost:4321/powered-by-zocdoc/client/errors/

Expected: All three pages render with correct content.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/content/docs/client/
git commit -m "docs: add Client API section (configuration, endpoints, errors)"
```

---

### Task 6: Create Component Documentation Pages

Write documentation for all 11 components following the unified template.

**Files:**
- Create: `packages/docs/src/content/docs/components/booking.mdx`
- Create: `packages/docs/src/content/docs/components/provider-search.mdx`
- Create: `packages/docs/src/content/docs/components/provider-results.mdx`
- Create: `packages/docs/src/content/docs/components/provider-card.mdx`
- Create: `packages/docs/src/content/docs/components/provider-profile.mdx`
- Create: `packages/docs/src/content/docs/components/provider-summary.mdx`
- Create: `packages/docs/src/content/docs/components/availability-grid.mdx`
- Create: `packages/docs/src/content/docs/components/availability-picker.mdx`
- Create: `packages/docs/src/content/docs/components/availability-window.mdx`
- Create: `packages/docs/src/content/docs/components/patient-form.mdx`
- Create: `packages/docs/src/content/docs/components/booking-confirmation.mdx`

**Interfaces:**
- Consumes: Task 2's preview system, sample data
- Produces: 11 navigable component documentation pages

- [ ] **Step 1: Create booking.mdx**

```mdx
---
title: Booking
description: Complete booking funnel in a single component
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-booking>` component orchestrates the entire booking flow: provider search, availability selection, patient form, and confirmation.

## Usage

```html preview
<zd-booking
  modal
  show-photos
  zip-code="10001"
  insurance-name="Blue Cross Blue Shield"
></zd-booking>
```

## Examples

### Inline Mode

Render the booking flow inline rather than in a modal:

```html preview
<zd-booking
  show-photos
  zip-code="10001"
></zd-booking>
```

### Pre-filled Search

Skip the search step by providing a provider directly:

```html
<zd-booking
  modal
  provider-location-id="pl_001"
  visit-reason-id="vr_new_patient"
></zd-booking>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `modal` | `boolean` | `false` | Show in a modal dialog |
| `show-photos` | `boolean` | `false` | Display provider photos |
| `zip-code` | `string` | — | Pre-fill ZIP code in search |
| `insurance-name` | `string` | — | Pre-fill insurance in search |
| `provider-location-id` | `string` | — | Skip search, start with this provider |
| `visit-reason-id` | `string` | — | Pre-select visit reason |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `booking-complete` | `{ appointmentId, startTime, status }` | Booking succeeded |
| `booking-error` | `{ error, message }` | Booking failed |
| `step-change` | `{ step: 'search' \| 'time' \| 'patient' \| 'booked' }` | Flow step changed |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Content shown before the booking flow starts |

## Accessibility

- Modal traps focus and returns it on close
- Each step has a heading for screen readers
- Error states use `role="alert"`
- All form fields have visible labels

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-booking-max-width` | `600px` | Maximum width in inline mode |
| `--zd-booking-modal-width` | `90vw` | Modal width |
```

Write to `packages/docs/src/content/docs/components/booking.mdx`.

- [ ] **Step 2: Create provider-search.mdx**

```mdx
---
title: Provider Search
description: Search form for finding providers
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-provider-search>` component collects search criteria and fetches matching providers from the API.

## Usage

```html preview
<zd-provider-search
  zip-code="10001"
></zd-provider-search>
```

## Examples

### Pre-filled Insurance

```html preview
<zd-provider-search
  zip-code="10001"
  insurance-name="Aetna"
></zd-provider-search>
```

### With Specialty

```html
<zd-provider-search
  zip-code="10001"
  specialty-id="sp_dermatology"
></zd-provider-search>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `zip-code` | `string` | — | Pre-fill ZIP code |
| `specialty-id` | `string` | — | Pre-select specialty |
| `insurance-plan-id` | `string` | — | Pre-select insurance plan |
| `insurance-name` | `string` | — | Display name for insurance |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `provider-results` | `{ providers, totalCount, page }` | Search returned results |
| `provider-search-error` | `{ error, message }` | Search failed |

## Accessibility

- Form fields have visible labels
- Error messages linked via `aria-describedby`
- Submit button disabled during loading with `aria-busy`

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-search-gap` | `1rem` | Spacing between form fields |
```

Write to `packages/docs/src/content/docs/components/provider-search.mdx`.

- [ ] **Step 3: Create provider-results.mdx**

```mdx
---
title: Provider Results
description: Display a list of provider search results
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';
import { sampleProvider } from '@/data/sample-data';

<PreviewRuntime />

The `<zd-provider-results>` component renders a paginated list of providers with optional availability previews.

## Usage

Pass an array of providers to display:

```html
<zd-provider-results
  .providers=${providers}
  .totalCount=${42}
  show-photos
></zd-provider-results>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `providers` | `ProviderLocation[]` | `[]` | Array of providers to display |
| `availability` | `Map<string, number>` | — | Provider ID → appointment count |
| `total-count` | `number` | `0` | Total results for pagination |
| `page` | `number` | `1` | Current page number |
| `show-photos` | `boolean` | `false` | Display provider photos |
| `insurance-name` | `string` | — | Insurance to show on cards |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `provider-select` | `{ providerLocationId, visitReasonId }` | Provider card clicked |
| `day-select` | `{ providerLocationId, date }` | Day selected on availability grid |
| `page-change` | `{ page }` | Pagination changed |
| `window-change` | `{ startDate, endDate }` | Availability window shifted |

## Accessibility

- Results announced via `aria-live` region
- Each card is focusable and activates on Enter/Space
- Pagination controls labeled for screen readers

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-results-gap` | `1rem` | Spacing between cards |
| `--zd-results-columns` | `1` | Number of columns |
```

Write to `packages/docs/src/content/docs/components/provider-results.mdx`.

- [ ] **Step 4: Create provider-card.mdx**

```mdx
---
title: Provider Card
description: Individual provider display card
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-provider-card>` component displays a single provider with photo, name, specialty, location, and insurance status.

## Usage

```html
<zd-provider-card
  .provider=${provider}
  show-photo
  insurance-name="Blue Cross"
></zd-provider-card>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | `ProviderLocation` | — | Provider data to display |
| `show-photo` | `boolean` | `false` | Display provider photo |
| `insurance-name` | `string` | — | Insurance to check against |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `profile-request` | `{ providerLocationId }` | User wants full profile |

## Slots

| Slot | Description |
|------|-------------|
| `availability` | Availability grid or picker |
| `badges` | Custom badges below name |

## Accessibility

- Entire card is a single focusable element
- Activates on Enter or Space
- Insurance status announced as part of card content

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-card-padding` | `1rem` | Internal padding |
| `--zd-card-radius` | `0.5rem` | Border radius |
| `--zd-card-photo-size` | `80px` | Photo dimensions |
```

Write to `packages/docs/src/content/docs/components/provider-card.mdx`.

- [ ] **Step 5: Create provider-profile.mdx**

```mdx
---
title: Provider Profile
description: Full provider profile page
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-provider-profile>` component displays complete provider details including about section, education, and contact information.

## Usage

```html
<zd-provider-profile
  .provider=${provider}
  show-photo
></zd-provider-profile>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | `ProviderLocation` | — | Provider data to display |
| `show-photo` | `boolean` | `false` | Display provider photo |
| `insurance-name` | `string` | — | Insurance to highlight |

## Slots

| Slot | Description |
|------|-------------|
| `highlights` | Key facts or badges |
| `reviews` | Patient reviews section |
| `faqs` | Frequently asked questions |
| `actions` | Call-to-action buttons |

## Accessibility

- Sections use semantic headings (h2, h3)
- Contact info linked appropriately (tel:, mailto:)
- Missing sections are omitted, not empty

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-profile-max-width` | `800px` | Maximum content width |
| `--zd-profile-photo-size` | `150px` | Photo dimensions |
```

Write to `packages/docs/src/content/docs/components/provider-profile.mdx`.

- [ ] **Step 6: Create provider-summary.mdx**

```mdx
---
title: Provider Summary
description: Compact provider information display
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-provider-summary>` component shows a compact view of provider information, used within cards and booking flows.

## Usage

```html
<zd-provider-summary
  .provider=${provider}
  show-photo
></zd-provider-summary>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | `ProviderLocation` | — | Provider data to display |
| `show-photo` | `boolean` | `false` | Display provider photo |
| `insurance-name` | `string` | — | Insurance to check |

## Accessibility

- Provider name is the primary heading
- Credentials and specialty follow in reading order
- Insurance status clearly stated

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-summary-photo-size` | `48px` | Photo dimensions |
| `--zd-summary-gap` | `0.5rem` | Spacing between elements |
```

Write to `packages/docs/src/content/docs/components/provider-summary.mdx`.

- [ ] **Step 7: Create availability-grid.mdx**

```mdx
---
title: Availability Grid
description: Calendar view showing appointment counts per day
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-availability-grid>` component displays a day-by-day view of available appointments.

## Usage

### Self-Fetching Mode

Provide IDs and the component fetches availability:

```html
<zd-availability-grid
  provider-location-id="pl_001"
  visit-reason-id="vr_new_patient"
  availability-days="7"
></zd-availability-grid>
```

### Batched Data Mode

Pass pre-fetched timeslots:

```html
<zd-availability-grid
  .timeslots=${timeslots}
></zd-availability-grid>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider-location-id` | `string` | — | Provider to fetch availability for |
| `visit-reason-id` | `string` | — | Visit reason for availability |
| `timeslots` | `Timeslot[]` | — | Pre-fetched timeslots |
| `start-date` | `string` | today | Start of date range |
| `availability-days` | `number` | `7` | Days to show |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `day-select` | `{ date }` | Day clicked |
| `window-change` | `{ startDate, endDate }` | Date range shifted |
| `more-select` | `{ providerLocationId }` | "More times" clicked |
| `availability-error` | `{ error, message }` | Fetch failed |

## Accessibility

- Days are buttons with date labels
- Available count announced per day
- Arrow keys navigate between days

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-grid-day-size` | `48px` | Day cell dimensions |
| `--zd-grid-gap` | `0.25rem` | Spacing between days |
```

Write to `packages/docs/src/content/docs/components/availability-grid.mdx`.

- [ ] **Step 8: Create availability-picker.mdx**

```mdx
---
title: Availability Picker
description: Time slot selection for booking
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-availability-picker>` component lets patients select a specific appointment time.

## Usage

```html
<zd-availability-picker
  provider-location-id="pl_001"
  visit-reason-id="vr_new_patient"
></zd-availability-picker>
```

## Examples

### Strip Layout

Horizontal day tabs with times below:

```html
<zd-availability-picker
  provider-location-id="pl_001"
  visit-reason-id="vr_new_patient"
  layout="strip"
></zd-availability-picker>
```

### Stacked Layout

All days shown vertically:

```html
<zd-availability-picker
  provider-location-id="pl_001"
  visit-reason-id="vr_new_patient"
  layout="stacked"
></zd-availability-picker>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider-location-id` | `string` | — | Provider to show availability for |
| `visit-reason-id` | `string` | — | Visit reason filter |
| `layout` | `'strip' \| 'stacked'` | `'strip'` | Layout mode |
| `timeslots` | `Timeslot[]` | — | Pre-fetched slots (optional) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `slot-select` | `{ startTime, providerLocationId, visitReasonId }` | Slot clicked |
| `patient-type-change` | `{ patientType: 'new' \| 'returning' }` | Patient type toggled |
| `availability-error` | `{ error, message }` | Fetch failed |

## Accessibility

- Slots are buttons with full datetime labels
- Selected slot announced
- Day tabs use `role="tablist"` pattern

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-picker-slot-height` | `40px` | Slot button height |
| `--zd-picker-columns` | `4` | Slots per row |
```

Write to `packages/docs/src/content/docs/components/availability-picker.mdx`.

- [ ] **Step 9: Create availability-window.mdx**

```mdx
---
title: Availability Window
description: Date range navigation control
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-availability-window>` component provides previous/next navigation for availability date ranges.

## Usage

```html
<zd-availability-window
  start-date="2026-09-01"
  end-date="2026-09-07"
></zd-availability-window>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `start-date` | `string` | — | Start of current range |
| `end-date` | `string` | — | End of current range |
| `can-go-earlier` | `boolean` | `false` | Enable previous button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `window-shift` | `{ direction: 'earlier' \| 'later' }` | Navigation clicked |

## Accessibility

- Buttons labeled "Earlier dates" and "Later dates"
- Disabled state properly announced
- Current range visible as text

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-window-button-size` | `32px` | Navigation button size |
```

Write to `packages/docs/src/content/docs/components/availability-window.mdx`.

- [ ] **Step 10: Create patient-form.mdx**

```mdx
---
title: Patient Form
description: Collect patient details for booking
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-patient-form>` component collects required patient information for booking an appointment.

## Usage

```html preview
<zd-patient-form></zd-patient-form>
```

## Fields

The form collects:

- First name
- Last name
- Date of birth
- Sex at birth
- Phone number
- Email address
- Address (street, city, state, ZIP)
- Notes (optional)

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `patient-submit` | `PatientData` | Form submitted with valid data |

The event detail contains all patient fields. **This is PHI** — only send it to your configured Zocdoc `baseUrl`.

## Accessibility

- All fields have visible labels
- Required fields marked with asterisk and `aria-required`
- Validation errors linked via `aria-describedby`
- Related fields grouped in fieldsets (e.g., address)

## Validation

Client-side validation runs on submit:

- Required fields must be filled
- Email must be valid format
- Phone must be 10 digits
- Date of birth must be valid and in the past

Server-side validation may return additional errors, displayed inline.

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-form-gap` | `1rem` | Spacing between fields |
| `--zd-form-label-size` | `0.875rem` | Label font size |
```

Write to `packages/docs/src/content/docs/components/patient-form.mdx`.

- [ ] **Step 11: Create booking-confirmation.mdx**

```mdx
---
title: Booking Confirmation
description: Display appointment confirmation
---

import PreviewRuntime from '@/components/PreviewRuntime.astro';
import ComponentPreview from '@/components/ComponentPreview.astro';

<PreviewRuntime />

The `<zd-booking-confirmation>` component displays the result of a booking request.

## Usage

```html
<zd-booking-confirmation
  appointment-id="apt_001"
  start-time="2026-09-02T09:00:00"
  status="confirmed"
  provider-name="Dr. Sarah Chen"
></zd-booking-confirmation>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `appointment-id` | `string` | — | Booking ID |
| `start-time` | `string` | — | Appointment time (ISO 8601) |
| `status` | `'confirmed' \| 'pending_booking'` | — | Booking status |
| `provider-name` | `string` | — | Provider display name |

## Status States

### Confirmed

Appointment is booked. Shows success message with appointment details.

### Pending Booking

Appointment requires provider confirmation. Shows pending message with expected timeline.

## Accessibility

- Status announced with appropriate tone (success/info)
- Appointment details in readable order
- Add-to-calendar links properly labeled

## Styling

| CSS Property | Default | Description |
|--------------|---------|-------------|
| `--zd-confirmation-icon-size` | `48px` | Status icon size |
| `--zd-confirmation-max-width` | `500px` | Content width |
```

Write to `packages/docs/src/content/docs/components/booking-confirmation.mdx`.

- [ ] **Step 12: Verify all component pages render**

Run: `pnpm --filter docs dev`

Navigate to the Components section and verify each page:
- http://localhost:4321/powered-by-zocdoc/components/booking/
- http://localhost:4321/powered-by-zocdoc/components/provider-search/
- (check all 11 pages)

Expected: All pages render with content and previews work.

- [ ] **Step 13: Commit**

```bash
git add packages/docs/src/content/docs/components/
git commit -m "docs: add all 11 component documentation pages"
```

---

### Task 7: GitHub Pages Deployment

Extend the existing GitHub Pages workflow to build and deploy the docs site.

**Files:**
- Modify: `.github/workflows/pages.yml` (or create if needed)
- Modify: `packages/docs/package.json` (add preview script)

**Interfaces:**
- Consumes: All previous tasks' content
- Produces: Docs deployed to GitHub Pages

- [ ] **Step 1: Check existing workflow**

Run: `ls -la .github/workflows/`

Check for existing Pages workflow.

- [ ] **Step 2: Create or update GitHub Pages workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm run build

      - run: pnpm --filter docs build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/docs/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

Write to `.github/workflows/pages.yml`.

- [ ] **Step 3: Test local build**

Run: `pnpm --filter docs build`

Expected: Build succeeds and outputs to `packages/docs/dist/`.

- [ ] **Step 4: Verify build output**

Run: `ls packages/docs/dist/`

Expected: See `index.html` and other static files.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pages.yml packages/docs/
git commit -m "ci: add GitHub Pages deployment for docs"
```

---

## Summary

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1 | Scaffold docs package | Working `pnpm --filter docs dev` |
| 2 | Create preview system | Live component previews |
| 3 | Getting Started pages | 3 pages: install, quick-start, auth |
| 4 | Guides pages | 3 pages: architecture, composed, testing |
| 5 | Client API pages | 3 pages: config, endpoints, errors |
| 6 | Component pages | 11 component documentation pages |
| 7 | GitHub Pages deployment | CI workflow for publishing |

Total: 7 tasks, ~20 content pages, full documentation site.
