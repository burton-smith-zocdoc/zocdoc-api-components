import { html, nothing, type TemplateResult } from 'lit';
import type { ProviderLocation } from '../../client/types.js';
import { providerDisplayName } from './provider-name.js';

/**
 * The provider block that appears in the results list, on a profile header, and again in the
 * booking summary — one implementation, so the card a patient picked and the summary they
 * confirm describe the same provider in the same words.
 *
 * **A function returning a template, not a component.** The markup lands in the *caller's*
 * shadow root, so its `part` attributes are the caller's own and each consumer styles it
 * through its own `::part()` without any `exportparts` forwarding. A `zd-provider-summary`
 * element would put a shadow boundary between a host page and every line in here.
 *
 * It deliberately uses lit's plain `html` rather than a caller's scoped `this.html`, which
 * means no `<scoped-*>` tags and so nothing to add to anyone's `static dependencies`
 * (PBZD-001). Consumers spread `provider-summary.styles.js` into their own `styles`.
 */

/** Options every consumer sets differently. Everything else is read off the location. */
export interface ProviderSummaryOptions {
  /**
   * Renders the provider's photo. **Off by default, and that is a policy choice, not a
   * styling one:** `provider_photo_url` points at Zocdoc's image CDN, which is not the
   * configured `baseUrl`, so painting it makes an outbound request to a host PHI-003 does
   * not otherwise allow. A host page that wants production parity opts in knowingly; tests
   * and stories leave it off and make no third-party request.
   */
  showPhoto?: boolean;
  /**
   * The insurance plan the patient searched with, which is what gives
   * `accepts_patient_insurance` something to be accepted *by* — see
   * {@link renderProviderInsurance}.
   */
  insuranceName?: string;
}

/**
 * Distance, localized. `style: 'unit'` is what makes this "0.8 mi" for a US reader and
 * "0,8 mi" for a French one without us concatenating anything (I18N-002).
 *
 * Miles and not kilometres regardless of locale: the API's field is
 * `distance_to_patient_mi`, and converting it here would report a distance the search did
 * not filter on.
 */
const distanceLabel = new Intl.NumberFormat(undefined, {
  style: 'unit',
  unit: 'mile',
  unitDisplay: 'short',
  maximumFractionDigits: 1,
});

/** Joins the pieces of a line the way the rest of this package does. */
function line(...parts: (string | undefined)[]): string | undefined {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length ? present.join(' · ') : undefined;
}

/**
 * The provider's name with their credential appended — "Avery Sandoval, MD".
 *
 * `title` is a suffix rather than an honorific: production returns `MD`, `DO`, `APRN`. It is
 * built as one string rather than two elements so a browser translating the page sees one
 * phrase (I18N-004).
 */
export function providerHeading(location: ProviderLocation): string {
  const name = providerDisplayName(location);
  const title = location.provider.title;
  return title ? `${name}, ${title}` : name;
}

/**
 * The street address on one line, or `undefined` for a location that has no address to give.
 *
 * Every field is optional, so this is assembled from whatever arrived rather than formatted
 * from a shape we can rely on. A virtual location has no address at all.
 */
export function providerAddress(location: ProviderLocation): string | undefined {
  const address = location.location;
  if (!address) return undefined;

  const street = [address.address1, address.address2].filter(Boolean).join(', ');
  const region = [address.city, address.state].filter(Boolean).join(', ');
  const locality = [region, address.zip_code].filter(Boolean).join(' ');

  return [street, locality].filter(Boolean).join(', ') || undefined;
}

/**
 * Where the visit happens: "0.8 mi · 1 Sandbox Plaza, Brooklyn, NY 11201", or "Video visit"
 * for a virtual provider, whose distance is meaningless and whose address is absent.
 */
export function providerLocationLine(location: ProviderLocation): string | undefined {
  if (location.provider_location_type === 'virtual_provider') {
    return line('Video visit', location.virtual_location?.state ?? undefined);
  }

  const distance = location.location?.distance_to_patient_mi;
  return line(
    typeof distance === 'number' ? distanceLabel.format(distance) : undefined,
    providerAddress(location)
  );
}

/**
 * `https:`-prefixes the protocol-relative URL the API returns (`//d2uur…`), which is not a
 * valid `src` in every context.
 */
export function providerPhotoUrl(location: ProviderLocation): string | undefined {
  const url = location.provider.provider_photo_url;
  if (!url) return undefined;
  return url.startsWith('//') ? `https:${url}` : url;
}

/**
 * The network line, rendered **only when the patient actually named a plan**.
 *
 * `accepts_patient_insurance` is answered relative to the `insurance_plan_id` the search
 * sent, so with no plan sent it has no referent — and "In-network" with nothing to be in the
 * network of is a coverage claim a patient could take to an appointment and be billed for.
 * Requiring the caller to supply the plan name is what keeps that from being renderable by
 * accident.
 */
function renderProviderInsurance(
  location: ProviderLocation,
  insuranceName: string | undefined
): unknown {
  if (!insuranceName) return nothing;

  const acceptance = location.accepts_patient_insurance;
  if (acceptance !== 'accepted' && acceptance !== 'not_accepted') return nothing;

  const status = acceptance === 'accepted' ? 'In-network' : 'Out-of-network';
  return html`<span part="provider-insurance">${line(status, insuranceName)}</span>`;
}

/**
 * The summary itself. Every line is dropped rather than blanked when its data is absent,
 * because `Provider` marks all but `provider_id` optional and a card of empty rows reads as
 * broken where a shorter card reads as brief.
 *
 * The photo carries `alt=""`. It is decorative in the strict sense: the name it depicts is
 * the very next node, so describing it would make a screen reader say the provider twice.
 */
export function renderProviderSummary(
  location: ProviderLocation,
  options: ProviderSummaryOptions = {}
): TemplateResult {
  const specialty = location.provider.specialties?.[0];
  const where = providerLocationLine(location);
  const photo = options.showPhoto ? providerPhotoUrl(location) : undefined;

  return html`
    <div part="provider-summary">
      ${photo ? html`<img part="provider-photo" src=${photo} alt="" />` : nothing}
      <div part="provider-detail">
        <span part="provider-name">${providerHeading(location)}</span>
        ${specialty ? html`<span part="provider-specialty">${specialty}</span>` : nothing}
        ${where ? html`<span part="provider-location">${where}</span>` : nothing}
        ${renderProviderInsurance(location, options.insuranceName)}
      </div>
    </div>
  `;
}
