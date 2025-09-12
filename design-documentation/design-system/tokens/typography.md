---
title: Typography Token Specifications
description: Complete typography system extracted from homepage design for consistent application
last-updated: 2025-01-12
version: 2.0.0
related-files: 
  - ./README.md
  - ./colors.md
  - ../../assets/design-tokens.json
  - ../../features/homepage-landing/screen-states.md
status: approved
---

# Typography Token Specifications

## Overview
The HEUREKKA typography system is extracted directly from the homepage design specifications, establishing a clear hierarchy and optimal reading experience that scales consistently across all features and platforms.

## Table of Contents
1. [Typography Philosophy](#typography-philosophy)
2. [Font Families](#font-families)
3. [Type Scale](#type-scale)
4. [Font Weights](#font-weights)
5. [Line Heights](#line-heights)
6. [Responsive Typography](#responsive-typography)
7. [Component Typography](#component-typography)
8. [Usage Guidelines](#usage-guidelines)

## Typography Philosophy

### Design Principles (Homepage Authority)
- **Consistency**: All typography derived from homepage implementation
- **Hierarchy**: Clear distinction from 28px headlines to 12px captions
- **Readability**: 16px base font prevents iOS zoom, optimal line heights
- **Responsive**: Mobile-first scaling from 320px to 1440px+
- **Performance**: System font stack with Inter as primary

## Font Families

### Primary Font Stack (Homepage Standard)
```scss
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                       Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Monospace Font Stack
```scss
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 
                    'Courier New', monospace;
```

### System Font Fallbacks
- **iOS**: `-apple-system, 'SF Pro Text'`
- **Android**: `Roboto, 'Noto Sans'`
- **Windows**: `'Segoe UI', 'Segoe UI Variable'`

## Type Scale (Homepage Extracted)

### Hero Section Typography
Mobile → Tablet → Desktop scaling:

```scss
// Hero Headlines (Homepage Authority)
--font-size-hero-h1-mobile:  28px;  // Mobile hero
--font-size-hero-h1-tablet:  32px;  // Tablet hero
--font-size-hero-h1-desktop: 40px;  // Desktop hero

// Hero Subheadlines
--font-size-hero-sub-mobile:  16px;  // Mobile subheadline
--font-size-hero-sub-tablet:  18px;  // Tablet subheadline
--font-size-hero-sub-desktop: 20px;  // Desktop subheadline

// Section Titles
--font-size-section-mobile:  22px;  // Mobile sections
--font-size-section-tablet:  24px;  // Tablet sections
--font-size-section-desktop: 28px;  // Desktop sections

// Trust Metrics Display
--font-size-display: 32px;  // Large numbers
```

### Component Typography (Homepage Standard)
```scss
// Property Cards
--font-size-card-price:    16px;  // Price display
--font-size-card-title:    16px;  // Card titles
--font-size-card-detail:   14px;  // Type, location
--font-size-card-meta:     12px;  // Timestamps

// Buttons & CTAs
--font-size-button:        14px;  // All buttons
--font-size-link:          14px;  // Text links

// Forms & Inputs
--font-size-input:         16px;  // Prevents iOS zoom
--font-size-placeholder:   16px;  // Placeholder text
--font-size-label:         14px;  // Form labels
--font-size-error:         12px;  // Error messages

// Body Text
--font-size-body-large:    18px;  // Lead paragraphs
--font-size-body:          16px;  // Standard text
--font-size-body-small:    14px;  // Secondary info
--font-size-caption:       12px;  // Metadata, hints
```

## Font Weights (Homepage Implementation)

```scss
// Weight Scale
--font-weight-regular:   400;  // Body text, descriptions
--font-weight-medium:    500;  // Labels, links
--font-weight-semibold:  600;  // Section titles, prices
--font-weight-bold:      700;  // Headlines, CTAs

// Semantic Weights (Homepage Patterns)
--font-weight-hero:      700;  // Hero headlines
--font-weight-section:   600;  // Section titles
--font-weight-button:    600;  // CTA buttons
--font-weight-card:      600;  // Card titles, prices
--font-weight-body:      400;  // Body text
--font-weight-meta:      400;  // Secondary text
```

## Line Heights (Homepage Optimized)

```scss
// Homepage-Verified Line Heights
--line-height-hero-h1:     36px;  // 28px font → 36px line
--line-height-hero-h1-d:   48px;  // 40px font → 48px line
--line-height-hero-sub:    24px;  // 16px font → 24px line
--line-height-hero-sub-d:  32px;  // 20px font → 32px line

--line-height-section:     28px;  // 22px font → 28px line
--line-height-section-d:   36px;  // 28px font → 36px line

--line-height-display:     40px;  // 32px font → 40px line

--line-height-body:        24px;  // 16px font → 24px line
--line-height-body-large:  28px;  // 18px font → 28px line
--line-height-body-small:  20px;  // 14px font → 20px line
--line-height-caption:     16px;  // 12px font → 16px line

--line-height-button:      20px;  // 14px font → 20px line
--line-height-input:       24px;  // 16px font → 24px line
```

### Line Height Ratios
- Headlines: 1.2-1.3× (tighter for impact)
- Body text: 1.5× (optimal readability)
- Captions: 1.33× (compact but readable)

## Responsive Typography

### Mobile (320px - 767px)
```scss
.hero-headline {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
}

.hero-subheadline {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

.section-title {
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
}

.body-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}
```

### Tablet (768px - 1023px)
```scss
.hero-headline {
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
}

.hero-subheadline {
  font-size: 18px;
  line-height: 28px;
  font-weight: 400;
}

.section-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}
```

### Desktop (1024px+)
```scss
.hero-headline {
  font-size: 40px;
  line-height: 48px;
  font-weight: 700;
}

.hero-subheadline {
  font-size: 20px;
  line-height: 32px;
  font-weight: 400;
}

.section-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
}
```

### Wide Desktop (1440px+)
```scss
.hero-headline {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
}

.container {
  max-width: 1280px;  // Content width limit
}

.body-text {
  max-width: 65ch;  // Optimal line length
}
```

## Component Typography

### Search Bar (Homepage Pattern)
```scss
.search-input {
  font-family: var(--font-family-primary);
  font-size: 16px;    // Prevents iOS zoom
  line-height: 24px;
  font-weight: 400;
  color: #111827;
  
  &::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }
}
```

### Primary Button
```scss
.btn-primary {
  font-family: var(--font-family-primary);
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;  // No uppercase
  color: #FFFFFF;
}
```

### Property Card
```scss
.property-card {
  .price {
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    color: #111827;
  }
  
  .type {
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: #111827;
  }
  
  .location {
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: #6B7280;
  }
  
  .meta {
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    color: #6B7280;
  }
}
```

### Navigation
```scss
.nav-item {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: #374151;
  
  &.active {
    color: #2563EB;
    font-weight: 600;
  }
}
```

### Form Elements
```scss
.form-label {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-input {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #111827;
}

.form-error {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #EF4444;
  margin-top: 4px;
}
```

### Value Propositions
```scss
.value-prop-title {
  font-size: 18px;
  line-height: 28px;
  font-weight: 600;
  color: #111827;
}

.value-prop-text {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #6B7280;
}
```

## Usage Guidelines

### Typography Hierarchy (Homepage Authority)

1. **Hero Headline**: 28px → 40px, 700 weight, #111827
2. **Section Title**: 22px → 28px, 600 weight, #111827
3. **Card Title**: 16px, 600 weight, #111827
4. **Body Text**: 16px, 400 weight, #111827
5. **Secondary Text**: 14px, 400 weight, #6B7280
6. **Caption/Meta**: 12px, 400 weight, #6B7280

### Do's and Don'ts

#### Do's
- ✅ Use 16px minimum for input fields (prevents iOS zoom)
- ✅ Apply 700 weight for hero headlines
- ✅ Use 600 weight for CTAs and section titles
- ✅ Maintain 1.5× line height for body text
- ✅ Keep consistent font sizes across similar components

#### Don'ts
- ❌ Use font sizes smaller than 12px
- ❌ Apply more than 3 font weights per page
- ❌ Use uppercase text transformation on buttons
- ❌ Mix different font families within components
- ❌ Exceed 65 characters per line for body text

### Accessibility Requirements

- **Minimum Sizes**: 14px for body, 12px for captions
- **Line Height**: Minimum 1.5× for body text
- **Weight Contrast**: 300+ weight difference for emphasis
- **Focus Indicators**: Visible outline on all interactive text
- **Scalability**: Support browser font size preferences

### Implementation Example

```css
:root {
  /* Font families */
  --font-primary: 'Inter', -apple-system, sans-serif;
  
  /* Hero typography */
  --text-hero: 700 28px/36px var(--font-primary);
  --text-hero-sub: 400 16px/24px var(--font-primary);
  
  /* Component typography */
  --text-button: 600 14px/20px var(--font-primary);
  --text-body: 400 16px/24px var(--font-primary);
  --text-caption: 400 12px/16px var(--font-primary);
  
  /* Responsive scales */
  @media (min-width: 768px) {
    --text-hero: 700 32px/40px var(--font-primary);
  }
  
  @media (min-width: 1024px) {
    --text-hero: 700 40px/48px var(--font-primary);
  }
}
```

## Web Font Loading Strategy

```html
<!-- Preload critical font -->
<link rel="preload" href="/fonts/Inter-var.woff2" as="font" crossorigin>

<!-- Font face declaration -->
<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;  /* Avoid invisible text */
}
</style>
```

## Related Documentation
- [Homepage Screen States](../../features/homepage-landing/screen-states.md) - Source specifications
- [Color Tokens](./colors.md) - Text color specifications
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Button Components](../components/buttons.md) - Button typography

## Last Updated
2025-01-12 - Complete extraction from homepage design specifications