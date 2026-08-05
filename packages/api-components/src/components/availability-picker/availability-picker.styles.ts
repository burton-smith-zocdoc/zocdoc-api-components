import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  /*
   * Both strips are lists so a screen reader announces how many days and how many
   * times there are before the user starts moving through them. That means undoing
   * the user agent's list styling here.
   */
  [part='days'],
  [part='slots'] {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /*
   * The day strip scrolls sideways rather than wrapping, so a two-week window stays
   * one row. padding-block-end leaves room for the scrollbar instead of letting it
   * overlap the buttons.
   */
  [part='days'] {
    overflow-x: auto;
    padding-block-end: 0.5rem;

    /* Days must not compress to fit; scrolling is the overflow strategy. */
    & > li {
      flex: 0 0 auto;
    }
  }

  [part='slots'] {
    flex-wrap: wrap;
    margin-block-start: 0.75rem;
  }
`;
