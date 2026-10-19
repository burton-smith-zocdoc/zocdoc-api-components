import { describe, expect, it } from 'vitest';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, parts, queryPart, shadow } from '../../utils/test/mount.js';
import type { ZdProviderCard } from './provider-card.js';
import './index.js';

/**
 * The fixture directory's own location rather than an invented one (TEST-003). The brief for
 * this task named `SCENARIOS.drJohnSmith.providerLocations[0]`, which does not exist in
 * `client/mock/fixtures.js` — `SCENARIOS` is a map of sentinel ids and zip codes, and the
 * provider fixtures live in the separate `PROVIDER_LOCATIONS` array that every other
 * component's tests already draw from (see `provider-profile.test.ts`).
 */
const PROVIDER = PROVIDER_LOCATIONS[0]!;

type Card = ZdProviderCard;

describe('zd-provider-card', () => {
  it('renders without provider', async () => {
    const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
    expect(shadow(card).textContent?.trim()).toBe('');
  });

  it('renders with provider', async () => {
    const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
    card.provider = PROVIDER;
    await card.updateComplete;
    expect(shadow(card).querySelector('zd-card')).not.toBeNull();
  });

  describe('rendering', () => {
    it('renders provider name with title', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const name = part(card, 'name');
      expect(name?.textContent).toContain(PROVIDER.provider.full_name ?? PROVIDER.provider.last_name);
    });

    it('renders specialty', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const specialty = part(card, 'specialty');
      expect(specialty?.textContent).toContain(PROVIDER.provider.specialties?.[0]);
    });

    it('renders location with distance', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const location = part(card, 'location');
      expect(location?.textContent).toBeTruthy();
    });

    it('renders insurance status when insuranceName provided', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      card.insuranceName = 'Anthem Blue Cross';
      await card.updateComplete;

      const insurance = part(card, 'insurance');
      expect(insurance?.textContent).toContain('Anthem Blue Cross');
    });

    it('does not render insurance without insuranceName', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const insurance = queryPart(card, 'insurance');
      expect(insurance).toBeNull();
    });

    it('passes axe', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      await expectNoViolations(card);
    });
  });

  describe('avatar', () => {
    it('shows avatar with initials when hidePhoto is true', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = {
        ...PROVIDER,
        provider: { ...PROVIDER.provider, provider_photo_url: '//images.test/photo.jpg' },
      };
      card.hidePhoto = true;
      await card.updateComplete;

      const avatar = shadow(card).querySelector('zd-avatar');
      expect(avatar).not.toBeNull();
      expect(avatar?.getAttribute('initials')).toBeTruthy();
      expect(avatar?.getAttribute('image')).toBeNull();
    });

    it('shows avatar with image by default', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = {
        ...PROVIDER,
        provider: { ...PROVIDER.provider, provider_photo_url: '//images.test/photo.jpg' },
      };
      await card.updateComplete;

      const avatar = shadow(card).querySelector('zd-avatar');
      expect(avatar?.getAttribute('image')).toBe('https://images.test/photo.jpg');
    });

    it('derives initials from first and last name', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const avatar = shadow(card).querySelector('zd-avatar');
      const initials = avatar?.getAttribute('initials');
      expect(initials?.length).toBe(2);
    });
  });

  describe('events', () => {
    it('emits profile-request when name is clicked', async () => {
      const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      const events: CustomEvent[] = [];
      card.addEventListener('profile-request', (e) => events.push(e as CustomEvent));

      const nameButton = part<HTMLElement>(card, 'name');
      nameButton?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.provider).toBe(PROVIDER);
    });
  });

  describe('slots', () => {
    it('renders slotted availability content', async () => {
      const card = await mount<Card>(
        '<zd-provider-card><span slot="availability" id="test-avail">Availability here</span></zd-provider-card>'
      );
      card.provider = PROVIDER;
      await card.updateComplete;

      const slotted = card.querySelector('#test-avail');
      expect(slotted).not.toBeNull();
      expect(slotted?.textContent).toBe('Availability here');
    });

    it('renders slotted badges content', async () => {
      const card = await mount<Card>(
        '<zd-provider-card><span slot="badges" id="test-badge">Badge here</span></zd-provider-card>'
      );
      card.provider = PROVIDER;
      await card.updateComplete;

      const slotted = card.querySelector('#test-badge');
      expect(slotted).not.toBeNull();
      expect(slotted?.textContent).toBe('Badge here');
    });
  });

  describe('loading', () => {
    it('renders skeletons instead of provider details', async () => {
      const card = await mount<Card>('<zd-provider-card loading></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      expect(parts(card, 'skeleton')).toHaveLength(4);
      expect(queryPart(card, 'name')).toBeNull();
      expect(queryPart(card, 'photo')).toBeNull();
    });

    it('announces loading in DOM text', async () => {
      const card = await mount<Card>('<zd-provider-card loading></zd-provider-card>');

      const status = shadow(card).querySelector('[role="status"]');
      expect(status?.textContent?.trim()).toBe('Loading provider');
      expect(shadow(card).querySelector('[aria-busy="true"]')).not.toBeNull();
    });

    it('renders provider details once loading clears', async () => {
      const card = await mount<Card>('<zd-provider-card loading></zd-provider-card>');
      card.provider = PROVIDER;
      await card.updateComplete;

      card.loading = false;
      await card.updateComplete;

      expect(parts(card, 'skeleton')).toHaveLength(0);
      expect(part(card, 'name').textContent).toContain(PROVIDER.provider.last_name);
    });

    it('keeps the availability slot while loading', async () => {
      const card = await mount<Card>(
        '<zd-provider-card loading><div slot="availability">Availability here</div></zd-provider-card>'
      );

      expect(shadow(card).querySelector('slot[name="availability"]')).not.toBeNull();
    });

    it('passes axe', async () => {
      const card = await mount<Card>('<zd-provider-card loading></zd-provider-card>');

      await expectNoViolations(card);
    });
  });
});
