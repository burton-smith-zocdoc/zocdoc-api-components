# Provider Card Component Design

## Summary

Extract a reusable `zd-provider-card` component from `provider-results` that renders provider information in a horizontal layout matching Zocdoc's search UI. The card displays photo, name (clickable), specialty, location, and insurance status, with a slot for availability or other content.

## Goals

1. **Enhance rendering** — horizontal layout with photo left, details center, availability right
2. **Extract reusable component** — `zd-provider-card` works standalone or composed
3. **Prepare for future** — clean component boundary allows adding ratings/badges later

## Component API

```typescript
// packages/api-components/src/components/provider-card/provider-card.ts

export class ZdProviderCard extends CharmElement {
  static override baseName = 'provider-card';

  /** The provider location data to render. Required. */
  @property({ attribute: false })
  provider: ProviderLocation;

  /** 
   * Renders the provider's photo from CDN. Off by default because the photo
   * comes from an external CDN, not the configured baseUrl (PHI-003 note).
   */
  @property({ type: Boolean, attribute: 'show-photo' })
  showPhoto = false;

  /** 
   * The insurance plan name the search was run with. Enables the network 
   * status line when provided.
   */
  @property({ attribute: 'insurance-name' })
  insuranceName?: string;
}

export interface ZdProviderCardEventMap {
  'profile-request': CustomEvent<{ provider: ProviderLocation }>;
}
```

### Usage

```html
<zd-provider-card 
  .provider=${location} 
  show-photo 
  insurance-name="Anthem Blue Cross"
>
  <zd-availability-grid slot="availability" ...></zd-availability-grid>
</zd-provider-card>
```

## Rendering

### Primitives Used

| Primitive | Usage |
|-----------|-------|
| `ZdCard` | Card container |
| `ZdAvatar` | Provider photo with initials fallback |
| `ZdButton` | Clickable name (variant="link") |

### Structure

```html
<scoped-card>
  <div class="provider-card">
    <!-- Left: Photo -->
    <scoped-avatar 
      part="photo"
      image=${photoUrl}
      initials=${initials}
      label=${providerName}
    ></scoped-avatar>
    
    <!-- Center: Details -->
    <div part="details">
      <scoped-button 
        part="name" 
        variant="link"
        @click=${() => this.emitProfileRequest()}
      >${name}, ${title}</scoped-button>
      <span part="specialty">${specialty}</span>
      <span part="location">${distance} · ${address}</span>
      <span part="insurance">${insuranceStatus}</span>
      <slot name="badges"></slot>
    </div>
    
    <!-- Right: Slotted availability -->
    <slot name="availability"></slot>
  </div>
</scoped-card>
```

### Layout

CSS Grid with three columns: `auto 1fr auto` (photo | details | availability).

### Initials Fallback

When `showPhoto=false` or no photo URL exists, derive initials from provider's first and last name (e.g., "Nazaneen Nassiry" → "NN").

## Events

### `profile-request`

Emitted when the provider's name is clicked.

```typescript
'profile-request': CustomEvent<{ provider: ProviderLocation }>
```

The parent component handles opening a dialog with `zd-provider-profile`.

## Integration with provider-results

### Changes to `provider-results.ts`

1. Replace inline card markup with `<scoped-provider-card>`
2. Add dialog state: `profileOpen: boolean`, `selectedProvider: ProviderLocation | undefined`
3. Add `ZdProviderCard`, `ZdDialog`, `ZdProviderProfile` to `dependencies`
4. Handle `profile-request` event to open dialog
5. Remove direct `renderProviderSummary` usage

### Updated Render

```typescript
// In provider-results render()
${this.providers.map((location) => this.html`
  <li>
    <scoped-provider-card
      .provider=${location}
      ?show-photo=${this.showPhotos}
      insurance-name=${this.insuranceName}
      @profile-request=${(e: CustomEvent) => this.openProfileDialog(e.detail.provider)}
    >
      ${this.renderBadges(location)}
      <scoped-availability-grid 
        slot="availability"
        ...
      ></scoped-availability-grid>
    </scoped-provider-card>
  </li>
`)}

<!-- Profile dialog -->
<scoped-dialog ?open=${this.profileOpen} @close=${() => this.closeProfileDialog()}>
  ${this.selectedProvider 
    ? this.html`<scoped-provider-profile .provider=${this.selectedProvider}></scoped-provider-profile>`
    : nothing}
</scoped-dialog>
```

### Badges Slot

The existing `renderBadges()` hook continues to work — badges render in the named `badges` slot inside the card's details section:

```html
<scoped-provider-card .provider=${location}>
  <span slot="badges">${this.renderBadges(location)}</span>
  <scoped-availability-grid slot="availability" ...></scoped-availability-grid>
</scoped-provider-card>
```

## CSS Parts

```
part="photo"      — The avatar element
part="details"    — The text column
part="name"       — The clickable provider name button
part="specialty"  — The specialty line
part="location"   — The distance and address line  
part="insurance"  — The network status line
part="badges"     — Container for slotted badges
```

## File Structure

```
packages/api-components/src/components/provider-card/
├── index.ts
├── provider-card.ts
├── provider-card.styles.ts
├── provider-card.test.ts
└── provider-card.stories.ts
```

## Testing

### `provider-card.test.ts`

- Renders name, specialty, location, insurance from provider data
- Shows avatar with photo when `showPhoto=true`
- Shows avatar with initials when `showPhoto=false` or no photo URL
- Emits `profile-request` with provider when name clicked
- Slotted content appears in the availability slot
- Axe passes in all states (A11Y-005)

### Updates to `provider-results.test.ts`

- Cards render with correct provider data
- `profile-request` from card opens dialog with correct provider
- Dialog shows `zd-provider-profile` for selected provider
- Dialog closes correctly

### Test Data

Use existing fixtures from `provider-locations.test.ts` and documented test scenarios per TEST-003.

## Dependencies

The card adds these to its `dependencies`:

```typescript
static override get dependencies(): (typeof CharmElement)[] {
  return [ZdCard, ZdAvatar, ZdButton];
}
```

`provider-results` adds:

```typescript
static override get dependencies(): (typeof CharmElement)[] {
  return [ZdProviderCard, ZdAvailabilityGrid, ZdDialog, ZdProviderProfile, ZdButton];
}
```

## Migration Notes

### `renderProviderSummary` and helpers

Keep `components/internal/provider-summary.ts` and its helpers (`providerHeading`, `providerAddress`, `providerLocationLine`, `providerPhotoUrl`). The card uses these helpers internally, and `provider-profile` uses them directly for its header.

The card does NOT call `renderProviderSummary()` as a whole — it composes the same helpers into its own structure with the horizontal layout and clickable name.

## Out of Scope

- Ratings and review counts (API doesn't provide)
- Badges like "Top 10 PCP Practice" or "Sponsored" (API doesn't provide)
- Tags like "Highly recommended" (API doesn't provide)
- Specific appointment times (keeping day counts per current behavior)

These can be added when the API ships the data.
