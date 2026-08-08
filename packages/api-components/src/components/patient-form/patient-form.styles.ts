import { css } from 'lit';

export default css`
  :host {
    /*
     * The form lays itself out against its own width, not the viewport's. It is embedded in
     * someone else's page, where a media query would be answering the wrong question — the
     * same viewport can be a full-width booking page or a 20rem sidebar.
     */
    container-type: inline-size;
    display: block;
  }

  .form {
    display: grid;
    gap: 1.25rem;

    /*
     * The groups are semantic rather than decorative: A11Y-004 asks for the ten fields to
     * be announced as three groups, so each one is a real fieldset with a real legend. The
     * user agent's border and padding come off because the legend already carries the
     * grouping, and min-inline-size undoes Firefox's min-content floor on fieldset, which
     * otherwise refuses to let the grid inside shrink below its widest field.
     */
    fieldset {
      border: 0;
      margin: 0;
      min-inline-size: 0;
      padding: 0;
    }

    legend {
      color: var(--zd-text-primary);
      font-size: var(--zd-font-size-md);
      font-weight: var(--zd-font-weight-semibold);
      margin-block-end: 0.5rem;

      /* The user agent gives legend inline padding that pulls it out of the grid's edge. */
      padding: 0;
    }

    /*
     * The grid lives on an inner element rather than on the fieldset itself. A fieldset with
     * display: grid takes its legend out of flow inconsistently across engines, which is a
     * layout bug in exchange for one saved element.
     */
    .fields {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      /* Below two fields' worth of room, one column. Labels and help text need the width more
         than the layout needs its second column. */
      @container (inline-size < 26rem) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    /* Street address and notes are long enough that half a row truncates them visually. */
    .wide {
      grid-column: 1 / -1;
    }

    /*
     * The submit button sizes to its label instead of stretching, and sits at the inline
     * end so it reads as the end of the form in both directions (I18N-003).
     */
    .submit {
      justify-self: end;
    }
  }
`;
