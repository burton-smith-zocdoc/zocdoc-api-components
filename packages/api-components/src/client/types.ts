/**
 * Shapes recorded in `docs/api-contract-notes.md` (OpenAPI v1.177). Field names
 * are the API's own snake_case — these types describe the wire format, so they
 * are deliberately not camelCased. Endpoint wrappers take camelCase params and
 * translate; only the response types stay snake_case.
 *
 * Fields the spec marks required are required here; fields whose requiredness the
 * spec leaves unstated are optional, so a missing one surfaces as `undefined`
 * rather than a lie in the type.
 *
 * ## `| null` is not decoration
 *
 * The published spec declares `openapi: 3.0.0`, in which `nullable: true` is the
 * only way to say a value may be null — and the string `nullable` appears **zero
 * times** in the whole document. It is therefore no evidence of non-nullability.
 * Production returns `null` at eight field paths we have actually recorded, every
 * one of them typed as a plain `string` or `$ref` in the spec.
 *
 * So: `?: string` here means "the key may be absent". `?: string | null` means
 * "absent, or explicitly null" — and every field carrying it was *observed* null on
 * production, not guessed. Those two are not interchangeable: `x === undefined`
 * silently misses `null`, while `x ?? fallback` and truthiness checks handle both.
 * Prefer the latter. When adding a field, assume it can be null unless a recorded
 * fixture shows otherwise.
 *
 * See "Search and availability" in `docs/api-contract-notes.md` for the full list.
 */

/** Present on every response, paged or not. Useful when reporting a failure upstream. */
export interface ZocdocResponse<T> {
  request_id: string;
  data: T;
}

/**
 * `/v1/specialties`, `/v1/visit_reasons`, `/v1/insurance_plans`, and
 * `/v1/provider_locations`. Note `data` is an array on the first three but an
 * object on provider_locations, which is why this is generic rather than `T[]`.
 */
export interface ZocdocPagedResponse<T> extends ZocdocResponse<T> {
  page: number;
  page_size: number;
  total_count: number;
  /**
   * Fully-qualified URL of the next page, or **`''` on the last page** — measured against
   * production 2026-08-04, not inferred. The spec says "null if this is the last page",
   * which is wrong, so `=== null` is not a valid end-of-pages test and would loop forever.
   * `| null` is kept only so the spec's stated shape cannot break parsing; prefer a
   * falsiness check, or page by `total_count` as `fetchAllPages` does.
   */
  next_url: string | null;
}

/** Documented on 400. `errors[].message` is upstream text — never show it to a user (CLIENT-003). */
export interface ZocdocErrorResponse {
  request_id: string;
  error_type: 'api_error' | 'invalid_request';
  errors: { field?: string; message: string }[];
}

export type CareCategory = 'health' | 'dental' | 'vision';
export type PatientType = 'new' | 'existing';
export type VisitType = 'all' | 'in_person' | 'video_visit';

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export interface Specialty {
  id: string;
  name: string;
  care_category: CareCategory;
  default_visit_reason_id: string;
  default_visit_reason_name: string;
}

export interface VisitReason {
  id: string;
  name: string;
  specialty_id: string;
}

export interface InsuranceCarrier {
  id: string;
  name: string;
}

/** Spec enum, corroborated 2026-08-04 against production: every observed value is listed. */
export type InsuranceProgramType =
  | 'commercial'
  | 'commercial_exchange'
  | 'medicare'
  | 'medicaid'
  | 'workers_compensation'
  | 'uncategorized'
  | 'medicare_advantage'
  | 'medicaid_managed_care'
  | 'federal';

/** Spec enum. Only `active` comes back unfiltered, since the endpoint defaults to it. */
export type InsuranceStatus = 'inactive' | 'active' | 'deleted';

export interface InsurancePlan {
  id: string;
  name: string;
  carrier?: InsuranceCarrier;
  /**
   * Deliberately `string`, not a union. The spec gives no enum for this field — only a
   * prose list (HMO, PPO, POS, EPO, Indemnity, ASO, ACO, ACP) that production
   * contradicts: a 100-plan sample returned `epo`, `hmo`, `hmo_pos`, `indemnity`,
   * `medicaid`, `other`, `pos`, `ppo`, and `uncategorized` — lowercase, and four of
   * those appear nowhere in the prose. A closed union would reject valid data.
   */
  network_type?: string;
  program_type?: InsuranceProgramType;
  status?: InsuranceStatus;
  care_categories?: CareCategory[];
  coverage_area?: {
    is_national: boolean;
    states: string[];
  };
  ref_metadata?: {
    created_timestamp_utc: string;
    last_updated_timestamp_utc: string;
  };
}

// ---------------------------------------------------------------------------
// Provider locations
// ---------------------------------------------------------------------------

export type ProviderLocationType = 'in_person_provider' | 'virtual_provider';
export type InsuranceAcceptance = 'accepted' | 'not_accepted' | 'insurance_not_specified';
export type BookingRequestSource = 'in_network' | 'out_of_network' | 'self_pay';

export interface Provider {
  provider_id: string;
  npi?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  full_name?: string;
  gender_identity?: string;
  specialties?: string[];
  specialty_ids?: string[];
  default_visit_reason_id?: string;
  visit_reason_ids?: string[];
  statement?: string;
  /** Protocol-relative (`//d2uur…`), so it needs an `https:` prefix in some contexts. */
  provider_photo_url?: string;
  languages?: string[];
  profile_url?: string;
  credentials?: {
    certifications?: string[];
    education?: { institutions?: string[] };
  };
}

export interface Location {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  phone_number?: string;
  /** Observed `null` on production, not absent — see the nullability note above. */
  phone_extension?: string | null;
  /** IANA zone, e.g. `America/New_York`. Needed to render times in the provider's zone. */
  time_zone?: string;
  distance_to_patient_mi?: number;
}

export interface ProviderLocation {
  /**
   * Composite id containing a literal `|`, e.g. `pr_abc…|lo_abc…`. Must be
   * percent-encoded in query strings and paths.
   */
  provider_location_id: string;
  provider_location_type?: ProviderLocationType;
  accepts_patient_insurance?: InsuranceAcceptance;
  /**
   * `YYYY-MM-DD`, up to 90 days out, or **`null` when the location has no availability** —
   * which is the common case, not the exception. Only 2 of 41 locations sampled across four
   * ZIP codes had a date here.
   */
  first_availability_date_in_provider_local_time?: string | null;
  provider: Provider;
  location?: Location;
  /** `null` for `in_person_provider` locations, which is most of them. */
  virtual_location?: {
    state?: string;
    location_name?: string;
    time_zone?: string;
  } | null;
  practice?: {
    practice_id: string;
    practice_name: string;
  };
  booking_requirements?: {
    /**
     * Drives which fields `zd-patient-form` must require (Task 13). These are dotted
     * paths into the booking request body, not bare field names — the OpenAPI bundle
     * documents `data.patient.insurance.insurance_plan_id` and
     * `data.patient.insurance.insurance_member_id`. It stays `string[]` rather than a
     * union because the spec calls those examples ("Options include"), not a closed set,
     * so an unlisted path must not fail to typecheck.
     *
     * Production does not narrow this: all 13 locations sampled returned `[]`. The
     * documented pair is the only vocabulary we have.
     */
    required_fields?: string[];
    accepts_booking_requests_from?: BookingRequestSource[];
  };
}

/** `data` on `/v1/provider_locations` — an object, not an array. */
export interface ProviderLocationsData {
  /**
   * Echoes the resolved ids, since the API fills in a default when only one is sent. The
   * filled-in `visit_reason_id` is the specialty's own `default_visit_reason_id`, which
   * `/v1/specialties` already returns — so it is predictable, not opaque.
   */
  search_parameters?: {
    specialty_id?: string;
    visit_reason_id?: string;
    /** Not in this endpoint's documented parameter list, and `null` when not requested. */
    available_from_in_provider_local_time?: string | null;
    available_to_in_provider_local_time?: string | null;
  };
  provider_locations: ProviderLocation[];
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export interface AvailabilitySlot {
  /** ISO-8601 with the provider's local UTC offset (`2022-04-27T09:00:00-04:00`). */
  start_time: string;
  visit_reason_id?: string;
  /**
   * Documented as a non-PHI deep link with UTM params appended automatically — and
   * documented as a non-nullable `string` with a full URL example. It was **`null` in all
   * 165 timeslots recorded from production**, so it is presumably populated only for
   * syndication clients. Never build a link from it without a null check.
   */
  booking_url?: string | null;
}

export interface ProviderLocationAvailability {
  provider_location_id: string;
  /**
   * `null` when the location has no availability in the requested window. Note the spec
   * `$ref`s `Timeslot` here, whose `required` list contains `start_time` — so a null is not
   * merely unmarked, it is unrepresentable under the schema as published.
   */
  first_availability?: AvailabilitySlot | null;
  /**
   * Confirmed against the published OpenAPI bundle (v1.177): both this array and
   * `first_availability` reference the same `Timeslot` schema, so they share a type.
   */
  timeslots?: AvailabilitySlot[];
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export type SexAtBirth = 'male' | 'female';

/**
 * Distinct from `sex_at_birth`. `none_apply` and `prefer_not_to_say` must be sent
 * alone; the rest may combine.
 */
export type Gender =
  | 'female_at_birth'
  | 'male_at_birth'
  | 'cisgender'
  | 'genderfluid'
  | 'genderqueer'
  | 'intersex'
  | 'non_binary'
  | 'transgender_man'
  | 'transgender_woman'
  | 'prefer_not_to_say'
  | 'none_apply';

export interface PatientAddress {
  address1: string;
  address2?: string;
  city: string;
  /** Two-letter code. */
  state: string;
  zip_code: string;
}

/**
 * All eight documented statuses. A booking does not necessarily come back
 * `confirmed` — `pending_booking` means the practice has yet to accept it, which is
 * a success the UI has to word differently, and `booking_failed` is a failure that
 * arrives on a 200.
 */
export type AppointmentStatus =
  | 'pending_booking'
  | 'confirmed'
  | 'booking_failed'
  | 'cancelled'
  | 'no_show'
  | 'pending_reschedule'
  | 'rescheduled'
  | 'reschedule_failed';

/** Whether the practice confirms automatically or by hand. */
export type AppointmentConfirmationType = 'auto' | 'manual' | 'pending_evaluation';

/** Note this is not `VisitType` — the search filter and the booked visit differ. */
export type AppointmentVisitType =
  | 'in_person'
  | 'zocdoc_video_service'
  | 'third_party_video_service';

export interface PatientInsurance {
  insurance_plan_id?: string;
  insurance_group_number?: string;
  insurance_member_id?: string;
  is_self_pay?: boolean;
}

/**
 * **Every field here is PHI.** Per PHI-001 no value on this type may appear in
 * `console.log`, a thrown error message, or a committed fixture.
 */
export interface Patient {
  first_name: string;
  last_name: string;
  /** `YYYY-MM-DD`. */
  date_of_birth: string;
  sex_at_birth: SexAtBirth;
  /** Unformatted 10 digits; the 1st and 4th digit cannot be 0 or 1. */
  phone_number: string;
  email_address: string;
  patient_address: PatientAddress;
  patient_id?: string;
  developer_patient_id?: string;
  insurance?: PatientInsurance;
  gender?: Gender[];
}

/**
 * The `data` of a successful `POST /v1/appointments`, flattened from the spec's three
 * layers of `allOf` (`AppointmentBaseResponseData` → `SharedAppointmentResponseData` →
 * `AppointmentResponseData`). Only the fields the spec marks required are required here.
 *
 * `notes` is echoed back and is patient-authored free text, so it is PHI: it must not be
 * logged (PHI-001) even though it arrives from the API rather than from a form.
 *
 * The four `| null` fields were live-verified on 2026-08-04: a real booking returned each of
 * them as an explicit `null`, not absent, while the spec types all four as plain `string`.
 * See the `| null` policy at the top of this file.
 */
export interface AppointmentResponseData {
  appointment_id: string;
  appointment_status: AppointmentStatus;
  is_provider_resource: boolean;
  confirmation_type: AppointmentConfirmationType;
  visit_type: AppointmentVisitType;
  developer_patient_id?: string | null;
  location_phone_number?: string;
  location_phone_extension?: string | null;
  /** Patient-facing URL for a Zocdoc video visit. `null` for in-person appointments. */
  waiting_room_path?: string | null;
  notes?: string | null;
}
