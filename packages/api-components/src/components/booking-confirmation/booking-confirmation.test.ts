import { describe, expect, it } from 'vitest';
import { BOOKINGS, DEFAULT_BOOKING, SCENARIOS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, shadow } from '../../utils/test/mount.js';
import './index.js';

/**
 * The sandbox's own ids and statuses rather than invented ones (TEST-003). `PENDING`
 * matters more than it looks: a manual-confirmation practice returns a 200 with
 * `pending_booking`, and this component is the last thing a patient reads about it.
 */
const CONFIRMED = DEFAULT_BOOKING.appointmentId;
const PENDING = BOOKINGS[SCENARIOS.providerLocationPending]!.appointmentId;

/** A provider name, not a patient's — the fixture directory's own (PHI-002). */
const PROVIDER = 'Dr. Avery Sandoval, MD';

/**
 * 9 AM at a practice on `-04:00`. The offset is the point: the runner's zone is UTC, so a
 * naive `new Date()` would render this as 13:00.
 */
const START_TIME = '2026-08-05T09:00:00-04:00';

type Confirmation = HTMLElement & { status: string; startTime?: string };

/**
 * Recursively collects text content from an element and all nested shadow roots.
 * Necessary because Charm components render attributes like `heading` inside their
 * own shadow DOM, which `textContent` on the outer shadow root doesn't reach.
 */
function collectText(node: Node): string {
  let result = '';

  if (node instanceof Element && node.shadowRoot) {
    result += collectText(node.shadowRoot);
  }

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent ?? '';
    } else if (child instanceof Element) {
      result += collectText(child);
    }
  }

  return result;
}

function text(element: HTMLElement): string {
  return collectText(shadow(element));
}

function mountConfirmed(): Promise<Confirmation> {
  return mount<Confirmation>(
    `<zd-booking-confirmation appointment-id="${CONFIRMED}"></zd-booking-confirmation>`
  );
}

describe('zd-booking-confirmation', () => {
  it('shows the appointment id', async () => {
    const el = await mountConfirmed();

    expect(text(el)).toContain(CONFIRMED);
  });

  it('renders nothing without an appointment id', async () => {
    const el = await mount<Confirmation>('<zd-booking-confirmation></zd-booking-confirmation>');

    expect(text(el).trim()).toBe('');
  });

  /**
   * Charm puts the role and `aria-live` on an element inside the alert's own shadow root,
   * derived from `politeness`. Asserting it there rather than on the host is what keeps this
   * test from passing against a second, nested live region (A11Y-002).
   */
  it('exposes the confirmation as a polite live region', async () => {
    const el = await mountConfirmed();

    const alert = shadow(el).querySelector<HTMLElement>('[part="confirmation"]');
    expect(alert).not.toBeNull();
    expect(alert!.getAttribute('role')).toBeNull();

    const base = alert!.shadowRoot?.querySelector('[part="alert-base"]');
    expect(base?.getAttribute('role')).toBe('status');
    expect(base?.getAttribute('aria-live')).toBe('polite');
  });

  it('names the provider when it is given one', async () => {
    const el = await mount<Confirmation>(
      `<zd-booking-confirmation
         appointment-id="${CONFIRMED}"
         provider-name="${PROVIDER}"
       ></zd-booking-confirmation>`
    );

    expect(text(el)).toContain(PROVIDER);
  });

  /*
   * The regression the availability picker guards too: `start_time` carries the provider's
   * offset, and the appointment is whatever the practice's clock says. Matched loosely
   * because the locale decides the separator and the 12- or 24-hour clock; the hour is what
   * must not move.
   */
  it('renders the time in the provider’s zone, not the browser’s', async () => {
    const el = await mount<Confirmation>(
      `<zd-booking-confirmation
         appointment-id="${CONFIRMED}"
         start-time="${START_TIME}"
       ></zd-booking-confirmation>`
    );

    expect(shadow(el).querySelector('[part="when"]')?.textContent).toMatch(/\b9[:.]00\b/);
  });

  /**
   * `start-time` is an attribute a host page sets by hand, and `Intl.DateTimeFormat` throws
   * on an invalid date. Inside `render()` that would take the confirmation number down with
   * it, so the line is dropped instead.
   */
  it('drops the time rather than throwing on an unparseable start-time', async () => {
    const el = await mount<Confirmation>(
      `<zd-booking-confirmation
         appointment-id="${CONFIRMED}"
         start-time="whenever"
       ></zd-booking-confirmation>`
    );

    expect(shadow(el).querySelector('[part="when"]')).toBeNull();
    expect(text(el)).toContain(CONFIRMED);
  });

  /**
   * The wording that stops a patient being told an appointment is confirmed when the
   * practice has yet to accept it. `pending_booking` arrives on a 200 like `confirmed` does.
   */
  it('words a pending booking as a request rather than a confirmation', async () => {
    const el = await mount<Confirmation>(
      `<zd-booking-confirmation
         appointment-id="${PENDING}"
         status="pending_booking"
       ></zd-booking-confirmation>`
    );

    expect(text(el)).toContain('request was sent');
    expect(text(el)).not.toContain('is confirmed');
    expect(text(el)).toContain('still has to accept');
  });

  /**
   * A booking that failed is the flow's error state, not a confirmation to dress up
   * (COMP-001). `booking_failed` also arrives on a 200, which is what makes this worth a
   * test rather than an assumption.
   */
  it('renders nothing for a status that is not a successful booking', async () => {
    const el = await mount<Confirmation>(
      `<zd-booking-confirmation
         appointment-id="${BOOKINGS[SCENARIOS.providerLocationBookingFailed]!.appointmentId}"
         status="booking_failed"
       ></zd-booking-confirmation>`
    );

    expect(text(el).trim()).toBe('');
  });

  describe('accessibility', () => {
    it('passes axe checks when confirmed', async () => {
      const el = await mount<Confirmation>(
        `<zd-booking-confirmation
           appointment-id="${CONFIRMED}"
           start-time="${START_TIME}"
           provider-name="${PROVIDER}"
         ></zd-booking-confirmation>`
      );

      await expectNoViolations(el);
    });

    /* A different variant, so a different token pair to check the text against. */
    it('passes axe checks when pending', async () => {
      const el = await mount<Confirmation>(
        `<zd-booking-confirmation
           appointment-id="${PENDING}"
           status="pending_booking"
           start-time="${START_TIME}"
         ></zd-booking-confirmation>`
      );

      await expectNoViolations(el);
    });
  });
});
