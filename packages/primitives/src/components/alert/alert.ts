import { CoreAlert } from '@charm-ux/core/components/alert/alert.js';
import { project, type CharmElement } from '@charm-ux/core';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import styles from './alert.styles.js';

/**
 * The severities a Zocdoc alert can carry. Each one is backed by an
 * `alert.<variant>` token group in the Zocdoc theme.
 */
export type ZdAlertVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * The glyph each severity draws when the consumer slots nothing.
 *
 * Color alone cannot carry the severity (WCAG 1.4.1), and it is also the first
 * thing lost to a monochrome display or a custom stylesheet. The message text is
 * the primary signal; the icon is the visual one.
 *
 * `info-circle` is a Zocdoc addition to Charm's set — see `src/icons.ts`. The
 * other three are Charm's own.
 */
const VARIANT_ICONS: Record<ZdAlertVariant, string> = {
  info: 'info-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger: 'error-circle',
};

/**
 * Displays contextual feedback messages, with a variant per severity.
 *
 * @tag zd-alert
 */
export class ZdAlert extends CoreAlert {
  static override styles = [...super.styles, styles] as typeof CoreAlert.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }

  /**
   * The alert's severity. Omit it for an alert with no severity, which keeps
   * Charm's neutral surface and draws no icon.
   *
   * Styling only: `politeness` is what decides whether and how the alert is
   * announced, and the two are independent. An error usually wants
   * `variant="danger" politeness="assertive"`, but a `danger` alert that has been
   * on the page all along should stay `polite` — the variant does not imply it.
   */
  @property({ reflect: true })
  public variant?: ZdAlertVariant;

  /**
   * Draws the severity's glyph as the `icon` slot's fallback content, so a
   * consumer can still slot their own and have it win.
   *
   * The icon gets no `label`, which makes `zd-icon` render it `aria-hidden`. That
   * is deliberate twice over: the severity is already in the message text, so a
   * label would be a second announcement of the same thing, and a label is an
   * attribute, which browser translation does not reach (I18N-001).
   *
   * Charm hides the container when nothing is slotted. That still has to hold for
   * an alert with no variant, or every plain alert would carry the icon's width
   * and margin for no reason.
   */
  protected override iconTemplate() {
    const name = this.variant ? VARIANT_ICONS[this.variant] : undefined;
    const empty = !name && !this.hasSlotController.hasNamedSlot('icon');

    return this.html` <div part="alert-icon" class="alert-icon" ?hidden=${empty}>
      <slot name="icon">${name ? this.html`<scoped-icon name=${name}></scoped-icon>` : nothing}</slot>
    </div>`;
  }
}

project.scope.registerComponent(ZdAlert);
