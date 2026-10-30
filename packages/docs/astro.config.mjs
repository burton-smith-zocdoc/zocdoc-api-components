import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkApiReference from './src/plugins/remark-api-reference.js';
import remarkComponentPreview from './src/plugins/remark-component-preview.js';
import { sidebar } from './src/sidebar.mjs';

export default defineConfig({
  site: 'https://burton-smith-zocdoc.github.io',
  base: '/zocdoc-api-components',
  // The repo-root `static/` the demo and Storybook serve, so mock provider photos resolve here too.
  publicDir: '../../static',
  // Child primitives are documented on their parent's page.
  redirects: {
    '/primitive-components/accordion-item':
      '/zocdoc-api-components/primitive-components/accordion/#zd-accordion-item',
    '/primitive-components/breadcrumb-item':
      '/zocdoc-api-components/primitive-components/breadcrumb/#zd-breadcrumb-item',
    '/primitive-components/menu-group':
      '/zocdoc-api-components/primitive-components/menu/#zd-menu-group',
    '/primitive-components/menu-item':
      '/zocdoc-api-components/primitive-components/menu/#zd-menu-item',
    '/primitive-components/radio':
      '/zocdoc-api-components/primitive-components/radio-group/#zd-radio',
    '/primitive-components/tab': '/zocdoc-api-components/primitive-components/tabs/#zd-tab',
    '/primitive-components/tab-panel':
      '/zocdoc-api-components/primitive-components/tabs/#zd-tab-panel',
  },
  integrations: [
    starlight({
      title: 'Zocdoc API Components',
      // A stand-in "Z" chip beside the text title until an approved Zocdoc mark is available.
      logo: { src: './src/assets/wordmark.svg', alt: '' },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/burton-smith-zocdoc/zocdoc-api-components',
        },
      ],
      sidebar,
      customCss: ['./src/styles/fonts.css', './src/styles/custom.css', './src/styles/preview.css'],
      components: {
        // Auto-import custom components for MDX
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkApiReference, remarkComponentPreview],
  },
});
