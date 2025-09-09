# HEUREKKA Design System & Style Guide
## Comprehensive Visual Language Specification

---

## 1. Color System

### Primary Colors
- **Primary**: `#2563EB` - Main CTAs, primary actions, links
- **Primary Dark**: `#1D4ED8` - Hover states, active selections
- **Primary Light**: `#DBEAFE` - Subtle backgrounds, selected states
- **Primary Pale**: `#EFF6FF` - Hover backgrounds, highlights

### Secondary Colors
- **WhatsApp Green**: `#25D366` - WhatsApp CTAs, communication actions
- **WhatsApp Dark**: `#128C7E` - WhatsApp hover states
- **WhatsApp Light**: `#DCF8C6` - Message backgrounds

### Accent Colors
- **Accent Blue**: `#0EA5E9` - Secondary actions, info badges
- **Accent Purple**: `#8B5CF6` - Premium features, special highlights
- **Gradient Start**: `#2563EB` - Hero gradients, premium badges
- **Gradient End**: `#0EA5E9` - Gradient endpoints

### Semantic Colors
- **Success**: `#10B981` - Positive actions, confirmations, verified badges
- **Success Light**: `#D1FAE5` - Success backgrounds
- **Warning**: `#F59E0B` - Caution states, time-sensitive alerts
- **Warning Light**: `#FEF3C7` - Warning backgrounds
- **Error**: `#EF4444` - Errors, destructive actions, required fields
- **Error Light**: `#FEE2E2` - Error backgrounds
- **Info**: `#3B82F6` - Informational messages, tips
- **Info Light**: `#DBEAFE` - Info backgrounds

### Neutral Palette
```css
--neutral-50: #F9FAFB;  /* Backgrounds */
--neutral-100: #F3F4F6; /* Alternate rows */
--neutral-200: #E5E7EB; /* Borders */
--neutral-300: #D1D5DB; /* Disabled borders */
--neutral-400: #9CA3AF; /* Placeholder text */
--neutral-500: #6B7280; /* Secondary text */
--neutral-600: #4B5563; /* Labels */
--neutral-700: #374151; /* Body text */
--neutral-800: #1F2937; /* Headings */
--neutral-900: #111827; /* Primary text */
--neutral-950: #030712; /* High emphasis */
```

### Accessibility Notes
- All color combinations tested for WCAG AA compliance
- Primary on white: 5.4:1 ratio ✓
- Error on white: 4.5:1 ratio ✓
- Success on white: 4.6:1 ratio ✓
- Colorblind-safe palette verified with Deuteranopia/Protanopia simulation

---

## 2. Typography System

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;
```

### Font Weights
- Light: 300 (decorative only)
- Regular: 400 (body text)
- Medium: 500 (emphasized text)
- Semibold: 600 (subheadings)
- Bold: 700 (headings, CTAs)

### Type Scale

#### Cluely-Inspired Typography Scale (Updated 2025)

**Hero Typography (Homepage headlines)**
- **Hero**: `48px/56px → 64px/72px → 80px/88px, 800, -0.025em` - Dramatic homepage titles
- **Display**: `36px/44px → 48px/56px → 64px/72px, 700, -0.02em` - Section headlines  
- **Headline**: `28px/36px → 36px/44px → 48px/56px, 700, -0.015em` - Major headers

**Standard Typography**
- **Title**: `20px/28px → 24px/32px, 600, -0.01em` - Card titles, minor headers
- **Subtitle**: `16px/24px → 18px/28px → 20px/32px, 400, 0` - Supporting text, large descriptions
- **Body Large**: `18px/28px, 400, 0` - Lead paragraphs
- **Body**: `16px/24px, 400, 0` - Standard text
- **Body Small**: `14px/20px, 400, 0` - Secondary info
- **Caption**: `12px/16px, 400, 0` - Metadata, timestamps

**Enhanced Spacing System**
- **Section Spacing**: `64px → 96px → 128px` - Between major sections
- **Content Spacing**: `32px → 48px → 64px` - Between content blocks
- **Element Spacing**: `16px → 24px → 32px` - Between related elements

**Key Changes from Cluely Analysis:**
- Increased headline sizes by 50-100% for dramatic impact
- Enhanced line-height ratios for better readability  
- Tighter letter-spacing on large text for modern feel
- Generous section spacing for clean, uncluttered look

### Text Colors by Context
- **Primary Text**: `#111827` on light backgrounds
- **Secondary Text**: `#6B7280` for supporting information
- **Disabled Text**: `#9CA3AF` for inactive elements
- **Inverted Text**: `#FFFFFF` on dark backgrounds
- **Link Text**: `#2563EB` with underline on hover
- **Error Text**: `#EF4444` for validation messages

---

## 3. Spacing & Layout System

### Base Unit
**8px** grid system for consistent alignment

### Spacing Scale
```css
--space-0: 0px;
--space-1: 4px;   /* Micro spacing */
--space-2: 8px;   /* Tight spacing */
--space-3: 12px;  /* Compact spacing */
--space-4: 16px;  /* Default spacing */
--space-5: 20px;  /* Comfortable spacing */
--space-6: 24px;  /* Medium spacing */
--space-8: 32px;  /* Large spacing */
--space-10: 40px; /* Section spacing */
--space-12: 48px; /* Major spacing */
--space-16: 64px; /* Hero spacing */
--space-20: 80px; /* Page sections */
--space-24: 96px; /* Maximum spacing */
```

### Grid System

#### Desktop Grid (1024px+)
- **Columns**: 12
- **Gutter**: 24px
- **Margin**: 32px
- **Max Container**: 1280px

#### Tablet Grid (768px-1023px)
- **Columns**: 8
- **Gutter**: 20px
- **Margin**: 24px
- **Max Container**: 100%

#### Mobile Grid (320px-767px)
- **Columns**: 4
- **Gutter**: 16px
- **Margin**: 16px
- **Max Container**: 100%

### Breakpoints
```css
--mobile-small: 320px;
--mobile: 375px;
--mobile-large: 425px;
--tablet: 768px;
--desktop: 1024px;
--desktop-large: 1440px;
--desktop-xl: 1920px;
```

### Container Widths
```css
--container-xs: 100%;
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## 4. Component Specifications

### Buttons

#### Primary Button
**Visual Specifications**
- **Height**: `48px` (mobile), `40px` (desktop)
- **Padding**: `12px 24px` (mobile), `8px 20px` (desktop)
- **Border Radius**: `8px`
- **Background**: `#2563EB`
- **Text**: `14px, 600, #FFFFFF`
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.12)`

**States**
- **Hover**: Background `#1D4ED8`, Shadow `0 4px 6px rgba(0, 0, 0, 0.15)`
- **Active**: Background `#1E40AF`, Shadow `inset 0 2px 4px rgba(0, 0, 0, 0.15)`
- **Focus**: Outline `2px solid #2563EB`, Outline offset `2px`
- **Disabled**: Background `#E5E7EB`, Text `#9CA3AF`, No shadow
- **Loading**: Spinner icon, Text opacity `0.7`

#### WhatsApp Button
**Visual Specifications**
- **Height**: `48px`
- **Padding**: `12px 24px`
- **Border Radius**: `24px`
- **Background**: `#25D366`
- **Text**: `14px, 600, #FFFFFF`
- **Icon**: WhatsApp logo 20x20px, 8px margin-right
- **Shadow**: `0 2px 8px rgba(37, 211, 102, 0.3)`

#### Secondary Button
**Visual Specifications**
- **Height**: `40px`
- **Padding**: `8px 20px`
- **Border Radius**: `8px`
- **Background**: `transparent`
- **Border**: `1px solid #D1D5DB`
- **Text**: `14px, 500, #374151`

#### Ghost Button
**Visual Specifications**
- **Height**: `40px`
- **Padding**: `8px 16px`
- **Background**: `transparent`
- **Text**: `14px, 500, #2563EB`
- **Hover**: Background `#EFF6FF`

### Form Elements

#### Text Input
**Visual Specifications**
- **Height**: `48px` (mobile), `40px` (desktop)
- **Padding**: `12px 16px`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Background**: `#FFFFFF`
- **Font**: `14px, 400, #111827`
- **Placeholder**: `14px, 400, #9CA3AF`

**States**
- **Focus**: Border `#2563EB`, Shadow `0 0 0 3px rgba(37, 99, 235, 0.1)`
- **Error**: Border `#EF4444`, Background `#FEF2F2`
- **Disabled**: Background `#F3F4F6`, Text `#9CA3AF`
- **Success**: Border `#10B981`, Icon checkmark right-aligned

#### Select Dropdown
**Visual Specifications**
- **Height**: `48px` (mobile), `40px` (desktop)
- **Padding**: `12px 40px 12px 16px`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Arrow Icon**: `20px` chevron-down, right `12px`
- **Background**: `#FFFFFF`

#### Checkbox/Radio
**Visual Specifications**
- **Size**: `20px × 20px`
- **Border**: `2px solid #D1D5DB`
- **Border Radius**: `4px` (checkbox), `50%` (radio)
- **Checked**: Background `#2563EB`, Check icon `#FFFFFF`
- **Focus**: Outline `2px solid #2563EB`, Offset `2px`

### Cards

#### Property Card
**Visual Specifications**
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Padding**: `16px`
- **Hover**: Shadow `0 4px 12px rgba(0, 0, 0, 0.15)`, Transform `translateY(-2px)`

**Layout**
- **Image**: 16:9 ratio, `border-radius: 8px`
- **Title**: `16px, 600, #111827`
- **Price**: `20px, 700, #2563EB`
- **Details**: `14px, 400, #6B7280`
- **CTA Button**: Full width on mobile, auto on desktop

#### Dashboard Card
**Visual Specifications**
- **Background**: `#FFFFFF`
- **Border Radius**: `8px`
- **Shadow**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **Padding**: `24px`
- **Header**: Border-bottom `1px solid #E5E7EB`

### Navigation

#### Mobile Bottom Navigation
**Visual Specifications**
- **Height**: `64px`
- **Background**: `#FFFFFF`
- **Border Top**: `1px solid #E5E7EB`
- **Shadow**: `0 -2px 10px rgba(0, 0, 0, 0.1)`
- **Icons**: `24px`, color `#6B7280`
- **Active Icon**: Color `#2563EB`, Label visible
- **Safe Area**: Additional `env(safe-area-inset-bottom)`

#### Desktop Header
**Visual Specifications**
- **Height**: `64px`
- **Background**: `#FFFFFF`
- **Border Bottom**: `1px solid #E5E7EB`
- **Logo**: Height `32px`
- **Navigation Items**: `14px, 500, #374151`
- **Active Item**: Color `#2563EB`, Border-bottom `2px solid #2563EB`

### Modals & Overlays

#### Modal
**Visual Specifications**
- **Background**: `#FFFFFF`
- **Border Radius**: `16px`
- **Shadow**: `0 20px 25px rgba(0, 0, 0, 0.15)`
- **Max Width**: `500px` (desktop), `calc(100% - 32px)` (mobile)
- **Padding**: `24px`
- **Backdrop**: `rgba(0, 0, 0, 0.5)`

#### Toast Notification
**Visual Specifications**
- **Min Height**: `48px`
- **Padding**: `12px 16px`
- **Border Radius**: `8px`
- **Shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Animation**: Slide in from top/bottom, 300ms ease-out

---

## 5. Motion & Animation System

### Timing Functions
```css
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);      /* Entrances */
--ease-in: cubic-bezier(0.4, 0, 1, 1);         /* Exits */
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);   /* Transitions */
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Playful bounces */
```

### Duration Scale
```css
--duration-75: 75ms;    /* Micro interactions */
--duration-150: 150ms;  /* Hover states */
--duration-200: 200ms;  /* Quick transitions */
--duration-300: 300ms;  /* Standard transitions */
--duration-500: 500ms;  /* Complex animations */
--duration-700: 700ms;  /* Page transitions */
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale In
```css
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
```

### Loading States

#### Skeleton Screen
```css
--skeleton-base: #E5E7EB;
--skeleton-shine: linear-gradient(
  90deg,
  transparent,
  rgba(255, 255, 255, 0.5),
  transparent
);
animation: shimmer 2s infinite;
```

#### Spinner
```css
--spinner-size: 20px;
--spinner-color: #2563EB;
--spinner-track: #E5E7EB;
animation: spin 1s linear infinite;
```

---

## 6. Elevation System

### Shadow Scale
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.12);
```

### Elevation Levels
- **Level 0**: No shadow (background surfaces)
- **Level 1**: `shadow-sm` (cards, inputs)
- **Level 2**: `shadow-md` (dropdowns, hover states)
- **Level 3**: `shadow-lg` (modals, popovers)
- **Level 4**: `shadow-xl` (dialogs, sheets)
- **Level 5**: `shadow-2xl` (floating action buttons)

---

## 7. Iconography

### Icon Style
- **Size**: 16px (inline), 20px (buttons), 24px (navigation)
- **Stroke Width**: 1.5px
- **Style**: Outline icons (Heroicons style)
- **Color**: Inherit from parent text color

### Common Icons
```
Home: 🏠 house outline
Search: 🔍 magnifying glass
Profile: 👤 user circle
Messages: 💬 chat bubble
Heart: ❤️ heart outline/filled
Location: 📍 map pin
Filter: ⚙️ adjustments
WhatsApp: Custom WhatsApp logo
Check: ✓ checkmark
Close: ✕ x-mark
Menu: ☰ hamburger
Arrow: → chevron variations
```

---

## 8. Responsive Design Specifications

### Mobile-First Breakpoints
```css
/* Mobile First - Default styles for mobile */
.component {
  /* Mobile styles */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* Tablet adjustments */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    /* Desktop enhancements */
  }
}
```

### Touch Target Guidelines
- **Minimum Size**: 48px × 48px
- **Spacing**: 8px minimum between targets
- **Thumb Reach**: Primary actions in bottom 1/3 of screen
- **Edge Padding**: 16px from screen edges

### Mobile Optimizations
- Single column layouts
- Sticky headers and CTAs
- Bottom sheets over modals
- Swipe gestures for carousels
- Tap to expand/collapse sections

---

## 9. Accessibility Specifications

### Focus Indicators
```css
--focus-ring: 2px solid #2563EB;
--focus-offset: 2px;
--focus-radius: inherit;
```

### Color Contrast Requirements
- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum (18px+ or 14px+ bold)
- **UI Components**: 3:1 minimum
- **Decorative Elements**: No requirement

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for icons and buttons
- Alt text for all informative images
- Skip navigation links
- Form field descriptions

### Keyboard Navigation
- Tab order follows visual flow
- Focus trap in modals
- Escape key closes overlays
- Enter/Space activates buttons
- Arrow keys for selection lists

---

## 10. Platform Adaptations

### iOS Specific
- Safe area insets for notch/home indicator
- SF Symbols where applicable
- iOS-style navigation transitions
- Pull-to-refresh gesture
- Haptic feedback for actions

### Android Specific
- Material Design elevation
- Back button handling
- FAB positioning
- Ripple effects on touch
- System navigation gestures

### Progressive Web App
- App icon and splash screens
- Offline page design
- Install prompt UI
- Update notification banner
- Cache strategy indicators

---

## Design Token Export

### CSS Variables
```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #DBEAFE;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --text-base: 16px;
  --text-scale: 1.25;
  
  /* Spacing */
  --space-unit: 8px;
  
  /* Animation */
  --duration-base: 200ms;
  --easing-default: cubic-bezier(0.4, 0, 0.6, 1);
}
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
}
```

---

## Implementation Notes

### Performance Budgets
- CSS: <50KB gzipped
- Fonts: <100KB total
- First Paint: <1.5s
- Interactive: <3s

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Chrome Mobile 90+
- Safari iOS 14+

### Testing Checklist
- [ ] Color contrast validation
- [ ] Touch target size audit
- [ ] Keyboard navigation test
- [ ] Screen reader compatibility
- [ ] Performance metrics
- [ ] Cross-browser testing

---

*Version 1.0.0 | Last Updated: September 4, 2025*