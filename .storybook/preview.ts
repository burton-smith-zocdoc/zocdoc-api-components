import type { Decorator, Preview } from '@storybook/web-components';
// Configure the theme prefix before components render
import '../packages/primitives/src/configure.js';
import { setCustomElementsManifest } from '@storybook/web-components';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import customElements from '../custom-elements.json' with { type: 'json' };
import { zocdocAllCss } from '../packages/primitives/src/tokens.js';

// Register all components
import '../packages/primitives/src/index.js';

// Inject theme CSS globally (works for both stories and MDX docs)
const style = document.createElement('style');
style.textContent = zocdocAllCss;
document.head.appendChild(style);

// Default to light mode (inline style overrides the `color-scheme: light dark`
// in the theme CSS). The decorator updates this when the toolbar changes.
document.documentElement.style.colorScheme = 'light';

// Set the manifest for Storybook and helpers
setCustomElementsManifest(customElements);
setStorybookHelpersConfig({ typeRef: 'expandedType' });

/**
 * Every color token in the generated theme is a `light-dark()` pair sitting
 * under `color-scheme: light dark` on `:root`, so switching modes is only a
 * matter of pinning `color-scheme` - each token then resolves to its other
 * half. No second stylesheet, no per-component work, and consumers of the
 * package get the same behaviour by setting `color-scheme` on their own page.
 *
 * It goes on `document.documentElement` rather than on a wrapper element so the
 * whole canvas follows: the reset paints `body` from `--zd-body-bg-color`,
 * which is itself a `light-dark()` pair, and `color-scheme` inherits through
 * shadow boundaries into every component.
 */
const withColorScheme: Decorator = (story, context) => {
  const { theme } = context.globals;
  document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
  return story();
};

const preview: Preview = {
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Color scheme applied to the preview',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
      },
    },
  },
  parameters: {
    docs: {
      extractComponentDescription: (component: { name: string }) => {
        const module = customElements.modules.find((m) =>
          m.declarations?.some((d) => d.name === component.name)
        );
        const declaration = module?.declarations?.find((d) => d.name === component.name);
        return (declaration as { description?: string })?.description;
      },
    },
  },
  decorators: [withColorScheme],
};

export default preview;
