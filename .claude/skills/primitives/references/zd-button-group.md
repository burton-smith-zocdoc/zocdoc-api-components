# zd-button-group

Groups related buttons together with connected styling.

**Class** `ZdButtonGroup` — **Module** `src/components/button-group/button-group.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-button-group></zd-button-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string \| undefined` | — | A label to use for the button group's aria-label attribute. | `CoreButtonGroup` |
| `select` | `select` | `'single' \| 'multiple' \| null \| undefined` | — | When set to 'single', only one button in the group can be selected at a time, multiple buttons can be selected when set to 'multiple' | `CoreButtonGroup` |
| `split` | `split` | `boolean \| undefined` | — | Splits the buttons in the group by removing gap and border radius | `CoreButtonGroup` |
| `toolbar` | `toolbar` | `boolean \| undefined` | — | When set, the button group will behave like a toolbar with a roving tab index, arrow keyboard interaction, and a role of toolbar | `CoreButtonGroup` |
| `vertical` | `vertical` | `boolean \| undefined` | — | Vertically stacks the buttons in the group | `CoreButtonGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `unknown` | Listens for change events from child buttons when their state changes. | `CoreButtonGroup` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | One or more Button or Menu elements to display in the button group. | `CoreButtonGroup` |
