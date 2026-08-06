/**
 * The mock's entry point, and the only part of `client/mock` reachable from outside this
 * package — see the `./mock` subpath in `package.json`.
 *
 * It exists for `packages/demo`, which needs a funnel that runs with no token and no network:
 * a demo whose default is the live sandbox cannot be opened without a credential, and its
 * booking step sends a real patient's details the first time anyone clicks through it. Serving
 * fixtures instead satisfies PHI-003 by having no outbound destination at all.
 *
 * Tests and stories inside this package keep importing `./transport.js` and `./fixtures.js`
 * directly, so nothing here is on their path — this file is the boundary, not a hub.
 *
 * **Deliberately narrow.** A transport, its options, and the documented sentinel inputs that
 * drive it. The fixture bodies stay unexported: a consumer asserting on
 * `PROVIDER_LOCATIONS[0].provider.full_name` would be treating test data as an API contract,
 * and every enrichment of a fixture would then be a breaking change.
 */
export {
  configureZocdocMock,
  createMockTransport,
  type MockTransportOptions,
} from './transport.js';
export { SCENARIOS } from './fixtures.js';
