// Importing primitives first guarantees the zd prefix is set before any
// component module below is evaluated. Keep this import first (PBZD-001).
import '@powered-by-zocdoc/primitives';

export * from './client/appointments.js';
export * from './client/availability.js';
export * from './client/configure.js';
export * from './client/errors.js';
export * from './client/provider-locations.js';
export * from './client/reference-data.js';
export * from './client/types.js';

// `./client/mock` is deliberately absent from this entry point, so importing the package
// pulls in no fixtures and no fake transport. It is reachable only through the `./mock`
// subpath, which exists for `packages/demo` — see `client/mock/index.ts` for what that
// subpath does and does not expose. Tests and stories inside this package go on importing
// the mock modules by relative path.

// One formatting helper out of `components/internal` is public, and only for host pages that
// compose their own funnel: naming the provider on a confirmation has to agree with how the
// results list named them. Every `Provider` name field is optional, so a display name is a
// fallback chain rather than a field read — derived independently, it is how a patient ends up
// confirming a provider whose name does not match the one they picked.
export { providerHeading } from './components/internal/provider-summary.js';

// Every event's payload, so a host page wiring components by hand reads `event.detail` against the
// type the component is compiled against instead of describing the shape itself. `TypedEventTarget`
// and `TypedEmit` are deliberately absent: they are how those payloads get onto `addEventListener`
// and `emit`, and a consumer has no call to reach for either.
export type { AvailabilityWindowDetail, DetailOf, ErrorDetail } from './components/events.js';

// Component exports. Each subpath's `index.ts` registers the component as a side effect, so
// importing it is what defines the tag.
export {
  ZdAvailabilityGrid,
  type DaySelectDetail,
  type ZdAvailabilityGridEventMap,
} from './components/availability-grid/index.js';
export {
  ZdAvailabilityPicker,
  type PatientTypeChangeDetail,
  type SlotSelectDetail,
  type ZdAvailabilityPickerEventMap,
} from './components/availability-picker/index.js';
export { ZdBookingConfirmation } from './components/booking-confirmation/index.js';
export {
  ZdBookingFlow,
  type BookingCompleteDetail,
  type BookingErrorDetail,
  type BookingStep,
  type ZdBookingFlowEventMap,
} from './components/booking-flow/index.js';
export {
  ZdPatientForm,
  type PatientFormErrors,
  type PatientFormField,
  type PatientSubmitDetail,
  type ZdPatientFormEventMap,
} from './components/patient-form/index.js';
export { ZdProviderProfile } from './components/provider-profile/index.js';
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
