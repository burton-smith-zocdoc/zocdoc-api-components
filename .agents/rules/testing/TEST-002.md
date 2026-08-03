# TEST-002: Mock client layer, not network

Component tests mock the client layer rather than the network. This:
- Avoids flaky network-dependent tests
- Tests component behavior independent of API changes
- Runs faster than real HTTP
- Isolates what we're testing

**Do:**

```ts
// Mock at the client layer
import * as providerLocations from '../../client/provider-locations.js';

describe('ZdProviderSearch', () => {
  it('renders results on successful search', async () => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue({
      provider_locations: [{ id: '1', name: 'Test Provider' }],
    });
    
    const el = await fixture(html`<zd-provider-search zip-code="10011"></zd-provider-search>`);
    await el.search();
    await el.updateComplete;
    
    expect(el.shadowRoot?.querySelector('.result')).toBeTruthy();
  });
  
  it('shows error state on auth failure', async () => {
    vi.spyOn(providerLocations, 'searchProviderLocations')
      .mockRejectedValue(new ZocdocAuthError());
    
    // ...
  });
});
```

**Don't:**

```ts
// ❌ Mocking fetch in component tests — too low-level
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ provider_locations: [] }),
});

// ❌ Real network in unit tests — flaky, slow
it('fetches from sandbox', async () => {
  const el = await fixture(html`<zd-provider-search></zd-provider-search>`);
  // Actually calls the API...
});
```

Client tests (in the `client` project) do mock `fetch` because they're testing the HTTP layer itself.

See also: [TEST-001](./TEST-001.md), [CLIENT-001](../client/CLIENT-001.md)
