import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import { addDays, todayDayKey } from '../internal/provider-time.js';
import type { ZdAvailabilityPicker } from './availability-picker.js';
import './index.js';

/**
 * Stories run against the mock transport, so they need no token and make no outbound
 * request (PHI-003). States are driven by the documented sentinel provider location ids
 * the real sandbox recognises, not by a mock-only flag.
 *
 * No `start-date` is pinned on most of these: the window comes from what the component asks for,
 * which is what a demo should show. Stories therefore render today onward and the dates move day
 * to day — deliberate, since a picker frozen on a past date is the one thing this component must
 * never do. `StartsTomorrow` is the exception, and it computes the date rather than hard-coding it.
 */
configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<ZdAvailabilityPicker>(
  'zd-availability-picker',
  { excludeCategories: ['cssParts'] }
);

const PROVIDER_LOCATION_ID =
  PROVIDER_LOCATIONS[0]?.provider_location_id ??
  'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';

const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

/**
 * A `YYYY-MM-DD` key relative to today — see `StartsTomorrow`. `todayDayKey` reads the local
 * date rather than going through `toISOString`, which would use UTC and name tomorrow for
 * anyone west of Greenwich in the evening.
 */
const dayFromToday = (offset: number): string => addDays(todayDayKey(), offset);

/**
 * `slot-select` is declared on the component, so the helpers wire it into the Actions
 * panel — choosing a time logs the `startTime` that would go to `POST /v1/appointments`.
 */
const meta: Meta<ZdAvailabilityPicker> = {
  title: 'Booking/Availability Picker',
  component: 'zd-availability-picker',
  args: {
    ...args,
    providerLocationId: PROVIDER_LOCATION_ID,
    visitReasonId: VISIT_REASON_ID,
  },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdAvailabilityPicker>;

/**
 * A week of availability with gaps, because the fixture generator closes the practice
 * every third day. Pick a day to see its times; the selected day carries `aria-current`.
 */
export const Default: Story = {};

/**
 * A month, which is the widest window the API allows. The day strip scrolls horizontally
 * rather than wrapping, so the times stay in a predictable place as days are picked.
 */
export const FullMonth: Story = {
  args: { days: 30 },
};

/**
 * The production booking modal's shape: every day of the window at once, each with its own line
 * and its times under it. Nothing is behind a day that has to be pressed first.
 *
 * The fixture generator closes the practice every third day, so the closed days show up here as
 * spans — "Sat, Aug 8 – Tue, Aug 11 / No available appointments" — rather than as gaps in the
 * sequence. A day quietly missing from the list is indistinguishable from a window that ends
 * early, which is why they are rendered rather than skipped.
 */
export const Stacked: Story = {
  args: { layout: 'stacked', days: 14 },
};

/**
 * The same layout across the widest window the API allows, which is where the collapsing earns its
 * keep: a month of a part-time practice is mostly closed days, and one span per run is a page a
 * patient can actually scan.
 */
export const StackedFullMonth: Story = {
  args: { layout: 'stacked', days: 30 },
};

/**
 * Opened on tomorrow rather than today, which is what the production detail panel does.
 *
 * A day key rather than an offset flag, because that is what the API takes — and because whose
 * "tomorrow" it is belongs to the host page, not to this component.
 */
export const StartsTomorrow: Story = {
  args: { startDate: dayFromToday(1) },
};

/**
 * The New/Existing patient control, which is on by default and shown in every story above.
 *
 * Switching it refetches: patient type changes which slots the API returns, so the times below it
 * change. `patient-type-change` shows up in the Actions panel too, because a host page that books
 * through its own step has to send the same value to `POST /v1/appointments` — a patient booked as
 * new when they said they were returning is a wrong booking, not a cosmetic mismatch.
 */
export const PatientTypeChoice: Story = {
  args: { patientType: 'existing' },
};

/**
 * Without the control, for a host page that asks the question itself — the production modal has
 * one governing the whole panel, not one per section. It then binds `patient-type` down.
 */
export const HiddenPatientType: Story = {
  args: { hidePatientType: true },
};

/**
 * The documented provider location with nothing bookable. Empty is a success, not an
 * error — the endpoint answers about the location either way (COMP-001).
 *
 * The patient-type control stays put: a window with nothing for a new patient often has something
 * for a returning one, and the control that finds out has to still be there.
 */
export const NoAvailability: Story = {
  args: { providerLocationId: SCENARIOS.providerLocationNoAvailability },
};

/**
 * The documented provider location that returns a 500. The alert shows user-facing copy,
 * never the developer-facing message from the client (CLIENT-003), and offers a retry.
 */
export const RequestFails: Story = {
  args: { providerLocationId: SCENARIOS.providerLocationError },
};

/**
 * Nothing is fetched until both ids are present, so a picker waiting on an earlier step
 * renders empty rather than firing a request it cannot complete.
 */
export const AwaitingVisitReason: Story = {
  args: { visitReasonId: undefined },
};

/**
 * The same picker in a narrow column, which is how this renders inside a sidebar. The day
 * strip scrolls and the times wrap, so neither overflows the container.
 */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 18rem">${story()}</div>`],
};
