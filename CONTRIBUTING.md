# Contributing

## Prerequisites

### Node.js

Node 24.11.0 or later. The project uses `.nvmrc`:

```bash
nvm use
```

### pnpm

Install pnpm if you don't have it:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Charm UX (Local Checkout)

The primitives package depends on [Charm UX](https://github.com/charm-ux/core) via local `link:` paths because we need unpublished versions. Clone it as a sibling directory:

```bash
cd ..
git clone https://github.com/charm-ux/core.git charm-ux
cd charm-ux/core
git checkout next
pnpm install
pnpm build
```

Your directory structure should look like:

```
parent/
  zocdoc-api-components/   # this repo
  charm-ux/            # Charm checkout
```

## Setup

```bash
pnpm install
pnpm build
```

### API Token (Optional)

To test against the live Zocdoc sandbox, copy the example env file and add your token:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your sandbox credentials. **Never commit tokens.**

Without a token, the demo runs in mock mode with fixture data—useful for UI development.

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm demo` | Start the demo site at http://localhost:5173 |
| `pnpm storybook` | Start Storybook at http://localhost:6006 |
| `pnpm test` | Run all tests |
| `pnpm test:client` | Run API client tests only |
| `pnpm test:components` | Run component tests only |
| `pnpm typecheck` | Type-check the workspace |
| `pnpm lint` | Lint with oxlint |
| `pnpm format` | Format with oxfmt |

### Workflow

1. Start the demo or Storybook to see your changes
2. Write tests alongside your code
3. Run `pnpm typecheck` and `pnpm test` before committing
4. Run `pnpm run docs:check` if you changed a component's public API

### Browser Tests

Component tests run in real browsers via Playwright. Install the browsers:

```bash
pnpm exec playwright install chromium firefox webkit
```

## Project Structure

```
packages/
  primitives/         # UI primitives, theme tokens, Charm configuration
  api-components/     # Booking components and Zocdoc API client
    src/client/       # API client (http, endpoints, types)
    src/components/   # Web components (zd-booking, zd-provider-search, etc.)
  demo/               # Vite demo site
```

Dependency direction: `primitives` ← `api-components` ← `demo`

## Code Conventions

### Component Registration

Never hardcode tag names. Write `<scoped-button>` in templates and list dependencies:

```typescript
static override get dependencies() {
  return [Button, Icon];
}

render() {
  return this.html`
    <scoped-button>
      <scoped-icon name="search"></scoped-icon>
      Search
    </scoped-button>
  `;
}
```

### Events

Use the base `emit()` helper, never raw `dispatchEvent`:

```typescript
this.emit('provider-select', { provider });
```

### Styles

Use CSS nesting. No BEM or naming conventions—Shadow DOM provides encapsulation:

```typescript
static override styles = css`
  :host {
    display: block;
    
    &([loading]) {
      opacity: 0.5;
    }
  }
  
  .header {
    font-weight: bold;
    
    &:hover {
      color: var(--color-primary);
    }
  }
`;
```

### Testing

- Mock the client layer, not `fetch`
- Use test data from [Zocdoc's testing guide](https://api-docs.zocdoc.com/guides/testing-data)
- Test accessibility with axe-core in both light and dark mode

### PHI (Protected Health Information)

Patient data is sensitive. Never:

- Log patient field values
- Include real-looking names or phone numbers in tests
- Send data anywhere except the configured Zocdoc API

## Architecture

See [AGENTS.md](AGENTS.md) for detailed architecture rules and the component event reference.
