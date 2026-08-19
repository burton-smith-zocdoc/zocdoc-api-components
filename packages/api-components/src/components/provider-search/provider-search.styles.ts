import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .search-bar {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: var(--zd-spacing-8, 8px);
    padding-block: var(--zd-spacing-12, 12px);
    padding-inline-start: var(--zd-spacing-24, 24px);
    padding-inline-end: var(--zd-spacing-12, 12px);
    background: light-dark(var(--zd-color-white, #fff), var(--zd-color-neutral-900, #444343));
    border: 1px solid light-dark(var(--zd-color-neutral-200, #e5e5e5), var(--zd-color-neutral-700, #525252));
    border-radius: var(--zd-form-control-border-radius);
    box-shadow: var(--zd-shadow-raised);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-4, 4px);
    flex: 1 1 10rem;
    min-width: 8rem;
    padding-inline-end: var(--zd-spacing-16, 16px);
    border-inline-end: 1px solid light-dark(var(--zd-color-neutral-200, #e5e5e5), var(--zd-color-neutral-800, #555));
    position: relative;

    &:last-of-type {
      border-inline-end: none;
      padding-inline-end: 0;
    }

    & label {
      font-size: var(--zd-typography-label-lg-font-size, 14px);
      font-weight: var(--zd-typography-label-lg-font-weight, 600);
      color: light-dark(var(--zd-color-neutral-700, #525252), var(--zd-color-neutral-300, #b0afaf));
      line-height: var(--zd-typography-label-lg-line-height, 1.25);
    }

    & select,
    & input {
      appearance: none;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: var(--zd-typography-body-md-font-size, 16px);
      font-weight: var(--zd-typography-body-md-font-weight, 400);
      line-height: var(--zd-typography-body-md-line-height, 1.625);
      color: light-dark(var(--zd-color-neutral-900, #171717), var(--zd-color-neutral-50, #fafafa));
      width: 100%;
      padding: 0;
      cursor: pointer;

      &::placeholder {
        color: light-dark(var(--zd-color-neutral-400, #a3a3a3), var(--zd-color-neutral-500, #8a8a8a));
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline: var(--zd-focus-outline-width, 2px) solid var(--zd-focus-outline-color, #4e93f3);
        outline-offset: var(--zd-focus-outline-offset, 2px);
        border-radius: var(--zd-border-radius-sm, 4px);
      }
    }

    & input {
      cursor: text;
    }
  }

  .location {
    flex: 0 1 7rem;
    min-width: 5rem;
  }

  .error-container {
    width: 100%;
    margin-block-start: var(--zd-spacing-8, 8px);
  }

  [part='submit'] {
    --zd-button-border-radius: var(--zd-form-control-border-radius);
    --zd-button-icon-padding-x: var(--zd-spacing-16, 16px);
    --zd-button-icon-padding-y: var(--zd-spacing-16, 16px);
  }
`;
