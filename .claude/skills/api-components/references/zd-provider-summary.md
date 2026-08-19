# zd-provider-summary

Displays a provider's photo, name, specialty, location, and insurance status
in a compact summary layout. Used by provider-card and booking.

**Class** `ZdProviderSummary` — **Module** `src/components/provider-summary/provider-summary.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-provider-summary></zd-provider-summary>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-name` | `insuranceName` | `string \| undefined` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| `show-photo` | `showPhoto` | `boolean` | `false` | Renders the provider's photo from CDN. Off by default because the photo comes from an external CDN, not the configured baseUrl (PHI-003 note). |
| — | `provider` | `ProviderLocation \| undefined` | — | The provider location data to render. |

## CSS Parts

| Part | Description |
| --- | --- |
| `insurance` | The network status line. |
| `location` | The distance and address line. |
| `name` | The provider name and credential. |
| `photo` | The avatar element. |
| `specialty` | The specialty line. |
