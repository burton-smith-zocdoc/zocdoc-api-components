# STYLE-001: Prefer CSS nesting

Nest related rules inside their parent instead of repeating the selector chain. Native CSS nesting is supported in every browser we target and works as-is inside Lit `css` templates — no preprocessor involved.

Nest when the child rule is a variation of the parent:

- pseudo-class and pseudo-element states (`&:hover`, `&:focus-visible`, `&::part(base)`)
- inner parts of the same host rule (`.control` under `:host([variant='link'])`)
- media and container queries scoped to one selector

Reference the parent with `&` explicitly. Keep nesting to two or three levels — deeper means the selector is doing too much.

**Do:**

```css
:host([variant='link']) {
  --zd-button-bg-color: var(--zd-button-link-bg-color);
  --zd-button-fg-color: var(--zd-button-link-fg-color);

  .control {
    text-decoration: var(--zd-button-link-decoration);

    &:hover {
      text-decoration: var(--zd-button-link-hover-decoration);
    }
  }
}

.provider-card {
  padding-inline: var(--zd-spacing-4);

  &:focus-visible {
    outline: 2px solid var(--zd-color-focus);
  }

  @container (width > 40rem) {
    display: grid;
  }
}
```

**Don't:**

```css
/* ❌ Selector chain repeated for every state and descendant */
:host([variant='link']) {
  --zd-button-bg-color: var(--zd-button-link-bg-color);
}

:host([variant='link']) .control {
  text-decoration: var(--zd-button-link-decoration);
}

:host([variant='link']) .control:hover {
  text-decoration: var(--zd-button-link-hover-decoration);
}
```

## Caveats

**Declarations first.** Put a rule's own declarations above its nested rules. Declarations placed after a nested rule are legal in current browsers but read as a mistake and behave surprisingly in older ones.

**Conditions on the host stay in `:host()`.** A nested `&` expands to the full parent selector, so anything that narrows the host itself belongs in the `:host()` argument, not in a nested rule. Selectors that compound extra conditions onto the host — for example `:host([variant='link']:not([disabled])) .control:active` — are clearer left flat than contorted into a nest.

**Don't nest to group.** Nesting expresses "this is a variation of that." Rules that merely appear near each other stay flat; use a comment to group them.

See also: [I18N-003](../i18n/I18N-003.md)
