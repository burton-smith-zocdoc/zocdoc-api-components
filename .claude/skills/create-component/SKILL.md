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
import { userFacingError } from '../internal/error-message.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../internal/request-state.js';
import styles from './<name>.styles.js';

/**
 * Description.
 *
 * @tag zd-<name>
 * @event <name>-action - Fires when action happens
 * @csspart content - Main content area
 */
export class Zd<Name> extends CharmElement {
  public static override baseName = '<name>';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [...requestStateDependencies];
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
      this.errorMessage = userFacingError(error);
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
    const button = this.scope.tag('button');
    return this.html`
      <div part="content">
        <${button} variant="primary">Action</${button}>
      </div>
    `;
  }
}
```

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
```

## 6. Tests (`<name>.test.ts`)

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as clientModule from '../../client/<client>.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

vi.mock('../../client/<client>.js', { spy: true });

type Element = HTMLElement & { someId?: string; load(): Promise<void> };

function shadow(el: Element): ShadowRoot {
  const root = el.shadowRoot;
  if (!root) throw new Error('no shadow root');
  return root;
}

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

    expect(shadow(el).querySelector('[part="content"]')).not.toBeNull();
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
  title: 'Components/<Name>',
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
- [ ] Dependencies declared in `static get dependencies()`
- [ ] State machine: idle → loading → success/empty/error
- [ ] Uses `renderRequestState()` for loading/error/empty
- [ ] Events via `this.emit()`, not `dispatchEvent`
- [ ] Tag names via `this.scope.tag()`, not hardcoded
- [ ] `userFacingError()` for error messages
- [ ] Registered via `project.scope.registerComponent()`
- [ ] Exported from package index
- [ ] Tests cover success, empty, error states
- [ ] Axe accessibility tests for each state
