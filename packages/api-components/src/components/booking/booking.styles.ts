import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .step {
    display: grid;
    gap: 1.5rem;

    /*
     * The dialog's body is the scroll container, so its own padding sits outside the scrollport
     * and the last row of times ends exactly on the clip line. The padding goes on the content
     * instead, where it scrolls with it and gives the final row somewhere to land. The inline end
     * is padded for the same reason — that edge is where the scrollbar sits (I18N-003).
     */
    &.in-dialog {
      padding-block-end: 1rem;
      padding-inline-end: 1rem;
    }

    /*
     * The step is the focus target on every transition (A11Y-003), and a container that
     * takes focus needs a visible ring like anything else. Charm's focus tokens are used
     * rather than the user agent's so it matches the controls inside it.
     */
    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: var(--zd-focus-outline-offset);
    }

    .step-heading {
      font-size: var(--zd-font-size-lg);
      font-weight: var(--zd-font-weight-semibold);
      margin: 0;

      /*
       * The heading inside the dialog is hidden rather than removed: the dialog shows its own
       * title, but the step container is a focus target and this is its accessible name, so a
       * screen reader still announces which step it landed on (A11Y-003).
       *
       * Neither display:none nor visibility:hidden would do — either takes it out of the
       * accessibility tree along with the name.
       */
      &.visually-hidden {
        block-size: 1px;
        clip-path: inset(50%);
        inline-size: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
      }
    }
  }

  /*
   * Back sizes to its label and sits at the inline start, which is where a step's escape
   * hatch belongs in both directions (I18N-003).
   */
  .back {
    justify-self: start;
  }

  /*
   * The grid gap is the only spacing here, so the paragraph's own margin is removed
   * rather than added to it. No colour: the summary sits on whatever background the host
   * page provides, and this component is not in a position to know it contrasts.
   */
  .summary {
    display: grid;
    gap: 0.25rem;

    .summary-time {
      margin: 0;
    }
  }

  /*
   * Mounted for the whole patient step but empty until a booking starts, which is what makes
   * the announcement land — a live region inserted at the same moment as its content is
   * routinely missed (A11Y-002). Empty it has no height of its own; it costs one grid gap.
   */
  .status {
    align-items: center;
    display: flex;
    gap: 0.5rem;
  }
`;
