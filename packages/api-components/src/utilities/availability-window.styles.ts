import { css } from 'lit';

/**
 * The window control's layout, shared by every component that renders
 * `internal/availability-window.ts`. Living beside the template is the point: a component that
 * imports one without the other gets the user agent's buttons and a visible label.
 */
export default css`
  /*
   * The range between its two controls, each on the side it moves towards in both writing
   * directions (I18N-003).
   */
  [part='window'] {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  [part='window-range'] {
    font-weight: 600;
    margin: 0;
  }

  /*
   * Real buttons, so each arrives with the user agent's styling and has to be reset back to
   * text. Backticks cannot appear in this comment - they would close the css template literal.
   */
  [part='window-previous'],
  [part='window-next'] {
    align-items: center;
    appearance: none;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: 0.25rem;
    padding: 0.25rem;

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
  }

  /*
   * The name of each arrow control: out of view but in the DOM, which is what makes it the
   * button's accessible name and keeps it translatable (I18N-001). Not display: none, and not a
   * zero size, either of which would take it out of the accessibility tree with it.
   */
  .window-label {
    block-size: 1px;
    clip-path: inset(50%);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }
`;
