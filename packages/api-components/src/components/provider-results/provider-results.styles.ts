import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .list {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /*
   * The provider control is a real <button>, so it arrives with the user agent's
   * button styling. Reset it back to a block of text and let the card supply the
   * surface. Note text-align: start rather than left, which keeps RTL correct
   * (I18N-003). Backticks cannot appear in this comment — they would close the
   * css template literal.
   */
  .provider {
    appearance: none;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: block;
    font: inherit;
    inline-size: 100%;
    padding: 0;
    text-align: start;

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
    }
  }

  /*
   * The lines inside the card are laid out by provider-summary.styles.ts, which every
   * component rendering a provider shares. Nothing to repeat here.
   */

  /* The list's gap is the only spacing between these blocks, so their margins go. */
  .summary,
  .pager-position {
    margin: 0;
  }

  /*
   * The count on one side and the window control on the other, wrapping to two rows when there
   * is not room for both — the range and its arrows are wide, and squeezing the count next to
   * them is what makes it truncate in the languages that need more words for it.
   */
  .header {
    align-items: baseline;
    column-gap: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    margin-block-end: 0.75rem;

    /*
     * Pushed to the far side by its own margin rather than by space-between on the wrapper,
     * because a host page with no total renders no count line and the control would then be the
     * only child - which space-between leaves at the start, on the wrong side of the list.
     */
    .window {
      margin-inline-start: auto;
    }
  }

  /*
   * Sits under the provider control rather than inside it — see renderAvailability. The rule the
   * grid needs from its host is the separation, since the card supplies no gap of its own.
   */
  .provider-availability {
    display: block;
    margin-block-start: 0.75rem;
  }

  /*
   * Previous and Next at the edges with the position between them, which puts each control
   * on the side it moves towards in both writing directions (I18N-003).
   */
  .pager {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-block-start: 0.75rem;
  }
`;
