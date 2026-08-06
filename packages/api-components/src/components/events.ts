/**
 * Event typing for every component in this package: the payload each event carries, and the
 * machinery that puts those payloads on `addEventListener` and on `emit`.
 *
 * A host page composing components by hand reads properties out of `event.detail`, and until these
 * types existed it had to describe those payloads itself — a hand-copied interface that typechecks
 * against nothing and goes quietly stale the first time a component adds a field. Each component
 * now declares its own event map beside it and exports the detail types through the barrel, so the
 * shapes below are the ones the components are compiled against.
 *
 * The two shapes here are the ones more than one component emits. Everything specific to a single
 * component lives next to it.
 */

/** The payload of a `CustomEvent`, for reading a detail type back out of an event map. */
export type DetailOf<E> = E extends CustomEvent<infer D> ? D : never;

/**
 * A fetch failed. The `error` is the client's own, and is **developer-facing**: its message can
 * quote the values the request was built from, so it belongs in a host page's error handling and
 * never on screen (CLIENT-003, PHI-001). Components render their own wording for the patient.
 */
export interface ErrorDetail {
  error: unknown;
}

/**
 * The dates a component just moved itself onto, both inclusive.
 *
 * Emitted rather than fetched because neither the grid nor the results list is told the visit
 * reason, so neither can refetch what it has just decided to show. The host answers with new
 * availability for the window it is handed.
 */
export interface AvailabilityWindowDetail {
  startDate: string;
  endDate: string;
}

/**
 * Types `addEventListener` and `removeEventListener` for a component's own events, so
 * `event.detail` is the right shape without a cast at the call site.
 *
 * Declared on the class as a field — `declare addEventListener: TypedEventTarget<Map>['addEven…']`
 * — rather than merged in as an interface, which TypeScript rejects for conflicting with
 * `HTMLElement`'s own signature.
 *
 * The standard-event and bare-string overloads are both kept: the first so `'click'` still hands
 * back a `MouseEvent`, the second so listening for an event this package does not define stays
 * legal. A host page may well listen for one of Charm's.
 */
export interface TypedEventTarget<EventMap> {
  addEventListener<K extends keyof EventMap & string>(
    type: K,
    listener: (event: EventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof EventMap & string>(
    type: K,
    listener: (event: EventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/**
 * `CharmElement.emit` narrowed to a component's own event map, which is what keeps a map honest:
 * an emission whose detail does not match, or whose name is not in the map, stops compiling.
 *
 * `detail` is required even where it is empty, because the alternative is making it optional for
 * every event and losing the check on the ones that carry something.
 */
export interface TypedEmit<EventMap> {
  <K extends keyof EventMap & string>(
    name: K,
    options: { detail: DetailOf<EventMap[K]> } & Omit<CustomEventInit, 'detail'>
  ): CustomEvent;
}
