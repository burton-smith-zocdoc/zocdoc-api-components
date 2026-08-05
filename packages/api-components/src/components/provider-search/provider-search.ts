import { CharmElement, ZdButton, ZdInput, ZdSelect } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { searchProviderLocations } from '../../client/provider-locations.js';
import { getInsurancePlans, getVisitReasons } from '../../client/reference-data.js';
import type { InsurancePlan, VisitReason } from '../../client/types.js';
import { userFacingError } from '../internal/error-message.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../internal/request-state.js';
import styles from './provider-search.styles.js';

/**
 * Collects search criteria and queries `GET /v1/provider_locations`.
 *
 * Emits results rather than rendering them, so it composes with `zd-provider-results` or
 * with a host page that wants to lay results out itself (COMP-002).
 *
 * @tag zd-provider-search
 * @event provider-results - Emitted with `{ providers, zipCode, visitReasonId,
 *   insurancePlanId }` on a successful search, including a search that matched nothing, so a
 *   listener can clear a stale list. The criteria are the ones actually used, which is how a
 *   parent learns what the patient changed in these fields.
 * @event provider-search-error - Emitted with `{ error }` when the request fails.
 * @csspart form - The search form.
 * @csspart zip - The ZIP code field.
 * @csspart visit-reason - The visit reason select.
 * @csspart insurance - The insurance plan select.
 * @csspart submit - The submit button.
 */
export class ZdProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdInput, ZdSelect, ZdButton, ...requestStateDependencies];
  }

  /** The ZIP code to search. Required by the API — there is no search-everywhere mode. */
  @property({ type: String, attribute: 'zip-code' })
  public zipCode = '';

  @property({ type: String, attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ type: String, attribute: 'insurance-plan-id' })
  public insurancePlanId?: string;

  @state()
  private visitReasons: VisitReason[] = [];

  @state()
  private insurancePlans: InsurancePlan[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private errorMessage?: string;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.loadReferenceData();
  }

  /**
   * Populates the two selects. A failure here degrades the form to ZIP-only rather than
   * blocking search, so it is swallowed instead of becoming the component's error state —
   * a patient who cannot filter by insurance can still find a provider, and COMP-001's
   * `error` leg is reserved for the search itself failing.
   */
  protected async loadReferenceData(): Promise<void> {
    const [visitReasons, insurancePlans] = await Promise.all([
      getVisitReasons().catch(() => []),
      getInsurancePlans().catch(() => []),
    ]);

    this.visitReasons = visitReasons;
    this.insurancePlans = insurancePlans;
  }

  /** Runs the search. Public so a host page or a coordinating parent can trigger it. */
  public async search(): Promise<void> {
    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const { providerLocations } = await searchProviderLocations({
        zipCode: this.zipCode,
        visitReasonId: this.visitReasonId,
        insurancePlanId: this.insurancePlanId,
      });

      this.requestState = providerLocations.length === 0 ? 'empty' : 'success';

      /*
       * The criteria ride along with the results because this component owns three fields a
       * patient can change after a parent handed them down, and the event is the only moment
       * the parent can learn what they settled on. Without them, a coordinator has to either
       * read them off this element or push its own stale values back down on the next
       * render, wiping a typed ZIP (COMP-002).
       */
      this.emit('provider-results', {
        detail: {
          providers: providerLocations,
          zipCode: this.zipCode,
          visitReasonId: this.visitReasonId,
          insurancePlanId: this.insurancePlanId,
        },
      });
    } catch (error: unknown) {
      this.requestState = 'error';
      // Never `error.message` — that string is developer-facing and its body can echo a
      // submitted value (CLIENT-003, PHI-001). The raw error still rides the event so a
      // host page can decide what to do with it.
      this.errorMessage = userFacingError(error);
      this.emit('provider-search-error', { detail: { error } });
    }
  }

  /**
   * Charm's input calls `form.requestSubmit()` on Enter and Charm's button is
   * form-associated through `ElementInternals`, so both the keyboard and the click path
   * arrive here on their own. Adding a keydown handler would submit twice.
   */
  protected handleSubmit(event: Event): void {
    event.preventDefault();
    void this.search();
  }

  /**
   * Charm re-clones the light-DOM options into its shadow root on `slotchange`, reading
   * each option's `selected`, which covers reference data arriving after first paint. It
   * does not re-clone when only the selection changes, so the host's `value` is bound too.
   */
  protected filterOptions(
    items: (VisitReason | InsurancePlan)[],
    selectedId: string | undefined
  ): unknown {
    return items.map(
      (item) =>
        this.html`<option value=${item.id} .selected=${item.id === selectedId}>
          ${item.name}
        </option>`
    );
  }

  protected override render(): unknown {
    const loading = this.requestState === 'loading';

    return this.html`
      <form part="form" @submit=${(event: Event) => this.handleSubmit(event)}>
        <scoped-input
          part="zip"
          label="ZIP code"
          inputmode="numeric"
          autocomplete="postal-code"
          .value=${this.zipCode}
          @input=${(event: Event) => {
            this.zipCode = (event.target as ZdInput).value;
          }}
        ></scoped-input>

        <scoped-select
          part="visit-reason"
          label="Reason for visit"
          .value=${this.visitReasonId ?? ''}
          @change=${(event: Event) => {
            this.visitReasonId = (event.target as ZdSelect).value || undefined;
          }}
        >
          <option value="" .selected=${!this.visitReasonId}>Any reason</option>
          ${this.filterOptions(this.visitReasons, this.visitReasonId)}
        </scoped-select>

        <scoped-select
          part="insurance"
          label="Insurance"
          .value=${this.insurancePlanId ?? ''}
          @change=${(event: Event) => {
            this.insurancePlanId = (event.target as ZdSelect).value || undefined;
          }}
        >
          <option value="" .selected=${!this.insurancePlanId}>Any insurance</option>
          ${this.filterOptions(this.insurancePlans, this.insurancePlanId)}
        </scoped-select>

        <scoped-button part="submit" type="submit" variant="primary" ?disabled=${loading}>
          Search
        </scoped-button>
      </form>

      ${renderRequestState(this.requestState, {
        emptyMessage: 'No providers match this search.',
        errorMessage: this.errorMessage,
        loadingMessage: 'Searching…',
        onRetry: () => void this.search(),
        // Results leave through the event, so there is nothing to render on success —
        // zd-provider-results owns display.
        children: () => nothing,
      })}
    `;
  }
}
