import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  /* The skeleton days stand in for the spinner; the message stays for screen readers. */
  [part~='loading'] {
    display: none;
  }

  [part~='loading-message'],
  .visually-hidden {
    block-size: 1px;
    clip-path: inset(50%);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }

  /*
   * Both strips are lists so a screen reader announces how many days and how many
   * times there are before the user starts moving through them. That means undoing
   * the user agent's list styling here.
   */
  .days,
  .slots {
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .days {
    display: flex;
  }

  /*
   * The day strip scrolls sideways rather than wrapping, so a two-week window stays
   * one row. padding-block-end leaves room for the scrollbar instead of letting it
   * overlap the buttons.
   */
  .days {
    overflow-x: auto;
    padding-block-end: 0.5rem;

    /* Days must not compress to fit; scrolling is the overflow strategy. */
    & > li {
      flex: 0 0 auto;
    }
  }

  /*
   * A grid of equal columns rather than a wrapping row, because a row sizes each time to its own
   * label: "9:00 AM" comes out narrower than "10:30 AM" and the column edges go ragged. auto-fill
   * takes as many columns as the container has room for, so the times reflow with the space and
   * the last row still lines up under the one above instead of stretching to fill it.
   *
   * The floor is min() so a container narrower than one column gets a single full-width column
   * rather than an overflowing one — the modal on a phone, or a card in a two-column list.
   */
  .slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(7rem, 100%), 1fr));
    margin-block-start: 0.75rem;

    & [part='slot'] {
      white-space: nowrap;
    }
  }

  /*
   * A day group's times sit directly under their own heading, which is closer than the strip's
   * times sit under the whole day strip. Written as a sibling rule rather than against a layout
   * attribute on the host, so it does not depend on when Lit reflects that attribute.
   */
  .day-heading + .slots {
    margin-block-start: 0.5rem;
  }

  .patient-type {
    margin-block-end: 1rem;

    & [part='patient-type-option'] {
      flex: 1;
      white-space: nowrap;
    }
  }

  /*
   * The groups are a list for the count a screen reader reads out, so the user agent's markers
   * and indent come off here.
   */
  .day-groups {
    display: grid;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .day-heading {
    color: var(--zd-text-primary);
    font-size: var(--zd-font-size-md);
    font-weight: var(--zd-font-weight-semibold);
    margin: 0;
  }

  /*
   * The heading placeholder keeps a blank line of heading text for its height, with the skeleton
   * laid over the start of it. A time placeholder is as tall as the button it stands in for.
   */
  .heading-placeholder {
    position: relative;
  }

  .skeleton {
    --zd-skeleton-width: 100%;
    display: block;

    &.heading {
      --zd-skeleton-min-height: 100%;
      inline-size: 8rem;
      inset-block: 0;
      inset-inline-start: 0;
      position: absolute;
    }

    &.slot {
      --zd-skeleton-border-radius: var(--zd-button-border-radius, 0.25rem);
      --zd-skeleton-min-height: var(--zd-button-height, 2.5rem);
    }

    @media (prefers-reduced-motion: reduce) {
      &::part(skeleton-base) {
        animation: none;
      }
    }
  }

  /*
   * Primary text, not secondary. A closed span is context rather than an offer, so the instinct is
   * to mute it — but the theme's --zd-text-secondary resolves to #919090, which is 3.18:1 on
   * white and fails AA for body copy (A11Y-001). The weight of the heading above is what carries
   * the hierarchy instead.
   */
  .day-empty {
    color: var(--zd-text-primary);
    margin: 0.5rem 0 0;
  }
`;
