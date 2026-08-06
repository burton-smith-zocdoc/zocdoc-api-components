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

  /*
   * A day group's times sit directly under their own heading, which is closer than the strip's
   * times sit under the whole day strip. Written as a sibling rule rather than against a layout
   * attribute on the host, so it does not depend on when Lit reflects that attribute.
   */
  [part='day-heading'] + [part='slots'] {
    margin-block-start: 0.5rem;
  }

  [part='patient-type'] {
    display: block;
    margin-block-end: 1rem;
  }

  /*
   * The groups are a list for the count a screen reader reads out, so the user agent's markers
   * and indent come off here.
   */
  [part='day-groups'] {
    display: grid;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  [part='day-heading'] {
    color: var(--zd-text-primary);
    font-size: var(--zd-font-size-md);
    font-weight: var(--zd-font-weight-semibold);
    margin: 0;
  }

  /*
   * Primary text, not secondary. A closed span is context rather than an offer, so the instinct is
   * to mute it — but the theme's --zd-text-secondary resolves to #919090, which is 3.18:1 on
   * white and fails AA for body copy (A11Y-001). The weight of the heading above is what carries
   * the hierarchy instead.
   */
  [part='day-empty'] {
    color: var(--zd-text-primary);
    margin: 0.5rem 0 0;
  }
`;
