import { charmTokens, cssVarName } from '@charm-ux/theming';
import { generateThemeSync } from '@charm-ux/theming/generator';
import { tokenPrefix } from './prefix.js';

/**
 * Zocdoc Theme Tokens
 *
 * A port of the Zinc theme (`@zinc/theming` `themes/zinc.ts`) onto Charm UX's
 * token API. Zinc is the canonical Zocdoc theme; this file reproduces its
 * primitive, semantic, and component layers as closely as `@charm-ux/theming`
 * allows.
 *
 * The two packages share a lineage but not a schema, so the port deviates in a
 * few documented ways:
 *
 * 1. **Extension instead of definition.** Zinc calls `defineTokens()` with a
 *    complete theme. Here we extend `charmTokens` so Charm's own semantic and
 *    component tokens survive - the Charm components this package wraps read
 *    those names, and `extendSemantics()`/`extendComponents()` can add or
 *    override keys but never remove them.
 *
 * 2. **Charm's naming grammar wins (STYLE-009).** Zinc's token paths are
 *    renamed to Charm's slot grammar, and land on Charm's existing token names
 *    wherever the two describe the same thing:
 *      - `backgroundColor`/`foregroundColor`/`secondaryForegroundColor` ->
 *        `bgColor`/`fgColor`/`secondaryFgColor`; `boxShadow` -> `shadow`
 *      - `focusOutline.{color,width,style,offset}` -> `focus.outline*`
 *      - `border.default` -> `defaultBorder`; `border.light`/`border.strong`
 *        stay scalar colors, matching Charm's `border.*` contract
 *      - `formControl.description` -> `formControl.helpText`;
 *        `formControl.invalidMessage` -> `formControl.invalid.message`;
 *        `label.foregroundColor` -> `label.color`
 *      - flattened states nest: `switch.trackColorChecked` ->
 *        `switch.control.checked.bgColor`
 *      - Zinc's `modal` is Charm's registered `dialog`; Zinc's accordion
 *        trigger is Charm's `accordionItem`; `tabs.tablist.*` flattens to
 *        `tabs.tablist*`; `radio.size` -> `radio.controlSize`;
 *        `tooltip.maxInlineSize` -> `tooltip.maxWidth`
 *
 * 3. **Inherited scales stay as aliases.** Zinc numbers its spacing, font size,
 *    duration, and z-index scales; Charm names them (`spacing-lg`,
 *    `font-size-sm`). Charm's keys are numerically equivalent to Zinc's and are
 *    still referenced by inherited tokens, so both scales are emitted.
 *
 * 4. **`semantic()` in the semantics layer.** Charm only hands the semantics
 *    factory a `primitive()` ref, so cross-references within the semantic layer
 *    (and the auto-generated `--zd-color-on-*` contrast colors) go through the
 *    local `varRef()` below, which builds the identical `var()` string.
 *
 * 5. **`withRawCss()` -> `extendRawCss()`.** Zinc's Sharp Sans `@font-face`
 *    block is ported; its `[data-mezz-compat]` overrides are not - those target
 *    Zocdoc's Mezzanine app, and these components embed on partner sites.
 *
 * 6. **Charm compatibility fixups.** Zinc's brand ramp is a light yellow, while
 *    Charm's inherited semantics assume a mid-dark blue brand. Tokens Charm
 *    points at `brand` for contrast-sensitive jobs (`link`, `action.primary`,
 *    `indicator.info`, `focus.outlineColor`) are re-pointed at the ramps Zinc
 *    uses for those jobs: `info` and `accent`.
 *
 * `updatePrefix()` must come before the extend* calls' output is read: it
 * re-resolves Charm's semantic and component layers so their `var()` references
 * point at --zd-* too, not just the declarations. The prefix is inherited from
 * there on.
 */

/** Any token path -> `var()` reference, for paths Charm's typed overloads reject. */
type TokenRef = (...segments: (string | number)[]) => string;

/**
 * Build a `var()` reference from a token path, exactly as Charm's own
 * `primitive()`/`semantic()` refs do. Used where a layer needs to reference
 * tokens Charm's helpers can't name: sibling semantic tokens (Charm's semantics
 * factory receives no `semantic()` ref) and the auto-generated
 * `--zd-color-on-*` contrast colors.
 */
const varRef: TokenRef = (...segments) => `var(${cssVarName(tokenPrefix, ...segments)})`;

const zocdocTokensBase = charmTokens
  .updatePrefix(tokenPrefix)
  .extendPrimitives({
    color: {
      /** Base colors - not palette-expanded */
      white: { light: '#ffffff', dark: '#ffffff' },
      black: { light: '#000000', dark: '#000000' },
      transparent: { light: '#00000000', dark: '#00000000' },
      // Ported verbatim from Zinc, including the light value's leading-alpha
      // notation - the dark value uses trailing alpha (#RRGGBBAA).
      overlay: { light: '#66000000', dark: '#FFFFFFE6' },

      /** Explicit palettes from design spec - each expands to steps 50-950 */
      brand: '#FEED5A',
      accent: '#349C9C',
      warning: '#FF8A56',
      neutral: '#b0afaf',
      success: '#039854',
      danger: '#F84141',
      caution: '#FEED5A',
      info: '#4E93F3',
    },
    spacing: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      6: '6px',
      8: '8px',
      10: '10px',
      12: '12px',
      14: '14px',
      16: '16px',
      20: '20px',
      24: '24px',
      28: '28px',
      32: '32px',
      36: '36px',
      40: '40px',
      44: '44px',
      48: '48px',
      56: '56px',
      64: '64px',
      128: '128px',
    },
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      full: '9999px',
    },
    borderWidth: {
      0: '0',
      sm: '1px',
      md: '2px',
      lg: '4px',
    },
    typography: {
      /** Currently uses the existing Zocdoc font families - split into `base`, `accent`, and `mono` */
      fontFamily: {
        base: "'Sharp Sans', sharp-sans-medium, fallback-font, Arial, sans-serif",
        accent: "'Sharp Sans', sharp-sans-medium, fallback-font, Arial, sans-serif",
        mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        icon: "'Material Symbols Rounded'",
      },
      fontSize: {
        11: '11px',
        12: '12px',
        14: '14px',
        16: '16px',
        18: '18px',
        20: '20px',
        24: '24px',
        28: '28px',
        32: '32px',
        40: '40px',
        48: '48px',
        56: '56px',
        60: '60px',
        72: '72px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.08em',
        tight: '-0.04em',
        normal: '0em',
        wide: '0.04em',
        wider: '0.08em',
      },
    },
    shadow: {
      flat: {
        description:
          'Most of your UI should be here. Overusing shadows makes the elevated elements lose meaning.',
        value: 'none',
      },
      sticky: {
        description:
          'Directional - casts downward only. Signals persistent UI that stays as content scrolls underneath - Global navigation, Sticky headers, Floating action buttons, Persistent toolbars',
        value: [
          {
            color: 'rgba(0, 0, 0, 0.06)',
            offsetX: '0px',
            offsetY: '1px',
            blur: '0px',
            spread: '0px',
          },
          {
            color: 'rgba(0, 0, 0, 0.06)',
            offsetX: '0px',
            offsetY: '2px',
            blur: '8px',
            spread: '0px',
          },
        ],
      },
      raised: {
        description:
          'The workhorse level. Separates cards from page without screaming - Cards on a white background, List items on hover, Raised buttons (secondary)',
        value: [
          {
            color: 'rgba(0, 0, 0, 0.05)',
            offsetX: '0px',
            offsetY: '1px',
            blur: '2px',
            spread: '0px',
          },
          {
            color: 'rgba(0, 0, 0, 0.08)',
            offsetX: '0px',
            offsetY: '1px',
            blur: '3px',
            spread: '0px',
          },
        ],
      },
      overlay: {
        description:
          'Clearly above the page. Negative spread on the second layer creates realistic penumbra - Dropdowns, Tooltips, Popovers, Date pickers, Context menus',
        value: [
          {
            color: 'rgba(0, 0, 0, 0.04)',
            offsetX: '0px',
            offsetY: '4px',
            blur: '6px',
            spread: '0px',
          },
          {
            color: 'rgba(0, 0, 0, 0.08)',
            offsetX: '0px',
            offsetY: '10px',
            blur: '15px',
            spread: '0px',
          },
        ],
      },
      modal: {
        description:
          'Always accompanied by a scrim overlay. The shadow reinforces the modal context even without the scrim - Modals & dialogs, Command palette, Drawers, Full-screen overlays',
        value: [
          {
            color: 'rgba(0, 0, 0, 0.06)',
            offsetX: '0px',
            offsetY: '8px',
            blur: '16px',
            spread: '0px',
          },
          {
            color: 'rgba(0, 0, 0, 0.12)',
            offsetX: '0px',
            offsetY: '20px',
            blur: '40px',
            spread: '0px',
          },
        ],
      },
    },
    /** Currently not in Figma */
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
    },
    /** Currently not in Figma */
    timingFunction: {
      linear: [0, 0, 1, 1],
      easeIn: [0.4, 0, 1, 1],
      easeOut: [0, 0, 0.2, 1],
      easeInOut: [0.4, 0, 0.2, 1],
      overshoot: [0.34, 1.35, 0.64, 1],
    },
    /** Currently not in Figma */
    zIndex: {
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
    },
  })
  .extendSemantics(({ primitive: primitiveRef }) => {
    const primitive = primitiveRef as TokenRef;
    const semantic = varRef;

    return {
      /** Zinc's `color.text.onLightBg`/`onDarkBg` - Charm keys content colors under `text` */
      text: {
        onLightBg: primitive('color', 'black'),
        onDarkBg: primitive('color', 'white'),
      },
      body: {
        bgColor: {
          light: primitive('color', 'white'),
          dark: primitive('color', 'neutral', 950),
        },
        fgColor: {
          light: primitive('color', 'neutral', 900),
          dark: primitive('color', 'neutral', 50),
        },
        secondaryFgColor: {
          light: primitive('color', 'neutral', 900),
          dark: primitive('color', 'neutral', 50),
        },
        fontFamily: primitive('fontFamily', 'base'),
        fontSize: semantic('typography', 'body', 'md', 'fontSize'),
        fontWeight: semantic('typography', 'body', 'md', 'fontWeight'),
        lineHeight: semantic('typography', 'body', 'md', 'lineHeight'),
      },
      heading: {
        fgColor: {
          light: primitive('color', 'neutral', 900),
          dark: primitive('color', 'neutral', 50),
        },
        fontFamily: primitive('fontFamily', 'accent'),
        fontWeight: primitive('fontWeight', 'semibold'),
        lineHeight: primitive('lineHeight', 'tight'),
      },
      link: {
        fgColor: {
          light: primitive('color', 'neutral', 900),
          dark: primitive('color', 'neutral', 50),
        },
        decoration: 'underline',
        hover: {
          fgColor: {
            light: primitive('color', 'info', 600),
            dark: primitive('color', 'info', 100),
          },
          decoration: 'underline',
        },
        active: {
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          decoration: 'underline',
        },
        visited: {
          fgColor: {
            light: primitive('color', 'info', 700),
            dark: primitive('color', 'info', 200),
          },
          decoration: 'underline',
        },
      },
      /** Zinc's `focusOutline` - Charm names the group `focus` with `outline*` leaves */
      focus: {
        outlineColor: primitive('color', 'info', 500),
        outlineWidth: primitive('borderWidth', 'md'),
        outlineStyle: 'solid',
        outlineOffset: primitive('spacing', 2),
      },
      defaultButton: {
        bgColor: primitive('color', 'transparent'),
        fgColor: semantic('body', 'fgColor'),
        borderColor: primitive('color', 'transparent'),
        borderWidth: semantic('defaultBorder', 'width'),
        borderStyle: semantic('defaultBorder', 'style'),
        borderRadius: primitive('borderRadius', 'sm'),
        fontWeight: primitive('fontWeight', 'medium'),
        fontSize: primitive('fontSize', '16'),
        iconSize: primitive('fontSize', '20'),
        height: '44px',
        paddingX: primitive('spacing', 20),
        paddingY: primitive('spacing', 14),
        small: {
          fontSize: primitive('fontSize', '14'),
          iconSize: primitive('fontSize', '16'),
          height: '32px',
          paddingX: primitive('spacing', 12),
          /**
           * Not in Zinc's theme, which sizes the small button from `height`
           * alone. Charm's button has no height token, so `ZdButton` drives the
           * box from padding and pins it with `min-height` - which needs a
           * `paddingY` that adds up: 8 + 14px text + 8 + 2px border = 32px.
           */
          paddingY: primitive('spacing', 8),
        },
        shadow: 'none',
        hover: {
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 800),
          },
          borderColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 800),
          },
        },
        active: {
          bgColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
        },
        focus: {
          // Charm compatibility: inherited value is brand 500 (yellow).
          borderColor: primitive('color', 'info', 500),
        },
        disabled: {
          fgColor: primitive('color', 'neutral', 400),
          borderColor: primitive('color', 'transparent'),
        },
      },
      /** Not defined in Figma */
      form: {
        bgColor: primitive('color', 'transparent'),
        fgColor: semantic('body', 'fgColor'),
        borderColor: primitive('color', 'transparent'),
        borderRadius: '0',
        paddingX: '0',
        paddingY: '0',
      },
      /** Not defined in Figma */
      formControl: {
        bgColor: {
          light: semantic('surface', 'default', 'bgColor'),
          dark: primitive('color', 'neutral', 800),
        },
        fgColor: {
          light: primitive('color', 'neutral', 900),
          dark: primitive('color', 'neutral', 50),
        },
        borderColor: {
          light: primitive('color', 'neutral', 300),
          dark: primitive('color', 'neutral', 600),
        },
        borderRadius: primitive('borderRadius', 'md'),
        fontSize: primitive('fontSize', '16'),
        paddingX: primitive('spacing', 12),
        paddingY: primitive('spacing', 14),
        inputHeight: '44px',
        iconGap: primitive('spacing', 8),
        small: {
          inputHeight: '32px',
          paddingY: primitive('spacing', 8),
          labelFontSize: primitive('fontSize', '14'),
        },
        placeholderColor: {
          light: primitive('color', 'neutral', 400),
          dark: primitive('color', 'neutral', 500),
        },
        shadow: 'none',
        hover: {
          bgColor: {
            light: primitive('color', 'neutral', 50),
            dark: primitive('color', 'neutral', 700),
          },
          borderColor: {
            light: primitive('color', 'neutral', 400),
            dark: primitive('color', 'neutral', 500),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
        },
        focus: {
          bgColor: {
            light: semantic('surface', 'default', 'bgColor'),
            dark: primitive('color', 'neutral', 800),
          },
          borderColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          shadow: 'none',
        },
        disabled: {
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 700),
          },
          fgColor: {
            light: primitive('color', 'neutral', 400),
            dark: primitive('color', 'neutral', 500),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 600),
          },
          opacity: '0.6',
        },
        invalid: {
          borderColor: primitive('color', 'danger', 500),
          /** Zinc's `formControl.invalidMessage` */
          message: {
            color: {
              light: primitive('color', 'danger', 600),
              dark: primitive('color', 'danger', 400),
            },
            fontSize: semantic('typography', 'body', 'sm', 'fontSize'),
            lineHeight: semantic('typography', 'body', 'sm', 'lineHeight'),
          },
        },
        label: {
          color: semantic('body', 'fgColor'),
          fontSize: semantic('typography', 'label', 'xl', 'fontSize'),
          fontWeight: semantic('typography', 'label', 'xl', 'fontWeight'),
          gap: primitive('spacing', 4),
          requiredIndicatorGap: primitive('spacing', 4),
        },
        /** Zinc's `formControl.description` */
        helpText: {
          /**
           * Override to meet 4.5:1 contrast (WCAG AA). The default
           * secondaryFgColor is too light at 3.18:1.
           */
          color: {
            light: primitive('color', 'neutral', 700),
            dark: primitive('color', 'neutral', 300),
          },
          fontSize: semantic('typography', 'body', 'sm', 'fontSize'),
          fontWeight: primitive('fontWeight', 'normal'),
          lineHeight: semantic('typography', 'body', 'sm', 'lineHeight'),
          gap: primitive('spacing', 4),
        },
        /** Slider/range input */
        range: {
          trackSize: '4px',
          thumbSize: '16px',
          trackMarginTop: '0',
        },
      },
      /** Zinc's `border.default` - Charm's default border group */
      defaultBorder: {
        color: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 900),
        },
        width: primitive('borderWidth', 'sm'),
        style: 'solid',
      },
      /**
       * Zinc's `border.light`/`border.strong`. Charm's `border.*` leaves are
       * scalar colors, so these stay colors; widths and styles live on
       * `defaultBorder` (every Zinc border variant used the same 1px solid).
       */
      border: {
        primary: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 900),
        },
        light: {
          light: primitive('color', 'neutral', 100),
          dark: primitive('color', 'neutral', 700),
        },
        strong: {
          light: primitive('color', 'neutral', 600),
          dark: primitive('color', 'neutral', 200),
        },
      },
      elevation: {
        flat: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 900),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 800),
          },
          borderWidth: '0',
          shadow: primitive('shadow', 'flat'),
        },
        sticky: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 900),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 800),
          },
          borderWidth: '0',
          shadow: primitive('shadow', 'sticky'),
        },
        raised: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 800),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          borderWidth: primitive('borderWidth', 'sm'),
          shadow: primitive('shadow', 'raised'),
        },
        overlay: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 800),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          borderWidth: primitive('borderWidth', 'sm'),
          shadow: primitive('shadow', 'overlay'),
        },
        modal: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 800),
          },
          fgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 700),
          },
          borderWidth: '0',
          shadow: primitive('shadow', 'modal'),
        },
      },
      /** Not defined in Figma */
      surface: {
        default: {
          bgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 900),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 50),
            dark: semantic('color', 'on', 'neutral', 900),
          },
          secondaryFgColor: {
            light: primitive('color', 'neutral', 600),
            dark: primitive('color', 'neutral', 400),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 800),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 50),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 50),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 300),
              dark: primitive('color', 'neutral', 700),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 100),
              dark: semantic('color', 'on', 'neutral', 700),
            },
            borderColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'white'),
              dark: primitive('color', 'neutral', 900),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 50),
              dark: semantic('color', 'on', 'neutral', 900),
            },
            borderColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 600),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 100),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        brand: {
          bgColor: {
            light: primitive('color', 'brand', 500),
            dark: primitive('color', 'brand', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'brand', 500),
            dark: semantic('color', 'on', 'brand', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'brand', 100),
            dark: primitive('color', 'brand', 900),
          },
          borderColor: {
            light: primitive('color', 'brand', 500),
            dark: primitive('color', 'brand', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'brand', 600),
              dark: primitive('color', 'brand', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'brand', 600),
              dark: semantic('color', 'on', 'brand', 500),
            },
            borderColor: {
              light: primitive('color', 'brand', 600),
              dark: primitive('color', 'brand', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'brand', 700),
              dark: primitive('color', 'brand', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'brand', 700),
              dark: semantic('color', 'on', 'brand', 600),
            },
            borderColor: {
              light: primitive('color', 'brand', 700),
              dark: primitive('color', 'brand', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'brand', 500),
              dark: primitive('color', 'brand', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'brand', 500),
              dark: semantic('color', 'on', 'brand', 400),
            },
            borderColor: {
              light: primitive('color', 'brand', 700),
              dark: primitive('color', 'brand', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        accent: {
          bgColor: {
            light: primitive('color', 'accent', 500),
            dark: primitive('color', 'accent', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'accent', 500),
            dark: semantic('color', 'on', 'accent', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'accent', 100),
            dark: primitive('color', 'accent', 900),
          },
          borderColor: {
            light: primitive('color', 'accent', 500),
            dark: primitive('color', 'accent', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'accent', 600),
              dark: primitive('color', 'accent', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'accent', 600),
              dark: semantic('color', 'on', 'accent', 500),
            },
            borderColor: {
              light: primitive('color', 'accent', 600),
              dark: primitive('color', 'accent', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'accent', 700),
              dark: primitive('color', 'accent', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'accent', 700),
              dark: semantic('color', 'on', 'accent', 600),
            },
            borderColor: {
              light: primitive('color', 'accent', 700),
              dark: primitive('color', 'accent', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'accent', 500),
              dark: primitive('color', 'accent', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'accent', 500),
              dark: semantic('color', 'on', 'accent', 400),
            },
            borderColor: {
              light: primitive('color', 'accent', 700),
              dark: primitive('color', 'accent', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        neutral: {
          bgColor: {
            light: primitive('color', 'neutral', 500),
            dark: primitive('color', 'neutral', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 500),
            dark: semantic('color', 'on', 'neutral', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 900),
          },
          borderColor: {
            light: primitive('color', 'neutral', 500),
            dark: primitive('color', 'neutral', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 600),
              dark: semantic('color', 'on', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 700),
              dark: semantic('color', 'on', 'neutral', 600),
            },
            borderColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'neutral', 500),
              dark: primitive('color', 'neutral', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 500),
              dark: semantic('color', 'on', 'neutral', 400),
            },
            borderColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        neutralLight: {
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 800),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 100),
            dark: semantic('color', 'on', 'neutral', 800),
          },
          secondaryFgColor: {
            light: primitive('color', 'neutral', 600),
            dark: primitive('color', 'neutral', 400),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 200),
              dark: semantic('color', 'on', 'neutral', 700),
            },
            borderColor: {
              light: primitive('color', 'neutral', 300),
              dark: primitive('color', 'neutral', 600),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 300),
              dark: primitive('color', 'neutral', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 300),
              dark: semantic('color', 'on', 'neutral', 600),
            },
            borderColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 100),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 100),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        neutralDark: {
          bgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'neutral', 950),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 900),
            dark: semantic('color', 'on', 'neutral', 950),
          },
          secondaryFgColor: {
            light: primitive('color', 'neutral', 400),
            dark: primitive('color', 'neutral', 500),
          },
          borderColor: {
            light: primitive('color', 'neutral', 800),
            dark: primitive('color', 'neutral', 800),
          },
          colorScheme: 'dark',
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 800),
              dark: primitive('color', 'neutral', 900),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 800),
              dark: semantic('color', 'on', 'neutral', 900),
            },
            borderColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 700),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 700),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'neutral', 900),
              dark: primitive('color', 'neutral', 950),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 900),
              dark: semantic('color', 'on', 'neutral', 950),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 600),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 700),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        info: {
          bgColor: {
            light: primitive('color', 'info', 500),
            dark: primitive('color', 'info', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'info', 500),
            dark: semantic('color', 'on', 'info', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'info', 100),
            dark: primitive('color', 'info', 900),
          },
          borderColor: {
            light: primitive('color', 'info', 500),
            dark: primitive('color', 'info', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'info', 600),
              dark: primitive('color', 'info', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'info', 600),
              dark: semantic('color', 'on', 'info', 500),
            },
            borderColor: {
              light: primitive('color', 'info', 600),
              dark: primitive('color', 'info', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'info', 700),
              dark: primitive('color', 'info', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'info', 700),
              dark: semantic('color', 'on', 'info', 600),
            },
            borderColor: {
              light: primitive('color', 'info', 700),
              dark: primitive('color', 'info', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'info', 500),
              dark: primitive('color', 'info', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'info', 500),
              dark: semantic('color', 'on', 'info', 400),
            },
            borderColor: {
              light: primitive('color', 'info', 700),
              dark: primitive('color', 'info', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        success: {
          bgColor: {
            light: primitive('color', 'success', 500),
            dark: primitive('color', 'success', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'success', 500),
            dark: semantic('color', 'on', 'success', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'success', 100),
            dark: primitive('color', 'success', 900),
          },
          borderColor: {
            light: primitive('color', 'success', 500),
            dark: primitive('color', 'success', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'success', 600),
              dark: primitive('color', 'success', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'success', 600),
              dark: semantic('color', 'on', 'success', 500),
            },
            borderColor: {
              light: primitive('color', 'success', 600),
              dark: primitive('color', 'success', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'success', 700),
              dark: primitive('color', 'success', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'success', 700),
              dark: semantic('color', 'on', 'success', 600),
            },
            borderColor: {
              light: primitive('color', 'success', 700),
              dark: primitive('color', 'success', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'success', 500),
              dark: primitive('color', 'success', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'success', 500),
              dark: semantic('color', 'on', 'success', 400),
            },
            borderColor: {
              light: primitive('color', 'success', 700),
              dark: primitive('color', 'success', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        warning: {
          bgColor: {
            light: primitive('color', 'warning', 500),
            dark: primitive('color', 'warning', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'warning', 500),
            dark: semantic('color', 'on', 'warning', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'warning', 100),
            dark: primitive('color', 'warning', 900),
          },
          borderColor: {
            light: primitive('color', 'warning', 500),
            dark: primitive('color', 'warning', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'warning', 600),
              dark: primitive('color', 'warning', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'warning', 600),
              dark: semantic('color', 'on', 'warning', 500),
            },
            borderColor: {
              light: primitive('color', 'warning', 600),
              dark: primitive('color', 'warning', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'warning', 700),
              dark: primitive('color', 'warning', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'warning', 700),
              dark: semantic('color', 'on', 'warning', 600),
            },
            borderColor: {
              light: primitive('color', 'warning', 700),
              dark: primitive('color', 'warning', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'warning', 500),
              dark: primitive('color', 'warning', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'warning', 500),
              dark: semantic('color', 'on', 'warning', 400),
            },
            borderColor: {
              light: primitive('color', 'warning', 700),
              dark: primitive('color', 'warning', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        danger: {
          bgColor: {
            light: primitive('color', 'danger', 500),
            dark: primitive('color', 'danger', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'danger', 500),
            dark: semantic('color', 'on', 'danger', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'danger', 100),
            dark: primitive('color', 'danger', 900),
          },
          borderColor: {
            light: primitive('color', 'danger', 500),
            dark: primitive('color', 'danger', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'danger', 600),
              dark: primitive('color', 'danger', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'danger', 600),
              dark: semantic('color', 'on', 'danger', 500),
            },
            borderColor: {
              light: primitive('color', 'danger', 600),
              dark: primitive('color', 'danger', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'danger', 700),
              dark: primitive('color', 'danger', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'danger', 700),
              dark: semantic('color', 'on', 'danger', 600),
            },
            borderColor: {
              light: primitive('color', 'danger', 700),
              dark: primitive('color', 'danger', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'danger', 500),
              dark: primitive('color', 'danger', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'danger', 500),
              dark: semantic('color', 'on', 'danger', 400),
            },
            borderColor: {
              light: primitive('color', 'danger', 700),
              dark: primitive('color', 'danger', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
        caution: {
          bgColor: {
            light: primitive('color', 'caution', 500),
            dark: primitive('color', 'caution', 400),
          },
          fgColor: {
            light: semantic('color', 'on', 'caution', 500),
            dark: semantic('color', 'on', 'caution', 400),
          },
          secondaryFgColor: {
            light: primitive('color', 'caution', 100),
            dark: primitive('color', 'caution', 900),
          },
          borderColor: {
            light: primitive('color', 'caution', 500),
            dark: primitive('color', 'caution', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'caution', 600),
              dark: primitive('color', 'caution', 500),
            },
            fgColor: {
              light: semantic('color', 'on', 'caution', 600),
              dark: semantic('color', 'on', 'caution', 500),
            },
            borderColor: {
              light: primitive('color', 'caution', 600),
              dark: primitive('color', 'caution', 500),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'caution', 700),
              dark: primitive('color', 'caution', 600),
            },
            fgColor: {
              light: semantic('color', 'on', 'caution', 700),
              dark: semantic('color', 'on', 'caution', 600),
            },
            borderColor: {
              light: primitive('color', 'caution', 700),
              dark: primitive('color', 'caution', 600),
            },
          },
          focus: {
            bgColor: {
              light: primitive('color', 'caution', 500),
              dark: primitive('color', 'caution', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'caution', 500),
              dark: semantic('color', 'on', 'caution', 400),
            },
            borderColor: {
              light: primitive('color', 'caution', 700),
              dark: primitive('color', 'caution', 300),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
        },
      },
      typography: {
        display: {
          '2xl': {
            description: 'Hero headlines, splash, app icon',
            value: {
              fontSize: primitive('fontSize', '72'),
              fontWeight: primitive('fontWeight', 'bold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tighter'),
            },
          },
          xl: {
            description: 'Landing hero, feature banners',
            value: {
              fontSize: primitive('fontSize', '56'),
              fontWeight: primitive('fontWeight', 'bold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tighter'),
            },
          },
          lg: {
            description: 'Section heroes, campaign titles',
            value: {
              fontSize: primitive('fontSize', '48'),
              fontWeight: primitive('fontWeight', 'bold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tighter'),
            },
          },
          md: {
            description: 'Card heroes, marketing headers',
            value: {
              fontSize: primitive('fontSize', '40'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tight'),
            },
          },
        },
        heading: {
          xl: {
            description: 'Page titles, primary content headers',
            value: {
              fontSize: primitive('fontSize', '32'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tight'),
            },
          },
          lg: {
            description: 'Section titles, panel headers',
            value: {
              fontSize: primitive('fontSize', '28'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tight'),
            },
          },
          md: {
            description: 'Card headers, dialog & modal titles',
            value: {
              fontSize: primitive('fontSize', '24'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'tight'),
            },
          },
          sm: {
            description: 'Sidebar headers, list group labels',
            value: {
              fontSize: primitive('fontSize', '20'),
              fontWeight: primitive('fontWeight', 'medium'),
              lineHeight: primitive('lineHeight', 'snug'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          xs: {
            description: 'Sub-section headers, detail panel titles',
            value: {
              fontSize: primitive('fontSize', '18'),
              fontWeight: primitive('fontWeight', 'medium'),
              lineHeight: primitive('lineHeight', 'snug'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          '2xs': {
            description: 'Dense UI: table headers, nav items',
            value: {
              fontSize: primitive('fontSize', '16'),
              fontWeight: primitive('fontWeight', 'medium'),
              lineHeight: primitive('lineHeight', 'snug'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
        },
        body: {
          xl: {
            description: 'Long-form prose, marketing copy, editorial',
            value: {
              fontSize: primitive('fontSize', '20'),
              fontWeight: primitive('fontWeight', 'normal'),
              lineHeight: primitive('lineHeight', 'relaxed'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          lg: {
            description: 'Primary reading text, feature descriptions',
            value: {
              fontSize: primitive('fontSize', '18'),
              fontWeight: primitive('fontWeight', 'normal'),
              lineHeight: primitive('lineHeight', 'relaxed'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          md: {
            description: 'Default body, form content, card descriptions',
            value: {
              fontSize: primitive('fontSize', '16'),
              fontWeight: primitive('fontWeight', 'normal'),
              lineHeight: primitive('lineHeight', 'relaxed'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          sm: {
            description: 'Secondary copy, helper text, descriptions',
            value: {
              fontSize: primitive('fontSize', '14'),
              fontWeight: primitive('fontWeight', 'normal'),
              lineHeight: primitive('lineHeight', 'normal'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          xs: {
            description: 'Captions, footnotes, timestamps, metadata',
            value: {
              fontSize: primitive('fontSize', '12'),
              fontWeight: primitive('fontWeight', 'normal'),
              lineHeight: primitive('lineHeight', 'normal'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
        },
        label: {
          xl: {
            description: 'Buttons, primary form labels, navigation',
            value: {
              fontSize: primitive('fontSize', '16'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          lg: {
            description: 'Buttons, primary form labels, navigation',
            value: {
              fontSize: primitive('fontSize', '14'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          md: {
            description: 'Tags, badges, chips, secondary labels',
            value: {
              fontSize: primitive('fontSize', '12'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
          sm: {
            description: 'Tooltips, micro labels, input hints',
            value: {
              fontSize: primitive('fontSize', '11'),
              fontWeight: primitive('fontWeight', 'semibold'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'normal'),
            },
          },
        },
        overline: {
          md: {
            description: 'Section eyebrows, table headers, category labels',
            value: {
              fontSize: primitive('fontSize', '11'),
              fontWeight: primitive('fontWeight', 'medium'),
              lineHeight: primitive('lineHeight', 'tight'),
              letterSpacing: primitive('letterSpacing', 'wide'),
            },
          },
        },
      },

      /**
       * Charm compatibility - no Zinc equivalent.
       *
       * Charm points these at `brand`, which was a mid-dark blue in the Charm
       * theme and is a light yellow here. Re-point them at the ramps Zinc uses
       * for the same jobs: `accent` for the primary action color (Zinc's checked
       * switch, checkbox, and radio), `info` for status.
       */
      action: {
        primary: {
          color: primitive('color', 'accent', 500),
          hover: {
            color: {
              light: primitive('color', 'accent', 600),
              dark: primitive('color', 'accent', 300),
            },
          },
          active: {
            color: {
              light: primitive('color', 'accent', 700),
              dark: primitive('color', 'accent', 200),
            },
          },
        },
      },
      indicator: {
        info: primitive('color', 'info', 500),
      },
    };
  })
  .extendComponents(({ primitive: primitiveRef, semantic }) => {
    const primitive = primitiveRef as TokenRef;

    /**
     * One alert severity, as a tint rather than a fill.
     *
     * The 100/200 step is deliberate. An alert hosts controls in its `action`
     * slot and its own dismiss button, and a `secondary` button on a solid
     * `danger-500` fill is unreadable - the tint keeps the surface light in the
     * light scheme and light-on-dark in the dark one, so a control designed for
     * the page still works on top of it. Pairing each step with
     * `on-<ramp>-<step>` puts the message text at AA by construction in both
     * schemes, since those contrast colors are generated against that step.
     *
     * `borderColor` and `iconColor` move in the same direction as the tint, three
     * and six steps darker, so the edge reads as an edge and the glyph carries
     * the severity. Both are decorative - the icon is `aria-hidden` and the
     * severity is also in the text - so neither is held to a text ratio. The icon
     * still clears 3:1 against every tint (4.4:1 at worst, on `warning`); the
     * border does not, and does not need to, because the tint is what separates
     * the alert from the page.
     *
     * The dismiss button's resting background is transparent for every alert -
     * see the `alert` group below - so only its hover and active steps are named
     * here.
     */
    const alertVariant = (ramp: string) => ({
      bgColor: {
        light: primitive('color', ramp, 100),
        dark: primitive('color', ramp, 200),
      },
      fgColor: {
        light: varRef('color', 'on', ramp, 100),
        dark: varRef('color', 'on', ramp, 200),
      },
      borderColor: {
        light: primitive('color', ramp, 400),
        dark: primitive('color', ramp, 500),
      },
      iconColor: {
        light: primitive('color', ramp, 700),
        dark: primitive('color', ramp, 800),
      },
      buttonHoverBgColor: {
        light: primitive('color', ramp, 200),
        dark: primitive('color', ramp, 300),
      },
      buttonActiveBgColor: {
        light: primitive('color', ramp, 300),
        dark: primitive('color', ramp, 400),
      },
    });

    return {
      button: {
        // Shared properties across all variants
        borderWidth: semantic('defaultButton', 'borderWidth'),
        borderColor: semantic('defaultButton', 'borderColor'),
        borderStyle: semantic('defaultButton', 'borderStyle'),
        borderRadius: semantic('defaultButton', 'borderRadius'),
        fontWeight: semantic('defaultButton', 'fontWeight'),
        fontSize: semantic('defaultButton', 'fontSize'),
        iconSize: semantic('defaultButton', 'iconSize'),
        height: semantic('defaultButton', 'height'),
        paddingX: semantic('defaultButton', 'paddingX'),
        paddingY: semantic('defaultButton', 'paddingY'),
        shadow: semantic('defaultButton', 'shadow'),
        small: {
          fontSize: semantic('defaultButton', 'small', 'fontSize'),
          iconSize: semantic('defaultButton', 'small', 'iconSize'),
          height: semantic('defaultButton', 'small', 'height'),
          paddingX: semantic('defaultButton', 'small', 'paddingX'),
          paddingY: semantic('defaultButton', 'small', 'paddingY'),
        },
        // Variant-specific colors
        primary: {
          bgColor: semantic('surface', 'brand', 'bgColor'),
          fgColor: semantic('surface', 'brand', 'fgColor'),
          borderColor: semantic('surface', 'brand', 'borderColor'),
          hover: {
            bgColor: semantic('surface', 'brand', 'hover', 'bgColor'),
            fgColor: semantic('surface', 'brand', 'hover', 'fgColor'),
            borderColor: semantic('surface', 'brand', 'hover', 'borderColor'),
          },
          active: {
            bgColor: semantic('surface', 'brand', 'active', 'bgColor'),
            fgColor: semantic('surface', 'brand', 'active', 'fgColor'),
            borderColor: semantic('surface', 'brand', 'active', 'borderColor'),
          },
          disabled: {
            bgColor: semantic('surface', 'brand', 'disabled', 'bgColor'),
            fgColor: semantic('surface', 'brand', 'disabled', 'fgColor'),
            borderColor: semantic('surface', 'brand', 'disabled', 'borderColor'),
          },
        },
        secondary: {
          bgColor: 'transparent',
          fgColor: semantic('body', 'fgColor'),
          borderColor: {
            light: primitive('color', 'neutral', 600),
            dark: primitive('color', 'neutral', 400),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 100),
              dark: semantic('color', 'on', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 400),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 200),
              dark: semantic('color', 'on', 'neutral', 700),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 400),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 600),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 800),
            },
            borderColor: primitive('color', 'neutral', 400),
          },
        },
        inverse: {
          bgColor: {
            light: primitive('color', 'neutral', 800),
            dark: primitive('color', 'neutral', 50),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 800),
            dark: semantic('color', 'on', 'neutral', 50),
          },
          borderColor: {
            light: primitive('color', 'neutral', 800),
            dark: primitive('color', 'neutral', 50),
          },
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 200),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 700),
              dark: semantic('color', 'on', 'neutral', 200),
            },
            borderColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 200),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 400),
            },
            fgColor: {
              light: semantic('color', 'on', 'neutral', 600),
              dark: semantic('color', 'on', 'neutral', 400),
            },
            borderColor: {
              light: primitive('color', 'neutral', 600),
              dark: primitive('color', 'neutral', 400),
            },
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 300),
            },
            fgColor: {
              light: primitive('color', 'neutral', 500),
              dark: primitive('color', 'neutral', 500),
            },
            borderColor: {
              light: primitive('color', 'neutral', 700),
              dark: primitive('color', 'neutral', 300),
            },
          },
        },
        ghost: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('body', 'fgColor'),
          borderColor: primitive('color', 'transparent'),
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 100),
              dark: primitive('color', 'neutral', 800),
            },
          },
          active: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 700),
            },
          },
          disabled: {
            fgColor: primitive('color', 'neutral', 400),
            borderColor: primitive('color', 'transparent'),
          },
        },
        destructive: {
          bgColor: primitive('color', 'danger', 600),
          fgColor: semantic('color', 'on', 'danger', 600),
          borderColor: primitive('color', 'danger', 600),
          hover: {
            bgColor: primitive('color', 'danger', 700),
            fgColor: semantic('color', 'on', 'danger', 700),
            borderColor: primitive('color', 'danger', 700),
          },
          active: {
            bgColor: primitive('color', 'danger', 700),
            fgColor: semantic('color', 'on', 'danger', 700),
            borderColor: primitive('color', 'danger', 700),
          },
          disabled: {
            bgColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 600),
            },
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 800),
            },
            borderColor: {
              light: primitive('color', 'neutral', 200),
              dark: primitive('color', 'neutral', 600),
            },
          },
        },
        link: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('link', 'fgColor'),
          decoration: semantic('link', 'decoration'),
          hover: {
            fgColor: semantic('link', 'hover', 'fgColor'),
            decoration: semantic('link', 'hover', 'decoration'),
          },
          active: {
            fgColor: semantic('link', 'active', 'fgColor'),
            decoration: semantic('link', 'active', 'decoration'),
          },
          disabled: {
            fgColor: {
              light: primitive('color', 'neutral', 400),
              dark: primitive('color', 'neutral', 600),
            },
          },
        },
      },
      checkbox: {
        borderColor: {
          light: primitive('color', 'neutral', 800),
          dark: primitive('color', 'neutral', 400),
        },
        borderWidth: primitive('borderWidth', 'sm'),
        borderRadius: primitive('borderRadius', 'xs'),
        bgColor: semantic('surface', 'default', 'bgColor'),
        size: '20px',
        iconSize: '14px',
        /** Backs `<zd-checkbox size="small">`; Zinc's compact checkbox is 16px. */
        small: {
          size: '16px',
          iconSize: '12px',
        },
        checked: {
          bgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
          borderColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
          /** Zinc's `checkmarkColor` - Charm's checkmark is the checked foreground */
          fgColor: {
            light: primitive('color', 'white'),
            dark: primitive('color', 'neutral', 900),
          },
        },
        hover: {
          bgColor: {
            light: primitive('color', 'neutral', 50),
            dark: primitive('color', 'neutral', 800),
          },
        },
        focus: {
          borderColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
        },
        invalid: {
          bgColor: {
            light: primitive('color', 'danger', 50),
            dark: primitive('color', 'danger', 900),
          },
        },
        disabled: {
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 800),
          },
          opacity: '0.5',
        },
      },
      radio: {
        borderColor: {
          light: primitive('color', 'neutral', 800),
          dark: primitive('color', 'neutral', 400),
        },
        borderWidth: primitive('borderWidth', 'sm'),
        bgColor: semantic('surface', 'default', 'bgColor'),
        label: {
          checked: { hover: { color: semantic('body', 'fgColor') } },
          unchecked: { hover: { color: semantic('body', 'fgColor') } },
        },
        controlSize: '20px',
        indicatorSize: '8px',
        /**
         * Backs `<zd-radio size="small">`. Both leaves have to move together -
         * Charm sizes the ring from `controlSize` and the dot from
         * `indicatorSize`, so shrinking only the ring clips the dot.
         */
        small: {
          controlSize: '16px',
          indicatorSize: '6px',
        },
        checked: {
          /**
           * Zinc's `markColor` - the inner dot. Charm paints `.radio-check`
           * from `checked.bgColor`, not from an indicator-specific token, so
           * this has to be the dot color rather than the control's surface.
           */
          bgColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
          borderColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
        },
        hover: {
          bgColor: {
            light: primitive('color', 'neutral', 50),
            dark: primitive('color', 'neutral', 800),
          },
        },
        focus: {
          borderColor: {
            light: primitive('color', 'neutral', 900),
            dark: primitive('color', 'white'),
          },
        },
        invalid: {
          bgColor: {
            light: primitive('color', 'danger', 50),
            dark: primitive('color', 'danger', 900),
          },
        },
        disabled: {
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 800),
          },
          opacity: '0.5',
        },
      },
      /**
       * Zinc's flat `track*`/`thumb*` leaves map onto Charm's `control` and
       * `thumb` sub-groups, with `checked` nested ahead of interaction states.
       */
      switch: {
        width: '48px',
        height: '28px',
        borderRadius: primitive('borderRadius', 'full'),
        labelGap: primitive('spacing', 12),
        control: {
          padding: primitive('spacing', 2),
          bgColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          borderColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 700),
          },
          transition: `background-color ${primitive('duration', 200)} ${primitive('timingFunction', 'easeInOut')}, border-color ${primitive('duration', 200)} ${primitive('timingFunction', 'easeInOut')}`,
          hover: {
            bgColor: {
              light: primitive('color', 'neutral', 300),
              dark: primitive('color', 'neutral', 600),
            },
            borderColor: {
              light: primitive('color', 'neutral', 300),
              dark: primitive('color', 'neutral', 600),
            },
          },
          invalid: {
            bgColor: {
              light: primitive('color', 'danger', 200),
              dark: primitive('color', 'danger', 800),
            },
          },
          checked: {
            bgColor: {
              light: primitive('color', 'accent', 500),
              dark: primitive('color', 'accent', 400),
            },
            borderColor: {
              light: primitive('color', 'accent', 500),
              dark: primitive('color', 'accent', 400),
            },
            hover: {
              bgColor: {
                light: primitive('color', 'accent', 600),
                dark: primitive('color', 'accent', 300),
              },
              borderColor: {
                light: primitive('color', 'accent', 600),
                dark: primitive('color', 'accent', 300),
              },
            },
            invalid: {
              bgColor: {
                light: primitive('color', 'danger', 600),
                dark: primitive('color', 'danger', 400),
              },
            },
          },
        },
        thumb: {
          size: '24px',
          bgColor: primitive('color', 'white'),
          borderRadius: primitive('borderRadius', 'full'),
          shadow: '0 1px 3px rgb(0 0 0 / 20%)',
          transition: `transform ${primitive('duration', 200)} ${primitive('timingFunction', 'overshoot')}`,
          /**
           * How far the thumb slides each way from the center of the track,
           * which is where Charm's stylesheet parks it. Zinc had no equivalent
           * leaf, so without this we inherit Charm's `0` and the thumb never
           * moves - the track changes color and nothing else does.
           *
           * Half the difference between the track's width and its height is
           * the distance that leaves the same gap at the end of the travel as
           * the thumb already has above and below it, whatever those two are
           * set to: the thumb is a circle as tall as the track allows, so the
           * track's height is what decides its inset on every side.
           */
          transform: `calc((${varRef('switch', 'width')} - ${varRef('switch', 'height')}) / 2)`,
        },
        disabled: {
          opacity: '0.35',
        },
      },
      /** Zinc's `modal` - Charm registers this component as `dialog` */
      dialog: {
        marginTop: primitive('spacing', 16),
        paddingX: primitive('spacing', 32),
        paddingY: primitive('spacing', 32),
        headerGap: primitive('spacing', 20),
        titleFontSize: primitive('fontSize', 20),
        subtitleFontSize: semantic('body', 'fontSize'),
        titleGroupGap: primitive('spacing', 4),
        footerButtonGap: primitive('spacing', 12),
        borderRadius: primitive('borderRadius', 'lg'),
        bgColor: semantic('surface', 'default', 'bgColor'),
        fgColor: semantic('surface', 'default', 'fgColor'),
        shadow: primitive('shadow', 'modal'),
        dividerColor: primitive('color', 'neutral', 200),
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        animationDuration: primitive('duration', 200),
        transition: `opacity ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}, transform ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}`,
        /**
         * Drawers (`position="start|end|top|bottom"`) slide on `transform`
         * rather than fading in place, so Charm gives them their own timing.
         * Without this we inherit Charm's literal `0.25s ease-in-out`, which is
         * off the Zocdoc motion scale.
         */
        positionTransition: `opacity ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}, transform ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}`,
        enterSlideOffset: primitive('spacing', 16),
        mediaAspectRatio: '4 / 3',
      },
      tabs: {
        bgColor: primitive('color', 'transparent'),
        borderColor: primitive('color', 'transparent'),
        borderWidth: '0',
        borderRadius: '0',
        paddingX: '0',
        paddingY: '0',
        gap: '0',
        tablistGap: '0',
        tablistBorderWidth: primitive('borderWidth', 'sm'),
        tablistBorderColor: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 700),
        },
        tablistScrollbarThumbColor: {
          light: primitive('color', 'neutral', 300),
          dark: primitive('color', 'neutral', 600),
        },
        tablistScrollbarTrackColor: primitive('color', 'transparent'),
      },
      tab: {
        bgColor: primitive('color', 'transparent'),
        fgColor: {
          light: primitive('color', 'neutral', 700),
          dark: primitive('color', 'neutral', 300),
        },
        borderColor: primitive('color', 'transparent'),
        borderWidth: primitive('borderWidth', 'md'),
        borderRadius: '0',
        paddingX: primitive('spacing', 16),
        paddingY: primitive('spacing', 12),
        fontWeight: primitive('fontWeight', 'semibold'),
        hover: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('body', 'fgColor'),
          borderColor: {
            light: primitive('color', 'neutral', 300),
            dark: primitive('color', 'neutral', 600),
          },
          fontWeight: primitive('fontWeight', 'semibold'),
        },
        focus: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('body', 'fgColor'),
          borderColor: primitive('color', 'transparent'),
        },
        active: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('body', 'fgColor'),
          borderColor: semantic('body', 'fgColor'),
          fontWeight: primitive('fontWeight', 'semibold'),
        },
        disabled: {
          bgColor: primitive('color', 'transparent'),
          fgColor: {
            light: primitive('color', 'neutral', 400),
            dark: primitive('color', 'neutral', 600),
          },
          borderColor: primitive('color', 'transparent'),
          opacity: '1',
        },
      },
      tabPanel: {
        bgColor: primitive('color', 'transparent'),
        fgColor: semantic('body', 'fgColor'),
        borderColor: primitive('color', 'transparent'),
        borderWidth: '0',
        borderRadius: '0',
        paddingX: '0',
        paddingY: primitive('spacing', 16),
        minHeight: primitive('spacing', 48),
      },
      accordion: {
        topBorderColor: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 700),
        },
      },
      /**
       * Zinc's `accordion.trigger` is Charm's `accordionItem` (the trigger row);
       * Zinc's `accordion.panel` and `accordion.transition` nest under it as
       * `panel` and Charm's existing `animation` group.
       */
      accordionItem: {
        bgColor: primitive('color', 'transparent'),
        fgColor: semantic('body', 'fgColor'),
        borderColor: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 700),
        },
        borderWidth: primitive('borderWidth', 'sm'),
        borderRadius: primitive('borderRadius', 'none'),
        fontFamily: semantic('body', 'fontFamily'),
        fontSize: semantic('body', 'fontSize'),
        fontWeight: primitive('fontWeight', 'semibold'),
        lineHeight: semantic('body', 'lineHeight'),
        paddingX: primitive('spacing', 16),
        paddingY: primitive('spacing', 12),
        hover: {
          bgColor: {
            light: primitive('color', 'neutral', 50),
            dark: primitive('color', 'neutral', 800),
          },
        },
        active: {
          bgColor: {
            light: primitive('color', 'neutral', 100),
            dark: primitive('color', 'neutral', 900),
          },
        },
        disabled: {
          fgColor: {
            light: primitive('color', 'neutral', 400),
            dark: primitive('color', 'neutral', 600),
          },
        },
        panel: {
          bgColor: primitive('color', 'transparent'),
          fgColor: semantic('body', 'fgColor'),
          paddingX: primitive('spacing', 16),
          paddingY: primitive('spacing', 12),
        },
        animation: {
          duration: primitive('duration', 200),
          timingFunction: primitive('timingFunction', 'easeInOut'),
        },
      },
      tooltip: {
        bgColor: {
          light: primitive('color', 'neutral', 800),
          dark: primitive('color', 'neutral', 200),
        },
        fgColor: {
          light: semantic('color', 'on', 'neutral', 800),
          dark: semantic('color', 'on', 'neutral', 200),
        },
        padding: primitive('spacing', 12),
        fontSize: primitive('fontSize', 14),
        lineHeight: primitive('lineHeight', 'tight'),
        borderRadius: primitive('borderRadius', 'sm'),
        maxWidth: '20rem',
        showTransition: `opacity ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}`,
        hideTransition: `opacity ${primitive('duration', 150)} ${primitive('timingFunction', 'easeIn')}`,
        enterSlideOffset: primitive('spacing', 4),
      },
      badge: {
        fontSize: semantic('typography', 'label', 'md', 'fontSize'),
        fontWeight: primitive('fontWeight', 'medium'),
        borderRadius: primitive('borderRadius', 'sm'),
        padding: `${primitive('spacing', 4)} ${primitive('spacing', 4)}`,
        paddingX: primitive('spacing', 4),
        paddingY: primitive('spacing', 4),
        iconSize: primitive('fontSize', '16'),
        neutral: {
          bgColor: {
            light: primitive('color', 'neutral', 200),
            dark: primitive('color', 'neutral', 800),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 200),
            dark: semantic('color', 'on', 'neutral', 800),
          },
        },
        inverse: {
          bgColor: {
            light: primitive('color', 'neutral', 800),
            dark: primitive('color', 'neutral', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'neutral', 800),
            dark: semantic('color', 'on', 'neutral', 200),
          },
        },
        info: {
          bgColor: {
            light: primitive('color', 'info', 100),
            dark: primitive('color', 'info', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'info', 100),
            dark: semantic('color', 'on', 'info', 200),
          },
        },
        success: {
          bgColor: {
            light: primitive('color', 'success', 100),
            dark: primitive('color', 'success', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'success', 100),
            dark: semantic('color', 'on', 'success', 200),
          },
        },
        danger: {
          bgColor: {
            light: primitive('color', 'danger', 100),
            dark: primitive('color', 'danger', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'danger', 100),
            dark: semantic('color', 'on', 'danger', 200),
          },
        },
        warning: {
          bgColor: {
            light: primitive('color', 'warning', 100),
            dark: primitive('color', 'warning', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'warning', 100),
            dark: semantic('color', 'on', 'warning', 200),
          },
        },
        caution: {
          bgColor: {
            light: primitive('color', 'caution', 100),
            dark: primitive('color', 'caution', 200),
          },
          fgColor: {
            light: semantic('color', 'on', 'caution', 100),
            dark: semantic('color', 'on', 'caution', 200),
          },
        },
        brand: {
          bgColor: {
            light: primitive('color', 'brand', 500),
            dark: primitive('color', 'brand', 300),
          },
          fgColor: {
            light: semantic('color', 'on', 'brand', 500),
            dark: semantic('color', 'on', 'brand', 300),
          },
        },
      },
      /**
       * Charm's alert has no severity concept at all: `politeness` changes how
       * the alert is announced, not how it looks, so a failed request renders on
       * the same neutral surface as ordinary page content. These groups give
       * each severity a tint, read by `:host([variant='…'])` in
       * `alert.styles.ts` - see `alertVariant` above for why they are tints and
       * not fills.
       *
       * Only the colors are named. Charm's padding, font sizes, icon size, and
       * transition deep-merge through unchanged, so an alert's shape does not
       * depend on whether it has a severity.
       */
      alert: {
        buttonBgColor: 'transparent',
        buttonPadding: primitive('spacing', 8),
        info: alertVariant('info'),
        success: alertVariant('success'),
        warning: alertVariant('warning'),
        danger: alertVariant('danger'),
      },
      /**
       * Charm ships a full `breadcrumb.item` group, so this only names the
       * values that don't work for a trail of text labels. The gap, padding, and
       * the hover/active/focus/disabled colors deep-merge through from Charm
       * unchanged.
       */
      breadcrumb: {
        item: {
          /**
           * Charm defaults this to `24px`. Charm's `.content` is
           * `overflow: hidden` with `text-overflow: ellipsis`, so that clips
           * every item to roughly one character. An item is a label, so it sizes
           * to its text; a consumer that wants truncation constrains the host.
           */
          controlWidth: 'auto',
          /**
           * Override Charm's default to meet 4.5:1 contrast (WCAG AA).
           * Charm's default is too light at 3.18:1.
           */
          fgColor: {
            light: primitive('color', 'neutral', 700),
            dark: primitive('color', 'neutral', 200),
          },
          /**
           * Charm's item paints a hover background but has no radius token, so
           * the highlight comes out as a hard-edged block. Read by
           * `breadcrumb-item.styles.ts`, not by Charm.
           */
          borderRadius: primitive('borderRadius', 'sm'),
          /**
           * Also read by `breadcrumb-item.styles.ts`. Charm marks the trailing
           * item with `current="page"` for assistive tech but styles it like
           * every other item, so the page you are on reads as one more link in
           * the trail.
           */
          current: {
            fgColor: semantic('text', 'primary'),
            fontWeight: primitive('fontWeight', 'medium'),
          },
        },
      },
      /**
       * Charm's icon is a `1em` box with no tokens of its own, so these only
       * apply when `<zd-icon>` is given an explicit `size` - an icon inside a
       * button or a label keeps scaling with its text.
       */
      icon: {
        size: primitive('fontSize', '20'),
        small: {
          size: primitive('fontSize', '16'),
        },
        large: {
          size: primitive('fontSize', '24'),
        },
      },
      /**
       * Avatar with initials needs contrast-safe colors. Charm's default
       * puts white text on a mid-gray background, falling short of 4.5:1.
       * Using neutral-700 (#737373) to achieve 4.7:1 contrast with white.
       */
      avatar: {
        bgColor: {
          light: primitive('color', 'neutral', 700),
          dark: primitive('color', 'neutral', 700),
        },
        fgColor: {
          light: primitive('color', 'white'),
          dark: primitive('color', 'white'),
        },
      },
      card: {
        borderRadius: primitive('borderRadius', 'lg'),
        borderWidth: semantic('elevation', 'raised', 'borderWidth'),
        borderColor: {
          light: primitive('color', 'neutral', 300),
          dark: primitive('color', 'neutral', 600),
        },
        borderStyle: semantic('defaultBorder', 'style'),
        bgColor: semantic('elevation', 'raised', 'bgColor'),
        fgColor: semantic('elevation', 'raised', 'fgColor'),
        padding: primitive('spacing', 16),
        shadow: semantic('elevation', 'raised', 'shadow'),
        headingPaddingX: primitive('spacing', 0),
        headingPaddingY: primitive('spacing', 0),
        bodyPaddingX: primitive('spacing', 0),
        bodyPaddingY: primitive('spacing', 0),
      },
      /**
       * Zinc's `popover` values. Charm registers no `popover` component - it
       * splits the job between `popup` (positioning, arrow, elevation) and
       * whatever surface is slotted into one, of which `menu` is the built-in.
       * These are Zinc's numbers under Charm's names so they actually reach a
       * component; a bespoke popover built from `<zd-popup>` + `<zd-card>` picks
       * up the card tokens instead.
       */
      popup: {
        arrowColor: semantic('surface', 'default', 'bgColor'),
        arrowSize: '8px',
        /**
         * A `filter` value, not a `box-shadow` — Charm applies this with
         * `filter` so the shadow can follow the panel's border radius and the
         * arrow. `primitive('shadow', 'overlay')` is therefore the wrong shape:
         * `drop-shadow()` takes a single shadow with no spread, so a two-layer
         * box-shadow list makes the whole declaration invalid.
         *
         * Left off because `menu.shadow` already draws `shadow.overlay` on the
         * panel, so enabling both would double every menu shadow. If we ever
         * want popup to own it instead, `shadow.overlay` has zero spread on both
         * layers and so does convert cleanly:
         *   drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.04))
         *   drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.08))
         * — and `menu.shadow` would need to go to `none` in the same change.
         */
        dropShadow: 'none',
        showTransition: `opacity ${primitive('duration', 200)} ${primitive('timingFunction', 'easeOut')}`,
        hideTransition: `opacity ${primitive('duration', 150)} ${primitive('timingFunction', 'easeIn')}`,
      },
      menu: {
        bgColor: semantic('surface', 'default', 'bgColor'),
        borderRadius: primitive('borderRadius', 'lg'),
        borderColor: {
          light: primitive('color', 'neutral', 200),
          dark: primitive('color', 'neutral', 700),
        },
        borderStyle: semantic('defaultBorder', 'style'),
        borderWidth: semantic('defaultBorder', 'width'),
        shadow: primitive('shadow', 'overlay'),
        /**
         * Zinc's popover padding is 16px, which is the inset around a block of
         * prose. A menu's padding is the gutter around its items, so it stays
         * tight and the items carry their own padding.
         */
        popupPadding: primitive('spacing', 4),
      },
    };
  });

export { zocdocTokensBase };

export const zocdocTokenDefinition = zocdocTokensBase.definition;

export const zocdocTheme = generateThemeSync(zocdocTokenDefinition, { dryRun: true });

export const zocdocThemeCss: string = zocdocTheme.css ?? '';
export const zocdocResetCss: string = zocdocTheme.cssReset ?? '';
export const zocdocUtilitiesCss: string = zocdocTheme.cssUtilities ?? '';

export const zocdocAllCss: string = [zocdocThemeCss, zocdocResetCss, zocdocUtilitiesCss].join('\n');
