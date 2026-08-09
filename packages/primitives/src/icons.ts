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
export const zocdocIcons: Record<string, string> = {
  'chevron-left': `<svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M10.35 3.15a.5.5 0 0 1 0 .7L6.21 8l4.14 4.15a.5.5 0 0 1-.7.7l-4.5-4.5a.5.5 0 0 1 0-.7l4.5-4.5a.5.5 0 0 1 .7 0Z" fill="currentColor"></path></svg>`,
  'info-circle': `<svg height="16" viewBox="0 0 12 12" fill="none"><path fill-rule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1Zm0 2a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5ZM5.5 6a.5.5 0 0 1 1 0v2.1a.5.5 0 0 1-1 0V6Z" fill="currentColor"/></svg>`,
  'location-pin': `<svg height="16" viewBox="0 0 12 20" fill="none"><title>location pin icon</title><path d="M5.833 1.667A5.83 5.83 0 0 0 0 7.5c0 4.375 5.833 10.833 5.833 10.833s5.834-6.458 5.834-10.833a5.83 5.83 0 0 0-5.834-5.833Zm0 7.916a2.084 2.084 0 1 1 .002-4.168 2.084 2.084 0 0 1-.002 4.168Z" fill="currentColor"></path></svg>`,
  'search': `<svg height="16" viewBox="0 0 38 40" fill="none"><path d="M37.6,36L26.8,24.7c2.2-2.6,3.6-6,3.6-9.7c0-8.3-6.7-15-15-15s-15,6.7-15,15c0,8.3,6.7,15,15,15c2.5,0,4.8-0.6,6.8-1.7L33.4,40L37.6,36z M4.1,15c0-6.2,5.1-11.3,11.3-11.3S26.7,8.7,26.7,15s-5.1,11.3-11.3,11.3S4.1,21.2,4.1,15z" fill="currentColor"></path></svg>`,
  'insurance-accepted': `<svg height="16" viewBox="0 0 15 20" fill="none"><path d="M7.5.833 0 4.167v5c0 4.625 3.2 8.95 7.5 10 4.3-1.05 7.5-5.375 7.5-10v-5L7.5.833ZM5.833 14.167 2.5 10.833l1.175-1.175 2.158 2.15 5.492-5.491L12.5 7.5l-6.667 6.667Z" fill="currentColor"></path></svg>`,
  'insurance-add': `<svg height="16" viewBox="0 0 15 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.167 7.5.833 15 4.167v5c0 4.625-3.2 8.95-7.5 10-4.3-1.05-7.5-5.375-7.5-10v-5Zm8.333 1.666v3.334h3.334v1.666H8.333v3.334H6.667v-3.334H3.333V9.167h3.334V5.833h1.666Z" fill="currentColor"></path></svg>`,
  'star': `<svg height="16" viewBox="0 0 17 20" fill="none"><path d="m8.333 15.343 4.042 2.43c.74.445 1.646-.213 1.45-1.045l-1.07-4.57 3.574-3.078c.652-.562.302-1.626-.555-1.694l-4.704-.397L9.23 2.67c-.332-.784-1.462-.784-1.793 0L5.597 6.98l-4.704.397C.036 7.444-.315 8.51.338 9.07l3.574 3.079-1.071 4.569c-.195.832.71 1.49 1.45 1.045l4.042-2.42Z" fill="currentColor"></path></svg>`,
  'stethoscope': `<svg height="16" viewBox="0 0 17 18" fill="none"><path d="M14.167 5.667A.82.82 0 0 1 15 6.5a.833.833 0 0 1-.833.834.825.825 0 0 1-.834-.834c0-.475.359-.833.834-.833ZM0 .667v7.5a4.98 4.98 0 0 0 4.283 4.925c.517 2.508 2.734 4.242 5.3 4.242A5.415 5.415 0 0 0 15 11.917V8.842c.967-.35 1.667-1.267 1.667-2.342a2.5 2.5 0 1 0-5 0c0 1.075.7 2 1.666 2.342v3a3.734 3.734 0 0 1-3.75 3.75c-1.666 0-3.066-1.008-3.566-2.508C8.333 12.584 10 10.5 10 8.167v-7.5H6.667v2.5h1.666v5a3.333 3.333 0 1 1-6.666 0v-5h1.666v-2.5H0Z" fill="currentColor"></path></svg>`,
};
