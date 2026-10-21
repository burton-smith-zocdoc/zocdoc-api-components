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
| `busy` | `busy` | `boolean` | `false` | Set while whoever is listening to `patient-submit` is still working on it. A booking is not idempotent: a second `POST /v1/appointments` books a second appointment. The listener has to guard that itself, but a Continue button that stays live and silent through a slow request is an invitation to press it again, so the form that owns the button owns disabling it. `submit()` refuses too, which covers the Enter key — Charm's inputs call `requestSubmit()` without consulting the button. |
| — | `insurancePlanId` | `string` | — | The insurance plan the patient chose while searching, sent as `patient.insurance.insurance_plan_id`. The form does not offer a plan picker of its own: the plan was already chosen to filter the search, and asking again here invites a second answer that disagrees with the first. Setting it shows the insurance group, so the patient can add a member ID. Insurance details are PHI, so like `values` this is `attribute: false`. |
| — | `notes` | `string` | `''` | Free-text notes for the practice, capped at {@link NOTES_MAX_LENGTH}. Optional, and omitted from the event entirely when empty rather than sent as `''`. Patient-authored, so it is PHI as much as the demographics are, and `attribute: false` for the same reason. |
| — | `requiredFields` | `readonly string[]` | — | The provider location's `booking_requirements.required_fields`, passed through as the API returns them. A location that lists the plan or member ID path rejects a booking without it, so the form requires those fields rather than letting the patient reach a `400` at the last step. Paths the form does not recognise are ignored, since it cannot collect them. |
| — | `values` | `Record<string, string>` | — | The collected values, keyed by API field name. Public so a host page can prefill from an account it already has, and so tests can set ten fields without ten interactions. `attribute: false` is the PHI guard, not a convenience: an observed attribute would let a patient's name be written into the DOM as markup, and a reflected one would put it there on every keystroke. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `patient-submit` | `CustomEvent<PatientSubmitDetail>` | Emitted with `{ patient, notes }` once every field is valid. Not emitted at all when validation fails, so a listener never sees a partial patient. |

## Methods

| Method | Description |
| --- | --- |
| `submit(): void` | Validates every field and emits `patient-submit` when all of them pass. Public so the host page or a coordinating parent can trigger it from its own Continue button. |

## CSS Parts

| Part | Description |
| --- | --- |
| `about` | The name, date of birth, and sex at birth group. |
| `address` | The address group. |
| `address1` | The street address field. |
| `city` | The city field. |
| `contact` | The phone and email group. |
| `date-of-birth` | The date of birth field. |
| `email-address` | The email address field. |
| `first-name` | The first name field. |
| `form` | The form element. |
| `insurance` | The insurance group. Rendered only when a plan is set or the provider location requires insurance. |
| `insurance-member-id` | The insurance member ID field. |
| `insurance-required` | The notice shown when the location requires an insurance plan and none was chosen. |
| `last-name` | The last name field. |
| `notes` | The optional notes field. |
| `phone-number` | The phone number field. |
| `sex-at-birth` | The sex at birth select. |
| `state` | The state field. |
| `submit` | The submit button. |
| `zip-code` | The ZIP code field. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
