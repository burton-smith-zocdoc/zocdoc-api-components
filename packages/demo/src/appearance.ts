/**
 * The demo pages' light/dark switch.
 *
 * **Every colour in the theme is a `light-dark()` pair under `color-scheme: light dark` on
 * `:root`, so switching is one property.** Pinning `color-scheme` on the document element flips
 * each token to its other half, inherits through every shadow boundary, and paints the page itself
 * because the reset takes `body`'s colours from `--zd-body-*` — no second stylesheet, no class on a
 * wrapper, nothing for a component to opt into. That is the part worth demonstrating: a host page
 * gets dark mode from the theme, not from us.
 *
 * Until someone moves the switch the page follows the operating system, including when that
 * changes mid-session. Moving it is a deliberate override, and from then on this page keeps the
 * chosen scheme — stored so a reload during development does not throw it away.
 */
import type { ZdSwitch } from '@powered-by-zocdoc/primitives';

/** Where the override lives. Namespaced because a demo shares an origin with whatever else runs on it. */
const STORAGE_KEY = 'zd-demo-appearance';

type Scheme = 'light' | 'dark';

const OS_PREFERS_DARK = '(prefers-color-scheme: dark)';

/**
 * The stored override, if there is one.
 *
 * Wrapped because `localStorage` throws rather than returning null when storage is denied — Safari
 * in private browsing, an embedded webview, a locked-down profile. A demo page that cannot remember
 * a colour scheme should still render one.
 */
function storedScheme(): Scheme | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : undefined;
  } catch {
    return undefined;
  }
}

function storeScheme(scheme: Scheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    /* Ignored for the same reason: the page works without it. */
  }
}

/**
 * Wires up the appearance switch.
 *
 * The element is in the markup rather than created here, like the mode banner, so the page's
 * structure is readable without running it. Checked means dark, which is the way round the label
 * reads — the switch is "dark mode", on or off, rather than a two-way choice between two names.
 */
export function renderAppearanceToggle(): void {
  const control = document.querySelector<ZdSwitch>('#appearance');
  if (!control) return;

  const os = globalThis.matchMedia(OS_PREFERS_DARK);
  const overridden = storedScheme() !== undefined;

  const apply = (scheme: Scheme): void => {
    document.documentElement.style.colorScheme = scheme;
    control.checked = scheme === 'dark';
  };

  apply(storedScheme() ?? (os.matches ? 'dark' : 'light'));

  /*
   * A page that has not been overridden keeps following the OS while it is open, which is the
   * behaviour `color-scheme: light dark` would have given it had this switch never pinned anything.
   */
  if (!overridden) {
    os.addEventListener('change', (event) => {
      if (storedScheme() !== undefined) return;
      apply(event.matches ? 'dark' : 'light');
    });
  }

  /*
   * The switch owns its own checked state, so this reads the state back rather than tracking a
   * copy of it — one place for the answer, and no way for the two to disagree.
   */
  control.addEventListener('change', () => {
    const scheme: Scheme = control.checked ? 'dark' : 'light';
    storeScheme(scheme);
    apply(scheme);
  });
}
