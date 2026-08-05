import { css } from 'lit';

/**
 * Zocdoc alert style overrides.
 *
 * Same approach as the badge and the button: Charm's alert reads flat
 * `--zd-alert-*` properties, and each variant re-points them at its
 * `alert.<variant>` token group rather than restating Charm's `.alert` rule.
 * Outer-tree declarations still win, so a consumer overriding
 * `--zd-alert-bg-color` keeps overriding it.
 *
 * Charm's `--zd-alert-border` is a composite - `1px solid <color>`, not a bare
 * color - so each variant restates the whole shorthand around its own border
 * color. An alert with no `variant` keeps Charm's neutral surface, which is the
 * right treatment for an alert with no severity.
 *
 * Every variant block declares the same five properties rather than sharing four
 * of them through a `:host([variant])` rule. `:host([variant])` and
 * `:host([variant='danger'])` have identical specificity - `:host()` takes the
 * specificity of its argument - so a shared block would only win or lose on
 * source order, which is not something a later edit should have to know.
 */
export default css`
  /*
   * Charm's icon rule is \`::slotted([slot='icon'][icon])\`, and nothing sets an
   * \`icon\` attribute - \`zd-icon\` reflects \`name\` - so it never matches and
   * \`--zd-alert-icon-color\` goes unread. Coloring the container instead reaches
   * both the icon a variant renders and any icon a consumer slots over it, since
   * \`color\` inherits across the slot boundary. A slotted icon in an alert with
   * no variant now picks up Charm's intended \`text-secondary\` rather than
   * inheriting the message color, which is what the token always meant.
   */
  [part='alert-icon'] {
    color: var(--zd-alert-icon-color);
  }

  /*
   * Charm points the dismiss button at \`surface-secondary\`, a neutral gray that
   * is dark in the dark scheme - where a variant's foreground is also dark, so
   * the glyph would disappear into its own button. Dropping the resting
   * background lets the button sit on the tint, where the variant's foreground is
   * contrast-safe by construction; hover and active come from the variant's own
   * ramp. No variant block redeclares this one, so the shared rule is safe here.
   */
  :host([variant]) {
    --zd-alert-button-bg-color: transparent;
  }

  :host([variant='info']) {
    --zd-alert-bg-color: var(--zd-alert-info-bg-color);
    --zd-alert-fg-color: var(--zd-alert-info-fg-color);
    --zd-alert-border: var(--zd-border-width-sm) solid var(--zd-alert-info-border-color);
    --zd-alert-icon-color: var(--zd-alert-info-icon-color);
    --zd-alert-button-hover-bg-color: var(--zd-alert-info-button-hover-bg-color);
    --zd-alert-button-active-bg-color: var(--zd-alert-info-button-active-bg-color);
  }

  :host([variant='success']) {
    --zd-alert-bg-color: var(--zd-alert-success-bg-color);
    --zd-alert-fg-color: var(--zd-alert-success-fg-color);
    --zd-alert-border: var(--zd-border-width-sm) solid var(--zd-alert-success-border-color);
    --zd-alert-icon-color: var(--zd-alert-success-icon-color);
    --zd-alert-button-hover-bg-color: var(--zd-alert-success-button-hover-bg-color);
    --zd-alert-button-active-bg-color: var(--zd-alert-success-button-active-bg-color);
  }

  :host([variant='warning']) {
    --zd-alert-bg-color: var(--zd-alert-warning-bg-color);
    --zd-alert-fg-color: var(--zd-alert-warning-fg-color);
    --zd-alert-border: var(--zd-border-width-sm) solid var(--zd-alert-warning-border-color);
    --zd-alert-icon-color: var(--zd-alert-warning-icon-color);
    --zd-alert-button-hover-bg-color: var(--zd-alert-warning-button-hover-bg-color);
    --zd-alert-button-active-bg-color: var(--zd-alert-warning-button-active-bg-color);
  }

  :host([variant='danger']) {
    --zd-alert-bg-color: var(--zd-alert-danger-bg-color);
    --zd-alert-fg-color: var(--zd-alert-danger-fg-color);
    --zd-alert-border: var(--zd-border-width-sm) solid var(--zd-alert-danger-border-color);
    --zd-alert-icon-color: var(--zd-alert-danger-icon-color);
    --zd-alert-button-hover-bg-color: var(--zd-alert-danger-button-hover-bg-color);
    --zd-alert-button-active-bg-color: var(--zd-alert-danger-button-active-bg-color);
  }
`;
