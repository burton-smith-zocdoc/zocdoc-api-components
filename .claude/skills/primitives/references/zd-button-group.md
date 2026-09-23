# zd-button-group

Groups related buttons together with connected styling.

**Class** `ZdButtonGroup` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-button-group></zd-button-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string` | — | A label to use for the button group's aria-label attribute. | `CoreButtonGroup` |
| `select` | `select` | `'single' \| 'multiple' \| null` | — | When set to 'single', only one button in the group can be selected at a time, multiple buttons can be selected when set to 'multiple' | `CoreButtonGroup` |
| `split` | `split` | `boolean` | — | Splits the buttons in the group by removing gap and border radius | `CoreButtonGroup` |
| `toolbar` | `toolbar` | `boolean` | — | When set, the button group will behave like a toolbar with a roving tab index, arrow keyboard interaction, and a role of toolbar | `CoreButtonGroup` |
| `vertical` | `vertical` | `boolean` | — | Vertically stacks the buttons in the group | `CoreButtonGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Listens for change events from child buttons when their state changes. | `CoreButtonGroup` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-button-group-base` | The component's base wrapper. | `CoreButtonGroup` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-button-bg-color` | — | — | Sets the background color of the button group when split. | `CoreButtonGroup` |
| `--zd-charm-button-border-color` | — | — | Sets the border color of the button group when split. | `CoreButtonGroup` |
| `--zd-charm-button-border-radius` | — | — | Sets border radius for the button group when split. | `CoreButtonGroup` |
| `--zd-charm-button-border-style` | — | — | Sets the border style of the button group when split. | `CoreButtonGroup` |
| `--zd-charm-button-border-width` | — | — | Sets the border width of the button group when split. | `CoreButtonGroup` |
| `--zd-charm-button-disabled-border-color` | — | — | Sets the border color when disabled and split. | `CoreButtonGroup` |
| `--zd-charm-button-focus-border-color` | — | — | Sets the border color when focused and split. | `CoreButtonGroup` |
| `--zd-charm-button-group-divider-color` | — | — | Sets the divider color when the button is in a button group, defaults to --charm-button-fg-color. | `CoreButtonGroup` |
| `--zd-charm-button-group-divider-height` | — | — | Sets the divider height when the button is in a button group, defaults to 100% for horizontal button groups, 1px for vertical groups. | `CoreButtonGroup` |
| `--zd-charm-button-group-divider-width` | — | — | Sets the divider width when the button is in a button group, defaults to 100% for vertical button groups, 1px for horizontal groups. | `CoreButtonGroup` |
| `--zd-charm-button-group-gap` | — | — | Sets the gap between each button. | `CoreButtonGroup` |
| `--zd-charm-button-hover-border-color` | — | — | Sets the border color when hovered and split. | `CoreButtonGroup` |
| `--zd-charm-button-pressed-bg-color` | — | — | Sets the pressed background color of each button. | `CoreButtonGroup` |
| `--zd-charm-button-pressed-border-color` | — | — | Sets the pressed border color of each button. | `CoreButtonGroup` |
