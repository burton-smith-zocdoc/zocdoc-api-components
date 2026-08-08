import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

/**
 * Sample API responses from the Zocdoc public API, based on the published OpenAPI
 * bundle (v1.177) and verified against production. Use these as reference when
 * building components that consume the API.
 */
const meta: Meta = {
  title: 'API Responses',
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

const JsonBlock = (title: string, json: object) => html`
  <div style="margin-block-end: 2rem;">
    <h3 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600;">${title}</h3>
    <pre
      style="
        background: var(--zd-color-surface-alt, #f5f5f5);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0;
      "
    ><code>${JSON.stringify(json, null, 2)}</code></pre>
  </div>
`;

const Section = (title: string, description: string) => html`
  <div style="margin-block-end: 1.5rem;">
    <h2 style="margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 600;">${title}</h2>
    <p style="margin: 0; color: var(--zd-color-text-secondary, #666);">${description}</p>
  </div>
`;

// -----------------------------------------------------------------------------
// Sample data matching fixtures.ts
// -----------------------------------------------------------------------------

const SPECIALTIES_RESPONSE = {
  request_id: 'req_abc123',
  data: [
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
  ],
  page: 0,
  page_size: 500,
  total_count: 2,
  next_url: '',
};

const VISIT_REASONS_RESPONSE = {
  request_id: 'req_def456',
  data: [
    { id: 'pc_FRO-18leckytNKtruw5dLR', name: 'New patient visit', specialty_id: 'sp_153' },
    { id: 'pc_T1T3MOA0kUuE201i1ZfIWR', name: 'Annual physical', specialty_id: 'sp_153' },
  ],
  page: 0,
  page_size: 500,
  total_count: 2,
  next_url: '',
};

const INSURANCE_PLANS_RESPONSE = {
  request_id: 'req_ghi789',
  data: [
    {
      id: 'ip_9111',
      name: 'Sandbox National PPO',
      status: 'active',
      care_categories: ['health'],
      coverage_area: { is_national: true, states: [] },
    },
    {
      id: 'ip_2052',
      name: 'Sandbox Medicare',
      program_type: 'medicare',
      status: 'active',
      care_categories: ['health'],
      coverage_area: { is_national: true, states: [] },
    },
  ],
  page: 0,
  page_size: 500,
  total_count: 2,
  next_url: '',
};

const PROVIDER_LOCATIONS_RESPONSE = {
  request_id: 'req_search_001',
  data: {
    search_parameters: {
      specialty_id: 'sp_153',
      visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
    },
    provider_locations: [
      {
        provider_location_id: 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890',
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
        },
        location: {
          location_name: 'Sandbox Plaza Family Medicine',
          address1: '1 Sandbox Plaza',
          city: 'Brooklyn',
          state: 'NY',
          zip_code: '11201',
          phone_number: '(555) 555-0100',
          time_zone: 'America/New_York',
          distance_to_patient_mi: 0.8,
        },
        booking_requirements: {
          required_fields: [],
          accepts_booking_requests_from: ['in_network', 'out_of_network', 'self_pay'],
        },
      },
    ],
  },
  page: 0,
  page_size: 10,
  total_count: 1,
  next_url: '',
};

const AVAILABILITY_RESPONSE = {
  request_id: 'req_avail_001',
  data: [
    {
      provider_location_id: 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890',
      first_availability: { start_time: '2026-08-05T09:00:00-04:00', booking_url: null },
      timeslots: [
        { start_time: '2026-08-05T09:00:00-04:00', booking_url: null },
        { start_time: '2026-08-05T09:30:00-04:00', booking_url: null },
        { start_time: '2026-08-05T10:00:00-04:00', booking_url: null },
        { start_time: '2026-08-05T11:00:00-04:00', booking_url: null },
      ],
    },
  ],
};

const AVAILABILITY_EMPTY_RESPONSE = {
  request_id: 'req_avail_002',
  data: [
    {
      provider_location_id: 'pr_no_availbility|lo_no_availbility',
      first_availability: null,
      timeslots: [],
    },
  ],
};

const APPOINTMENT_CONFIRMED_RESPONSE = {
  request_id: 'req_book_001',
  data: {
    appointment_id: 'd2ee5bd8-643a-42c8-8c5a-be450e903430',
    appointment_status: 'confirmed',
    is_provider_resource: false,
    confirmation_type: 'auto',
    visit_type: 'in_person',
    location_phone_number: '(555) 555-0100',
  },
};

const APPOINTMENT_PENDING_RESPONSE = {
  request_id: 'req_book_002',
  data: {
    appointment_id: '2b29f79b-6d7f-472a-9603-d0c378bc9531',
    appointment_status: 'pending_booking',
    is_provider_resource: false,
    confirmation_type: 'manual',
    visit_type: 'in_person',
  },
};

const APPOINTMENT_FAILED_RESPONSE = {
  request_id: 'req_book_003',
  data: {
    appointment_id: '34e4ead3-ca69-4448-9438-58702dd1048f',
    appointment_status: 'booking_failed',
    is_provider_resource: false,
    confirmation_type: 'pending_evaluation',
    visit_type: 'in_person',
  },
};

const ERROR_RESPONSE = {
  request_id: 'req_error_001',
  error_type: 'invalid_request',
  errors: [{ field: 'zip_code', message: 'must be 5 digits' }],
};

// -----------------------------------------------------------------------------
// Stories
// -----------------------------------------------------------------------------

/**
 * Reference data populates search form selects. These lists are stable within a
 * page load and cached after the first request (CLIENT-004).
 */
export const ReferenceData: Story = {
  render: () => html`
    <div style="font-family: system-ui, sans-serif; max-inline-size: 800px;">
      ${Section('Reference Data Endpoints', 'Specialties, visit reasons, and insurance plans.')}
      ${JsonBlock('GET /v1/specialties', SPECIALTIES_RESPONSE)}
      ${JsonBlock('GET /v1/visit_reasons?specialty_id=sp_153', VISIT_REASONS_RESPONSE)}
      ${JsonBlock('GET /v1/insurance_plans?state=NY', INSURANCE_PLANS_RESPONSE)}
    </div>
  `,
};

/**
 * Search for providers by location and specialty. The `provider_location_id` contains
 * a literal `|` that must be percent-encoded in URLs.
 */
export const ProviderLocations: Story = {
  render: () => html`
    <div style="font-family: system-ui, sans-serif; max-inline-size: 800px;">
      ${Section(
        'GET /v1/provider_locations',
        'Search for providers. Requires zip_code and either specialty_id or visit_reason_id.'
      )}
      ${JsonBlock('Response', PROVIDER_LOCATIONS_RESPONSE)}
    </div>
  `,
};

/**
 * Fetch available appointment times for one or more provider locations.
 * Maximum window span is 30 days.
 */
export const Availability: Story = {
  render: () => html`
    <div style="font-family: system-ui, sans-serif; max-inline-size: 800px;">
      ${Section(
        'GET /v1/provider_locations/availability',
        "Fetch appointment slots. Times include the provider's UTC offset."
      )}
      ${JsonBlock('With Slots', AVAILABILITY_RESPONSE)}
      ${JsonBlock('No Availability', AVAILABILITY_EMPTY_RESPONSE)}
    </div>
  `,
};

/**
 * Book an appointment with a provider. A 200 response does not guarantee a confirmed
 * appointment — check `appointment_status` for the actual result.
 */
export const Appointments: Story = {
  render: () => html`
    <div style="font-family: system-ui, sans-serif; max-inline-size: 800px;">
      ${Section(
        'POST /v1/appointments',
        'Book an appointment. Status may be confirmed, pending, or failed even on 200.'
      )}
      ${JsonBlock('Confirmed', APPOINTMENT_CONFIRMED_RESPONSE)}
      ${JsonBlock('Pending (awaiting practice)', APPOINTMENT_PENDING_RESPONSE)}
      ${JsonBlock('Failed (still a 200)', APPOINTMENT_FAILED_RESPONSE)}
    </div>
  `,
};

/**
 * Error responses use a different shape. The `errors[].message` field is developer-facing
 * and must never be shown to patients (CLIENT-003).
 */
export const ErrorResponse: Story = {
  render: () => html`
    <div style="font-family: system-ui, sans-serif; max-inline-size: 800px;">
      ${Section('Error Responses', 'Validation errors return 400 with this shape.')}
      ${JsonBlock('400 Invalid Request', ERROR_RESPONSE)}
    </div>
  `,
};
