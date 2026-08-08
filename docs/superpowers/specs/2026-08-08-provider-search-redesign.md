# Provider Search Redesign

Redesign `zd-provider-search` to use a compact horizontal search bar with native form elements styled via design tokens.

## Goals

- Match the new search bar design (Search, Location, Insurance, Find care button)
- Remove visit reason field (default to "any" — API uses specialty's default)
- Replace Charm input/select components with native elements styled using Zocdoc design tokens
- Maintain accessibility and form behavior

## Non-Goals

- Free-text autocomplete search (specialty remains a dropdown)
- City/state geolocation lookup (Location field is ZIP-only)
- Creating a separate component (this replaces the existing one)

## Design

### Component Structure

```html
<form class="search-bar" part="form">
  <div class="field" part="specialty-field">
    <label for="specialty">Search</label>
    <select id="specialty" name="specialty" part="specialty">
      <option value="">Condition, procedure or doctor name</option>
      <!-- specialty options -->
    </select>
  </div>
  <div class="field" part="location-field">
    <label for="location">Location</label>
    <input id="location" type="text" inputmode="numeric" maxlength="5" 
           part="zip" placeholder="ZIP code" autocomplete="postal-code" />
  </div>
  <div class="field" part="insurance-field">
    <label for="insurance">Insurance</label>
    <select id="insurance" name="insurance" part="insurance">
      <option value="">Any insurance</option>
      <!-- insurance options -->
    </select>
  </div>
  <scoped-button type="submit" variant="primary" part="submit">
    Find care
  </scoped-button>
</form>
```

### Styling

**Container (`.search-bar`):**
- `background: var(--zd-surface-default-bgColor)`
- `border-radius: var(--zd-borderRadius-xl)` (12px)
- `box-shadow: var(--zd-shadow-raised)`
- `padding: var(--zd-spacing-8)`
- `display: flex; align-items: end; gap: var(--zd-spacing-8)`

**Field containers (`.field`):**
- `flex: 1 1 auto` with appropriate `min-width` per field
- Separated by 1px vertical dividers using `border-inline-end: 1px solid var(--zd-border-light)`

**Labels:**
- `font-size: var(--zd-typography-label-lg-fontSize)` (14px)
- `font-weight: var(--zd-typography-label-lg-fontWeight)` (semibold)
- `color: var(--zd-formControl-helpText-color)` (secondary text)

**Native inputs/selects:**
- `appearance: none` to strip browser chrome
- `background: transparent`
- `border: none`
- `font-size: var(--zd-typography-body-md-fontSize)` (16px)
- `color: var(--zd-body-fgColor)`
- `width: 100%`
- Selects get custom chevron via `background-image` SVG

**Focus states:**
- `:focus-visible` ring using `outline: var(--zd-focus-outlineWidth) solid var(--zd-focus-outlineColor)`
- `outline-offset: var(--zd-focus-outlineOffset)`

**Responsive:**
- `flex-wrap: wrap` on container
- Fields stack on narrow viewports via `min-width` constraints

### API Surface

**Properties (kept):**
| Property | Type | Description |
|----------|------|-------------|
| `zipCode` | `string` | ZIP code for location |
| `specialtyId` | `string \| undefined` | Selected specialty |
| `insurancePlanId` | `string \| undefined` | Selected insurance plan |
| `visitType` | `VisitType \| undefined` | Visit format filter |
| `maxDistanceToPatientMi` | `number \| undefined` | Search radius |
| `page` | `number` | Zero-indexed page number |
| `pageSize` | `number \| undefined` | Results per page |

**Properties (removed):**
| Property | Reason |
|----------|--------|
| `visitReasonId` | Field hidden; API uses specialty's default visit reason |

**Events (unchanged):**
- `provider-results` — emits `ProviderResultsDetail` on successful search
- `provider-search-error` — emits `ErrorDetail` on failure

**CSS Parts:**
| Part | Element |
|------|---------|
| `form` | The form container |
| `specialty-field` | Specialty field wrapper |
| `specialty` | Specialty select |
| `location-field` | Location field wrapper |
| `zip` | ZIP input |
| `insurance-field` | Insurance field wrapper |
| `insurance` | Insurance select |
| `submit` | Submit button |

**Removed parts:** `visit-reason`

### Validation

1. **Specialty required** — "Choose a specialty to search."
2. **ZIP format** — "Enter a 5-digit ZIP code." (pattern: `/^\d{5}$/`)

On validation failure:
- Error message appears below the search bar (single error container)
- Focus moves to the first invalid field
- Error container has `role="alert"`

### Accessibility

- Visible `<label>` elements with `for` attribute for each control
- Native form semantics (`<form>`, `type="submit"`)
- Custom focus ring via `:focus-visible`
- Error linked via `aria-describedby`
- Loading state: button gets `disabled` and `aria-busy="true"`
- State announcements via existing `renderRequestState` live region

### Dependencies

**Kept:**
- `ZdButton` — for the submit button (primary variant)

**Removed:**
- `ZdInput` — replaced by native `<input>`
- `ZdSelect` — replaced by native `<select>`

Update `dependencies()` to return only `[ZdButton, ...requestStateDependencies]`.

## Testing

### Unit Tests

- Renders empty state
- Populates specialty options from `getSpecialties()`
- Populates insurance options from `getInsurancePlans()`
- Validates missing specialty — error shown, field focused
- Validates invalid ZIP — error shown, field focused
- Emits `provider-results` on successful search
- Emits `provider-search-error` on API failure
- Shows error message on failure
- Passes axe-core (idle, loading, error, empty states)

### Storybook Stories

- Default (empty)
- With preselected values
- Loading state
- Error state
- Narrow viewport (responsive)

## Breaking Changes

1. **`visitReasonId` property removed** — consumers setting this will see no effect
2. **`part="visit-reason"` removed** — custom styling targeting it will stop working
3. **Visual appearance changes** — compact horizontal bar replaces stacked form
4. **Native elements replace Charm components** — any CSS targeting `scoped-select`/`scoped-input` internal structure will break

## Migration

Consumers need to:
1. Remove any `visit-reason-id` attribute bindings
2. Update CSS selectors targeting removed parts
3. Test visual integration with the new compact layout
