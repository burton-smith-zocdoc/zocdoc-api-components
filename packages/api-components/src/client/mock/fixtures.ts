/**
 * Fixture data for the mock transport and for component tests.
 *
 * Every id, zip code, and scenario name here is copied from the published sandbox
 * test-data guide (https://api-docs.zocdoc.com/guides/testing-data), as PHI-002 and
 * TEST-003 require. Nothing is invented, and nothing resembles a real patient:
 * provider names are drawn from the docs' own placeholder set, and there are no
 * patient records in this file at all — the mock echoes back whatever a caller
 * submits rather than storing a person.
 *
 * Response shapes follow the published OpenAPI bundle v1.177.
 */
import type {
  AppointmentStatus,
  AvailabilitySlot,
  InsurancePlan,
  ProviderLocation,
  ProviderLocationAvailability,
  Specialty,
  VisitReason,
} from '../types.js';

/**
 * Documented sentinel inputs. The mock transport keys its behaviour off these so a
 * demo or story can drive a specific state by passing the same value it would send to
 * the real sandbox — the switch lives in the data, not in a mock-only flag.
 */
export const SCENARIOS = {
  /** Returns results, including booking requirements. */
  zipWithResults: '11201',
  /** Returns no matching provider locations. */
  zipEmpty: '99734',
  /** Returns a 500. */
  zipError: '10112',
  /**
   * Returns no availability. The doubled-up spelling is the docs' own — it is the
   * literal sentinel the sandbox matches on, so correcting it would break the match.
   */
  providerLocationNoAvailability: 'pr_no_availbility|lo_no_availbility',
  /** Returns a 500 on any endpoint that takes a provider location id. */
  providerLocationError: 'pr_error|lo_error',
  /** Requires insurance member id and plan id before booking. */
  providerLocationInsuranceRequired: 'pr_insuranceIdIsRequired|lo_insuranceIdIsRequired',
  /** Rejects `is_self_pay: true`. */
  providerLocationSelfPayNotAccepted: 'pr_selfPayNotAccepted|lo_selfPayNotAccepted',
  /** Rejects a supplied insurance plan. */
  providerLocationInNetworkOnly: 'pr_acceptsInNetworkOnly|lo_acceptsInNetworkOnly',
  /** Booking returns each documented status. See `BOOKINGS` for the full table. */
  providerLocationPending: 'pr_pending|lo_pending',
  providerLocationConfirmed: 'pr_confirmed|lo_confirmed',
  providerLocationBookingFailed: 'pr_bookingfailed|lo_bookingfailed',
  providerLocationCancelled: 'pr_cancelled|lo_cancelled',
  providerLocationNoShow: 'pr_noshow|lo_noshow',
  providerLocationPendingReschedule: 'pr_pendingreschedule|lo_pendingreschedule',
  providerLocationRescheduled: 'pr_rescheduled|lo_rescheduled',
  providerLocationRescheduleFailed: 'pr_reschedulefailed|lo_reschedulefailed',
  /**
   * Invalid plan. Note the status depends on how it is used: as a search filter it is a
   * documented 400, and only a direct `/v1/insurance_plans/ip_0` lookup returns 404.
   */
  insurancePlanMissing: 'ip_0',
} as const;

export const SPECIALTIES: Specialty[] = [
  {
    id: 'sp_153',
    name: 'Primary Care Doctor',
    care_category: 'health',
    default_visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
    default_visit_reason_name: 'New patient visit',
  },
  {
    id: 'sp_154',
    name: 'Dentist',
    care_category: 'dental',
    default_visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
    default_visit_reason_name: 'New patient cleaning',
  },
  {
    id: 'sp_155',
    name: 'Optometrist',
    care_category: 'vision',
    default_visit_reason_id: 'pc_zZWhkaURvEGlZpSimNILaB',
    default_visit_reason_name: 'Routine eye exam',
  },
];

/** Visit reason ids are the ones the appointment test-data table uses. */
export const VISIT_REASONS: VisitReason[] = [
  { id: 'pc_FRO-18leckytNKtruw5dLR', name: 'New patient visit', specialty_id: 'sp_153' },
  { id: 'pc_T1T3MOA0kUuE201i1ZfIWR', name: 'Annual physical', specialty_id: 'sp_153' },
  { id: 'pc_TlZW-r06U0W3pCsIGtSI5B', name: 'New patient cleaning', specialty_id: 'sp_154' },
  { id: 'pc_zZWhkaURvEGlZpSimNILaB', name: 'Routine eye exam', specialty_id: 'sp_155' },
];

/** Plan ids and their documented characteristics, so filters have something to bite on. */
export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'ip_9111',
    name: 'Sandbox National PPO',
    status: 'active',
    care_categories: ['health'],
    coverage_area: { is_national: true, states: [] },
  },
  {
    id: 'ip_2345',
    name: 'Sandbox California HMO',
    status: 'active',
    care_categories: ['health'],
    coverage_area: { is_national: false, states: ['CA'] },
  },
  {
    id: 'ip_2052',
    name: 'Sandbox Medicare',
    program_type: 'medicare',
    status: 'active',
    care_categories: ['health'],
    coverage_area: { is_national: true, states: [] },
  },
  {
    id: 'ip_6501',
    name: 'Sandbox Dental Plan',
    status: 'active',
    care_categories: ['dental'],
    coverage_area: { is_national: true, states: [] },
  },
];

const IN_PERSON_ID = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';
const VIRTUAL_ID = 'pr_ghi123-jkl456_mnop7890|lo_ghi123-jkl456_mnop7890';

/**
 * Five locations covering the branches the results list has to render: an in-person
 * provider, a virtual one, one whose booking requirements force extra form fields, and
 * two dentists — the only specialty here other than primary care, so a search filtered by
 * `specialty_id` has something to actually filter to.
 */
export const PROVIDER_LOCATIONS: ProviderLocation[] = [
  {
    provider_location_id: IN_PERSON_ID,
    provider_location_type: 'in_person_provider',
    accepts_patient_insurance: 'accepted',
    first_availability_date_in_provider_local_time: '2026-08-05',
    provider: {
      provider_id: 'pr_abc123-def456_wxyz7890',
      first_name: 'Avery',
      last_name: 'Sandoval',
      title: 'MD',
      specialties: ['Primary Care Doctor'],
      specialty_ids: ['sp_153'],
      default_visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
      provider_photo_url: '/images/michael-scott.png',
      /*
       * The profile fields, populated on this location only — a second location with none of
       * them is what lets `zd-provider-profile` be shown doing the thing it does most often,
       * which is dropping a section it has no data for.
       *
       * Provider-authored copy, not patient copy: a `statement` is marketing text a practice
       * writes about itself, so there is no patient in it to redact (PHI-002). The newlines
       * are deliberate — production returns them, and the profile is what has to keep them.
       */
      statement:
        'I have practised primary care in Brooklyn for twelve years, and most of the people I see I have seen before.\n\nMy approach is unhurried: I would rather spend the visit understanding what changed than work through a checklist.',
      languages: ['English', 'Spanish'],
      credentials: {
        certifications: ['American Board of Family Medicine', 'Advanced Cardiac Life Support'],
        education: {
          institutions: [
            'Sandbox University School of Medicine',
            'Sandbox General Hospital — Family Medicine Residency',
          ],
        },
      },
    },
    practice: {
      practice_id: 'pt_abc123-def456_wxyz7890',
      practice_name: 'Sandbox Health Partners',
    },
    location: {
      location_name: 'Sandbox Plaza Family Medicine',
      address1: '1 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      latitude: 40.6955,
      longitude: -73.9909,
      /*
       * The 555-0100 block is reserved for fiction, so this number cannot reach anyone
       * (PHI-002). It is punctuated the way a practice would type it rather than normalised,
       * because normalising it here would hide the fact that `telHref` has to.
       */
      phone_number: '(555) 555-0100',
      phone_extension: null,
      time_zone: 'America/New_York',
      distance_to_patient_mi: 0.8,
    },
    booking_requirements: {
      required_fields: [],
      accepts_booking_requests_from: ['in_network', 'out_of_network', 'self_pay'],
    },
  },
  {
    provider_location_id: VIRTUAL_ID,
    provider_location_type: 'virtual_provider',
    accepts_patient_insurance: 'accepted',
    first_availability_date_in_provider_local_time: '2026-08-04',
    provider: {
      provider_id: 'pr_ghi123-jkl456_mnop7890',
      first_name: 'Rowan',
      last_name: 'Okonkwo',
      title: 'DO',
      specialties: ['Primary Care Doctor'],
      specialty_ids: ['sp_153'],
      default_visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
      provider_photo_url: '/images/pam-beesly.png',
    },
    // `state` is singular on a virtual location — one code, not a served-states list.
    virtual_location: { state: 'NY', time_zone: 'America/New_York' },
    booking_requirements: {
      required_fields: [],
      accepts_booking_requests_from: ['in_network', 'self_pay'],
    },
  },
  {
    provider_location_id: SCENARIOS.providerLocationInsuranceRequired,
    provider_location_type: 'in_person_provider',
    accepts_patient_insurance: 'accepted',
    first_availability_date_in_provider_local_time: '2026-08-06',
    provider: {
      provider_id: 'pr_insuranceIdIsRequired',
      first_name: 'Kai',
      last_name: 'Lindqvist',
      title: 'MD',
      specialty_ids: ['sp_153'],
      default_visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
      provider_photo_url: '/images/andy-bernard.png',
    },
    location: {
      address1: '2 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      latitude: 40.6931,
      longitude: -73.9903,
      time_zone: 'America/New_York',
      distance_to_patient_mi: 1.4,
    },
    booking_requirements: {
      required_fields: [
        'data.patient.insurance.insurance_plan_id',
        'data.patient.insurance.insurance_member_id',
      ],
      accepts_booking_requests_from: ['in_network'],
    },
  },
  /*
   * The two dentists. Their ids are the documented `pending_booking` and `confirmed`
   * sentinels rather than invented ones (PHI-002), which is worth more than tidiness: the
   * two of them are the two statuses that mean a booking happened, so booking one dentist
   * and then the other walks a demo through both — and `pending_booking` is the one a
   * confirmation screen is most likely to get wrong.
   */
  {
    provider_location_id: SCENARIOS.providerLocationPending,
    provider_location_type: 'in_person_provider',
    accepts_patient_insurance: 'accepted',
    first_availability_date_in_provider_local_time: '2026-08-05',
    provider: {
      provider_id: 'pr_pending',
      first_name: 'Imani',
      last_name: 'Whitfield',
      title: 'DDS',
      specialties: ['Dentist'],
      specialty_ids: ['sp_154'],
      default_visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
      languages: ['English'],
      provider_photo_url: '/images/dwight-schrute.png',
    },
    practice: {
      practice_id: 'pt_ghi123-jkl456_wxyz7890',
      practice_name: 'Sandbox Dental Group',
    },
    location: {
      location_name: 'Sandbox Plaza Dental',
      address1: '3 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      latitude: 40.6942,
      longitude: -73.9895,
      // The 555-0100 block is reserved for fiction, so this number cannot reach anyone (PHI-002).
      phone_number: '(555) 555-0101',
      phone_extension: null,
      time_zone: 'America/New_York',
      distance_to_patient_mi: 0.5,
    },
    booking_requirements: {
      required_fields: [],
      accepts_booking_requests_from: ['in_network', 'out_of_network', 'self_pay'],
    },
  },
  {
    provider_location_id: SCENARIOS.providerLocationConfirmed,
    provider_location_type: 'in_person_provider',
    accepts_patient_insurance: 'accepted',
    first_availability_date_in_provider_local_time: '2026-08-04',
    provider: {
      provider_id: 'pr_confirmed',
      first_name: 'Tobias',
      last_name: 'Meier',
      title: 'DMD',
      specialties: ['Dentist'],
      specialty_ids: ['sp_154'],
      default_visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
      languages: ['English', 'German'],
      provider_photo_url: '/images/jim-halpert.png',
    },
    practice: {
      practice_id: 'pt_jkl123-mno456_wxyz7890',
      practice_name: 'Sandbox Dental Group',
    },
    location: {
      location_name: 'Sandbox Heights Dental',
      address1: '4 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      latitude: 40.6968,
      longitude: -73.9921,
      phone_number: '(555) 555-0102',
      phone_extension: null,
      time_zone: 'America/New_York',
      distance_to_patient_mi: 1.1,
    },
    booking_requirements: {
      required_fields: [],
      accepts_booking_requests_from: ['in_network', 'out_of_network', 'self_pay'],
    },
  },
];

/**
 * Slots are generated relative to a caller-supplied date rather than hardcoded, because
 * a fixed date would drift into the past and the availability endpoint rejects requests
 * more than 150 days out. The generator is deterministic for a given input so tests and
 * stories stay reproducible.
 */
export function buildTimeslots(startDate: string, times: string[]): AvailabilitySlot[] {
  // `booking_url: null` rather than omitted, because that is what production sends — it was
  // null in all 165 timeslots recorded on 2026-08-04, despite the spec typing it as a
  // non-nullable string. Omitting it here would let a consumer written against the mock use
  // `=== undefined` and pass, then miss the real null.
  return times.map((time) => ({ start_time: `${startDate}T${time}:00-04:00`, booking_url: null }));
}

/** Half-hour slots with a midday gap, so a picker has both a run and a break to render. */
const SLOT_TIMES = ['09:00', '09:30', '10:00', '11:00', '13:00', '14:00', '15:30', '16:00'];

/**
 * Adds days to a `YYYY-MM-DD` string, staying in that calendar.
 *
 * `new Date('2026-08-05')` parses as UTC midnight while `getDate()` reads the browser's
 * local date, so the two disagree for anyone west of Greenwich and the walk would repeat
 * or skip a day. Reading the parts out and letting `Date.UTC` normalise month ends keeps
 * it correct in every zone.
 */
function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Which days of a window carry slots. Deliberately not every day: a real practice is
 * closed some days, and a picker that only ever sees a contiguous run does not prove its
 * day strip handles gaps. Deterministic, so the same window always yields the same days.
 */
function availableDays(startDate: string, days: number): string[] {
  return Array.from({ length: days }, (_, offset) => offset)
    .filter((offset) => offset % 3 !== 2)
    .map((offset) => addDays(startDate, offset));
}

/**
 * What booking each documented provider location yields, keyed by provider location id.
 *
 * Both the status and the appointment id are the sandbox's own, so a demo driven through
 * the mock and the same demo pointed at the real sandbox produce identical output. All
 * eight statuses are reachable, which matters because only two of them mean "booked":
 * `booking_failed` in particular arrives on a 200 and must not read as success.
 */
export const BOOKINGS: Record<string, { status: AppointmentStatus; appointmentId: string }> = {
  [SCENARIOS.providerLocationPending]: {
    status: 'pending_booking',
    appointmentId: '2b29f79b-6d7f-472a-9603-d0c378bc9531',
  },
  [SCENARIOS.providerLocationConfirmed]: {
    status: 'confirmed',
    appointmentId: 'd2ee5bd8-643a-42c8-8c5a-be450e903430',
  },
  [SCENARIOS.providerLocationBookingFailed]: {
    status: 'booking_failed',
    appointmentId: '34e4ead3-ca69-4448-9438-58702dd1048f',
  },
  [SCENARIOS.providerLocationCancelled]: {
    status: 'cancelled',
    appointmentId: '21990114-ea71-4d7d-9d1e-00c43ae44bcd',
  },
  [SCENARIOS.providerLocationNoShow]: {
    status: 'no_show',
    appointmentId: 'a0a7770d-e667-416c-9f06-9c3b40a7bb84',
  },
  [SCENARIOS.providerLocationPendingReschedule]: {
    status: 'pending_reschedule',
    appointmentId: '63f995c2-49c4-40c8-a93a-140fb32e913b',
  },
  [SCENARIOS.providerLocationRescheduled]: {
    status: 'rescheduled',
    appointmentId: '8507d05f-cbe5-4732-b72a-22add9c80120',
  },
  [SCENARIOS.providerLocationRescheduleFailed]: {
    status: 'reschedule_failed',
    appointmentId: '84d04f67-b2cf-4afd-ab64-193072498ed5',
  },
};

/** Booking a location with no documented sentinel confirms, as the sandbox does. */
export const DEFAULT_BOOKING = {
  status: 'confirmed' as AppointmentStatus,
  appointmentId: 'd2ee5bd8-643a-42c8-8c5a-be450e903430',
};

/**
 * One entry for one provider location, with slots spread across `days` of the window.
 *
 * `days` defaults to 1 so a caller that only cares about a single date does not have to
 * think about the window. The transport passes the real span, because a day picker with
 * one day in it does not exercise anything a picker does.
 */
export function buildAvailability(
  providerLocationId: string,
  startDate: string,
  days = 1
): ProviderLocationAvailability {
  // The no-availability sentinel must come back present-but-empty, not absent: the
  // endpoint returns one entry per requested location either way. `first_availability` is
  // explicitly null, matching production — recorded 2026-08-04, where 9 of 10 batched
  // locations came back exactly like this.
  if (providerLocationId === SCENARIOS.providerLocationNoAvailability) {
    return { provider_location_id: providerLocationId, first_availability: null, timeslots: [] };
  }

  const timeslots = availableDays(startDate, days).flatMap((date) =>
    buildTimeslots(date, SLOT_TIMES)
  );
  return {
    provider_location_id: providerLocationId,
    first_availability: timeslots[0],
    timeslots,
  };
}
