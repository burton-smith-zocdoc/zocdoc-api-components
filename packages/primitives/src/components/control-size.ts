/**
 * The two control densities the Zocdoc design system defines.
 *
 * Charm's components have no size prop - they take their metrics from flat
 * `--zd-<component>-*` custom properties. The Zocdoc subclasses add `size` and
 * implement it by re-pointing those properties at the theme's `small` token
 * group, so `size="default"` and an omitted `size` are the same thing.
 */
export type ZdControlSize = 'default' | 'small';
