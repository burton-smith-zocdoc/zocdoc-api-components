import { css } from 'lit';

/**
 * Zocdoc checkbox style overrides.
 *
 * Same approach as the button: Charm reads flat `--zd-checkbox-*` properties, so
 * `size="small"` re-points them at the theme's `checkbox.small.*` group instead
 * of restating Charm's `.control` rules. The label size comes from the shared
 * `formControl.small.labelFontSize` token, which every form control uses.
 */
export default css`
  :host([size='small']) {
    --zd-checkbox-size: var(--zd-checkbox-small-size);
    --zd-checkbox-icon-size: var(--zd-checkbox-small-icon-size);
    --zd-form-control-label-font-size: var(--zd-form-control-small-label-font-size);
  }
`;
