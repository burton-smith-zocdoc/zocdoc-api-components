import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, parts, queryPart, settled, shadow } from '../../utils/test/mount.js';
import type { ZdProviderCard } from './provider-card.js';
import { jsonBlock, mountBeforeUpgrade, renderedText } from '../../utils/test/hydration.js';
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
      expect(name?.textContent).toContain(
        PROVIDER.provider.full_name ?? PROVIDER.provider.last_name
      );
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

    async function mountAnnotated(content: string): Promise<Card> {
      const card = await mount<Card>(`<zd-provider-card>${content}</zd-provider-card>`);
      card.provider = PROVIDER;
      await settled(card);
      return card;
    }

    const ANNOTATED = [
      '<span slot="reason">Sees patients for skin checks</span>',
      '<span slot="review">Thorough and kind</span>',
      '<span slot="sponsored">Sponsored</span>',
    ].join('');

    it('renders slotted reason, review and sponsored text', async () => {
      const card = await mountAnnotated(ANNOTATED);

      const shown = ['reason', 'review', 'sponsored'].map((name) => {
        const slot = queryPart(card, name) as HTMLSlotElement | null;
        return { name, text: slot?.assignedNodes()[0]?.textContent };
      });

      expect(shown).toEqual([
        { name: 'reason', text: 'Sees patients for skin checks' },
        { name: 'review', text: 'Thorough and kind' },
        { name: 'sponsored', text: 'Sponsored' },
      ]);
    });

    it('renders them after the specialty and before the badges', async () => {
      const card = await mountAnnotated(`${ANNOTATED}<span slot="badges">Badge</span>`);
      const order = [
        ...shadow(card).querySelectorAll(
          '[part="specialty"], [part="reason"], [part="review"], [part="sponsored"], slot[name="badges"]'
        ),
      ].map((node) => node.getAttribute('part') ?? node.getAttribute('name'));

      expect(order).toEqual(['specialty', 'reason', 'review', 'sponsored', 'badges']);
    });

    it('gives an empty slot no box, so it leaves no gap', async () => {
      const card = await mountAnnotated('<span slot="review">Thorough and kind</span>');

      for (const name of ['reason', 'review', 'sponsored']) {
        expect(getComputedStyle(queryPart(card, name)!).display).toBe('contents');
      }
    });

    it('passes axe checks with all three filled', async () => {
      const card = await mountAnnotated(ANNOTATED);
      await expectNoViolations(card);
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
      // A busy ancestor can hold the announcement back, so the status must not have one.
      expect(status?.closest('[aria-busy="true"]')).toBeNull();
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

describe('zd-provider-card markup hydration', () => {
  it('renders the same from a JSON block as from the property', async () => {
    const fromProperty = await mount<Card>('<zd-provider-card></zd-provider-card>');
    fromProperty.provider = PROVIDER;
    await settled(fromProperty);
    const fromMarkup = await mount<Card>(
      `<zd-provider-card>${jsonBlock('provider', PROVIDER)}</zd-provider-card>`
    );

    expect(renderedText(fromMarkup)).not.toBe('');
    expect(renderedText(fromMarkup)).toBe(renderedText(fromProperty));
  });

  it('lets a property set before upgrade win over the block', async () => {
    const other = PROVIDER_LOCATIONS[1]!;
    const element = await mountBeforeUpgrade<Card>(
      `<zd-provider-card>${jsonBlock('provider', PROVIDER)}</zd-provider-card>`,
      { provider: other }
    );
    expect(element.provider).toBe(other);
  });
});

describe('zd-provider-card handoff', () => {
  /** An invented Zocdoc profile path, not a real provider (PHI-002). */
  const PROFILE_URL = 'https://www.zocdoc.com/doctor/test-provider-12345';

  function withProfile(profileUrl: string | undefined) {
    return { ...PROVIDER, provider: { ...PROVIDER.provider, profile_url: profileUrl } };
  }

  /** Cancels the tap's default after the card has seen it, so the test page never navigates. */
  let followed: boolean[];
  function stopNavigation(event: Event): void {
    followed.push(!event.defaultPrevented);
    event.preventDefault();
  }

  beforeEach(() => {
    followed = [];
    window.addEventListener('click', stopNavigation);
  });

  afterEach(() => {
    window.removeEventListener('click', stopNavigation);
  });

  function hydrated(provider = withProfile(PROFILE_URL), attrs = '', content = ''): Promise<Card> {
    return mount<Card>(
      `<zd-provider-card ${attrs}>${jsonBlock('provider', provider)}${content}</zd-provider-card>`
    );
  }

  function book(card: Card): (HTMLElement & { href?: string }) | null {
    return queryPart(card, 'book') as (HTMLElement & { href?: string }) | null;
  }

  /** The `<a>` a tap lands on. Charm's host `click()` also re-clicks it, so tests click it directly. */
  function anchor(card: Card): HTMLAnchorElement {
    return book(card)!.shadowRoot!.querySelector('a')!;
  }

  it('shows Book now when handoff and profile_url are present', async () => {
    const card = await hydrated();
    const link = book(card);

    expect(link?.textContent?.trim()).toMatch(/^Book now/);
    const href = new URL(link!.getAttribute('href')!);
    expect(href.origin + href.pathname).toBe(PROFILE_URL);
    expect(href.searchParams.get('component')).toBe('provider-card');
  });

  it.each([
    ['no profile_url', undefined],
    ['a protocol-relative URL', '//www.zocdoc.com/doctor/x'],
    ['http:', 'http://www.zocdoc.com/doctor/x'],
    ['another host', 'https://evil.example/doctor/x'],
  ])('hides Book now with %s', async (_, url) => {
    expect(book(await hydrated(withProfile(url)))).toBeNull();
  });

  it('Book now emits book-select and lets the link be followed', async () => {
    const card = await hydrated();
    const selected = vi.fn<(event: Event) => void>();
    card.addEventListener('book-select', selected);

    anchor(card).click();

    expect(selected).toHaveBeenCalledOnce();
    expect(selected.mock.calls[0]![0].detail.provider.provider_location_id).toBe(
      PROVIDER.provider_location_id
    );
    expect(followed).toEqual([true]);
  });

  it('preventDefault keeps the patient on the page', async () => {
    const card = await hydrated();
    card.addEventListener('book-select', (event) => event.preventDefault());

    anchor(card).click();

    expect(followed).toEqual([false]);
  });

  it('names the provider in the link for screen readers', async () => {
    const card = await hydrated();
    const name = book(card)!.querySelector('.visually-hidden');

    expect(name?.textContent).toBe(' with Avery Sandoval, MD');
    expect(getComputedStyle(name!).position).toBe('absolute');
  });

  // The test page is itself inside an iframe, which is the case that needs a new tab.
  it('opens in a new tab inside an iframe', async () => {
    const link = anchor(await hydrated());
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noreferrer noopener');
  });

  it('disable-handoff hides Book now', async () => {
    expect(book(await hydrated(withProfile(PROFILE_URL), 'disable-handoff'))).toBeNull();
  });

  it('no Book now for a property-driven card', async () => {
    const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
    card.provider = withProfile(PROFILE_URL);
    await settled(card);

    expect(book(card)).toBeNull();
  });

  it('no Book now when the card has times of its own to tap', async () => {
    const card = await hydrated(
      withProfile(PROFILE_URL),
      '',
      '<span slot="availability">Times here</span>'
    );
    expect(book(card)).toBeNull();
  });

  it('shows Book now for a card its parent marks with handoff, availability or not', async () => {
    const card = await mount<Card>(
      '<zd-provider-card><span slot="availability">Day counts</span></zd-provider-card>'
    );
    Object.assign(card, { provider: withProfile(PROFILE_URL), handoff: true });
    await settled(card);

    expect(book(card)).not.toBeNull();
  });

  it('Book now is reachable and activatable by keyboard', async () => {
    const card = await hydrated();
    const link = anchor(card);
    expect(link.getAttribute('href')).toMatch(/^https:\/\/www\.zocdoc\.com\//);

    link.focus();
    await userEvent.keyboard('{Enter}');

    expect(followed).toEqual([true]);
  });

  it('passes axe checks when hydrated', async () => {
    await expectNoViolations(await hydrated());
  });
});
