# zd-availability-window

The range on show with a control on each side — the shared window pager for availability
components.

Uses `formatRange` for the date display, which handles locale-specific formatting like
"Aug 5 – 18" vs "Aug 5 – Aug 18" (I18N-002, I18N-004). Each control uses a ghost icon-only
button with a visually hidden label for accessibility (I18N-001).

**Class** `ZdAvailabilityWindow` — **Module** `src/components/availability-window/availability-window.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-availability-window></zd-availability-window>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `can-go-earlier` | `canGoEarlier` | `boolean` | `true` | Whether there is anywhere earlier to go. False at today, because the API returns nothing in the past and a window behind it comes back empty — which reads as no availability at all. |
| `end-date` | `endDate` | `string` | — | The window's last day, inclusive, as `YYYY-MM-DD`. |
| `start-date` | `startDate` | `string` | — | The window's first day, as `YYYY-MM-DD`. |
| — | `addEventListener` | `TypedEventTarget<ZdAvailabilityWindowEventMap>['addEventListener']` | — | — |
| — | `removeEventListener` | `TypedEventTarget<ZdAvailabilityWindowEventMap>['removeEventListener']` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `window-shift` | `unknown` | Emitted with `{ direction: -1 \| 1 }` when a navigation button is pressed. |

## CSS Parts

| Part | Description |
| --- | --- |
| `window` | The container holding the range and controls. |
| `window-next` | The control moving the range forward. |
| `window-previous` | The control moving the range back. |
| `window-range` | The line naming the range on show. |
