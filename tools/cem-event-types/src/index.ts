import { type FileContext, type Plugin } from '@wc-toolkit/cem-generator';
import ts from 'typescript';

/** Typed by `TypedEventTarget<EventMap>` on every component with a map; the methods are inherited. */
const TYPED_LISTENERS = new Set(['addEventListener', 'removeEventListener']);

/** An event map read off one class: event name → its declared type, as written in source. */
type EventTypes = Map<string, string>;

/** The detail type of `CustomEvent<Detail>`, when it is a bare name a generator must import. */
function namedDetail(type: string): string | undefined {
  return /^CustomEvent<([A-Z][\w$]*)>$/.exec(type)?.[1];
}

/**
 * The event map a class narrows `emit` to — `declare protected emit: TypedEmit<ZdXEventMap>` —
 * with each entry's type kept as source text, so a payload reads as `CustomEvent<BookingCompleteDetail>`
 * rather than the expanded structure the checker would print.
 */
function readEventMap(node: ts.ClassDeclaration, checker: ts.TypeChecker): EventTypes | undefined {
  for (const member of node.members) {
    if (!ts.isPropertyDeclaration(member) || member.name.getText() !== 'emit') continue;
    const annotation = member.type;
    if (!annotation || !ts.isTypeReferenceNode(annotation)) continue;
    if (annotation.typeName.getText() !== 'TypedEmit' || annotation.typeArguments?.length !== 1) {
      continue;
    }
    const events: EventTypes = new Map();
    for (const property of checker
      .getTypeFromTypeNode(annotation.typeArguments[0])
      .getProperties()) {
      const declaration = property.valueDeclaration;
      if (declaration && ts.isPropertySignature(declaration) && declaration.type) {
        events.set(property.name, declaration.type.getText().replace(/\s+/g, ' '));
      }
    }
    return events;
  }
  return undefined;
}

/** Names the module exports, which is where the framework generators import detail types from. */
function moduleExports(context: FileContext): Set<string> {
  const symbol = context.checker.getSymbolAtLocation(context.sourceFile);
  return new Set(symbol ? context.checker.getExportsOfModule(symbol).map((s) => s.name) : []);
}

/**
 * Types each event in the manifest from the component's own event map.
 *
 * `@event` JSDoc gives the analyzer a name and a description but no type, so every event lands as
 * `Event`, and every generated framework type — React `onBookingComplete`, the JSX, Vue, and Svelte
 * handler props — loses its payload. The payloads are already declared once, in the `*EventMap`
 * each component narrows `emit` to and compiles its emissions against. Reading them from there,
 * rather than repeating them as `{Type}` in JSDoc, leaves one declaration to keep up to date.
 *
 * Also drops the `addEventListener`/`removeEventListener` overrides those components declare.
 *
 * Fails the build when an event map names an event the manifest doesn't document, or a detail type
 * the component's module doesn't export (the generated `.d.ts` imports it from that module).
 */
export function eventTypesPlugin(): Plugin {
  // Collected while files are analyzed and applied once the manifest exists. Keyed by class name,
  // which is unique within a package.
  const byClass = new Map<string, EventTypes>();

  return {
    name: 'zd-event-types',
    onFile(context): Record<string, never> {
      let exported: Set<string> | undefined;
      for (const statement of context.sourceFile.statements) {
        if (!ts.isClassDeclaration(statement) || !statement.name) continue;
        const events = readEventMap(statement, context.checker);
        if (!events) continue;
        exported ??= moduleExports(context);
        for (const [event, type] of events) {
          const detail = namedDetail(type);
          if (detail && !exported.has(detail)) {
            throw new Error(
              `cem-event-types: ${statement.name.text} '${event}' carries ${detail}, which ` +
                `${context.filePath} does not export; re-export it so generated types can import it`
            );
          }
        }
        byClass.set(statement.name.text, events);
      }
      // Nothing to add during detection: the events only exist once JSDoc has been merged in.
      return {};
    },
    afterGenerate(manifest): void {
      for (const module of manifest.modules) {
        for (const declaration of module.declarations ?? []) {
          const events = byClass.get(declaration.name);
          if (!events || !('events' in declaration)) continue;
          const documented = new Map((declaration.events ?? []).map((e) => [e.name, e]));
          for (const [name, text] of events) {
            const event = documented.get(name);
            if (!event) {
              throw new Error(
                `cem-event-types: ${declaration.name} emits '${name}' but has no @event tag for it`
              );
            }
            event.type = { text };
          }
          // The `declare` overrides that put the map on addEventListener are typing, not API: left
          // in, they read as properties and the framework generators offer them as settable props.
          if ('members' in declaration && declaration.members) {
            declaration.members = declaration.members.filter(
              (member) => !TYPED_LISTENERS.has(member.name)
            );
          }
        }
      }
    },
  };
}
