---
title: Typography Token Specifications
description: Complete typography system and token definitions for the Heurekka design system
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./colors.md
  - ../../assets/design-tokens.json
status: approved
---

# Typography Token Specifications

## Overview
The Heurekka typography system establishes a clear hierarchy and reading experience through carefully selected typefaces, scales, and spacing that work harmoniously across all platforms and screen sizes.

## Table of Contents
1. [Typography Philosophy](#typography-philosophy)
2. [Font Families](#font-families)
3. [Type Scale](#type-scale)
4. [Font Weights](#font-weights)
5. [Line Heights](#line-heights)
6. [Letter Spacing](#letter-spacing)
7. [Responsive Typography](#responsive-typography)
8. [Typography Combinations](#typography-combinations)
9. [Platform Specifications](#platform-specifications)
10. [Usage Guidelines](#usage-guidelines)

## Typography Philosophy

### Design Principles
- **Clarity First**: Optimal readability across all contexts
- **Hierarchical**: Clear distinction between content levels
- **Responsive**: Scales appropriately across devices
- **Accessible**: Meets WCAG guidelines for readability
- **Performant**: Optimized font loading strategies

### Typography Goals
- Support extended reading without fatigue
- Provide clear visual hierarchy for scanning
- Maintain consistency across platforms
- Enable brand expression through type
- Ensure international character support

## Font Families

### Primary Font Stack
```scss
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                       'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                       'Droid Sans', 'Helvetica Neue', sans-serif;
```

#### Inter Font Features
- **Variable Font**: Weight axis from 100-900
- **OpenType Features**: Tabular numbers, fractions, alternates
- **Character Set**: Extended Latin, Cyrillic, Greek
- **Optimized Metrics**: Designed for UI

### Secondary Font Stack (Display)
```scss
--font-family-display: 'Plus Jakarta Sans', 'Inter', -apple-system, 
                       BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Monospace Font Stack
```scss
--font-family-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata',
                    'Courier New', monospace;
```

### System Font Fallbacks
```scss
// iOS
--font-family-ios: -apple-system, 'SF Pro Text', 'SF Pro Display';

// Android
--font-family-android: 'Roboto', 'Noto Sans';

// Windows
--font-family-windows: 'Segoe UI', 'Segoe UI Variable';
```

## Type Scale

### Modular Scale (1.25 Ratio)
```scss
// Display Sizes
--font-size-display-large:  3.815rem;  // 61px
--font-size-display-medium: 3.052rem;  // 49px
--font-size-display-small:  2.441rem;  // 39px

// Heading Sizes
--font-size-h1: 1.953rem;  // 31px
--font-size-h2: 1.563rem;  // 25px
--font-size-h3: 1.25rem;   // 20px
--font-size-h4: 1rem;      // 16px
--font-size-h5: 0.8rem;    // 13px
--font-size-h6: 0.64rem;   // 10px

// Body Sizes
--font-size-body-large: 1.125rem;  // 18px
--font-size-body:       1rem;      // 16px (base)
--font-size-body-small: 0.875rem;  // 14px
--font-size-caption:    0.75rem;   // 12px
--font-size-overline:   0.625rem;  // 10px

// Component Sizes
--font-size-button:       0.875rem;  // 14px
--font-size-input:        1rem;      // 16px
--font-size-label:        0.75rem;   // 12px
--font-size-helper:       0.75rem;   // 12px
--font-size-tooltip:      0.75rem;   // 12px
--font-size-badge:        0.625rem;  // 10px
```

### Fluid Type Scale
```scss
// Responsive sizing with clamp()
--font-size-display-fluid: clamp(2.441rem, 5vw, 3.815rem);
--font-size-h1-fluid: clamp(1.563rem, 3vw, 1.953rem);
--font-size-h2-fluid: clamp(1.25rem, 2.5vw, 1.563rem);
--font-size-body-fluid: clamp(0.875rem, 1.5vw, 1rem);
```

## Font Weights

### Weight Scale
```scss
--font-weight-thin:       100;
--font-weight-extralight: 200;
--font-weight-light:      300;
--font-weight-regular:    400;  // Default
--font-weight-medium:     500;
--font-weight-semibold:   600;
--font-weight-bold:       700;
--font-weight-extrabold:  800;
--font-weight-black:      900;
```

### Semantic Weight Tokens
```scss
--font-weight-body:     var(--font-weight-regular);
--font-weight-emphasis: var(--font-weight-medium);
--font-weight-heading:  var(--font-weight-semibold);
--font-weight-display:  var(--font-weight-bold);
--font-weight-button:   var(--font-weight-medium);
--font-weight-label:    var(--font-weight-medium);
```

## Line Heights

### Line Height Scale
```scss
--line-height-none:    1;
--line-height-tight:   1.25;
--line-height-snug:    1.375;
--line-height-normal:  1.5;   // Default
--line-height-relaxed: 1.625;
--line-height-loose:   1.75;
--line-height-double:  2;
```

### Contextual Line Heights
```scss
// Headings (tighter)
--line-height-display: var(--line-height-none);
--line-height-h1:      var(--line-height-tight);
--line-height-h2:      var(--line-height-tight);
--line-height-h3:      var(--line-height-snug);
--line-height-h4:      var(--line-height-snug);
--line-height-h5:      var(--line-height-normal);
--line-height-h6:      var(--line-height-normal);

// Body (optimal reading)
--line-height-body-large: var(--line-height-loose);
--line-height-body:       var(--line-height-relaxed);
--line-height-body-small: var(--line-height-normal);

// Components
--line-height-button: var(--line-height-normal);
--line-height-input:  var(--line-height-normal);
--line-height-label:  var(--line-height-tight);
```

## Letter Spacing

### Letter Spacing Scale
```scss
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight:   -0.025em;
--letter-spacing-normal:   0;        // Default
--letter-spacing-wide:     0.025em;
--letter-spacing-wider:    0.05em;
--letter-spacing-widest:   0.1em;
```

### Contextual Letter Spacing
```scss
// Headings (tighter for larger sizes)
--letter-spacing-display: var(--letter-spacing-tighter);
--letter-spacing-h1:      var(--letter-spacing-tight);
--letter-spacing-h2:      var(--letter-spacing-tight);
--letter-spacing-h3:      var(--letter-spacing-normal);

// Body (normal)
--letter-spacing-body: var(--letter-spacing-normal);

// Special
--letter-spacing-button:   var(--letter-spacing-wide);
--letter-spacing-label:    var(--letter-spacing-wider);
--letter-spacing-overline: var(--letter-spacing-widest);
--letter-spacing-mono:     var(--letter-spacing-normal);
```

## Responsive Typography

### Mobile (320px - 767px)
```scss
@media (max-width: 767px) {
  :root {
    --font-size-base: 14px;  // Smaller base
    --font-size-h1: 1.602rem;
    --font-size-h2: 1.424rem;
    --font-size-h3: 1.125rem;
    --font-size-body: 1rem;
    --line-height-body: 1.5;
  }
}
```

### Tablet (768px - 1023px)
```scss
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --font-size-base: 15px;
    --font-size-h1: 1.802rem;
    --font-size-h2: 1.5rem;
    --font-size-h3: 1.25rem;
    --font-size-body: 1rem;
    --line-height-body: 1.6;
  }
}
```

### Desktop (1024px+)
```scss
@media (min-width: 1024px) {
  :root {
    --font-size-base: 16px;  // Optimal reading
    --font-size-h1: 1.953rem;
    --font-size-h2: 1.563rem;
    --font-size-h3: 1.25rem;
    --font-size-body: 1rem;
    --line-height-body: 1.625;
  }
}
```

### Wide Screens (1440px+)
```scss
@media (min-width: 1440px) {
  :root {
    --font-size-base: 16px;
    --max-content-width: 65ch;  // Optimal line length
  }
}
```

## Typography Combinations

### Display Title
```scss
.text-display {
  font-family: var(--font-family-display);
  font-size: var(--font-size-display-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-display);
  letter-spacing: var(--letter-spacing-display);
}
```

### Page Heading
```scss
.text-h1 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-h1);
  letter-spacing: var(--letter-spacing-h1);
}
```

### Body Text
```scss
.text-body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-body);
  line-height: var(--line-height-body);
  letter-spacing: var(--letter-spacing-body);
}
```

### UI Elements
```scss
.text-button {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-button);
  line-height: var(--line-height-button);
  letter-spacing: var(--letter-spacing-button);
  text-transform: none;
}

.text-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-label);
  line-height: var(--line-height-label);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
}
```

### Code Blocks
```scss
.text-code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-relaxed);
  letter-spacing: var(--letter-spacing-mono);
}
```

## Platform Specifications

### iOS (SF Pro)
```swift
// System font with dynamic type
let headline = UIFont.preferredFont(forTextStyle: .headline)
let body = UIFont.preferredFont(forTextStyle: .body)
let caption = UIFont.preferredFont(forTextStyle: .caption1)

// Custom sizes
let displayFont = UIFont.systemFont(ofSize: 34, weight: .bold)
let titleFont = UIFont.systemFont(ofSize: 28, weight: .semibold)
```

### Android (Roboto)
```xml
<!-- Text appearances -->
<style name="TextAppearance.Heurekka.Headline1">
    <item name="android:textSize">32sp</item>
    <item name="android:fontFamily">@font/roboto_medium</item>
    <item name="android:letterSpacing">-0.025</item>
</style>

<style name="TextAppearance.Heurekka.Body1">
    <item name="android:textSize">16sp</item>
    <item name="android:fontFamily">@font/roboto_regular</item>
    <item name="android:lineSpacingMultiplier">1.5</item>
</style>
```

### Web Font Loading Strategy
```scss
// Progressive font loading
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;  // Avoid FOIT
}

// Critical font subset
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-subset.woff2') format('woff2');
  unicode-range: U+0020-007F;  // Basic Latin
  font-display: swap;
}
```

## Usage Guidelines

### Best Practices
- ✅ Use semantic HTML tags (h1-h6, p, etc.)
- ✅ Maintain consistent hierarchy throughout
- ✅ Limit to 2-3 font weights per page
- ✅ Keep line length between 45-75 characters
- ✅ Use system fonts for better performance

### Accessibility Considerations
- Minimum font size: 14px for body text
- Line height minimum: 1.5 for body text
- Sufficient contrast with backgrounds
- Support for user font size preferences
- Clear focus indicators for interactive text

### Common Patterns

#### Card Title with Description
```scss
.card-header {
  .title {
    font: var(--font-weight-semibold) var(--font-size-h3)/var(--line-height-h3) var(--font-family-primary);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }
  
  .description {
    font: var(--font-weight-regular) var(--font-size-body-small)/var(--line-height-body) var(--font-family-primary);
    color: var(--color-text-secondary);
  }
}
```

#### Form Field with Label
```scss
.form-field {
  .label {
    font: var(--font-weight-medium) var(--font-size-label)/var(--line-height-label) var(--font-family-primary);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-label);
  }
  
  .input {
    font: var(--font-weight-regular) var(--font-size-input)/var(--line-height-input) var(--font-family-primary);
    color: var(--color-text-primary);
  }
}
```

## Related Documentation
- [Design Tokens Overview](./README.md) - Token system architecture
- [Color Tokens](./colors.md) - Color specifications
- [Spacing Tokens](./spacing.md) - Spacing system
- [Style Guide](../style-guide.md) - Complete visual guidelines

## Implementation Notes
Typography tokens should be applied systematically through utility classes or component styles. Always test across different devices and ensure proper font loading strategies are in place. Consider performance implications of web fonts and provide appropriate fallbacks.

## Last Updated
2025-01-04 - Complete typography token specification