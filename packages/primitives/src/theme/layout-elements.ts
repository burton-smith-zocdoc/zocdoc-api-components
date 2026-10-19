type SpacingTokens = Readonly<Record<string, string>>;

const gridColumnCounts = [1, 2, 3, 4, 6, 12];
const autoColumnModes = ['auto-fill', 'auto-fit'];
const defaultMinColumnSize = '12rem';
const gridLines = Array.from({ length: 12 }, (_, index) => index + 1);

const flexAlign = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const flexJustify = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};
const gridAlign = { start: 'start', center: 'center', end: 'end', stretch: 'stretch' };

function attrRules(attr: string, values: Iterable<readonly [string | number, string]>): string {
  return Array.from(
    values,
    ([value, declarations]) => `  &:where([${attr}="${value}"]) {
    ${declarations}
  }`
  ).join('\n');
}

function mapRules(
  attr: string,
  property: string,
  values: Readonly<Record<string, string>>
): string {
  return attrRules(
    attr,
    Object.entries(values).map(([value, cssValue]) => [value, `${property}: ${cssValue};`] as const)
  );
}

// Sets `gap` itself rather than `--zd-*-gap`, so an attribute value is not inherited by nested layouts.
function gapRules(spacingTokens: SpacingTokens): string {
  return attrRules(
    'gap',
    Object.entries(spacingTokens)
      .filter(([key]) => /^\d+$/.test(key))
      .map(([key, value]) => [key, `gap: var(--zd-spacing-${key}, ${value});`] as const)
  );
}

function autoColumnRules(): string {
  return attrRules(
    'columns',
    autoColumnModes.map(
      (mode) =>
        [
          mode,
          `grid-template-columns: repeat(${mode}, minmax(min(var(--zd-grid-min-column-size, ${defaultMinColumnSize}), 100%), 1fr));`,
        ] as const
    )
  );
}

function lineRules(attr: string, declaration: (line: number) => string): string {
  return attrRules(
    attr,
    gridLines.map((line) => [line, declaration(line)] as const)
  );
}

export function generateLayoutElementsCss(spacingTokens: SpacingTokens): string {
  const gapType = Object.keys(spacingTokens)
    .filter((key) => /^\d+$/.test(key))
    .join(' | ');

  return `/**
 * A one-dimensional flex layout container.
 * @attr {row | column} direction - Selects the main-axis direction.
 * @attr {${gapType}} gap - Sets the gap using a numeric Zocdoc spacing token.
 * @attr {start | center | end | stretch | baseline} align - Aligns items on the cross axis.
 * @attr {start | center | end | between | around | evenly} justify - Distributes items on the main axis.
 * @attr {boolean} wrap - Allows items to wrap onto another line.
 * @attr {boolean} inline - Renders as an inline-level flex container.
 * @cssprop [--zd-flex-gap=var(--zd-spacing-16)] - Sets the gap when no gap attribute is present. Inherits, so it can be set on an ancestor.
 */
:where(zd-flex, .zd-flex) {
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: var(--zd-flex-gap, var(--zd-spacing-16, ${spacingTokens['16']}));

  &:where([inline]) {
    display: inline-flex;
  }

  &:where([direction="column"]) {
    flex-direction: column;
  }

  &:where([wrap]) {
    flex-wrap: wrap;
  }

${mapRules('align', 'align-items', flexAlign)}

${mapRules('justify', 'justify-content', flexJustify)}

${gapRules(spacingTokens)}
}

/**
 * A two-dimensional grid layout container.
 * @attr {1 | 2 | 3 | 4 | 6 | 12 | auto-fill | auto-fit} columns - Creates equal-width column tracks, or as many as fit at the minimum column size.
 * @attr {${gapType}} gap - Sets the gap using a numeric Zocdoc spacing token.
 * @attr {start | center | end | stretch} align - Aligns items in their block-axis grid area.
 * @attr {start | center | end | stretch} justify - Aligns items in their inline-axis grid area.
 * @attr {boolean} inline - Renders as an inline-level grid container.
 * @cssprop [--zd-grid-gap=var(--zd-spacing-16)] - Sets the gap when no gap attribute is present. Inherits, so it can be set on an ancestor.
 * @cssprop [--zd-grid-min-column-size=${defaultMinColumnSize}] - Sets the minimum track size for auto-fill and auto-fit columns. Inherits, so it can be set on an ancestor.
 */
:where(zd-grid, .zd-grid) {
  display: grid;
  box-sizing: border-box;
  gap: var(--zd-grid-gap, var(--zd-spacing-16, ${spacingTokens['16']}));

  &:where([inline]) {
    display: inline-grid;
  }

${attrRules(
  'columns',
  gridColumnCounts.map(
    (count) => [count, `grid-template-columns: repeat(${count}, minmax(0, 1fr));`] as const
  )
)}

${autoColumnRules()}

${mapRules('align', 'align-items', gridAlign)}

${mapRules('justify', 'justify-items', gridAlign)}

${gapRules(spacingTokens)}
}

/**
 * A grid child that places its content within a zd-grid.
 * @attr {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12} column - Sets the starting column line.
 * @attr {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12} row - Sets the starting row line.
 * @attr {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12} span - Sets how many columns to span.
 */
:where(zd-column, .zd-column) {
  display: block;
  min-inline-size: 0;

${lineRules('column', (line) => `grid-column-start: ${line};`)}

${lineRules('row', (line) => `grid-row-start: ${line};`)}

${lineRules('span', (line) => `grid-column-end: span ${line};`)}
}
`;
}
