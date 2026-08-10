---
name: create-component
description: Step-by-step workflow for creating a new API component. Use when adding a component to packages/api-components.
---

# Create API Component

Follow these steps to create a new component in `packages/api-components`.

## 1. Create File Structure

```
packages/api-components/src/components/<name>/
  index.ts              # Registration + export
  <name>.ts             # Component class
  <name>.styles.ts      # CSS styles
  <name>.test.ts        # Tests
  <name>.stories.ts     # Storybook
```

## 2. Component Class (`<name>.ts`)

```typescript
import { CharmElement, ZdButton } from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import { userFacingError } from '../internal/error-message.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../internal/request-state.js';
import styles from './<name>.styles.js';

/** What the host page reads off the event. Exported through the barrel. */
export interface <Name>ResultDetail {
  data: Thing[];
}

export interface Zd<Name>EventMap {
  '<name>-result': CustomEvent<<Name>ResultDetail>;
  '<name>-error': CustomEvent<ErrorDetail>;
}

/**
 * Description.
 *
 * @tag zd-<name>
 * @event <name>-result - Fires when the fetch succeeds
 * @csspart content - Main content area
 */
export class Zd<Name> extends CharmElement {
  public static override baseName = '<name>';

  declare public addEventListener: TypedEventTarget<Zd<Name>EventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<Zd<Name>EventMap>['removeEventListener'];
  declare protected emit: TypedEmit<Zd<Name>EventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  /** One entry per `<scoped-*>` in the template, plus the request state's own. */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ...requestStateDependencies];
  }

  @property({ attribute: 'some-id' })
  public someId?: string;

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private errorMessage?: string;

  public async load(): Promise<void> {
    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const result = await apiCall();
      this.requestState = result.length === 0 ? 'empty' : 'success';
      this.emit('<name>-result', { detail: { data: result } });
    } catch (error: unknown) {
      this.requestState = 'error';
      // userFacingError() for the patient; the raw error goes only to the host page,
      // whose handling is developer-facing (CLIENT-003, PHI-001).
      this.errorMessage = userFacingError(error);
      this.emit('<name>-error', { detail: { error } });
    }
  }

  protected override render(): unknown {
    return renderRequestState(this.requestState, {
      emptyMessage: 'No results found.',
      errorMessage: this.errorMessage,
      loadingMessage: 'Loading...',
      onRetry: () => void this.load(),
      children: () => this.renderContent(),
    });
  }

  private renderContent(): unknown {
    return this.html`
      <div part="content">
        <scoped-button variant="primary">Action</scoped-button>
      </div>
    `;
  }
}
```

`this.html` rewrites `<scoped-button>` to the registered prefix. Never hardcode
`zd-button`, and never interpolate `scope.tag()` into markup (PBZD-003). Every
`<scoped-*>` you write needs its class in `dependencies()` above, or it renders as
an undefined element with no error.

The `declare` triple is what keeps the event map honest: `emit` is narrowed to the
map, so emitting a name the map doesn't list — or a detail of the wrong shape —
stops compiling. Skipping it lets the map drift from what the component emits,
which is the exact thing it exists to prevent.

## 3. Styles (`<name>.styles.ts`)

```typescript
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  [part='content'] {
    /* styles */
  }
`;
```

## 4. Registration (`index.ts`)

```typescript
import { project } from '@powered-by-zocdoc/primitives';
import { Zd<Name> } from './<name>.js';

project.scope.registerComponent(Zd<Name>);

export { Zd<Name> };
```

## 5. Export from Package

Add to `packages/api-components/src/index.ts`:

```typescript
export { Zd<Name> } from './components/<name>/index.js';
export type { <Name>ResultDetail, Zd<Name>EventMap } from './components/<name>/<name>.js';
```

Export the detail types, not just the class. A host page reads `event.detail`, and
without the type it has to hand-copy the shape — which typechecks against nothing
and goes stale on the first added field.

## 6. Tests (`<name>.test.ts`)

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as clientModule from '../../client/<client>.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, settled } from '../../utils/test/mount.js';
import './index.js';

vi.mock('../../client/<client>.js', { spy: true });

type Element = HTMLElement & { someId?: string; load(): Promise<void> };

describe('zd-<name>', () => {
  beforeEach(() => {
    vi.spyOn(clientModule, 'apiCall').mockResolvedValue([/* data */]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders content after load', async () => {
    const el = await mount<Element>(`<zd-<name>></zd-<name>>`);
    await el.load();
    await settled(el);

    expect(part(el, 'content')).toBeDefined();
  });

  describe('accessibility', () => {
    it('passes axe in success state', async () => {
      const el = await mount<Element>(`<zd-<name>></zd-<name>>`);
      await el.load();
      await settled(el);
      await expectNoViolations(el);
    });

    it('passes axe in error state', async () => {
      vi.mocked(clientModule.apiCall).mockRejectedValue(new Error('fail'));
      const el = await mount<Element>(`<zd-<name>></zd-<name>>`);
      await el.load();
      await settled(el);
      await expectNoViolations(el);
    });
  });
});
```

## 7. Stories (`<name>.stories.ts`)

```typescript
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { Zd<Name> } from './<name>.js';
import './index.js';

configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<Zd<Name>>(
  'zd-<name>',
  { excludeCategories: ['cssParts'] }
);

const meta: Meta<Zd<Name>> = {
  title: 'API Components/<Name>',
  component: 'zd-<name>',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<Zd<Name>>;

export const Default: Story = {};
```

## Checklist

- [ ] Component class extends `CharmElement`
- [ ] `baseName` declared as static property
- [ ] Markup uses `<scoped-*>` inside `this.html` — no `zd-` prefix, no `scope.tag()`
- [ ] **Every `<scoped-*>` in the template has its class in `dependencies()`**, plus `...requestStateDependencies` if `renderRequestState()` is called
- [ ] State machine: idle → loading → success/empty/error
- [ ] Uses `renderRequestState()` for loading/error/empty
- [ ] Event map interface declared, with the `declare addEventListener / removeEventListener / emit` triple
- [ ] Events via `this.emit()`, not `dispatchEvent`
- [ ] `userFacingError()` for error messages — never `error.message`
- [ ] Registered via `project.scope.registerComponent()`
- [ ] Class **and detail types** exported from package index
- [ ] Tests cover success, empty, error states
- [ ] Axe accessibility tests for each state
- [ ] Row added to the Component Events table in `AGENTS.md`
- [ ] Ran `pnpm run docs:check` (or `pnpm run analyze && pnpm -r run analyze`) and committed the
      regenerated `references/<tag>.md` page plus the updated
      `references/index.md` — a new component with no reference page is invisible to every
      agent routed through the index
