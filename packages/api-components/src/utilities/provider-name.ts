import type { ProviderLocation } from '../../client/types.js';

/**
 * Derives a provider's display name.
 *
 * Every `Provider` field but `provider_id` is optional, so a name has to be derived rather
 * than read. Falls back through the practice name before giving up, because a card with no
 * label at all is not usable — and a confirmation that names nobody is worse.
 *
 * Shared rather than duplicated: the results list and the booking flow have to agree, or the
 * provider a patient picked is not the one their confirmation names.
 */
export function providerDisplayName(location: ProviderLocation): string {
  const { full_name, first_name, last_name } = location.provider;
  const composed = [first_name, last_name].filter(Boolean).join(' ');
  return full_name ?? (composed || location.practice?.practice_name) ?? 'Provider';
}
