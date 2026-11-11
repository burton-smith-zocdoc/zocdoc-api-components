import type { StorybookConfig } from '@storybook/web-components-vite';
import type { Plugin } from 'vite';

// Storybook 10.x patches HTMLElement.prototype.focus with a getter that reads
// `this.ownerDocument`, which throws "Illegal invocation" when React Aria (in the
// docs blocks) reads `HTMLElement.prototype.focus` off the prototype itself. That
// happens on every story -> docs navigation. This plugin injects an equivalent
// getter that tolerates the prototype, as the very first script in the head.
//
// It is non-configurable on purpose: Storybook redefines the property when it
// first renders a story, and would otherwise replace this fix with its own
// broken getter. Storybook's redefinition sits in a try/catch, so it fails
// silently and this one stays in place.
function reactAriaFocusFix(): Plugin {
  const fixScript = `<script>
(function() {
  var originalFocus = HTMLElement.prototype.focus;
  var currentFocus = originalFocus;
  var focusingElements = new Set();
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: false,
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
