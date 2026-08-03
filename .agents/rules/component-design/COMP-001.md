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
      return html`<slot name="idle">Enter a ZIP code to search</slot>`;
    case 'loading':
      return html`<${this.scope.tag('spinner')}></${this.scope.tag('spinner')}>`;
    case 'empty':
      return html`<p>No providers found in your area.</p>`;
    case 'error':
      return html`
        <${this.scope.tag('alert')} variant="error">
          ${this.errorMessage}
          <${this.scope.tag('button')} @click=${this.retry}>Retry</${this.scope.tag('button')}>
        </${this.scope.tag('alert')}>
      `;
    case 'success':
      return html`...render data...`;
  }
}
```

**Don't:**

```ts
// ❌ Boolean flags — combinatorial explosion, easy to miss a state
@state() private loading = false;
@state() private hasError = false;
@state() private isEmpty = false;
```

See also: [COMP-002](./COMP-002.md), [COMP-003](./COMP-003.md)
