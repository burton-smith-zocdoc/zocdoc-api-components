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
    border: 1px solid
      light-dark(var(--zd-color-neutral-200, #e5e5e5), var(--zd-color-neutral-700, #525252));
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
    border-inline-end: 1px solid
      light-dark(var(--zd-color-neutral-200, #e5e5e5), var(--zd-color-neutral-800, #555));
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
        color: light-dark(
          var(--zd-color-neutral-400, #a3a3a3),
          var(--zd-color-neutral-500, #8a8a8a)
        );
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

    & p {
      margin: 0;
    }
  }

  /*
   * The skeleton cards replace the spinner, so the spinner goes and the message is kept for
   * screen readers only — it's the one announcement for the whole loading state.
   */
  [part~='loading'] {
    display: none;
  }

  [part~='loading-message'] {
    block-size: 1px;
    clip-path: inset(50%);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }

  /*
   * Laid out like zd-provider-results, which renders straight below this component, so nothing
   * moves when the real results replace these. No margin of its own for the same reason.
   */
  .loading-results {
    display: grid;
    gap: 0.75rem;

    /* The separation zd-provider-results gives each card's grid. */
    .provider-availability {
      display: block;
      margin-block-start: 0.75rem;
    }

    /* Stands in for the results count and the window control above the cards. */
    .loading-header {
      align-items: center;
      column-gap: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .skeleton {
      --zd-skeleton-min-height: 1.25rem;
      --zd-skeleton-width: 100%;
      display: block;

      &.summary {
        inline-size: 6rem;
      }

      &.window {
        --zd-skeleton-min-height: 2.75rem;
        inline-size: 16rem;
        margin-inline-start: auto;
        max-inline-size: 100%;
      }

      @media (prefers-reduced-motion: reduce) {
        &::part(skeleton-base) {
          animation: none;
        }
      }
    }
  }

  [part='submit'] {
    --zd-button-border-radius: var(--zd-form-control-border-radius);
    --zd-button-icon-padding-x: var(--zd-spacing-16, 16px);
    --zd-button-icon-padding-y: var(--zd-spacing-16, 16px);
  }
`;
