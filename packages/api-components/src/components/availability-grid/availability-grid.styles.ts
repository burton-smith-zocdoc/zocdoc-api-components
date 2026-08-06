import { css } from 'lit';

export default css`
  /*
   * A containment context so the grid can drop columns by the space it actually has rather
   * than by the viewport. This renders inside a results card as often as it renders full
   * width, and a viewport media query knows nothing about which.
   */
  :host {
    container-type: inline-size;
    display: block;
  }

  /*
   * Seven columns, so the same weekday sits under itself on the second row and a patient can
   * read down the column for "Tuesdays". That alignment is the reason for a fixed count
   * instead of auto-fit, and the reason the narrow case drops to a whole week's factor.
   */
  [part='days'] {
    display: grid;
    gap: 0.25rem;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    list-style: none;
    margin: 0;
    padding: 0;
  }

  @container (max-width: 26rem) {
    [part='days'] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /*
   * The cells are real buttons, so each arrives with the user agent's button styling and has to
   * be reset back to a block of text. The window control's own reset lives in
   * availability-window.styles.ts, which every component rendering it shares. Backticks cannot
   * appear in this comment - they would close the css template literal.
   */
  [part='day'],
  [part='more'] {
    appearance: none;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-align: center;

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
    }
  }

  /*
   * A day cell is three stacked lines and fills its column, so the whole tile is the target
   * rather than the text inside it. block-size: 100% keeps the row even when one cell wraps.
   */
  [part='day'],
  [part='more'] {
    block-size: 100%;
    border-radius: 0.25rem;
    display: block;
    inline-size: 100%;
    padding: 0.375rem 0.25rem;
  }

  [part='day-weekday'],
  [part='day-date'],
  [part='day-count'] {
    display: block;
  }

  [part='day-count'] {
    font-size: 0.75rem;
  }

  /*
   * A day with appointments is the thing to press, so it gets the surface; one without is
   * quiet and already disabled, which is what stops the keyboard reaching it. Both keep the
   * inherited text colour, so the distinction never rests on colour alone (A11Y-001) - the
   * count line says which is which in words.
   */
  [part='day']:not(:disabled) {
    background: var(--zd-color-warning-100);
  }

  [part='day']:disabled {
    background: var(--zd-color-neutral-100);
    cursor: default;
    opacity: 0.75;
  }

  [part='day'][aria-current] {
    outline: 2px solid currentcolor;
    outline-offset: -2px;
  }

  [part='more'] {
    text-decoration: underline;
  }

  /* The only thing added to the shared window control: room between it and the days. */
  [part='window'] {
    margin-block-end: 0.5rem;
  }
`;
