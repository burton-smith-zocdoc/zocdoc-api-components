import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  [part='list'] {
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
  [part='provider'] {
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
  [part='summary'],
  [part='pager-position'] {
    margin: 0;
  }

  /*
   * Previous and Next at the edges with the position between them, which puts each control
   * on the side it moves towards in both writing directions (I18N-003).
   */
  [part='pager'] {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-block-start: 0.75rem;
  }
`;
