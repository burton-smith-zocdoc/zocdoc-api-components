# zd-avatar

Displays an image or initials representing a person.

**Class** `ZdAvatar` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-avatar></zd-avatar>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `image` | `image` | `string` | — | The image URL for the user's avatar. | `CoreAvatar` |
| `initials` | `initials` | `string` | — | The initials of the represented user. | `CoreAvatar` |
| `label` | `label` | `string` | — | The alt text for the avatar. | `CoreAvatar` |
| `loading` | `loading` | `'eager' \| 'lazy'` | `'eager'` | Indicates how the browser should load the avatar's image. | `CoreAvatar` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `avatar-error` | `Event` | Emitted when the avatar's image fails to load. When this fires, the avatar falls back to the initials or default icon. | `CoreAvatar` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `image` | Utilized for specifying a custom image to be used as the avatar. | `CoreAvatar` |
| `status-indicator` | Provides an indicator on the avatar, commonly using a badge or an icon element. This component should have a `label` provided for assistive technologies. | `CoreAvatar` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-avatar-background` | A wrapper around the default slot and image. | `CoreAvatar` |
| `zd-avatar-base` | A wrapper for the entire avatar. | `CoreAvatar` |
| `zd-avatar-icon` | A wrapper for the default slot fallback when no image or initials are present. | `CoreAvatar` |
| `zd-avatar-image` | The image tag for the avatar. | `CoreAvatar` |
| `zd-avatar-initials` | A wrapper for the user initials. | `CoreAvatar` |
| `zd-avatar-status-container` | A wrapper for the status indicator. | `CoreAvatar` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-avatar-bg-color` | — | — | determine the background color. | `CoreAvatar` |
| `--zd-charm-avatar-border-radius` | — | — | determine a round or square shape of the avatar. | `CoreAvatar` |
| `--zd-charm-avatar-fg-color` | — | — | determine the initials text color. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-bg-color` | — | — | determine the background color of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-border-color` | — | — | determine the border color of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-border-radius` | — | — | determine the border radius of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-border-width` | — | — | determine the border width of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-fg-color` | — | — | determine the color of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-indicator-size` | — | — | determine the size of the status indicator. | `CoreAvatar` |
| `--zd-charm-avatar-size` | — | — | determine the avatar size. | `CoreAvatar` |
