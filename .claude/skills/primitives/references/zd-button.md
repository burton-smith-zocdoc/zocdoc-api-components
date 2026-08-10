# zd-button

An interactive button, with a variant per visual treatment and two densities.

**Class** `ZdButton` — **Module** `src/components/button/button.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-button></zd-button>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `fluid` | `fluid` | `boolean \| undefined` | — | Stretch the button to the width of its container. Charm's button is `display: inline-block` with a full-width `.control`, so this only has to widen the host. |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The button's density. `small` swaps in the theme's `button.small.*` metrics; `default` and an omitted value both use the base metrics. |
| `variant` | `variant` | `'inverse' \| 'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link' \| undefined` | `'secondary'` | The button's visual treatment. Omit it to use the base `button.*` tokens, which is what an unstyled Charm button renders. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `allow-wrap` | `allowWrap` | `boolean` | `false` | An optional toggle that allows text to wrap. Helper for longer text scenarios. | `CoreButton` |
| `autofocus` | `autofocus` | `boolean` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `current` | `current` | `'page' \| 'step' \| 'location' \| 'date' \| 'time' \| 'true' \| 'false' \| null \| undefined` | — | Sets "aria-current" on the internal button or link. | `CoreButton` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean \| undefined` | — | Disables the component on page load. | `CoreButton` |
| `download` | `download` | `string \| undefined` | — | Downloads the linked file as the filename. Only used when `href` is set. | `CoreButton` |
| `expanded` | `expanded` | `boolean \| undefined` | — | Sets "aria-expanded" on the internal button or link. | `CoreButton` |
| `hides` | `hides` | `string \| undefined` | — | referencing a dismissible element's ID, this button will hide it when clicked | `CoreButton` |
| `href` | `href` | `string \| undefined` | — | When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. | `CoreButton` |
| `icon-only` | `iconOnly` | `boolean \| undefined` | — | Allows component to render using only the icon as visual element. Optional, default is false, associated attribute is 'icon-only' | `CoreButton` |
| `name` | `name` | `string \| undefined` | — | An optional name for the button. Ignored when `href` is set. | `CoreButton` |
| `pressed` | `pressed` | `boolean \| undefined` | — | Sets "aria-pressed" on the internal button or link. | `CoreButton` |
| `referrerpolicy` | `referrerPolicy` | `'no-referrer' \| 'no-referrer-when-downgrade' \| 'origin' \| 'origin-when-cross-origin' \| 'same-origin' \| 'strict-origin' \| 'strict-origin-when-cross-origin' \| 'unsafe-url' \| (string & {})` | `'strict-origin-when-cross-origin'` | Defining which referrer is sent when fetching the resource. Only applies to links. | `CoreButton` |
| `shows` | `shows` | `string \| undefined` | — | referencing a dismissible element's ID, this button will show it when clicked | `CoreButton` |
| `target` | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| (string & {}) \| undefined` | — | Tells the browser where to open the link. Only used when `href` is set. | `CoreButton` |
| `toggle` | `toggle` | `boolean` | `false` | Allows a toggling behavior on the component that emits change event if not disabled. Only when is a button. | `CoreButton` |
| `toggles` | `toggles` | `string \| undefined` | — | referencing a dismissible element's ID, this button will show/hide it when clicked | `CoreButton` |
| `type` | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Allows the component to be treated standalone or part of a form. The type of button. When the type is `submit`, the button will submit the surrounding form. Note that the default value is `button` instead of `submit`, which is opposite of how native `<button>` elements behave. | `CoreButton` |
| `value` | `value` | `string \| undefined` | — | An optional value for the button. Ignored when `href` is set. | `CoreButton` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `unknown` | Custom event that indicates when focus is lost. | `CoreButton` |
| `change` | `unknown` | Custom event that indicates the current toggling state through e.target.pressed. | `CoreButton` |
| `focus` | `unknown` | Custom event that indicates when focus is gained. | `CoreButton` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The button's content. | `CoreButton` |
| `end` | A presentational suffix icon or similar element. | `CoreButton` |
| `start` | A presentational prefix icon or similar element. | `CoreButton` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `button-control` | The component's base wrapper. | `CoreButton` |
| `content` | The button's label. | `CoreButton` |
| `end` | The container that wraps the suffix. | `CoreButton` |
| `start` | The container that wraps the prefix. | `CoreButton` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-button-active-bg-color` | — | — | Sets the background color of the button when active. | `CoreButton` |
| `--zd-button-active-border-color` | — | — | Sets the border color of the button when active. | `CoreButton` |
| `--zd-button-active-fg-color` | — | — | Sets button's text color when active. | `CoreButton` |
| `--zd-button-active-shadow` | — | — | Sets button's box-shadow when active. | `CoreButton` |
| `--zd-button-bg-color` | — | — | Sets the background color of the button. | `CoreButton` |
| `--zd-button-border-color` | — | — | Sets the border color of the button. | `CoreButton` |
| `--zd-button-border-radius` | — | — | Sets button's border-radius. | `CoreButton` |
| `--zd-button-border-style` | — | — | Sets the border style of the button. | `CoreButton` |
| `--zd-button-border-width` | — | — | Sets the border width of the button. | `CoreButton` |
| `--zd-button-content-alignment` | — | — | Sets the alignment of the button content. | `CoreButton` |
| `--zd-button-content-gap` | — | — | Determines the spacing between the slots. | `CoreButton` |
| `--zd-button-disabled-bg-color` | — | — | Sets the background color of the button when disabled. | `CoreButton` |
| `--zd-button-disabled-border-color` | — | — | Sets the border color of the button when disabled. | `CoreButton` |
| `--zd-button-disabled-cursor` | — | — | Sets the cursor style when disabled. | `CoreButton` |
| `--zd-button-disabled-fg-color` | — | — | Sets button's text color when disabled. | `CoreButton` |
| `--zd-button-disabled-shadow` | — | — | Sets button's box-shadow when disabled. | `CoreButton` |
| `--zd-button-fg-color` | — | — | Sets button's text color. | `CoreButton` |
| `--zd-button-focus-bg-color` | — | — | Sets the background color of the button when focused. | `CoreButton` |
| `--zd-button-focus-border-color` | — | — | Sets the border color of the button when focused. | `CoreButton` |
| `--zd-button-focus-fg-color` | — | — | Sets button's text color when focused. | `CoreButton` |
| `--zd-button-focus-shadow` | — | — | Sets button's box-shadow when focused. | `CoreButton` |
| `--zd-button-font-weight` | — | — | Sets the font weight of the button. | `CoreButton` |
| `--zd-button-hover-bg-color` | — | — | Sets the background color of the button when hovered. | `CoreButton` |
| `--zd-button-hover-border-color` | — | — | Sets the border color of the button when hovered. | `CoreButton` |
| `--zd-button-hover-fg-color` | — | — | Sets button's text color when hovered. | `CoreButton` |
| `--zd-button-hover-shadow` | — | — | Sets button's box-shadow when hovered. | `CoreButton` |
| `--zd-button-icon-padding-x` | — | — | Sets the horizontal padding for icon-only buttons. | `CoreButton` |
| `--zd-button-icon-padding-y` | — | — | Sets the vertical padding for icon-only buttons. | `CoreButton` |
| `--zd-button-icon-size` | — | — | Sets the height and width of the slotted icon and svg. | `CoreButton` |
| `--zd-button-padding-x` | — | — | Determines left and right padding. | `CoreButton` |
| `--zd-button-padding-y` | — | — | Determines top and bottom padding. | `CoreButton` |
| `--zd-button-pressed-bg-color` | — | — | Sets the background color of the button when toggled. | `CoreButton` |
| `--zd-button-pressed-border-color` | — | — | Sets the border color of the button when toggled. | `CoreButton` |
| `--zd-button-pressed-fg-color` | — | — | Sets button's text color when toggled. | `CoreButton` |
| `--zd-button-shadow` | — | — | Sets button's box-shadow. | `CoreButton` |
