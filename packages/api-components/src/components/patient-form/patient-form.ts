import {
  CharmElement,
  ZdButton,
  ZdInput,
  ZdSelect,
  ZdTextArea,
} from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { Patient, SexAtBirth } from '../../client/types.js';
import styles from './patient-form.styles.js';

/**
 * The fields `POST /v1/appointments` requires, in the order they are rendered. The order
 * matters twice over: it is the tab order, and it is the order `submit()` walks to decide
 * which field to move focus to, so the first error a patient is sent to is the first one
 * on the page.
 */
const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'date_of_birth',
  'sex_at_birth',
  'phone_number',
  'email_address',
  'address1',
  'city',
  'state',
  'zip_code',
] as const;

export type PatientFormField = (typeof REQUIRED_FIELDS)[number];

/** The errors a field can carry, keyed by API field name. */
export type PatientFormErrors = Partial<Record<PatientFormField, string>>;

interface FieldConfig {
  /**
   * The visible label. Every field has one — a placeholder is not a label, because it
   * disappears the moment the patient types (A11Y-004).
   */
  readonly label: string;
  /**
   * The autofill token. Worth setting on every field that has one: a patient filling in ten
   * fields by hand makes more mistakes than one accepting the browser's own stored values,
   * and autofill is local to the browser, so it sends nothing anywhere (PHI-003).
   *
   * Absent on `sex_at_birth`, which is a select rather than a text field — the spec's `sex`
   * token fills free text, and there is nothing useful for it to match against two options.
   */
  readonly autocomplete?: string;
  /**
   * The input type, where a more specific one than `text` buys something — the right
   * mobile keyboard, or in the case of `date`, a value already in the API's `YYYY-MM-DD`
   * shape and a picker the browser localises for us (I18N-002).
   */
  readonly type?: 'text' | 'date' | 'email' | 'tel';
  readonly inputmode?: 'numeric' | 'email' | 'tel';
  /**
   * A hard cap on length, used where the API's format leaves no room for more characters.
   * This is the half of format enforcement that prevents a mistake rather than reporting
   * one, which is the half a patient would rather have.
   */
  readonly maxlength?: number;
  /**
   * A format requirement stated up front. WCAG 3.3.2 wants the instruction before the
   * error, not only after it, and Charm renders help text into the field's
   * `aria-describedby` so it is announced with the label.
   */
  readonly helpText?: string;
  /** Spans both grid columns. */
  readonly wide?: boolean;
}

const FIELDS: Record<PatientFormField, FieldConfig> = {
  first_name: { label: 'First name', autocomplete: 'given-name' },
  last_name: { label: 'Last name', autocomplete: 'family-name' },
  date_of_birth: { label: 'Date of birth', autocomplete: 'bday', type: 'date' },
  sex_at_birth: { label: 'Sex at birth' },
  phone_number: {
    label: 'Phone number',
    autocomplete: 'tel-national',
    type: 'tel',
    inputmode: 'numeric',
    maxlength: 10,
    helpText: '10 digits, no spaces or dashes.',
  },
  email_address: {
    label: 'Email address',
    autocomplete: 'email',
    type: 'email',
    inputmode: 'email',
  },
  address1: { label: 'Street address', autocomplete: 'address-line1', wide: true },
  city: { label: 'City', autocomplete: 'address-level2' },
  state: {
    label: 'State',
    autocomplete: 'address-level1',
    maxlength: 2,
    helpText: 'Two-letter code.',
  },
  zip_code: { label: 'ZIP code', autocomplete: 'postal-code', inputmode: 'numeric' },
};

/** The three groups A11Y-004 asks for, each rendered as a `fieldset` with a `legend`. */
const GROUPS: { part: string; legend: string; fields: readonly PatientFormField[] }[] = [
  {
    part: 'about',
    legend: 'About the patient',
    fields: ['first_name', 'last_name', 'date_of_birth', 'sex_at_birth'],
  },
  { part: 'contact', legend: 'Contact information', fields: ['phone_number', 'email_address'] },
  { part: 'address', legend: 'Address', fields: ['address1', 'city', 'state', 'zip_code'] },
];

/** The API accepts 100 characters of notes; the field stops accepting them at the same point. */
const NOTES_MAX_LENGTH = 100;

/** `first_name` becomes `first-name`, so the CSS part names read like the rest of the library. */
function partName(field: PatientFormField): string {
  return field.replace(/_/g, '-');
}

/**
 * Collects the patient demographics `POST /v1/appointments` requires, validates them, and
 * emits them. It never performs a network request — `zd-booking-flow` is what submits, and
 * keeping the two apart means the form can be reused by a host page that books its own way
 * (COMP-002).
 *
 * Everything this component holds is PHI. Two rules follow from that and are load-bearing
 * in the code below rather than aspirational:
 *
 * - **No field value ever leaves as text.** Not in a `console` call, not in a thrown error,
 *   not in a validation message. Messages name the field and state the format; that is
 *   PHI-001 in practice, and it is why `validate()` builds its strings from
 *   `FIELDS[field].label` and never from `this.values[field]`.
 * - **No field value ever reaches an attribute.** `values` and `notes` are both
 *   `attribute: false`, so nothing here is reflected into markup where `outerHTML`, a DOM
 *   snapshot, or a session replay tool would pick it up.
 *
 * @tag zd-patient-form
 * @event patient-submit - Emitted with `{ patient, notes }` once every field is valid.
 *   Not emitted at all when validation fails, so a listener never sees a partial patient.
 * @csspart form - The form element.
 * @csspart about - The name, date of birth, and sex at birth group.
 * @csspart contact - The phone and email group.
 * @csspart address - The address group.
 * @csspart first-name - The first name field.
 * @csspart last-name - The last name field.
 * @csspart date-of-birth - The date of birth field.
 * @csspart sex-at-birth - The sex at birth select.
 * @csspart phone-number - The phone number field.
 * @csspart email-address - The email address field.
 * @csspart address1 - The street address field.
 * @csspart city - The city field.
 * @csspart state - The state field.
 * @csspart zip-code - The ZIP code field.
 * @csspart notes - The optional notes field.
 * @csspart submit - The submit button.
 */
export class ZdPatientForm extends CharmElement {
  public static override baseName = 'patient-form';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdInput, ZdSelect, ZdTextArea, ZdButton];
  }

  /**
   * The collected values, keyed by API field name. Public so a host page can prefill from
   * an account it already has, and so tests can set ten fields without ten interactions.
   *
   * `attribute: false` is the PHI guard, not a convenience: an observed attribute would let
   * a patient's name be written into the DOM as markup, and a reflected one would put it
   * there on every keystroke.
   */
  @property({ attribute: false })
  public values: Record<string, string> = {};

  /**
   * Free-text notes for the practice, capped at {@link NOTES_MAX_LENGTH}. Optional, and
   * omitted from the event entirely when empty rather than sent as `''`.
   *
   * Patient-authored, so it is PHI as much as the demographics are, and `attribute: false`
   * for the same reason.
   */
  @property({ attribute: false })
  public notes = '';

  /**
   * Set while whoever is listening to `patient-submit` is still working on it.
   *
   * A booking is not idempotent: a second `POST /v1/appointments` books a second
   * appointment. The listener has to guard that itself, but a Continue button that stays
   * live and silent through a slow request is an invitation to press it again, so the form
   * that owns the button owns disabling it. `submit()` refuses too, which covers the Enter
   * key — Charm's inputs call `requestSubmit()` without consulting the button.
   */
  @property({ type: Boolean })
  public busy = false;

  /**
   * The current validation failures. Cleared and rebuilt on each `submit()`, so a field the
   * patient has since fixed stops showing an error the next time they try.
   */
  @state()
  private fieldErrors: PatientFormErrors = {};

  /**
   * Validates every field and emits `patient-submit` when all of them pass. Public so the
   * host page or a coordinating parent can trigger it, which is also how the flow in
   * Task 15 drives the form from its own Continue button.
   */
  public submit(): void {
    if (this.busy) return;

    this.fieldErrors = this.validate();

    const firstInvalid = REQUIRED_FIELDS.find((field) => this.fieldErrors[field]);
    if (firstInvalid) {
      void this.focusField(firstInvalid);
      return;
    }

    this.emit('patient-submit', {
      detail: { patient: this.toPatient(), notes: this.notes.trim() || undefined },
    });
  }

  /**
   * Checks every field in one pass and returns a message per failure.
   *
   * One pass rather than field-by-field-as-you-type: a patient part-way through a phone
   * number has not made a mistake yet, and marking them wrong for it is the form being
   * impatient. The trade-off is that a failed submit produces up to ten errors at once,
   * which `submit()` handles by moving focus to the first of them.
   *
   * The two format rules are the ones the API documents a shape for and that a patient can
   * plausibly get wrong. Everything else is left to the API deliberately: a client-side
   * rule that is stricter than the server's rejects addresses the server would have taken,
   * and a patient cannot argue with a form.
   *
   * Not enforced, though documented: a phone number's 1st and 4th digits cannot be 0 or 1.
   * That one is checked at booking, where the API is the authority — see `types.ts`.
   */
  protected validate(): PatientFormErrors {
    const errors: PatientFormErrors = {};
    const valueOf = (field: PatientFormField) => (this.values[field] ?? '').trim();

    for (const field of REQUIRED_FIELDS) {
      if (!valueOf(field)) {
        errors[field] = `${FIELDS[field].label} is required.`;
      }
    }

    const phone = valueOf('phone_number');
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone_number = 'Phone number must be 10 digits with no spaces or dashes.';
    }

    const dateOfBirth = valueOf('date_of_birth');
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      errors.date_of_birth = 'Date of birth must use the YYYY-MM-DD format.';
    }

    return errors;
  }

  /**
   * Builds the API's shape from the flat field map. The address is nested, and the
   * optional parts of `Patient` — `insurance`, `gender`, the two ids — are left off rather
   * than sent empty, because this form does not collect them.
   *
   * Values are trimmed, and the state code upper-cased, on the way out. A trailing space
   * in a ZIP or a lower-case state code is a rejected booking rather than a typo the API
   * forgives, and normalising here rather than on input means the patient's own text is
   * still in the field they are looking at.
   */
  protected toPatient(): Patient {
    const valueOf = (field: PatientFormField) => (this.values[field] ?? '').trim();

    return {
      first_name: valueOf('first_name'),
      last_name: valueOf('last_name'),
      date_of_birth: valueOf('date_of_birth'),
      sex_at_birth: valueOf('sex_at_birth') as SexAtBirth,
      phone_number: valueOf('phone_number'),
      email_address: valueOf('email_address'),
      patient_address: {
        address1: valueOf('address1'),
        city: valueOf('city'),
        state: valueOf('state').toUpperCase(),
        zip_code: valueOf('zip_code'),
      },
    };
  }

  /**
   * Moves focus to a field, after the render that put its error message in place.
   *
   * This is the announcement, and the reason there is no error summary region above the
   * form. Charm's form controls each render their error into a container that is already
   * `role="alert"` and `aria-live="assertive"`, so ten failures already produce ten
   * interruptions competing to be heard; adding an eleventh live region would make that
   * worse rather than better. Focus is unambiguous — the patient lands on the field that
   * needs them, and its label, invalid state, and message are announced together.
   *
   * Charm's controls set `delegatesFocus`, so focusing the host focuses the real control
   * inside it.
   */
  protected async focusField(field: PatientFormField): Promise<void> {
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLElement>(`[part='${partName(field)}']`)?.focus();
  }

  protected setField(field: PatientFormField, value: string): void {
    this.values = { ...this.values, [field]: value };
  }

  /**
   * Charm's input calls `form.requestSubmit()` on Enter and Charm's button is
   * form-associated, so both the keyboard and the click path arrive here without help.
   */
  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  /**
   * `error-message` is bound on every render, including the first, where it binds `''`.
   * That is what clears a message once the patient fixes the field — Charm's
   * `setCustomValidity('')` is the only way back out of the invalid state. The side effect
   * on first render is that Charm marks the control as having been interacted with, which
   * opens its error styling gate early; nothing shows through it, because Charm leaves
   * `invalid` false until a message is actually set.
   *
   * `required` reaches the real control inside Charm's shadow root, so the required state
   * is conveyed natively and drawn as the label's asterisk. The form is `novalidate` so
   * that native constraint validation does not intercept the submit with its own bubble
   * before `submit()` runs — one validation pass, in one place, with messages this library
   * wrote (A11Y-004).
   */
  protected renderField(field: PatientFormField): unknown {
    const config = FIELDS[field];

    return this.html`
      <scoped-input
        class=${config.wide ? 'wide' : ''}
        part=${partName(field)}
        label=${config.label}
        type=${config.type ?? 'text'}
        autocomplete=${ifDefined(config.autocomplete)}
        inputmode=${ifDefined(config.inputmode)}
        maxlength=${ifDefined(config.maxlength)}
        help-text=${ifDefined(config.helpText)}
        required
        .value=${this.values[field] ?? ''}
        .errorMessage=${this.fieldErrors[field] ?? ''}
        @input=${(event: Event) => this.setField(field, (event.target as ZdInput).value)}
      ></scoped-input>
    `;
  }

  /**
   * `sex_at_birth` is the API's own field name and its own two values; it is not the
   * patient's gender, which `Patient.gender` covers separately and which this form does not
   * collect. The empty option is what makes "nothing chosen yet" distinct from a choice.
   */
  protected renderSexAtBirth(): unknown {
    return this.html`
      <scoped-select
        part="sex-at-birth"
        label=${FIELDS.sex_at_birth.label}
        required
        .value=${this.values.sex_at_birth ?? ''}
        .errorMessage=${this.fieldErrors.sex_at_birth ?? ''}
        @change=${(event: Event) => this.setField('sex_at_birth', (event.target as ZdSelect).value)}
      >
        <option value="" .selected=${!this.values.sex_at_birth}>Select…</option>
        <option value="female" .selected=${this.values.sex_at_birth === 'female'}>Female</option>
        <option value="male" .selected=${this.values.sex_at_birth === 'male'}>Male</option>
      </scoped-select>
    `;
  }

  protected override render(): unknown {
    return this.html`
      <form part="form" novalidate @submit=${(event: Event) => this.handleSubmit(event)}>
        ${GROUPS.map(
          (group) => this.html`
            <fieldset part=${group.part}>
              <legend>${group.legend}</legend>
              <div class="fields">
                ${group.fields.map((field) =>
                  field === 'sex_at_birth' ? this.renderSexAtBirth() : this.renderField(field)
                )}
              </div>
            </fieldset>
          `
        )}

        <scoped-text-area
          class="wide"
          part="notes"
          label="Notes for the practice (optional)"
          help-text="Up to ${NOTES_MAX_LENGTH} characters."
          maxlength=${NOTES_MAX_LENGTH}
          rows="3"
          .value=${this.notes}
          @input=${(event: Event) => {
            this.notes = (event.target as ZdTextArea).value;
          }}
        ></scoped-text-area>

        <scoped-button part="submit" type="submit" variant="primary" ?disabled=${this.busy}>
          Continue
        </scoped-button>
      </form>
    `;
  }
}
