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
