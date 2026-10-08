import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .panel {
    display: grid;
    gap: 1rem;

    /* The panel takes focus after a successful sign-in (A11Y-003), so it needs a visible ring. */
    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: 2px;
    }
  }

  .heading {
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    ::slotted(*) {
      margin: 0;
    }
  }

  /*
   * Stays mounted in every state so a screen reader is already watching it when "Signing in…"
   * arrives (A11Y-002). Empty, it takes no room.
   */
  .status {
    margin: 0;
  }

  .form {
    display: grid;
    gap: 0.75rem;
    justify-items: start;

    /* The field takes the panel's width; the button keeps its own. */
    .email {
      justify-self: stretch;
    }
  }

  .help {
    margin: 0;
  }
`;
