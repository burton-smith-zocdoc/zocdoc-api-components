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

  .visually-hidden {
    block-size: 1px;
    clip: rect(0, 0, 0, 0);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }

  /*
   * Seven columns, so the same weekday sits under itself on the second row and a patient can
   * read down the column for "Tuesdays". That alignment is the reason for a fixed count
   * instead of auto-fit, and the reason the narrow case drops to a whole week's factor.
   */
  .days {
    display: grid;
    gap: 0.25rem;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    list-style: none;
    margin: 0;
    padding: 0;

    @container (max-width: 26rem) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /*
   * The day cells are real buttons, so each arrives with the user agent's styling and has to be
   * reset back to a block of text.
   */
  .day,
  .more {
    appearance: none;
    background: none;
    block-size: 100%;
    border: 0;
    border-radius: 0.25rem;
    color: inherit;
    cursor: pointer;
    display: block;
    font: inherit;
    inline-size: 100%;
    padding: 0.375rem 0.25rem;
    text-align: center;

    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: var(--zd-focus-outline-offset);
    }
  }

  .day {
    .day-weekday,
    .day-date,
    .day-count {
      display: block;
    }

    .day-count {
      font-size: 0.75rem;
    }

    /*
     * A day with appointments is the thing to press, so it gets the surface; one without is
     * quiet and already disabled, which is what stops the keyboard reaching it. Both keep the
     * inherited text colour, so the distinction never rests on colour alone (A11Y-001) - the
     * count line says which is which in words.
     */
    &:not(:disabled) {
      background: var(--zd-color-warning-100);
    }

    &:disabled {
      background: var(--zd-color-neutral-100);
      cursor: not-allowed;
      opacity: 0.75;
    }

    &[aria-selected='true'] {
      outline: 2px solid currentcolor;
      outline-offset: -2px;
    }
  }

  .more {
    margin-block-start: 0.5rem;
    text-decoration: underline;
  }

  /* Room between the window control and the days. */
  scoped-availability-window {
    display: block;
    margin-block-end: 0.5rem;
  }
`;
