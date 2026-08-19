/**
 * Theme switcher for the demo pages.
 *
 * Partner themes override only the token layer — reset and utilities stay shared. This module
 * swaps the tokens stylesheet dynamically so the page can demonstrate each theme without a reload.
 */
import type { ZdMenu } from '@powered-by-zocdoc/primitives';

const STORAGE_KEY = 'zd-demo-theme';

type Theme = 'zocdoc' | 'schweiger' | 'womens-care' | 'privia';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'zocdoc', label: 'Zocdoc' },
  { value: 'schweiger', label: 'Schweiger' },
  { value: 'womens-care', label: "Women's Care" },
  { value: 'privia', label: 'Privia' },
];

function storedTheme(): Theme | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.value === stored) ? (stored as Theme) : undefined;
  } catch {
    return undefined;
  }
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Ignored: the page works without persistence. */
  }
}

function tokensHref(theme: Theme): string {
  return theme === 'zocdoc'
    ? '/node_modules/@powered-by-zocdoc/primitives/dist/theme/tokens.css'
    : `/node_modules/@powered-by-zocdoc/primitives/dist/theme/${theme}-tokens.css`;
}

/**
 * Injects the theme stylesheet and wires up the menu.
 *
 * Called early so the tokens are available before components render.
 */
export function renderThemeSwitcher(): void {
  const initial = storedTheme() ?? 'zocdoc';

  // Inject the tokens stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'theme-tokens';
  link.href = tokensHref(initial);
  document.head.appendChild(link);

  // Build the menu
  const container = document.getElementById('theme-switcher');
  if (!container) return;

  const menu = document.createElement('zd-menu') as ZdMenu;
  menu.placement = 'bottom-end';

  const trigger = document.createElement('zd-button');
  trigger.setAttribute('slot', 'trigger');
  trigger.setAttribute('variant', 'secondary');
  trigger.setAttribute('size', 'small');
  trigger.textContent = THEMES.find((t) => t.value === initial)?.label ?? 'Theme';

  menu.appendChild(trigger);

  for (const { value, label } of THEMES) {
    const item = document.createElement('zd-menu-item');
    item.dataset.theme = value;
    item.textContent = label;
    menu.appendChild(item);
  }

  container.appendChild(menu);

  menu.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('zd-menu-item');
    if (!target) return;

    const theme = target.dataset.theme as Theme;
    if (!theme) return;

    storeTheme(theme);
    link.href = tokensHref(theme);
    trigger.textContent = THEMES.find((t) => t.value === theme)?.label ?? 'Theme';
  });
}
