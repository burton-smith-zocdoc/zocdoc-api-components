# zd-sign-in

Lets a patient sign in with their Zocdoc account, so the booking and appointment components
run under the patient's own token.

**Experimental.** Zocdoc's user authentication isn't available yet, so today this runs
against `createMockPatientAuth()`. The real flow will be a drop-in `PatientAuth`.

There's no password field on purpose. Zocdoc's login page is hosted by Zocdoc, and its
Google and Apple sign-in only work on Zocdoc's domain. A look-alike credential form on a
partner site would also train patients to type their Zocdoc password where phishing pages ask
for it. The optional email only pre-fills Zocdoc's page as `login_hint`.

The component doesn't configure the client. The host passes `auth.getToken` to
`configureZocdoc` itself (COMP-002, COMP-004).

**Class** `ZdSignIn` — **Package** `@zocdoc/api-components`

```html
<zd-sign-in></zd-sign-in>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hide-email` | `hideEmail` | `boolean` | — | Leaves out the optional email field. |
| — | `addEventListener` | `TypedEventTarget<ZdSignInEventMap>['addEventListener']` | — | — |
| — | `auth` | `PatientAuth` | — | What signs the patient in. Required: without it the button is disabled. Setting a new one starts over from idle and completes any sign-in that returned to this page. |
| — | `email` | `string` | — | The email field's value, sent to Zocdoc as `login_hint`. Property-only so it never lands in the DOM, where it would end up in a screenshot or a page cache (PHI-001). It's still sent when `hide-email` is set, so a host that already knows it can pre-fill Zocdoc's page. |
| — | `removeEventListener` | `TypedEventTarget<ZdSignInEventMap>['removeEventListener']` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `sign-in-complete` | `Event` | Emitted with `{}` once the patient is signed in. Read the token through `auth.getToken`. |
| `sign-in-error` | `Event` | Emitted with `{ error }` when signing in, or completing a returned sign-in, fails. |

## Slots

| Slot | Description |
| --- | --- |
| `heading` | Replaces the default "Sign in to manage your appointments" heading. Slot an empty element to drop it, for example inside a dialog that has its own. |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-email` | The optional email field. |
| `zd-error` | The alert shown when sign-in fails. |
| `zd-form` | The sign-in form. |
| `zd-heading` | The heading wrapper. |
| `zd-help` | The line saying sign-in finishes on Zocdoc. |
| `zd-panel` | The container, and the focus target after a successful sign-in. |
| `zd-retry` | The button in the alert that returns to the form. |
| `zd-status` | The polite live region announcing loading and success. |
| `zd-submit` | The "Continue with Zocdoc" button. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
