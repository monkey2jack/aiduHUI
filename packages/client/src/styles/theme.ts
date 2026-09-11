import type { GlobalThemeOverrides } from 'naive-ui'
import {
  resolveThemeCustomization,
  type ThemeCustomization,
} from './theme-customization'

/**
 * aiduHUI brand typography — Apple system stack everywhere.
 *
 * Mirrors the aiduPARK VI rule: SF Pro for Latin, PingFang SC for Chinese,
 * with graceful off-Apple fallbacks. One Apple voice across the whole UI.
 */
export const BRAND_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif'
export const BRAND_FONT_MONO =
  'SF Mono, Menlo, Monaco, "PingFang SC", Consolas, "Liberation Mono", monospace'

/** aiduHUI brand tricolour (inherited from aiduPARK, do not extend). */
export const BRAND_BLUE = '#1f4e79'
export const BRAND_BLUE_HOVER = '#2a6296'
export const BRAND_BLUE_PRESSED = '#16395a'
export const BRAND_GRAY = '#525252'
export const BRAND_INK = '#000000'

/** Dark-mode blue: same hue, lifted for contrast on dark surfaces. */
export const BRAND_BLUE_DARK = '#6ba3d0'
export const BRAND_BLUE_DARK_HOVER = '#8cbde3'
export const BRAND_BLUE_DARK_PRESSED = '#4a86b8'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: BRAND_BLUE,
    primaryColorHover: BRAND_BLUE_HOVER,
    primaryColorPressed: BRAND_BLUE_PRESSED,
    primaryColorSuppl: BRAND_BLUE,
    bodyColor: '#fafafa',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f0f0f0',
    textColorBase: '#1a1a1a',
    textColor1: '#1a1a1a',
    textColor2: '#666666',
    textColor3: '#999999',
    dividerColor: '#e0e0e0',
    borderColor: '#e0e0e0',
    hoverColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '36px',
    fontFamily: BRAND_FONT,
    fontFamilyMono: BRAND_FONT_MONO,
  },
  Layout: {
    color: '#fafafa',
    siderColor: '#f5f5f5',
    headerColor: '#fafafa',
  },
  Menu: {
    itemTextColorActive: BRAND_BLUE,
    itemTextColorActiveHover: BRAND_BLUE_HOVER,
    itemTextColorChildActive: BRAND_BLUE,
    itemIconColorActive: BRAND_BLUE,
    itemIconColorActiveHover: BRAND_BLUE_HOVER,
    itemColorActive: 'rgba(31, 78, 121, 0.08)',
    itemColorActiveHover: 'rgba(31, 78, 121, 0.12)',
    arrowColorActive: BRAND_BLUE,
  },
  Button: {
    textColorPrimary: '#ffffff',
    colorPrimary: BRAND_BLUE,
    colorHoverPrimary: BRAND_BLUE_HOVER,
    colorPressedPrimary: BRAND_BLUE_PRESSED,
  },
  Input: {
    color: '#ffffff',
    colorFocus: '#ffffff',
    border: '1px solid #e0e0e0',
    borderHover: '1px solid #999999',
    borderFocus: `1px solid ${BRAND_BLUE}`,
    borderDisabled: '1px solid #ebebeb',
    groupLabelBorder: '1px solid #e0e0e0',
    placeholderColor: '#999999',
    caretColor: BRAND_BLUE,
  },
  InternalSelection: {
    border: '1px solid #e0e0e0',
    borderHover: '1px solid #999999',
    borderActive: `1px solid ${BRAND_BLUE}`,
    borderFocus: `1px solid ${BRAND_BLUE}`,
  },
  Card: {
    color: '#ffffff',
    borderColor: '#e0e0e0',
  },
  Modal: {
    color: '#ffffff',
  },
  Tag: {
    borderRadius: '6px',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: BRAND_BLUE_DARK,
    primaryColorHover: BRAND_BLUE_DARK_HOVER,
    primaryColorPressed: BRAND_BLUE_DARK_PRESSED,
    primaryColorSuppl: BRAND_BLUE_DARK,
    bodyColor: '#1a1a1a',
    cardColor: '#2a2a2a',
    modalColor: '#2a2a2a',
    popoverColor: '#2a2a2a',
    tableColor: '#2a2a2a',
    inputColor: '#2a2a2a',
    actionColor: '#252525',
    textColorBase: '#e0e0e0',
    textColor1: '#e0e0e0',
    textColor2: '#a0a0a0',
    textColor3: '#666666',
    dividerColor: '#3a3a3a',
    borderColor: '#3a3a3a',
    hoverColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '36px',
    fontFamily: BRAND_FONT,
    fontFamilyMono: BRAND_FONT_MONO,
  },
  Layout: {
    color: '#1a1a1a',
    siderColor: '#202020',
    headerColor: '#1a1a1a',
  },
  Menu: {
    itemTextColorActive: BRAND_BLUE_DARK,
    itemTextColorActiveHover: BRAND_BLUE_DARK_HOVER,
    itemTextColorChildActive: BRAND_BLUE_DARK,
    itemIconColorActive: BRAND_BLUE_DARK,
    itemIconColorActiveHover: BRAND_BLUE_DARK_HOVER,
    itemColorActive: 'rgba(107, 163, 208, 0.12)',
    itemColorActiveHover: 'rgba(107, 163, 208, 0.18)',
    arrowColorActive: BRAND_BLUE_DARK,
  },
  Button: {
    textColorPrimary: '#ffffff',
    colorPrimary: BRAND_BLUE,
    colorHoverPrimary: BRAND_BLUE_HOVER,
    colorPressedPrimary: BRAND_BLUE_PRESSED,
  },
  Input: {
    color: '#2a2a2a',
    colorFocus: '#2a2a2a',
    border: '1px solid #555555',
    borderHover: '1px solid #777777',
    borderFocus: `1px solid ${BRAND_BLUE_DARK}`,
    borderDisabled: '1px solid #3a3a3a',
    groupLabelBorder: '1px solid #555555',
    placeholderColor: '#666666',
    caretColor: BRAND_BLUE_DARK,
  },
  InternalSelection: {
    border: '1px solid #555555',
    borderHover: '1px solid #777777',
    borderActive: `1px solid ${BRAND_BLUE_DARK}`,
    borderFocus: `1px solid ${BRAND_BLUE_DARK}`,
  },
  Card: {
    color: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  Modal: {
    color: '#2a2a2a',
  },
  Tag: {
    borderRadius: '6px',
  },
  Switch: {
    railColor: '#3a3a3a',
    railColorActive: BRAND_BLUE_DARK,
    loadingColor: BRAND_BLUE_DARK,
    opacityDisabled: 0.4,
  },
}

export function getThemeOverrides(
  isDark: boolean,
  isComic?: boolean,
  customization?: ThemeCustomization,
): GlobalThemeOverrides {
  const base = isDark ? darkThemeOverrides : lightThemeOverrides
  if (!isComic && !customization) return base
  // aiduHUI keeps the Apple voice even in comic mode — only the accent shifts.
  const comicFont = BRAND_FONT
  const custom = customization ? resolveThemeCustomization(customization, isDark) : null
  const common = {
    ...base.common!,
    ...(isComic ? { fontFamily: comicFont } : {}),
    ...(custom ? {
      fontSize: `${custom.fontSize}px`,
      fontSizeMedium: `${custom.fontSize}px`,
    } : {}),
    ...(custom?.textPrimary ? {
      textColorBase: custom.textPrimary,
      textColor1: custom.textPrimary,
      textColor2: custom.textSecondary,
      textColor3: custom.textMuted,
    } : {}),
    ...(custom?.accentPrimary ? {
      primaryColor: custom.accentPrimary,
      primaryColorHover: custom.accentHover,
      primaryColorPressed: custom.accentHover,
      primaryColorSuppl: custom.accentPrimary,
    } : {}),
  }
  const input = custom?.textPrimary || custom?.accentPrimary
    ? {
        ...base.Input,
        ...(custom?.textPrimary ? {
          textColor: custom.textPrimary,
          placeholderColor: custom.textMuted,
          caretColor: custom.textPrimary,
        } : {}),
        ...(custom?.accentPrimary && custom.accentPrimaryRgb ? {
          border: `1px solid rgba(${custom.accentPrimaryRgb}, 0.18)`,
          borderHover: `1px solid rgba(${custom.accentPrimaryRgb}, 0.32)`,
          borderFocus: `1px solid ${custom.accentPrimary}`,
          groupLabelBorder: `1px solid rgba(${custom.accentPrimaryRgb}, 0.18)`,
        } : {}),
      }
    : null
  const internalSelection = custom?.textPrimary || custom?.accentPrimary
    ? {
        ...base.InternalSelection,
        ...(custom?.textPrimary ? {
          textColor: custom.textPrimary,
          placeholderColor: custom.textMuted,
          placeholderColorDisabled: custom.textMuted,
          caretColor: custom.textPrimary,
        } : {}),
        ...(custom?.accentPrimary && custom.accentPrimaryRgb ? {
          border: `1px solid rgba(${custom.accentPrimaryRgb}, 0.18)`,
          borderHover: `1px solid rgba(${custom.accentPrimaryRgb}, 0.32)`,
          borderActive: `1px solid ${custom.accentPrimary}`,
          borderFocus: `1px solid ${custom.accentPrimary}`,
          boxShadowActive: `0 0 0 2px rgba(${custom.accentPrimaryRgb}, 0.2)`,
          boxShadowFocus: `0 0 0 2px rgba(${custom.accentPrimaryRgb}, 0.2)`,
          loadingColor: custom.accentPrimary,
        } : {}),
      }
    : null

  return {
    ...base,
    common,
    ...(input ? { Input: input } : {}),
    ...(internalSelection ? { InternalSelection: internalSelection } : {}),
    ...(custom?.accentPrimary ? {
      Button: {
        ...base.Button,
        textColorPrimary: custom.textOnAccent,
        colorPrimary: custom.accentPrimary,
        colorHoverPrimary: custom.accentHover,
        colorPressedPrimary: custom.accentHover,
      },
      Switch: {
        ...base.Switch,
        railColorActive: custom.accentPrimary,
        loadingColor: custom.accentPrimary,
        boxShadowFocus: custom.accentPrimaryRgb
          ? `0 0 0 2px rgba(${custom.accentPrimaryRgb}, 0.3)`
          : base.Switch?.boxShadowFocus,
      },
    } : {}),
  }
}
