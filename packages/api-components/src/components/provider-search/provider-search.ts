import { CharmElement, ZdButton, ZdInput, ZdSelect } from '@powered-by-zocdoc/primitives';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { searchProviderLocations } from '../../client/provider-locations.js';
import { getInsurancePlans, getSpecialties, getVisitReasons } from '../../client/reference-data.js';
import type { InsurancePlan, Specialty, VisitReason, VisitType } from '../../client/types.js';
import { userFacingError } from '../internal/error-message.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../internal/request-state.js';
import styles from './provider-search.styles.js';

/** The API takes a 5-digit ZIP and 400s on anything else, including a 4-digit one. */
const ZIP_PATTERN = /^\d{5}$/;

/** The fields this form validates, in render order — which is the order errors are visited. */
const VALIDATED_FIELDS = ['specialty', 'zip'] as const;

type ValidatedField = (typeof VALIDATED_FIELDS)[number];

/**
 * Collects search criteria and queries `GET /v1/provider_locations`.
 *
 * Emits results rather than rendering them, so it composes with `zd-provider-results` or
 * with a host page that wants to lay results out itself (COMP-002).
 *
 * A ZIP alone is not a search. The endpoint requires a 5-digit `zip_code` **and** one of
 * `specialty_id` or `visit_reason_id`, and answers a request missing either with a 400 whose
 * body is developer-facing — so both are checked here and reported on the field that caused
 * them, rather than surfacing as a failed search (CLIENT-003, A11Y-004). The visit reason
 * narrows a specialty rather than standing in for one, so it is offered only once a specialty
 * is chosen.
 *
 * @tag zd-provider-search
 * @event provider-results - Emitted with `{ providers, totalCount, searchParameters, zipCode,
 *   specialtyId, visitReasonId, insurancePlanId, visitType, page, pageSize }` on a successful
 *   search, including a search that matched nothing, so a listener can clear a stale list. The
 *   criteria are the ones actually used, which is how a parent learns what the patient
 *   changed in these fields. `totalCount` and `pageSize` are what a pager needs, and only the
 *   envelope has them — `providers` holds one page.
 * @event provider-search-error - Emitted with `{ error }` when the request fails.
 * @csspart form - The search form.
 * @csspart specialty - The specialty select.
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
  @property({ attribute: 'zip-code' })
  public zipCode = '';

  /**
   * The specialty to search within, and the field that makes a search possible at all.
   *
   * `GET /v1/provider_locations` requires **one of** `specialty_id` or `visit_reason_id` and
   * rejects a request carrying neither with a 400. A visit reason alone is legitimate, so
   * this is not unconditionally required — see {@link validate}.
   */
  @property({ attribute: 'specialty-id' })
  public specialtyId?: string;

  @property({ attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ attribute: 'insurance-plan-id' })
  public insurancePlanId?: string;

  /**
   * Which visit formats to include. Left unset the **API defaults to `in_person`**, so video
   * visits are absent from results until this is set to `all` or `video_visit`. The default
   * is the API's rather than ours so that the component reports what the endpoint does.
   */
  @property({ attribute: 'visit-type' })
  public visitType?: VisitType;

  /** Search radius in miles. The API defaults to 50 when unset. */
  @property({ type: Number, attribute: 'max-distance-to-patient-mi' })
  public maxDistanceToPatientMi?: number;

  /** Zero-indexed, as the API counts pages. Reset to 0 whenever the form is submitted. */
  @property({ type: Number })
  public page = 0;

  /** Results per page. The API defaults to 10 when unset. */
  @property({ type: Number, attribute: 'page-size' })
  public pageSize?: number;

  @state()
  private specialties: Specialty[] = [];

  @state()
  private visitReasons: VisitReason[] = [];

  @state()
  private insurancePlans: InsurancePlan[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private errorMessage?: string;

  /** Per-field validation messages, cleared field by field as they are corrected. */
  @state()
  private fieldErrors: Partial<Record<ValidatedField, string>> = {};

  /**
   * The page the results in hand are for, which is what tells a page change from a redraw.
   *
   * Undefined until the first search, so setting `page` on a form nobody has submitted stays
   * inert — a host page configuring the starting page is not asking for a search.
   */
  private searchedPage?: number;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.loadReferenceData();
  }

  /**
   * Reloads the visit reasons whenever the specialty changes, so the select offers the
   * reasons that belong to it. Each specialty's list is cached separately, so going back to
   * a previous specialty costs nothing.
   *
   * Also re-runs the search when `page` moves, which is how a pager elsewhere on the page turns
   * into a request: `zd-provider-results` emits `page-change`, a host binds the new page back
   * down here, and this refetches. Property in, results out — nothing has to call a method on
   * this element (COMP-002). Comparing against `searchedPage` rather than the changed-properties
   * map is what keeps `handleSubmit`'s own reset to page 0 from searching twice.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('specialtyId')) {
      void this.loadVisitReasons();
    }

    if (this.searchedPage !== undefined && this.searchedPage !== this.page) {
      void this.search();
    }
  }

  /**
   * Populates the selects. A failure here degrades the form rather than blocking search, so
   * it is swallowed instead of becoming the component's error state — a patient who cannot
   * filter by insurance can still find a provider, and COMP-001's `error` leg is reserved
   * for the search itself failing.
   */
  protected async loadReferenceData(): Promise<void> {
    const [specialties, insurancePlans] = await Promise.all([
      getSpecialties().catch(() => []),
      getInsurancePlans().catch(() => []),
    ]);

    this.specialties = specialties;
    this.insurancePlans = insurancePlans;
  }

  /**
   * Fetches the visit reasons for the chosen specialty, and drops a selected reason that does
   * not belong to it.
   *
   * Nothing is fetched without a specialty. Unscoped, `/v1/visit_reasons` is every reason
   * across all 310 specialties — tens of sequential pages to fill a select the patient cannot
   * usefully read — and the previous version of this component paid that on every first
   * paint. Scoped, it is 1 reason for an Abdominal Radiologist and 71 for a Dentist.
   *
   * The clearing is deliberate. A reason carried over from another specialty would be sent
   * alongside the new `specialty_id`, and the API resolves that pair rather than rejecting
   * it, so the patient would get results for a reason they can no longer see selected. It is
   * guarded on a non-empty list because an empty one is also what a failed request looks
   * like, and a failure is no evidence that the reason is wrong.
   */
  protected async loadVisitReasons(): Promise<void> {
    const specialtyId = this.specialtyId;

    if (!specialtyId) {
      this.visitReasons = [];
      return;
    }

    const visitReasons = await getVisitReasons(specialtyId).catch(() => []);

    // A slower earlier request must not overwrite a later specialty's list.
    if (specialtyId !== this.specialtyId) return;

    this.visitReasons = visitReasons;

    const stale =
      this.visitReasonId && !visitReasons.some((reason) => reason.id === this.visitReasonId);

    if (stale && visitReasons.length > 0) {
      this.visitReasonId = undefined;
    }
  }

  /**
   * Returns the first field that fails, having recorded a message for every field that does.
   *
   * Both checks exist because the API answers both with a 400 whose body is developer-facing
   * (CLIENT-003): a ZIP that is not five digits, and a request carrying neither a specialty
   * nor a visit reason. Catching them here turns a failed request into a message on the
   * field that caused it.
   */
  protected validate(): ValidatedField | undefined {
    const errors: Partial<Record<ValidatedField, string>> = {};

    if (!this.specialtyId && !this.visitReasonId) {
      errors.specialty = 'Choose a specialty to search.';
    }

    if (!ZIP_PATTERN.test(this.zipCode)) {
      errors.zip = 'Enter a 5-digit ZIP code.';
    }

    this.fieldErrors = errors;

    return VALIDATED_FIELDS.find((field) => errors[field]);
  }

  /**
   * Moves focus to a field, after the render that put its message in place.
   *
   * Charm's form controls render their message into a container that is already
   * `role="alert"`, so focus rather than a separate live region is the announcement — the
   * patient lands on the field that needs them and hears its label, invalid state, and
   * message together. Charm's controls set `delegatesFocus`, so focusing the host focuses
   * the control inside it. Matches `zd-patient-form`.
   */
  protected async focusField(field: ValidatedField): Promise<void> {
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLElement>(`[part='${field}']`)?.focus();
  }

  /**
   * Runs the search. Public so a host page or a coordinating parent can trigger it.
   *
   * Validation runs on this path rather than only on submit, so a programmatic call cannot
   * issue a request the API is certain to reject either.
   */
  public async search(): Promise<void> {
    /*
     * Recorded first, and on every path out of here including the refusals below. It means "the
     * page this component has already acted on", so a search that validation turns away is
     * still acted on — left unrecorded, `willUpdate` would see the mismatch again on the very
     * render the new field messages triggered and call this indefinitely.
     */
    this.searchedPage = this.page;

    const invalidField = this.validate();
    if (invalidField) {
      this.requestState = 'idle';
      void this.focusField(invalidField);
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const { providerLocations, totalCount, pageSize, searchParameters } =
        await searchProviderLocations({
          zipCode: this.zipCode,
          specialtyId: this.specialtyId,
          visitReasonId: this.visitReasonId,
          insurancePlanId: this.insurancePlanId,
          visitType: this.visitType,
          maxDistanceToPatientMi: this.maxDistanceToPatientMi,
          page: this.page,
          pageSize: this.pageSize,
        });

      this.requestState = providerLocations.length === 0 ? 'empty' : 'success';

      /*
       * The criteria ride along with the results because this component owns fields a
       * patient can change after a parent handed them down, and the event is the only moment
       * the parent can learn what they settled on. Without them, a coordinator has to either
       * read them off this element or push its own stale values back down on the next
       * render, wiping a typed ZIP (COMP-002).
       *
       * `searchParameters` is the API's own echo, and carries the `visit_reason_id` it filled
       * in from the specialty's default when the patient chose "Any reason" — which is the
       * only way a parent learns the reason availability and booking will need.
       */
      this.emit('provider-results', {
        detail: {
          providers: providerLocations,
          totalCount,
          searchParameters,
          zipCode: this.zipCode,
          specialtyId: this.specialtyId,
          visitReasonId: this.visitReasonId,
          insurancePlanId: this.insurancePlanId,
          visitType: this.visitType,
          page: this.page,
          // The size the response was built with, not `this.pageSize`, which is usually unset —
          // a pager needs the real one to know how many pages `totalCount` is.
          pageSize,
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
   *
   * A submit is a new search, so it starts at the first page — leaving `page` where a pager
   * left it would answer a changed question with page four of the old one.
   */
  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.page = 0;
    void this.search();
  }

  /**
   * Charm re-clones the light-DOM options into its shadow root on `slotchange`, reading
   * each option's `selected`, which covers reference data arriving after first paint. It
   * does not re-clone when only the selection changes, so the host's `value` is bound too.
   */
  protected filterOptions(
    items: (Specialty | VisitReason | InsurancePlan)[],
    selectedId: string | undefined
  ): unknown {
    return items.map(
      (item) =>
        this.html`<option value=${item.id} .selected=${item.id === selectedId}>
          ${this.optionLabel(item)}
        </option>`
    );
  }

  /**
   * The text of one option. Carried by the carrier for insurance plans, because plan names
   * are not unique across carriers — "Blue Card PPO" belongs to several — and a patient
   * picking from a list of bare plan names has no way to tell theirs from another company's.
   */
  protected optionLabel(item: Specialty | VisitReason | InsurancePlan): string {
    const carrier = 'carrier' in item ? item.carrier : undefined;
    return carrier ? `${carrier.name} – ${item.name}` : item.name;
  }

  /**
   * `error-message` is bound on every render, including the first, where it binds `''`. That
   * is what clears a message once the patient fixes the field — Charm's
   * `setCustomValidity('')` is the only way back out of the invalid state.
   */
  protected override render(): unknown {
    const loading = this.requestState === 'loading';

    return this.html`
      <form part="form" novalidate @submit=${(event: Event) => this.handleSubmit(event)}>
        <scoped-select
          part="specialty"
          label="Specialty"
          .value=${this.specialtyId ?? ''}
          .errorMessage=${this.fieldErrors.specialty ?? ''}
          @change=${(event: Event) => {
            this.specialtyId = (event.target as ZdSelect).value || undefined;
          }}
        >
          <option value="" .selected=${!this.specialtyId}>Choose a specialty</option>
          ${this.filterOptions(this.specialties, this.specialtyId)}
        </scoped-select>

        <scoped-input
          part="zip"
          label="ZIP code"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="5"
          .value=${this.zipCode}
          .errorMessage=${this.fieldErrors.zip ?? ''}
          @input=${(event: Event) => {
            this.zipCode = (event.target as ZdInput).value;
          }}
        ></scoped-input>

        <scoped-select
          part="visit-reason"
          label="Reason for visit"
          ?disabled=${!this.specialtyId}
          .value=${this.visitReasonId ?? ''}
          @change=${(event: Event) => {
            this.visitReasonId = (event.target as ZdSelect).value || undefined;
          }}
        >
          ${
            this.specialtyId
              ? this.html`
                  <option value="" .selected=${!this.visitReasonId}>Any reason</option>
                  ${this.filterOptions(this.visitReasons, this.visitReasonId)}
                `
              : this.html`<option value="">Choose a specialty first</option>`
          }
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
