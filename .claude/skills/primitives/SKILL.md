---
name: primitives
description: Reference for @powered-by-zocdoc/primitives - Charm UX components with zd- prefix. Use when creating components that use primitives, or when you need to know what UI elements are available.
---

# Primitives Reference

`@powered-by-zocdoc/primitives` provides Zocdoc-styled Charm UX components with the `zd-` tag prefix.

## Critical: Import Order

The package configures the `zd-` prefix on import. Always import primitives before using any component:

```typescript
import { ZdButton, CharmElement } from '@powered-by-zocdoc/primitives';
```

**Never import Charm barrels directly** (e.g., `@charm-ux/core/components/button/index.js`). Import from `@powered-by-zocdoc/primitives` or from class modules.

## Using in Templates

Use `scope.tag()` for tag names, never hardcoded strings:

```typescript
render() {
  const button = this.scope.tag('button');
  return html`<${button} variant="primary">Submit</${button}>`;
}
```

## Component Catalog

### Layout & Structure
| Component | Tag | Notes |
|-----------|-----|-------|
| `ZdCard` | `zd-card` | Container with padding/border |
| `ZdDivider` | `zd-divider` | Horizontal rule |
| `ZdAccordion` | `zd-accordion` | Expandable sections container |
| `ZdAccordionItem` | `zd-accordion-item` | Single accordion section |
| `ZdDisclosure` | `zd-disclosure` | Show/hide content |
| `ZdTabs` | `zd-tabs` | Tab container |
| `ZdTab` | `zd-tab` | Tab trigger |
| `ZdTabPanel` | `zd-tab-panel` | Tab content |

### Buttons & Actions
| Component | Tag | Variants |
|-----------|-----|----------|
| `ZdButton` | `zd-button` | `primary`, `secondary`, `inverse`, `ghost`, `destructive`, `link` |
| `ZdButtonGroup` | `zd-button-group` | Groups buttons horizontally |
| `ZdButtonGroupOverflow` | `zd-button-group-overflow` | Overflow menu for button groups |

**ZdButton props**: `variant`, `size` (`default` \| `small`), `fluid` (boolean)

### Form Inputs
| Component | Tag | Notes |
|-----------|-----|-------|
| `ZdInput` | `zd-input` | Text input, supports `size` prop |
| `ZdTextArea` | `zd-text-area` | Multi-line text |
| `ZdSelect` | `zd-select` | Dropdown select |
| `ZdCheckbox` | `zd-checkbox` | Checkbox |
| `ZdRadio` | `zd-radio` | Radio button |
| `ZdRadioGroup` | `zd-radio-group` | Radio button group |
| `ZdSwitch` | `zd-switch` | Toggle switch |

### Feedback & Status
| Component | Tag | Variants |
|-----------|-----|----------|
| `ZdAlert` | `zd-alert` | `info`, `success`, `warning`, `danger` |
| `ZdBadge` | `zd-badge` | `neutral`, `inverse`, `info`, `success`, `warning`, `danger`, `caution`, `brand` |
| `ZdSpinner` | `zd-spinner` | Loading indicator |
| `ZdProgressBar` | `zd-progress-bar` | Progress indicator |
| `ZdSkeleton` | `zd-skeleton` | Loading placeholder |
| `ZdTooltip` | `zd-tooltip` | Hover tooltip |

### Overlays & Popups
| Component | Tag | Notes |
|-----------|-----|-------|
| `ZdDialog` | `zd-dialog` | Modal dialog |
| `ZdPopup` | `zd-popup` | Positioned popup |
| `ZdPushPane` | `zd-push-pane` | Slide-in panel |
| `ZdMenu` | `zd-menu` | Dropdown menu container |
| `ZdMenuGroup` | `zd-menu-group` | Menu section |
| `ZdMenuItem` | `zd-menu-item` | Menu item |

### Navigation
| Component | Tag | Notes |
|-----------|-----|-------|
| `ZdBreadcrumb` | `zd-breadcrumb` | Breadcrumb container |
| `ZdBreadcrumbItem` | `zd-breadcrumb-item` | Breadcrumb link |

### Utility
| Component | Tag | Notes |
|-----------|-----|-------|
| `ZdIcon` | `zd-icon` | SVG icon |
| `ZdAvatar` | `zd-avatar` | User avatar |
| `ZdOverflow` | `zd-overflow` | Overflow container |
| `ZdScopedStyles` | `zd-scoped-styles` | Style scoping |

## Creating a New Primitive

Follow this pattern when adding a component:

```typescript
// src/components/example/example.ts
import CoreExample from '@charm-ux/core/components/example/example.js';
import { project } from '@charm-ux/core';
import styles from './example.styles.js';

export class ZdExample extends CoreExample {
  static override styles = [...super.styles, styles] as typeof CoreExample.styles;
}

project.scope.registerComponent(ZdExample);
```

### With Custom Props

```typescript
import { property } from 'lit/decorators.js';
import type { ZdControlSize } from '../control-size.js';

export type ZdExampleVariant = 'primary' | 'secondary';

export class ZdExample extends CoreExample {
  static override styles = [...super.styles, styles] as typeof CoreExample.styles;

  @property({ reflect: true }) public variant?: ZdExampleVariant;
  @property({ reflect: true }) public size?: ZdControlSize;
}
```

### With Dependencies Override

When a component renders other primitives, override `dependencies()` to ensure Zd* classes register (not Charm originals):

```typescript
public static override get dependencies(): (typeof CharmElement)[] {
  return [ZdIcon, ZdButton];
}
```

## Theme Tokens

Export from the package:
- `zocdocThemeCss` - All CSS custom properties (~220 `--zd-*` tokens)
- `zocdocResetCss` - CSS reset
- `zocdocAllCss` - Combined theme + reset + utilities

## Size Prop

Interactive components support `ZdControlSize`:
```typescript
type ZdControlSize = 'default' | 'small';
```

Applies to: `ZdButton`, `ZdInput`
