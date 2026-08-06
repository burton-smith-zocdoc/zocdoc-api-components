# Provider Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable `zd-provider-card` component with horizontal layout, clickable name, and slots for availability/badges.

**Architecture:** New component in `components/provider-card/` using ZdCard, ZdAvatar, and ZdButton primitives. Emits `profile-request` event on name click. Integrates into `provider-results` which manages the profile dialog.

**Tech Stack:** Lit, TypeScript, Vitest (browser mode), Charm UX primitives

## Global Constraints

- Extend `CharmElement`, not `LitElement` directly (PBZD-002)
- Write `<scoped-*>` in templates, list in `dependencies()` (PBZD-003)
- Register via `project.scope.registerComponent()` (PBZD-004)
- Test with axe-core, no violations (A11Y-005)
- Use test data from documented scenarios (TEST-003)
- No PHI in logs or error messages (PHI-001)

## File Structure

```
packages/api-components/src/components/provider-card/
├── index.ts                    # Registration and exports
├── provider-card.ts            # Component class
├── provider-card.styles.ts     # CSS styles
├── provider-card.test.ts       # Unit tests
└── provider-card.stories.ts    # Storybook stories
```

**Modifications:**
- `packages/api-components/src/index.ts` — export new component
- `packages/api-components/src/components/provider-results/provider-results.ts` — use card, add dialog
- `packages/api-components/src/components/provider-results/provider-results.test.ts` — update tests

---

### Task 1: Create provider-card component scaffold

**Files:**
- Create: `packages/api-components/src/components/provider-card/provider-card.ts`
- Create: `packages/api-components/src/components/provider-card/provider-card.styles.ts`
- Create: `packages/api-components/src/components/provider-card/index.ts`
- Create: `packages/api-components/src/components/provider-card/provider-card.test.ts`
- Modify: `packages/api-components/src/index.ts`

**Interfaces:**
- Consumes: `ProviderLocation` from `../../client/types.js`
- Produces: `ZdProviderCard` class, `ZdProviderCardEventMap` type

- [ ] **Step 1: Create styles file**

```typescript
// provider-card.styles.ts
import { css } from 'lit';

export default css`
  .provider-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--zd-spacing-md, 1rem);
    align-items: start;
  }

  [part='details'] {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-xs, 0.25rem);
  }

  [part='name'] {
    font-weight: var(--zd-font-weight-semibold, 600);
  }

  [part='specialty'],
  [part='location'],
  [part='insurance'] {
    color: var(--zd-color-text-secondary, #666);
    font-size: var(--zd-font-size-sm, 0.875rem);
  }
`;
```

- [ ] **Step 2: Create component file with properties**

```typescript
// provider-card.ts
import {
  CharmElement,
  ZdAvatar,
  ZdButton,
  ZdCard,
} from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import type { TypedEmit, TypedEventTarget } from '../events.js';
import {
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from '../internal/provider-summary.js';
import styles from './provider-card.styles.js';

export interface ProfileRequestDetail {
  provider: ProviderLocation;
}

export interface ZdProviderCardEventMap {
  'profile-request': CustomEvent<ProfileRequestDetail>;
}

/**
 * Displays a provider's photo, name, specialty, location, and insurance status
 * in a horizontal card layout with a slot for availability.
 *
 * @tag zd-provider-card
 * @event profile-request - Emitted with `{ provider }` when the provider's name is clicked.
 * @slot availability - Content to display on the right side (typically zd-availability-grid).
 * @slot badges - Content to display below the insurance line (badges, awards).
 * @csspart photo - The avatar element.
 * @csspart details - The text column.
 * @csspart name - The clickable provider name button.
 * @csspart specialty - The specialty line.
 * @csspart location - The distance and address line.
 * @csspart insurance - The network status line.
 */
export class ZdProviderCard extends CharmElement {
  public static override baseName = 'provider-card';

  declare public addEventListener: TypedEventTarget<ZdProviderCardEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdProviderCardEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdProviderCardEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdAvatar, ZdButton];
  }

  /** The provider location data to render. */
  @property({ attribute: false })
  public provider?: ProviderLocation;

  /**
   * Renders the provider's photo from CDN. Off by default because the photo
   * comes from an external CDN, not the configured baseUrl (PHI-003 note).
   */
  @property({ type: Boolean, attribute: 'show-photo' })
  public showPhoto = false;

  /**
   * The insurance plan name the search was run with. Enables the network
   * status line when provided.
   */
  @property({ attribute: 'insurance-name' })
  public insuranceName?: string;

  protected override render(): unknown {
    if (!this.provider) return nothing;
    return this.html`<scoped-card>TODO</scoped-card>`;
  }
}
```

- [ ] **Step 3: Create index.ts for registration**

```typescript
// index.ts
import { project } from '@powered-by-zocdoc/primitives';
import { ZdProviderCard } from './provider-card.js';

project.scope.registerComponent(ZdProviderCard);

export { ZdProviderCard };
export type { ProfileRequestDetail, ZdProviderCardEventMap } from './provider-card.js';
```

- [ ] **Step 4: Add export to main index.ts**

In `packages/api-components/src/index.ts`, add after the `ZdProviderProfile` export:

```typescript
export {
  ZdProviderCard,
  type ProfileRequestDetail,
  type ZdProviderCardEventMap,
} from './components/provider-card/index.js';
```

- [ ] **Step 5: Create initial test file**

```typescript
// provider-card.test.ts
import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import type { ProviderLocation } from '../../client/types.js';
import { mount, shadow } from '../../utils/test/mount.js';
import './index.js';

const PROVIDER = SCENARIOS.drJohnSmith.providerLocations[0];

type Card = HTMLElement & {
  provider?: ProviderLocation;
  showPhoto: boolean;
  insuranceName?: string;
};

describe('zd-provider-card', () => {
  it('renders without provider', async () => {
    const card = await mount<Card>('zd-provider-card');
    expect(shadow(card).textContent?.trim()).toBe('');
  });

  it('renders with provider', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;
    expect(shadow(card).textContent).toContain('TODO');
  });
});
```

- [ ] **Step 6: Run tests to verify scaffold**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: 2 passing tests

- [ ] **Step 7: Commit scaffold**

```bash
git add packages/api-components/src/components/provider-card/ packages/api-components/src/index.ts
git commit -m "feat(provider-card): scaffold component with properties"
```

---

### Task 2: Implement provider-card rendering

**Files:**
- Modify: `packages/api-components/src/components/provider-card/provider-card.ts`
- Modify: `packages/api-components/src/components/provider-card/provider-card.test.ts`

**Interfaces:**
- Consumes: `providerHeading`, `providerLocationLine` from `../internal/provider-summary.js`
- Produces: Rendered card with name, specialty, location, insurance

- [ ] **Step 1: Write failing tests for rendering**

Add to `provider-card.test.ts`:

```typescript
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, shadow } from '../../utils/test/mount.js';

// ... existing code ...

describe('rendering', () => {
  it('renders provider name with title', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const name = part(card, 'name');
    expect(name?.textContent).toContain(PROVIDER.provider.full_name);
  });

  it('renders specialty', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const specialty = part(card, 'specialty');
    expect(specialty?.textContent).toContain(PROVIDER.provider.specialties?.[0]);
  });

  it('renders location with distance', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const location = part(card, 'location');
    expect(location?.textContent).toBeTruthy();
  });

  it('renders insurance status when insuranceName provided', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    card.insuranceName = 'Anthem Blue Cross';
    await card.updateComplete;

    const insurance = part(card, 'insurance');
    expect(insurance?.textContent).toContain('Anthem Blue Cross');
  });

  it('does not render insurance without insuranceName', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const insurance = part(card, 'insurance');
    expect(insurance).toBeNull();
  });

  it('passes axe', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    await expectNoViolations(card);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: FAIL — tests looking for parts find nothing

- [ ] **Step 3: Implement render method**

Replace the `render()` method in `provider-card.ts`:

```typescript
  /**
   * The network line, rendered only when the patient named a plan.
   */
  protected renderInsurance(): unknown {
    if (!this.insuranceName || !this.provider) return nothing;

    const acceptance = this.provider.accepts_patient_insurance;
    if (acceptance !== 'accepted' && acceptance !== 'not_accepted') return nothing;

    const status = acceptance === 'accepted' ? 'In-network' : 'Out-of-network';
    return this.html`<span part="insurance">${status} · ${this.insuranceName}</span>`;
  }

  protected override render(): unknown {
    if (!this.provider) return nothing;

    const heading = providerHeading(this.provider);
    const specialty = this.provider.provider.specialties?.[0];
    const location = providerLocationLine(this.provider);

    return this.html`
      <scoped-card>
        <div class="provider-card">
          <div part="details">
            <scoped-button part="name" variant="link">
              ${heading}
            </scoped-button>
            ${specialty ? this.html`<span part="specialty">${specialty}</span>` : nothing}
            ${location ? this.html`<span part="location">${location}</span>` : nothing}
            ${this.renderInsurance()}
            <slot name="badges"></slot>
          </div>
          <slot name="availability"></slot>
        </div>
      </scoped-card>
    `;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: All tests pass

- [ ] **Step 5: Commit rendering implementation**

```bash
git add packages/api-components/src/components/provider-card/
git commit -m "feat(provider-card): implement name, specialty, location, insurance rendering"
```

---

### Task 3: Add avatar with photo and initials fallback

**Files:**
- Modify: `packages/api-components/src/components/provider-card/provider-card.ts`
- Modify: `packages/api-components/src/components/provider-card/provider-card.test.ts`

**Interfaces:**
- Consumes: `providerPhotoUrl` from `../internal/provider-summary.js`
- Produces: Avatar rendering with photo or initials

- [ ] **Step 1: Write failing tests for avatar**

Add to `provider-card.test.ts`:

```typescript
describe('avatar', () => {
  it('shows avatar with initials when showPhoto is false', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const avatar = shadow(card).querySelector('zd-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('initials')).toBeTruthy();
    expect(avatar?.getAttribute('image')).toBeNull();
  });

  it('shows avatar with image when showPhoto is true', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    card.showPhoto = true;
    await card.updateComplete;

    const avatar = shadow(card).querySelector('zd-avatar');
    expect(avatar?.getAttribute('image')).toBeTruthy();
  });

  it('derives initials from first and last name', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const avatar = shadow(card).querySelector('zd-avatar');
    const initials = avatar?.getAttribute('initials');
    // Dr. John Smith -> JS
    expect(initials?.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: FAIL — no avatar element found

- [ ] **Step 3: Implement avatar rendering**

Add helper and update render in `provider-card.ts`:

```typescript
  /**
   * Derives initials from the provider's name for the avatar fallback.
   */
  protected providerInitials(): string {
    const provider = this.provider?.provider;
    const first = provider?.first_name?.[0] ?? '';
    const last = provider?.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  }

  protected renderAvatar(): unknown {
    if (!this.provider) return nothing;

    const photo = this.showPhoto ? providerPhotoUrl(this.provider) : undefined;
    const label = providerHeading(this.provider);
    const initials = this.providerInitials();

    return this.html`
      <scoped-avatar
        part="photo"
        .image=${photo ?? nothing}
        initials=${initials}
        label=${label}
      ></scoped-avatar>
    `;
  }
```

Update `render()` to include the avatar:

```typescript
  protected override render(): unknown {
    if (!this.provider) return nothing;

    const heading = providerHeading(this.provider);
    const specialty = this.provider.provider.specialties?.[0];
    const location = providerLocationLine(this.provider);

    return this.html`
      <scoped-card>
        <div class="provider-card">
          ${this.renderAvatar()}
          <div part="details">
            <scoped-button part="name" variant="link">
              ${heading}
            </scoped-button>
            ${specialty ? this.html`<span part="specialty">${specialty}</span>` : nothing}
            ${location ? this.html`<span part="location">${location}</span>` : nothing}
            ${this.renderInsurance()}
            <slot name="badges"></slot>
          </div>
          <slot name="availability"></slot>
        </div>
      </scoped-card>
    `;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: All tests pass

- [ ] **Step 5: Commit avatar implementation**

```bash
git add packages/api-components/src/components/provider-card/
git commit -m "feat(provider-card): add avatar with photo and initials fallback"
```

---

### Task 4: Add profile-request event

**Files:**
- Modify: `packages/api-components/src/components/provider-card/provider-card.ts`
- Modify: `packages/api-components/src/components/provider-card/provider-card.test.ts`

**Interfaces:**
- Produces: `profile-request` event with `{ provider: ProviderLocation }`

- [ ] **Step 1: Write failing test for event**

Add to `provider-card.test.ts`:

```typescript
describe('events', () => {
  it('emits profile-request when name is clicked', async () => {
    const card = await mount<Card>('zd-provider-card');
    card.provider = PROVIDER;
    await card.updateComplete;

    const events: CustomEvent[] = [];
    card.addEventListener('profile-request', (e) => events.push(e as CustomEvent));

    const nameButton = part<HTMLElement>(card, 'name');
    nameButton?.click();

    expect(events).toHaveLength(1);
    expect(events[0].detail.provider).toBe(PROVIDER);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: FAIL — no event emitted

- [ ] **Step 3: Implement event emission**

Update the name button in `render()`:

```typescript
            <scoped-button
              part="name"
              variant="link"
              @click=${() => this.handleNameClick()}
            >
              ${heading}
            </scoped-button>
```

Add the handler method:

```typescript
  protected handleNameClick(): void {
    if (!this.provider) return;
    this.emit('profile-request', { detail: { provider: this.provider } });
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: All tests pass

- [ ] **Step 5: Commit event implementation**

```bash
git add packages/api-components/src/components/provider-card/
git commit -m "feat(provider-card): emit profile-request event on name click"
```

---

### Task 5: Add slots for availability and badges

**Files:**
- Modify: `packages/api-components/src/components/provider-card/provider-card.test.ts`

**Interfaces:**
- Produces: Working `availability` and `badges` slots

- [ ] **Step 1: Write tests for slots**

Add to `provider-card.test.ts`:

```typescript
describe('slots', () => {
  it('renders slotted availability content', async () => {
    const card = await mount<Card>(
      'zd-provider-card',
      '<span slot="availability" id="test-avail">Availability here</span>'
    );
    card.provider = PROVIDER;
    await card.updateComplete;

    const slotted = card.querySelector('#test-avail');
    expect(slotted).not.toBeNull();
    expect(slotted?.textContent).toBe('Availability here');
  });

  it('renders slotted badges content', async () => {
    const card = await mount<Card>(
      'zd-provider-card',
      '<span slot="badges" id="test-badge">Badge here</span>'
    );
    card.provider = PROVIDER;
    await card.updateComplete;

    const slotted = card.querySelector('#test-badge');
    expect(slotted).not.toBeNull();
    expect(slotted?.textContent).toBe('Badge here');
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Slots are already in the template from Task 2, so these should pass.

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-card`

Expected: All tests pass

- [ ] **Step 3: Commit slot tests**

```bash
git add packages/api-components/src/components/provider-card/
git commit -m "test(provider-card): add slot tests for availability and badges"
```

---

### Task 6: Add Storybook stories

**Files:**
- Create: `packages/api-components/src/components/provider-card/provider-card.stories.ts`

**Interfaces:**
- Consumes: `SCENARIOS` from fixtures for sample data

- [ ] **Step 1: Create stories file**

```typescript
// provider-card.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import type { ZdProviderCard } from './provider-card.js';
import './index.js';

const PROVIDER = SCENARIOS.drJohnSmith.providerLocations[0];

const meta: Meta<ZdProviderCard> = {
  title: 'Components/Provider Card',
  component: 'zd-provider-card',
  argTypes: {
    showPhoto: { control: 'boolean' },
    insuranceName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ZdProviderCard>;

export const Default: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER}></zd-provider-card>
  `,
};

export const WithPhoto: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo></zd-provider-card>
  `,
};

export const WithInsurance: Story = {
  render: () => html`
    <zd-provider-card
      .provider=${PROVIDER}
      show-photo
      insurance-name="Anthem Blue Cross"
    ></zd-provider-card>
  `,
};

export const WithAvailability: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo>
      <div slot="availability" style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
        [Availability Grid Placeholder]
      </div>
    </zd-provider-card>
  `,
};

export const WithBadges: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo>
      <zd-badge slot="badges" variant="info">Top Provider</zd-badge>
    </zd-provider-card>
  `,
};
```

- [ ] **Step 2: Verify stories render**

Run: `pnpm --filter @powered-by-zocdoc/api-components storybook`

Navigate to Components/Provider Card and verify all stories render correctly.

- [ ] **Step 3: Commit stories**

```bash
git add packages/api-components/src/components/provider-card/
git commit -m "docs(provider-card): add Storybook stories"
```

---

### Task 7: Integrate into provider-results

**Files:**
- Modify: `packages/api-components/src/components/provider-results/provider-results.ts`
- Modify: `packages/api-components/src/components/provider-results/provider-results.styles.ts`

**Interfaces:**
- Consumes: `ZdProviderCard` component, `ZdDialog`, `ZdProviderProfile`
- Produces: Profile dialog on name click

- [ ] **Step 1: Add imports and dependencies**

In `provider-results.ts`, update imports:

```typescript
import {
  CharmElement,
  ZdButton,
  ZdCard,
  ZdDialog,
} from '@powered-by-zocdoc/primitives';
// ... existing imports ...
import { ZdProviderCard } from '../provider-card/provider-card.js';
import { ZdProviderProfile } from '../provider-profile/provider-profile.js';
```

Update dependencies:

```typescript
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdButton, ZdAvailabilityGrid, ZdProviderCard, ZdDialog, ZdProviderProfile];
  }
```

- [ ] **Step 2: Add dialog state**

Add state properties after existing `@state()` declarations:

```typescript
  @state()
  private profileOpen = false;

  @state()
  private profileProvider?: ProviderLocation;
```

Add handler methods:

```typescript
  protected openProfileDialog(provider: ProviderLocation): void {
    this.profileProvider = provider;
    this.profileOpen = true;
  }

  protected closeProfileDialog(): void {
    this.profileOpen = false;
  }
```

- [ ] **Step 3: Update availability to use slot**

Update `renderAvailability()` to add `slot="availability"` attribute:

```typescript
  protected renderAvailability(location: ProviderLocation): unknown {
    if (this.availability === undefined) return nothing;

    return this.html`
      <scoped-availability-grid
        slot="availability"
        part="provider-availability"
        exportparts="days: availability-days, day: availability-day, empty: availability-empty"
        hide-window
        provider-location-id=${location.provider_location_id}
        start-date=${resolveWindowStart(this.availabilityStart)}
        days=${this.availabilityDays}
        .timeslots=${this.timeslotsFor(location)}
        @day-select=${(event: CustomEvent<{ day: string }>) => {
          event.stopPropagation();
          this.emit('day-select', { detail: { day: event.detail.day, provider: location } });
        }}
      ></scoped-availability-grid>
    `;
  }
```

- [ ] **Step 4: Update render to use provider-card**

Replace the card rendering in the `render()` method's map:

```typescript
      <ul part="list">
        ${this.providers.map((location) => {
          const badges = this.renderBadges(location);
          return this.html`
            <li>
              <scoped-provider-card
                part="provider"
                .provider=${location}
                ?show-photo=${this.showPhotos}
                insurance-name=${this.insuranceName ?? nothing}
                @profile-request=${(e: CustomEvent<{ provider: ProviderLocation }>) =>
                  this.openProfileDialog(e.detail.provider)}
              >
                ${badges === nothing ? nothing : this.html`<span slot="badges">${badges}</span>`}
                ${this.renderAvailability(location)}
              </scoped-provider-card>
            </li>
          `;
        })}
      </ul>
```

- [ ] **Step 5: Add profile dialog**

Add at the end of `render()`, before the closing template literal:

```typescript
      <scoped-dialog
        ?open=${this.profileOpen}
        @close=${() => this.closeProfileDialog()}
      >
        ${this.profileProvider
          ? this.html`<scoped-provider-profile .provider=${this.profileProvider}></scoped-provider-profile>`
          : nothing}
      </scoped-dialog>
```

- [ ] **Step 6: Remove old card markup**

Remove the old `<scoped-card>` with `<button part="provider">` — it's replaced by `<scoped-provider-card>`.

Remove the `renderProviderSummary` import since the card handles provider rendering now. Keep `summaryStyles` — it's still used by `renderSummary()` for the "X providers" count line.

- [ ] **Step 7: Run existing tests**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-results`

Expected: Some tests may fail due to changed structure — we'll fix in Task 8.

- [ ] **Step 8: Commit integration**

```bash
git add packages/api-components/src/components/provider-results/
git commit -m "feat(provider-results): integrate provider-card with profile dialog"
```

---

### Task 8: Update provider-results tests

**Files:**
- Modify: `packages/api-components/src/components/provider-results/provider-results.test.ts`

**Interfaces:**
- Tests updated to work with new card-based structure

- [ ] **Step 1: Update part selectors**

The `part="provider"` is now on the card, not a button. Update any tests that query for it:

```typescript
// Old:
const button = part<HTMLButtonElement>(element, 'provider');
button?.click();

// New: The card emits the event, so we need to trigger profile-request
const card = shadow(element).querySelector('zd-provider-card');
card?.dispatchEvent(new CustomEvent('profile-request', {
  bubbles: true,
  detail: { provider: PROVIDERS[0] },
}));
```

- [ ] **Step 2: Add profile dialog tests**

```typescript
describe('profile dialog', () => {
  it('opens dialog on profile-request from card', async () => {
    const element = await mount<Results>('zd-provider-results');
    element.providers = PROVIDERS;
    await element.updateComplete;

    const card = shadow(element).querySelector('zd-provider-card');
    card?.dispatchEvent(new CustomEvent('profile-request', {
      bubbles: true,
      detail: { provider: PROVIDERS[0] },
    }));
    await element.updateComplete;

    const dialog = shadow(element).querySelector('zd-dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
  });

  it('shows provider-profile in dialog', async () => {
    const element = await mount<Results>('zd-provider-results');
    element.providers = PROVIDERS;
    await element.updateComplete;

    const card = shadow(element).querySelector('zd-provider-card');
    card?.dispatchEvent(new CustomEvent('profile-request', {
      bubbles: true,
      detail: { provider: PROVIDERS[0] },
    }));
    await element.updateComplete;

    const profile = shadow(element).querySelector('zd-provider-profile');
    expect(profile).not.toBeNull();
  });

  it('closes dialog on close event', async () => {
    const element = await mount<Results>('zd-provider-results');
    element.providers = PROVIDERS;
    await element.updateComplete;

    // Open
    const card = shadow(element).querySelector('zd-provider-card');
    card?.dispatchEvent(new CustomEvent('profile-request', {
      bubbles: true,
      detail: { provider: PROVIDERS[0] },
    }));
    await element.updateComplete;

    // Close
    const dialog = shadow(element).querySelector('zd-dialog');
    dialog?.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    await element.updateComplete;

    expect(dialog?.hasAttribute('open')).toBe(false);
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run`

Expected: All tests pass

- [ ] **Step 4: Run axe on updated component**

Verify accessibility:

```typescript
it('passes axe with profile dialog open', async () => {
  const element = await mount<Results>('zd-provider-results');
  element.providers = PROVIDERS;
  await element.updateComplete;

  const card = shadow(element).querySelector('zd-provider-card');
  card?.dispatchEvent(new CustomEvent('profile-request', {
    bubbles: true,
    detail: { provider: PROVIDERS[0] },
  }));
  await element.updateComplete;

  await expectNoViolations(element);
});
```

- [ ] **Step 5: Commit test updates**

```bash
git add packages/api-components/src/components/provider-results/
git commit -m "test(provider-results): update tests for provider-card integration"
```

---

### Task 9: Final cleanup and verification

**Files:**
- All created/modified files

- [ ] **Step 1: Run full test suite**

```bash
pnpm --filter @powered-by-zocdoc/api-components test
```

Expected: All tests pass

- [ ] **Step 2: Run type check**

```bash
pnpm --filter @powered-by-zocdoc/api-components typecheck
```

Expected: No type errors

- [ ] **Step 3: Run linter**

```bash
pnpm --filter @powered-by-zocdoc/api-components lint
```

Expected: No lint errors

- [ ] **Step 4: Verify Storybook**

```bash
pnpm --filter @powered-by-zocdoc/api-components storybook
```

Check both Provider Card and Provider Results stories work correctly.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: cleanup and fixes from provider-card integration"
```
