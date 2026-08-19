import { generateThemeSync } from '@charm-ux/theming';
import { zocdocTokensBase } from './zocdoc.js';

/**
 * Women's Care Theme
 *
 * Extends the Zocdoc theme with Women's Care branding:
 * - Purple brand color with warm beige accent
 * - Cambria serif font family
 * - Full (pill) border radius on form controls and buttons
 * - Hollow button hover state (transparent background with colored border)
 */

type TokenRef = (...segments: (string | number)[]) => string;

const womensCareTokensBase = zocdocTokensBase
  .extendPrimitives({
    color: {
      brand: '#50288d',
      accent: '#dcc5b5',
    },
    typography: {
      fontFamily: {
        base: 'Cambria, Georgia, serif',
        accent: 'Cambria, Georgia, serif',
      },
    },
  })
  .extendSemantics(({ primitive: primitiveRef }) => {
    const primitive = primitiveRef as TokenRef;
    return {
      formControl: {
        borderRadius: primitive('borderRadius', 'full'),
      },
    };
  })
  .extendComponents(({ primitive: primitiveRef }) => {
    const primitive = primitiveRef as TokenRef;
    return {
      button: {
        borderWidth: '2px',
        borderRadius: primitive('borderRadius', 'full'),
        fontWeight: primitive('fontWeight', 'semibold'),
        paddingX: primitive('spacing', 20),
        paddingY: primitive('spacing', 12),
        primary: {
          hover: {
            bgColor: primitive('color', 'transparent'),
            fgColor: {
              light: primitive('color', 'brand', 500),
              dark: primitive('color', 'brand', 200),
            },
            borderColor: {
              light: primitive('color', 'brand', 500),
              dark: primitive('color', 'brand', 200),
            },
          },
        },
      },
    };
  });

export { womensCareTokensBase };

export const womensCareTokenDefinition = womensCareTokensBase.definition;

export const womensCareTheme = generateThemeSync(womensCareTokenDefinition, { dryRun: true });

export const womensCareThemeCss: string = womensCareTheme.css ?? '';
export const womensCareResetCss: string = womensCareTheme.cssReset ?? '';
export const womensCareUtilitiesCss: string = womensCareTheme.cssUtilities ?? '';

export const womensCareAllCss: string = [
  womensCareThemeCss,
  womensCareResetCss,
  womensCareUtilitiesCss,
].join('\n');
