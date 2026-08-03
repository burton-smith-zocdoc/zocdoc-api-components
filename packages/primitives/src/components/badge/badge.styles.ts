import { css } from 'lit';

/**
 * Zocdoc badge style overrides.
 *
 * Same approach as the button: Charm's badge reads flat `--zd-badge-*`
 * properties, and each variant re-points them at its `badge.<variant>` token
 * group rather than restating Charm's `.base` rule. Outer-tree declarations
 * still win, so consumer overrides of `--zd-badge-bg-color` keep working.
 *
 * The theme's badge variants are fills only - no per-variant border tokens - so
 * `--zd-badge-border-color` stays shared.
 */
export default css`
  :host([variant='neutral']) {
    --zd-badge-bg-color: var(--zd-badge-neutral-bg-color);
    --zd-badge-fg-color: var(--zd-badge-neutral-fg-color);
  }

  :host([variant='inverse']) {
    --zd-badge-bg-color: var(--zd-badge-inverse-bg-color);
    --zd-badge-fg-color: var(--zd-badge-inverse-fg-color);
  }

  :host([variant='info']) {
    --zd-badge-bg-color: var(--zd-badge-info-bg-color);
    --zd-badge-fg-color: var(--zd-badge-info-fg-color);
  }

  :host([variant='success']) {
    --zd-badge-bg-color: var(--zd-badge-success-bg-color);
    --zd-badge-fg-color: var(--zd-badge-success-fg-color);
  }

  :host([variant='warning']) {
    --zd-badge-bg-color: var(--zd-badge-warning-bg-color);
    --zd-badge-fg-color: var(--zd-badge-warning-fg-color);
  }

  :host([variant='danger']) {
    --zd-badge-bg-color: var(--zd-badge-danger-bg-color);
    --zd-badge-fg-color: var(--zd-badge-danger-fg-color);
  }

  :host([variant='caution']) {
    --zd-badge-bg-color: var(--zd-badge-caution-bg-color);
    --zd-badge-fg-color: var(--zd-badge-caution-fg-color);
  }

  :host([variant='brand']) {
    --zd-badge-bg-color: var(--zd-badge-brand-bg-color);
    --zd-badge-fg-color: var(--zd-badge-brand-fg-color);
  }
`;
