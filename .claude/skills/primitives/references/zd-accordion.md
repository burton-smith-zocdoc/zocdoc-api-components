# zd-accordion

Groups accordion items into a single collapsible region.

**Class** `ZdAccordion` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-accordion></zd-accordion>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |
| `open-single` | `openSingle` | `boolean` | `false` | If set, allows only one child accordion-item to be open at a time. | `CoreAccordion` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-accordion-top-border-color` | — | — | The border top color of the accordion. | `CoreAccordion` |
