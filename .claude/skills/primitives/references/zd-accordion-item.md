# zd-accordion-item

A single collapsible section of an accordion: a heading that expands to reveal its content.

**Class** `ZdAccordionItem` — **Module** `src/components/accordion-item/accordion-item.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-accordion-item></zd-accordion-item>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean \| undefined` | — | Disables the emitted click event. | `CoreAccordionItem` |
| `expand-icon-position` | `expandIconPosition` | `'start' \| 'end' \| undefined` | — | Determines whether the expand icon position: 'start' or 'end'. | `CoreAccordionItem` |
| `heading` | `heading` | `string \| undefined` | — | The content of the toggle element. Can be used in lieu of the slot if only a string is needed. | `CoreAccordionItem` |
| `heading-level` | `headingLevel` | `HeadingLevel \| undefined` | — | The header level value (1-6) for summary, when summary is rendered as a header. | `CoreAccordionItem` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `accordion-item-open-change` | `unknown` | Dispatched when the accordion item is expanded or collapsed. | `CoreAccordionItem` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The collapsible content of the accordion item. | `CoreAccordionItem` |
| `collapse-icon` | Custom collapse icon. If no icon is provided, a default icon will be used. | `CoreAccordionItem` |
| `end` | Content rendered after the content in the toggle element | `CoreAccordionItem` |
| `expand-icon` | Custom expand icon. If no icon is provided, a default icon will be used. | `CoreAccordionItem` |
| `heading` | The content of the toggle element. | `CoreAccordionItem` |
| `start` | Content rendered before the content in the toggle element | `CoreAccordionItem` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |
