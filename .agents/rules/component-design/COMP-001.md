# COMP-001: State machine for async components

Every fetching component runs an explicit state machine and renders each state:

```ts
type AsyncState = 'idle' | 'loading' | 'success' | 'empty' | 'error';
```

| State     | Renders                                          |
| --------- | ------------------------------------------------ |
| `idle`    | Initial state before user action triggers fetch  |
| `loading` | Charm `skeleton` or `spinner`                    |
| `success` | The fetched data                                 |
| `empty`   | A real empty state ("no availability in range")  |
| `error`   | Charm `alert` with retry action + emitted event  |

Empty is distinct from error. "No availability in this range" is a routine outcome, not a failure.

**Do:**

```ts
@state() private state: AsyncState = 'idle';
@state() private data: ProviderLocation[] = [];
@state() private errorMessage = '';

render() {
  switch (this.state) {
    case 'idle':
      return this.html`<slot name="idle">Enter a ZIP code to search</slot>`;
    case 'loading':
      return this.html`<scoped-spinner></scoped-spinner>`;
    case 'empty':
      return this.html`<p>No providers found in your area.</p>`;
    case 'error':
      return this.html`
        <scoped-alert variant="error">
          ${this.errorMessage}
          <scoped-button @click=${this.retry}>Retry</scoped-button>
        </scoped-alert>
      `;
    case 'success':
      return this.html`...render data...`;
  }
}
```

**In practice, don't hand-write that switch.** `components/internal/request-state.ts`
already renders idle/loading/empty/error and delegates `success` to a `children`
callback, so a fetching component is:

```ts
public static override get dependencies(): (typeof CharmElement)[] {
  return [...requestStateDependencies];
}

protected override render(): unknown {
  return renderRequestState(this.requestState, {
    emptyMessage: 'No providers found in your area.',
    errorMessage: this.errorMessage,
    loadingMessage: 'Searching…',
    onRetry: () => void this.search(),
    children: () => this.renderResults(),
  });
}
```

Spreading `requestStateDependencies` is required — the helper renders a spinner,
alert, and button that appear in no template you wrote (PBZD-003). Pass
`children: () => nothing` when the component renders its success markup elsewhere.

**Don't:**

```ts
// ❌ Boolean flags — combinatorial explosion, easy to miss a state
@state() private loading = false;
@state() private hasError = false;
@state() private isEmpty = false;
```

See also: [COMP-002](./COMP-002.md), [COMP-003](./COMP-003.md)
