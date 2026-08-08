import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { providerDisplayName } from '../provider-name.js';

function makeLocation(
  provider: Partial<ProviderLocation['provider']>,
  practice?: Partial<ProviderLocation['practice']>
): ProviderLocation {
  return {
    provider_location_id: 'loc-1',
    provider: { provider_id: 'prov-1', ...provider },
    practice,
  } as ProviderLocation;
}

describe('providerDisplayName', () => {
  it('uses full_name when present', () => {
    const location = makeLocation({ full_name: 'Dr. Jane Smith' });

    expect(providerDisplayName(location)).toBe('Dr. Jane Smith');
  });

  it('composes first and last name when full_name is absent', () => {
    const location = makeLocation({ first_name: 'Jane', last_name: 'Smith' });

    expect(providerDisplayName(location)).toBe('Jane Smith');
  });

  it('uses only first name when last name is missing', () => {
    const location = makeLocation({ first_name: 'Jane' });

    expect(providerDisplayName(location)).toBe('Jane');
  });

  it('uses only last name when first name is missing', () => {
    const location = makeLocation({ last_name: 'Smith' });

    expect(providerDisplayName(location)).toBe('Smith');
  });

  it('falls back to practice name when provider name is empty', () => {
    const location = makeLocation({}, { practice_name: 'Downtown Clinic' });

    expect(providerDisplayName(location)).toBe('Downtown Clinic');
  });

  it('returns Provider as the final fallback', () => {
    const location = makeLocation({});

    expect(providerDisplayName(location)).toBe('Provider');
  });

  it('prefers full_name over composed name', () => {
    const location = makeLocation({
      full_name: 'Dr. Jane M. Smith',
      first_name: 'Jane',
      last_name: 'Smith',
    });

    expect(providerDisplayName(location)).toBe('Dr. Jane M. Smith');
  });
});
