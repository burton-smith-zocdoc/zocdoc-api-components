/**
 * Shapes recorded in `docs/api-contract-notes.md` (OpenAPI v1.177). Field names
 * are the API's own snake_case — these types describe the wire format, so they
 * are deliberately not camelCased. Endpoint wrappers take camelCase params and
 * translate; only the response types stay snake_case.
 *
 * Not yet live-verified: no token has been issued for the sandbox, so these come
 * from the spec. Fields the spec marks required are required here; fields whose
 * requiredness the spec leaves unstated are optional, so a missing one surfaces
 * as `undefined` rather than a lie in the type.
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
  /** Null on the last page. Typed as a string in the spec, nullable in practice. */
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

export interface InsurancePlan {
  id: string;
  name: string;
  carrier?: InsuranceCarrier;
  network_type?: string;
  program_type?: string;
  status?: string;
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
  phone_extension?: string;
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
  /** `YYYY-MM-DD`, up to 90 days out. */
  first_availability_date_in_provider_local_time?: string;
  provider: Provider;
  location?: Location;
  virtual_location?: {
    state?: string;
    location_name?: string;
    time_zone?: string;
  };
  practice?: {
    practice_id: string;
    practice_name: string;
  };
  booking_requirements?: {
    /**
     * Drives which fields `zd-patient-form` must require (Task 13). The spec does
     * not enumerate the values, so this stays `string[]` until a live response is
     * captured — see the [NEEDS LIVE CHECK] note in docs/api-contract-notes.md.
     */
    required_fields?: string[];
    accepts_booking_requests_from?: BookingRequestSource[];
  };
}

/** `data` on `/v1/provider_locations` — an object, not an array. */
export interface ProviderLocationsData {
  /** Echoes the resolved ids, since the API fills in a default when only one is sent. */
  search_parameters?: {
    specialty_id?: string;
    visit_reason_id?: string;
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
  /** Documented as a non-PHI deep link; UTM params are appended automatically. */
  booking_url?: string;
}

export interface ProviderLocationAvailability {
  provider_location_id: string;
  first_availability?: AvailabilitySlot;
  /**
   * **[NEEDS LIVE CHECK]** the spec does not document these item fields. Assumed
   * to match `first_availability`; Task 12 must not be written against the guess
   * without a captured response.
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
