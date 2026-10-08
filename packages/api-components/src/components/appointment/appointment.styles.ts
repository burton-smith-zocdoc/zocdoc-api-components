import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .panel {
    display: grid;
    gap: 1rem;

    /* The panel takes focus on every mode change (A11Y-003), so it needs a visible ring. */
    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: 2px;
    }
  }

  .heading {
    margin: 0;
    font-size: 1.25rem;
  }

  .details {
    display: grid;
    gap: 0.5rem;
    margin: 0;

    div {
      display: grid;
      gap: 0.125rem;
    }

    dt {
      font-weight: 600;
    }

    dd {
      margin: 0;
    }
  }

  /* Never display:none or visibility:hidden: that drops the live region from the accessibility tree. */
  .notice {
    margin: 0;
  }

  .cancel-form {
    display: grid;
    gap: 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;
