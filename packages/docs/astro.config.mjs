import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://burton-smith-zocdoc.github.io',
  base: '/powered-by-zocdoc',
  integrations: [
    starlight({
      title: 'Powered by Zocdoc',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/burton-smith-zocdoc/powered-by-zocdoc',
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
            { label: 'Architecture', slug: 'guides/architecture' },
            { label: 'Composed vs Single Element', slug: 'guides/composed-vs-single' },
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
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
