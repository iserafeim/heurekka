# Button Component Specifications
## HEUREKKA Design System - Homepage Authority

---

## Primary Button (Homepage Standard)

### Purpose
Main call-to-action buttons that drive primary user actions like "Create Free Profile", "Browse Properties", "Get Started", "Search".

### Visual Specifications (Homepage Extracted)

#### All Breakpoints (Consistent 48px Height)
- **Height**: `48px` (consistent across all breakpoints)
- **Padding**: `12px 24px`
- **Font Size**: `14px`
- **Line Height**: `20px`
- **Font Weight**: `600`
- **Border Radius**: `8px`
- **Min Width**: `180px` (desktop), `100%` (mobile)
- **Text Color**: `#FFFFFF`
- **Text Transform**: None (no uppercase)

### States (Homepage Implementation)

#### Default
```css
background: #2563EB;
color: #FFFFFF;
border: none;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
cursor: pointer;
```

#### Hover
```css
background: #1D4ED8;
box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
transform: translateY(-1px);
transition: all 150ms ease-out;
```

#### Active/Pressed
```css
background: #1E40AF;
box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
transform: translateY(0);
```

#### Focus
```css
border: 2px solid #1D4ED8;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
outline: none;
```

#### Disabled
```css
background: #E5E7EB;
color: #9CA3AF;
cursor: not-allowed;
box-shadow: none;
```

#### Loading
```css
background: #2563EB;
opacity: 0.8;
cursor: wait;
/* Animated dots: ○ ○ ● ○ */
```

### Homepage Examples
```html
<!-- Hero CTA -->
<button class="btn-primary">
  Create Free Profile
</button>

<!-- Dual CTAs -->
<button class="btn-primary">Create Your Free Profile</button>
<button class="btn-primary-outline">Browse Properties</button>
```

### Implementation
```tsx
<button className="
  bg-[#2563EB] text-white font-semibold
  h-12 px-6 min-w-[180px] md:min-w-[180px]
  rounded-lg
  shadow-sm hover:shadow-[0_4px_6px_rgba(37,99,235,0.2)]
  hover:bg-[#1D4ED8] hover:-translate-y-px
  active:bg-[#1E40AF] active:translate-y-0 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]
  focus:border-2 focus:border-[#1D4ED8] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]
  disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed
  transition-all duration-150
  text-sm leading-5
">
  Create Free Profile
</button>
```

---

## WhatsApp Button

### Purpose
Specialized button for WhatsApp integration - the primary communication method in HEUREKKA.

### Visual Specifications (Homepage Pattern)

#### All Breakpoints
- **Height**: `48px`
- **Padding**: `12px 24px`
- **Font Size**: `14px`
- **Font Weight**: `600`
- **Border Radius**: `24px` (pill shape)
- **Background**: `#25D366`
- **Icon**: WhatsApp logo `20×20px`
- **Icon Spacing**: `8px` from text

### States

#### Default
```css
background: #25D366;
color: #FFFFFF;
box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
```

#### Hover
```css
background: #128C7E;
box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
transform: scale(1.02);
```

#### Active
```css
background: #128C7E;
transform: scale(1);
```

### Implementation
```tsx
<button className="
  bg-[#25D366] text-white font-semibold
  h-12 px-6 rounded-full
  flex items-center justify-center gap-2
  shadow-[0_2px_8px_rgba(37,211,102,0.3)]
  hover:bg-[#128C7E] hover:scale-[1.02]
  active:scale-100
  transition-all duration-150
  text-sm leading-5
">
  <WhatsAppIcon className="w-5 h-5" />
  <span>Contact via WhatsApp</span>
</button>
```

---

## Secondary Button (Homepage Outline)

### Purpose
Supporting actions that complement primary CTAs, like "Browse Properties" when paired with "Create Profile".

### Visual Specifications

#### All Breakpoints
- **Height**: `48px`
- **Padding**: `12px 24px`
- **Border**: `1px solid #D1D5DB`
- **Background**: `transparent`
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Color**: `#374151`
- **Border Radius**: `8px`

### States

#### Default
```css
background: transparent;
color: #374151;
border: 1px solid #D1D5DB;
```

#### Hover
```css
background: #F9FAFB;
border-color: #9CA3AF;
color: #1F2937;
```

#### Active
```css
background: #F3F4F6;
border-color: #6B7280;
```

#### Focus
```css
border-color: #2563EB;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
```

---

## Ghost Button / Text Link

### Purpose
Text links for tertiary actions like "View All Properties →", "Get Started →", "Learn More".

### Visual Specifications (Homepage Pattern)
- **Height**: Auto (inline)
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Color**: `#2563EB`
- **Text Decoration**: None (underline on hover)
- **Arrow**: `→` character or icon

### States

#### Default
```css
color: #2563EB;
text-decoration: none;
```

#### Hover
```css
color: #1D4ED8;
text-decoration: underline;
/* Arrow animates right 5px */
```

#### Active
```css
color: #1E40AF;
```

### Implementation
```tsx
<a className="
  text-[#2563EB] font-medium text-sm
  hover:text-[#1D4ED8] hover:underline
  active:text-[#1E40AF]
  inline-flex items-center gap-1
  transition-colors duration-150
  group
">
  <span>View All Properties</span>
  <span className="group-hover:translate-x-1 transition-transform">→</span>
</a>
```

---

## Quick Search Pills (Homepage Specific)

### Purpose
Quick action buttons for popular search terms like "Los Próceres", "Lomas", "Las Colinas".

### Visual Specifications
- **Height**: `32px`
- **Padding**: `6px 16px`
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Border Radius**: `16px` (pill)
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Color**: `#6B7280`

### States

#### Default
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
color: #6B7280;
```

#### Hover
```css
background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
color: #FFFFFF;
border-color: transparent;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

#### Active/Selected
```css
background: #2563EB;
color: #FFFFFF;
border-color: #2563EB;
```

---

## Icon Button

### Purpose
Buttons containing only icons, used for compact actions like favorite (heart), share, close (×).

### Visual Specifications
- **Size**: `40×40px` (standard), `44×44px` (mobile touch)
- **Icon Size**: `20px`
- **Border Radius**: `8px` or `50%` (circular)
- **Padding**: `10px`

### Favorite Button (Heart)
```css
/* Unfavorited */
color: #6B7280;
stroke: #6B7280;
fill: none;

/* Favorited */
color: #EF4444;
stroke: #EF4444;
fill: #EF4444;
/* With particle animation on toggle */
```

---

## Loading Button States (Homepage Pattern)

### Animated Dots Pattern
```css
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.4; }
  40% { opacity: 1; }
}

.loading-dots span {
  animation: dot-pulse 1.4s infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
.loading-dots span:nth-child(4) { animation-delay: 0.6s; }
```

### Implementation
```tsx
<button disabled className="btn-primary opacity-80 cursor-wait">
  <span className="loading-dots">
    <span>○</span>
    <span>○</span>
    <span>●</span>
    <span>○</span>
  </span>
</button>
```

---

## Responsive Behavior (Homepage Standards)

### Mobile (320px - 767px)
- **Primary CTAs**: Full width (`width: 100%`)
- **Height**: Consistent `48px` for all buttons
- **Font Size**: `14px` (readable without zoom)
- **Touch Target**: Minimum `48×48px`
- **Spacing**: `16px` between stacked buttons

### Tablet (768px - 1023px)
- **Primary CTAs**: Auto width with `min-width: 180px`
- **Dual CTAs**: Side by side with `16px` gap
- **Height**: Consistent `48px`

### Desktop (1024px+)
- **Primary CTAs**: Auto width with `min-width: 180px`
- **Dual CTAs**: Side by side with `16px` gap
- **Hover States**: Full hover animations enabled
- **Focus States**: Keyboard navigation optimized

---

## Accessibility Requirements

### WCAG AA Compliance
- **Color Contrast**: 
  - White on `#2563EB`: 5.4:1 ✓
  - White on `#25D366`: 3.1:1 (large text) ✓
- **Focus Indicators**: `3px` focus ring with `rgba(37, 99, 235, 0.1)`
- **Touch Targets**: Minimum `48×48px`
- **Loading States**: Announced to screen readers
- **Disabled States**: `cursor: not-allowed` and reduced opacity

### Keyboard Support
- `Enter` or `Space` to activate
- `Tab` navigation between buttons
- Visible focus indicators on all states
- Focus trap in button groups

---

## Usage Guidelines

### Do's (Homepage Patterns)
- ✅ Use `48px` height consistently for primary actions
- ✅ Apply `#2563EB` for all primary CTAs
- ✅ Include hover transform `translateY(-1px)` for depth
- ✅ Use `14px/20px` font size with `600` weight
- ✅ Add focus shadow `0 0 0 3px rgba(37, 99, 235, 0.1)`

### Don'ts
- ❌ Use different button heights within same section
- ❌ Apply uppercase text transformation
- ❌ Create new button colors outside the system
- ❌ Make buttons smaller than `48px` height on mobile
- ❌ Forget loading states for async actions

---

## Implementation Tokens

```scss
// Button heights
--btn-height: 48px;  // Consistent across all breakpoints

// Button padding
--btn-padding: 12px 24px;

// Button typography
--btn-font-size: 14px;
--btn-line-height: 20px;
--btn-font-weight: 600;

// Button radius
--btn-radius: 8px;
--btn-radius-pill: 24px;

// Button colors
--btn-primary-bg: #2563EB;
--btn-primary-hover: #1D4ED8;
--btn-primary-active: #1E40AF;
--btn-whatsapp: #25D366;
--btn-whatsapp-hover: #128C7E;

// Button shadows
--btn-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
--btn-shadow-hover: 0 4px 6px rgba(37, 99, 235, 0.2);
--btn-shadow-focus: 0 0 0 3px rgba(37, 99, 235, 0.1);
--btn-shadow-whatsapp: 0 2px 8px rgba(37, 211, 102, 0.3);
```

---

*Component Version: 2.0.0 | Last Updated: January 12, 2025*
*Source: Homepage Design Specifications*