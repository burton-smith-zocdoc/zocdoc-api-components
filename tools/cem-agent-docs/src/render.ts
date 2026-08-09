import { renderComponentApi } from './render-component.ts';
import { renderComponentStyling } from './render-styling.ts';
import type { Component, RenderContext, RenderResult } from './types.ts';

/**
 * The built-in renderer. A package that needs a different shape supplies its own `render`,
 * which can call these two functions and post-process, or ignore them entirely.
 */
export function defaultRender(component: Component, ctx: RenderContext): RenderResult {
  const styling = renderComponentStyling(component, ctx);
  return styling === null
    ? { api: renderComponentApi(component, ctx) }
    : { api: renderComponentApi(component, ctx), styling };
}
