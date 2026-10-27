/**
 * Auto-configuring bundle entry point.
 *
 * Reads configuration from `<meta>` tags in the page when loaded via either build:
 *
 *   <meta name="zocdoc-api-key" content="..." />
 *   <script src="zocdoc.js"></script>
 *   <zd-booking zip-code="10001"></zd-booking>
 *
 * Supported meta names:
 * - `zocdoc-api-key` (required for live mode) — API token
 * - `zocdoc-api-base-url` (optional) — defaults to developer sandbox
 * - `zocdoc-api-mock` (optional) — use fixtures instead of live API (no token needed)
 *
 * For mock/fixture mode (no network calls), omit `zocdoc-api-key` and add `zocdoc-api-mock`:
 *
 *   <meta name="zocdoc-api-mock" content="true" />
 *
 * The tags are read once, when the bundle runs, so they must come before the bundle's script.
 *
 * ## Theme CSS
 *
 * This bundle includes the components but NOT the theme CSS. Load the theme
 * separately via a link tag:
 *
 *   <link rel="stylesheet" href="path/to/theme/all.css">
 *
 * Or use the pre-built CSS from the package:
 *
 *   @zocdoc/api-primitive-components/theme/all.css
 */

// Import the lean primitives entry that skips theme generation code (~170KB savings)
import '@zocdoc/api-primitive-components/configure-only';

// Client configuration
import { configureZocdoc } from './client/configure.js';
import { configureZocdocMock } from './client/mock/index.js';
import { readBundleConfig } from './bundle-config.js';

// Re-export client API
export * from './client/appointments.js';
export * from './client/availability.js';
export * from './client/configure.js';
export * from './client/errors.js';
export * from './client/patient-auth.js';
export * from './client/provider-locations.js';
export * from './client/reference-data.js';
export * from './client/types.js';

// Re-export components
export {
  ZdAppointment,
  type AppointmentCancelDetail,
  type AppointmentErrorDetail,
  type AppointmentRescheduleDetail,
  type ZdAppointmentEventMap,
} from './components/appointment/index.js';
export {
  ZdAvailabilityGrid,
  type DaySelectDetail,
  type ZdAvailabilityGridEventMap,
} from './components/availability-grid/index.js';
export {
  ZdAvailabilityWindow,
  type WindowShiftDetail,
  type ZdAvailabilityWindowEventMap,
} from './components/availability-window/index.js';
export {
  ZdAvailabilityPicker,
  type PatientTypeChangeDetail,
  type SlotSelectDetail,
  type ZdAvailabilityPickerEventMap,
} from './components/availability-picker/index.js';
export { ZdBookingConfirmation } from './components/booking-confirmation/index.js';
export {
  ZdBooking,
  type BookingCompleteDetail,
  type BookingErrorDetail,
  type BookingStep,
  type ZdBookingEventMap,
} from './components/booking/index.js';
export {
  ZdPatientForm,
  type PatientFormErrors,
  type PatientFormField,
  type PatientSubmitDetail,
  type ZdPatientFormEventMap,
} from './components/patient-form/index.js';
export { ZdProviderProfile } from './components/provider-profile/index.js';
export {
  ZdProviderCard,
  type ProfileRequestDetail,
  type ZdProviderCardEventMap,
} from './components/provider-card/index.js';
export { ZdProviderSummary } from './components/provider-summary/index.js';
export {
  ZdProviderResults,
  type PageChangeDetail,
  type ProviderDaySelectDetail,
  type ProviderSelectDetail,
  type ZdProviderResultsEventMap,
} from './components/provider-results/index.js';
export {
  ZdProviderSearch,
  type ProviderResultsDetail,
  type ZdProviderSearchEventMap,
} from './components/provider-search/index.js';
export {
  ZdSignIn,
  type SignInCompleteDetail,
  type ZdSignInEventMap,
} from './components/sign-in/index.js';

// Re-export utilities
export { providerHeading } from './utilities/provider-summary.js';
export type { AvailabilityWindowDetail, DetailOf, ErrorDetail } from './components/events.js';

// Re-export mock utilities for zocdoc-api-mock mode
export { configureZocdocMock, createMockTransport, SCENARIOS } from './client/mock/index.js';

const config = readBundleConfig();

if (config.mode === 'live') {
  configureZocdoc({ baseUrl: config.baseUrl, getToken: config.token });
} else if (config.mode === 'mock') {
  configureZocdocMock();
}
