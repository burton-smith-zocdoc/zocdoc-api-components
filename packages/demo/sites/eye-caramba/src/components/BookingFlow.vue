<script setup lang="ts">
/**
 * The composed booking funnel, wired in Vue. Same five components and the same rules as
 * packages/demo/src/composed.ts: properties down, events up (COMP-002). The host books
 * through the client itself on `patient-submit`.
 */
import { computed, nextTick, ref } from 'vue';
import {
  createAppointment,
  getAvailability,
  providerHeading,
  type AppointmentStatus,
  type AvailabilityWindowDetail,
  type PageChangeDetail,
  type PatientSubmitDetail,
  type PatientType,
  type PatientTypeChangeDetail,
  type ProviderDaySelectDetail,
  type ProviderLocation,
  type ProviderLocationAvailability,
  type ProviderResultsDetail,
  type ProviderSelectDetail,
  type SlotSelectDetail,
} from '@zocdoc/api-components';
import EventLog from './EventLog.vue';
import { isBooked } from '../booking-status.ts';

const props = defineProps<{ zipCode: string; specialtyId: string }>();

const AVAILABILITY_DAYS = 14;

const providers = ref<ProviderLocation[]>([]);
const totalCount = ref<number>();
const page = ref(0);
const pageSize = ref<number>();
const insuranceName = ref<string>();
const insurancePlanId = ref<string>();
const visitReasonId = ref<string>();
const availability = ref<ProviderLocationAvailability[]>();
const availabilityStart = ref<string>();
const patientType = ref<PatientType>('new');
const selected = ref<ProviderLocation>();
const pickerStart = ref<string>();
const startTime = ref<string>();
const busy = ref(false);
const bookingError = ref(false);
const booked = ref<{ appointmentId: string; status: AppointmentStatus; startTime: string }>();
const events = ref<string[]>([]);

const step = computed(() =>
  booked.value ? 'booked' : startTime.value ? 'patient' : selected.value ? 'time' : 'search'
);
const requiredFields = computed(() => selected.value?.booking_requirements?.required_fields ?? []);

const stepRefs: Record<string, HTMLElement | null> = {};
let availabilityRequest = 0;

function log(name: string): void {
  events.value = [name, ...events.value].slice(0, 30);
}

async function focusStep(name: string): Promise<void> {
  await nextTick();
  stepRefs[name]?.focus(); // A11Y-003
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function windowEnd(startDate: string): string {
  const end = new Date(`${startDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + AVAILABILITY_DAYS - 1);
  return end.toISOString().slice(0, 10);
}

async function loadAvailability(startDate: string): Promise<void> {
  const ids = providers.value.map((location) => location.provider_location_id);
  if (!visitReasonId.value || ids.length === 0) return;
  const request = (availabilityRequest += 1);
  try {
    const entries = await getAvailability({
      providerLocationIds: ids,
      visitReasonId: visitReasonId.value,
      patientType: patientType.value,
      startDate,
      endDate: windowEnd(startDate),
      insurancePlanId: insurancePlanId.value,
    });
    if (request === availabilityRequest) availability.value = entries;
  } catch {
    // The list works without day counts; nothing to show.
    if (request === availabilityRequest) availability.value = undefined;
  }
}

function onResults(event: CustomEvent<ProviderResultsDetail>): void {
  log('provider-results');
  const { detail } = event;
  providers.value = detail.providers;
  totalCount.value = detail.totalCount;
  page.value = detail.page;
  pageSize.value = detail.pageSize;
  insuranceName.value = detail.insurancePlanName;
  insurancePlanId.value = detail.insurancePlanId;
  visitReasonId.value = detail.searchParameters?.visit_reason_id;
  availability.value = undefined;
  availabilityStart.value = today();
  void loadAvailability(availabilityStart.value);
}

function choose(provider: ProviderLocation, day?: string): void {
  selected.value = provider;
  pickerStart.value = day;
  startTime.value = undefined;
  bookingError.value = false;
  void focusStep('time');
}

function onSelect(event: CustomEvent<ProviderSelectDetail>): void {
  log('provider-select');
  choose(event.detail.provider);
}

function onDaySelect(event: CustomEvent<ProviderDaySelectDetail>): void {
  log('day-select');
  choose(event.detail.provider, event.detail.day);
}

function onWindow(event: CustomEvent<AvailabilityWindowDetail>): void {
  log('window-change');
  void loadAvailability(event.detail.startDate);
}

function onPage(event: CustomEvent<PageChangeDetail>): void {
  log('page-change');
  page.value = event.detail.page; // bound back to the search, which refetches
}

function onSlot(event: CustomEvent<SlotSelectDetail>): void {
  log('slot-select');
  startTime.value = event.detail.startTime;
  bookingError.value = false;
  void focusStep('patient');
}

function onPatientType(event: CustomEvent<PatientTypeChangeDetail>): void {
  log('patient-type-change');
  patientType.value = event.detail.patientType;
}

async function onSubmit(event: CustomEvent<PatientSubmitDetail>): Promise<void> {
  log('patient-submit');
  const provider = selected.value;
  const time = startTime.value;
  if (!provider || !time || !visitReasonId.value || busy.value) return;
  busy.value = true;
  bookingError.value = false;
  try {
    const appointment = await createAppointment({
      providerLocationId: provider.provider_location_id,
      visitReasonId: visitReasonId.value,
      startTime: time,
      patientType: patientType.value,
      patient: event.detail.patient,
      notes: event.detail.notes,
    });
    if (!isBooked(appointment.appointment_status)) {
      bookingError.value = true;
      return;
    }
    booked.value = {
      appointmentId: appointment.appointment_id,
      status: appointment.appointment_status,
      startTime: time,
    };
    void focusStep('booked');
  } catch {
    bookingError.value = true; // never the error's text (CLIENT-003, PHI-001)
  } finally {
    busy.value = false;
  }
}

function back(): void {
  bookingError.value = false;
  if (step.value === 'patient') startTime.value = undefined;
  else if (step.value === 'time') selected.value = undefined;
  void focusStep(step.value);
}

function startOver(): void {
  booked.value = undefined;
  startTime.value = undefined;
  selected.value = undefined;
  void focusStep('search');
}
</script>

<template>
  <div class="flow">
    <!--
      The generated Vue types declare these events as plain `Event` (the manifest carries no detail
      type), so each binding names the detail it carries: up to `Event`, then down to the
      component's own `CustomEvent`. The handlers keep their real signatures.
    -->
    <section
      v-show="step === 'search'"
      :ref="(el) => (stepRefs.search = el as HTMLElement)"
      data-step="search"
      tabindex="-1"
      aria-labelledby="step-search"
    >
      <h2 id="step-search">1. Find your eye doc</h2>
      <zd-provider-search
        :zip-code="props.zipCode"
        :specialty-id="props.specialtyId"
        :page="page"
        @provider-results="onResults($event as Event as CustomEvent<ProviderResultsDetail>)"
      />
      <zd-provider-results
        :providers="providers"
        :total-count="totalCount"
        :page="page"
        :page-size="pageSize"
        :selected-id="selected?.provider_location_id"
        :insurance-name="insuranceName"
        :availability="availability"
        :availability-start="availabilityStart"
        @provider-select="onSelect($event as Event as CustomEvent<ProviderSelectDetail>)"
        @day-select="onDaySelect($event as Event as CustomEvent<ProviderDaySelectDetail>)"
        @window-change="onWindow($event as Event as CustomEvent<AvailabilityWindowDetail>)"
        @page-change="onPage($event as Event as CustomEvent<PageChangeDetail>)"
      />
    </section>

    <section
      v-if="step === 'time' && selected"
      :ref="(el) => (stepRefs.time = el as HTMLElement)"
      data-step="time"
      tabindex="-1"
      aria-labelledby="step-time"
    >
      <h2 id="step-time">2. Pick a time with {{ providerHeading(selected) }}</h2>
      <zd-availability-picker
        :provider-location-id="selected.provider_location_id"
        :visit-reason-id="visitReasonId"
        :patient-type="patientType"
        :start-date="pickerStart"
        @slot-select="onSlot($event as Event as CustomEvent<SlotSelectDetail>)"
        @patient-type-change="
          onPatientType($event as Event as CustomEvent<PatientTypeChangeDetail>)
        "
      />
      <button type="button" class="back" @click="back">Back to results</button>
    </section>

    <section
      v-if="step === 'patient'"
      :ref="(el) => (stepRefs.patient = el as HTMLElement)"
      data-step="patient"
      tabindex="-1"
      aria-labelledby="step-patient"
    >
      <h2 id="step-patient">3. Tell us about you</h2>
      <p v-if="bookingError" class="booking-error" role="alert">
        Eye caramba! That booking didn't go through. Please choose another time.
      </p>
      <zd-patient-form
        :insurance-plan-id="insurancePlanId"
        :required-fields="requiredFields"
        :busy="busy"
        @patient-submit="onSubmit($event as Event as CustomEvent<PatientSubmitDetail>)"
      />
      <button type="button" class="back" @click="back">Back to times</button>
    </section>

    <section
      v-if="step === 'booked' && booked && selected"
      :ref="(el) => (stepRefs.booked = el as HTMLElement)"
      data-step="booked"
      tabindex="-1"
      aria-labelledby="step-booked"
    >
      <h2 id="step-booked">4. You're booked!</h2>
      <zd-booking-confirmation
        :appointment-id="booked.appointmentId"
        :status="booked.status"
        :start-time="booked.startTime"
        :provider-name="providerHeading(selected)"
      />
      <button type="button" class="back" @click="startOver">Book another</button>
    </section>

    <EventLog :entries="events" />
  </div>
</template>
