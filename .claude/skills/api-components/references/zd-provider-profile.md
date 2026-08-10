# zd-provider-profile

The whole of one provider location, as a page rather than a card. Presentational only — it
fetches nothing, so it has no request state and needs no token.

Everything it renders comes off the `provider` property, which is exactly the
`ProviderLocation` that `zd-provider-results` emits on `provider-select`, so wiring the two
together is one assignment and no translation (COMP-002). It emits nothing: there is
nothing here to decide.

**Sections are dropped, not blanked.** Every field under `Provider` but `provider_id` is
optional, and production populates them unevenly — a location with no `statement` and no
`credentials` is ordinary, not broken. A section whose data is absent renders nothing at
all, so a sparse provider reads as brief rather than as a page of empty headings.

**What it deliberately does not render.** The production profile also carries reviews, a
ratings summary, an insurance list, a map, and the "Patients often return" highlights. None
of them are in this API: there is no reviews or ratings endpoint, `accepts_patient_insurance`
answers about one plan rather than listing the accepted ones, and the highlights are derived
from Zocdoc's own booking history. Rather than invent them, this component leaves holes where
they belong — see the `highlights`, `reviews`, and `faqs` slots — so a host page that has
that data can drop it in and one that does not gets a shorter page instead of a wrong one.

The network line is not among them, and its absence is a policy choice rather than an
oversight: `accepts_patient_insurance` is answered relative to the plan the *search* sent, and
this component never sees a search. "In-network" with nothing to be in the network of is a
coverage claim a patient could take to an appointment and be billed for, so it is not
renderable from here at all.

**Heading levels.** The provider's name is an `<h2>` and each section heading an `<h3>`, which
assumes the embedding page owns the `<h1>` — the same assumption `zd-booking-flow` makes of its
step heading. Slotted content should continue at `<h3>` so the outline stays walkable.

**Why the `<article>` matters.** Everything is wrapped in one, named by the provider's own
heading. It is the honest element for a self-contained composition a page lists several of, and
it is also what makes the `<header>` and the `<address>` inside it legal: both are defined
relative to their nearest sectioning ancestor, so without the article they would describe the
embedding *page* — a `banner` landmark and a set of contact details that are not the host's.

**Class** `ZdProviderProfile` — **Module** `src/components/provider-profile/provider-profile.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-provider-profile></zd-provider-profile>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `show-photo` | `showPhoto` | `boolean` | `false` | Renders the provider's photo. Off by default for the same reason `zd-provider-results` defaults it off: `provider_photo_url` points at Zocdoc's image CDN rather than the configured `baseUrl`, so painting it makes an outbound request to a host PHI-003 does not otherwise allow. A host page that wants production parity opts in knowingly. |
| — | `provider` | `ProviderLocation \| undefined` | — | The location to describe. `ProviderLocation` and not `Provider`, because half of what a profile says is about *where* — the address, the practice, the phone number, whether it is a video visit — and a provider practising at three locations has three of those. It is also the shape every other component in this package passes around, so nothing has to be unpacked to get here. |

## Slots

| Slot | Description |
| --- | --- |
| `actions` | Beside the name in the header, for the Share and Save controls the production header carries. Both are host concerns — neither is API data. |
| `faqs` | Placed last, matching the production profile's own order. |
| `highlights` | Placed under the header, where the production profile puts its "Patients often return" highlights. Nothing in this API supplies them. |
| `reviews` | Placed after the last section. There is no reviews endpoint; a host page with its own reviews puts them here, including their own `<h3>`. |

## CSS Parts

| Part | Description |
| --- | --- |
| `about` | The section carrying the provider's own statement. |
| `address` | The street address. |
| `certifications` | The certifications section. |
| `contact` | The `<address>` holding all three. |
| `education` | The education section. |
| `header` | The photo, name, specialty, and address together. |
| `header-location` | The address under the name, or the video-visit line. |
| `identity` | The text column beside the photo. |
| `languages` | The languages section. |
| `list` | The list inside languages, certifications, or education. |
| `list-item` | One entry in that list. |
| `location` | The practice, address, and phone section. |
| `name` | The provider's name and credential, as an `<h2>`. |
| `phone` | The practice's phone number, as a `tel:` link. |
| `photo` | The provider's photo, when `show-photo` is set. |
| `place` | One line naming the office or the practice. |
| `profile` | The `<article>` wrapping the whole profile, and the element every section is spaced by. |
| `section` | Every section, so one rule can space them all. |
| `section-heading` | A section's `<h3>`. |
| `specialty` | The provider's primary specialty. |
| `statement` | The statement itself. |
