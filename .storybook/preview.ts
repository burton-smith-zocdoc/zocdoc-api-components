import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import { html } from 'lit';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import customElements from '../custom-elements.json' with { type: 'json' };
import { zocdocAllCss } from '../packages/primitives/src/tokens.js';

// Configure the prefix before any components are registered
import '../packages/primitives/src/index.js';

// Set the manifest for Storybook and helpers
setCustomElementsManifest(customElements);
setStorybookHelpersConfig({ typeRef: 'expandedType' });

const preview: Preview = {
  parameters: {
    docs: {
      extractComponentDescription: (component: { name: string }) => {
        const module = customElements.modules.find((m) =>
          m.declarations?.some((d) => d.name === component.name)
        );
        const declaration = module?.declarations?.find(
          (d) => d.name === component.name
        );
        return (declaration as { description?: string })?.description;
      },
    },
  },
  decorators: [
    (story) => html`
      <style>${zocdocAllCss}</style>
      ${story()}
    `,
  ],
};

export default preview;
