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

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Utilized for specifying the default element, typically an icon. | `CoreAvatar` |
| `image` | Utilized for specifying a custom image to be used as the avatar. | `CoreAvatar` |
| `status-indicator` | Provides an indicator on the avatar, commonly using a badge or an icon element. This component should have a `label` provided for assistive technologies. | `CoreAvatar` |
