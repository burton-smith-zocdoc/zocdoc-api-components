import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createTestContainer,
  describeA11y,
  expectNoViolations,
  getContainer,
  waitForUpdate,
} from '../../test/a11y.js';
import type { ZdAlert, ZdAlertVariant } from './alert.js';

const VARIANTS: ZdAlertVariant[] = ['info', 'success', 'warning', 'danger'];

/** The glyph each severity is expected to draw, mirroring `VARIANT_ICONS`. */
const VARIANT_ICONS: Record<ZdAlertVariant, string> = {
  info: 'info-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger: 'error-circle',
};

/**
 * `open` matters: closed, the alert is `opacity: 0` and axe factors opacity into
 * the color it thinks the text is, so a contrast check on a closed alert measures
 * nothing. The transition is pinned to `none` for the same reason — 100ms into a
 * 300ms fade the alert is a third of the way to its real color.
 */
function makeAlert(text: string, variant?: ZdAlertVariant): ZdAlert {
  const alert = document.createElement('zd-alert') as ZdAlert;
  if (variant) alert.variant = variant;
  alert.style.setProperty('--zd-alert-transition', 'none');
  alert.open = true;
  alert.textContent = text;
  return alert;
}

function shadow(alert: ZdAlert): ShadowRoot {
  const root = alert.shadowRoot;
  if (!root) throw new Error('zd-alert rendered no shadow root');
  return root;
}

describe('zd-alert severity', () => {
  let container: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    ({ container, cleanup } = createTestContainer());
  });

  afterEach(() => cleanup());

  async function mount(alert: ZdAlert): Promise<ZdAlert> {
    container.appendChild(alert);
    await waitForUpdate();
    return alert;
  }

  it('reflects the variant so the token overrides apply', async () => {
    const alert = await mount(makeAlert('Booking failed.', 'danger'));

    // The styles key off `:host([variant='danger'])`, so a variant that stays a
    // property and never reaches the attribute would silently render as neutral.
    expect(alert.getAttribute('variant')).toBe('danger');
  });

  it.each(VARIANTS)('draws the %s glyph', async (variant) => {
    const alert = await mount(makeAlert(`A ${variant} alert.`, variant));

    const icon = shadow(alert).querySelector('zd-icon');
    expect(icon?.getAttribute('name')).toBe(VARIANT_ICONS[variant]);
    expect(shadow(alert).querySelector('[part="alert-icon"]')?.hasAttribute('hidden')).toBe(false);
  });

  /*
   * Severity is already in the message text, so a labelled icon would announce it
   * twice. `zd-icon` renders `aria-hidden` only when it has no `label`, which also
   * keeps the severity out of an attribute browser translation cannot reach
   * (I18N-001).
   */
  it('draws the glyph decoratively, not as a second announcement', async () => {
    const alert = await mount(makeAlert('Booking failed.', 'danger'));

    const icon = shadow(alert).querySelector('zd-icon');
    expect(icon?.hasAttribute('label')).toBe(false);
    expect(
      icon?.shadowRoot?.querySelector('[part="icon-base"][aria-hidden="true"]')
    ).not.toBeNull();
  });

  it('keeps the icon container collapsed with no variant and no slotted icon', async () => {
    const alert = await mount(makeAlert('Your appointment has been booked.'));

    // Otherwise every plain alert pays the icon's width and margin for nothing.
    expect(shadow(alert).querySelector('[part="alert-icon"]')?.hasAttribute('hidden')).toBe(true);
    expect(shadow(alert).querySelector('zd-icon')).toBeNull();
  });

  it('lets a slotted icon win over the severity glyph', async () => {
    const alert = makeAlert('', 'warning');
    alert.textContent = 'Insurance not verified.';
    const slotted = document.createElement('zd-icon');
    slotted.setAttribute('slot', 'icon');
    slotted.setAttribute('name', 'warning-shield');
    alert.appendChild(slotted);

    await mount(alert);

    // Slot fallback content is inert once the slot is filled, so the assigned
    // nodes are what to check — the fallback still sits in the shadow root.
    const slot = shadow(alert).querySelector<HTMLSlotElement>('slot[name="icon"]');
    expect(slot?.assignedElements()).toEqual([slotted]);
  });
});

describeA11y('zd-alert', () => {
  it('passes axe checks with default variant', async () => {
    const el = makeAlert('This is an alert message.');
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks with variant="%s"', async (variant) => {
    const el = makeAlert(`This is a ${variant} alert.`, variant);
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  /*
   * The composite the API components render for a failed request, and the one that
   * actually stresses the variant tokens: a heading, a dismiss button, and a
   * `secondary` button sitting on the severity's surface. Charm points the dismiss
   * button at `surface-secondary`, which in the dark scheme is a dark gray under a
   * dark `on-danger-200` glyph — this is the case that catches it if the
   * transparent override is ever dropped.
   */
  it.each(VARIANTS)(
    'passes axe checks with variant="%s", a heading, and actions',
    async (variant) => {
      const el = makeAlert('', variant);
      el.heading = 'Something happened';
      el.dismissible = true;
      el.append('We could not complete your booking.');

      const action = document.createElement('zd-button');
      action.setAttribute('slot', 'action');
      action.setAttribute('variant', 'secondary');
      action.setAttribute('size', 'small');
      action.textContent = 'Try again';
      el.appendChild(action);

      getContainer().appendChild(el);
      await waitForUpdate();

      await expectNoViolations();
    }
  );
});
