# zd-provider-summary

Displays a provider's photo, name, specialty, location, and insurance status
in a compact summary layout. Used by provider-card and booking.

**Class** `ZdProviderSummary` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-provider-summary></zd-provider-summary>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-name` | `insuranceName` | `string` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| `show-photo` | `showPhoto` | `boolean` | — | Renders the provider's photo from CDN. Off by default because the photo comes from an external CDN, not the configured baseUrl (PHI-003 note). |
| — | `provider` | `ProviderLocation` | — | The provider location data to render. |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-details` | — |
| `zd-insurance` | The network status line. |
| `zd-location` | The distance and address line. |
| `zd-name` | The provider name and credential. |
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
