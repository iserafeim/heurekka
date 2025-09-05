---
title: Visual Design Mockups & Wireframes
description: Reference wireframes and visual specifications for key screens
last-updated: 2025-01-04
version: 1.0.0
status: approved
---

# Visual Design Mockups & Wireframes

## Overview
This directory contains detailed wireframes and visual specifications for all key screens in the Heurekka application. These serve as visual references for developers during implementation.

## Directory Structure
```
wireframes/
├── README.md                    # This file
├── homepage/                    # Homepage wireframes
│   ├── desktop.md              # Desktop layout
│   ├── tablet.md               # Tablet layout
│   └── mobile.md               # Mobile layout
├── search-results/             # Search results wireframes
│   ├── grid-view.md           # Grid layout
│   ├── list-view.md           # List layout
│   └── map-view.md            # Map layout
├── property-details/           # Property detail wireframes
│   ├── overview.md            # Main property page
│   ├── gallery.md             # Photo gallery
│   └── contact-form.md        # Contact section
├── profile-creation/           # Search profile wireframes
│   ├── wizard-steps.md        # Multi-step form
│   ├── location-selection.md  # Map interface
│   └── confirmation.md        # Success state
└── components/                 # Component wireframes
    ├── navigation.md          # Navigation patterns
    ├── cards.md              # Card layouts
    ├── forms.md              # Form elements
    └── modals.md             # Modal windows
```

## Wireframe Legend

### Symbols Used
```
┌─────────────┐  Container/Box
│             │  
└─────────────┘

╔═════════════╗  Header/Important Section
║             ║
╚═════════════╝

┏━━━━━━━━━━━━━┓  Interactive Element
┃             ┃
┗━━━━━━━━━━━━━┛

[Button]         Button
<Input Field>    Input Field
○ Radio          Radio Button
☐ Checkbox       Checkbox
▼ Dropdown       Dropdown Menu
★ Favorite       Favorite/Star
⋮ Menu           Menu Icon
≡ Hamburger      Hamburger Menu
× Close          Close Button
← Back           Back Arrow
→ Forward        Forward Arrow
🔍 Search        Search Icon
👤 User          User Avatar
📍 Location      Location Pin
```

### Layout Grid
```
Desktop: 12 columns, 24px gutter, 1200px max-width
Tablet:  8 columns, 16px gutter, 768px max-width
Mobile:  4 columns, 16px gutter, 100% width
```

### Spacing Units
```
4px   - xs  - Micro spacing
8px   - sm  - Small spacing
16px  - md  - Default spacing
24px  - lg  - Section spacing
32px  - xl  - Large spacing
48px  - 2xl - Extra large spacing
64px  - 3xl - Huge spacing
```

## Color Coding in Wireframes
```
Primary Actions     : ████ (#6366F1)
Secondary Actions   : ░░░░ (#F3F4F6)
Success States      : ████ (#10B981)
Error States        : ████ (#EF4444)
Warning States      : ████ (#F59E0B)
Text Primary        : ████ (#1A1A1A)
Text Secondary      : ████ (#6B7280)
Borders            : ---- (#E5E7EB)
```

## How to Use These Wireframes

### For Developers
1. Reference the appropriate screen wireframe for layout structure
2. Check component specifications for detailed measurements
3. Use the visual hierarchy guide for element priorities
4. Follow responsive breakpoints for different devices
5. Implement interactive states as specified

### For Designers
1. Use as baseline for high-fidelity mockups
2. Maintain consistency with established patterns
3. Reference spacing and grid systems
4. Follow component specifications
5. Document any deviations

### For Product Managers
1. Verify feature requirements are represented
2. Review user flows and interactions
3. Confirm business logic is accommodated
4. Check accessibility considerations
5. Validate mobile experience

## Visual Hierarchy Principles

### Size Scale
```
Display    : 48px - 64px
H1         : 32px - 40px
H2         : 24px - 28px
H3         : 20px - 22px
H4         : 18px
Body Large : 16px
Body       : 14px
Small      : 12px
```

### Weight Scale
```
Bold       : 700
Semibold   : 600
Medium     : 500
Regular    : 400
Light      : 300
```

### Visual Weight Priority
1. Primary CTA buttons
2. Headlines and prices
3. Interactive elements
4. Body content
5. Supporting information
6. Metadata and timestamps

## Responsive Design Approach

### Mobile-First
- Start with mobile wireframes
- Progressively enhance for larger screens
- Ensure touch-friendly interactions
- Optimize for vertical scrolling

### Breakpoint Transitions
```
320px  - 767px   : Mobile
768px  - 1023px  : Tablet
1024px - 1439px  : Desktop
1440px+          : Wide
```

### Content Reflow Patterns
- Stack horizontally aligned elements vertically on mobile
- Hide non-essential elements on smaller screens
- Use accordions/tabs for complex information
- Implement off-canvas navigation for mobile

## Interactive State Representations

### Default State
```
┌─────────────┐
│   Element   │
└─────────────┘
```

### Hover State
```
┏━━━━━━━━━━━━━┓
┃   Element   ┃  (Bold border)
┗━━━━━━━━━━━━━┛
```

### Active/Pressed State
```
╔═════════════╗
║   Element   ║  (Double border)
╚═════════════╝
```

### Disabled State
```
┌┈┈┈┈┈┈┈┈┈┈┈┈┈┐
┊   Element   ┊  (Dotted border)
└┈┈┈┈┈┈┈┈┈┈┈┈┈┘
```

### Selected State
```
█████████████████
█   Element     █  (Filled background)
█████████████████
```

## Animation Indicators

### Transition Types
```
→ Slide right
← Slide left
↑ Slide up
↓ Slide down
↻ Rotate
⟷ Scale
◐ Fade
```

### Duration Scale
```
Micro      : 100-200ms
Fast       : 200-300ms
Normal     : 300-500ms
Slow       : 500-800ms
```

### Easing Functions
```
ease-out   : Fast start, slow end (entrances)
ease-in    : Slow start, fast end (exits)
ease-in-out: Smooth both ends (transitions)
linear     : Constant speed (progress)
```

## Next Steps

1. Review individual screen wireframes
2. Check component specifications
3. Validate against user requirements
4. Implement with actual visual assets
5. Test on target devices

## Related Documentation
- [Design System](../../design-system/)
- [Component Library](../../design-system/components/)
- [Feature Specifications](../../features/)
- [Accessibility Guidelines](../../accessibility/)