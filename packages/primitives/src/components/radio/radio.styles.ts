import { css } from 'lit';

/**
 * Zocdoc radio style overrides.
 *
 * `size="small"` re-points the flat properties Charm's radio reads at the
 * theme's `radio.small.*` group. Charm sizes the control from `controlSize` and
 * the inner dot from `indicatorSize`, so both have to move together or the dot
 * overflows the smaller control.
 */
export default css`
  :host {
    --zd-form-control-label-font-weight: var(--zd-font-weight-normal);
  }

  :host([size='small']) {
    --zd-radio-control-size: var(--zd-radio-small-control-size);
    --zd-radio-indicator-size: var(--zd-radio-small-indicator-size);
    --zd-form-control-label-font-size: var(--zd-form-control-small-label-font-size);
  }
`;
