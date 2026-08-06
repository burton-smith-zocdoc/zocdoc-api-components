import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, parts, queryPart, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

/**
 * The fixture directory's own locations rather than invented ones (TEST-003). The first
 * carries every profile field; the second is virtual and carries almost none, which is the
 * pair this component exists to render differently.
 */
const FULL = PROVIDER_LOCATIONS[0]!;
const VIRTUAL = PROVIDER_LOCATIONS[1]!;

type Profile = HTMLElement & { provider?: ProviderLocation; showPhoto: boolean };

/** Nullable on purpose — several assertions here are about a section *not* rendering. */
const part = queryPart;

function text(element: HTMLElement, name: string): string {
  return part(element, name)?.textContent?.trim() ?? '';
}

/** Section names in the order they render, which is what the outline depends on. */
function sectionNames(element: HTMLElement): string[] {
  return parts(element, 'section').map(
    (section) => section.getAttribute('part')?.replace('section', '').trim() ?? ''
  );
}

/**
 * Mounts the profile with a location assigned as a property.
 *
 * `provider` is `attribute: false` — a `ProviderLocation` has nested objects and a composite id
 * with a literal `|` in it, so there is no attribute form to set — which means the markup and
 * the data cannot be one string the way the other components' tests do it.
 */
async function mountProfile(
  provider: ProviderLocation | undefined,
  markup = '<zd-provider-profile></zd-provider-profile>'
): Promise<Profile> {
  const element = await mount<Profile>(markup);
  element.provider = provider;
  await settled(element);
  return element;
}

describe('zd-provider-profile', () => {
  it('renders nothing at all without a provider', async () => {
    const element = await mountProfile(undefined);

    expect(shadow(element).textContent?.trim()).toBe('');
  });

  describe('the header', () => {
    it('names the provider with their credential, as a heading', async () => {
      const element = await mountProfile(FULL);

      const name = part(element, 'name');
      expect(name?.tagName).toBe('H2');
      expect(name?.textContent).toContain('Avery Sandoval, MD');
    });

    it('shows the primary specialty and the street address', async () => {
      const element = await mountProfile(FULL);

      expect(text(element, 'specialty')).toBe('Primary Care Doctor');
      expect(text(element, 'header-location')).toContain('1 Sandbox Plaza');
    });

    /**
     * The distance is a search artifact: it is measured from a ZIP code this component was
     * never told, and a profile reached by link has no search behind it. The fixture's `0.8`
     * would render as "0.8 mi" if the shared summary helper were used unchanged.
     */
    it('leaves the distance out of the address', async () => {
      const element = await mountProfile(FULL);

      expect(text(element, 'header-location')).not.toContain('mi');
    });

    it('says video visit instead of an address for a virtual provider', async () => {
      const element = await mountProfile(VIRTUAL);

      expect(text(element, 'header-location')).toContain('Video visit');
    });

    /**
     * `provider_photo_url` points at an image CDN rather than the configured `baseUrl`, so
     * painting it is an outbound request to a host PHI-003 does not otherwise allow. Off unless
     * asked for — and this location has no photo url at all, so the assertion is that the
     * element is absent either way rather than that the src is empty.
     */
    it('renders no photo unless show-photo is set', async () => {
      const element = await mountProfile(FULL);

      expect(part(element, 'photo')).toBeNull();
    });
  });

  describe('the sections', () => {
    it('renders them in the production profile’s order', async () => {
      const element = await mountProfile(FULL);

      expect(sectionNames(element)).toEqual([
        'about',
        'languages',
        'certifications',
        'education',
        'location',
      ]);
    });

    it('keeps the line breaks the practice typed in the statement', async () => {
      const element = await mountProfile(FULL);

      expect(text(element, 'statement')).toContain('\n');
    });

    it('lists every language, certification, and institution', async () => {
      const element = await mountProfile(FULL);

      const items = parts(element, 'list-item').map((item) => item.textContent?.trim());
      expect(items).toContain('Spanish');
      expect(items).toContain('American Board of Family Medicine');
      expect(items).toContain('Sandbox University School of Medicine');
    });

    /**
     * A real list, so a screen reader says how many there are before the user starts through
     * them. Three lists for three sections — one flat run of items would announce eight.
     */
    it('gives each list section its own list', async () => {
      const element = await mountProfile(FULL);

      const lists = parts(element, 'list');
      expect(lists).toHaveLength(3);
      expect(lists.every((list) => list.tagName === 'UL')).toBe(true);
    });

    /**
     * The normal case, not the exception: every `Provider` field but `provider_id` is optional
     * and production populates them unevenly. A page of empty headings reads as broken where a
     * shorter page reads as brief.
     */
    it('drops every section it has no data for', async () => {
      const element = await mountProfile(VIRTUAL);

      expect(sectionNames(element)).toEqual(['location']);
      expect(part(element, 'statement')).toBeNull();
      expect(part(element, 'list')).toBeNull();
    });

    /**
     * A section heading with nothing under it is the failure mode `renderSection` guards, so
     * the guard gets a location whose statement is present but blank rather than absent.
     */
    it('drops a section whose only content is whitespace', async () => {
      const element = await mountProfile({
        ...FULL,
        provider: { ...FULL.provider, statement: '   \n  ', languages: ['', '  '] },
      });

      expect(sectionNames(element)).not.toContain('about');
      expect(sectionNames(element)).not.toContain('languages');
    });
  });

  describe('the location section', () => {
    it('names the office and the practice, and gives the address', async () => {
      const element = await mountProfile(FULL);

      const places = parts(element, 'place').map((place) => place.textContent?.trim());
      expect(places).toEqual(['Sandbox Plaza Family Medicine', 'Sandbox Health Partners']);
      expect(text(element, 'address')).toBe('1 Sandbox Plaza, Brooklyn, NY 11201');
    });

    /** Plenty of locations return the same string for both, and printing it twice reads as a bug. */
    it('names a place once when the office and the practice share a name', async () => {
      const element = await mountProfile({
        ...FULL,
        practice: { practice_id: 'pt_1', practice_name: 'Sandbox Plaza Family Medicine' },
      });

      expect(parts(element, 'place')).toHaveLength(1);
    });

    /**
     * The href is sanitised because a dialler handed `(555) 555-0100` may refuse the whole URI;
     * the text is not, because the punctuation is what a patient reads out (I18N-001).
     */
    it('links the phone number as a dialable tel: URI', async () => {
      const element = await mountProfile(FULL);

      const phone = part(element, 'phone');
      expect(phone?.getAttribute('href')).toBe('tel:5555550100');
      expect(phone?.textContent?.trim()).toBe('(555) 555-0100');
    });

    /**
     * `;ext=` rather than appended digits: run onto the end of the number the extension would
     * be dialled as part of it and reach nobody.
     */
    it('carries an extension in ;ext= rather than in the number', async () => {
      const element = await mountProfile({
        ...FULL,
        location: { ...FULL.location!, phone_extension: '2' },
      });

      const phone = part(element, 'phone');
      expect(phone?.getAttribute('href')).toBe('tel:5555550100;ext=2');
      expect(phone?.textContent?.trim()).toBe('(555) 555-0100 ext. 2');
    });

    /** A number with no digits in it is not a link, however much punctuation it has. */
    it('drops the link for a phone number with nothing dialable in it', async () => {
      const element = await mountProfile({
        ...FULL,
        location: { ...FULL.location!, phone_number: 'call for details' },
      });

      expect(part(element, 'phone')).toBeNull();
      expect(text(element, 'address')).toContain('1 Sandbox Plaza');
    });

    it('drops the section entirely for a location with no address, practice, or phone', async () => {
      const element = await mountProfile({
        provider_location_id: FULL.provider_location_id,
        provider_location_type: 'in_person_provider',
        provider: { provider_id: FULL.provider.provider_id, full_name: 'Avery Sandoval' },
      });

      expect(sectionNames(element)).toEqual([]);
      expect(text(element, 'name')).toContain('Avery Sandoval');
    });
  });

  /**
   * The holes where the data this API does not have belongs. Bare slots rather than sections
   * with headings of their own: only the host knows whether it has reviews, and a "Reviews"
   * heading over an unfilled slot is a promise the page does not keep.
   */
  describe('the host slots', () => {
    it('places slotted content where the production profile puts it', async () => {
      const element = await mountProfile(
        FULL,
        `<zd-provider-profile>
           <p slot="highlights">Patients often return</p>
           <p slot="reviews">4.92 out of 5</p>
           <p slot="faqs">Does this provider offer video visits?</p>
           <button slot="actions" type="button">Share</button>
         </zd-provider-profile>`
      );

      const names = [...shadow(element).querySelectorAll('slot')].map((slot) => slot.name);
      expect(names).toEqual(['actions', 'highlights', 'reviews', 'faqs']);

      const assigned = (name: string) =>
        shadow(element)
          .querySelector<HTMLSlotElement>(`slot[name="${name}"]`)
          ?.assignedElements()
          .map((node) => node.textContent?.trim());

      expect(assigned('highlights')).toEqual(['Patients often return']);
      expect(assigned('reviews')).toEqual(['4.92 out of 5']);
      expect(assigned('faqs')).toEqual(['Does this provider offer video visits?']);
      expect(assigned('actions')).toEqual(['Share']);
    });
  });

  describe('accessibility', () => {
    it('has no violations for a fully populated profile', async () => {
      const element = await mountProfile(FULL);

      await expectNoViolations(element);
    });

    /**
     * A different shape, not the same one again: the sparse profile is one heading and one
     * section, which is where a stranded rule or an unnamed empty list would show up.
     */
    it('has no violations for a sparse profile', async () => {
      const element = await mountProfile(VIRTUAL);

      await expectNoViolations(element);
    });

    /**
     * `<h2>` then `<h3>` and nothing skipped, which is what axe's `heading-order` rule checks
     * and what a screen reader walks. The page's `<h1>` is the host's, which is the same
     * assumption `zd-booking-flow` makes of its step heading.
     */
    it('descends one heading level from the name to the sections', async () => {
      const element = await mountProfile(FULL);

      const levels = [...shadow(element).querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
        (heading) => heading.tagName
      );

      expect(levels[0]).toBe('H2');
      expect(levels.slice(1)).toEqual(['H3', 'H3', 'H3', 'H3', 'H3']);
    });
  });
});
