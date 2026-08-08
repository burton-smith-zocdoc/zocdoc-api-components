import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .window {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;

    .window-range {
      font-weight: 600;
      margin: 0;
    }
  }

  .window-label {
    block-size: 1px;
    clip-path: inset(50%);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }
`;
