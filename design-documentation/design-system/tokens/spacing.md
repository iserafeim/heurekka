---
title: Spacing Token Specifications
description: Comprehensive spacing system and token definitions for consistent spatial relationships
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ../style-guide.md
  - ../../assets/design-tokens.json
status: approved
---

# Spacing Token Specifications

## Overview
The Heurekka spacing system creates consistent spatial relationships throughout the interface using a mathematical scale based on an 8px base unit, ensuring visual rhythm and hierarchy.

## Table of Contents
1. [Spacing Philosophy](#spacing-philosophy)
2. [Base Unit System](#base-unit-system)
3. [Spacing Scale](#spacing-scale)
4. [Component Spacing](#component-spacing)
5. [Layout Spacing](#layout-spacing)
6. [Grid System](#grid-system)
7. [Responsive Spacing](#responsive-spacing)
8. [Usage Guidelines](#usage-guidelines)

## Spacing Philosophy

### Design Principles
- **Mathematical Consistency**: Based on 8px base unit
- **Visual Rhythm**: Creates predictable spatial patterns
- **Hierarchical**: Reinforces content relationships
- **Responsive**: Adapts to different screen sizes
- **Efficient**: Optimizes screen real estate

### Spacing Goals
- Create breathing room for content
- Establish clear visual groupings
- Guide user attention through layout
- Maintain consistency across platforms
- Support responsive design patterns

## Base Unit System

### Foundation
```scss
--spacing-base-unit: 8px;  // Foundation for all spacing
```

### Why 8px?
- Scales well across all screen densities
- Divides evenly into common screen sizes
- Works with 4px for micro-adjustments
- Aligns with Material Design and iOS standards
- Creates harmonious mathematical relationships

## Spacing Scale

### Core Scale (T-Shirt Sizing)
```scss
// Micro adjustments
--spacing-xxs: 2px;   // 0.25 × base
--spacing-xs:  4px;   // 0.5 × base

// Standard scale
--spacing-sm:  8px;   // 1 × base
--spacing-md:  16px;  // 2 × base
--spacing-lg:  24px;  // 3 × base
--spacing-xl:  32px;  // 4 × base
--spacing-2xl: 48px;  // 6 × base
--spacing-3xl: 64px;  // 8 × base
--spacing-4xl: 96px;  // 12 × base
--spacing-5xl: 128px; // 16 × base
```

### Numeric Scale
```scss
--spacing-0:   0;
--spacing-1:   2px;
--spacing-2:   4px;
--spacing-3:   8px;
--spacing-4:   12px;
--spacing-5:   16px;
--spacing-6:   20px;
--spacing-7:   24px;
--spacing-8:   32px;
--spacing-9:   36px;
--spacing-10:  40px;
--spacing-11:  44px;
--spacing-12:  48px;
--spacing-14:  56px;
--spacing-16:  64px;
--spacing-20:  80px;
--spacing-24:  96px;
--spacing-28:  112px;
--spacing-32:  128px;
--spacing-36:  144px;
--spacing-40:  160px;
--spacing-44:  176px;
--spacing-48:  192px;
--spacing-52:  208px;
--spacing-56:  224px;
--spacing-60:  240px;
--spacing-64:  256px;
```

### Negative Spacing
```scss
--spacing-n-xs:  -4px;
--spacing-n-sm:  -8px;
--spacing-n-md:  -16px;
--spacing-n-lg:  -24px;
--spacing-n-xl:  -32px;
```

## Component Spacing

### Button Spacing
```scss
// Padding
--button-padding-y-sm: var(--spacing-xs);   // 4px
--button-padding-x-sm: var(--spacing-sm);   // 8px
--button-padding-y-md: var(--spacing-sm);   // 8px
--button-padding-x-md: var(--spacing-md);   // 16px
--button-padding-y-lg: var(--spacing-md);   // 16px
--button-padding-x-lg: var(--spacing-lg);   // 24px

// Icon spacing
--button-icon-gap: var(--spacing-xs);       // 4px
```

### Form Field Spacing
```scss
// Input padding
--input-padding-y: var(--spacing-sm);       // 8px
--input-padding-x: var(--spacing-md);       // 16px

// Label spacing
--label-margin-bottom: var(--spacing-xs);   // 4px

// Help text spacing
--help-text-margin-top: var(--spacing-xs);  // 4px

// Field group spacing
--field-gap: var(--spacing-md);             // 16px
--field-group-gap: var(--spacing-lg);       // 24px
```

### Card Spacing
```scss
// Card padding
--card-padding-sm: var(--spacing-md);       // 16px
--card-padding-md: var(--spacing-lg);       // 24px
--card-padding-lg: var(--spacing-xl);       // 32px

// Card sections
--card-header-padding: var(--spacing-lg);   // 24px
--card-body-padding: var(--spacing-lg);     // 24px
--card-footer-padding: var(--spacing-lg);   // 24px

// Card stacks
--card-stack-gap: var(--spacing-md);        // 16px
```

### List Spacing
```scss
// List items
--list-item-padding-y: var(--spacing-sm);   // 8px
--list-item-padding-x: var(--spacing-md);   // 16px
--list-item-gap: var(--spacing-xxs);        // 2px

// List groups
--list-group-gap: var(--spacing-lg);        // 24px
```

### Modal Spacing
```scss
// Modal padding
--modal-padding: var(--spacing-xl);         // 32px
--modal-header-padding: var(--spacing-lg);  // 24px
--modal-body-padding: var(--spacing-lg);    // 24px
--modal-footer-padding: var(--spacing-lg);  // 24px

// Modal margins
--modal-margin: var(--spacing-2xl);         // 48px
```

## Layout Spacing

### Page Layout
```scss
// Container padding
--container-padding-mobile: var(--spacing-md);   // 16px
--container-padding-tablet: var(--spacing-lg);   // 24px
--container-padding-desktop: var(--spacing-xl);  // 32px

// Section spacing
--section-padding-y-mobile: var(--spacing-2xl);  // 48px
--section-padding-y-tablet: var(--spacing-3xl);  // 64px
--section-padding-y-desktop: var(--spacing-4xl); // 96px

// Content spacing
--content-gap-mobile: var(--spacing-lg);         // 24px
--content-gap-tablet: var(--spacing-xl);         // 32px
--content-gap-desktop: var(--spacing-2xl);       // 48px
```

### Navigation Spacing
```scss
// Header
--header-padding-y: var(--spacing-md);      // 16px
--header-padding-x: var(--spacing-lg);      // 24px
--header-height: 64px;

// Nav items
--nav-item-padding: var(--spacing-sm);      // 8px
--nav-item-gap: var(--spacing-xs);          // 4px

// Sidebar
--sidebar-padding: var(--spacing-lg);       // 24px
--sidebar-width: 280px;
--sidebar-collapsed-width: 64px;
```

### Grid Spacing
```scss
// Grid gaps
--grid-gap-mobile: var(--spacing-md);       // 16px
--grid-gap-tablet: var(--spacing-lg);       // 24px
--grid-gap-desktop: var(--spacing-xl);      // 32px

// Column gaps
--column-gap-sm: var(--spacing-md);         // 16px
--column-gap-md: var(--spacing-lg);         // 24px
--column-gap-lg: var(--spacing-xl);         // 32px
```

## Grid System

### Container Widths
```scss
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Column System
```scss
// 12-column grid
--grid-columns: 12;

// Column widths
--col-1:  8.333333%;
--col-2:  16.666667%;
--col-3:  25%;
--col-4:  33.333333%;
--col-5:  41.666667%;
--col-6:  50%;
--col-7:  58.333333%;
--col-8:  66.666667%;
--col-9:  75%;
--col-10: 83.333333%;
--col-11: 91.666667%;
--col-12: 100%;
```

### Gutter System
```scss
// Responsive gutters
--gutter-mobile: var(--spacing-md);   // 16px
--gutter-tablet: var(--spacing-lg);   // 24px
--gutter-desktop: var(--spacing-xl);  // 32px
--gutter-wide: var(--spacing-2xl);    // 48px
```

## Responsive Spacing

### Mobile (320px - 767px)
```scss
@media (max-width: 767px) {
  :root {
    --spacing-scale-factor: 0.875;  // Slightly tighter
    --container-padding: var(--spacing-md);
    --section-padding: var(--spacing-2xl);
    --component-padding: var(--spacing-sm);
  }
}
```

### Tablet (768px - 1023px)
```scss
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --spacing-scale-factor: 1;  // Base scale
    --container-padding: var(--spacing-lg);
    --section-padding: var(--spacing-3xl);
    --component-padding: var(--spacing-md);
  }
}
```

### Desktop (1024px+)
```scss
@media (min-width: 1024px) {
  :root {
    --spacing-scale-factor: 1;  // Base scale
    --container-padding: var(--spacing-xl);
    --section-padding: var(--spacing-4xl);
    --component-padding: var(--spacing-lg);
  }
}
```

### Wide Screens (1440px+)
```scss
@media (min-width: 1440px) {
  :root {
    --spacing-scale-factor: 1.125;  // Slightly looser
    --container-max-width: var(--container-xl);
    --container-padding: var(--spacing-2xl);
  }
}
```

## Usage Guidelines

### Best Practices

#### Consistency
- ✅ Always use spacing tokens, never arbitrary values
- ✅ Use consistent spacing for similar elements
- ✅ Maintain spacing hierarchy (larger gaps between sections)
- ✅ Apply spacing systematically through utilities
- ✅ Test spacing across all breakpoints

#### Visual Hierarchy
```scss
// Example: Content hierarchy through spacing
.page-section {
  padding: var(--section-padding) 0;  // Large vertical padding
  
  .section-header {
    margin-bottom: var(--spacing-2xl);  // Clear separation
  }
  
  .content-group {
    margin-bottom: var(--spacing-xl);   // Group separation
    
    .content-item {
      margin-bottom: var(--spacing-md); // Item separation
    }
  }
}
```

#### Component Spacing
```scss
// Example: Consistent button group spacing
.button-group {
  display: flex;
  gap: var(--spacing-sm);  // Consistent gap
  
  &.button-group--vertical {
    flex-direction: column;
    gap: var(--spacing-xs);  // Tighter for vertical
  }
}
```

### Common Patterns

#### Card Grid
```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--grid-gap-desktop);
  
  @media (max-width: 767px) {
    gap: var(--grid-gap-mobile);
    grid-template-columns: 1fr;
  }
}
```

#### Form Layout
```scss
.form-layout {
  .form-row {
    display: flex;
    gap: var(--field-gap);
    margin-bottom: var(--field-group-gap);
    
    @media (max-width: 767px) {
      flex-direction: column;
    }
  }
  
  .form-field {
    flex: 1;
    
    label {
      display: block;
      margin-bottom: var(--label-margin-bottom);
    }
    
    .help-text {
      margin-top: var(--help-text-margin-top);
    }
  }
}
```

#### Content Sections
```scss
.content-section {
  padding: var(--section-padding-y-desktop) var(--container-padding);
  
  @media (max-width: 1023px) {
    padding: var(--section-padding-y-tablet) var(--container-padding-tablet);
  }
  
  @media (max-width: 767px) {
    padding: var(--section-padding-y-mobile) var(--container-padding-mobile);
  }
}
```

### Spacing Utilities

#### Margin Utilities
```scss
.m-0 { margin: 0; }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
// ... etc

.mt-sm { margin-top: var(--spacing-sm); }
.mr-sm { margin-right: var(--spacing-sm); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.ml-sm { margin-left: var(--spacing-sm); }
.mx-sm { margin-left: var(--spacing-sm); margin-right: var(--spacing-sm); }
.my-sm { margin-top: var(--spacing-sm); margin-bottom: var(--spacing-sm); }
```

#### Padding Utilities
```scss
.p-0 { padding: 0; }
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
// ... etc

.pt-sm { padding-top: var(--spacing-sm); }
.pr-sm { padding-right: var(--spacing-sm); }
.pb-sm { padding-bottom: var(--spacing-sm); }
.pl-sm { padding-left: var(--spacing-sm); }
.px-sm { padding-left: var(--spacing-sm); padding-right: var(--spacing-sm); }
.py-sm { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
```

#### Gap Utilities
```scss
.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }
```

## Related Documentation
- [Design Tokens Overview](./README.md) - Token system architecture
- [Typography Tokens](./typography.md) - Font specifications
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Grid System](../components/README.md) - Layout components

## Implementation Notes
Spacing should be applied consistently using tokens to maintain visual rhythm. Consider the context and relationship between elements when choosing spacing values. Test responsive spacing across all breakpoints to ensure proper adaptation.

## Last Updated
2025-01-04 - Complete spacing token specification