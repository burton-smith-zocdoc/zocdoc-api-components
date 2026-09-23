import type { StorybookConfig } from '@storybook/web-components-vite';
import type { Plugin } from 'vite';

// Storybook 10.x bundles React Aria which patches HTMLElement.prototype.focus.
// When accessed on the prototype (not an instance), it throws "Illegal invocation".
// This plugin injects a fix as the very first script in the HTML head.
function reactAriaFocusFix(): Plugin {
  const fixScript = `<script>
(function() {
  var originalFocus = HTMLElement.prototype.focus;
  var currentFocus = originalFocus;
  var focusingElements = new Set();
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: true,
    enumerable: false,
    get: function() {
      if (this === HTMLElement.prototype || !this.ownerDocument) return originalFocus;
      if (focusingElements.has(this)) return originalFocus;
      focusingElements.add(this);
      setTimeout(function() { focusingElements.delete(this); }.bind(this), 0);
      return currentFocus;
    },
    set: function(newFocus) { currentFocus = newFocus; }
  });
})();
</script>`;

  return {
    name: 'react-aria-focus-fix',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace('<head>', '<head>' + fixScript);
      },
    },
  };
}

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.mdx', '../packages/*/src/**/*.stories.ts'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            providerImportSource: false,
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
  staticDirs: ['../static'],
  viteFinal: async (config) => {
    config.plugins = config.plugins || [];
    config.plugins.unshift(reactAriaFocusFix());
    return config;
  },
};

export default config;
