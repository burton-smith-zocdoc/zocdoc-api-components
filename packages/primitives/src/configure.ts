/**
 * Side effects only. This module MUST NOT import any Charm component module.
 *
 * Charm's CharmScope.registerComponent() computes the tag name from the current
 * prefix and immediately calls customElements.define(). Custom elements cannot
 * be unregistered, and project.updateProject() does not re-register components
 * that are already defined. So the prefix must be set before any component
 * module is evaluated.
 *
 * Importing '@charm-ux/core' is safe here: its root entry exports only base,
 * controller, internal, theme, and utilities — no components. `./icons.js` is a
 * plain map of SVG strings, so it is safe for the same reason.
 *
 * This must stay the only `updateProject()` call. It replaces the project
 * configuration rather than merging into it, so a second call elsewhere — to add
 * icons, say — would drop the prefix set here and reset the component scope.
 */
import { project } from '@charm-ux/core';
import { zocdocIcons } from './icons.js';
import { tokenPrefix } from './theme/prefix.js';

project.updateProject({ prefix: 'zd', tokenPrefix, icons: { ...project.iconSet, ...zocdocIcons } });
