/**
 * Icons Zocdoc adds to Charm's set, merged in by `configure.ts`.
 *
 * Charm ships `error-circle`, `warning`, and `checkmark-circle` but no
 * informational glyph, which leaves `<zd-alert variant="info">` as the one
 * severity with nothing to draw. `question` is the nearest thing in Charm's set
 * and means "help", not "here is something you should know".
 *
 * Merging happens in `configure.ts` rather than here or in `icon.ts`, because
 * `project.updateProject()` *replaces* its configuration rather than merging it:
 * a second call would drop the `zd` prefix and reset the component scope. There
 * is one call, so there is one place to add icons.
 */

/**
 * A circled lowercase "i", matching the family `error-circle` and
 * `checkmark-circle` belong to: a 12x12 box, a 5-unit radius disc, and the glyph
 * punched out of it. The dot and stem are `error-circle`'s, mirrored about the
 * disc's centre line, so an info alert and an error alert read at the same weight
 * side by side.
 *
 * The punch-out is `fill-rule="evenodd"` rather than Charm's reversed winding, so
 * the counters stay holes no matter which direction the subpaths are drawn.
 */
const infoCircle = `<svg class="info" fill="currentColor" aria-hidden="true" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1Zm0 2a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5ZM5.5 6a.5.5 0 0 1 1 0v2.1a.5.5 0 0 1-1 0V6Z"/></svg>`;

export const zocdocIcons: Record<string, string> = {
  'info-circle': infoCircle,
};
