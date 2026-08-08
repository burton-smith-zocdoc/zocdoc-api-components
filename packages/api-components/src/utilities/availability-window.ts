import {
  getAvailability,
  MAX_AVAILABILITY_DAYS,
  type AvailabilityParams,
} from '../client/availability.js';
import type { AvailabilitySlot } from '../client/types.js';
import { addDays, isValidDate, providerLocalTime, todayDayKey } from './provider-time.js';

/**
 * The window's first day, given whatever a host page supplied.
 *
 * Falls back to today for anything unparseable, because `start-date` is an attribute written by
 * hand and carrying a bad value through gives one cell labelled with it and a range line that
 * cannot be formatted at all. Today's window is merely not the one that was asked for.
 */
export function resolveWindowStart(startDate: string | undefined): string {
  const today = todayDayKey();
  if (!startDate) return today;
  return isValidDate(providerLocalTime(startDate)) ? startDate : today;
}

/** The window's last day, inclusive — so a fourteen-day window ends thirteen days along. */
export function windowEndDate(startDate: string, days: number): string {
  return addDays(startDate, windowSpan(days) - 1);
}

/** The window's width in days, clamped to what the API accepts, and never less than one. */
export function windowSpan(days: number): number {
  // Written this way round so a `NaN` — which is what `days="ten"` parses to — is caught too.
  return days > 0 ? Math.min(days, MAX_AVAILABILITY_DAYS) : 1;
}

/**
 * Where the window lands after a step, moving by its own width so the ranges tile rather than
 * overlap.
 *
 * Never earlier than today: the API returns nothing in the past, so a window that starts behind
 * it is guaranteed to come back empty and read as no availability at all. Returns the current
 * start when there is nowhere to go, which is a caller's cue to say nothing.
 */
export function nextWindowStart(startDate: string, direction: -1 | 1, days: number): string {
  const today = todayDayKey();
  const target = addDays(startDate, direction * windowSpan(days));
  return target < today ? today : target;
}

/**
 * One location's slots for a window, for the components that fetch their own.
 *
 * `GET /v1/availability` takes a list and answers with a list, so a caller wanting one location
 * has to pick its entry back out. The entry comes back even with no open slots, which is why
 * this matches on the id rather than taking `entries[0]`: an absent entry means a *different*
 * location answered, and reading position zero would quietly show one provider's times under
 * another's name. No match and no slots both yield `[]` — an empty window, not an error.
 */
export async function getLocationSlots(
  params: Omit<AvailabilityParams, 'providerLocationIds'> & { providerLocationId: string }
): Promise<AvailabilitySlot[]> {
  const { providerLocationId, ...rest } = params;
  const entries = await getAvailability({ ...rest, providerLocationIds: [providerLocationId] });

  return (
    entries.find((entry) => entry.provider_location_id === providerLocationId)?.timeslots ?? []
  );
}
