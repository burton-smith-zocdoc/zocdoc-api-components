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
| `loading` | `loading` | `boolean` | — | Shows skeleton placeholders in the card's layout instead of `provider`. The card never fetches, so the parent sets this while its own request is in flight and clears it when the data arrives. |
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
| `zd-skeleton` | Each placeholder shown while `loading` is set. |
| `zd-specialty` | The specialty line. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
