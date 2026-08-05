import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

/**
 * Deliberately unmistakable fake names. Providers are directory data rather than
 * patient data, so they are not PHI — but PHI-002 still rules out anything that
 * reads like a real person.
 *
 * The second entry has no `full_name` and no `specialties`, because production
 * marks every `Provider` field except `provider_id` optional. The component has
 * to survive that, so a fixture has to exercise it.
 */
const PROVIDERS: ProviderLocation[] = [
  {
    provider_location_id: 'pr_a|lo_a',
    accepts_patient_insurance: 'accepted',
    provider: {
      provider_id: 'pr_a',
      full_name: 'Dr. Ada Testerson',
      specialties: ['Dermatologist'],
      provider_photo_url: '//images.test/ada.jpg',
    },
    location: {
      address1: '1 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      distance_to_patient_mi: 0.8,
    },
  },
  {
    provider_location_id: 'pr_b|lo_b',
    provider: { provider_id: 'pr_b', first_name: 'Bo', last_name: 'Sampleton' },
  },
];

type Results = HTMLElement & {
  providers: ProviderLocation[];
  selectedId?: string;
  showPhotos: boolean;
  insuranceName?: string;
};

async function mountResults(providers: ProviderLocation[]): Promise<Results> {
  const element = await mount<Results>('<zd-provider-results></zd-provider-results>');
  element.providers = providers;
  await settled(element);
  return element;
}

function shadow(element: Results): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-provider-results rendered no shadow root');
  return root;
}

describe('zd-provider-results', () => {
  it('renders one card per provider', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelectorAll('[part="provider"]')).toHaveLength(2);
  });

  it('shows an empty state when given no providers', async () => {
    const element = await mountResults([]);
    expect(shadow(element).textContent).toContain('No providers');
  });

  it('emits provider-select with the chosen provider', async () => {
    const element = await mountResults(PROVIDERS);
    const events: CustomEvent[] = [];
    element.addEventListener('provider-select', (event) => events.push(event as CustomEvent));

    shadow(element).querySelectorAll<HTMLElement>('[part="provider"]')[1]!.click();

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.provider.provider_location_id).toBe('pr_b|lo_b');
  });

  it('emits a composed event that escapes the shadow root', async () => {
    const element = await mountResults(PROVIDERS);
    const events: Event[] = [];
    // `once` so the listener does not outlive this test — document.body is not
    // torn down between tests the way the mounted element is.
    document.body.addEventListener('provider-select', (event) => events.push(event), {
      once: true,
    });

    shadow(element).querySelector<HTMLElement>('[part="provider"]')!.click();

    expect(events).toHaveLength(1);
  });

  it('derives a display name from first and last name when full_name is absent', async () => {
    const element = await mountResults(PROVIDERS);
    const names = [...shadow(element).querySelectorAll('[part="provider-name"]')].map((node) =>
      node.textContent?.trim()
    );
    expect(names).toEqual(['Dr. Ada Testerson', 'Bo Sampleton']);
  });

  it('omits the specialty line for a provider with no specialties', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelectorAll('[part="provider-specialty"]')).toHaveLength(1);
  });

  /*
   * The card is `renderProviderSummary`, which has its own tests — these cover the wiring, not
   * the formatting: that the two host properties reach it, and that the shared block is what
   * lands in this component's shadow root so its parts are stylable from a host page.
   */
  it('shows the distance and address on the card', async () => {
    const element = await mountResults(PROVIDERS);
    const where = shadow(element).querySelector('[part="provider-location"]')?.textContent;

    expect(where).toContain('1 Sandbox Plaza, Brooklyn, NY 11201');
  });

  it('renders no photo until asked, even when the API supplied one', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelector('img')).toBeNull();

    element.showPhotos = true;
    await settled(element);

    expect(shadow(element).querySelector('img')?.getAttribute('src')).toBe(
      'https://images.test/ada.jpg'
    );
  });

  /* Without a plan named there is nothing for `accepts_patient_insurance` to be relative to. */
  it('shows the network line only once an insurance plan is named', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelector('[part="provider-insurance"]')).toBeNull();

    element.insuranceName = 'Test Health PPO';
    await settled(element);

    expect(shadow(element).querySelector('[part="provider-insurance"]')?.textContent).toContain(
      'In-network · Test Health PPO'
    );
  });

  it('marks only the selected provider with aria-current', async () => {
    const element = await mountResults(PROVIDERS);
    element.selectedId = 'pr_b|lo_b';
    await settled(element);

    const current = [...shadow(element).querySelectorAll('[part="provider"]')].map((node) =>
      node.getAttribute('aria-current')
    );
    expect(current).toEqual([null, 'true']);
  });

  it('tracks selection when a provider is chosen', async () => {
    const element = await mountResults(PROVIDERS);
    shadow(element).querySelectorAll<HTMLElement>('[part="provider"]')[1]!.click();
    await settled(element);

    expect(element.selectedId).toBe('pr_b|lo_b');
  });

  // A11Y-001. The provider control is a real <button> inside a real list, which
  // is what makes Enter and Space work without a keydown handler and what gives
  // a screen reader the item count. Asserting the tag names keeps someone from
  // "simplifying" this into a div with role="button".
  it('uses native list and button semantics', async () => {
    const element = await mountResults(PROVIDERS);
    const root = shadow(element);

    expect(root.querySelectorAll('ul > li')).toHaveLength(2);
    expect(root.querySelector('[part="provider"]')?.tagName).toBe('BUTTON');
    expect(root.querySelector('[part="provider"]')?.getAttribute('type')).toBe('button');
  });

  it('renders the provider name as text, not as an attribute', async () => {
    const element = await mountResults(PROVIDERS);
    for (const node of shadow(element).querySelectorAll('*')) {
      expect(node.getAttribute('aria-label')).toBeNull();
    }
    expect(shadow(element).textContent).toContain('Dr. Ada Testerson');
  });

  describe('accessibility', () => {
    it('passes axe checks with providers', async () => {
      const element = await mountResults(PROVIDERS);

      await expectNoViolations(element);
    });

    /*
     * The empty state is its own markup rather than a shorter list, so it is its own
     * check (A11Y-005). An empty `<ul>` in place of the message would pass every
     * assertion above and fail here.
     */
    it('passes axe checks when empty', async () => {
      const element = await mountResults([]);

      await expectNoViolations(element);
    });

    /* Selection adds `aria-current` to one card, which is markup nothing else covers. */
    it('passes axe checks with a provider selected', async () => {
      const element = await mountResults(PROVIDERS);
      element.selectedId = 'pr_b|lo_b';
      await settled(element);

      await expectNoViolations(element);
    });
  });
});
