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
    padding: var(--zd-spacing-12, 12px) var(--zd-spacing-16, 16px);
    background: var(--zd-surface-default-bgColor, #fff);
    border-radius: var(--zd-borderRadius-xl, 12px);
    box-shadow: var(--zd-shadow-raised);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--zd-spacing-4, 4px);
    flex: 1 1 10rem;
    min-width: 8rem;
    padding-inline-end: var(--zd-spacing-16, 16px);
    border-inline-end: 1px solid var(--zd-border-light, #e5e5e5);
    position: relative;

    &:last-of-type {
      border-inline-end: none;
      padding-inline-end: 0;
    }

    & label {
      font-size: var(--zd-typography-label-lg-fontSize, 14px);
      font-weight: var(--zd-typography-label-lg-fontWeight, 600);
      color: var(--zd-formControl-helpText-color, #525252);
      line-height: var(--zd-typography-label-lg-lineHeight, 1.25);
    }

    & select,
    & input {
      appearance: none;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: var(--zd-typography-body-md-fontSize, 16px);
      font-weight: var(--zd-typography-body-md-fontWeight, 400);
      line-height: var(--zd-typography-body-md-lineHeight, 1.625);
      color: var(--zd-body-fgColor, #171717);
      width: 100%;
      padding: 0;
      cursor: pointer;

      &::placeholder {
        color: var(--zd-formControl-placeholderColor, #a3a3a3);
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline: var(--zd-focus-outlineWidth, 2px) solid var(--zd-focus-outlineColor, #4e93f3);
        outline-offset: var(--zd-focus-outlineOffset, 2px);
        border-radius: var(--zd-borderRadius-sm, 4px);
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
`;
