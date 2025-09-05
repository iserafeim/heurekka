---
title: Color Token Specifications
description: Complete color palette and token definitions for the Heurekka design system
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ../../assets/design-tokens.json
  - ../style-guide.md
status: approved
---

# Color Token Specifications

## Overview
The Heurekka color system provides a comprehensive palette that supports brand expression, functional communication, and accessibility requirements across all platforms.

## Table of Contents
1. [Color Philosophy](#color-philosophy)
2. [Primary Palette](#primary-palette)
3. [Secondary Palette](#secondary-palette)
4. [Semantic Colors](#semantic-colors)
5. [Neutral Palette](#neutral-palette)
6. [Gradient System](#gradient-system)
7. [Theme Variations](#theme-variations)
8. [Accessibility Matrix](#accessibility-matrix)
9. [Usage Guidelines](#usage-guidelines)

## Color Philosophy

### Design Principles
- **Purposeful**: Every color serves a specific function
- **Accessible**: All combinations meet WCAG AA minimum
- **Scalable**: System supports theme variations
- **Harmonious**: Colors work together cohesively
- **Flexible**: Adapts to different contexts and platforms

### Color Psychology
- **Blue (Primary)**: Trust, reliability, professionalism
- **Green (Success)**: Growth, positivity, confirmation
- **Amber (Warning)**: Attention, caution, importance
- **Red (Error)**: Urgency, error, critical action
- **Purple (Accent)**: Innovation, premium, special features

## Primary Palette

### Primary Blue Scale
```scss
--color-primary-50:  #E6F0FF;  // Lightest tint
--color-primary-100: #BAD4FF;  // Very light
--color-primary-200: #8AB7FF;  // Light
--color-primary-300: #5A9AFF;  // Light medium
--color-primary-400: #2E7EFF;  // Medium
--color-primary-500: #0066FF;  // Base (Brand Primary)
--color-primary-600: #0052CC;  // Dark medium
--color-primary-700: #003D99;  // Dark
--color-primary-800: #002966;  // Very dark
--color-primary-900: #001433;  // Darkest shade
```

### Usage
- **Primary-500**: Main brand color, primary CTAs
- **Primary-600**: Hover states for primary elements
- **Primary-700**: Active/pressed states
- **Primary-100/200**: Background tints, highlights
- **Primary-800/900**: High contrast text on light backgrounds

## Secondary Palette

### Secondary Purple Scale
```scss
--color-secondary-50:  #F3E6FF;
--color-secondary-100: #E0BFFF;
--color-secondary-200: #CC99FF;
--color-secondary-300: #B873FF;
--color-secondary-400: #A44DFF;
--color-secondary-500: #9333FF;  // Base
--color-secondary-600: #7A29D6;
--color-secondary-700: #5F1FAD;
--color-secondary-800: #451684;
--color-secondary-900: #2B0C5B;
```

### Accent Teal Scale
```scss
--color-accent-50:  #E6FFFA;
--color-accent-100: #B3FFE6;
--color-accent-200: #80FFD4;
--color-accent-300: #4DFFC2;
--color-accent-400: #1AFFB0;
--color-accent-500: #00E6A0;  // Base
--color-accent-600: #00B380;
--color-accent-700: #008060;
--color-accent-800: #004D40;
--color-accent-900: #001A20;
```

## Semantic Colors

### Success Colors
```scss
--color-success-light:  #E8F5E9;  // Background
--color-success-main:   #4CAF50;  // Default
--color-success-dark:   #2E7D32;  // Emphasis
--color-success-darker: #1B5E20;  // High contrast
```

### Warning Colors
```scss
--color-warning-light:  #FFF3E0;  // Background
--color-warning-main:   #FF9800;  // Default
--color-warning-dark:   #F57C00;  // Emphasis
--color-warning-darker: #E65100;  // High contrast
```

### Error Colors
```scss
--color-error-light:  #FFEBEE;  // Background
--color-error-main:   #F44336;  // Default
--color-error-dark:   #D32F2F;  // Emphasis
--color-error-darker: #B71C1C;  // High contrast
```

### Info Colors
```scss
--color-info-light:  #E3F2FD;  // Background
--color-info-main:   #2196F3;  // Default
--color-info-dark:   #1976D2;  // Emphasis
--color-info-darker: #1565C0;  // High contrast
```

## Neutral Palette

### Gray Scale
```scss
--color-neutral-0:    #FFFFFF;  // White
--color-neutral-50:   #FAFAFA;  // Off-white
--color-neutral-100:  #F5F5F5;  // Light gray
--color-neutral-200:  #EEEEEE;  // Gray 200
--color-neutral-300:  #E0E0E0;  // Gray 300
--color-neutral-400:  #BDBDBD;  // Gray 400
--color-neutral-500:  #9E9E9E;  // Mid gray
--color-neutral-600:  #757575;  // Gray 600
--color-neutral-700:  #616161;  // Gray 700
--color-neutral-800:  #424242;  // Dark gray
--color-neutral-900:  #212121;  // Near black
--color-neutral-1000: #000000;  // Black
```

### Semantic Neutral Tokens
```scss
// Text Colors
--color-text-primary:   var(--color-neutral-900);   // Main text
--color-text-secondary: var(--color-neutral-600);   // Secondary text
--color-text-tertiary:  var(--color-neutral-500);   // Disabled/hint
--color-text-inverse:   var(--color-neutral-0);     // On dark backgrounds

// Background Colors
--color-background-primary:   var(--color-neutral-0);    // Main background
--color-background-secondary: var(--color-neutral-50);   // Alternate sections
--color-background-tertiary:  var(--color-neutral-100);  // Cards, wells
--color-background-elevated:  var(--color-neutral-0);    // Modals, dropdowns

// Border Colors
--color-border-light:  var(--color-neutral-200);  // Subtle borders
--color-border-medium: var(--color-neutral-300);  // Default borders
--color-border-strong: var(--color-neutral-400);  // Emphasis borders
```

## Gradient System

### Primary Gradients
```scss
--gradient-primary: linear-gradient(135deg, #0066FF 0%, #9333FF 100%);
--gradient-secondary: linear-gradient(135deg, #00E6A0 0%, #0066FF 100%);
--gradient-accent: linear-gradient(135deg, #FF9800 0%, #F44336 100%);
```

### Overlay Gradients
```scss
--gradient-overlay-light: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%);
--gradient-overlay-dark: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
--gradient-scrim: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
```

### Mesh Gradients
```scss
--gradient-mesh-primary: radial-gradient(at 40% 20%, #E6F0FF 0px, transparent 50%),
                         radial-gradient(at 80% 0%, #E0BFFF 0px, transparent 50%),
                         radial-gradient(at 10% 50%, #B3FFE6 0px, transparent 50%);
```

## Theme Variations

### Light Theme (Default)
```scss
--theme-background: var(--color-neutral-0);
--theme-surface: var(--color-neutral-0);
--theme-surface-variant: var(--color-neutral-50);
--theme-primary: var(--color-primary-500);
--theme-text-primary: var(--color-neutral-900);
--theme-text-secondary: var(--color-neutral-600);
--theme-border: var(--color-neutral-300);
```

### Dark Theme
```scss
--theme-background: var(--color-neutral-900);
--theme-surface: var(--color-neutral-800);
--theme-surface-variant: var(--color-neutral-700);
--theme-primary: var(--color-primary-400);
--theme-text-primary: var(--color-neutral-50);
--theme-text-secondary: var(--color-neutral-400);
--theme-border: var(--color-neutral-600);
```

### High Contrast Theme
```scss
--theme-background: var(--color-neutral-0);
--theme-surface: var(--color-neutral-0);
--theme-primary: var(--color-primary-700);
--theme-text-primary: var(--color-neutral-1000);
--theme-text-secondary: var(--color-neutral-800);
--theme-border: var(--color-neutral-900);
```

## Accessibility Matrix

### WCAG AA Compliant Combinations

#### On White Background (#FFFFFF)
| Text Color | Contrast Ratio | Use Case |
|------------|---------------|-----------|
| Primary-600 | 4.5:1 | Body text |
| Primary-700 | 7.1:1 | Headers |
| Neutral-600 | 4.5:1 | Secondary text |
| Neutral-900 | 21:1 | Primary text |

#### On Primary Background (#0066FF)
| Text Color | Contrast Ratio | Use Case |
|------------|---------------|-----------|
| White | 4.7:1 | Button text |
| Neutral-50 | 4.5:1 | Secondary text |
| Accent-500 | 3.2:1 | Large text only |

### Color Blindness Considerations
- Avoid red-green combinations for critical distinctions
- Use patterns or icons alongside color coding
- Test with color blindness simulators
- Provide alternative visual cues

## Usage Guidelines

### Do's
- ✅ Use semantic colors for their intended purpose
- ✅ Maintain consistent color usage across the product
- ✅ Test color combinations for accessibility
- ✅ Use color to reinforce hierarchy
- ✅ Apply colors systematically through tokens

### Don'ts
- ❌ Create new colors outside the system
- ❌ Use color as the only differentiator
- ❌ Apply semantic colors decoratively
- ❌ Mix theme variations
- ❌ Hard-code color values

### Color Application Examples

#### Interactive Elements
```scss
.button-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  
  &:hover {
    background: var(--color-primary-600);
  }
  
  &:active {
    background: var(--color-primary-700);
  }
  
  &:disabled {
    background: var(--color-neutral-300);
    color: var(--color-neutral-500);
  }
}
```

#### Status Communication
```scss
.alert-success {
  background: var(--color-success-light);
  border-color: var(--color-success-main);
  color: var(--color-success-darker);
}

.alert-error {
  background: var(--color-error-light);
  border-color: var(--color-error-main);
  color: var(--color-error-darker);
}
```

#### Data Visualization
```scss
--chart-series-1: var(--color-primary-500);
--chart-series-2: var(--color-secondary-500);
--chart-series-3: var(--color-accent-500);
--chart-series-4: var(--color-warning-main);
--chart-series-5: var(--color-success-main);
```

## Related Documentation
- [Design Tokens Overview](./README.md) - Token system architecture
- [Typography Tokens](./typography.md) - Font specifications
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Accessibility Guidelines](../../accessibility/guidelines.md) - WCAG compliance

## Implementation Notes
Colors should always be applied through tokens, never hard-coded. When implementing, consider the context (light/dark theme) and ensure proper contrast ratios are maintained. Test across different displays and color profiles.

## Last Updated
2025-01-04 - Complete color token specification