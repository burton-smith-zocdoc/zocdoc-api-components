import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkApiReference from './src/plugins/remark-api-reference.js';
import remarkComponentPreview from './src/plugins/remark-component-preview.js';

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
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/burton-smith-zocdoc/zocdoc-api-components',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Authentication', slug: 'getting-started/authentication' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Zocdoc API Overview', slug: 'guides/zocdoc-api' },
            { label: 'Architecture', slug: 'guides/architecture' },
            { label: 'Composed vs Single Element', slug: 'guides/composed-vs-single' },
            { label: 'Framework Integration', slug: 'guides/frameworks' },
            { label: 'Testing', slug: 'guides/testing' },
          ],
        },
        {
          label: 'Client API',
          items: [
            { label: 'Configuration', slug: 'client/configuration' },
            { label: 'Endpoints', slug: 'client/endpoints' },
            { label: 'Errors', slug: 'client/errors' },
          ],
        },
        {
          label: 'API Components',
          items: [{ autogenerate: { directory: 'components' } }],
        },
        {
          label: 'Primitive Components',
          items: [{ autogenerate: { directory: 'primitive-components' } }],
        },
      ],
      customCss: ['./src/styles/custom.css', './src/styles/preview.css'],
      components: {
        // Auto-import custom components for MDX
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkApiReference, remarkComponentPreview],
  },
});
