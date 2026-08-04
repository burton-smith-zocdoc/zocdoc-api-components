import { css } from 'lit';

export default css`
  dialog {
    border: none;
    padding: 0;
    margin: auto;
  }

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :host([position='start']) dialog {
    margin: 0;
    inset-block: 0;
    inset-inline-start: 0;
    inset-inline-end: auto;
  }

  :host([position='end']) dialog {
    margin: 0;
    inset-block: 0;
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  :host([position='top']) dialog {
    margin: 0;
    inset-block-start: 0;
    inset-block-end: auto;
    inset-inline: 0;
  }

  :host([position='bottom']) dialog {
    margin: 0;
    inset-block-start: auto;
    inset-block-end: 0;
    inset-inline: 0;
  }

  :host([position='start']) .dialog-wrapper,
  :host([position='end']) .dialog-wrapper,
  :host([position='top']) .dialog-wrapper,
  :host([position='bottom']) .dialog-wrapper {
    border-radius: 0;
  }

  :host([position='start']) dialog,
  :host([position='end']) dialog {
    height: 100vh;
    max-height: 100vh;
  }

  :host([position='start']) .dialog-wrapper,
  :host([position='end']) .dialog-wrapper {
    height: 100%;
  }

  :host([position='top']) dialog,
  :host([position='bottom']) dialog {
    width: 100vw;
    max-width: 100vw;
  }

  :host([position='top']) .dialog-wrapper,
  :host([position='bottom']) .dialog-wrapper {
    width: 100%;
  }

  :host([position='start']) dialog,
  :host([position='end']) dialog,
  :host([position='top']) dialog,
  :host([position='bottom']) dialog {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  :host([position='start']) dialog {
    transform: translateX(-100%);
  }

  :host([position='end']) dialog {
    transform: translateX(100%);
  }

  :host([position='top']) dialog {
    transform: translateY(-100%);
  }

  :host([position='bottom']) dialog {
    transform: translateY(100%);
  }

  :host([position='start'][open]) dialog,
  :host([position='end'][open]) dialog,
  :host([position='top'][open]) dialog,
  :host([position='bottom'][open]) dialog {
    transform: translate(0, 0);
  }

  @starting-style {
    :host([position='start'][open]) dialog {
      transform: translateX(-100%);
    }

    :host([position='end'][open]) dialog {
      transform: translateX(100%);
    }

    :host([position='top'][open]) dialog {
      transform: translateY(-100%);
    }

    :host([position='bottom'][open]) dialog {
      transform: translateY(100%);
    }
  }
`;
