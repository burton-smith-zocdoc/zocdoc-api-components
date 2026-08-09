# STYLE-002: No BEM or naming conventions

Do not use BEM (`block__element--modifier`), OOCSS, SMACSS, or any other CSS naming methodology. Shadow DOM provides style encapsulation, making these conventions unnecessary and verbose.

Use plain, semantic class names that describe the element's role. Nest states and variants with `&` instead of encoding them in the class name.

**Do:**

```css
.card {
  padding: var(--zd-spacing-4);

  &.selected {
    border-color: var(--zd-color-primary);
  }

  .title {
    font-weight: var(--zd-font-weight-bold);
  }

  .actions {
    display: flex;
    gap: var(--zd-spacing-2);
  }
}
```

**Don't:**

```css
/* ❌ BEM naming — unnecessary inside shadow DOM */
.card__title {
  font-weight: var(--zd-font-weight-bold);
}

.card__actions {
  display: flex;
  gap: var(--zd-spacing-2);
}

.card--selected {
  border-color: var(--zd-color-primary);
}
```

## Why

- **Shadow DOM isolates styles.** Class collisions across components can't happen, so the namespacing BEM provides is redundant.
- **Nesting expresses structure.** `.card .title` inside a nest is shorter and reads as "title inside card" without encoding the relationship in the name.
- **Modifiers become states.** `&.selected` or `&:disabled` nested under the element reads naturally and keeps related rules together.

See also: [STYLE-001](STYLE-001.md)
