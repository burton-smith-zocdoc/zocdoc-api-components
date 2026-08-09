/**
 * The slice of the Custom Elements Manifest schema this generator reads, plus the shapes
 * `@wc-toolkit` plugins add to it (`parsedType`, `modulePath`, `inheritedFrom`).
 *
 * `Component` keeps an index signature on purpose: a custom `@jsdoc` tag or another plugin
 * may have attached anything, and a custom `render` must be able to reach it. That is the
 * extension point — customization reads richer data off the component rather than adding
 * more hooks.
 */

export interface TypeRef {
  text: string;
}

/** Anything carrying a type the literal-union rule can be applied to. */
export interface Typed {
  type?: TypeRef;
  parsedType?: TypeRef;
}

export interface InheritedFrom {
  name: string;
  module?: string;
  package?: string;
}

export interface Named {
  name: string;
  description?: string;
  inheritedFrom?: InheritedFrom;
}

export interface Attribute extends Named, Typed {
  default?: string;
  fieldName?: string;
}

export interface Parameter extends Typed {
  name: string;
  optional?: boolean;
  description?: string;
}

export interface Member extends Named, Typed {
  kind: 'field' | 'method';
  privacy?: 'public' | 'private' | 'protected';
  static?: boolean;
  readonly?: boolean;
  default?: string;
  parameters?: Parameter[];
  return?: { type?: TypeRef };
}

export interface EventDoc extends Named, Typed {}

export interface CssProperty extends Named {
  syntax?: string;
  default?: string;
}

export interface Component {
  kind: string;
  name: string;
  tagName?: string;
  customElement?: boolean;
  description?: string;
  summary?: string;
  modulePath?: string;
  superclass?: { name: string; package?: string; module?: string };
  attributes?: Attribute[];
  members?: Member[];
  events?: EventDoc[];
  slots?: Named[];
  cssParts?: Named[];
  cssStates?: Named[];
  cssProperties?: CssProperty[];
  [key: string]: unknown;
}

export interface Module {
  kind: string;
  path: string;
  declarations?: Component[];
}

export interface Package {
  schemaVersion: string;
  modules: Module[];
}

/** One logical prop — the attribute and the property collapsed into a single row. */
export interface PropRow {
  attribute?: string;
  property?: string;
  type: string;
  default?: string;
  description?: string;
  readonly?: boolean;
  inheritedFrom?: string;
}

export interface MethodRow {
  name: string;
  signature: string;
  description?: string;
  inheritedFrom?: string;
}

export interface EventRow {
  name: string;
  type: string;
  description?: string;
  inheritedFrom?: string;
}

export interface SlotRow {
  name: string;
  description?: string;
  inheritedFrom?: string;
}

export interface CssPropRow {
  name: string;
  syntax?: string;
  default?: string;
  description?: string;
  inheritedFrom?: string;
}

export interface ApiGroups {
  props: PropRow[];
  methods: MethodRow[];
  events: EventRow[];
  slots: SlotRow[];
  cssParts: SlotRow[];
  cssStates: SlotRow[];
  cssProperties: CssPropRow[];
}

export interface NormalizedApi {
  own: ApiGroups;
  inherited: ApiGroups;
}

export interface AgentDocsConfig {
  /** Package name, used in generated import examples. */
  packageName: string;
  /** Where generated markdown goes, resolved relative to the analyzer's working directory. */
  outDir: string;
  /** Decide which components get a page. Default: every component with a tagName. */
  filter?: (component: Component) => boolean;
  /** Produce the files for one component. Default: the built-in renderer. */
  render?: (component: Component, ctx: RenderContext) => RenderResult | null;
}

export interface RenderContext {
  /** The resolved config for this package. */
  config: AgentDocsConfig;
  /** Normalized, deduped, private-filtered API groups. */
  api: NormalizedApi;
  /** Apply the literal-union rule to any typed member. */
  resolveType: (typed: Typed) => string;
  /** Every component in this package, for cross-links and the index. */
  siblings: Component[];
  /** Full manifest. Escape hatch for anything the above doesn't cover. */
  manifest: Package;
}

export interface RenderResult {
  /** Written to <outDir>/<tag>.md */
  api: string;
  /** Written to <outDir>/<tag>.styling.md — omit if there is no styling surface. */
  styling?: string;
}
