import { html, render } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { settled, track } from '../../../utils/test/mount.js';
import { renderRequestState, type RequestState } from '../request-state.js';

function renderTo(state: RequestState, onRetry = vi.fn<() => void>()): HTMLElement {
  const host = document.createElement('div');
  render(
    html`${renderRequestState(state, {
      emptyMessage: 'Nothing here',
      errorMessage: 'It broke',
      onRetry,
      children: () => html`<p class="content">loaded</p>`,
    })}`,
    host
  );
  return host;
}

/**
 * Same render, but connected and upgraded, so assertions can reach into the
 * primitives' shadow roots. Custom elements do not upgrade while detached.
 */
async function renderConnected(state: RequestState): Promise<HTMLElement> {
  const host = renderTo(state);
  document.body.append(track(host));
  const element = host.querySelector('zd-alert, zd-spinner');
  if (element instanceof HTMLElement) {
    await settled(element);
  }
  return host;
}

describe('renderRequestState', () => {
  it('renders children only in the success state', () => {
    expect(renderTo('success').querySelector('.content')).not.toBeNull();
    expect(renderTo('loading').querySelector('.content')).toBeNull();
  });

  it('renders the empty message in the empty state', () => {
    expect(renderTo('empty').textContent).toContain('Nothing here');
  });

  it('renders the error message and a retry control in the error state', () => {
    const host = renderTo('error');
    expect(host.textContent).toContain('It broke');
    expect(host.querySelector('[part="retry"]')).not.toBeNull();
  });

  it('renders nothing in the idle state', () => {
    expect(renderTo('idle').textContent?.trim()).toBe('');
  });

  it('calls onRetry when the retry control is clicked', () => {
    const onRetry = vi.fn<() => void>();
    renderTo('error', onRetry).querySelector<HTMLElement>('[part="retry"]')?.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  // A11Y-002. The polite region is present in every state, including idle, so
  // that a screen reader is already observing it before the first transition
  // into loading. A live region created at the same moment as its content is
  // routinely missed.
  describe('announcements (A11Y-002)', () => {
    it.each(['idle', 'loading', 'success', 'empty', 'error'] as const)(
      'keeps the polite status region mounted in the %s state',
      (state) => {
        const region = renderTo(state).querySelector('[part="status"]');
        expect(region?.getAttribute('role')).toBe('status');
        expect(region?.getAttribute('aria-live')).toBe('polite');
      }
    );

    it('announces loading through the region, not through the spinner', () => {
      const host = renderTo('loading');
      expect(host.querySelector('[part="status"]')?.textContent).toContain('Loading');
      // The spinner is decorative; hiding it keeps its own role="status" from
      // competing with the region that owns the announcement.
      expect(host.querySelector('[part="loading"]')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('puts the empty message inside the polite region', () => {
      expect(renderTo('empty').querySelector('[part="status"]')?.textContent).toContain(
        'Nothing here'
      );
    });

    it('announces errors assertively with role="alert"', async () => {
      const host = await renderConnected('error');
      const alert = host.querySelector('[part="error"]');
      expect(alert?.getAttribute('politeness')).toBe('assertive');

      // Verify the primitive really resolves that to role="alert" rather than
      // trusting the attribute — polite is its default, and polite is wrong here.
      const announced = alert?.shadowRoot?.querySelector('[role="alert"]');
      expect(announced).not.toBeNull();
      expect(announced?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  // I18N-001. Translatable strings belong in text nodes, where the browser's
  // translator can reach them, not in attributes like `label` or `aria-label`.
  it('keeps every user-facing string in a text node', () => {
    for (const state of ['loading', 'empty', 'error'] as const) {
      const host = renderTo(state);
      for (const element of host.querySelectorAll('*')) {
        expect(element.getAttribute('label')).toBeNull();
        expect(element.getAttribute('aria-label')).toBeNull();
      }
    }
  });
});
