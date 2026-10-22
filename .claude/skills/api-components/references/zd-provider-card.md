# zd-provider-card

Displays a provider's photo, name, specialty, location, and insurance status
in a horizontal card layout with a slot for availability.

**Handoff.** A card whose provider came from a JSON block, or that `zd-provider-results` marks
with `handoff`, shows a "Book now" link to the provider's Zocdoc profile when it has no times
of its own to tap. It needs a `profile_url` on Zocdoc over `https:`; without one there is no
link. `disable-handoff` turns it off.

**Class** `ZdProviderCard` — **Package** `@zocdoc/api-components`

```html
<zd-provider-card></zd-provider-card>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disable-handoff` | `disableHandoff` | `boolean` | `false` | Stops a card in handoff mode from showing "Book now". |
| `hide-photo` | `hidePhoto` | `boolean` | `false` | Hides the provider's photo, which otherwise renders from Zocdoc's image CDN (see `ProviderSummaryOptions.hidePhoto`). |
| `insurance-name` | `insuranceName` | `string` | — | The insurance plan name the search was run with. Enables the network status line when provided. |
| `loading` | `loading` | `boolean` | `false` | Shows skeleton placeholders in the card's layout instead of `provider`. The card never fetches, so the parent sets this while its own request is in flight and clears it when the data arrives. |
| — | `handoff` | `boolean` | `false` | Puts the card in handoff mode as if its provider had come from a JSON block. Set by `zd-provider-results` on the cards of a hydrated list, which only ever show day counts, so the card shows "Book now" even with availability slotted in. |
| — | `provider` | `ProviderLocation` | — | The provider location data to render. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `book-select` | `CustomEvent<BookSelectDetail>` | Emitted with `{ provider }` when "Book now" is chosen. Cancelable: `preventDefault()` keeps the patient on the page. |
| `profile-request` | `CustomEvent<ProfileRequestDetail>` | Emitted with `{ provider }` when the provider's name is clicked. |

## Slots

| Slot | Description |
| --- | --- |
| _(default)_ | — |
| `availability` | Content to display on the right side (typically zd-availability-grid). |
| `badges` | Content to display below the insurance line (badges, awards). |
| `reason` | One line on why this provider fits the search, shown below the specialty. |
| `review` | A verified review snippet, shown below the reason. |
| `sponsored` | The label for a paid placement, shown below the review. |

## CSS Parts

| Part | Description |
| --- | --- |
| `book` | The "Book now" link, shown in handoff mode. |
| `details` | The text column. |
| `insurance` | The network status line. |
| `location` | The distance and address line. |
| `name` | The clickable provider name button. |
| `photo` | The avatar element. |
| `reason` | The wrapper around the `reason` slot, hidden while the slot is empty. |
| `review` | The wrapper around the `review` slot, hidden while the slot is empty. |
| `skeleton` | Each placeholder shown while `loading` is set. |
| `specialty` | The specialty line. |
| `sponsored` | The wrapper around the `sponsored` slot, hidden while the slot is empty. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
