import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createTestContainer,
  describeA11y,
  expectNoViolations,
  getContainer,
  waitForUpdate,
} from '../../utils/test/a11y.js';

interface ZdSwitch extends HTMLElement {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
}

describeA11y('zd-switch', () => {
  it('passes axe checks with label', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Enable notifications';
    getContainer().appendChild(el);

    await expectNoViolations();
  });

  it('passes axe checks when checked', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Dark mode';
    el.checked = true;
    getContainer().appendChild(el);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Disabled toggle';
    el.disabled = true;
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});

/**
 * The thumb's travel is a theme token, and the failure it guards against is a
 * quiet one: with no value the stylesheet still resolves, the track still
 * changes color, and the only thing missing is the movement that tells a
 * sighted user which way the switch is set. Nothing throws, so only measuring
 * catches it.
 */
/** Gaps between the thumb and the track it sits in, in CSS pixels. */
interface Gaps {
  start: number;
  end: number;
  top: number;
}

function gaps(el: ZdSwitch): Gaps {
  const root = el.shadowRoot;
  if (!root) throw new Error('zd-switch rendered no shadow root');

  const track = root.querySelector('.switch-control')?.getBoundingClientRect();
  const thumb = root.querySelector('.switch-thumb')?.getBoundingClientRect();
  if (!track || !thumb) throw new Error('zd-switch rendered no track or thumb');

  return {
    start: thumb.left - track.left,
    end: track.right - thumb.right,
    top: thumb.top - track.top,
  };
}

describe('zd-switch thumb travel', () => {
  let container: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    ({ container, cleanup } = createTestContainer());
  });

  afterEach(() => cleanup());

  /*
   * The transition is pinned off because it is measured geometry that matters
   * here: the thumb takes 200ms to arrive, and reading the rect before then
   * reports a position it is only passing through.
   */
  async function mount(): Promise<ZdSwitch> {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Dark mode';
    el.style.setProperty('--zd-switch-thumb-transition', 'none');
    container.appendChild(el);
    await waitForUpdate();
    return el;
  }

  it('moves the thumb to the far end when checked', async () => {
    const el = await mount();
    const unchecked = gaps(el);

    el.checked = true;
    await waitForUpdate();
    const checked = gaps(el);

    // Mirrored, so the thumb travels the whole track rather than drifting.
    expect(checked.start).toBeCloseTo(unchecked.end, 1);
    expect(checked.end).toBeCloseTo(unchecked.start, 1);
    expect(checked.start).toBeGreaterThan(unchecked.start);
  });

  /*
   * The thumb is a circle inset in a pill, so the gap left at the end of its
   * travel should match the one it already has above and below it. That
   * equality is what the token's `(width - height) / 2` computes, and asserting
   * it here pins the relationship rather than the 10px it currently works out
   * to — a track resized in the theme stays correct without touching this test.
   */
  it.each([false, true])('insets the thumb evenly when checked is %s', async (checked) => {
    const el = await mount();
    el.checked = checked;
    await waitForUpdate();

    const { start, end, top } = gaps(el);

    expect(Math.min(start, end)).toBeCloseTo(top, 1);
  });
});
