# zd-provider-card

Displays a provider's photo, name, specialty, location, and insurance status
in a horizontal card layout with a slot for availability.

**Class** `ZdProviderCard` — **Package** `@zocdoc/api-components`

```html
<zd-provider-card></zd-provider-card>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hide-photo` | `hidePhoto` | `boolean` | — | Hides the provider's photo, which otherwise renders from Zocdoc's image CDN (see `ProviderSummaryOptions.hidePhoto`). |
| `insurance-name` | `insuranceName` | `string` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| — | `addEventListener` | `TypedEventTarget<ZdProviderCardEventMap>["addEventListener"]` | — | — |
| — | `provider` | `ProviderLocation` | — | The provider location data to render. |
| — | `removeEventListener` | `TypedEventTarget<ZdProviderCardEventMap>["removeEventListener"]` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `profile-request` | `Event` | Emitted with `{ provider }` when the provider's name is clicked. |

## Slots

| Slot | Description |
| --- | --- |
| `availability` | Content to display on the right side (typically zd-availability-grid). |
| `badges` | Content to display below the insurance line (badges, awards). |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-details` | The text column. |
| `zd-insurance` | The network status line. |
| `zd-location` | The distance and address line. |
| `zd-name` | The clickable provider name button. |
| `zd-photo` | The avatar element. |
| `zd-specialty` | The specialty line. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
