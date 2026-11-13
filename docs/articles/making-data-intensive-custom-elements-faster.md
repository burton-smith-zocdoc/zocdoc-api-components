---
title: Faster Data-Heavy Web Components Without Full SSR
published: false
description: Put structured data in inert JSON blocks so custom elements can skip client-side request waterfalls—without adopting a server-side rendering stack.
tags: webcomponents, performance, javascript, webdev
---

## TL;DR

- Expose public properties for server-side hydration
- **Inline JSON blocks** simplify implementations so any server, CMS, or template can supply it with no glue code.
- In our throttled-phone tests, this made data appear **16–45% sooner** and removed layout shift.
- Inline removes the API waterfall without a framework-specific rendering server.

## Portable features using custom elements

A self-fetching custom element is wonderfully portable:

```html
<search-results query="dentist"></search-results>
```

But it can't request its data until its JavaScript has downloaded, executed, and upgraded the element. On a slow connection, that creates a waterfall - especially if internal components need to make their own fetch requests:

```text
HTML → JavaScript → element upgrade → token → API → render
                                            └── spinner ──┘
```

Server-side rendering (SSR) can remove more of that delay, but it needs a server that runs your component's rendering code and a client that can hydrate (re-render and take over) the server's markup.

There is a useful middle ground: put the **data** in the HTML, and let the custom element render it normally.

```html
<search-results>
  <script type="application/json" data-prop="results">
    [{ "id": "result-1", "name": "Example result" }]
  </script>
</search-results>
```

The browser never executes a script with a non-JavaScript `type`, so the block is inert data. When the element upgrades, it parses the block and renders without making a request.

```text
Server fetches data
        ↓
HTML + JSON → JavaScript → element upgrade → render

Browser API requests: 0
Client credential:    not required
Loading state:        skipped
```

## What we measured

We loaded two real pages in headless Chrome with a mobile profile:

- 150 ms round-trip latency
- roughly 1.6 Mbps download speed
- a CPU 4× slower than the test laptop
- 100 ms of backend time per API call, whether the browser or the server makes it

The pages are a search results list and an availability calendar. The results page needs two calls in a row: a search, then availability for the returned IDs. The calendar needs one.

Each page was built in five ways. All five make the same API calls and show the same data. They differ in who makes the calls and how the data reaches the element:

| Version        | Who calls the API | How the data reaches the element                                 |
| -------------- | ----------------- | ---------------------------------------------------------------- |
| **Fetched**    | The browser       | Fetched after the bundle loads, then set on the element          |
| **Hydrated**   | The server        | Inline JSON blocks; the server responds once it has all the data |
| **Streamed**   | The server        | Inline JSON blocks; the server sends `<head>` first              |
| **Property**   | The server        | One page-level JSON blob, assigned by a script after `customElements.whenDefined` |
| **Late**       | The server        | The same blob, assigned by a script on `DOMContentLoaded`        |

On the calendar page, the fetched version is the component fetching for itself. On the results page, a small script on the page makes the two calls and assigns the results to the element.

Time until the data is on screen, median of 7 runs:

| Page                  | Visit        | Fetched | Hydrated | Streamed | Property | Late    | Saved |
| --------------------- | ------------ | ------: | -------: | -------: | -------: | ------: | ----: |
| Search results        | First visit  | 1,893ms |  1,590ms |  1,386ms |  1,400ms | 1,400ms |   27% |
| Search results        | Repeat visit |   764ms |    465ms |    420ms |    426ms |   428ms |   45% |
| Availability calendar | First visit  | 1,619ms |  1,457ms |  1,356ms |  1,364ms | 1,373ms |   16% |
| Availability calendar | Repeat visit |   463ms |    339ms |    295ms |    301ms |   306ms |   36% |

"Saved" compares streamed with fetched. Property and late are within 16 ms of streamed in every row. They're discussed in [Why not a script that sets the property?](#why-not-a-script-that-sets-the-property). A first visit has a cold cache. A repeat visit has the bundle cached. Repeat visits on the same scale (one block ≈ 40 ms):

```text
Search results
Fetched   ███████████████████  764 ms
Streamed  ██████████           420 ms  (-45%)

Availability calendar
Fetched   ████████████         463 ms
Streamed  ███████              295 ms  (-36%)
```

What the numbers say:

- **Savings scale with the waterfall.** The results page drops two requests in a row. The calendar drops one. Each request the browser no longer makes removes a full round trip.
- **Repeat visits gain the most.** With the bundle cached, the API calls are most of what's left.
- **The first visit is dominated by the bundle.** About 157 KB of gzipped JavaScript at 1.6 Mbps takes over a second in every mode. A smaller bundle helps there. Hydration can't.
- **Layout shift disappears.** The fetched results page shows a loading skeleton and then swaps in the cards, for a cumulative layout shift (CLS) of 0.97. Google rates anything over 0.25 as poor. The JSON versions measured 0 because they never show a loading state.
- **On a fast connection, it barely matters.** Without throttling, the versions were within 10–20 ms of each other. This is for mid-range phones and cellular networks.

## Multiple ways to hydrate the components

The key idea is not just the JSON block. It's making data a public input instead of something only the component can fetch.

| Property value  | Component behavior                                |
| --------------- | ------------------------------------------------- |
| `undefined`     | Nothing was supplied; fetch it                    |
| Any other value | Render it; don't fetch                            |
| `[]`            | Render the empty state; don't treat it as missing |

```js
const list = document.querySelector("search-results");

list.results = resultsFromMyApp; // Render supplied data, no request
list.results = []; // Render the empty state, no request
list.results = undefined; // Back to self-fetching
```

That gives each property three possible sources:

```text
Component fetch ───────┐
Script (property) ─────┼──→ element.results ──→ render
Inline JSON block ─────┘
```

All three feed the same property, so they go through the same rendering code and can't drift apart.

## A compact implementation

This is a sketch, not a complete component. `render()` and `fetchResults()` are left to you.

First, a function that reads direct-child JSON blocks for an allow-list of properties:

```js
function readJsonProperties(element, validators) {
  const blocks = element.querySelectorAll(
    ':scope > script[type="application/json"][data-prop]',
  );

  for (const block of blocks) {
    const property = block.dataset.prop;
    const validate = validators[property];

    // Skip unknown properties, and let values set by script win.
    if (!validate || element[property] !== undefined) continue;

    try {
      const value = JSON.parse(block.textContent);
      if (!validate(value)) throw new TypeError("Unexpected data shape");
      element[property] = value;
    } catch {
      // Name the property, but never log its (possibly sensitive) value.
      console.warn(`<${element.localName}> ignored invalid "${property}" data`);
    }
  }
}
```

Then a component that uses it before its first render:

```js
class SearchResults extends HTMLElement {
  static jsonProperties = { results: Array.isArray };

  #results;
  #initialized = false;
  #rendered = false;

  get results() {
    return this.#results;
  }

  set results(value) {
    this.#results = value;
    if (this.#rendered) this.render();
  }

  connectedCallback() {
    if (this.#initialized) return; // Moving the element must not restart this.
    this.#initialized = true;

    // 1. Take back values set before the element was defined.
    for (const name of Object.keys(SearchResults.jsonProperties)) {
      if (Object.hasOwn(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value;
      }
    }

    // 2. Read the JSON blocks, then render or fetch.
    const start = () => {
      readJsonProperties(this, SearchResults.jsonProperties);
      this.#rendered = true;
      if (this.results === undefined) this.fetchResults();
      else this.render();
    };

    // A classic script in <head> can upgrade the element before the parser
    // reaches its children. Wait for them. Modules and `defer` scripts
    // normally skip this branch.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  }
}

customElements.define("search-results", SearchResults);
```

The order matters:

```text
1. Restore properties set before upgrade
2. Read JSON only for properties that are still undefined
3. Fetch only if nothing was supplied
4. Render
```

If you use a rendering library, put these steps in its "before first render" hook, after it restores pre-upgrade properties.

## Why JSON blocks?

Structured data can travel through attributes, slots, or a page-level script. A JSON block fits better:

| Channel     | Use it for                | Why                                    |
| ----------- | ------------------------- | -------------------------------------- |
| Attributes  | IDs, dates, flags, counts | Fine for small scalar values           |
| Named slots | Prose people read         | Stays in the DOM for translation tools |
| JSON blocks | Lists and objects         | Matches the property's data shape      |

### Why not a big attribute?

A large JSON attribute needs every quote and ampersand entity-escaped, is hard to read, and fires `attributeChangedCallback` whenever it changes.

```html
<!-- Hard to write, read, and update safely -->
<search-results results='[{"id":"result-1"}, …]'></search-results>
```

A script block holds plain JSON of any size, with no escaping beyond the one rule in the guardrails below.

### Why not slotted elements?

Slots are the right place for prose, such as a "why this result matches" line. They're the wrong place for data the component computes with, because it has to parse that data back out of the DOM:

```text
API object → server-built elements → DOM tree → parsed back into an object
```

That's a second parser and a second contract. It costs more DOM work, shows as raw unstyled text before the element upgrades, and gets rewritten by browser translation. A JSON block skips all of it:

```text
API object → JSON.parse → public property
```

The rule we use: **if a person reads it, slot it. If the component computes with it, use a JSON block.**

### Why not a script that sets the property?

You could write all the data into one page-level blob and assign it once the element is defined:

```js
customElements.whenDefined("search-results").then(() => {
  document.querySelector("search-results").results = pageData.results;
});
```

For speed, this is a fair fight. In our tests it matched JSON blocks to within about 10 ms. The case for JSON blocks is everything around speed:

- **No glue code.** A block works anywhere you can write HTML: a CMS field, a template that only outputs strings, a static site generator.
- **The data stays with its element.** Three copies of a component on one page just work, with no IDs to match.
- **No timing to get right.** If glue runs on `DOMContentLoaded`, deferred scripts have already run, so the element has connected without data and started its own request. In our run, the calendar sent an API request it then threw away.
- **It works with a strict Content Security Policy.** A non-JavaScript script block never runs, so it needs no nonce or hash.

None of this rules out script. Because script wins over markup, a page can ship JSON blocks for the first render and update properties afterwards.

## Stream the page when possible

If the server waits for every API call before sending any HTML, the first byte is delayed, and the bundle download can't start:

```text
server API calls → send HTML → browser downloads bundle → render
```

Instead, flush `<head>` first, then fetch, then send the body:

```text
send <head> ──→ browser downloads bundle ──────────┐
    └─ server API calls ──→ send body + JSON ──────┴──→ render
```

This overlaps the bundle download with the server's data fetch, which is why "streamed" was the fastest version on every page in the table above. Two requirements:

- The `<script type="module">` (or `defer`) tag for your bundle must be in the flushed `<head>`.
- Proxies and CDNs that buffer responses can defeat streaming, so check that your head actually arrives early.

## JSON blocks vs. SSR

Inline JSON and SSR with declarative shadow DOM (server-rendered shadow roots sent in the HTML) fix different parts of the loading path:

| Approach              | Where data is fetched | When content first paints |
| --------------------- | --------------------- | ------------------------- |
| Component fetches     | In the browser        | After JavaScript + API    |
| Inline JSON blocks    | On the server         | After JavaScript          |
| SSR + declarative DOM | On the server         | With the HTML             |

**JSON blocks are a strong default when:**

- other teams or customers embed your components
- the host server isn't running JavaScript
- content comes from a CMS or static site generator
- a sandboxed host has the data but can't hold a credential (like an MCP App)
- you want server-side caching without server-side rendering

**SSR can win when:**

- you control the server and its rendering runtime
- every component and dependency can render without `window` or `document`
- you can keep cached server markup compatible with new client bundles

They also aren't rivals. Hydrating an SSR component means rendering again with the same inputs, so the data has to be in the page either way. The property contract above is what SSR would need anyway.

## Guardrails

Data in HTML is still input. Treat it that way:

1. **Allow-list properties.** Markup shouldn't be able to set anything the component didn't offer.
2. **Validate the parsed shape.** Skip an object where an array is expected.
3. **Read direct children only.** A block inside a nested component belongs to that component.
4. **Let script win.** A block only fills a property that is still `undefined`.
5. **Escape `<` on the server.** Replace it with its Unicode escape so data containing `</script>` can't end the block early (see the serializer below).
6. **Never log the data.** Warnings name the element and property, not the content.
7. **Keep sensitive data out of markup.** HTML ends up in caches, saved pages, and screenshots. Components that handle personal or account data should never read JSON blocks.
8. **Validate URLs before rendering links.** Supplied data is untrusted.

A safe server-side serializer:

```js
function serializeForJsonBlock(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
```

## Keep supplied mode interactive

Initial data is only half the contract. When the user asks for another page, week, or filter, a component in supplied mode (one whose data came from the host) shouldn't silently fall back to fetching. It should emit an event and let the host answer:

```text
User picks page 2
       ↓
<search-results> emits "results-request" with the full criteria
       ↓
Host fetches page 2 (from its backend, an SPA data layer, and so on)
       ↓
host sets element.results = page2
```

While the host works, it can set a `loading` property. The component shows and announces its loading state without starting a request of its own. This is the same "properties in, events out" model for SPAs, server-rendered pages, and sandboxed embeds alike.

## The takeaway

A custom element should be able to fetch its own data. It shouldn't be the only thing that can supply it.

By accepting the same value from a property or an inert JSON block, a component can skip client-side request waterfalls, avoid putting a credential in the browser, eliminate loading-state layout shift, and work with almost any backend.

It's not the same as SSRing your components, but what you do get is a portable, low-complexity speedup, and a data contract you can reuse if you add SSR later.
