import { request } from './http.js';
import type { PatientType, ProviderLocationAvailability, ZocdocResponse } from './types.js';

export interface AvailabilityParams {
  /**
   * Each id is a literal `pr_…|lo_…` pair. `request` comma-joins the array, and the
   * pipes are percent-encoded in transit — the API expects both, so do not "clean"
   * the ids before passing them.
   */
  providerLocationIds: string[];
  visitReasonId: string;
  patientType: PatientType;
  /** `YYYY-MM-DD` in the provider's local time. Omitted, the API defaults to 7 days. */
  startDate?: string;
  /** Must be within 30 days of `startDate`, and at most 150 days out. */
  endDate?: string;
  insurancePlanId?: string;
  insuranceCarrierId?: string;
}

/**
 * Availability is not paged — `data` is a bare array with one entry per requested
 * provider location, so a location with no open slots still comes back, just without
 * timeslots. `timeslots` is normalised to `[]` so the picker can map over it
 * unconditionally; distinguishing "no slots" from "not asked about" is what the
 * presence of the entry itself is for.
 */
export async function getAvailability(
  params: AvailabilityParams
): Promise<ProviderLocationAvailability[]> {
  const response = await request<ZocdocResponse<ProviderLocationAvailability[]>>(
    '/v1/provider_locations/availability',
    {
      query: {
        provider_location_ids: params.providerLocationIds,
        visit_reason_id: params.visitReasonId,
        patient_type: params.patientType,
        start_date_in_provider_local_time: params.startDate,
        end_date_in_provider_local_time: params.endDate,
        insurance_plan_id: params.insurancePlanId,
        insurance_carrier_id: params.insuranceCarrierId,
      },
    }
  );

  // Filled in place rather than by spreading into copies: these objects were parsed from
  // this call's response body a moment ago and are not shared with anything.
  const entries = response.data ?? [];
  for (const entry of entries) {
    entry.timeslots ??= [];
  }
  return entries;
}
