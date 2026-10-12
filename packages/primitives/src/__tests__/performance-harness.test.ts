import { LitElement, html } from 'lit';
import { describe, expect, it } from 'vitest';
import { benchmarkComponent, benchmarkTag, untilPart } from '../utils/test/performance.js';

/** Renders whatever label it is given. */
class PerfProbe extends LitElement {
  static override properties = { label: {} };
  declare label: string;

  protected override render() {
    return html`<span part="label">${this.label}</span>`;
  }
}
customElements.define('perf-probe', PerfProbe);

/**
 * Re-requests an update on the next frame after every update, the way an animation or a resize
 * loop does — a component that never "settles". (A microtask loop would starve the event loop
 * and freeze any page, so no real component can do that.)
 */
class PerfRestless extends LitElement {
  protected override updated(): void {
    requestAnimationFrame(() => this.requestUpdate());
  }
}
customElements.define('perf-restless', PerfRestless);

/** Renders its part only after a macrotask, like a component waiting on a fetch. */
class PerfAsync extends LitElement {
  static override properties = { loaded: { state: true } };
  declare loaded: boolean;

  public override connectedCallback(): void {
    super.connectedCallback();
    setTimeout(() => (this.loaded = true), 0);
  }

  protected override render() {
    return this.loaded ? html`<p part="done">done</p>` : html`<p>loading</p>`;
  }
}
customElements.define('perf-async', PerfAsync);

const FAST = { iterations: 4, warmups: 1, bulkCounts: [3, 6], record: false } as const;

describe('benchmarkComponent', () => {
  it('reports every scenario with the configured sample counts', async () => {
    const report = await benchmarkComponent(
      {
        name: 'probe',
        create: () => document.createElement('perf-probe') as PerfProbe,
        update: (element, i) => (element.label = `v${i}`),
      },
      FAST
    );

    expect(Object.keys(report)).toEqual(['mount', 'rerender', 'bulk/3', 'bulk/6']);
    expect(report.mount!.count).toBe(4);
    expect(report.rerender!.count).toBe(4);
    // max(5, floor(4 / 2)): bulk never drops below five samples.
    expect(report['bulk/3']!.count).toBe(5);
    for (const summary of Object.values(report)) {
      expect(summary.min).toBeGreaterThanOrEqual(0);
      expect(summary.min).toBeLessThanOrEqual(summary.median);
      expect(summary.median).toBeLessThanOrEqual(summary.p95);
      expect(summary.p95).toBeLessThanOrEqual(summary.max);
    }
  });

  it('leaves nothing behind in the document', async () => {
    const before = document.body.childElementCount;
    await benchmarkTag('probe', 'perf-probe', FAST);
    expect(document.body.querySelectorAll('perf-probe')).toHaveLength(0);
    expect(document.body.childElementCount).toBe(before);
  });

  it('finishes for a component whose updates never stop', async () => {
    const report = await benchmarkTag('restless', 'perf-restless', FAST);
    expect(report.mount!.count).toBe(4);
  });

  it('times async components to their ready signal, not their first update', async () => {
    const renderedWhenReady: boolean[] = [];
    await benchmarkComponent(
      {
        name: 'async',
        create: () => document.createElement('perf-async'),
        update: (element) => (element as PerfAsync).requestUpdate(),
        ready: async (element) => {
          await untilPart('done')(element);
          renderedWhenReady.push(Boolean(element.shadowRoot?.querySelector('[part~="done"]')));
        },
      },
      FAST
    );

    expect(renderedWhenReady.length).toBeGreaterThan(0);
    expect(renderedWhenReady.every(Boolean)).toBe(true);
  });

  it('untilPart rejects instead of hanging when the part never renders', async () => {
    const element = document.createElement('perf-probe');
    document.body.append(element);
    await expect(untilPart('missing', 200)(element)).rejects.toThrow(
      'perf-probe never rendered [part~="missing"]'
    );
    element.remove();
  });
});
