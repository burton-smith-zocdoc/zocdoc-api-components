import CoreButton from '@charm-ux/core/components/button/button.js';
import { project, type CharmElement } from '@charm-ux/core';
import { nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { ZdControlSize } from '../control-size.js';
import { ZdSpinner } from '../spinner/spinner.js';
import styles from './button.styles.js';

/**
 * The visual treatments a Zocdoc button can take. Each one is backed by a
 * `button.<variant>` token group in the Zocdoc theme.
 */
export type ZdButtonVariant =
  | 'primary'
  | 'secondary'
  | 'inverse'
  | 'ghost'
  | 'destructive'
  | 'link';

/**
 * An interactive button, with a variant per visual treatment and two densities.
 *
 * @tag zd-button
 */
export class ZdButton extends CoreButton {
  static override styles = [...super.styles, styles] as typeof CoreButton.styles;

  /** Charm's button renders no other primitive; `loading` adds the spinner (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdSpinner];
  }

  /**
   * The button's visual treatment. Omit it to use the base `button.*` tokens,
   * which is what an unstyled Charm button renders.
   */
  @property({ reflect: true })
  public variant?: ZdButtonVariant = 'secondary';

  /**
   * The button's density. `small` swaps in the theme's `button.small.*` metrics;
   * `default` and an omitted value both use the base metrics.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;

  /**
   * Stretch the button to the width of its container.
   *
   * Charm's button is `display: inline-block` with a full-width `.control`, so
   * this only has to widen the host.
   */
  @property({ type: Boolean, reflect: true })
  public fluid?: boolean;

  /**
   * Show a spinner in place of the `start` slot and ignore activation until the
   * work the button started has finished.
   *
   * Unlike `disabled`, the button keeps its variant colors, so it doesn't look
   * like the action became unavailable, and it keeps its label, so its width and
   * accessible name don't change. The inner control gets `aria-busy` and
   * `aria-disabled`. The button doesn't announce anything itself: the component
   * doing the work owns the `aria-live` region that says what is happening
   * (A11Y-002).
   */
  @property({ type: Boolean, reflect: true })
  public loading?: boolean;

  /**
   * Charm's own `disabled` guard, extended to `loading`. Swallowing the event here
   * also skips Charm's toggle and `type="submit"` handling, so a loading submit
   * button can't submit its form a second time.
   */
  protected override handleClick(event: MouseEvent): void {
    if (this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    super.handleClick(event);
  }

  protected override contentTemplate(): TemplateResult {
    return this.html`${
      this.loading
        ? this.html`<span part="spinner" class="spinner">
            <scoped-spinner aria-hidden="true"></scoped-spinner>
          </span>`
        : nothing
    }${super.contentTemplate()}`;
  }

  /**
   * Charm forwards only a fixed set of ARIA attributes to the inner control, so
   * the loading state is written onto it after each render. Lit only rewrites
   * `aria-disabled` when Charm's own binding changes, so restating it here on
   * every render is what keeps the two from fighting.
   */
  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);

    const control = this.shadowRoot?.querySelector('.control');
    if (!control) return;

    if (this.loading) {
      control.setAttribute('aria-busy', 'true');
      control.setAttribute('aria-disabled', 'true');
    } else if (changed.has('loading')) {
      control.removeAttribute('aria-busy');
      // Hand `aria-disabled` back to what Charm's binding would have written.
      if (!this.href && this.disabled !== undefined) {
        control.setAttribute('aria-disabled', String(this.disabled));
      } else {
        control.removeAttribute('aria-disabled');
      }
    }
  }
}

project.scope.registerComponent(ZdButton);
