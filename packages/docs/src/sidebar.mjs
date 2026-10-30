/**
 * The site's sidebar. Shared with `llms.txt`, which lists pages in the same order.
 *
 * @type {import('@astrojs/starlight/types').StarlightUserConfig['sidebar']}
 */
export const sidebar = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Installation', slug: 'getting-started/installation' },
      { label: 'Using with AI', slug: 'getting-started/using-with-ai' },
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
      { label: 'Markup and Supplied Data', slug: 'guides/markup-and-supplied-data' },
      { label: 'Theming', slug: 'guides/theming' },
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
];
