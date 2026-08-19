/**
 * The single-element page.
 *
 * There is no wiring here at all, and that is the whole demonstration: `zd-booking` owns the
 * funnel's state, so a host page supplies a ZIP code in markup and listens for nothing. Compare
 * `composed.ts`, which is the same five components with the wiring done by hand.
 *
 * The imports are ordered. The theme stylesheets define the custom properties every component
 * resolves against. Reset and utilities are shared; tokens are swapped by the theme switcher.
 * The package import defines the tags — importing it also runs `configure.ts` first, which sets
 * the `zd` prefix before any component class is evaluated (PBZD-001).
 */
import '@powered-by-zocdoc/primitives/theme/reset.css';
import '@powered-by-zocdoc/primitives/theme/utilities.css';
import './demo.css';
import { renderThemeSwitcher } from './theme.js';
import '@powered-by-zocdoc/api-components';
import { renderAppearanceToggle } from './appearance.js';
import { renderAssistantPanel } from './chat.js';
import { configureDemo, renderModeBanner } from './config.js';
import { renderScenarios } from './scenarios.js';

renderThemeSwitcher();
renderAppearanceToggle();
renderModeBanner(configureDemo());
renderScenarios();
/*
 * The one piece of wiring on this page, and it is the page's own rather than the funnel's: the
 * assistant panel hands `zd-booking` a provider the way any host page with its own search
 * would. The flow still coordinates the booking itself — see `chat.ts`.
 */
renderAssistantPanel();

const bobTrigger = document.querySelector<HTMLElement>('#bob-open');
const bobDialog = document.querySelector<HTMLElement>('#bob-dialog');
if (bobTrigger && bobDialog) {
  bobTrigger.addEventListener('click', () => {
    (bobDialog as { open: boolean }).open = true;
  });
}
