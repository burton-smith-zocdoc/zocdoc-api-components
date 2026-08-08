# Provider Search Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `zd-provider-search` to use a compact horizontal search bar with native form elements styled via design tokens, removing the visit reason field.

**Architecture:** Replace Charm input/select components with native `<select>` and `<input>` elements styled using CSS custom properties from the Zocdoc theme. The container gets raised elevation styling, fields are separated by vertical dividers, and only ZdButton remains for the submit action.

**Tech Stack:** Lit, TypeScript, Vitest (browser mode), Charm UX (ZdButton only), Zocdoc design tokens

## Global Constraints

- Extend `CharmElement`, not `LitElement` directly (PBZD-002)
- Write `<scoped-*>` in templates for Charm components, list in `dependencies()` (PBZD-003)
- Test with axe-core, no violations (A11Y-005)
- Use test data from documented scenarios (TEST-003)
- No PHI in logs or error messages (PHI-001)
- Use CSS logical properties for RTL support (I18N-003)

## File Structure

```
packages/api-components/src/components/provider-search/
├── index.ts                      # Registration (unchanged)
├── provider-search.ts            # Component class (modify)
├── provider-search.styles.ts     # CSS styles (rewrite)
├── provider-search.test.ts       # Unit tests (modify)
└── provider-search.stories.ts    # Storybook stories (modify)
```

---

### Task 1: Rewrite styles for search bar layout

**Files:**
- Rewrite: `packages/api-components/src/components/provider-search/provider-search.styles.ts`

**Interfaces:**
- Produces: CSS for `.search-bar`, `.field`, native `select`/`input` styling with design tokens

- [ ] **Step 1: Replace styles file with search bar layout**

```typescript
// provider-search.styles.ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .search-bar {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: var(--zd-spacing-8, 8px);
    padding: var(--zd-spacing-12, 12px) var(--zd-spacing-16, 16px);
    background: var(--zd-surface-default-bgColor, #fff);
    border-radius: var(--zd-borderRadius-xl, 12px);
    box-shadow: var(--zd-shadow-raised);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-4, 4px);
    flex: 1 1 10rem;
    min-width: 8rem;
    padding-inline-end: var(--zd-spacing-16, 16px);
    border-inline-end: 1px solid var(--zd-border-light, #e5e5e5);

    &:last-of-type {
      border-inline-end: none;
      padding-inline-end: 0;
    }
  }

  .field label {
    font-size: var(--zd-typography-label-lg-fontSize, 14px);
    font-weight: var(--zd-typography-label-lg-fontWeight, 600);
    color: var(--zd-formControl-helpText-color, #525252);
    line-height: var(--zd-typography-label-lg-lineHeight, 1.25);
  }

  .field select,
  .field input {
    appearance: none;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--zd-typography-body-md-fontSize, 16px);
    font-weight: var(--zd-typography-body-md-fontWeight, 400);
    line-height: var(--zd-typography-body-md-lineHeight, 1.625);
    color: var(--zd-body-fgColor, #171717);
    width: 100%;
    padding: 0;
    cursor: pointer;

    &::placeholder {
      color: var(--zd-formControl-placeholderColor, #a3a3a3);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: var(--zd-focus-outlineWidth, 2px) solid var(--zd-focus-outlineColor, #4e93f3);
      outline-offset: var(--zd-focus-outlineOffset, 2px);
      border-radius: var(--zd-borderRadius-sm, 4px);
    }
  }

  .field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right center;
    padding-inline-end: 1.5rem;
  }

  .field input {
    cursor: text;
  }

  .field--location {
    flex: 0 1 7rem;
    min-width: 5rem;
  }

  .error-container {
    width: 100%;
    margin-block-start: var(--zd-spacing-8, 8px);
  }
`;
```

- [ ] **Step 2: Verify styles file has no syntax errors**

Run: `pnpm --filter @powered-by-zocdoc/api-components typecheck`

Expected: No errors in provider-search.styles.ts

- [ ] **Step 3: Commit styles**

```bash
git add packages/api-components/src/components/provider-search/provider-search.styles.ts
git commit -m "style(provider-search): rewrite styles for compact search bar layout"
```

---

### Task 2: Update component template and logic

**Files:**
- Modify: `packages/api-components/src/components/provider-search/provider-search.ts`

**Interfaces:**
- Consumes: Styles from Task 1
- Produces: Updated `ZdProviderSearch` class with native elements, no visit reason field

- [ ] **Step 1: Update imports - remove ZdInput, ZdSelect, keep ZdButton**

Replace the imports at the top of `provider-search.ts`:

```typescript
import { CharmElement, ZdButton } from '@powered-by-zocdoc/primitives';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  searchProviderLocations,
  type ProviderSearchResult,
} from '../../client/provider-locations.js';
import { getInsurancePlans, getSpecialties } from '../../client/reference-data.js';
import type {
  InsurancePlan,
  ProviderLocation,
  Specialty,
  VisitType,
} from '../../client/types.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import { userFacingError } from '../../utilities/error-message.js';
import { NO_PROVIDERS_MATCH } from '../../utilities/messages.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import styles from './provider-search.styles.js';
```

- [ ] **Step 2: Update dependencies() to remove ZdInput, ZdSelect**

```typescript
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ...requestStateDependencies];
  }
```

- [ ] **Step 3: Remove visitReasonId property and visitReasons state**

Remove these declarations from the class:

```typescript
// DELETE these lines:
@property({ attribute: 'visit-reason-id' })
public visitReasonId?: string;

@state()
private visitReasons: VisitReason[] = [];
```

- [ ] **Step 4: Update willUpdate to remove visit reason loading**

Replace the `willUpdate` method:

```typescript
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (this.searchedPage !== undefined && this.searchedPage !== this.page) {
      void this.search();
    }
  }
```

- [ ] **Step 5: Update loadReferenceData to remove visit reasons**

Replace the `loadReferenceData` method:

```typescript
  protected async loadReferenceData(): Promise<void> {
    const [specialties, insurancePlans] = await Promise.all([
      getSpecialties().catch(() => []),
      getInsurancePlans().catch(() => []),
    ]);

    this.specialties = specialties;
    this.insurancePlans = insurancePlans;
  }
```

- [ ] **Step 6: Delete the loadVisitReasons method entirely**

Remove the entire `loadVisitReasons` method (approximately lines 230-251 in the original).

- [ ] **Step 7: Update validate() to only check specialty and ZIP**

Replace the `validate` method:

```typescript
  protected validate(): ValidatedField | undefined {
    const errors: Partial<Record<ValidatedField, string>> = {};

    if (!this.specialtyId) {
      errors.specialty = 'Choose a specialty to search.';
    }

    if (!ZIP_PATTERN.test(this.zipCode)) {
      errors.zip = 'Enter a 5-digit ZIP code.';
    }

    this.fieldErrors = errors;

    return VALIDATED_FIELDS.find((field) => errors[field]);
  }
```

- [ ] **Step 8: Update search() to not send visitReasonId**

In the `search` method, update the `searchProviderLocations` call:

```typescript
      const { providerLocations, totalCount, pageSize, searchParameters } =
        await searchProviderLocations({
          zipCode: this.zipCode,
          specialtyId: this.specialtyId,
          insurancePlanId: this.insurancePlanId,
          visitType: this.visitType,
          maxDistanceToPatientMi: this.maxDistanceToPatientMi,
          page: this.page,
          pageSize: this.pageSize,
        });
```

And update the event detail to remove `visitReasonId`:

```typescript
      this.emit('provider-results', {
        detail: {
          providers: providerLocations,
          totalCount,
          searchParameters,
          zipCode: this.zipCode,
          specialtyId: this.specialtyId,
          insurancePlanId: this.insurancePlanId,
          visitType: this.visitType,
          page: this.page,
          pageSize,
        },
      });
```

- [ ] **Step 9: Update ProviderResultsDetail interface to remove visitReasonId**

```typescript
export interface ProviderResultsDetail {
  providers: ProviderLocation[];
  totalCount: number;
  pageSize: number;
  page: number;
  searchParameters: ProviderSearchResult['searchParameters'];
  zipCode: string;
  specialtyId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
}
```

- [ ] **Step 10: Simplify optionsFor to only handle Specialty and InsurancePlan**

```typescript
  protected optionsFor(
    items: (Specialty | InsurancePlan)[],
    selectedId: string | undefined
  ): unknown {
    return items.map(
      (item) =>
        this.html`<option value=${item.id} .selected=${item.id === selectedId}>
          ${this.optionLabel(item)}
        </option>`
    );
  }

  protected optionLabel(item: Specialty | InsurancePlan): string {
    const carrier = 'carrier' in item ? item.carrier : undefined;
    return carrier ? `${carrier.name} – ${item.name}` : item.name;
  }
```

- [ ] **Step 11: Rewrite render() with native elements**

Replace the entire `render` method:

```typescript
  protected override render(): unknown {
    const loading = this.requestState === 'loading';
    const errorMessage = this.fieldErrors.specialty || this.fieldErrors.zip;

    return this.html`
      <form class="search-bar" part="form" novalidate @submit=${(event: Event) => this.handleSubmit(event)}>
        <div class="field" part="specialty-field">
          <label for="specialty-select">Search</label>
          <select
            id="specialty-select"
            part="specialty"
            .value=${this.specialtyId ?? ''}
            @change=${(event: Event) => {
              this.specialtyId = (event.target as HTMLSelectElement).value || undefined;
            }}
          >
            <option value="" .selected=${!this.specialtyId}>Condition, procedure or doctor name</option>
            ${this.optionsFor(this.specialties, this.specialtyId)}
          </select>
        </div>

        <div class="field field--location" part="location-field">
          <label for="location-input">Location</label>
          <input
            id="location-input"
            part="zip"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            maxlength="5"
            placeholder="ZIP code"
            .value=${this.zipCode}
            @input=${(event: Event) => {
              this.zipCode = (event.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div class="field" part="insurance-field">
          <label for="insurance-select">Insurance</label>
          <select
            id="insurance-select"
            part="insurance"
            .value=${this.insurancePlanId ?? ''}
            @change=${(event: Event) => {
              this.insurancePlanId = (event.target as HTMLSelectElement).value || undefined;
            }}
          >
            <option value="" .selected=${!this.insurancePlanId}>Any insurance</option>
            ${this.optionsFor(this.insurancePlans, this.insurancePlanId)}
          </select>
        </div>

        <scoped-button part="submit" type="submit" variant="primary" ?disabled=${loading}>
          Find care
        </scoped-button>

        ${errorMessage ? this.html`
          <div class="error-container" role="alert" part="field-error">
            ${errorMessage}
          </div>
        ` : nothing}
      </form>

      ${renderRequestState(this.requestState, {
        emptyMessage: NO_PROVIDERS_MATCH,
        errorMessage: this.errorMessage,
        loadingMessage: 'Searching…',
        onRetry: () => void this.search(),
        children: () => nothing,
      })}
    `;
  }
```

- [ ] **Step 12: Update focusField to work with native elements**

```typescript
  protected async focusField(field: ValidatedField): Promise<void> {
    await this.updateComplete;
    const selector = field === 'specialty' ? '#specialty-select' : '#location-input';
    this.shadowRoot?.querySelector<HTMLElement>(selector)?.focus();
  }
```

- [ ] **Step 13: Verify component compiles**

Run: `pnpm --filter @powered-by-zocdoc/api-components typecheck`

Expected: No type errors

- [ ] **Step 14: Commit component changes**

```bash
git add packages/api-components/src/components/provider-search/provider-search.ts
git commit -m "feat(provider-search): redesign with native elements, remove visit reason"
```

---

### Task 3: Update tests for new structure

**Files:**
- Modify: `packages/api-components/src/components/provider-search/provider-search.test.ts`

**Interfaces:**
- Consumes: Updated component from Task 2
- Produces: Tests that pass with new structure

- [ ] **Step 1: Update type definition to remove visitReasonId**

```typescript
type Search = HTMLElement & {
  zipCode: string;
  specialtyId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
  maxDistanceToPatientMi?: number;
  page: number;
  pageSize?: number;
  search(): Promise<void>;
};
```

- [ ] **Step 2: Remove visit reason imports and fixtures**

Remove these lines from the imports/fixtures section:

```typescript
// DELETE these lines:
const SPECIALTY_REASONS = VISIT_REASONS.filter((reason) => reason.specialty_id === SPECIALTY.id);
const REASON = SPECIALTY_REASONS[0]!;
const OTHER_SPECIALTY = SPECIALTIES[1]!;
const OTHER_REASON = VISIT_REASONS.find((reason) => reason.specialty_id === OTHER_SPECIALTY.id)!;
```

And remove `VISIT_REASONS` from the import:

```typescript
import { SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
```

- [ ] **Step 3: Update control() helper for native elements**

```typescript
function control(element: Search, name: string): HTMLSelectElement | HTMLInputElement | null {
  return shadow(element).querySelector<HTMLSelectElement | HTMLInputElement>(`[part="${name}"]`);
}

function selectOptions(element: Search, name: string): HTMLOptionElement[] {
  const select = control(element, name) as HTMLSelectElement | null;
  return select ? [...select.querySelectorAll<HTMLOptionElement>('option')] : [];
}

function getErrorMessage(element: Search): string {
  return shadow(element).querySelector('[part="field-error"]')?.textContent?.trim() ?? '';
}
```

- [ ] **Step 4: Remove getVisitReasons mock from beforeEach**

Update the `beforeEach` to remove visit reasons:

```typescript
  beforeEach(() => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue(
      searchResult([
        {
          provider_location_id: 'pr_a|lo_a',
          provider: { provider_id: 'pr_a', full_name: 'Dr. Ada Testerson' },
        },
      ])
    );
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue(SPECIALTIES);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([
      { id: 'ip_1', name: 'Aetna PPO' },
    ]);
  });
```

- [ ] **Step 5: Update "populates the selects" test**

```typescript
  it('populates the two selects from reference data', async () => {
    const element = await mountSearch();

    await vi.waitFor(() => {
      expect(selectOptions(element, 'specialty')).toHaveLength(SPECIALTIES.length + 1);
      expect(selectOptions(element, 'insurance')).toHaveLength(2);
    });
  });
```

- [ ] **Step 6: Update "sends the selected specialty" test**

```typescript
  it('sends the selected specialty and insurance with the search', async () => {
    const element = await mountSearch();
    element.insurancePlanId = 'ip_1';
    await settled(element);
    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SPECIALTY.id,
        insurancePlanId: 'ip_1',
      })
    );
  });
```

- [ ] **Step 7: Update validation test for specialty required**

```typescript
  it('refuses to search without a specialty, and says which field', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    await element.search();
    await settled(element);

    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    expect(getErrorMessage(element)).toBe('Choose a specialty to search.');
  });
```

- [ ] **Step 8: Update ZIP validation test**

```typescript
  it('refuses to search on a ZIP that is not five digits', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
    );

    await element.search();
    await settled(element);

    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    expect(getErrorMessage(element)).toBe('Enter a 5-digit ZIP code.');
  });
```

- [ ] **Step 9: Update "clears a field message" test**

```typescript
  it('clears a field message once the field is corrected', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
    );
    await element.search();
    await settled(element);

    element.zipCode = SCENARIOS.zipWithResults;
    await element.search();
    await settled(element);

    expect(getErrorMessage(element)).toBe('');
    expect(providerLocations.searchProviderLocations).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 10: Delete all visit reason tests**

Remove these entire test blocks:
- `'searches on a visit reason alone'`
- `'offers no visit reasons until a specialty is chosen'`
- `'reloads the visit reasons when the specialty changes'`
- `'drops a visit reason that does not belong to the new specialty'`
- `'keeps a host-set visit reason when the reasons cannot be loaded'`

- [ ] **Step 11: Update paging looping test**

```typescript
    it('does not loop when a page change hits a form that cannot search', async () => {
      const element = await mount<Search>(
        `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
      );
      await element.search();

      element.page = 1;
      await settled(element);
      await settled(element);

      expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
      expect(getErrorMessage(element)).toBe('Enter a 5-digit ZIP code.');
    });
```

- [ ] **Step 12: Update "emits the criteria" test**

```typescript
  it('emits the criteria it searched with, including ones the patient changed', async () => {
    const element = await mountSearch();
    element.insurancePlanId = 'ip_1';
    await settled(element);

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events[0]!.detail).toMatchObject({
      zipCode: SCENARIOS.zipWithResults,
      specialtyId: SPECIALTY.id,
      insurancePlanId: 'ip_1',
      page: 0,
    });
  });
```

- [ ] **Step 13: Update "renders visible labels" test**

```typescript
  it('renders visible labels for every field', async () => {
    const element = await mountSearch();

    const labels = [...shadow(element).querySelectorAll('.field label')].map(
      (label) => label.textContent?.trim()
    );

    expect(labels).toEqual(['Search', 'Location', 'Insurance']);
  });
```

- [ ] **Step 14: Update axe test for invalid fields**

```typescript
    it('passes axe checks with validation error shown', async () => {
      const element = await mount<Search>(
        `<zd-provider-search zip-code="1120"></zd-provider-search>`
      );
      await element.search();
      await settled(element);

      await expectNoViolations(element);
    });
```

- [ ] **Step 15: Run tests to verify they pass**

Run: `pnpm --filter @powered-by-zocdoc/api-components test:components -- --run provider-search`

Expected: All tests pass

- [ ] **Step 16: Commit test updates**

```bash
git add packages/api-components/src/components/provider-search/provider-search.test.ts
git commit -m "test(provider-search): update tests for redesigned component"
```

---

### Task 4: Update Storybook stories

**Files:**
- Modify: `packages/api-components/src/components/provider-search/provider-search.stories.ts`

**Interfaces:**
- Consumes: Updated component from Task 2
- Produces: Stories demonstrating new design

- [ ] **Step 1: Simplify stories to match new design**

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdProviderResults } from '../provider-results/provider-results.js';
import type { ZdProviderSearch } from './provider-search.js';
import '../provider-results/index.js';
import './index.js';

configureZocdocMock();

const meta: Meta<ZdProviderSearch> = {
  title: 'API Components/Provider Search',
  component: 'zd-provider-search',
  args: {
    zipCode: SCENARIOS.zipWithResults,
    specialtyId: SPECIALTIES[0]!.id,
  },
};

export default meta;
type Story = StoryObj<ZdProviderSearch>;

/**
 * The compact search bar with specialty, ZIP, and insurance fields.
 * Press "Find care" or Enter to search.
 */
export const Default: Story = {
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
      insurance-plan-id=${args.insurancePlanId ?? ''}
    ></zd-provider-search>
  `,
};

/**
 * Nothing chosen. The form validates that a specialty and valid ZIP are required.
 */
export const NothingChosen: Story = {
  args: { zipCode: '', specialtyId: undefined },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
    ></zd-provider-search>
  `,
};

/** The documented ZIP that matches nothing. Empty is a success, not an error. */
export const NoResults: Story = {
  args: { zipCode: SCENARIOS.zipEmpty },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
    ></zd-provider-search>
  `,
};

/** The documented ZIP that returns a 500. Shows user-facing error with retry. */
export const RequestFails: Story = {
  args: { zipCode: SCENARIOS.zipError },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
    ></zd-provider-search>
  `,
};

/** Search wired to results - the composition this component exists for. */
export const WiredToResults: Story = {
  render: (args) => html`
    <div
      @provider-results=${(event: CustomEvent) => {
        const results = (event.currentTarget as HTMLElement).querySelector<ZdProviderResults>(
          'zd-provider-results'
        );
        if (results) {
          results.providers = event.detail.providers;
        }
      }}
    >
      <zd-provider-search
        zip-code=${args.zipCode ?? ''}
        specialty-id=${args.specialtyId ?? ''}
      ></zd-provider-search>
      <zd-provider-results style="margin-top: 1rem;"></zd-provider-results>
    </div>
  `,
};

/** Narrow viewport - fields wrap gracefully. */
export const NarrowViewport: Story = {
  render: (args) => html`
    <div style="max-width: 400px;">
      <zd-provider-search
        zip-code=${args.zipCode ?? ''}
        specialty-id=${args.specialtyId ?? ''}
      ></zd-provider-search>
    </div>
  `,
};
```

- [ ] **Step 2: Verify stories render**

Run: `pnpm --filter @powered-by-zocdoc/api-components storybook`

Navigate to API Components/Provider Search and verify all stories render correctly.

- [ ] **Step 3: Commit stories**

```bash
git add packages/api-components/src/components/provider-search/provider-search.stories.ts
git commit -m "docs(provider-search): update stories for redesigned component"
```

---

### Task 5: Final verification

**Files:**
- All modified files from Tasks 1-4

- [ ] **Step 1: Run full test suite**

Run: `pnpm --filter @powered-by-zocdoc/api-components test`

Expected: All tests pass

- [ ] **Step 2: Run type check**

Run: `pnpm --filter @powered-by-zocdoc/api-components typecheck`

Expected: No type errors

- [ ] **Step 3: Run linter**

Run: `pnpm --filter @powered-by-zocdoc/api-components lint`

Expected: No lint errors (or fix any that appear)

- [ ] **Step 4: Visual verification in Storybook**

Run: `pnpm --filter @powered-by-zocdoc/api-components storybook`

Verify:
- Search bar has horizontal layout with raised shadow
- Fields have visible labels above them
- Specialty and insurance show as dropdowns with chevron
- ZIP field accepts numeric input
- "Find care" button is yellow (primary variant)
- Form validates and shows errors correctly
- Search works and emits results

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "fix(provider-search): address final verification issues"
```
