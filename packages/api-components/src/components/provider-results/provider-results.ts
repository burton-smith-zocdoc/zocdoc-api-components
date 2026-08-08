import { CharmElement, ZdButton, ZdCard, ZdDialog } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { DEFAULT_PAGE_SIZE } from '../../client/provider-locations.js';
import type {
  AvailabilitySlot,
  ProviderLocation,
  ProviderLocationAvailability,
} from '../../client/types.js';
import { ZdAvailabilityGrid } from '../availability-grid/availability-grid.js';
import { ZdAvailabilityWindow, type WindowShiftDetail } from '../availability-window/availability-window.js';
import { ZdProviderCard } from '../provider-card/provider-card.js';
import { ZdProviderProfile } from '../provider-profile/provider-profile.js';
import type { AvailabilityWindowDetail, TypedEmit, TypedEventTarget } from '../events.js';
import {
  nextWindowStart,
  resolveWindowStart,
  windowEndDate,
} from '../../utilities/availability-window.js';
import { formatCount } from '../../utilities/format.js';
import { NO_PROVIDERS_MATCH } from '../../utilities/messages.js';
import { todayDayKey } from '../../utilities/provider-time.js';
import summaryStyles from '../../utilities/provider-summary.styles.js';
import styles from './provider-results.styles.js';

/**
 * What a card whose location the batch did not answer for gets.
 *
 * One shared frozen array rather than a fresh `[]` per render: a new array every time would look
 * to Lit like a changed value and set the grid's `willUpdate` running on every redraw. It still
 * has to be an array and not `undefined`, which is what would put the grid into self-fetching
 * mode — ten cards each making their own request is the thing the batch exists to avoid.
 *
 * Frozen as well as `readonly`, since every empty card is handed this same array and a write to
 * it would reach all of them.
 */
const NO_TIMESLOTS: readonly AvailabilitySlot[] = Object.freeze([]);

/** The card the patient chose. */
export interface ProviderSelectDetail {
  provider: ProviderLocation;
}

/**
 * A day cell pressed on one of the cards.
 *
 * The provider travels with the day, which is what the grid's own `day-select` cannot say: a page
 * showing ten cards needs to know *whose* Tuesday was pressed.
 */
export interface ProviderDaySelectDetail {
  day: string;
  provider: ProviderLocation;
}

/** The page the patient asked for. Zero-indexed, as the API counts pages. */
export interface PageChangeDetail {
  page: number;
}

export interface ZdProviderResultsEventMap {
  'provider-select': CustomEvent<ProviderSelectDetail>;
  'day-select': CustomEvent<ProviderDaySelectDetail>;
  'page-change': CustomEvent<PageChangeDetail>;
  'window-change': CustomEvent<AvailabilityWindowDetail>;
}

/**
 * Renders a list of provider locations and emits the one the user picks.
 * Purely presentational — it performs no network requests, and it works on its
 * own with nothing above it (COMP-004).
 *
 * **Paging is reported, not performed.** `page-change` says which page the patient asked for
 * and the component updates `page` to match, but fetching it belongs to whatever owns the
 * request — this component never learns the search criteria, so it could not refetch if it
 * wanted to (COMP-002). `window-change` works the same way.
 *
 * Supply `availability` and each card grows a `zd-availability-grid` of day counts, with one
 * shared window control above the list driving all of them.
 *
 * @tag zd-provider-results
 * @event provider-select - Emitted with `{ provider }` when a provider is chosen.
 * @event page-change - Emitted with `{ page }` when the patient pages. Zero-indexed, matching
 *   the API. The owner of the search is expected to fetch that page and hand back new
 *   `providers`; nothing here changes until it does.
 * @event day-select - Emitted with `{ day, provider }` when a day is chosen on a card, forwarded
 *   from that card's grid with the provider attached.
 * @event window-change - Emitted with `{ startDate, endDate }` when the shared window moves. The
 *   owner of `availability` is expected to refetch that window; the dates on show move regardless.
 * @csspart header - The count line and the window control together, present only with availability.
 * @csspart summary - The line counting what the search found.
 * @csspart window - The shared availability window control.
 * @csspart window-range - The dates the window covers.
 * @csspart window-previous - The control stepping the window back.
 * @csspart window-next - The control stepping the window forward.
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
 * @csspart provider-availability - One card's availability grid.
 * @csspart availability-days - The day list inside a card's grid.
 * @csspart availability-day - One day cell inside a card's grid.
 * @csspart availability-empty - A card's no-availability message.
 * @csspart pager - The paging controls.
 * @csspart pager-previous - The button going back a page.
 * @csspart pager-next - The button going forward a page.
 * @csspart pager-position - The line saying which page this is.
 * @csspart empty - The message shown when there are no providers.
 */
export class ZdProviderResults extends CharmElement {
  public static override baseName = 'provider-results';

  declare public addEventListener: TypedEventTarget<ZdProviderResultsEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdProviderResultsEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdProviderResultsEventMap>;

  public static override styles = [
    ...super.styles,
    summaryStyles,
    styles,
  ] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdButton, ZdAvailabilityGrid, ZdAvailabilityWindow, ZdProviderCard, ZdDialog, ZdProviderProfile];
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

  /**
   * Day counts per card, from one batched availability request for the whole page.
   *
   * Batched by whoever owns the search, not by the cards: the endpoint takes an array of
   * `provider_location_ids` and answers for all of them at once, so ten cards fetching for
   * themselves would be ten requests for one screen. Left undefined by a host page with no
   * availability to show, in which case no card renders a grid at all — which is the standalone
   * case, and the list still works (COMP-004).
   *
   * Entries the batch did not answer for get {@link NO_TIMESLOTS} rather than nothing, so a card
   * says "no appointments" instead of quietly going and asking on its own.
   */
  @property({ attribute: false })
  public availability?: ProviderLocationAvailability[];

  /**
   * The first day of the availability window, as `YYYY-MM-DD`. Defaults to today.
   *
   * Set by this component's own window control and read by every card, which is what keeps them
   * showing the same dates. Whoever supplies `availability` is expected to bind this back down
   * after a `window-change` so the counts and the dates above them cannot disagree.
   */
  @property({ attribute: 'availability-start' })
  public availabilityStart?: string;

  /** How many days of availability each card shows. Clamped to the API's 30-day maximum. */
  @property({ type: Number, attribute: 'availability-days' })
  public availabilityDays = 14;

  @state()
  private profileOpen = false;

  @state()
  private profileProvider?: ProviderLocation;

  /**
   * The last page's zero-index, or `undefined` when there is nothing to derive it from.
   *
   * Written as `!(pageSize > 0)` rather than `pageSize <= 0` so that a `NaN` — which is what
   * `page-size="ten"` parses to — is caught as well. It would otherwise pass the guard and make
   * every page count `NaN`.
   */
  protected get lastPage(): number | undefined {
    if (this.totalCount === undefined || !(this.pageSize > 0)) return undefined;
    return Math.max(0, Math.ceil(this.totalCount / this.pageSize) - 1);
  }

  /**
   * Announced when the list is empty. A parent that owns a request-state machine
   * renders its own empty message instead of this component, so in practice only
   * the standalone case reaches here.
   */
  protected renderEmpty(): unknown {
    return this.html`<p part="empty" role="status">${NO_PROVIDERS_MATCH}</p>`;
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
    const count = formatCount(this.totalCount);
    const label = this.totalCount === 1 ? `${count} provider` : `${count} providers`;

    return this.html`<p class="summary" part="summary" role="status" aria-live="polite">${label}</p>`;
  }

  /**
   * The count line and, when there is availability to page through, the window control beside it.
   *
   * One control for the whole list rather than one per card, which is what the production search
   * page does and the only arrangement that makes sense: ten pagers stepping independently would
   * put every card on different dates, and a patient comparing them would be comparing nothing.
   * The cards get `hide-window` for the same reason.
   */
  protected handleWindowShift(event: CustomEvent<WindowShiftDetail>): void {
    this.shiftWindow(event.detail.direction);
  }

  protected renderHeader(): unknown {
    const summary = this.renderSummary();
    if (this.availability === undefined) return summary;

    const startDate = resolveWindowStart(this.availabilityStart);

    return this.html`
      <div class="header" part="header">
        ${summary}
        <scoped-availability-window
          start-date=${startDate}
          end-date=${windowEndDate(startDate, this.availabilityDays)}
          .canGoEarlier=${startDate > todayDayKey()}
          @window-shift=${this.handleWindowShift}
        ></scoped-availability-window>
      </div>
    `;
  }

  /**
   * Moves every card's window at once.
   *
   * Reported, not performed — the same shape as paging. This component never learns the visit
   * reason, so it could not refetch even if it wanted to (COMP-002); `availability-start` moves so
   * the dates on show are honest immediately, and whoever owns the request is expected to answer
   * with new `availability` for that window.
   */
  public shiftWindow(direction: -1 | 1): void {
    const current = resolveWindowStart(this.availabilityStart);
    const startDate = nextWindowStart(current, direction, this.availabilityDays);

    // Clamped at today, so there is nowhere to go and nothing to announce.
    if (startDate === current) return;

    this.availabilityStart = startDate;
    this.emit('window-change', {
      detail: { startDate, endDate: windowEndDate(startDate, this.availabilityDays) },
    });
  }

  /**
   * One card's slots, or {@link NO_TIMESLOTS} when the batch did not answer for it.
   *
   * The distinction matters: the grid treats an absent `timeslots` as permission to fetch for
   * itself, so returning nothing here would turn one batched request into one per card.
   */
  private timeslotsFor(location: ProviderLocation): readonly AvailabilitySlot[] {
    const entry = this.availability?.find(
      (item) => item.provider_location_id === location.provider_location_id
    );

    return entry?.timeslots ?? NO_TIMESLOTS;
  }

  /**
   * A card's day counts.
   *
   * Rendered as a **sibling** of `part="provider"`, never inside it: that part is a `<button>`,
   * and a grid of buttons nested in a button is the axe `nested-interactive` violation — and, more
   * to the point, unreachable by keyboard (A11Y-001).
   */
  protected renderAvailability(location: ProviderLocation): unknown {
    if (this.availability === undefined) return nothing;

    return this.html`
      <scoped-availability-grid
        slot="availability"
        class="provider-availability"
        part="provider-availability"
        exportparts="days: availability-days, day: availability-day, empty: availability-empty"
        hide-window
        provider-location-id=${location.provider_location_id}
        start-date=${resolveWindowStart(this.availabilityStart)}
        days=${this.availabilityDays}
        .timeslots=${this.timeslotsFor(location)}
        @day-select=${(event: CustomEvent<{ day: string }>) => {
          // Restated with the provider attached: a bare day key is not actionable by a parent
          // that has ten cards and no way to tell which one it came from.
          event.stopPropagation();
          this.emit('day-select', { detail: { day: event.detail.day, provider: location } });
        }}
      ></scoped-availability-grid>
    `;
  }

  protected openProfileDialog(provider: ProviderLocation): void {
    this.profileProvider = provider;
    this.profileOpen = true;
  }

  protected closeProfileDialog(): void {
    this.profileOpen = false;
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
      ${this.renderHeader()}

      <ul class="list" part="list">
        ${this.providers.map((location) => {
          const badges = this.renderBadges(location);
          return this.html`
            <li>
              <scoped-provider-card
                class="provider"
                part="provider"
                .provider=${location}
                ?show-photo=${this.showPhotos}
                insurance-name=${this.insuranceName ?? nothing}
                @profile-request=${(e: CustomEvent<{ provider: ProviderLocation }>) =>
                  this.openProfileDialog(e.detail.provider)}
              >
                ${badges === nothing ? nothing : this.html`<span slot="badges">${badges}</span>`}
                ${this.renderAvailability(location)}
              </scoped-provider-card>
            </li>
          `;
        })}
      </ul>

      ${this.renderPager()}

      <scoped-dialog
        ?open=${this.profileOpen}
        @close=${() => this.closeProfileDialog()}
      >
        ${this.profileProvider
          ? this.html`<scoped-provider-profile .provider=${this.profileProvider}></scoped-provider-profile>`
          : nothing}
      </scoped-dialog>
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

    const position = `Page ${formatCount(this.page + 1)} of ${formatCount(lastPage + 1)}`;

    return this.html`
      <div class="pager" part="pager">
        <scoped-button
          part="pager-previous"
          variant="secondary"
          size="small"
          ?disabled=${this.page <= 0}
          @click=${() => this.goToPage(this.page - 1)}
        >
          Previous
        </scoped-button>

        <p class="pager-position" part="pager-position">${position}</p>

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
