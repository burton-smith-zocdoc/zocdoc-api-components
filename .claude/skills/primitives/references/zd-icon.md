# zd-icon

Renders a named icon from the configured icon set, at a token-driven size.

**Class** `ZdIcon` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-icon></zd-icon>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| 'large' \| undefined` | — | The icon's rendered size. Charm's icon is `1em` square, so it scales with whatever text it sits in. That's the right default inside a button or a label, so omitting `size` keeps it. Setting `size` pins the icon to a token instead, for the cases where it stands on its own. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `flip` | `flip` | `'x' \| 'y' \| 'both'` | — | Sets the flip direction of the icon. | `CoreIcon` |
| `label` | `label` | `string` | — | Label of the icon for assertive technologies. This is required for accessibility. | `CoreIcon` |
| `name` | `name` | `string` | — | The name of the icon to draw. | `CoreIcon` |
| `rotate` | `rotate` | `number` | `0` | Sets the rotation degree of the icon. | `CoreIcon` |
| `url` | `url` | `string` | — | A string that points to an external SVG. | `CoreIcon` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `icon-error` | `Event` | Emitted when the icon fails to load. | `CoreIcon` |
| `icon-load` | `Event` | Emitted when the icon has loaded. | `CoreIcon` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-icon-base` | The base of the icon. | `CoreIcon` |
