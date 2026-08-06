import { css } from 'lit';

/**
 * Zocdoc menu item style overrides.
 *
 * Charm's `relocateFocusRing` uses `:focus-visible`, but clicking a menu item
 * moves focus programmatically — some browsers treat that as keyboard-like and
 * match `:focus-visible`. The `:hover` guard catches the common case: if the
 * pointer is over the item when it receives focus, it was almost certainly
 * clicked. Keyboard users arrow through items without hovering, so they still
 * see the ring.
 *
 * The `!important` overrides both Charm's base-element `*:focus-visible` rule
 * and `relocateFocusRing`'s targeted outline, which otherwise both apply.
 */
export default css`
  :host(:focus-visible:hover),
  :host(:focus-visible:hover) * {
    outline: none !important;
  }
`;
