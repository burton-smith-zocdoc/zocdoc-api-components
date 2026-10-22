import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import * as referenceData from '../../client/reference-data.js';
import { jsonBlock } from '../../utils/test/hydration.js';
import { mount } from '../../utils/test/mount.js';
import '../appointment/index.js';
import '../booking/index.js';
import '../booking-confirmation/index.js';
import '../patient-form/index.js';
import '../sign-in/index.js';

/** Lets `vi.spyOn` redefine the client exports in browser mode (TEST-002). */
vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

/**
 * The components that handle patient data or the booking flow offer no properties to markup, so a
 * page can't seed them, and a stray block is ignored without a warning that would name it.
 * Invented values only (PHI-002).
 */
const BOUNDARY: Record<string, string[]> = {
  'zd-patient-form': ['values', 'notes', 'insurancePlanId', 'requiredFields'],
  'zd-appointment': ['appointment', 'providerLocation', 'actionError', 'rescheduleTimeslots'],
  'zd-booking-confirmation': [
    'appointmentId',
    'startTime',
    'status',
    'providerName',
    'locationPhone',
    'locationPhoneExtension',
    'waitingRoomUrl',
  ],
  'zd-sign-in': ['auth', 'email'],
  'zd-booking': ['providers'],
};

const SEEDED: Record<string, unknown> = {
  values: { first_name: 'Test' },
  notes: { text: 'test' },
  insurancePlanId: { id: 'ip_test' },
  requiredFields: ['first_name'],
  appointment: { appointment_id: 'ap_test' },
  providerLocation: { provider_location_id: 'pr_test|lo_test' },
  actionError: { message: 'test' },
  rescheduleTimeslots: [],
  appointmentId: { id: 'ap_test' },
  startTime: { value: 'test' },
  status: { value: 'cancelled' },
  providerName: { value: 'Dr. Test' },
  locationPhone: { value: 'test' },
  locationPhoneExtension: { value: 'test' },
  waitingRoomUrl: { value: 'https://www.zocdoc.com/test' },
  auth: { signIn: 'test' },
  email: { value: 'test@example.test' },
  providers: [{ provider_location_id: 'pr_test|lo_test' }],
};

describe('components that never hydrate', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'getAppointment').mockResolvedValue(undefined as never);
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(Object.entries(BOUNDARY))('%s ignores data blocks', async (tag, names) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const defaults = document.createElement(tag) as unknown as Record<string, unknown>;
    const blocks = names.map((name) => jsonBlock(name, SEEDED[name])).join('');

    const element = (await mount(`<${tag}>${blocks}</${tag}>`)) as unknown as Record<
      string,
      unknown
    >;

    expect(Object.fromEntries(names.map((name) => [name, element[name]]))).toEqual(
      Object.fromEntries(names.map((name) => [name, defaults[name]]))
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
