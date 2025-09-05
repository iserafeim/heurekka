---
title: Design Tokens Overview
description: Foundational design tokens that power the Heurekka design system
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./colors.md
  - ./typography.md
  - ./spacing.md
  - ./animations.md
  - ../../assets/design-tokens.json
status: approved
---

# Design Tokens Overview

## Overview
Design tokens are the atomic design decisions that create the foundation of our visual language. They ensure consistency, maintainability, and scalability across all platforms and implementations.

## Table of Contents
1. [What Are Design Tokens](#what-are-design-tokens)
2. [Token Architecture](#token-architecture)
3. [Token Categories](#token-categories)
4. [Naming Convention](#naming-convention)
5. [Implementation Strategy](#implementation-strategy)
6. [Platform Exports](#platform-exports)
7. [Usage Guidelines](#usage-guidelines)
8. [Token Management](#token-management)

## What Are Design Tokens

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. They are the single source of truth for design decisions that can be used across different platforms and technologies.

### Benefits
- **Consistency**: Single source of truth eliminates inconsistencies
- **Maintainability**: Change once, update everywhere
- **Scalability**: Easy to extend and adapt
- **Platform Agnostic**: Works across web, iOS, and Android
- **Theme Support**: Enables easy theming and customization

## Token Architecture

### Token Hierarchy

```
Level 1: Primitive Tokens (Raw Values)
├── Raw colors (#0066FF)
├── Raw sizes (16px)
├── Raw durations (200ms)
└── Raw fonts (Inter)

Level 2: Semantic Tokens (Contextual Meaning)
├── color-primary → #0066FF
├── spacing-md → 16px
├── duration-short → 200ms
└── font-family-primary → Inter

Level 3: Component Tokens (Specific Applications)
├── button-background-primary → color-primary
├── button-padding-vertical → spacing-md
├── button-transition-duration → duration-short
└── button-font-family → font-family-primary
```

### Token Types

#### Global Tokens
Universal values used throughout the system:
- Colors (brand, semantic, neutral)
- Typography (families, sizes, weights)
- Spacing (scale system)
- Borders (widths, radii)
- Shadows (elevation system)
- Motion (durations, easings)

#### Alias Tokens
References to other tokens for semantic meaning:
- `text-primary` → `neutral-900`
- `surface-elevated` → `white`
- `border-default` → `neutral-200`

#### Component-Specific Tokens
Tokens scoped to specific components:
- `button-height-sm` → `32px`
- `card-shadow-hover` → `shadow-lg`
- `input-border-focus` → `primary-500`

## Token Categories

### Color Tokens
Foundation of the visual hierarchy and brand expression:
- **Brand Colors**: Primary and secondary palettes
- **Semantic Colors**: Success, warning, error, info states
- **Neutral Colors**: Grayscale for text and backgrounds
- **Specialized Colors**: Gradients, overlays, highlights

[View Complete Color Documentation](./colors.md)

### Typography Tokens
Text rendering and hierarchy system:
- **Font Families**: Primary and monospace stacks
- **Font Sizes**: Modular type scale
- **Font Weights**: Emphasis levels
- **Line Heights**: Optimal readability
- **Letter Spacing**: Tracking adjustments

[View Complete Typography Documentation](./typography.md)

### Spacing Tokens
Consistent spatial relationships:
- **Base Unit**: 4px or 8px foundation
- **Scale System**: Mathematical progression
- **Component Spacing**: Padding and margins
- **Layout Spacing**: Page-level spacing

[View Complete Spacing Documentation](./spacing.md)

### Motion Tokens
Animation and transition system:
- **Durations**: Timing scales
- **Easings**: Acceleration curves
- **Keyframes**: Reusable animations
- **Properties**: What can animate

[View Complete Animation Documentation](./animations.md)

### Additional Token Types

#### Border Radius Tokens
```scss
--radius-none: 0;
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-xl: 16px;
--radius-full: 9999px;
```

#### Shadow Tokens
```scss
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

#### Z-Index Tokens
```scss
--z-index-dropdown: 1000;
--z-index-sticky: 1020;
--z-index-fixed: 1030;
--z-index-modal-backdrop: 1040;
--z-index-modal: 1050;
--z-index-popover: 1060;
--z-index-tooltip: 1070;
```

## Naming Convention

### Structure
`[category]-[property]-[variant]-[state]`

### Examples
- `color-primary-500` (category: color, property: primary, variant: 500)
- `spacing-component-md` (category: spacing, property: component, variant: md)
- `button-background-hover` (category: button, property: background, state: hover)

### Rules
1. **Use Lowercase**: All token names in lowercase
2. **Use Hyphens**: Separate words with hyphens
3. **Be Descriptive**: Names should be self-documenting
4. **Avoid Abbreviations**: Use full words for clarity
5. **Maintain Hierarchy**: Follow the established structure

## Implementation Strategy

### Web (CSS Custom Properties)
```css
:root {
  --color-primary: #0066FF;
  --spacing-md: 16px;
  --font-size-body: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-body);
}
```

### JavaScript/TypeScript
```typescript
export const tokens = {
  color: {
    primary: '#0066FF',
  },
  spacing: {
    md: '16px',
  },
  fontSize: {
    body: '16px',
  },
};
```

### iOS (Swift)
```swift
enum DesignTokens {
  enum Color {
    static let primary = UIColor(hex: "#0066FF")
  }
  enum Spacing {
    static let md: CGFloat = 16
  }
  enum FontSize {
    static let body: CGFloat = 16
  }
}
```

### Android (Kotlin)
```kotlin
object DesignTokens {
  object Color {
    const val primary = 0xFF0066FF
  }
  object Spacing {
    const val md = 16
  }
  object FontSize {
    const val body = 16f
  }
}
```

## Platform Exports

### Available Formats
- **JSON**: Universal format for all platforms
- **CSS**: Custom properties for web
- **SCSS**: Sass variables and maps
- **JavaScript**: ES6 modules
- **TypeScript**: Typed token definitions
- **iOS**: Swift enums
- **Android**: Kotlin objects

### Export Process
1. Define tokens in JSON master file
2. Run build process to generate platform-specific files
3. Import generated files into projects
4. Use tokens in implementation

## Usage Guidelines

### Best Practices
1. **Always Use Tokens**: Never hard-code values
2. **Use Semantic Tokens**: Prefer semantic over primitive tokens
3. **Maintain Consistency**: Use the same token for the same purpose
4. **Document Exceptions**: If you must deviate, document why
5. **Keep Tokens Updated**: Sync with latest token definitions

### Common Patterns
```scss
// ✅ Good: Using semantic tokens
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
}

// ❌ Bad: Hard-coded values
.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 24px;
}
```

### Token Selection Guide
- **Text Colors**: Use `color-text-*` tokens
- **Backgrounds**: Use `color-surface-*` or `color-background-*`
- **Interactive Elements**: Use `color-interactive-*`
- **Component Spacing**: Use `spacing-component-*`
- **Layout Spacing**: Use `spacing-layout-*`

## Token Management

### Version Control
- Tokens are versioned alongside the design system
- Breaking changes trigger major version bumps
- New tokens trigger minor version bumps
- Value adjustments trigger patch version bumps

### Change Process
1. **Propose Change**: Document need and impact
2. **Review Impact**: Assess affected components
3. **Update Tokens**: Modify token definitions
4. **Generate Exports**: Build platform files
5. **Test Integration**: Verify in all contexts
6. **Document Change**: Update changelog

### Token Deprecation
When removing or renaming tokens:
1. Mark as deprecated with migration guide
2. Maintain for one major version
3. Provide automated migration when possible
4. Remove in next major version

### Quality Assurance
- **Contrast Testing**: Verify color combinations meet WCAG
- **Scale Validation**: Ensure mathematical relationships
- **Cross-Platform Parity**: Confirm consistent rendering
- **Performance Impact**: Monitor token usage overhead

## Related Documentation
- [Color Tokens](./colors.md) - Complete color token specifications
- [Typography Tokens](./typography.md) - Font system details
- [Spacing Tokens](./spacing.md) - Spatial system documentation
- [Animation Tokens](./animations.md) - Motion specifications
- [Design Tokens JSON](../../assets/design-tokens.json) - Token definitions

## Implementation Notes
Design tokens form the foundation of our design system. They should be treated as the single source of truth and updated through the proper governance process. All implementations must reference these tokens to ensure consistency.

## Last Updated
2025-01-04 - Initial token system documentation