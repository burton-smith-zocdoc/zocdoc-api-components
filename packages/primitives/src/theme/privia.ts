import { generateThemeSync } from '@charm-ux/theming';
import { zocdocTokensBase } from './zocdoc.js';

/**
 * Privia Health Theme
 *
 * Extends the Zocdoc theme with Privia's brand colors.
 * Minimal customization - just brand and accent colors.
 */
const priviaTokensBase = zocdocTokensBase.extendPrimitives({
  color: {
    brand: '#18988b',
    accent: '#006bac',
  },
});

export { priviaTokensBase };

export const priviaTokenDefinition = priviaTokensBase.definition;

export const priviaTheme = generateThemeSync(priviaTokenDefinition, { dryRun: true });

export const priviaThemeCss: string = priviaTheme.css ?? '';
export const priviaResetCss: string = priviaTheme.cssReset ?? '';
export const priviaUtilitiesCss: string = priviaTheme.cssUtilities ?? '';

export const priviaAllCss: string = [priviaThemeCss, priviaResetCss, priviaUtilitiesCss].join('\n');
