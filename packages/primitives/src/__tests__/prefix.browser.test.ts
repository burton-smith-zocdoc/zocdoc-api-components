import { describe, expect, it } from 'vitest';
import { CharmElement, project, ZdButton } from '../index.js';

/**
 * These tests guard the one failure mode that cannot be repaired at runtime:
 * a Charm primitive registering under the default `ch-` prefix.
 *
 * Registration happens inside CharmScope.registerComponent(), which reads the
 * prefix at call time and immediately calls customElements.define(). Custom
 * elements cannot be unregistered, so a single early registration permanently
 * poisons that tag.
 */
describe('charm prefix configuration', () => {
  it('applies the zd prefix to the project', () => {
    expect(project.getProject().prefix).toBe('zd');
    expect(project.getProject().tokenPrefix).toBe('zd');
  });

  it('registers a primitive under zd when its module is imported', () => {
    // Every zd-* module ends in a registerComponent() call, so importing the
    // barrel above is what defines the tag.
    const registered = customElements.get('zd-button');

    expect(registered).toBeDefined();
    expect(registered?.prototype).toBeInstanceOf(ZdButton);
  });

  it('registers a primitive declared via dependencies() when the host is constructed', () => {
    // This is the mechanism every zd-* component relies on for its children.
    // The dependency is referenced as a class, so nothing registers at import
    // time; the CharmElement constructor registers it, long after the prefix is
    // set. A locally-declared pair is used rather than a real primitive because
    // importing the barrel has already registered all of those.
    class LazyDependency extends CharmElement {
      public static override baseName = 'lazy-dependency';
    }

    class DependencyHost extends CharmElement {
      public static override baseName = 'dependency-host';

      public static override get dependencies(): (typeof CharmElement)[] {
        return [LazyDependency];
      }
    }

    project.scope.registerComponent(DependencyHost);
    expect(customElements.get('zd-lazy-dependency')).toBeUndefined();

    document.createElement('zd-dependency-host');

    expect(customElements.get('zd-lazy-dependency')).toBeDefined();
  });

  it('never registers anything under the default ch prefix', () => {
    // A ch-* registration means a component module was evaluated before
    // configure.ts ran. This cannot be repaired at runtime.
    expect(customElements.get('ch-button')).toBeUndefined();
    expect(customElements.get('ch-input')).toBeUndefined();
    expect(customElements.get('ch-lazy-dependency')).toBeUndefined();
    expect(customElements.get('ch-dependency-host')).toBeUndefined();
  });
});
