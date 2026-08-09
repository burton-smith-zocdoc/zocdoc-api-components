# zd-accordion

Groups accordion items into a single collapsible region.

**Class** `ZdAccordion` — **Module** `src/components/accordion/accordion.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-accordion></zd-accordion>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `open-single` | `openSingle` | `boolean \| undefined` | `false` | If set, allows only one child accordion-item to be open at a time. | `CoreAccordion` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The default slot where accordion items are placed. | `CoreAccordion` |
