import { css } from 'lit';

/**
 * Zocdoc icon style overrides.
 *
 * Charm's icon is `1em` square with no tokens of its own, so it inherits the
 * surrounding font size. Each `size` step sets `font-size` on the host, which
 * the `1em` box then follows - no need to touch width/height and risk fighting
 * Charm's `contain: strict`.
 */
export default css`
  :host([size='small']) {
    font-size: var(--zd-icon-small-size);
  }

  :host([size='default']) {
    font-size: var(--zd-icon-size);
  }

  :host([size='large']) {
    font-size: var(--zd-icon-large-size);
  }
`;
