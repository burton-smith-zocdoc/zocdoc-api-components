import { css } from 'lit';

export default css`
  [part='alert-icon'] {
    color: var(--zd-alert-icon-color);
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
