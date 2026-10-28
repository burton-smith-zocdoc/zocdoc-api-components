# zd-provider-results

Renders a list of provider locations and emits the one the user picks.
Purely presentational — it performs no network requests, and it works on its
own with nothing above it (COMP-004).

**Paging is reported, not performed.** `page-change` says which page the patient asked for
and the component updates `page` to match, but fetching it belongs to whatever owns the
request — this component never learns the search criteria, so it could not refetch if it
wanted to (COMP-002). `window-change` works the same way.

Supply `availability` and each card grows a `zd-availability-grid` of day counts, with one
shared window control above the list driving all of them.

**Handoff.** A list hydrated from JSON blocks has nobody to answer its events, so every card
shows "Book now" to the provider's Zocdoc profile, and a day on a card does the same. Paging
and the window control are hidden, since nothing would fetch the page or window they ask for;
`interactive` shows them again for a page that will. `disable-handoff` turns handoff off.

**Class** `ZdProviderResults` — **Package** `@zocdoc/api-components`

```html
<zd-provider-results></zd-provider-results>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `availability-days` | `availabilityDays` | `number` | `14` | How many days of availability each card shows. Clamped to the API's 30-day maximum. |
| `availability-start` | `availabilityStart` | `string` | — | The first day of the availability window, as `YYYY-MM-DD`. Defaults to today. Set by this component's own window control and read by every card, which is what keeps them showing the same dates. Whoever supplies `availability` is expected to bind this back down after a `window-change` so the counts and the dates above them cannot disagree. |
| `disable-handoff` | `disableHandoff` | `boolean` | `false` | Stops a list hydrated from markup from handing taps off to Zocdoc. |
| `hide-photos` | `hidePhotos` | `boolean` | `false` | Hides each provider's photo, which otherwise renders from Zocdoc's image CDN — see `ProviderSummaryOptions.hidePhoto`. |
| `insurance-name` | `insuranceName` | `string` | — | The insurance plan the search was run with. Supplying it is what allows the network line to render at all, since `accepts_patient_insurance` is only meaningful against a plan. |
| `interactive` | `interactive` | `boolean` | `false` | Says the page will answer `page-change` and `window-change` itself, so a list hydrated from markup keeps its pager and window control. |
| `loading` | `loading` | `boolean` | `false` | Shows a page of skeleton cards in place of `providers`. Reported state, like paging: this component never fetches, so whoever owns the search sets this while a page is in flight and clears it when the new `providers` arrive. |
| `page` | `page` | `number` | `0` | The zero-indexed page `providers` holds, matching the API's own indexing. |
| `page-size` | `pageSize` | `number` | `10` | The page size the search used. Defaults to the API's own, which is what it fell back to. |
| `selected-id` | `selectedId` | `string` | — | The currently selected `provider_location_id`, if any. |
| `total-count` | `totalCount` | `number` | — | The **unpaged** total from `total_count`, which is what makes the count line and the pager possible: `providers` only ever holds the page in hand. Left undefined by a host page that has no total, in which case neither renders — a count of the current page presented as the count of the search would be a lie, and a pager cannot know where it ends. |
| — | `annotations` | `Readonly<Record<string, ProviderAnnotation>>` | — | Extra lines for the cards, keyed by `provider_location_id`: the card's `reason`, `review` and `sponsored` slots, which a card inside this shadow root can't be handed any other way. An entry for a provider not in `providers` is ignored. |
| — | `availability` | `ProviderLocationAvailability[]` | — | Day counts per card, from one batched availability request for the whole page. Batched by whoever owns the search, not by the cards: the endpoint takes an array of `provider_location_ids` and answers for all of them at once, so ten cards fetching for themselves would be ten requests for one screen. Left undefined by a host page with no availability to show, in which case no card renders a grid at all — which is the standalone case, and the list still works (COMP-004). Entries the batch did not answer for get {@link NO_TIMESLOTS} rather than nothing, so a card says "no appointments" instead of quietly going and asking on its own. |
| — | `providers` | `ProviderLocation[]` | — | The provider locations to display. Unset renders the same as `[]`; it's unset rather than `[]` by default so a JSON block can supply it. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `book-select` | `CustomEvent<BookSelectDetail>` | Emitted with `{ provider }` in handoff mode, when "Book now" or a day on a card is chosen. Cancelable: `preventDefault()` keeps the patient on the page. |
| `day-select` | `CustomEvent<ProviderDaySelectDetail>` | Emitted with `{ day, provider }` when a day is chosen on a card, forwarded from that card's grid with the provider attached. Not emitted in handoff mode, where the day emits `book-select` instead. |
| `page-change` | `CustomEvent<PageChangeDetail>` | Emitted with `{ page }` when the patient pages. Zero-indexed, matching the API. The owner of the search is expected to fetch that page and hand back new `providers`; nothing here changes until it does. |
| `provider-select` | `CustomEvent<ProviderSelectDetail>` | Emitted with `{ provider }` when "Book now" is chosen on a card, outside handoff mode. |
| `window-change` | `CustomEvent<AvailabilityWindowDetail>` | Emitted with `{ startDate, endDate }` when the shared window moves. The owner of `availability` is expected to refetch that window; the dates on show move regardless. |

## Methods

| Method | Description |
| --- | --- |
| `goToPage(page: number): void` | Asks for a page. Public so a host page's own pager can drive this one's state. Clamped and deduplicated here rather than trusted: `page` is a settable property, and an out-of-range page is a request the API answers with an empty list — which this component would then render as "no providers match", for a search that matched hundreds. |
| `shiftWindow(direction: -1 \| 1): void` | Moves every card's window at once. Reported, not performed — the same shape as paging. This component never learns the visit reason, so it could not refetch even if it wanted to (COMP-002); `availability-start` moves so the dates on show are honest immediately, and whoever owns the request is expected to answer with new `availability` for that window. |

## CSS Parts

| Part | Description |
| --- | --- |
| `availability-day` | One day cell inside a card's grid. |
| `availability-days` | The day list inside a card's grid. |
| `availability-empty` | A card's no-availability message. |
| `empty` | The message shown when there are no providers. |
| `header` | The count line and the window control together, present only with availability. |
| `header-skeleton` | The placeholder count and window control while `loading` is set. |
| `list` | The list wrapper. |
| `loading` | The status line announced while `loading` is set. |
| `pager` | The paging controls. |
| `pager-next` | The button going forward a page. |
| `pager-position` | The line saying which page this is. |
| `pager-previous` | The button going back a page. |
| `provider` | One provider's card. |
| `provider-availability` | One card's availability grid. |
| `provider-badges` | The per-card slot for anything `renderBadges` adds. |
| `provider-detail` | The text column beside the photo. |
| `provider-insurance` | The network line, when `insurance-name` is set. |
| `provider-location` | The distance and address, or the video-visit line. |
| `provider-name` | The provider's display name and credential. |
| `provider-photo` | The provider's photo, unless `hide-photos` is set. |
| `provider-specialty` | The provider's primary specialty. |
| `provider-summary` | The summary block for one provider. |
| `results` | The header and list together; `aria-busy` while `loading` is set. |
| `skeleton` | One placeholder card while `loading` is set. |
| `summary` | The line counting what the search found. |
| `window` | The shared availability window control. |
| `window-next` | The control stepping the window forward. |
| `window-previous` | The control stepping the window back. |
| `window-range` | The dates the window covers. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
