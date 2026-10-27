import { css } from 'lit';

export default css`
  :host {
    display: block;
    --zd-avatar-size: 96px;
  }

  /* Fill the host so a stretched card (e.g. in a grid row) matches its neighbours. */
  .wrapper-card {
    display: block;
    block-size: 100%;
    cursor: default;
  }

  .provider-card {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zd-spacing-xl, 2rem);
    align-items: flex-start;
  }

  .provider-info {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-md, 1rem);
    justify-content: start;
    flex: 0 1 auto;
    min-width: 200px;

    .provider-profile {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--zd-spacing-md, 1rem);
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: var(--zd-spacing-xs, 0.25rem);
    }
  }

  .name {
    margin: 0;
    padding: 0;
    background: transparent;
    font-size: var(--zd-font-size-lg, 1.125rem);
    font-weight: var(--zd-font-weight-semibold, 600);
    line-height: 1;

    button {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
      text-align: start;
      cursor: pointer;
    }
  }

  /*
   * Secondary text, one step darker than Charm's --zd-surface-default-secondary-fg-color, which is
   * light-dark(neutral-600, neutral-400) — neutral-600 (#919090) is 3.18:1 on white and fails AA
   * for text this size (A11Y-001). neutral-700 (#737373) clears 4.5:1; the dark side is the theme's.
   */
  .specialty,
  .location,
  .insurance,
  .annotation {
    color: light-dark(var(--zd-color-neutral-700, #737373), var(--zd-color-neutral-400, #c0bfbf));
    font-size: var(--zd-font-size-sm, 0.875rem);
    margin: 0;
    padding: 0;
    line-height: 1;
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

  .annotation {
    line-height: var(--zd-line-height-normal, 1.4);

    &.review {
      font-style: italic;
    }

    &.sponsored {
      font-size: var(--zd-font-size-xs, 0.75rem);
      font-weight: var(--zd-font-weight-semibold, 600);
    }
  }

  .book {
    align-self: start;
    margin-block-start: var(--zd-spacing-sm, 0.5rem);
  }

  .visually-hidden {
    block-size: 1px;
    clip: rect(0, 0, 0, 0);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }

  /* Sized to the text and avatar they stand in for, so the card doesn't jump when data lands. */
  .skeleton {
    display: block;
    --zd-skeleton-width: 100%;

    &.photo {
      --zd-skeleton-min-height: var(--zd-avatar-size);
      inline-size: var(--zd-avatar-size);
      block-size: var(--zd-avatar-size);
    }

    /* The name is a button inside the heading, which makes its line taller than the font size. */
    &.name {
      --zd-skeleton-min-height: 1.75rem;
      inline-size: 200px;
    }

    &.line {
      --zd-skeleton-min-height: var(--zd-font-size-sm, 0.875rem);
      inline-size: 7rem;

      &.wide {
        inline-size: 13rem;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton::part(skeleton-base) {
      animation: none;
    }
  }

  ::slotted([slot='availability']) {
    flex: 1 1 300px;
  }
`;
