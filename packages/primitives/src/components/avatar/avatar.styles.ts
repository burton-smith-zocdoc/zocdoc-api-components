import { css } from 'lit';

/**
 * Temporary workaround until Charm applies fgColor to initials.
 * See charm-ux/core commit adding `color: ${component('avatar', 'fgColor')}`.
 * Remove this file once the Charm update is released.
 */
export default css`
  .initials {
    color: var(--zd-avatar-fg-color);
  }

  .image {
    object-fit: cover;
  }
`;
