# zd-patient-form

Collects the patient demographics `POST /v1/appointments` requires, validates them, and
emits them. It never performs a network request — `zd-booking` is what submits, and
keeping the two apart means the form can be reused by a host page that books its own way
(COMP-002).

Everything this component holds is PHI. Two rules follow from that and are load-bearing
in the code below rather than aspirational:

- **No field value ever leaves as text.** Not in a `console` call, not in a thrown error,
  not in a validation message. Messages name the field and state the format; that is
  PHI-001 in practice, and it is why `validate()` builds its strings from
  `FIELDS[field].label` and never from `this.values[field]`.
- **No field value ever reaches an attribute.** `values` and `notes` are both
  `attribute: false`, so nothing here is reflected into markup where `outerHTML`, a DOM
  snapshot, or a session replay tool would pick it up.

**Class** `ZdPatientForm` — **Package** `@zocdoc/api-components`

```html
<zd-patient-form></zd-patient-form>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `busy` | `busy` | `boolean` | — | Set while whoever is listening to `patient-submit` is still working on it. A booking is not idempotent: a second `POST /v1/appointments` books a second appointment. The listener has to guard that itself, but a Continue button that stays live and silent through a slow request is an invitation to press it again, so the form that owns the button owns disabling it. `submit()` refuses too, which covers the Enter key — Charm's inputs call `requestSubmit()` without consulting the button. |
| — | `addEventListener` | `TypedEventTarget<ZdPatientFormEventMap>['addEventListener']` | — | — |
| — | `notes` | `string` | — | Free-text notes for the practice, capped at {@link NOTES_MAX_LENGTH}. Optional, and omitted from the event entirely when empty rather than sent as `''`. Patient-authored, so it is PHI as much as the demographics are, and `attribute: false` for the same reason. |
| — | `removeEventListener` | `TypedEventTarget<ZdPatientFormEventMap>['removeEventListener']` | — | — |
| — | `values` | `Record<string, string>` | — | The collected values, keyed by API field name. Public so a host page can prefill from an account it already has, and so tests can set ten fields without ten interactions. `attribute: false` is the PHI guard, not a convenience: an observed attribute would let a patient's name be written into the DOM as markup, and a reflected one would put it there on every keystroke. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `patient-submit` | `Event` | Emitted with `{ patient, notes }` once every field is valid. Not emitted at all when validation fails, so a listener never sees a partial patient. |

## Methods

| Method | Description |
| --- | --- |
| `submit(): void` | Validates every field and emits `patient-submit` when all of them pass. Public so the host page or a coordinating parent can trigger it, which is also how the flow in Task 15 drives the form from its own Continue button. |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-about` | The name, date of birth, and sex at birth group. |
| `zd-address` | The address group. |
| `zd-address1` | The street address field. |
| `zd-city` | The city field. |
| `zd-contact` | The phone and email group. |
| `zd-date-of-birth` | The date of birth field. |
| `zd-email-address` | The email address field. |
| `zd-first-name` | The first name field. |
| `zd-form` | The form element. |
| `zd-last-name` | The last name field. |
| `zd-notes` | The optional notes field. |
| `zd-phone-number` | The phone number field. |
| `zd-sex-at-birth` | The sex at birth select. |
| `zd-state` | The state field. |
| `zd-submit` | The submit button. |
| `zd-zip-code` | The ZIP code field. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
