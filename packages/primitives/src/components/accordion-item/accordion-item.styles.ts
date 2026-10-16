import { css } from 'lit';

/**
 * Zocdoc accordion item style overrides.
 *
 * Charm already ships every piece of the open/close height animation:
 * `interpolate-size: allow-keywords` on `:host`, `block-size: 0` -> `auto`
 * across `::details-content`, and `transition-behavior: allow-discrete` for the
 * discrete `content-visibility` flip. It only gates the `transition` itself
 * behind `:host([animated])`, and `animated` is not a declared property on
 * CoreAccordionItem - it exists solely as that attribute selector. Rather than
 * ask every consumer to hand-write an undocumented attribute, we make the
 * animation the default and read the same `animation.*` tokens Charm does.
 *
 * `@starting-style` is deliberately not used here. It supplies a "before" style
 * for elements that have none (popover, dialog, display: none -> block, freshly
 * inserted nodes). `::details-content` has a real closed state, so a plain
 * transition interpolates in both directions.
 *
 * `interpolate-size` and `::details-content` are Chromium-only as of this
 * writing; other engines snap open with no animation, which degrades cleanly.
 */
export default css`
  /*
   * Charm renders .base as inline-block, which sits on the host's text baseline
   * and leaves descender space below each item - a visible gap between stacked
   * items. It's already width: 100%, so block loses nothing.
   */
  .base {
    display: block;
    border-block-end: var(--zd-accordion-item-border-width) solid
      var(--zd-accordion-item-border-color);
  }

  /*
   * Zinc's accordion is a flat list: the group draws the top rule, each item
   * a bottom rule. Charm boxes every summary in a full border and hardcodes
   * its padding, so both are replaced with the trigger tokens.
   */
  .summary {
    gap: var(--zd-accordion-item-padding-x);
    padding-block: var(--zd-accordion-item-padding-y);
    padding-inline: var(--zd-accordion-item-padding-x);
    border: none;
    border-radius: var(--zd-accordion-item-border-radius);
    font-family: var(--zd-accordion-item-font-family);
    font-size: var(--zd-accordion-item-font-size);
    font-weight: var(--zd-accordion-item-font-weight);
    line-height: var(--zd-accordion-item-line-height);

    /*
     * Charm paints hover on :focus too and removes the outline; keep hover a
     * pointer cue and give keyboard focus the shared focus ring.
     */
    &:focus,
    &:focus-within {
      background: var(--zd-accordion-item-bg-color);
    }

    &:hover {
      background: var(--zd-accordion-item-hover-bg-color);
    }

    &:active {
      background: var(--zd-accordion-item-active-bg-color);
    }

    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: calc(-1 * var(--zd-focus-outline-width));
    }
  }

  :host([expand-icon-position='end']) .icon {
    margin-inline-start: auto;
  }

  /*
   * Charm slots the panel content straight into <details> with no wrapper, so
   * the panel's padding lands on the default slot. display: block gives it a
   * box; ::details-content still owns the open/close height.
   */
  .base > slot:not([name]) {
    display: block;
    padding-block: var(--zd-accordion-item-panel-padding-y);
    padding-inline: var(--zd-accordion-item-panel-padding-x);
    background-color: var(--zd-accordion-item-panel-bg-color);
    color: var(--zd-accordion-item-panel-fg-color);
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }

  .base::details-content {
    transition:
      block-size var(--zd-accordion-item-animation-duration)
        var(--zd-accordion-item-animation-timing-function),
      content-visibility var(--zd-accordion-item-animation-duration)
        var(--zd-accordion-item-animation-timing-function);

    /*
     * Must come after the shorthand. transition-behavior is a longhand of
     * transition, so the shorthand above resets it to normal and undoes the
     * allow-discrete that Charm sets in its own .base::details-content rule.
     * Without this, content-visibility snaps to hidden the instant the item
     * closes and the block-size collapse animates an invisible box.
     */
    transition-behavior: allow-discrete;
  }
`;
