import { css } from 'lit';

/**
 * Zocdoc input style overrides.
 *
 * `formControl.*` is a semantic group shared by every Charm form control, so
 * re-pointing it on `:host([size='small'])` scopes the smaller metrics to this
 * input only - custom properties inherit down from the host, they don't leak up.
 */
export default css`
  :host([size='small']) {
    --zd-form-control-input-height: var(--zd-form-control-small-input-height);
    --zd-form-control-padding-y: var(--zd-form-control-small-padding-y);
    --zd-form-control-label-font-size: var(--zd-form-control-small-label-font-size);
  }
`;
