# Demo Sites

Four fictional practices, four stacks, one component library. Built for partner demos.

| Site | Stack | Pattern | URL |
| --- | --- | --- | --- |
| Hillbilly Dentistry | React 19 | `<ZdBooking modal>` via `/react` wrappers | http://localhost:5181 |
| Eye Caramba Optometry | Vue 3 | Composed components wired with Vue events; host books via the client | http://localhost:5182 |
| Corporate Wellness Synergy Partners LLC | ASP.NET Core 10 | Server-rendered roster and profile pages, script-tag bundle | http://localhost:8082 |
| Toe Truck Podiatry | PHP | One `<script>` tag and one `<zd-booking>` tag | http://localhost:8081 |

## Prerequisites

- Node and pnpm (repo root `pnpm install`)
- PHP 8.4+ with `intl`: `brew install php`
- .NET 10 SDK: `brew install --cask dotnet-sdk`

## Run

```sh
pnpm build && pnpm --filter @zocdoc/api-components build:bundle   # once, and after library changes
pnpm demo:sites                                                    # all four; prints the URLs once each is up
pnpm --filter demo-site-toe-truck dev                              # or one
pnpm demo:sites:smoke                                              # with the sites running
```

The booking pages wait for **Find care** before searching; see Library follow-ups. The ASP.NET and PHP sites load copies of `zocdoc.js` and `all.css`. `pnpm sites:sync` (run automatically by their `dev` scripts) refreshes those copies from `dist`.

## Sample data vs. live sandbox

Every site serves fixtures by default. No token is needed and no request leaves the page. To use the live developer sandbox:

| Stack | Set |
| --- | --- |
| React, Vue | `VITE_ZOCDOC_MODE=live` and `VITE_ZOCDOC_TOKEN` in the repo-root `.env.local` |
| ASP.NET, PHP | `ZOCDOC_MODE=live` and `ZOCDOC_TOKEN` in the environment (ASP.NET also reads `dotnet user-secrets`) |

Asking for live without a token falls back to fixtures and says so on the page ribbon.

The sandbox fixtures have no optometrist or podiatrist, so Eye Caramba and Toe Truck search Primary Care in fixture mode. In live mode, Eye Caramba searches `sp_155` (override with `VITE_ZOCDOC_SPECIALTY_ID`), and Toe Truck uses `ZOCDOC_SPECIALTY_ID`.

## Exemption: fonts and images

These sites load Google Fonts and stock photos from CDNs to look like real practice websites. That's a **demo-only** exemption to PHI-003 and must never be copied into the component library. Booking data still goes only to the configured Zocdoc base URL. No analytics.

## Library follow-ups

Things these sites needed that the library couldn't do. They're worked around in site code and should be fixed in the library.

- **No search on load.** `zd-booking` and `zd-provider-search` search only when the visitor presses **Find care**, even when `zip-code` and `specialty-id` are already set. Sites that pre-fill the search would like it to run on first render.
- **`zd-booking` modal always renders its in-page search.** When the host already knows the provider (Synergy Partners' leader pages pass `providers` and `providerLocationId`), the search step still sits on the page. Synergy hides it with `zd-booking::part(step) { display: none; }`. A way to omit the search step would remove that workaround.
- **No get-provider-location-by-id.** Synergy's detail page re-runs the roster search to find one provider by id.
- **Framework type shims resolve from the library package.** The `/react` and `types/vue` declarations import `react` / `vue` from the library's own `node_modules`, so a workspace consumer needs a `tsconfig` `paths` entry pointing them at its own copy.
- **Vue event types lack `detail`.** The Vue declarations type component events as a plain `Event`, so templates cast to `CustomEvent<…>` to read `detail`.
- **Secondary text contrast.** Charm's default secondary text is below AA on off-white pages (4.22:1 on `#f2f2ef`) and on dark-scheme cards (`neutral-800`, 3.98:1). Toe Truck and Eye Caramba override neutral tokens to pass.
- **Provider cards don't fill a stretched grid row.** `zd-provider-card` doesn't take the full height of its host, so cards in a roster grid end up different heights.
