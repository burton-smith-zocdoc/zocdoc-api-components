import { cssVarName, generateThemeSync } from '@charm-ux/theming';
import { zocdocTokensBase } from './zocdoc.js';
import { tokenPrefix } from './prefix.js';

/**
 * Schweiger Dermatology Theme
 *
 * Extends the Zocdoc theme with Schweiger's brand styling:
 * - Light blue brand color with dark blue accent
 * - Roboto font family
 * - Extra-large border radius on form controls and buttons
 * - Custom primary button colors with inverted hover state
 */

type TokenRef = (...segments: (string | number)[]) => string;
const varRef: TokenRef = (...segments) => `var(${cssVarName(tokenPrefix, ...segments)})`;

const schweigerTokensBase = zocdocTokensBase
  .extendPrimitives({
    color: {
      brand: '#56bfed',
      accent: '#233b6c',
    },
    typography: {
      fontFamily: {
        base: 'Roboto, sans-serif',
        accent: 'Roboto, sans-serif',
      },
    },
  })
  .extendSemantics(({ primitive: primitiveRef }) => {
    const primitive = primitiveRef as TokenRef;
    return {
      formControl: {
        borderRadius: primitive('borderRadius', 'xl'),
      },
    };
  })
  .extendComponents(({ primitive: primitiveRef, semantic }) => {
    const primitive = primitiveRef as TokenRef;
    return {
      button: {
        borderRadius: primitive('borderRadius', 'xl'),
        paddingX: primitive('spacing', 24),
        paddingY: primitive('spacing', 8),
        fontWeight: primitive('fontWeight', 'bold'),
        primary: {
          bgColor: {
            light: primitive('color', 'accent', 500),
            dark: primitive('color', 'brand', 500),
          },
          fgColor: {
            light: varRef('color', 'on', 'accent', 500),
            dark: primitive('color', 'accent', 500),
          },
          borderColor: {
            light: primitive('color', 'accent', 500),
            dark: primitive('color', 'brand', 500),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'brand', 500),
              dark: primitive('color', 'brand', 600),
            },
            borderColor: {
              light: primitive('color', 'brand', 500),
              dark: primitive('color', 'brand', 600),
            },
            fgColor: {
              light: primitive('color', 'accent', 500),
              dark: primitive('color', 'accent', 500),
            },
          },
        },
      },
    };
  });

export { schweigerTokensBase };

export const schweigerTokenDefinition = schweigerTokensBase.definition;

export const schweigerTheme = generateThemeSync(schweigerTokenDefinition, { dryRun: true });

export const schweigerThemeCss: string = schweigerTheme.css ?? '';
export const schweigerResetCss: string = schweigerTheme.cssReset ?? '';
export const schweigerUtilitiesCss: string = schweigerTheme.cssUtilities ?? '';

export const schweigerAllCss: string = [schweigerThemeCss, schweigerResetCss, schweigerUtilitiesCss].join(
  '\n',
);
