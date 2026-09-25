/**
 * The assistant panel: a chat transcript in a drawer, whose answer is a list of real providers.
 *
 * What this demonstrates is the handoff, not the chat. The transcript itself is a fixture in
 * `index.html` — there is no model here, nothing a patient types is read, and the only outbound
 * requests are the reference-data and provider-search calls every other part of this page already
 * makes (PHI-003). What is worth showing is what happens when a row is pressed: a page that ran its
 * own search hands the results to `zd-booking` and names one of them, and the flow opens its
 * booking dialog on that provider. Properties down, events up, no method calls into the component
 * and nothing reaching into a shadow root (COMP-002).
 *
 * The panel is deliberately not given a visit reason. The flow falls back to the chosen provider's
 * own `default_visit_reason_id`, which is what the API itself substitutes — so the assistant has to
 * know a ZIP and a specialty and nothing more.
 */
import {
  getSpecialties,
  searchProviderLocations,
  type ProviderLocation,
  type ZdBooking,
  type ZdProviderSummary,
} from '@zocdoc/api-components';
import { SCENARIOS } from '@zocdoc/api-components/mock';
import type { ZdDialog } from '@zocdoc/api-primitive-components';

/**
 * Where the assistant "looked". The documented sentinel that returns results (PHI-002), so this
 * panel answers against the real sandbox in live mode as well as against fixtures — which is the
 * only reason it is worth wiring to the API at all instead of hardcoding two cards.
 */
const ZIP_CODE = SCENARIOS.zipWithResults;

/** What the panel needs on the page. Resolved once, so nothing below re-queries the document. */
interface PanelElements {
  trigger: HTMLElement;
  panel: ZdDialog;
  list: HTMLElement;
  flow: ZdBooking;
}

/**
 * The dentist specialty, from the API's own list rather than a hardcoded `sp_…`.
 *
 * The ids are documented, so one could be typed out here — but the specialty endpoint is the thing
 * that says which id means dentist, and it is already cached by the client (CLIENT-004), so this
 * costs a demo nothing and cannot drift from what the API answers.
 */
async function dentistSpecialtyId(): Promise<string | undefined> {
  const specialties = await getSpecialties();
  return specialties.find((specialty) => specialty.care_category === 'dental')?.id;
}

/**
 * The assistant's answer: the providers, and the search that produced them.
 *
 * The criteria travel with the results because the flow is given both — a search form reading one
 * specialty above a list of another is the page contradicting itself.
 */
interface Answer {
  specialtyId?: string;
  providers: ProviderLocation[];
}

async function findDentists(): Promise<Answer> {
  const specialtyId = await dentistSpecialtyId();

  // The search endpoint requires a specialty or a visit reason, so with neither there is no
  // request to make and no results to invent.
  if (!specialtyId) return { providers: [] };

  const result = await searchProviderLocations({ zipCode: ZIP_CODE, specialtyId });
  return { specialtyId, providers: result.providerLocations };
}

/**
 * Hands the assistant's whole answer to the flow, then names one of them.
 *
 * All of it rather than only the row pressed, because `providers` is what the flow resolves the
 * named id against — and because the list under the dialog is then the list the assistant offered,
 * so dismissing the booking returns the patient to the dentists rather than to whatever they had
 * searched for before opening the panel. `totalCount` and `page` go with them for the same reason:
 * two providers under a heading counting three is the old search's answer over the assistant's.
 */
function handOff(flow: ZdBooking, answer: Answer, chosen: ProviderLocation): void {
  flow.providers = answer.providers;
  flow.totalCount = answer.providers.length;
  flow.page = 0;
  flow.zipCode = ZIP_CODE;
  flow.specialtyId = answer.specialtyId;
  flow.providerLocationId = chosen.provider_location_id;
}

/** Wires up the assistant panel. Does nothing on a page without one. */
export function renderAssistantPanel(): void {
  const trigger = document.querySelector<HTMLElement>('#assistant-open');
  const panel = document.querySelector<ZdDialog>('#assistant');
  const list = document.querySelector<HTMLElement>('#assistant-providers');
  const flow = document.querySelector<ZdBooking>('zd-booking');

  if (!trigger || !panel || !list || !flow) return;

  wirePanel({ trigger, panel, list, flow });
}

function wirePanel({ trigger, panel, list, flow }: PanelElements): void {
  /** The answer, kept so reopening the panel does not search again. */
  let answer: Promise<Answer> | undefined;

  /** A line of the assistant's own, for the states that are not a list of providers. */
  const note = (text: string): void => {
    const item = document.createElement('li');
    item.className = 'chat-note';
    item.textContent = text;

    list.replaceChildren(item);
  };

  /**
   * One row per provider: a button wrapping the same summary the booking dialog restates the
   * provider with, so the assistant's answer and the booking it leads to describe them identically.
   *
   * `zd-provider-summary` renders no interactive content of its own, which is what makes wrapping
   * it in a button legal rather than a nested-control bug. A whole row is the target rather than a
   * control inside it: the row *is* the choice of provider, and it reads as pressable from the
   * hover and focus styles the same way the cards in `zd-provider-results` do.
   *
   * A button's accessible name is everything inside it, and the summary labels its avatar with the
   * provider's name, so each row announces that name twice before the rest of the summary. Verbose,
   * but unambiguous, which is the trade a whole-row target makes.
   *
   * The panel is left open. Both dialogs are native modals, so the booking dialog opens into the top
   * layer above this one and takes the interaction while the transcript stays where it was — the
   * patient can see the answer they came from behind the booking they are completing.
   */
  const renderProviders = (answer: Answer): void => {
    if (answer.providers.length === 0) {
      note(`I could not find any dentists taking new patients near ${ZIP_CODE}.`);
      return;
    }

    const rows = answer.providers.map((provider) => {
      const summary = document.createElement('zd-provider-summary') as ZdProviderSummary;
      summary.provider = provider;
      summary.showPhoto = true;

      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'provider-choice';
      choice.append(summary);
      choice.addEventListener('click', () => handOff(flow, answer, provider));

      const item = document.createElement('li');
      item.append(choice);
      return item;
    });

    list.replaceChildren(...rows);
  };

  trigger.addEventListener('click', () => {
    panel.open = true;

    if (answer) return;

    note('Looking for dentists near you…');

    /*
     * The promise is cached rather than the providers, so a second open while the first request is
     * still in flight waits on that request instead of starting another (CLIENT-004).
     */
    answer = findDentists();
    answer.then(renderProviders).catch(() => {
      /*
       * A fixed sentence. The client's error is developer-facing and its body can quote the values
       * the request was built from, so neither it nor anything else reaches the page, and nothing is
       * logged either (CLIENT-003, PHI-001). The answer is dropped so pressing the button again is a
       * retry rather than a redraw of the failure.
       */
      answer = undefined;
      note('I could not reach the provider search just now. Try opening this again.');
    });
  });
}
