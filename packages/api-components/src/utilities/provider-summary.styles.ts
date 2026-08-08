import { css } from 'lit';

/**
 * The summary block's styles, spread into the `static styles` of every component that calls
 * `renderProviderSummary`. Shipping them alongside the markup is the point: an extraction that
 * shared only the template would leave each consumer restyling the same six parts, which is
 * how two cards drift apart again.
 *
 * Deliberately layout-only. Colour, weight and size stay with the consuming component, whose
 * card and whose booking summary want the same information at different emphasis.
 */
export default css`
  .provider-summary {
    display: flex;
    gap: 0.75rem;

    /*
     * A fixed box so a row of cards lines up before the images have loaded, and so a portrait
     * and a landscape photo occupy the same space. Logical properties throughout (I18N-003).
     */
    .provider-photo {
      block-size: 3.5rem;
      border-radius: 50%;
      flex: 0 0 auto;
      inline-size: 3.5rem;
      object-fit: cover;
    }

    .provider-detail {
      display: grid;
      gap: 0.125rem;
      /* Without this the grid takes the photo's width as its floor and the address wraps
       * one word at a time. */
      min-inline-size: 0;
    }

    .provider-name {
      font-weight: 600;
    }
  }
`;
