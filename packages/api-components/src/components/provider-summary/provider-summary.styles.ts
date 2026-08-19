import { css } from 'lit';

export default css`
  :host {
    display: flex;
    gap: var(--zd-spacing-md, 0.75rem);
    align-items: flex-start;
  }

  [part='photo'] {
    flex-shrink: 0;
    --zd-avatar-size: 3.5rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-xs, 0.25rem);
    min-inline-size: 0;
  }

  .name {
    font-weight: var(--zd-font-weight-semibold, 600);
  }

  /*
   * Secondary text, one step darker than Charm's --zd-surface-default-secondary-fg-color, which is
   * light-dark(neutral-600, neutral-400) — neutral-600 (#919090) is 3.18:1 on white and fails AA
   * for text this size (A11Y-001). neutral-700 (#737373) clears 4.5:1; the dark side is the theme's.
   */
  .specialty,
  .location,
  .insurance {
    color: light-dark(var(--zd-color-neutral-700, #737373), var(--zd-color-neutral-400, #c0bfbf));
    font-size: var(--zd-font-size-sm, 0.875rem);
  }

  .location,
  .insurance {
    display: inline-flex;
    align-items: center;
    gap: var(--zd-spacing-xs, 0.25rem);

    [name] {
      flex-shrink: 0;
      width: 1em;
      height: 1em;

      &::part(icon-base) {
        width: 100%;
        height: 100%;
      }
    }
  }
`;
