import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  [part='form'] {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 0.75rem;

    /*
     * The controls grow, the button does not. align-items: end keeps the button's
     * baseline level with the inputs even though the inputs are taller for their
     * labels. Logical properties throughout, so RTL mirrors (I18N-003).
     */
    & [part='specialty'],
    & [part='visit-reason'],
    & [part='insurance'] {
      flex: 1 1 12rem;
    }

    /*
     * A ZIP is five characters wide however much room is going, so it takes a share of the
     * row rather than an equal one — the space is worth more to the three selects, whose
     * options are long enough to truncate.
     */
    & [part='zip'] {
      flex: 0 1 8rem;
    }
  }
`;
