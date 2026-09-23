# zd-skeleton

A placeholder shown while content is loading.

**Class** `ZdSkeleton` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-skeleton></zd-skeleton>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `animation` | `animation` | `'none' \| 'wave' \| 'pulse'` | — | The animation type of the Skeleton. | `CoreSkeleton` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `shape` | `shape` | `'rect' \| 'circle'` | — | The shape of the Skeleton. | `CoreSkeleton` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-skeleton-base` | the component's base wrapper | `CoreSkeleton` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-skeleton-animation` | — | — | the animation for the skeleton. | `CoreSkeleton` |
| `--zd-charm-skeleton-bg-color` | — | — | the background color for the skeleton. | `CoreSkeleton` |
| `--zd-charm-skeleton-bg-size` | — | — | the background image size for pulse or wave animations. | `CoreSkeleton` |
| `--zd-charm-skeleton-border-radius` | — | — | the border radius for the skeleton. | `CoreSkeleton` |
| `--zd-charm-skeleton-min-height` | — | — | minimum height of the skeleton. | `CoreSkeleton` |
| `--zd-charm-skeleton-sheen-color` | — | — | the background color for the skeleton when there is animation. | `CoreSkeleton` |
| `--zd-charm-skeleton-width` | — | — | the width of the skeleton. | `CoreSkeleton` |
