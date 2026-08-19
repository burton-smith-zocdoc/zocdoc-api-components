# zd-avatar

Displays an image or initials representing a person.

**Class** `ZdAvatar` — **Module** `src/components/avatar/avatar.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-avatar></zd-avatar>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `image` | `image` | `string \| undefined` | — | The image URL for the user's avatar. | `CoreAvatar` |
| `initials` | `initials` | `string \| undefined` | — | The initials of the represented user. | `CoreAvatar` |
| `label` | `label` | `string \| undefined` | — | The alt text for the avatar. | `CoreAvatar` |
| `loading` | `loading` | `'eager' \| 'lazy'` | `'eager'` | Indicates how the browser should load the avatar's image. | `CoreAvatar` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `avatar-error` | `unknown` | Emitted when the avatar's image fails to load. When this fires, the avatar falls back to the initials or default icon. | `CoreAvatar` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Utilized for specifying the default element, typically an icon. When no image, initials, or slot content is provided, a default person icon is rendered. | `CoreAvatar` |
| `image` | Utilized for specifying a custom image to be used as the avatar. | `CoreAvatar` |
| `status-indicator` | Provides an indicator on the avatar, commonly using a badge or an icon element. This component should have a `label` provided for assistive technologies. | `CoreAvatar` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `avatar-background` | A wrapper around the default slot and image. | `CoreAvatar` |
| `avatar-base` | A wrapper for the entire avatar. | `CoreAvatar` |
| `avatar-icon` | A wrapper for the default slot fallback when no image or initials are present. | `CoreAvatar` |
| `avatar-image` | The image tag for the avatar. | `CoreAvatar` |
| `avatar-initials` | A wrapper for the user initials. | `CoreAvatar` |
| `avatar-status-container` | A wrapper for the status indicator. | `CoreAvatar` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-avatar-bg-color` | — | — | determine the background color. | `CoreAvatar` |
| `--zd-avatar-fg-color` | — | — | determine the initials text color. | `CoreAvatar` |
| `--zd-avatar-size` | — | — | determine the avatar size. | `CoreAvatar` |
| `--zd-avatar-border-radius` | — | — | determine a round or square shape of the avatar. | `CoreAvatar` |
| `--zd-avatar-indicator-bg-color` | — | — | determine the background color of the status indicator. | `CoreAvatar` |
| `--zd-avatar-indicator-border-width` | — | — | determine the border width of the status indicator. | `CoreAvatar` |
| `--zd-avatar-indicator-border-color` | — | — | determine the border color of the status indicator. | `CoreAvatar` |
| `--zd-avatar-indicator-border-radius` | — | — | determine the border radius of the status indicator. | `CoreAvatar` |
| `--zd-avatar-indicator-fg-color` | — | — | determine the color of the status indicator. | `CoreAvatar` |
| `--zd-avatar-indicator-size` | — | — | determine the size of the status indicator. | `CoreAvatar` |
