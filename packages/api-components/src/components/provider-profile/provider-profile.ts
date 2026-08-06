import { CharmElement } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import {
  providerAddress,
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from '../internal/provider-summary.js';
import styles from './provider-profile.styles.js';

/**
 * An RFC 3966 `tel:` URI for a number the API returned in whatever shape the practice
 * typed it — `(555) 555-0100`, `555.555.0100`, `+1 555 555 0100`.
 *
 * Everything but digits and a leading `+` is stripped, because a dialler handed the
 * punctuation may refuse the whole URI. The extension goes in `;ext=` rather than into the
 * number: appended to the digits it would be dialled as part of the number and reach nobody.
 *
 * Returns `undefined` when nothing dialable survives, so a number of "call for details" does
 * not become a link that dials the empty string.
 */
/**
 * The name heading's id, which the surrounding `<article>` points `aria-labelledby` at.
 *
 * A constant and not a generated id: ids are scoped to the shadow root, so two profiles on one
 * page cannot collide however many of them there are.
 */
const NAME_ID = 'provider-name';

function telHref(number: string | undefined, extension?: string | null): string | undefined {
  if (!number) return undefined;

  const digits = number.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  if (!/\d/.test(digits)) return undefined;

  const ext = extension?.replace(/\D/g, '');
  return ext ? `tel:${digits};ext=${ext}` : `tel:${digits}`;
}

/**
 * The whole of one provider location, as a page rather than a card. Presentational only — it
 * fetches nothing, so it has no request state and needs no token.
 *
 * Everything it renders comes off the `provider` property, which is exactly the
 * `ProviderLocation` that `zd-provider-results` emits on `provider-select`, so wiring the two
 * together is one assignment and no translation (COMP-002). It emits nothing: there is
 * nothing here to decide.
 *
 * **Sections are dropped, not blanked.** Every field under `Provider` but `provider_id` is
 * optional, and production populates them unevenly — a location with no `statement` and no
 * `credentials` is ordinary, not broken. A section whose data is absent renders nothing at
 * all, so a sparse provider reads as brief rather than as a page of empty headings.
 *
 * **What it deliberately does not render.** The production profile also carries reviews, a
 * ratings summary, an insurance list, a map, and the "Patients often return" highlights. None
 * of them are in this API: there is no reviews or ratings endpoint, `accepts_patient_insurance`
 * answers about one plan rather than listing the accepted ones, and the highlights are derived
 * from Zocdoc's own booking history. Rather than invent them, this component leaves holes where
 * they belong — see the `highlights`, `reviews`, and `faqs` slots — so a host page that has
 * that data can drop it in and one that does not gets a shorter page instead of a wrong one.
 *
 * The network line is not among them, and its absence is a policy choice rather than an
 * oversight: `accepts_patient_insurance` is answered relative to the plan the *search* sent, and
 * this component never sees a search. "In-network" with nothing to be in the network of is a
 * coverage claim a patient could take to an appointment and be billed for, so it is not
 * renderable from here at all.
 *
 * **Heading levels.** The provider's name is an `<h2>` and each section heading an `<h3>`, which
 * assumes the embedding page owns the `<h1>` — the same assumption `zd-booking-flow` makes of its
 * step heading. Slotted content should continue at `<h3>` so the outline stays walkable.
 *
 * **Why the `<article>` matters.** Everything is wrapped in one, named by the provider's own
 * heading. It is the honest element for a self-contained composition a page lists several of, and
 * it is also what makes the `<header>` and the `<address>` inside it legal: both are defined
 * relative to their nearest sectioning ancestor, so without the article they would describe the
 * embedding *page* — a `banner` landmark and a set of contact details that are not the host's.
 *

 * @tag zd-provider-profile
 * @slot highlights - Placed under the header, where the production profile puts its
 *   "Patients often return" highlights. Nothing in this API supplies them.
 * @slot reviews - Placed after the last section. There is no reviews endpoint; a host page with
 *   its own reviews puts them here, including their own `<h3>`.
 * @slot faqs - Placed last, matching the production profile's own order.
 * @slot actions - Beside the name in the header, for the Share and Save controls the production
 *   header carries. Both are host concerns — neither is API data.
 * @csspart profile - The `<article>` wrapping the whole profile, and the element every section
 *   is spaced by.
 * @csspart header - The photo, name, specialty, and address together.
 * @csspart photo - The provider's photo, when `show-photo` is set.
 * @csspart identity - The text column beside the photo.
 * @csspart name - The provider's name and credential, as an `<h2>`.
 * @csspart specialty - The provider's primary specialty.
 * @csspart header-location - The address under the name, or the video-visit line.
 * @csspart section - Every section, so one rule can space them all.
 * @csspart section-heading - A section's `<h3>`.
 * @csspart about - The section carrying the provider's own statement.
 * @csspart statement - The statement itself.
 * @csspart languages - The languages section.
 * @csspart certifications - The certifications section.
 * @csspart education - The education section.
 * @csspart location - The practice, address, and phone section.
 * @csspart contact - The `<address>` holding all three.
 * @csspart place - One line naming the office or the practice.
 * @csspart address - The street address.
 * @csspart phone - The practice's phone number, as a `tel:` link.
 * @csspart list - The list inside languages, certifications, or education.
 * @csspart list-item - One entry in that list.
 */
export class ZdProviderProfile extends CharmElement {
  public static override baseName = 'provider-profile';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  /**
   * The location to describe.
   *
   * `ProviderLocation` and not `Provider`, because half of what a profile says is about
   * *where* — the address, the practice, the phone number, whether it is a video visit — and a
   * provider practising at three locations has three of those. It is also the shape every other
   * component in this package passes around, so nothing has to be unpacked to get here.
   */
  @property({ attribute: false })
  public provider?: ProviderLocation;

  /**
   * Renders the provider's photo. Off by default for the same reason `zd-provider-results`
   * defaults it off: `provider_photo_url` points at Zocdoc's image CDN rather than the
   * configured `baseUrl`, so painting it makes an outbound request to a host PHI-003 does not
   * otherwise allow. A host page that wants production parity opts in knowingly.
   */
  @property({ type: Boolean, attribute: 'show-photo' })
  public showPhoto = false;

  /**
   * The address under the name, without the distance.
   *
   * `providerLocationLine` leads with `distance_to_patient_mi`, which is right on a search
   * result and wrong here: it is a distance from a ZIP code this component was never told,
   * and a profile reached by link has no search behind it at all. The virtual case still goes
   * through the shared helper, since "Video visit · NY" is the whole line there and there is
   * no address to fall back to.
   */
  protected headerLocation(provider: ProviderLocation): string | undefined {
    return provider.provider_location_type === 'virtual_provider'
      ? providerLocationLine(provider)
      : providerAddress(provider);
  }

  protected renderHeader(provider: ProviderLocation): unknown {
    const photo = this.showPhoto ? providerPhotoUrl(provider) : undefined;
    const specialty = provider.provider.specialties?.[0];
    const where = this.headerLocation(provider);

    /*
     * A real `<header>`, which is only correct because it is inside the `<article>` that
     * `render` puts around everything. Outside sectioning content a `<header>` maps to the
     * `banner` landmark — the *page's* header — and a shadow root does not scope that away, so
     * two profiles in a list would be two page banners (A11Y-001). The article is what makes
     * this element mean "this provider's header" instead.
     *
     * `alt=""` on the photo, because it is decorative in the strict sense: the name it depicts
     * is the very next node, and describing it would make a screen reader say the provider
     * twice.
     */
    return this.html`
      <header part="header">
        ${photo ? this.html`<img part="photo" src=${photo} alt="" />` : nothing}
        <div part="identity">
          <h2 id=${NAME_ID} part="name">${providerHeading(provider)}</h2>
          ${specialty ? this.html`<p part="specialty">${specialty}</p>` : nothing}
          ${where ? this.html`<p part="header-location">${where}</p>` : nothing}
        </div>
        <slot name="actions"></slot>
      </header>
    `;
  }

  /**
   * One section, or nothing when it has no body.
   *
   * The emptiness test is `body === nothing`, which is what every builder below returns when
   * its data is absent — so a section is dropped by the same expression that decided it had
   * nothing to show, rather than by a second check that could disagree with it.
   */
  protected renderSection(name: string, heading: string, body: unknown): unknown {
    if (body === nothing) return nothing;

    return this.html`
      <section part="section ${name}">
        <h3 part="section-heading">${heading}</h3>
        ${body}
      </section>
    `;
  }

  /**
   * The languages, certifications, or education list.
   *
   * A real `<ul>` so a screen reader announces how many there are before the user starts
   * through them, and so "board certified in two things" is not something they have to count
   * by listening. Blank entries are dropped rather than rendered as empty bullets.
   */
  protected renderList(items: string[] | undefined): unknown {
    const present = items?.filter((item) => Boolean(item?.trim())) ?? [];
    if (present.length === 0) return nothing;

    return this.html`
      <ul part="list">
        ${present.map((item) => this.html`<li part="list-item">${item}</li>`)}
      </ul>
    `;
  }

  /**
   * The provider's own statement.
   *
   * Rendered as a single text node in one `<p>`, with the line breaks the practice typed
   * preserved by `white-space` rather than by splitting it into paragraphs here: a phrase cut
   * across elements is a phrase a browser cannot translate (I18N-004).
   */
  protected renderAbout(provider: ProviderLocation): unknown {
    const statement = provider.provider.statement?.trim();
    if (!statement) return nothing;

    return this.renderSection('about', 'About', this.html`<p part="statement">${statement}</p>`);
  }

  /**
   * Where the visit happens, in full — which on a profile is the section a patient reads twice:
   * once to decide, once on the way there.
   *
   * A virtual location has no address and no phone, so it gets the one line it has. Everything
   * else is assembled from whatever arrived; the section disappears entirely when none of it did.
   */
  protected renderLocation(provider: ProviderLocation): unknown {
    if (provider.provider_location_type === 'virtual_provider') {
      const line = providerLocationLine(provider);
      return line
        ? this.renderSection('location', 'Location', this.html`<p part="place">${line}</p>`)
        : nothing;
    }

    /*
     * The office and the practice are different things — "Sandbox Plaza Family Medicine" is
     * the building, "Sandbox Health Partners" the group that runs it — so both are worth
     * naming when both arrived. Deduplicated, because plenty of locations return the same
     * string for each and printing it twice reads as a rendering bug.
     */
    const names = [provider.location?.location_name, provider.practice?.practice_name].filter(
      (name, index, all): name is string => Boolean(name) && all.indexOf(name) === index
    );

    const address = providerAddress(provider);
    const phone = telHref(provider.location?.phone_number, provider.location?.phone_extension);

    if (names.length === 0 && !address && !phone) return nothing;

    /*
     * The link's text is the number as the practice gave it, not the sanitised URI: the digits
     * are what a patient reads out and what a translation tool should leave alone (I18N-001).
     * The extension is inside the same link text rather than beside it, so "ext. 2" cannot end
     * up on its own line reading as a different phone number.
     */
    const extension = provider.location?.phone_extension?.trim();
    const dialable = provider.location?.phone_number;

    /*
     * An `<address>`, which is the element for exactly this and is only usable here because
     * everything sits inside an `<article>`: it represents the contact information *for its
     * nearest article ancestor*, and that article is this provider location. Outside one it
     * would claim to be the contact details of the whole embedding page.
     */
    return this.renderSection(
      'location',
      'Location',
      this.html`
        <address part="contact">
          ${names.map((name) => this.html`<p part="place">${name}</p>`)}
          ${address ? this.html`<p part="address">${address}</p>` : nothing}
          ${
            phone
              ? this.html`
                  <p>
                    <a part="phone" href=${phone}>
                      ${extension ? `${dialable} ext. ${extension}` : dialable}
                    </a>
                  </p>
                `
              : nothing
          }
        </address>
      `
    );
  }

  protected override render(): unknown {
    const provider = this.provider;
    if (!provider) return nothing;

    /*
     * An `<article>`, because that is what this is: a self-contained composition about one
     * subject, of the kind a page syndicates or lists several of. It is doing three jobs at
     * once — it is the honest element, it is what scopes the `<header>` and the `<address>`
     * below to this provider rather than to the page, and named by the provider's own heading it
     * is what a screen reader announces when a user steps through a list of them.
     *
     * Section order follows the production profile's own nav — About, then the credentials,
     * then Location, then the two slots. The slots are bare `<slot>`s rather than sections with
     * headings of their own: a "Reviews" heading over an unfilled slot is a promise the page
     * does not keep, and only the host knows whether it has any. A slot is `display: contents`
     * by default, so an unfilled one also leaves no gap behind it in the layout.
     *
     * The sections are deliberately left unnamed. An `aria-labelledby` on each would turn all
     * five into `region` landmarks, which is both more landmarks than a component has any
     * business declaring and a duplicate-landmark violation the moment a page shows two
     * profiles. The headings already make the outline walkable.
     */
    return this.html`
      <article part="profile" aria-labelledby=${NAME_ID}>
        ${this.renderHeader(provider)}
        <slot name="highlights"></slot>
        ${this.renderAbout(provider)}
        ${this.renderSection(
          'languages',
          'Languages',
          this.renderList(provider.provider.languages)
        )}
        ${this.renderSection(
          'certifications',
          'Certifications',
          this.renderList(provider.provider.credentials?.certifications)
        )}
        ${this.renderSection(
          'education',
          'Education',
          this.renderList(provider.provider.credentials?.education?.institutions)
        )}
        ${this.renderLocation(provider)}
        <slot name="reviews"></slot>
        <slot name="faqs"></slot>
      </article>
    `;
  }
}
