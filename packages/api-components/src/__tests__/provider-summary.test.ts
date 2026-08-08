import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../../client/types.js';
import {
  providerAddress,
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
  renderProviderSummary,
} from '../provider-summary.js';

/**
 * Unmistakably fake, per PHI-002 — providers are directory data rather than patient data, but
 * a fixture that reads like a real person is still off limits.
 */
const IN_PERSON: ProviderLocation = {
  provider_location_id: 'pr_a|lo_a',
  provider_location_type: 'in_person_provider',
  accepts_patient_insurance: 'accepted',
  provider: {
    provider_id: 'pr_a',
    full_name: 'Ada Testerson',
    title: 'MD',
    specialties: ['Dermatologist'],
  },
  location: {
    address1: '1 Sandbox Plaza',
    address2: 'Suite 200',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '11201',
    distance_to_patient_mi: 0.8,
  },
};

const VIRTUAL: ProviderLocation = {
  provider_location_id: 'pr_b|lo_b',
  provider_location_type: 'virtual_provider',
  provider: { provider_id: 'pr_b', first_name: 'Bo', last_name: 'Sampleton' },
  virtual_location: { state: 'NY' },
};

/**
 * The helper returns a template rather than an element, so it is exercised the way its callers
 * use it: rendered into a container, then read back out of the DOM.
 */
function summary(
  location: ProviderLocation,
  options?: Parameters<typeof renderProviderSummary>[1]
) {
  const host = document.createElement('div');
  render(renderProviderSummary(location, options), host);
  return host;
}

function text(host: HTMLElement, part: string): string | undefined {
  return host.querySelector(`[part="${part}"]`)?.textContent?.trim();
}

describe('providerHeading', () => {
  it('appends the credential as one phrase', () => {
    expect(providerHeading(IN_PERSON)).toBe('Ada Testerson, MD');
  });

  it('falls back to the derived name when there is no credential', () => {
    expect(providerHeading(VIRTUAL)).toBe('Bo Sampleton');
  });
});

describe('providerAddress', () => {
  it('assembles the street, locality and postal code', () => {
    expect(providerAddress(IN_PERSON)).toBe('1 Sandbox Plaza, Suite 200, Brooklyn, NY 11201');
  });

  /* Every field is optional in production, so a partial address has to read as a sentence. */
  it('skips the parts that are absent', () => {
    const partial: ProviderLocation = {
      ...IN_PERSON,
      location: { city: 'Brooklyn', state: 'NY' },
    };

    expect(providerAddress(partial)).toBe('Brooklyn, NY');
  });

  it('is undefined for a location with no address at all', () => {
    expect(providerAddress(VIRTUAL)).toBeUndefined();
    expect(providerAddress({ ...IN_PERSON, location: {} })).toBeUndefined();
  });
});

describe('providerLocationLine', () => {
  /*
   * The distance goes through Intl rather than string concatenation (I18N-002). Asserted
   * loosely on purpose: the exact spacing between "0.8" and "mi" is the runtime's business,
   * and pinning it would fail on a browser that formats it differently for the same locale.
   */
  it('formats the distance as a localized unit', () => {
    const line = providerLocationLine(IN_PERSON);

    expect(line).toMatch(/^0\.8\s?mi · 1 Sandbox Plaza/);
  });

  it('omits the distance when the API did not supply one', () => {
    const line = providerLocationLine({ ...IN_PERSON, location: { city: 'Brooklyn' } });

    expect(line).toBe('Brooklyn');
  });

  /* A virtual provider's distance is meaningless and its address absent. */
  it('says video visit for a virtual provider rather than a distance', () => {
    expect(providerLocationLine(VIRTUAL)).toBe('Video visit · NY');
  });

  it('keeps a distance of zero, which is a distance', () => {
    const line = providerLocationLine({
      ...IN_PERSON,
      location: { ...IN_PERSON.location, distance_to_patient_mi: 0 },
    });

    expect(line).toMatch(/^0\s?mi ·/);
  });
});

describe('providerPhotoUrl', () => {
  it('prefixes the protocol-relative URL the API returns', () => {
    const withPhoto: ProviderLocation = {
      ...IN_PERSON,
      provider: { ...IN_PERSON.provider, provider_photo_url: '//images.test/ada.jpg' },
    };

    expect(providerPhotoUrl(withPhoto)).toBe('https://images.test/ada.jpg');
  });

  it('leaves an absolute URL alone', () => {
    const withPhoto: ProviderLocation = {
      ...IN_PERSON,
      provider: { ...IN_PERSON.provider, provider_photo_url: 'https://images.test/ada.jpg' },
    };

    expect(providerPhotoUrl(withPhoto)).toBe('https://images.test/ada.jpg');
  });

  it('is undefined when there is no photo', () => {
    expect(providerPhotoUrl(IN_PERSON)).toBeUndefined();
  });
});

describe('renderProviderSummary', () => {
  it('renders the name, specialty and location', () => {
    const host = summary(IN_PERSON);

    expect(text(host, 'provider-name')).toBe('Ada Testerson, MD');
    expect(text(host, 'provider-specialty')).toBe('Dermatologist');
    expect(text(host, 'provider-location')).toContain('1 Sandbox Plaza');
  });

  /* A row of empty lines reads as broken where a shorter block reads as brief. */
  it('drops the lines it has no data for rather than blanking them', () => {
    const host = summary({ provider_location_id: 'pr_c|lo_c', provider: { provider_id: 'pr_c' } });

    expect(host.querySelector('[part="provider-specialty"]')).toBeNull();
    expect(host.querySelector('[part="provider-location"]')).toBeNull();
    expect(text(host, 'provider-name')).toBe('Provider');
  });

  /*
   * The whole point of the extraction. If these two ever diverge, the card a patient chose and
   * the summary they confirm are describing the same provider differently.
   */
  it('renders the same name for the card and the booking summary', () => {
    expect(text(summary(IN_PERSON), 'provider-name')).toBe(
      text(summary(IN_PERSON, { showPhoto: true }), 'provider-name')
    );
  });

  describe('the photo', () => {
    const withPhoto: ProviderLocation = {
      ...IN_PERSON,
      provider: { ...IN_PERSON.provider, provider_photo_url: '//images.test/ada.jpg' },
    };

    /*
     * PHI-003: the photo is on an image CDN, not the configured baseUrl. Off by default means
     * no test and no story makes that request without asking for it.
     */
    it('is not rendered unless asked for, even when the API supplied one', () => {
      expect(summary(withPhoto).querySelector('img')).toBeNull();
    });

    it('is rendered on request', () => {
      const img = summary(withPhoto, { showPhoto: true }).querySelector('img');

      expect(img?.getAttribute('src')).toBe('https://images.test/ada.jpg');
    });

    /* Decorative: the name it depicts is the very next node, so describing it repeats it. */
    it('carries empty alt text', () => {
      const img = summary(withPhoto, { showPhoto: true }).querySelector('img');

      expect(img?.getAttribute('alt')).toBe('');
    });
  });

  describe('the network line', () => {
    /*
     * The important one. "In-network" with nothing to be in the network of is a coverage claim
     * a patient could act on, and `accepts_patient_insurance` only answers the question
     * relative to the plan the search sent.
     */
    it('is not rendered without a plan to be in the network of', () => {
      expect(summary(IN_PERSON).querySelector('[part="provider-insurance"]')).toBeNull();
    });

    it('names the plan when there is one', () => {
      const host = summary(IN_PERSON, { insuranceName: 'Test Health PPO' });

      expect(text(host, 'provider-insurance')).toBe('In-network · Test Health PPO');
    });

    it('reports a plan the location does not take', () => {
      const host = summary(
        { ...IN_PERSON, accepts_patient_insurance: 'not_accepted' },
        { insuranceName: 'Test Health PPO' }
      );

      expect(text(host, 'provider-insurance')).toBe('Out-of-network · Test Health PPO');
    });

    /* `insurance_not_specified` is the API declining to answer, not a no. */
    it('says nothing when the API did not specify', () => {
      const host = summary(
        { ...IN_PERSON, accepts_patient_insurance: 'insurance_not_specified' },
        { insuranceName: 'Test Health PPO' }
      );

      expect(host.querySelector('[part="provider-insurance"]')).toBeNull();
    });
  });

  /* I18N-001, and the package-wide rule against aria-label. */
  it('puts every line in a text node rather than an attribute', () => {
    const host = summary(IN_PERSON, { insuranceName: 'Test Health PPO' });

    for (const node of host.querySelectorAll('*')) {
      expect(node.getAttribute('aria-label')).toBeNull();
      expect(node.getAttribute('title')).toBeNull();
    }
    expect(host.textContent).toContain('Ada Testerson, MD');
  });
});
