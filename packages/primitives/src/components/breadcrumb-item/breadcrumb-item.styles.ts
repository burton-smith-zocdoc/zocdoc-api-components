import { css } from 'lit';

/**
 * Zocdoc breadcrumb item style overrides.
 *
 * Charm renders an `<a>` when `href` is set and a `<button>` otherwise, but its
 * stylesheet only has rules for the anchor. The trailing item of a trail is the
 * current page and so normally has no `href`, which means it arrives with the
 * browser's default button chrome - grey fill, UA font, UA border. These rules
 * give the button the same treatment Charm gives the anchor off the same tokens,
 * then add the two things Charm has no token for: a radius under the hover
 * highlight, and a distinct weight for the current page.
 */
export default css`
  .control {
    border-radius: var(--zd-breadcrumb-item-border-radius);
  }

  button.control {
    appearance: none;
    display: flex;
    font: inherit;
    padding: var(--zd-breadcrumb-item-padding);
    background-color: var(--zd-breadcrumb-item-bg-color);
    border: var(--zd-breadcrumb-item-border-width) solid var(--zd-breadcrumb-item-border-color);
    color: var(--zd-breadcrumb-item-fg-color);
  }

  /*
   * The current page is not somewhere you can navigate to, so it gets none of
   * the interactive states even though Charm still renders it as a button.
   */
  :host(:not([current])) button.control {
    cursor: pointer;
  }

  :host(:not([current])) button.control:hover {
    background-color: var(--zd-breadcrumb-item-hover-bg-color);
    border-color: var(--zd-breadcrumb-item-hover-border-color);
    color: var(--zd-breadcrumb-item-hover-fg-color);
  }

  :host(:not([current])) button.control:hover:active {
    background-color: var(--zd-breadcrumb-item-active-bg-color);
    border-color: var(--zd-breadcrumb-item-active-border-color);
    color: var(--zd-breadcrumb-item-active-fg-color);
  }

  /*
   * Charm keys the anchor's focus treatment off plain :focus, which it gets away
   * with because activating a link navigates away. A button keeps focus after a
   * click, so :focus would leave the highlight stuck on until you click
   * elsewhere.
   */
  button.control:focus-visible {
    outline: none;
    background-color: var(--zd-breadcrumb-item-focus-bg-color);
    border-color: var(--zd-breadcrumb-item-focus-border-color);
    color: var(--zd-breadcrumb-item-focus-fg-color);
  }

  :host([disabled]) button.control {
    background-color: var(--zd-breadcrumb-item-disabled-bg-color);
    border-color: var(--zd-breadcrumb-item-disabled-border-color);
    color: var(--zd-breadcrumb-item-disabled-fg-color);
    cursor: not-allowed;
  }

  :host([current]) .control {
    color: var(--zd-breadcrumb-item-current-fg-color);
    font-weight: var(--zd-breadcrumb-item-current-font-weight);
  }
`;
