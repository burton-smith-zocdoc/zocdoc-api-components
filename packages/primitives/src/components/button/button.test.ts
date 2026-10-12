import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createTestContainer,
  describeA11y,
  expectNoViolations,
  getContainer,
  waitForUpdate,
} from '../../utils/test/a11y.js';
import type { ZdButton } from './button.js';

const VARIANTS = ['primary', 'secondary', 'inverse', 'ghost', 'destructive', 'link'] as const;

function control(button: ZdButton): HTMLElement {
  const el = button.shadowRoot?.querySelector<HTMLElement>('.control');
  if (!el) throw new Error('zd-button rendered no control');
  return el;
}

describe('zd-button loading', () => {
  let container: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    ({ container, cleanup } = createTestContainer());
  });

  afterEach(() => cleanup());

  async function mount(setup: (button: ZdButton) => void = () => {}): Promise<ZdButton> {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Continue';
    setup(button);
    container.appendChild(button);
    await waitForUpdate();
    return button;
  }

  it('reflects the attribute so the loading styles apply', async () => {
    const button = await mount((b) => (b.loading = true));

    expect(button.hasAttribute('loading')).toBe(true);
  });

  it('draws a decorative spinner only while loading', async () => {
    const button = await mount();
    expect(button.shadowRoot?.querySelector('zd-spinner')).toBeNull();

    button.loading = true;
    await waitForUpdate();

    // The component doing the work announces it; a second status role here
    // would announce "Loading" over it.
    const spinner = button.shadowRoot?.querySelector('zd-spinner');
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the control busy and disabled, and restores it after', async () => {
    const button = await mount((b) => (b.loading = true));

    expect(control(button).getAttribute('aria-busy')).toBe('true');
    expect(control(button).getAttribute('aria-disabled')).toBe('true');

    button.loading = false;
    await waitForUpdate();

    expect(control(button).hasAttribute('aria-busy')).toBe(false);
    expect(control(button).hasAttribute('aria-disabled')).toBe(false);
  });

  it('hands aria-disabled back to a disabled button when loading ends', async () => {
    const button = await mount((b) => {
      b.disabled = true;
      b.loading = true;
    });

    button.loading = false;
    await waitForUpdate();

    expect(control(button).getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps aria-disabled when disabled changes mid-load', async () => {
    const button = await mount((b) => (b.loading = true));

    button.disabled = false;
    await waitForUpdate();

    expect(control(button).getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps its label so the accessible name does not change', async () => {
    const button = await mount((b) => (b.loading = true));

    const slot = button.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    expect(slot?.assignedNodes().map((n) => n.textContent)).toEqual(['Continue']);
  });

  it('ignores toggles while loading', async () => {
    const button = await mount((b) => {
      b.toggle = true;
      b.loading = true;
    });
    let changes = 0;
    button.addEventListener('change', () => changes++);

    control(button).click();
    await waitForUpdate();

    expect(button.pressed).toBeFalsy();
    expect(changes).toBe(0);
  });

  it('does not submit its form while loading', async () => {
    const form = document.createElement('form');
    let submits = 0;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submits++;
    });
    container.appendChild(form);

    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Book';
    button.type = 'submit';
    button.loading = true;
    form.appendChild(button);
    await waitForUpdate();

    control(button).click();
    expect(submits).toBe(0);

    button.loading = false;
    await waitForUpdate();

    control(button).click();
    expect(submits).toBe(1);
  });
});

describeA11y('zd-button', () => {
  it('passes axe checks with default variant', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Click me';
    getContainer().appendChild(button);

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks with variant="%s"', async (variant) => {
    const button = document.createElement('zd-button') as ZdButton;
    button.variant = variant;
    button.textContent = 'Click me';
    getContainer().appendChild(button);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Disabled button';
    button.disabled = true;
    getContainer().appendChild(button);

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Small button';
    button.size = 'small';
    getContainer().appendChild(button);

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks when loading with variant="%s"', async (variant) => {
    const button = document.createElement('zd-button') as ZdButton;
    button.variant = variant;
    button.loading = true;
    button.textContent = 'Saving';
    getContainer().appendChild(button);

    await expectNoViolations();
  });

  it('passes axe checks when an icon-only button is loading', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.iconOnly = true;
    button.loading = true;
    button.innerHTML = '<zd-icon slot="start" name="dismiss" label="Close"></zd-icon>';
    getContainer().appendChild(button);

    await expectNoViolations();
  });
});
