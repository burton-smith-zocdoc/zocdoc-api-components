# PBZD-003: Use scope.tag() for tag names in templates

Components never hardcode tag names. Templates use static HTML plus the scope helper so the prefix stays configurable. This matches Charm's own convention.

**Do:**

```ts
import { html } from 'lit/static-html.js';

render() {
  return html`
    <${this.scope.tag('button')} variant="primary">
      Book
    </${this.scope.tag('button')}>
  `;
}
```

**Don't:**

```ts
// ❌ Hardcoded prefix breaks if consumers configure a different one
render() {
  return html`<zd-button variant="primary">Book</zd-button>`;
}

// ❌ Hardcoded Charm default prefix
render() {
  return html`<ch-button variant="primary">Book</ch-button>`;
}
```

For tests and Storybook that need a tag name string, import it from the component's registration:

```ts
import { ZdProviderSearch } from './provider-search.js';

// Tag name is computed from baseName + configured prefix
const tagName = `zd-${ZdProviderSearch.baseName}`;
```

See also: [PBZD-001](./PBZD-001.md), [PBZD-002](./PBZD-002.md)
