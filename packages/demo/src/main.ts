/**
 * The single-element page.
 *
 * There is no wiring here at all, and that is the whole demonstration: `zd-booking-flow` owns the
 * funnel's state, so a host page supplies a ZIP code in markup and listens for nothing. Compare
 * `composed.ts`, which is the same five components with the wiring done by hand.
 *
 * The imports are ordered. The theme stylesheet defines the custom properties every component
 * resolves against, and the package import is what defines the tags — importing it also runs
 * `configure.ts` first, which sets the `zd` prefix before any component class is evaluated
 * (PBZD-001).
 */
import '@powered-by-zocdoc/primitives/theme/all.css';
import './demo.css';
import '@powered-by-zocdoc/api-components';
import { configureDemo, renderModeBanner } from './config.js';
import { renderScenarios } from './scenarios.js';

renderModeBanner(configureDemo());
renderScenarios();
