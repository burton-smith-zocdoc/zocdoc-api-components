# PBZD-003: Write `<scoped-*>` tags in templates, never a hardcoded prefix

Components never hardcode a tag prefix. Templates rendered with `this.html` write
`<scoped-button>`, and `CharmElement` rewrites the tag to the registered prefix
(`zd-button`) as it renders.

**Do:**

```ts
protected override render(): unknown {
  return this.html`
    <scoped-button variant="primary" @click=${this.onBook}>Book</scoped-button>
  `;
}
```

`this.html` is `CharmElement`'s scoped template tag. It matches `<scoped-*>` and
`</scoped-*>` against the element's own scope, which is why the template does not
have to interpolate anything. Charm's own components (alert, checkbox, dialog,
tooltip) are written the same way.

**Don't:**

```ts
// ❌ Hardcoded prefix — breaks under any prefix but the default
return this.html`<zd-button variant="primary">Book</zd-button>`;

// ❌ Hardcoded Charm default prefix
return this.html`<ch-button variant="primary">Book</ch-button>`;

// ❌ scope.tag() interpolation — this is what <scoped-*> exists to replace.
//    It also drags in lit/static-html.js, which this package imports nowhere.
import { html } from 'lit/static-html.js';
const button = this.scope.tag('button');
return html`<${button} variant="primary">Book</${button}>`;
```

`scope.tag()` is for the cases with no template to hang the rewrite on — a tag
name needed as a string, or a `querySelector`. Reach for it there, not in markup.

## Every `<scoped-*>` needs a matching entry in `dependencies()`

The rewrite renames the tag; it does not register the component. A
`<scoped-radio>` with no `ZdRadio` in `dependencies()` renders an undefined
element: no error, no console warning, an empty box on the page.

```ts
public static override get dependencies(): (typeof CharmElement)[] {
  return [ZdButton, ZdRadioGroup, ZdRadio, ...requestStateDependencies];
}
```

Two traps in that list:

- **`requestStateDependencies` covers tags that appear in no template you wrote.**
  `renderRequestState()` renders the spinner, alert, and retry button itself, so a
  component that calls it must spread the list even though grepping its own
  template for `scoped-` turns up nothing.
- **Slotted children are the caller's to register.** `ZdRadioGroup.dependencies`
  declares only the icon it renders itself, so a component slotting `<scoped-radio>`
  into it lists `ZdRadio` as well.

Registration is idempotent, so listing a class twice costs nothing. Prefer the
repeat to inheriting a class from another component's list — see
`availability-picker.ts`, which relists `ZdButton` rather than relying on
`requestStateDependencies` to keep supplying it.

## The one place a `zd-` prefix is hardcoded

`components/internal/request-state.ts` is a free function, not a component, so it
has no `this.html` and no scope to resolve against. It writes `zd-spinner`,
`zd-alert`, and `zd-button` literally, and its header documents that this ties the
helper to the default prefix. Don't copy the pattern into a component, and don't
"fix" it without giving the function a scope to render through.

## Tag-name strings

For tests and Storybook, compute the name rather than typing it:

```ts
import { ZdProviderSearch } from './provider-search.js';

const tagName = `zd-${ZdProviderSearch.baseName}`;
```

See also: [PBZD-001](./PBZD-001.md), [PBZD-002](./PBZD-002.md)
