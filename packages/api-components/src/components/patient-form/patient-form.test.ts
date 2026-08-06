import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

type FormEl = HTMLElement & {
  values: Record<string, string>;
  notes: string;
  busy: boolean;
  submit(): void;
};

/** A Charm form control, as far as these tests need to see it. */
type Control = HTMLElement & { value: string; invalid: boolean; errorMessage: string };

/**
 * Every value here is a synthetic placeholder, not a redaction of a real one (PHI-002,
 * TEST-003). `example.test` is a reserved TLD, so the address cannot route anywhere, and
 * `555` is the reserved fictional exchange. The ZIP is the documented sandbox scenario ZIP
 * rather than an invented one.
 */
const COMPLETE = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '5551234567',
  email_address: 'test@example.test',
  address1: '1 Test St',
  city: 'Brooklyn',
  state: 'NY',
  zip_code: SCENARIOS.zipWithResults,
} as const;

function field(element: FormEl, name: string): Control {
  return part<Control>(element, name);
}

/**
 * `submit()` moves focus after the render that puts the error messages in place, so it
 * awaits `updateComplete` internally. Awaiting twice lets that continuation run before the
 * test looks at focus — the first await only gets as far as the same update.
 */
async function submitAndSettle(element: FormEl): Promise<void> {
  element.submit();
  await settled(element);
  await settled(element);
}

async function fill(element: FormEl): Promise<void> {
  element.values = { ...COMPLETE };
  await settled(element);
}

function listen(element: FormEl): CustomEvent[] {
  const events: CustomEvent[] = [];
  element.addEventListener('patient-submit', (event) => events.push(event as CustomEvent));
  return events;
}

describe('zd-patient-form', () => {
  it('does not emit when required fields are missing', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');

    const events = listen(el);
    el.submit();

    expect(events).toHaveLength(0);
  });

  it('emits a correctly shaped patient object when complete', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);

    const events = listen(el);
    el.submit();

    expect(events).toHaveLength(1);
    const { patient } = events[0]!.detail;
    expect(patient.first_name).toBe('Test');
    expect(patient.patient_address).toEqual({
      address1: '1 Test St',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: SCENARIOS.zipWithResults,
    });
  });

  it('rejects a phone number that is not 10 digits', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.values = { ...el.values, phone_number: '555-123-4567' };
    await settled(el);

    const events = listen(el);
    await submitAndSettle(el);

    expect(events).toHaveLength(0);

    /*
     * The message lands on the phone field rather than in a summary at the bottom of the
     * form, which is the whole point of A11Y-004's error association — asserting it is
     * merely present somewhere in the form would pass for an unassociated error too.
     */
    const phone = field(el, 'phone-number');
    expect(phone.errorMessage).toContain('10 digits');
    expect(phone.invalid).toBe(true);
    expect(shadow(phone).textContent).toContain('10 digits');
  });

  it('caps notes at 100 characters', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await settled(el);

    const notes = shadow(el).querySelector('[part="notes"]');
    expect(notes?.getAttribute('maxlength')).toBe('100');
  });

  it('reports a missing required field against that field', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.values = { ...el.values, city: '' };
    await settled(el);

    await submitAndSettle(el);

    const city = field(el, 'city');
    expect(city.invalid).toBe(true);
    // The label, never the value — that is PHI-001 in a validation message.
    expect(city.errorMessage).toBe('City is required.');
  });

  it('moves focus to the first field that failed, in page order', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    // Last name comes before city on the page, so it wins even though city is set second.
    el.values = { ...el.values, last_name: '', city: '' };
    await settled(el);

    await submitAndSettle(el);

    /*
     * Focus is what announces the failure — there is no summary live region, deliberately.
     * Charm's controls delegate focus, so the form's shadow root reports the control host.
     */
    expect(shadow(el).activeElement).toBe(field(el, 'last-name'));
  });

  it('clears a field error once the value is fixed', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.values = { ...el.values, phone_number: '' };
    await settled(el);
    await submitAndSettle(el);
    expect(field(el, 'phone-number').invalid).toBe(true);

    el.values = { ...el.values, phone_number: COMPLETE.phone_number };
    const events = listen(el);
    await submitAndSettle(el);

    expect(events).toHaveLength(1);
    // Charm only leaves the invalid state through setCustomValidity(''), so a stale message
    // would otherwise sit under a field that is now fine.
    expect(field(el, 'phone-number').invalid).toBe(false);
    expect(field(el, 'phone-number').errorMessage).toBe('');
  });

  it('normalizes values on the way out without rewriting what was typed', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    el.values = { ...COMPLETE, state: 'ny', zip_code: ` ${SCENARIOS.zipWithResults} ` };
    await settled(el);

    const events = listen(el);
    el.submit();

    const { patient } = events[0]!.detail;
    expect(patient.patient_address.state).toBe('NY');
    expect(patient.patient_address.zip_code).toBe(SCENARIOS.zipWithResults);
    // The patient's own text is still in the field they are looking at.
    expect(el.values.state).toBe('ny');
  });

  it('omits notes when empty and sends them when set', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);

    const events = listen(el);
    el.submit();
    expect(events[0]!.detail.notes).toBeUndefined();

    el.notes = 'Wheelchair access needed.';
    await settled(el);
    el.submit();
    expect(events[1]!.detail.notes).toBe('Wheelchair access needed.');
  });

  /**
   * A booking is not idempotent, so a second submit while the first is still in flight books
   * a second appointment. The listener guards the request; the form guards the button, and
   * `submit()` too, because Enter reaches `requestSubmit()` without touching the button.
   */
  it('refuses to submit again while busy', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.busy = true;
    await settled(el);

    const events = listen(el);
    el.submit();

    expect(events).toHaveLength(0);
    expect(shadow(el).querySelector('[part="submit"]')).toHaveProperty('disabled', true);
  });

  /**
   * The PHI guard that is easy to lose to a one-word change: adding `reflect` or dropping
   * `attribute: false` on `values` would put a patient's name into the host's markup, where
   * `outerHTML`, a DOM snapshot, or a session replay tool would collect it (PHI-001).
   */
  it('keeps field values out of the DOM as attributes', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.notes = 'Wheelchair access needed.';
    await settled(el);

    expect(el.getAttributeNames()).not.toContain('values');
    expect(el.getAttributeNames()).not.toContain('notes');
    expect(el.outerHTML).not.toContain(COMPLETE.last_name);
    expect(el.outerHTML).not.toContain('Wheelchair');
  });

  describe('accessibility', () => {
    it('passes axe checks when empty', async () => {
      const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');

      await expectNoViolations(el);
    });

    it('passes axe checks when filled in', async () => {
      const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
      await fill(el);

      await expectNoViolations(el);
    });

    /*
     * The state A11Y-005 exists for. Ten simultaneous errors is the case where a form's
     * markup usually comes apart: labels, `aria-invalid`, and the error text all have to
     * stay associated per field, and the error text has to clear contrast on its own
     * colour.
     */
    it('passes axe checks with every field in error', async () => {
      const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
      await submitAndSettle(el);

      await expectNoViolations(el);
    });
  });
});
