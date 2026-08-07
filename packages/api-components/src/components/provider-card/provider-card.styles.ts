import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .provider-card {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zd-spacing-md, 1rem);
    align-items: flex-start;
  }

  .provider-info {
    display: flex;
    gap: var(--zd-spacing-md, 1rem);
    align-items: flex-start;
    flex: 0 1 auto;
    min-width: 200px;
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
    flex: 1 1 300px;
  }
`;
