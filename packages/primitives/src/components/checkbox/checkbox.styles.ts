import { css } from 'lit';

export default css`
  :host {
    --zd-form-control-label-font-weight: var(--zd-font-weight-normal);
  }

  :host([size='small']) {
    --zd-checkbox-size: var(--zd-checkbox-small-size);
    --zd-checkbox-icon-size: var(--zd-checkbox-small-icon-size);
    --zd-form-control-label-font-size: var(--zd-form-control-small-label-font-size);
  }

  :host([checked]) .label,
  :host([indeterminate]) .label {
    color: var(--zd-body-fg-color);
  }
`;
