import type {
  ProviderLocation,
  Timeslot,
  Appointment,
} from '@powered-by-zocdoc/api-components';

export const sampleProvider: ProviderLocation = {
  id: 'pl_sandbox_001',
  provider_id: 'pr_sandbox_001',
  first_name: 'Sarah',
  last_name: 'Chen',
  credentials: 'MD',
  specialty: 'Internal Medicine',
  practice_name: 'Downtown Medical Group',
  address: {
    street_line_1: '123 Main Street',
    street_line_2: 'Suite 400',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
  },
  phone_number: '(555) 123-4567',
  accepts_new_patients: true,
  photo_url: 'https://placehold.co/150x150/e2e8f0/475569?text=SC',
  insurance_accepted: true,
  distance_miles: 0.3,
};

export const sampleTimeslots: Timeslot[] = [
  { start_time: '2026-09-02T09:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T09:30:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T10:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T14:00:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
  { start_time: '2026-09-02T14:30:00', provider_location_id: 'pl_sandbox_001', visit_reason_id: 'vr_001' },
];

export const sampleAppointment: Appointment = {
  id: 'apt_sandbox_001',
  status: 'confirmed',
  start_time: '2026-09-02T09:00:00',
  provider_location_id: 'pl_sandbox_001',
  visit_reason_id: 'vr_001',
};
