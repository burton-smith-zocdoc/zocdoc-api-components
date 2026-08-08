/**
 * The hand-wired page: the same five components `zd-booking-flow` renders, with the host page
 * doing the coordination.
 *
 * This file is the argument for COMP-002 and COMP-004 both ways round. Every component here works
 * on its own — none of them reaches upward for context, so the wiring is entirely properties down
 * and events up, and a page can put any subset of them anywhere. The cost is visible too: what
 * follows is the state the coordinator has to hold, the request it has to own, and the ordering it
 * has to get right. A page that wants the funnel and not the bookkeeping uses `index.html`.
 *
 * Everything the API says is read off the events. Nothing is read back off an element and nothing
 * reaches into a shadow root.
 */
import '@powered-by-zocdoc/primitives/theme/all.css';
import './demo.css';
import '@powered-by-zocdoc/api-components';
import {
  createAppointment,
  getAvailability,
  providerHeading,
  type AppointmentStatus,
  type Patient,
  type PatientType,
  type ProviderLocation,
  type ZdAvailabilityPicker,
  type ZdBookingConfirmation,
  type ZdPatientForm,
  type ZdProviderResults,
  type ZdProviderSearch,
} from '@powered-by-zocdoc/api-components';
import { configureDemo, renderModeBanner } from './config.js';
import { renderScenarios } from './scenarios.js';

/*
 * No event detail is declared in this file, and no listener casts its event. Each component types
 * its own `addEventListener`, so `event.detail` below is inferred from the component that emits it —
 * which is the point: a hand-copied interface typechecks against nothing and goes stale the first
 * time a component adds a field.
 */

/**
 * How many days of availability the results list shows at once.
 *
 * The same number as the list's own `availability-days` default, because the window this page
 * requests and the window the cards label have to be the one window — fourteen days of dates over
 * seven days of counts would report an empty second week.
 */
const AVAILABILITY_DAYS = 14;

/**
 * The two `appointment_status` values that mean a booking happened.
 *
 * `booking_failed` arrives on a **200**, so a resolved promise is not a booking. `pending_booking`
 * counts: the practice has yet to accept, but the request is in and the patient has a number to
 * quote — which is why the confirmation is told the status rather than just that it worked.
 */
const BOOKED_STATUSES: ReadonlySet<AppointmentStatus> = new Set(['confirmed', 'pending_booking']);

const search = document.querySelector<ZdProviderSearch>('zd-provider-search')!;
const results = document.querySelector<ZdProviderResults>('zd-provider-results')!;
const picker = document.querySelector<ZdAvailabilityPicker>('zd-availability-picker')!;
const form = document.querySelector<ZdPatientForm>('zd-patient-form')!;
const confirmation = document.querySelector<ZdBookingConfirmation>('zd-booking-confirmation')!;

const stepTime = document.querySelector<HTMLElement>('#step-time')!;
const stepPatient = document.querySelector<HTMLElement>('#step-patient')!;
const stepBooked = document.querySelector<HTMLElement>('#step-booked')!;
const bookingError = document.querySelector<HTMLElement>('#booking-error')!;

/**
 * The visit reason availability and booking are actually performed with.
 *
 * Not the same thing as what the patient chose: "Any reason" leaves the search's own
 * `visitReasonId` undefined, and the API answers with the specialty's default in
 * `search_parameters`. Both `GET /v1/provider_locations/availability` and
 * `POST /v1/appointments` require one, so the echoed value is the only usable answer.
 */
let resolvedVisitReasonId: string | undefined;
let insurancePlanId: string | undefined;
let patientType: PatientType = 'new';
let selectedProvider: ProviderLocation | undefined;
let startTime: string | undefined;

/** Which availability batch is the current one, so a slow answer cannot overwrite a fast one. */
let availabilityRequest = 0;

/**
 * Today as `YYYY-MM-DD`, from the browser's own calendar fields.
 *
 * Not `toISOString().slice(0, 10)`, which is UTC: for anyone west of Greenwich in the evening that
 * string is already tomorrow, and a window starting tomorrow silently drops today's appointments.
 */
function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * The window's last day, inclusive — so a fourteen-day window ends thirteen days along.
 *
 * Parsed as UTC midnight so the addition is plain arithmetic: done in local time, a window
 * crossing a daylight-saving boundary lands an hour either side of midnight and can round to the
 * wrong day.
 */
function windowEnd(startDate: string, days: number): string {
  const end = new Date(`${startDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + days - 1);
  return end.toISOString().slice(0, 10);
}

/**
 * Reveals or hides a step, and moves focus when the patient has been taken to a new one.
 *
 * Focus goes to the step's container rather than its heading, which is what `zd-booking-flow` does
 * with its own `part="step"`: a screen reader then reads the heading and continues into the step
 * instead of announcing the heading alone (A11Y-003). `tabIndex` is set here rather than in the
 * markup so the sections are not in the tab order while they are hidden.
 */
function show(step: HTMLElement, visible: boolean, moveFocus = false): void {
  step.hidden = !visible;

  if (!visible || !moveFocus) return;

  step.tabIndex = -1;
  step.focus();
}

/**
 * Fetches day counts for the whole page in one call.
 *
 * The endpoint takes an array of ids and answers for all of them, so this is one request where ten
 * self-fetching cards would be ten — which is why the counts belong to the page rather than to the
 * cards that show them.
 *
 * Failure is silent and takes the grids with it. The counts are an enhancement over a list that
 * already works, and dropping them rather than keeping a stale set is what stops one window's
 * dates appearing over another window's counts.
 */
async function loadAvailability(startDate: string): Promise<void> {
  const providerLocationIds = results.providers.map((location) => location.provider_location_id);

  // No visit reason is a real state rather than an oversight: a search that matched nothing has
  // none to echo. The list simply goes without counts.
  if (!resolvedVisitReasonId || providerLocationIds.length === 0) return;

  const request = (availabilityRequest += 1);

  try {
    const entries = await getAvailability({
      providerLocationIds,
      visitReasonId: resolvedVisitReasonId,
      patientType,
      startDate,
      endDate: windowEnd(startDate, AVAILABILITY_DAYS),
      insurancePlanId,
    });

    if (request !== availabilityRequest) return;

    results.availability = entries;
  } catch {
    if (request !== availabilityRequest) return;

    // Nothing is rendered and nothing is logged: the client's error is developer-facing and its
    // body can echo the values the request was built from (CLIENT-003, PHI-001).
    results.availability = undefined;
  }
}

/**
 * Moves to the time step.
 *
 * `day` is the cell the patient pressed on a card, when that is how they got here. Passing it down
 * as the picker's `start-date` is what makes a day cell mean something, and is the one piece of
 * coordination that is easy to leave out: without it the picker opens on the provider's first
 * available day, and pressing Thursday lands the patient on Monday. `zd-booking-flow` does the same.
 */
function selectProvider(provider: ProviderLocation, day?: string): void {
  selectedProvider = provider;
  startTime = undefined;

  results.selectedId = provider.provider_location_id;

  picker.providerLocationId = provider.provider_location_id;
  picker.visitReasonId = resolvedVisitReasonId;
  picker.patientType = patientType;
  picker.startDate = day;
  picker.selectedStartTime = undefined;

  // Going forward closes what is behind it: a different provider invalidates the slot picked from
  // the old one, and a confirmation left on screen would be for an appointment already booked.
  show(stepPatient, false);
  show(stepBooked, false);
  show(stepTime, true, true);
}

/**
 * The one thing that goes wrong in a way this page has to word itself.
 *
 * A fixed string. The client's error is developer-facing and its body can quote the values just
 * submitted, so neither it nor any patient field reaches the page, and nothing is logged either
 * (CLIENT-003, PHI-001). Unhidden before its text is set, because `role="alert"` announces a
 * change to a live region that is already rendered — filling a hidden one and then revealing it
 * often announces nothing at all.
 */
function failBooking(): void {
  bookingError.hidden = false;
  bookingError.textContent = 'We could not book that appointment. Please choose another time.';
}

async function book(patient: Patient, notes?: string): Promise<void> {
  if (!selectedProvider || !startTime || !resolvedVisitReasonId) return;

  // The form disables its own Continue button from this, which matters because a booking is not
  // idempotent: a second POST books a second appointment.
  form.busy = true;
  bookingError.hidden = true;

  try {
    const appointment = await createAppointment({
      providerLocationId: selectedProvider.provider_location_id,
      visitReasonId: resolvedVisitReasonId,
      startTime,
      patientType,
      patient,
      notes,
    });

    if (!BOOKED_STATUSES.has(appointment.appointment_status)) {
      failBooking();
      return;
    }

    confirmation.appointmentId = appointment.appointment_id;
    confirmation.status = appointment.appointment_status;
    confirmation.startTime = startTime;
    confirmation.providerName = providerHeading(selectedProvider);

    show(stepPatient, false);
    show(stepBooked, true, true);
  } catch {
    failBooking();
  } finally {
    form.busy = false;
  }
}

search.addEventListener('provider-results', ({ detail }) => {
  results.providers = detail.providers;
  results.totalCount = detail.totalCount;
  results.page = detail.page;
  results.pageSize = detail.pageSize;

  insurancePlanId = detail.insurancePlanId;
  // zd-provider-search no longer collects a visit reason; the API's echo of the specialty's
  // "any reason" default is the only source left.
  resolvedVisitReasonId = detail.searchParameters?.visit_reason_id;

  const startDate = today();

  /*
   * Cleared before the new batch is asked for rather than after it lands. These are different
   * providers, and the last page's counts matched against this page's ids would put "No
   * appointments" on every card until the answer arrived.
   */
  results.availability = undefined;
  results.availabilityStart = startDate;

  void loadAvailability(startDate);
});

results.addEventListener('provider-select', ({ detail }) => {
  selectProvider(detail.provider);
});

results.addEventListener('day-select', ({ detail }) => {
  selectProvider(detail.provider, detail.day);
});

// The list moves its own dates and reports where it landed, because it never learns the visit
// reason and so could not refetch even if it wanted to.
results.addEventListener('window-change', ({ detail }) => {
  void loadAvailability(detail.startDate);
});

// Setting the search's page is what re-runs the search; it owns the request, not this page.
results.addEventListener('page-change', ({ detail }) => {
  search.page = detail.page;
});

picker.addEventListener('slot-select', ({ detail }) => {
  startTime = detail.startTime;
  show(stepPatient, true, true);
});

// Followed rather than noted, because the same value goes to POST /v1/appointments: a patient who
// says they are returning and is then booked as new is a wrong booking, not a cosmetic mismatch.
picker.addEventListener('patient-type-change', ({ detail }) => {
  patientType = detail.patientType;
});

form.addEventListener('patient-submit', ({ detail }) => {
  void book(detail.patient, detail.notes);
});

renderModeBanner(configureDemo());
renderScenarios();
