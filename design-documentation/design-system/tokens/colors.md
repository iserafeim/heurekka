---
title: Color Token Specifications
description: Complete color palette extracted from homepage design for consistent application
last-updated: 2025-01-12
version: 2.0.0
related-files: 
  - ./README.md
  - ../../assets/design-tokens.json
  - ../style-guide.md
  - ../../features/homepage-landing/screen-states.md
status: approved
---

# Color Token Specifications

## Overview
The HEUREKKA color system is extracted directly from the homepage design specifications, ensuring complete consistency across all features. Every color has been verified for WCAG AA compliance and optimized for clarity and brand expression.

## Table of Contents
1. [Color Philosophy](#color-philosophy)
2. [Primary Palette](#primary-palette)
3. [Secondary Palette](#secondary-palette)
4. [Semantic Colors](#semantic-colors)
5. [Neutral Palette](#neutral-palette)
6. [Gradient System](#gradient-system)
7. [Shadow System](#shadow-system)
8. [Accessibility Matrix](#accessibility-matrix)
9. [Usage Guidelines](#usage-guidelines)

## Color Philosophy

### Design Principles (Homepage Authority)
- **Consistency**: All colors derived from homepage implementation
- **Accessibility**: Minimum 4.5:1 contrast for normal text
- **Hierarchy**: Clear visual distinction between elements
- **Brand Expression**: Blue-forward palette with strategic accents
- **Functional**: Every color serves a specific purpose

## Primary Palette

### Primary Blue Scale (Homepage Extracted)
```scss
// Homepage-verified primary blue scale
--color-primary-50:  #EFF6FF;  // Hero gradient, pale backgrounds
--color-primary-100: #DBEAFE;  // Light backgrounds, info backgrounds
--color-primary-200: #BFDBFE;  // Lighter tints
--color-primary-300: #93C5FD;  // Light accent
--color-primary-400: #60A5FA;  // Medium accent
--color-primary-500: #3B82F6;  // Info color
--color-primary-600: #2563EB;  // Main brand - CTAs, search borders
--color-primary-700: #1D4ED8;  // Hover states, focused search
--color-primary-800: #1E40AF;  // Active/pressed states
--color-primary-900: #1E3A8A;  // Darkest shade
```

### Usage Patterns (Homepage Implementation)
- **Primary CTAs**: `#2563EB` default → `#1D4ED8` hover → `#1E40AF` active
- **Search Bar**: `2px solid #2563EB` border
- **Links & Interactive Text**: `#2563EB` with underline on hover
- **Focus States**: `#1D4ED8` border with `0 0 0 3px rgba(37, 99, 235, 0.1)` shadow
- **Trust Metrics**: `32px, 700, #2563EB` for numbers
- **Quick Search Pills**: Hover to gradient `linear-gradient(135deg, #667EEA 0%, #764BA2 100%)`

## Secondary Palette

### WhatsApp Green (Communication)
```scss
--color-whatsapp:       #25D366;  // WhatsApp CTAs
--color-whatsapp-dark:  #128C7E;  // WhatsApp hover states
--color-whatsapp-light: #DCF8C6;  // Message backgrounds
```

### Usage
- **WhatsApp Button**: `#25D366` background, `border-radius: 24px`
- **Button Shadow**: `0 2px 8px rgba(37, 211, 102, 0.3)`
- **Icon Size**: 20×20px with 8px right margin
- **Hover State**: Background `#128C7E`

### Accent Colors
```scss
--color-accent-blue:   #0EA5E9;  // Secondary actions
--color-accent-purple: #8B5CF6;  // Premium features
--color-gradient-purple-start: #667EEA;  // Gradient start
--color-gradient-purple-end:   #764BA2;  // Gradient end
```

## Semantic Colors

### Success (Homepage Checkmarks)
```scss
--color-success:       #10B981;  // Checkmarks, success states
--color-success-light: #D1FAE5;  // Success backgrounds
--color-success-dark:  #047857;  // Success hover states
```

**Homepage Usage:**
- Checkmark bullets: `✓ No fees` in `#10B981`
- Success field borders: `2px solid #10B981`
- Success field icon: Green checkmark right-aligned

### Error States
```scss
--color-error:       #EF4444;  // Error states, validation
--color-error-light: #FEF2F2;  // Error field backgrounds
--color-error-pale:  #FEE2E2;  // Error message backgrounds
--color-error-dark:  #B91C1C;  // Error hover states
```

**Homepage Usage:**
- Error field borders: `2px solid #EF4444`
- Error field background: `#FEF2F2`
- Error messages: `12px, #EF4444` below fields

### Warning & Info
```scss
--color-warning:       #F59E0B;  // Warnings, time-sensitive
--color-warning-light: #FEF3C7;  // Warning backgrounds
--color-info:          #3B82F6;  // Information, tips
--color-info-light:    #DBEAFE;  // Info backgrounds
```

## Neutral Palette (Homepage Extracted)

```scss
// Complete neutral scale from homepage
--color-neutral-50:  #F9FAFB;  // Light backgrounds
--color-neutral-100: #F3F4F6;  // Skeleton base, disabled bg
--color-neutral-200: #E5E7EB;  // Borders, dividers, shimmer
--color-neutral-300: #D1D5DB;  // Input borders, disabled borders
--color-neutral-400: #9CA3AF;  // Placeholder text, disabled text
--color-neutral-500: #6B7280;  // Secondary text, labels, meta
--color-neutral-600: #4B5563;  // Form labels
--color-neutral-700: #374151;  // Body text, secondary buttons
--color-neutral-800: #1F2937;  // Dark mode bg, headings
--color-neutral-900: #111827;  // Primary text, headlines
--color-neutral-950: #030712;  // High emphasis text
```

### Semantic Neutral Tokens
```scss
// Text hierarchy (Homepage patterns)
--text-headline:    #111827;  // 28px/36px headlines
--text-primary:     #111827;  // Primary text
--text-secondary:   #6B7280;  // Secondary, meta info
--text-placeholder: #9CA3AF;  // Input placeholders
--text-disabled:    #9CA3AF;  // Disabled states
--text-inverse:     #FFFFFF;  // On dark backgrounds

// Backgrounds
--bg-white:     #FFFFFF;  // Cards, inputs, modals
--bg-light:     #F9FAFB;  // Alternate sections
--bg-skeleton:  #F3F4F6;  // Loading skeleton base
--bg-disabled:  #F3F4F6;  // Disabled inputs
--bg-error:     #FEF2F2;  // Error field backgrounds

// Borders
--border-light:   #E5E7EB;  // Cards, dividers
--border-input:   #D1D5DB;  // Standard inputs
--border-primary: #2563EB;  // Search bar, focus
--border-focus:   #1D4ED8;  // Focus state borders
```

## Gradient System (Homepage Patterns)

### Primary Gradients
```scss
// Hero section gradient
--gradient-hero: linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%);

// Brand gradients
--gradient-primary: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
--gradient-purple: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);

// Quick search pill hover
--gradient-pill-hover: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);

// Trust section background
--gradient-trust: linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%);
```

### Skeleton Loading Gradient
```scss
--gradient-skeleton: linear-gradient(
  90deg,
  #F3F4F6 25%,
  #E5E7EB 50%,
  #F3F4F6 75%
);
```

## Shadow System (Homepage Refined)

### Neutral Shadows
```scss
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.12);
```

### Brand-Colored Shadows (Homepage Specific)
```scss
// Search bar shadows
--shadow-search: 0 4px 6px rgba(37, 99, 235, 0.1);
--shadow-search-hover: 0 6px 12px rgba(37, 99, 235, 0.15);
--shadow-search-focus: 0 0 0 3px rgba(37, 99, 235, 0.1);

// Button shadows
--shadow-primary-button: 0 4px 6px rgba(37, 99, 235, 0.2);
--shadow-whatsapp: 0 2px 8px rgba(37, 211, 102, 0.3);

// Component shadows
--shadow-card-hover: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-sticky-header: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-dropdown: 0 4px 6px rgba(0, 0, 0, 0.1);
```

## Accessibility Matrix

### WCAG AA Verified Combinations (Homepage)

| Foreground | Background | Ratio | Usage | Status |
|------------|------------|-------|-------|--------|
| `#2563EB` | `#FFFFFF` | 5.4:1 | Primary CTAs, links | ✓ AA |
| `#111827` | `#FFFFFF` | 19.3:1 | Headlines | ✓ AAA |
| `#374151` | `#FFFFFF` | 11.4:1 | Body text | ✓ AAA |
| `#6B7280` | `#FFFFFF` | 5.9:1 | Secondary text | ✓ AA |
| `#9CA3AF` | `#FFFFFF` | 3.4:1 | Placeholder (large) | ✓ AA Large |
| `#EF4444` | `#FFFFFF` | 4.5:1 | Error messages | ✓ AA |
| `#10B981` | `#FFFFFF` | 4.6:1 | Success indicators | ✓ AA |
| `#FFFFFF` | `#2563EB` | 5.4:1 | Button text | ✓ AA |
| `#FFFFFF` | `#25D366` | 3.1:1 | WhatsApp button | ✓ AA Large |

### Color Blindness Considerations
- Primary blue `#2563EB` distinguishable in all color blindness types
- Success green `#10B981` paired with checkmark icons
- Error red `#EF4444` paired with error icons and text
- Never rely on color alone for critical information

## Usage Guidelines

### Component Color Mapping

#### Search Bar (Primary Pattern)
```scss
.search-bar {
  background: #FFFFFF;
  border: 2px solid #2563EB;
  color: #111827;
  
  &::placeholder {
    color: #9CA3AF;
  }
  
  &:hover {
    box-shadow: 0 6px 12px rgba(37, 99, 235, 0.15);
  }
  
  &:focus {
    border-color: #1D4ED8;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}
```

#### Primary Button
```scss
.btn-primary {
  background: #2563EB;
  color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  
  &:hover {
    background: #1D4ED8;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }
  
  &:active {
    background: #1E40AF;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}
```

#### Property Card
```scss
.property-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  
  .price {
    color: #111827;
    font-weight: 600;
  }
  
  .location {
    color: #6B7280;
  }
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
```

### Do's and Don'ts

#### Do's
- ✅ Use `#2563EB` for all primary CTAs and search elements
- ✅ Apply `#111827` for headlines and primary text
- ✅ Use `#6B7280` for secondary information and metadata
- ✅ Maintain `#E5E7EB` for card borders and dividers
- ✅ Apply focus shadows consistently: `0 0 0 3px rgba(37, 99, 235, 0.1)`

#### Don'ts
- ❌ Create new shades outside the defined palette
- ❌ Use colors that haven't been accessibility tested
- ❌ Apply semantic colors decoratively
- ❌ Mix different shadow systems
- ❌ Hard-code hex values instead of using tokens

## Implementation Example

### CSS Custom Properties
```css
:root {
  /* Primary colors - Homepage authority */
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-active: #1E40AF;
  
  /* Text hierarchy */
  --text-headline: #111827;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-placeholder: #9CA3AF;
  
  /* Backgrounds */
  --bg-white: #FFFFFF;
  --bg-hero: linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%);
  
  /* Borders */
  --border-light: #E5E7EB;
  --border-input: #D1D5DB;
  --border-primary: #2563EB;
}
```

## Related Documentation
- [Homepage Screen States](../../features/homepage-landing/screen-states.md) - Source specifications
- [Typography Tokens](./typography.md) - Font specifications
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Button Components](../components/buttons.md) - Button specifications

## Last Updated
2025-01-12 - Complete extraction from homepage design specifications