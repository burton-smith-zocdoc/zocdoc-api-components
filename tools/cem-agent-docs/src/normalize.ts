import { resolveType } from './resolve-type.ts';
import type {
  ApiGroups,
  Attribute,
  Component,
  CssPropRow,
  EventRow,
  Member,
  MethodRow,
  Named,
  NormalizedApi,
  PropRow,
  SlotRow,
} from './types.ts';

/**
 * Static members, privates, and underscore-prefixed backing fields are implementation.
 * `ZdAlert._politeness` and `ZdTooltip._placement` are public-by-privacy but private by
 * convention, so the name check is not redundant with the privacy check.
 */
export function isPublicMember(member: Member): boolean {
  if (member.static) return false;
  if (member.privacy === 'private' || member.privacy === 'protected') return false;
  return !member.name.startsWith('_');
}

function emptyGroups(): ApiGroups {
  return {
    props: [],
    methods: [],
    events: [],
    slots: [],
    cssParts: [],
    cssStates: [],
    cssProperties: [],
  };
}

function originOf(item: { inheritedFrom?: { name: string } }): string | undefined {
  return item.inheritedFrom?.name;
}

function methodSignature(member: Member): string {
  const params = (member.parameters ?? [])
    .map((param) => `${param.name}${param.optional ? '?' : ''}: ${resolveType(param)}`)
    .join(', ');
  const returns = member.return?.type?.text ?? 'void';
  return `${member.name}(${params}): ${returns}`;
}

/**
 * Every reflected prop appears twice in the manifest — once in `attributes`, once in
 * `members`. Emit one row per logical prop, preferring the attribute's documentation and
 * falling back to the field's, so a prop documented on only one side still reads.
 */
function propRows(component: Component): PropRow[] {
  const fields = new Map<string, Member>();
  for (const member of component.members ?? []) {
    if (member.kind === 'field' && isPublicMember(member)) fields.set(member.name, member);
  }

  const rows: PropRow[] = [];
  const claimed = new Set<string>();

  for (const attribute of component.attributes ?? []) {
    if (attribute.name.startsWith('_')) continue;
    const fieldName = attribute.fieldName ?? attribute.name;
    const field = fields.get(fieldName);
    if (field) claimed.add(fieldName);

    rows.push({
      attribute: attribute.name,
      property: field ? fieldName : undefined,
      type: resolveType(hasType(attribute) ? attribute : (field ?? attribute)),
      default: attribute.default ?? field?.default,
      description: attribute.description ?? field?.description,
      readonly: field?.readonly ?? false,
      inheritedFrom: originOf(attribute) ?? (field ? originOf(field) : undefined),
    });
  }

  for (const [name, field] of fields) {
    if (claimed.has(name)) continue;
    rows.push({
      property: name,
      type: resolveType(field),
      default: field.default,
      description: field.description,
      readonly: field.readonly ?? false,
      inheritedFrom: originOf(field),
    });
  }

  return rows;
}

function hasType(attribute: Attribute): boolean {
  return Boolean(attribute.type?.text);
}

function slotRows(items: Named[] | undefined): SlotRow[] {
  return (items ?? []).map((item) => ({
    name: item.name,
    description: item.description,
    inheritedFrom: originOf(item),
  }));
}

/**
 * Split every group into own and inherited. Inherited API is kept — an agent does need to
 * know `zd-button` takes `disabled` even though `CoreButton` declares it, and across this
 * repo inherited public members outnumber own ones roughly four to one.
 */
export function normalizeApi(component: Component): NormalizedApi {
  const own = emptyGroups();
  const inherited = emptyGroups();

  const place = <T extends { inheritedFrom?: string }>(
    row: T,
    pick: (groups: ApiGroups) => T[]
  ): void => {
    pick(row.inheritedFrom ? inherited : own).push(row);
  };

  for (const row of propRows(component)) place(row, (groups) => groups.props);

  for (const member of component.members ?? []) {
    if (member.kind !== 'method' || !isPublicMember(member)) continue;
    const row: MethodRow = {
      name: member.name,
      signature: methodSignature(member),
      description: member.description,
      inheritedFrom: originOf(member),
    };
    place(row, (groups) => groups.methods);
  }

  for (const event of component.events ?? []) {
    const row: EventRow = {
      name: event.name,
      type: resolveType(event),
      description: event.description,
      inheritedFrom: originOf(event),
    };
    place(row, (groups) => groups.events);
  }

  for (const row of slotRows(component.slots)) place(row, (groups) => groups.slots);
  for (const row of slotRows(component.cssParts)) place(row, (groups) => groups.cssParts);
  for (const row of slotRows(component.cssStates)) place(row, (groups) => groups.cssStates);

  for (const property of component.cssProperties ?? []) {
    const row: CssPropRow = {
      name: property.name,
      syntax: property.syntax,
      default: property.default,
      description: property.description,
      inheritedFrom: originOf(property),
    };
    place(row, (groups) => groups.cssProperties);
  }

  return { own, inherited };
}
