// Importing primitives first guarantees the zd prefix is set before any
// component module below is evaluated. Keep this import first (PBZD-001).
import '@powered-by-zocdoc/primitives';

export * from './client/appointments.js';
export * from './client/availability.js';
export * from './client/configure.js';
export * from './client/errors.js';
export * from './client/provider-locations.js';
export * from './client/reference-data.js';
export * from './client/types.js';

// `./client/mock` is deliberately absent, and is not in this package's `exports` either,
// so nothing outside the package can reach the fixtures or the fake transport. It is
// excluded from `tsconfig.build.json` too, so it never reaches build output. Tests and
// stories inside this package import it by relative path. When the demo site lands
// (Task 16) it will need a declared subpath — add one then, not before.

// Component exports are appended here as Tasks 10–15 land.
