# zd-provider-summary

Displays a provider's photo, name, specialty, location, and insurance status
in a compact summary layout. Used by provider-card and booking.

**Class** `ZdProviderSummary` — **Package** `@zocdoc/api-components`

```html
<zd-provider-summary></zd-provider-summary>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hide-photo` | `hidePhoto` | `boolean` | `false` | Hides the provider's photo, which otherwise renders from Zocdoc's image CDN (see `ProviderSummaryOptions.hidePhoto`). |
| `insurance-name` | `insuranceName` | `string` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| — | `provider` | `ProviderLocation` | — | The provider location data to render. |

## CSS Parts

| Part | Description |
| --- | --- |
| `details` | The text column beside the photo. |
| `insurance` | The network status line. |
| `location` | The distance and address line. |
| `name` | The provider name and credential. |
| `photo` | The avatar element. |
| `specialty` | The specialty line. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
