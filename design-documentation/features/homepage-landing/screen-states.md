# Homepage Screen States & Visual Specifications
## Complete State Documentation for All Viewport Sizes

---
title: Homepage Screen States Documentation
description: Comprehensive visual specifications for all homepage states and responsive layouts
feature: homepage-landing
last-updated: 2025-01-05
version: 1.0.0
related-files:
  - ./README.md
  - ./user-journey.md
  - ./interactions.md
  - ../../design-system/style-guide.md
status: approved
---

## Screen State Overview

The homepage maintains multiple visual states based on user interaction, data availability, and system status. Each state is optimized for mobile-first delivery with progressive enhancement for larger screens.

---

## 1. Default State (Initial Load)

### Mobile Layout (320-767px)

```
┌─────────────────────────┐ 375×812px (iPhone 12)
│ Status Bar          9:41│ System status
├─────────────────────────┤
│ HEUREKKA           ☰    │ 56px height
├─────────────────────────┤ Sticky header
│                         │
│    Find Your Perfect    │ 28px/36px, 700
│   Home in Tegucigalpa   │ #111827
│                         │ 
│  Create one profile.    │ 16px/24px, 400
│  Contact landlords.     │ #6B7280
│  Save time.            │
│                         │ 24px spacing
│ ┌─────────────────────┐ │
│ │ 🔍 Search area...   │ │ 56px height
│ └─────────────────────┘ │ #2563EB border
│                         │
│ Popular areas:          │ 14px/20px, 500
│ Los Próceres • Lomas   │ #6B7280
│ Las Colinas • Centro   │ Links #2563EB
│                         │
│ ┌─────────────────────┐ │
│ │ Create Free Profile │ │ 48px height
│ └─────────────────────┘ │ #2563EB bg
│                         │
│ ✓ No fees              │ 12px/16px
│ ✓ Save time            │ #10B981 checks
│ ✓ WhatsApp ready       │
│                         │
├─────────────────────────┤ 48px margin
│   How HEUREKKA Works   │ 22px/28px, 600
│                         │
│ ┌─────────────────────┐ │
│ │ 1. Create Profile   │ │ Card design
│ │ Tell us what you're │ │ 16px padding
│ │ looking for once    │ │ #FFFFFF bg
│ └─────────────────────┘ │ 1px border
│                         │
│ ┌─────────────────────┐ │
│ │ 2. Browse Properties│ │
│ │ See matches with    │ │
│ │ photos and details  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 3. Contact via WA   │ │
│ │ Your profile shared │ │
│ │ automatically       │ │
│ └─────────────────────┘ │
│                         │
│ [Get Started →]         │ Text link CTA
│                         │
├─────────────────────────┤
│  Recent Properties      │ 22px/28px, 600
│                         │
│ ← Swipe to see more →  │ Hint text
│                         │
│ ┌──────┬──────┬──────┐ │ Horizontal
│ │Card 1│Card 2│Card 3│ │ scroll
│ │      │      │      │ │ container
│ └──────┴──────┴──────┘ │
│                         │
│ [View All Properties]   │ Link CTA
│                         │
├─────────────────────────┤
│      Why HEUREKKA?      │ Centered
│                         │
│        500+             │ 32px/40px, 700
│     Properties          │ #2563EB
│                         │
│      15 min             │
│   Avg Response          │
│                         │
│        40%              │
│  Successful Matches     │
│                         │
├─────────────────────────┤
│  Ready to find your    │ 18px/28px
│     next home?         │ Centered
│                         │
│ ┌─────────────────────┐ │
│ │  Start Searching    │ │ Secondary CTA
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤ Footer
│ About • Terms • Privacy│ 12px/16px
│ Contact • Help         │ #6B7280
│                         │
│ © 2025 HEUREKKA        │
└─────────────────────────┘
```

### Tablet Layout (768-1023px)

```
┌───────────────────────────────────────┐ 768×1024px (iPad)
│ HEUREKKA    Explore  How It Works  ☰ │ 64px height
├───────────────────────────────────────┤
│                                       │
│     Find Your Perfect Home in        │ 32px/40px, 700
│           Tegucigalpa                │ Centered
│                                       │
│  Create one profile. Contact multiple│ 18px/28px, 400
│   landlords. Save hours of time.     │
│                                       │
│    ┌─────────────────────────────┐   │ 600px max-width
│    │ 🔍 Search neighborhoods...   │   │ 48px height
│    └─────────────────────────────┘   │
│                                       │
│ Popular: [Los Próceres] [Lomas] [+]  │ Pills design
│                                       │
│  [Create Profile]  [Browse Properties]│ Dual CTAs
│                                       │
│     ✓ 500+ Props  ✓ No Fees  ✓ WA   │ Horizontal badges
│                                       │
├───────────────────────────────────────┤
│           How HEUREKKA Works          │
│                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│ 3-column grid
│ │ Profile  │→│  Browse  │→│ Contact  ││ Connected cards
│ └──────────┘ └──────────┘ └──────────┘│
│                                       │
├───────────────────────────────────────┤
│         Recent Properties             │
│                                       │
│ ┌────────────┐ ┌────────────┐        │ 2-column grid
│ │ Property 1 │ │ Property 2 │        │
│ └────────────┘ └────────────┘        │
│ ┌────────────┐ ┌────────────┐        │
│ │ Property 3 │ │ Property 4 │        │
│ └────────────┘ └────────────┘        │
│                                       │
└───────────────────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────┐ 1440×900px
│ HEUREKKA   Explore  How It Works  List Property  Login  │ Full nav
├──────────────────────────────────────────────────────────┤
│                                                          │ Hero section
│         Find Your Perfect Home in Tegucigalpa          │ 40px/48px
│                                                          │
│    Create one profile. Contact multiple landlords.      │ 20px/32px
│         Save hours of repetitive conversations.         │
│                                                          │
│        ┌─────────────────────────────────────┐          │
│        │ 🔍 Search neighborhoods or keywords │          │ 56px height
│        └─────────────────────────────────────┘          │
│                                                          │
│   Popular: [Los Próceres] [Lomas] [Las Colinas] [+]    │
│                                                          │
│     [Create Your Free Profile]  [Browse Properties]     │ 48px height
│                                                          │
│      ✓ 500+ Properties  ✓ No Fees  ✓ WhatsApp Ready   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   How HEUREKKA Works                     │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐   │ 3-col layout
│  │ 1. Create  │ → │ 2. Browse  │ → │ 3. Contact │   │ Arrow connectors
│  │   Profile  │    │ Properties │    │ via WhatsApp│   │
│  └────────────┘    └────────────┘    └────────────┘   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                  Recent Properties                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ 3-col grid
│  │Property 1│  │Property 2│  │Property 3│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Property 4│  │Property 5│  │Property 6│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│              [View All Properties →]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Loading State

### Skeleton Screen Structure

```
┌─────────────────────────┐
│ HEUREKKA           ☰    │ Header loaded
├─────────────────────────┤
│                         │
│ ████████████████████   │ Shimmer effect
│ ██████████████         │ for headline
│                         │
│ ███████████████████    │ Shimmer for
│ ████████████           │ subheadline
│                         │
│ ┌─────────────────────┐ │
│ │░░░░░░░░░░░░░░░░░░░░│ │ Search bar
│ └─────────────────────┘ │ skeleton
│                         │
│ ░░░░ ░░░░ ░░░░        │ Pills skeleton
│                         │
│ ┌─────────────────────┐ │
│ │░░░░░░░░░░░░░░░░░░░░│ │ CTA skeleton
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ █████████████          │ Section title
│                         │
│ ┌──────┬──────┬──────┐ │
│ │░░░░░░│░░░░░░│░░░░░░│ │ Card skeletons
│ │░░░░░░│░░░░░░│░░░░░░│ │
│ └──────┴──────┴──────┘ │
└─────────────────────────┘
```

### Loading Animation Specifications
```css
/* Shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 3. Search Active State

### Search Focused with Autocomplete

```
┌─────────────────────────┐
│ HEUREKKA           ☰    │
├─────────────────────────┤
│                         │ Dimmed bg
│    Find Your Perfect    │ opacity: 0.5
│   Home in Tegucigalpa   │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔍 Los Pr|          │ │ Active input
│ └─────────────────────┘ │ Border #1D4ED8
│ ┌─────────────────────┐ │ Shadow expanded
│ │ 📍 Popular Areas    │ │ Dropdown
│ │ • Los Próceres (45) │ │ #FFFFFF bg
│ │ • Los Próceres del  │ │ Shadow elevation
│ │   Valle (12)        │ │
│ │                     │ │
│ │ 🔍 Recent Searches  │ │
│ │ • 2 bedroom apt     │ │
│ │ • House with garden │ │
│ │                     │ │
│ │ → Search all "Los"  │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Search Results Loading

```
┌─────────────────────────┐
│ 🔍 Los Próceres     ×  │ Search query shown
├─────────────────────────┤
│                         │
│    Searching...         │ Loading message
│      ○ ○ ● ○           │ Animated dots
│                         │
│ ┌─────────────────────┐ │
│ │░░░░░░░░░░░░░░░░░░░░│ │ Result skeletons
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │░░░░░░░░░░░░░░░░░░░░│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 4. Error States

### Network Error

```
┌─────────────────────────┐
│ HEUREKKA           ☰    │
├─────────────────────────┤
│                         │
│         ⚠️              │ 48px icon
│                         │
│   Connection Issue      │ 20px/28px, 600
│                         │ #111827
│ We're having trouble    │ 14px/20px, 400
│ loading content.        │ #6B7280
│ Please check your       │
│ connection.             │
│                         │
│ ┌─────────────────────┐ │
│ │    Try Again        │ │ Primary CTA
│ └─────────────────────┘ │
│                         │
│ Or contact us on        │
│ WhatsApp: +504 9999999  │ Fallback option
│                         │
└─────────────────────────┘
```

### No Search Results

```
┌─────────────────────────┐
│ 🔍 "casa 3 habitaciones│ Query shown
│     San Pedro Sula"  × │
├─────────────────────────┤
│                         │
│         🏠              │ 48px icon
│                         │
│   No properties found   │ 20px/28px, 600
│                         │
│ Try adjusting your      │ 14px/20px, 400
│ search or browse        │
│ these areas instead:    │
│                         │
│ • Los Próceres (45)     │ Suggestions
│ • Lomas (32)            │ with counts
│ • Las Colinas (28)      │
│                         │
│ ┌─────────────────────┐ │
│ │ Post What You Need  │ │ Alternative CTA
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

---

## 5. Interactive States

### Property Card States

#### Default State
```
┌─────────────────────────┐
│ [Image: 16:9 ratio]     │ Lazy loaded
│                         │ 400×225px
│ L.12,000/month         │ 16px/20px, 600
│ 2BR Apartment          │ 14px/20px, 400
│ Los Próceres           │ 14px/20px, 400
│                         │
│ WhatsApp • 2 hours ago │ 12px/16px
└─────────────────────────┘
Border: 1px solid #E5E7EB
Background: #FFFFFF
```

#### Hover State (Desktop)
```
┌─────────────────────────┐
│ [Image with overlay]    │ Slight zoom
│ [→ View Details]        │ Overlay CTA
│                         │
│ L.12,000/month         │ Color #2563EB
│ 2BR Apartment          │
│ Los Próceres           │
│                         │
│ WhatsApp • 2 hours ago │
└─────────────────────────┘
Shadow: 0 4px 6px rgba(0,0,0,0.1)
Transform: translateY(-2px)
```

#### Loading State
```
┌─────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░ │ Image skeleton
│ ░░░░░░░░░░░░░░░░░░░░░░ │
│ ███████████            │ Price skeleton
│ ████████               │ Type skeleton
│ ██████████             │ Location skeleton
│                         │
│ ░░░░░ ░░░░░░          │ Meta skeleton
└─────────────────────────┘
```

### CTA Button States

#### Primary CTA - Default
```
┌─────────────────────────┐
│   Create Free Profile   │
└─────────────────────────┘
Height: 48px
Background: #2563EB
Color: #FFFFFF
Border-radius: 8px
Font: 14px/20px, 600
```

#### Primary CTA - Hover
```
┌─────────────────────────┐
│   Create Free Profile   │
└─────────────────────────┘
Background: #1D4ED8
Shadow: 0 4px 6px rgba(37,99,235,0.2)
Transform: translateY(-1px)
```

#### Primary CTA - Active
```
┌─────────────────────────┐
│   Create Free Profile   │
└─────────────────────────┘
Background: #1E40AF
Transform: translateY(0)
Shadow: inset 0 1px 2px rgba(0,0,0,0.1)
```

#### Primary CTA - Loading
```
┌─────────────────────────┐
│      ○ ○ ● ○          │
└─────────────────────────┘
Animation: Rotating dots
Background: #2563EB (dimmed)
Cursor: not-allowed
```

---

## 6. Scroll States

### Sticky Header Transformation

#### Initial (No Scroll)
```
┌─────────────────────────┐
│ HEUREKKA           ☰    │ 56px height
├─────────────────────────┤ Full header
```

#### Scrolled (Compressed)
```
┌─────────────────────────┐
│ HEUREKKA  🔍  ☰        │ 48px height
└─────────────────────────┘ Search icon added
Shadow: 0 2px 4px rgba(0,0,0,0.1)
Background: #FFFFFF 95% opacity
Backdrop-filter: blur(8px)
```

### Parallax Effects (Desktop Only)

```css
/* Hero background parallax */
.hero-bg {
  transform: translateY(calc(scrollY * 0.5));
}

/* Section reveal on scroll */
.section {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.section.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 7. Form States

### Profile Creation Mini-Form

#### Step 1: Basic Info
```
┌─────────────────────────┐
│ Create Your Profile     │ Modal header
│ Step 1 of 2        ×    │
├─────────────────────────┤
│                         │
│ Your Name *             │ Label
│ ┌─────────────────────┐ │
│ │ María García        │ │ Input field
│ └─────────────────────┘ │
│                         │
│ WhatsApp Number *       │
│ ┌─────────────────────┐ │
│ │ +504 9999-9999      │ │ With validation
│ └─────────────────────┘ │
│                         │
│ Email (Optional)        │
│ ┌─────────────────────┐ │
│ │ maria@email.com     │ │
│ └─────────────────────┘ │
│                         │
│ [Continue →]            │ Primary CTA
│                         │
└─────────────────────────┘
```

#### Input Field States

```
/* Default */
┌─────────────────────────┐
│ Placeholder text        │
└─────────────────────────┘
Border: 1px solid #D1D5DB
Background: #FFFFFF

/* Focused */
┌─────────────────────────┐
│ User input|             │
└─────────────────────────┘
Border: 2px solid #2563EB
Shadow: 0 0 0 3px rgba(37,99,235,0.1)

/* Error */
┌─────────────────────────┐
│ Invalid input           │
└─────────────────────────┘
Border: 2px solid #EF4444
Background: #FEF2F2
Error message below: 12px, #EF4444

/* Success */
┌─────────────────────────┐
│ Valid input ✓           │
└─────────────────────────┘
Border: 2px solid #10B981
Icon: Green checkmark
```

---

## 8. Responsive Breakpoint Transitions

### Breakpoint Specifications

```css
/* Mobile First Approach */

/* Base (Mobile) */
@media (min-width: 320px) {
  .container { padding: 16px; }
  .hero-title { font-size: 28px; }
  .cta-button { width: 100%; }
}

/* Large Mobile */
@media (min-width: 414px) {
  .container { padding: 20px; }
  .hero-title { font-size: 32px; }
}

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 32px; }
  .hero-title { font-size: 40px; }
  .cta-button { width: auto; min-width: 180px; }
  .property-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
  .hero-title { font-size: 48px; }
  .property-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Wide */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
  .property-grid { grid-template-columns: repeat(4, 1fr); }
}
```

---

## 9. Dark Mode Considerations (Future)

### Dark Theme Palette
```css
:root[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --border: #374151;
  --primary: #3B82F6;
  --primary-dark: #2563EB;
}
```

### Dark Mode Components
```
┌─────────────────────────┐
│ HEUREKKA           ☰    │ Dark header
│                         │ #1F2937 bg
├─────────────────────────┤
│                         │ #111827 bg
│    Find Your Perfect    │ #F9FAFB text
│   Home in Tegucigalpa   │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔍 Search area...   │ │ #1F2937 bg
│ └─────────────────────┘ │ #374151 border
│                         │
└─────────────────────────┘
```

---

## 10. Accessibility States

### Focus Indicators
```
/* Keyboard navigation focus */
:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .cta-button {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Announcements
```html
<!-- Live regions for dynamic content -->
<div role="status" aria-live="polite" aria-atomic="true">
  <span class="sr-only">45 properties found in Los Próceres</span>
</div>

<!-- Loading states -->
<div role="status" aria-live="assertive">
  <span class="sr-only">Loading search results...</span>
</div>

<!-- Error states -->
<div role="alert" aria-live="assertive">
  <span>No properties found. Try adjusting your search.</span>
</div>
```

---

## Visual Design Tokens

### Spacing System
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Shadow System
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 300;
--z-popover: 400;
--z-tooltip: 500;
```

---

*Screen States Version: 1.0.0 | Last Updated: January 5, 2025*