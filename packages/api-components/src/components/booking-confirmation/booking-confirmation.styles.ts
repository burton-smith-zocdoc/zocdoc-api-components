import { css } from 'lit';

export default css`
  :host {
    /*
     * Without this the host is inline, and an inline box around a block alert leaves the
     * alert unable to take the width it was given.
     */
    display: block;
  }

  [part='confirmation'] {
    /*
     * The lines are slotted into the alert, so they sit in this shadow tree and these rules
     * reach them directly. Nothing here sets a colour: the alert's variant owns the
     * foreground and background as a contrast-checked pair, and overriding one half of it
     * from out here is how a success message ends up grey on green.
     */
    p {
      margin-block: 0.25rem 0;
    }

    /*
     * The confirmation number is the value a patient may need to read back to the practice,
     * so it gets a gap above rather than sitting in the run of sentences.
     */
    [part='reference'] {
      margin-block-start: 0.75rem;
    }
  }
`;
