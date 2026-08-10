# zd-provider-card

Displays a provider's photo, name, specialty, location, and insurance status
in a horizontal card layout with a slot for availability.

**Class** `ZdProviderCard` — **Module** `src/components/provider-card/provider-card.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-provider-card></zd-provider-card>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-name` | `insuranceName` | `string \| undefined` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| `show-photo` | `showPhoto` | `boolean` | `false` | Renders the provider's photo from CDN. Off by default because the photo comes from an external CDN, not the configured baseUrl (PHI-003 note). |
| — | `addEventListener` | `TypedEventTarget<ZdProviderCardEventMap>["addEventListener"]` | — | — |
| — | `provider` | `ProviderLocation \| undefined` | — | The provider location data to render. |
| — | `removeEventListener` | `TypedEventTarget<ZdProviderCardEventMap>["removeEventListener"]` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `profile-request` | `unknown` | Emitted with `{ provider }` when the provider's name is clicked. |

## Slots

| Slot | Description |
| --- | --- |
| `availability` | Content to display on the right side (typically zd-availability-grid). |
| `badges` | Content to display below the insurance line (badges, awards). |

## CSS Parts

| Part | Description |
| --- | --- |
| `details` | The text column. |
| `insurance` | The network status line. |
| `location` | The distance and address line. |
| `name` | The clickable provider name button. |
| `photo` | The avatar element. |
| `specialty` | The specialty line. |
