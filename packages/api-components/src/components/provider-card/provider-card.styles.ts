import { css } from 'lit';

export default css`
  :host {
    display: block;
    --zd-avatar-size: 96px;
  }

  .wrapper-card {
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
    }
  }

  .specialty,
  .location,
  .insurance {
    color: var(--zd-color-text-secondary, #666);
    font-size: var(--zd-font-size-sm, 0.875rem);
    margin: 0;
    padding: 0;
    line-height: 1;
  }

  ::slotted([slot='availability']) {
    flex: 1 1 300px;
  }
`;
