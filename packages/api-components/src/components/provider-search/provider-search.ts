import { CharmElement, ZdButton } from '@powered-by-zocdoc/primitives';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  searchProviderLocations,
  type ProviderSearchResult,
} from '../../client/provider-locations.js';
import { getInsurancePlans, getSpecialties } from '../../client/reference-data.js';
import type {
  InsurancePlan,
  ProviderLocation,
  Specialty,
  VisitType,
} from '../../client/types.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import { userFacingError } from '../../utilities/error-message.js';
import { NO_PROVIDERS_MATCH } from '../../utilities/messages.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import styles from './provider-search.styles.js';

/** The API takes a 5-digit ZIP and 400s on anything else, including a 4-digit one. */
const ZIP_PATTERN = /^\d{5}$/;

/**
 * One page of results, plus the criteria they were fetched with.
 *
 * The criteria are echoed back so a coordinator learns what the patient settled on without reading
 * properties off this element or pushing its own stale values back down (COMP-002).
 *
 * `searchParameters` is the API's own echo, and it is the field that matters most: this component
 * does not collect a visit reason, so it carries the `visit_reason_id` the API filled in from the
 * specialty's "any reason" default. Both availability and booking require a visit reason, so for
 * those searches this is the only place one can be had.
 */
export interface ProviderResultsDetail {
  providers: ProviderLocation[];
  /** From the paged envelope. `providers` holds one page; this counts them all. */
  totalCount: number;
  /** The size the response was built with, not the one asked for. Pair with `totalCount`. */
  pageSize: number;
  page: number;
  searchParameters: ProviderSearchResult['searchParameters'];
  zipCode: string;
  specialtyId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
}

export interface ZdProviderSearchEventMap {
  'provider-results': CustomEvent<ProviderResultsDetail>;
  'provider-search-error': CustomEvent<ErrorDetail>;
}

/** The fields this form validates, in render order — which is the order errors are visited. */
const VALIDATED_FIELDS = ['specialty', 'zip'] as const;

type ValidatedField = (typeof VALIDATED_FIELDS)[number];

/**
 * Collects search criteria and queries `GET /v1/provider_locations`.
 *
 * Emits results rather than rendering them, so it composes with `zd-provider-results` or
 * with a host page that wants to lay results out itself (COMP-002).
 *
 * A ZIP alone is not a search. The endpoint requires a 5-digit `zip_code` **and** a
 * `specialty_id`, and answers a request missing either with a 400 whose body is
 * developer-facing — so both are checked here and reported on the field that caused them,
 * rather than surfacing as a failed search (CLIENT-003, A11Y-004). This component does not
 * collect a visit reason; the API defaults to "any" for the chosen specialty.
 *
 * @tag zd-provider-search
 * @event provider-results - Emitted with `{ providers, totalCount, searchParameters, zipCode,
 *   specialtyId, insurancePlanId, visitType, page, pageSize }` on a successful search,
 *   including a search that matched nothing, so a listener can clear a stale list. The
 *   criteria are the ones actually used, which is how a parent learns what the patient
 *   changed in these fields. `totalCount` and `pageSize` are what a pager needs, and only the
 *   envelope has them — `providers` holds one page.
 * @event provider-search-error - Emitted with `{ error }` when the request fails.
 * @csspart form - The search form.
 * @csspart specialty - The specialty select.
 * @csspart zip - The ZIP code field.
 * @csspart insurance - The insurance plan select.
 * @csspart submit - The submit button.
 */
export class ZdProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';

  declare public addEventListener: TypedEventTarget<ZdProviderSearchEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdProviderSearchEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdProviderSearchEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ...requestStateDependencies];
  }

  /** The ZIP code to search. Required by the API — there is no search-everywhere mode. */
  @property({ attribute: 'zip-code' })
  public zipCode = '';

  /**
   * The specialty to search within, and the field that makes a search possible at all.
   *
   * `GET /v1/provider_locations` requires a `specialty_id` and rejects a request without one
   * with a 400 — see {@link validate}.
   */
  @property({ attribute: 'specialty-id' })
  public specialtyId?: string;

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
   * Re-runs the search when `page` moves, which is how a pager elsewhere on the page turns
   * into a request: `zd-provider-results` emits `page-change`, a host binds the new page back
   * down here, and this refetches. Property in, results out — nothing has to call a method on
   * this element (COMP-002). Comparing against `searchedPage` rather than the changed-properties
   * map is what keeps `handleSubmit`'s own reset to page 0 from searching twice.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
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
   * Returns the first field that fails, having recorded a message for every field that does.
   *
   * Both checks exist because the API answers both with a 400 whose body is developer-facing
   * (CLIENT-003): a missing specialty, and a ZIP that is not five digits. Catching them here
   * turns a failed request into a message on the field that caused it.
   */
  protected validate(): ValidatedField | undefined {
    const errors: Partial<Record<ValidatedField, string>> = {};

    if (!this.specialtyId) {
      errors.specialty = 'Choose a specialty to search.';
    }

    if (!ZIP_PATTERN.test(this.zipCode)) {
      errors.zip = 'Enter a 5-digit ZIP code.';
    }

    this.fieldErrors = errors;

    return VALIDATED_FIELDS.find((field) => errors[field]);
  }

  /**
   * Moves focus to a field, after the render that put its message in place — the patient
   * lands on the field that needs them and hears its label and error message together.
   */
  protected async focusField(field: ValidatedField): Promise<void> {
    await this.updateComplete;
    const selector = field === 'specialty' ? '#specialty-select' : '#location-input';
    this.shadowRoot?.querySelector<HTMLElement>(selector)?.focus();
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
       * in from the specialty's "any reason" default — which is the only way a parent learns
       * the reason availability and booking will need.
       */
      this.emit('provider-results', {
        detail: {
          providers: providerLocations,
          totalCount,
          searchParameters,
          zipCode: this.zipCode,
          specialtyId: this.specialtyId,
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
      // The raw error rides the event on purpose: the host page's handling of it is
      // developer-facing, while what reaches the DOM goes through userFacingError (PHI-001).
      this.errorMessage = userFacingError(error);
      this.emit('provider-search-error', { detail: { error } });
    }
  }

  /**
   * The native inputs don't submit on Enter through Charm's `ElementInternals` machinery, but
   * a `<button type="submit">` inside a `<form>` and pressing Enter in a text field both fire
   * the form's native `submit` event on their own, so both the keyboard and the click path
   * arrive here without a separate keydown handler.
   *
   * A submit is a new search, so it starts at the first page — leaving `page` where a pager
   * left it would answer a changed question with page four of the old one.
   */
  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.page = 0;
    void this.search();
  }

  /** Renders one `<option>` per item, marking the selected one so a native select stays in sync. */
  protected optionsFor(
    items: (Specialty | InsurancePlan)[],
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
  protected optionLabel(item: Specialty | InsurancePlan): string {
    const carrier = 'carrier' in item ? item.carrier : undefined;
    return carrier ? `${carrier.name} – ${item.name}` : item.name;
  }

  protected override render(): unknown {
    const loading = this.requestState === 'loading';
    const errorMessage = this.fieldErrors.specialty || this.fieldErrors.zip;

    return this.html`
      <form class="search-bar" part="form" novalidate @submit=${(event: Event) => this.handleSubmit(event)}>
        <div class="field field--select" part="specialty-field">
          <label for="specialty-select">Search</label>
          <select
            id="specialty-select"
            part="specialty"
            .value=${this.specialtyId ?? ''}
            aria-describedby=${this.fieldErrors.specialty ? 'field-error' : nothing}
            @change=${(event: Event) => {
              this.specialtyId = (event.target as HTMLSelectElement).value || undefined;
            }}
          >
            <option value="" .selected=${!this.specialtyId}>Condition, procedure or doctor name</option>
            ${this.optionsFor(this.specialties, this.specialtyId)}
          </select>
        </div>

        <div class="field field--location" part="location-field">
          <label for="location-input">ZIP code</label>
          <input
            id="location-input"
            part="zip"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            maxlength="5"
            .value=${this.zipCode}
            aria-describedby=${this.fieldErrors.zip ? 'field-error' : nothing}
            @input=${(event: Event) => {
              this.zipCode = (event.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div class="field field--select" part="insurance-field">
          <label for="insurance-select">Insurance</label>
          <select
            id="insurance-select"
            part="insurance"
            .value=${this.insurancePlanId ?? ''}
            @change=${(event: Event) => {
              this.insurancePlanId = (event.target as HTMLSelectElement).value || undefined;
            }}
          >
            <option value="" .selected=${!this.insurancePlanId}>Any insurance</option>
            ${this.optionsFor(this.insurancePlans, this.insurancePlanId)}
          </select>
        </div>

        <scoped-button part="submit" type="submit" variant="primary" ?disabled=${loading}>
          Find care
        </scoped-button>

        ${errorMessage ? this.html`
          <div id="field-error" class="error-container" role="alert" part="field-error">
            ${errorMessage}
          </div>
        ` : nothing}
      </form>

      ${renderRequestState(this.requestState, {
        emptyMessage: NO_PROVIDERS_MATCH,
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
