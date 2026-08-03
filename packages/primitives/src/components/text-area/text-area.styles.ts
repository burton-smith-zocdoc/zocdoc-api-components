import { css } from 'lit';

/**
 * Zocdoc text area style overrides.
 *
 * The text area takes its height from `textArea.inputMinHeight` and the row
 * count, so `size="small"` only has to move the shared `formControl.*` padding
 * and label size.
 */
export default css`
  :host([size='small']) {
    --zd-form-control-padding-y: var(--zd-form-control-small-padding-y);
    --zd-form-control-label-font-size: var(--zd-form-control-small-label-font-size);
  }
`;
