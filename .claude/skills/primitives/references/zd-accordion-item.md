# zd-accordion-item

A single collapsible section of an accordion: a heading that expands to reveal its content.

**Class** `ZdAccordionItem` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-accordion-item></zd-accordion-item>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the emitted click event. | `CoreAccordionItem` |
| `expand-icon-position` | `expandIconPosition` | `'start' \| 'end'` | — | Determines whether the expand icon position: 'start' or 'end'. | `CoreAccordionItem` |
| `heading` | `heading` | `string` | — | The content of the toggle element. Can be used in lieu of the slot if only a string is needed. | `CoreAccordionItem` |
| `heading-level` | `headingLevel` | `number \| undefined` | — | The header level value (1-6) for summary, when summary is rendered as a header. | `CoreAccordionItem` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `accordion-item-after-hide` | `Event` | Emitted after the accordion item has hidden and all animations are complete. | `CoreAccordionItem` |
| `accordion-item-after-show` | `Event` | Emitted after the accordion item has shown and all animations are complete. | `CoreAccordionItem` |
| `accordion-item-hide` | `Event` | Emitted when the accordion item begins to hide. | `CoreAccordionItem` |
| `accordion-item-show` | `Event` | Emitted when the accordion item begins to show. | `CoreAccordionItem` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
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

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-accordion-item-base` | The wrapper element. | `CoreAccordionItem` |
| `zd-accordion-item-chevron` | The expand/collapse icon. | `CoreAccordionItem` |
| `zd-accordion-item-end` | The end slot container. | `CoreAccordionItem` |
| `zd-accordion-item-heading` | The heading element. | `CoreAccordionItem` |
| `zd-accordion-item-icon` | The wrapper element for the expand/collapse icon. | `CoreAccordionItem` |
| `zd-accordion-item-start` | The start slot container. | `CoreAccordionItem` |
| `zd-accordion-item-summary` | The summary element. | `CoreAccordionItem` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-accordion-item-animation-duration` | — | — | The duration of the accordion item animation. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-animation-timing-function` | — | — | The timing function of the accordion item animation. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-bg-color` | — | — | Sets background color. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-border-color` | — | — | Sets border color. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-border-width` | — | — | Sets border width. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-disabled-bg-color` | — | — | Sets background color of accordion-item when disabled. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-disabled-border-color` | — | — | Sets border color of accordion-item when disabled. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-disabled-fg-color` | — | — | Sets foreground color of accordion-item when disabled. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-fg-color` | — | — | Sets foreground color. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-hide-transition` | — | — | The transition applied to the content when the item closes. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-hover-bg-color` | — | — | Sets background color of accordion-item when hovered. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-hover-border-color` | — | — | Sets border color of accordion-item when hovered. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-hover-fg-color` | — | — | Sets foreground color of accordion-item when hovered. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-icon-collapsed-transform` | — | — | Sets the transform for the orientation of the icon when collapsed. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-icon-expanded-transform` | — | — | Sets the transform for the orientation of the icon when expanded. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-icon-transition` | — | — | The transition for the icon when the state changes. | `CoreAccordionItem` |
| `--zd-charm-accordion-item-show-transition` | — | — | The transition applied to the content when the item opens. | `CoreAccordionItem` |
