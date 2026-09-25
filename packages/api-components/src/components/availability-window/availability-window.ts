import { CharmElement, ZdButton, ZdIcon } from '@zocdoc/api-primitive-components';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { TypedEmit, TypedEventTarget } from '../events.js';
import { isValidDate, providerLocalTime } from '../../utilities/provider-time.js';
import styles from './availability-window.styles.js';

/** UTC so it reports the provider's own wall clock — see {@link providerLocalTime}. */
const rangeLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export interface WindowShiftDetail {
  direction: -1 | 1;
}

export interface ZdAvailabilityWindowEventMap {
  'window-shift': CustomEvent<WindowShiftDetail>;
}

/**
 * The range on show with a control on each side — the shared window pager for availability
 * components.
 *
 * Uses `formatRange` for the date display, which handles locale-specific formatting like
 * "Aug 5 – 18" vs "Aug 5 – Aug 18" (I18N-002, I18N-004). Each control uses a ghost icon-only
 * button with a visually hidden label for accessibility (I18N-001).
 *
 * @tag zd-availability-window
 * @event window-shift - Emitted with `{ direction: -1 | 1 }` when a navigation button is pressed.
 * @csspart window - The container holding the range and controls.
 * @csspart window-range - The line naming the range on show.
 * @csspart window-previous - The control moving the range back.
 * @csspart window-next - The control moving the range forward.
 */
export class ZdAvailabilityWindow extends CharmElement {
  public static override baseName = 'availability-window';

  declare public addEventListener: TypedEventTarget<ZdAvailabilityWindowEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdAvailabilityWindowEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdAvailabilityWindowEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdIcon];
  }

  /** The window's first day, as `YYYY-MM-DD`. */
  @property({ attribute: 'start-date' })
  public startDate!: string;

  /** The window's last day, inclusive, as `YYYY-MM-DD`. */
  @property({ attribute: 'end-date' })
  public endDate!: string;

  /**
   * Whether there is anywhere earlier to go. False at today, because the API returns nothing in
   * the past and a window behind it comes back empty — which reads as no availability at all.
   */
  @property({ type: Boolean, attribute: 'can-go-earlier' })
  public canGoEarlier = true;

  protected shift(direction: -1 | 1): void {
    this.emit('window-shift', { detail: { direction } });
  }

  protected override render(): unknown {
    const start = providerLocalTime(this.startDate);
    const end = providerLocalTime(this.endDate);
    const range =
      isValidDate(start) && isValidDate(end) ? rangeLabel.formatRange(start, end) : undefined;

    return this.html`
      <div class="window" part="window">
        <scoped-button
          class="window-previous"
          part="window-previous"
          variant="ghost"
          icon-only
          ?disabled=${!this.canGoEarlier}
          @click=${() => this.shift(-1)}
        >
          <scoped-icon slot="start" name="chevron-left"></scoped-icon>
          <span class="window-label">Earlier dates</span>
        </scoped-button>

        ${range === undefined ? nothing : this.html`<p class="window-range" part="window-range">${range}</p>`}

        <scoped-button
          class="window-next"
          part="window-next"
          variant="ghost"
          icon-only
          @click=${() => this.shift(1)}
        >
          <scoped-icon slot="start" name="chevron-right"></scoped-icon>
          <span class="window-label">Later dates</span>
        </scoped-button>
      </div>
    `;
  }
}
