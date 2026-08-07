import { css } from 'lit';

export default css`
  .provider-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--zd-spacing-md, 1rem);
    align-items: start;
  }

  [part='details'] {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-xs, 0.25rem);
  }

  [part='name'] {
    font-weight: var(--zd-font-weight-semibold, 600);
  }

  [part='specialty'],
  [part='location'],
  [part='insurance'] {
    color: var(--zd-color-text-secondary, #666);
    font-size: var(--zd-font-size-sm, 0.875rem);
  }

  ::slotted([slot='availability']) {
    grid-column: 1 / -1;
  }
`;
