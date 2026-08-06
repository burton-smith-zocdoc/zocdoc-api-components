import { css, unsafeCSS, type CSSResult } from "lit";

/**
 * Zocdoc button style overrides.
 *
 * Charm's button reads a flat set of `--zd-button-*` custom properties, and the
 * Zocdoc theme adds a `button.<variant>` token group per treatment. Rather than
 * restating Charm's selectors for every variant, each variant here re-points
 * the flat properties Charm already reads. Charm keeps ownership of structure
 * and state logic; we only swap values, so a future change to `.control` or to
 * Charm's state selectors keeps working.
 *
 * Consumer overrides still win: normal declarations from an outer tree beat
 * normal declarations from a shadow tree, so a partner site setting
 * `--zd-button-bg-color` on `zd-button` overrides these `:host` rules
 * regardless of specificity.
 *
 * Two mappings are deliberate rather than one-to-one with the theme:
 *
 * - **Focus.** Charm's `.control:focus` repaints the surface from
 *   `--zd-button-focus-{bg,fg}-color`. Left alone, focusing a variant button
 *   would snap it back to the default treatment, so each variant points those
 *   at its own base colors. Only the focus ring (`--zd-button-focus-border-color`)
 *   stays shared, which keeps the indicator consistent across variants (A11Y-001).
 * - **Pressed.** The theme has no per-variant `pressed` group, so toggle buttons
 *   reuse the variant's `active` treatment instead of reverting to the default.
 *
 * Where a variant's token group legitimately omits a leaf - `ghost` has no
 * hover foreground, `link` has no borders - the mapping falls back to that
 * variant's base leaf. Adding the token to the theme later takes effect with no
 * change here.
 *
 * `size` uses the same trick against the `button.small.*` group, and `fluid`
 * only widens the host.
 */

/**
 * The variants whose `button.<variant>.*` group carries every leaf the flat
 * properties need, so the mapping is mechanical. `ghost` and `link` are written
 * out below precisely because theirs do not — keeping them separate is what
 * makes their deviations visible rather than buried in a list of near-identical
 * blocks.
 */
const COMPLETE_VARIANTS = [
  "primary",
  "secondary",
  "inverse",
  "destructive",
] as const;

const completeVariant = (name: string): CSSResult => {
  const v = unsafeCSS(name);
  return css`
    :host([variant="${v}"]) {
      --zd-button-bg-color: var(--zd-button-${v}-bg-color);
      --zd-button-fg-color: var(--zd-button-${v}-fg-color);
      --zd-button-border-color: var(--zd-button-${v}-border-color);
      --zd-button-hover-bg-color: var(--zd-button-${v}-hover-bg-color);
      --zd-button-hover-fg-color: var(--zd-button-${v}-hover-fg-color);
      --zd-button-hover-border-color: var(--zd-button-${v}-hover-border-color);
      --zd-button-active-bg-color: var(--zd-button-${v}-active-bg-color);
      --zd-button-active-fg-color: var(--zd-button-${v}-active-fg-color);
      --zd-button-active-border-color: var(
        --zd-button-${v}-active-border-color
      );
      --zd-button-disabled-bg-color: var(--zd-button-${v}-disabled-bg-color);
      --zd-button-disabled-fg-color: var(--zd-button-${v}-disabled-fg-color);
      --zd-button-disabled-border-color: var(
        --zd-button-${v}-disabled-border-color
      );
      --zd-button-focus-bg-color: var(--zd-button-${v}-bg-color);
      --zd-button-focus-fg-color: var(--zd-button-${v}-fg-color);
      --zd-button-pressed-bg-color: var(--zd-button-${v}-active-bg-color);
      --zd-button-pressed-fg-color: var(--zd-button-${v}-active-fg-color);
      --zd-button-pressed-border-color: var(
        --zd-button-${v}-active-border-color
      );
    }
  `;
};

const completeVariants = COMPLETE_VARIANTS.map(completeVariant).reduce(
  (all, one) => css`
    ${all} ${one}
  `,
);

export default css`
  /*
   * Charm's button takes its text size from the page (\`font-size: inherit\`) and
   * has no height token, so the theme's \`button.fontSize\` / \`button.height\`
   * would never apply. Wiring them here is what makes the 44px Zocdoc button a
   * fixed metric rather than a consequence of the host page's type scale, and it
   * gives \`size="small"\` something to re-point.
   */
  :host {
    font-size: var(--zd-button-font-size);
  }

  .control {
    box-sizing: border-box;
    min-height: var(--zd-button-height);
    padding-block: max(
      0px,
      calc(var(--zd-button-padding-y, 0px) - var(--zd-button-border-width)),
      calc(
        (
            var(--zd-button-height) - 1em - var(--zd-button-border-width) *
              2
          ) /
          2
      )
    );
  }

  :host(:not([variant="link"])) a.control {
    color: inherit;
    text-decoration: none;
  }

  :host([fluid]) {
    display: block;
    width: 100%;
  }

  :host([size="small"]) {
    --zd-button-font-size: var(--zd-button-small-font-size);
    --zd-button-height: var(--zd-button-small-height);
    --zd-button-icon-size: var(--zd-button-small-icon-size);
    --zd-button-padding-x: var(--zd-button-small-padding-x);
    --zd-button-padding-y: var(--zd-button-small-padding-y);
    --zd-button-icon-padding-x: var(--zd-button-small-padding-y);
    --zd-button-icon-padding-y: var(--zd-button-small-padding-y);
  }

  ${completeVariants}

  /* Ghost has no hover/active foreground of its own - it keeps its base color. */
  :host([variant='ghost']) {
    --zd-button-bg-color: var(--zd-button-ghost-bg-color);
    --zd-button-fg-color: var(--zd-button-ghost-fg-color);
    --zd-button-border-color: var(--zd-button-ghost-border-color);
    --zd-button-hover-bg-color: var(--zd-button-ghost-hover-bg-color);
    --zd-button-hover-fg-color: var(
      --zd-button-ghost-hover-fg-color,
      var(--zd-button-ghost-fg-color)
    );
    --zd-button-hover-border-color: var(--zd-button-ghost-hover-border-color);
    --zd-button-active-bg-color: var(--zd-button-ghost-active-bg-color);
    --zd-button-active-fg-color: var(
      --zd-button-ghost-active-fg-color,
      var(--zd-button-ghost-fg-color)
    );
    --zd-button-active-border-color: var(--zd-button-ghost-active-border-color);
    --zd-button-disabled-bg-color: var(
      --zd-button-ghost-disabled-bg-color,
      var(--zd-button-ghost-bg-color)
    );
    --zd-button-disabled-fg-color: var(--zd-button-ghost-disabled-fg-color);
    --zd-button-disabled-border-color: var(
      --zd-button-ghost-disabled-border-color
    );
    --zd-button-focus-bg-color: var(--zd-button-ghost-bg-color);
    --zd-button-focus-fg-color: var(--zd-button-ghost-fg-color);
    --zd-button-pressed-bg-color: var(--zd-button-ghost-active-bg-color);
    --zd-button-pressed-fg-color: var(
      --zd-button-ghost-active-fg-color,
      var(--zd-button-ghost-fg-color)
    );
    --zd-button-pressed-border-color: var(
      --zd-button-ghost-active-border-color
    );
  }

  /*
   * Link carries no border or fill tokens - it borrows the transparent
   * primitive so Charm's shorthand still resolves, and adds the underline
   * Charm's button never declares.
   */
  :host([variant="link"]) {
    --zd-button-bg-color: var(--zd-button-link-bg-color);
    --zd-button-fg-color: var(--zd-button-link-fg-color);
    --zd-button-border-color: var(--zd-color-transparent);
    --zd-button-hover-bg-color: var(--zd-button-link-bg-color);
    --zd-button-hover-fg-color: var(--zd-button-link-hover-fg-color);
    --zd-button-hover-border-color: var(--zd-color-transparent);
    --zd-button-active-bg-color: var(--zd-button-link-bg-color);
    --zd-button-active-fg-color: var(--zd-button-link-active-fg-color);
    --zd-button-active-border-color: var(--zd-color-transparent);
    --zd-button-disabled-bg-color: var(--zd-button-link-bg-color);
    --zd-button-disabled-fg-color: var(--zd-button-link-disabled-fg-color);
    --zd-button-disabled-border-color: var(--zd-color-transparent);
    --zd-button-focus-bg-color: var(--zd-button-link-bg-color);
    --zd-button-focus-fg-color: var(--zd-button-link-fg-color);
    --zd-button-pressed-bg-color: var(--zd-button-link-bg-color);
    --zd-button-pressed-fg-color: var(--zd-button-link-active-fg-color);
    --zd-button-pressed-border-color: var(--zd-color-transparent);

    .control {
      text-decoration: var(--zd-button-link-decoration);
      background-color: var(--zd-color-transparent);
      border-color: var(--zd-color-transparent);
      box-shadow: none;
      padding: 0;
      margin: 0;
      font-size: inherit;

      &:hover {
        text-decoration: var(--zd-button-link-hover-decoration);
      }
    }
  }

  :host([variant="link"]:not([disabled])) .control:active {
    text-decoration: var(--zd-button-link-active-decoration);
  }
`;
