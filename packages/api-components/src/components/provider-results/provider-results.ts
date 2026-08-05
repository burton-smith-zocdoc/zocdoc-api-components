import { CharmElement, ZdButton, ZdCard } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import { renderProviderSummary } from '../internal/provider-summary.js';
import summaryStyles from '../internal/provider-summary.styles.js';
import styles from './provider-results.styles.js';

/** The API's own default, and so the page size in effect when nothing asked for another. */
const DEFAULT_PAGE_SIZE = 10;

/** Counts get thousands separators from the user's locale, not from us (I18N-002). */
const countLabel = new Intl.NumberFormat();

/**
 * Renders a list of provider locations and emits the one the user picks.
 * Purely presentational — it performs no network requests, and it works on its
 * own with nothing above it (COMP-004).
 *
 * **Paging is reported, not performed.** `page-change` says which page the patient asked for
 * and the component updates `page` to match, but fetching it belongs to whatever owns the
 * request — this component never learns the search criteria, so it could not refetch if it
 * wanted to (COMP-002).
 *
 * @tag zd-provider-results
 * @event provider-select - Emitted with `{ provider }` when a provider is chosen.
 * @event page-change - Emitted with `{ page }` when the patient pages. Zero-indexed, matching
 *   the API. The owner of the search is expected to fetch that page and hand back new
 *   `providers`; nothing here changes until it does.
 * @csspart summary - The line counting what the search found.
 * @csspart list - The list wrapper.
 * @csspart provider - The selectable control for one provider.
 * @csspart provider-summary - The summary block for one provider.
 * @csspart provider-photo - The provider's photo, when `show-photos` is set.
 * @csspart provider-detail - The text column beside the photo.
 * @csspart provider-name - The provider's display name and credential.
 * @csspart provider-specialty - The provider's primary specialty.
 * @csspart provider-location - The distance and address, or the video-visit line.
 * @csspart provider-insurance - The network line, when `insurance-name` is set.
 * @csspart provider-badges - The per-card slot for anything `renderBadges` adds.
 * @csspart pager - The paging controls.
 * @csspart pager-previous - The button going back a page.
 * @csspart pager-next - The button going forward a page.
 * @csspart pager-position - The line saying which page this is.
 * @csspart empty - The message shown when there are no providers.
 */
export class ZdProviderResults extends CharmElement {
  public static override baseName = 'provider-results';

  public static override styles = [
    ...super.styles,
    summaryStyles,
    styles,
  ] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdButton];
  }

  /** The provider locations to display. */
  @property({ attribute: false })
  public providers: ProviderLocation[] = [];

  /** The currently selected `provider_location_id`, if any. */
  @property({ attribute: 'selected-id' })
  public selectedId?: string;

  /**
   * Renders each provider's photo. Off by default because the photo comes from an image CDN
   * rather than the configured `baseUrl` — see `ProviderSummaryOptions.showPhoto`.
   */
  @property({ type: Boolean, attribute: 'show-photos' })
  public showPhotos = false;

  /**
   * The insurance plan the search was run with. Supplying it is what allows the network line
   * to render at all, since `accepts_patient_insurance` is only meaningful against a plan.
   */
  @property({ attribute: 'insurance-name' })
  public insuranceName?: string;

  /**
   * The **unpaged** total from `total_count`, which is what makes the count line and the pager
   * possible: `providers` only ever holds the page in hand.
   *
   * Left undefined by a host page that has no total, in which case neither renders — a count
   * of the current page presented as the count of the search would be a lie, and a pager
   * cannot know where it ends.
   */
  @property({ type: Number, attribute: 'total-count' })
  public totalCount?: number;

  /** The zero-indexed page `providers` holds, matching the API's own indexing. */
  @property({ type: Number })
  public page = 0;

  /** The page size the search used. Defaults to the API's own, which is what it fell back to. */
  @property({ type: Number, attribute: 'page-size' })
  public pageSize = DEFAULT_PAGE_SIZE;

  /** The last page's zero-index, or `undefined` when there is no total to derive it from. */
  protected get lastPage(): number | undefined {
    if (this.totalCount === undefined || this.pageSize <= 0) return undefined;
    return Math.max(0, Math.ceil(this.totalCount / this.pageSize) - 1);
  }

  /**
   * Announced when the list is empty. A parent that owns a request-state machine
   * renders its own empty message instead of this component, so in practice only
   * the standalone case reaches here.
   */
  protected renderEmpty(): unknown {
    return this.html`<p part="empty" role="status">No providers match this search.</p>`;
  }

  /**
   * How many the search found, which is the one number a patient reads before deciding whether
   * to narrow it.
   *
   * A live region, because paging replaces the whole list without moving focus or changing the
   * page — without it, the only feedback a screen reader user gets for pressing Next is that
   * the list they were reading is now different (A11Y-002). Counting the total rather than the
   * page is the point: `providers.length` is 10 on every page of 334.
   */
  protected renderSummary(): unknown {
    if (this.totalCount === undefined) return nothing;

    // One text node rather than a number in its own span: it is one phrase, and splitting it
    // is what stops a browser translating it (I18N-004).
    const count = countLabel.format(this.totalCount);
    const label = this.totalCount === 1 ? `${count} provider` : `${count} providers`;

    return this.html`<p part="summary" role="status" aria-live="polite">${label}</p>`;
  }

  /**
   * Anything a host page wants on a card that the API does not supply — the "Sponsored" mark,
   * an award, a practice badge. Returns nothing by default.
   *
   * A `protected` hook for a subclass rather than a per-card slot: a slot would need its name
   * built from each `provider_location_id`, which contains a literal `|`, and a host page
   * writing `slot="badges-pr_a|lo_a"` by hand is worse than one line of JavaScript. Nothing in
   * this package overrides it — it exists because those marks are real on the production UI and
   * unsourceable from this API, so the alternative is host pages rebuilding the whole card.
   */
  protected renderBadges(_location: ProviderLocation): unknown {
    return nothing;
  }

  protected override render(): unknown {
    if (this.providers.length === 0) {
      return this.renderEmpty();
    }

    return this.html`
      ${this.renderSummary()}

      <ul part="list">
        ${this.providers.map((location) => {
          const badges = this.renderBadges(location);
          return this.html`
            <li>
              <scoped-card>
                <button
                  part="provider"
                  type="button"
                  aria-current=${location.provider_location_id === this.selectedId ? 'true' : nothing}
                  @click=${() => this.select(location)}
                >
                  ${renderProviderSummary(location, {
                    showPhoto: this.showPhotos,
                    insuranceName: this.insuranceName,
                  })}
                  ${badges === nothing ? nothing : this.html`<span part="provider-badges">${badges}</span>`}
                </button>
              </scoped-card>
            </li>
          `;
        })}
      </ul>

      ${this.renderPager()}
    `;
  }

  /**
   * Previous and Next, plus where the patient is.
   *
   * Nothing renders without a total: a Next button that cannot know whether there is a next
   * page either strands the patient on an empty result or disables itself only after they
   * press it. Real buttons, so Enter and Space work and `disabled` is announced.
   */
  protected renderPager(): unknown {
    const lastPage = this.lastPage;
    if (lastPage === undefined || lastPage === 0) return nothing;

    const position = `Page ${countLabel.format(this.page + 1)} of ${countLabel.format(lastPage + 1)}`;

    return this.html`
      <div part="pager">
        <scoped-button
          part="pager-previous"
          variant="secondary"
          size="small"
          ?disabled=${this.page <= 0}
          @click=${() => this.goToPage(this.page - 1)}
        >
          Previous
        </scoped-button>

        <p part="pager-position">${position}</p>

        <scoped-button
          part="pager-next"
          variant="secondary"
          size="small"
          ?disabled=${this.page >= lastPage}
          @click=${() => this.goToPage(this.page + 1)}
        >
          Next
        </scoped-button>
      </div>
    `;
  }

  /**
   * Asks for a page. Public so a host page's own pager can drive this one's state.
   *
   * Clamped and deduplicated here rather than trusted: `page` is a settable property, and an
   * out-of-range page is a request the API answers with an empty list — which this component
   * would then render as "no providers match", for a search that matched hundreds.
   */
  public goToPage(page: number): void {
    const lastPage = this.lastPage;
    const target = Math.max(0, lastPage === undefined ? page : Math.min(page, lastPage));

    if (target === this.page) return;

    this.page = target;
    this.emit('page-change', { detail: { page: target } });
  }

  /**
   * A native `<button>` handles Enter and Space itself, so there is deliberately
   * no keydown handler here — adding one would double-fire.
   */
  protected select(location: ProviderLocation): void {
    this.selectedId = location.provider_location_id;
    this.emit('provider-select', { detail: { provider: location } });
  }
}
