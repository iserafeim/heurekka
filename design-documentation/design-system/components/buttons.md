# Button Component Specifications
## HEUREKKA Design System

---

## Primary Button

### Purpose
Main call-to-action buttons that drive primary user actions like "Search", "Contact", "Save", "Continue".

### Visual Specifications

#### Desktop (1024px+)
- **Height**: `40px`
- **Padding**: `8px 20px`
- **Font Size**: `14px`
- **Font Weight**: `600`
- **Border Radius**: `8px`
- **Min Width**: `120px`

#### Mobile (320-767px)
- **Height**: `48px`
- **Padding**: `12px 24px`
- **Font Size**: `16px`
- **Font Weight**: `600`
- **Border Radius**: `8px`
- **Min Width**: `140px`

### States

#### Default
```css
background: #2563EB;
color: #FFFFFF;
border: none;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
```

#### Hover
```css
background: #1D4ED8;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
transform: translateY(-1px);
transition: all 150ms ease-out;
```

#### Active/Pressed
```css
background: #1E40AF;
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
transform: translateY(0);
```

#### Focus
```css
outline: 2px solid #2563EB;
outline-offset: 2px;
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
opacity: 0.7;
cursor: wait;
/* Include spinner icon before text */
```

### Implementation Example
```tsx
<button className="
  bg-primary text-white font-semibold
  h-12 px-6 md:h-10 md:px-5
  rounded-lg min-w-[140px] md:min-w-[120px]
  shadow-sm hover:shadow-md
  hover:bg-primary-dark hover:-translate-y-px
  active:bg-primary-darker active:translate-y-0
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
  transition-all duration-150
">
  Contact Property Owner
</button>
```

---

## WhatsApp Button

### Purpose
Specialized button for WhatsApp integration - the primary communication method in Honduras.

### Visual Specifications

#### All Breakpoints
- **Height**: `48px`
- **Padding**: `12px 24px`
- **Font Size**: `16px`
- **Font Weight**: `600`
- **Border Radius**: `24px` (pill shape)
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
box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
transform: scale(1.02);
```

#### Active
```css
background: #075E54;
transform: scale(1);
```

### Implementation Example
```tsx
<button className="
  bg-whatsapp text-white font-semibold
  h-12 px-6 rounded-full
  flex items-center justify-center gap-2
  shadow-whatsapp hover:shadow-whatsapp-lg
  hover:bg-whatsapp-dark hover:scale-[1.02]
  active:bg-whatsapp-darker active:scale-100
  transition-all duration-150
">
  <WhatsAppIcon className="w-5 h-5" />
  <span>Contact via WhatsApp</span>
</button>
```

### Mobile Optimization
- Sticky positioning at bottom of property cards
- Full-width on mobile viewports
- Increased touch target to 56px height on small screens

---

## Secondary Button

### Purpose
Supporting actions that are important but not primary, such as "Cancel", "Back", "View More".

### Visual Specifications

#### Desktop
- **Height**: `40px`
- **Padding**: `8px 20px`
- **Border**: `1px solid #D1D5DB`
- **Background**: `transparent`
- **Font Size**: `14px`
- **Font Weight**: `500`

#### Mobile
- **Height**: `44px`
- **Padding**: `10px 20px`
- **Increased touch target**

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
```

#### Active
```css
background: #F3F4F6;
border-color: #6B7280;
```

---

## Ghost Button

### Purpose
Tertiary actions with minimal visual weight, like "Skip", "Learn More", inline actions.

### Visual Specifications
- **Height**: `36px` (desktop), `40px` (mobile)
- **Padding**: `6px 12px` (desktop), `8px 16px` (mobile)
- **Background**: `transparent`
- **No border**
- **Color**: `#2563EB`

### States

#### Default
```css
background: transparent;
color: #2563EB;
```

#### Hover
```css
background: #EFF6FF;
color: #1D4ED8;
```

#### Active
```css
background: #DBEAFE;
```

---

## Icon Button

### Purpose
Buttons containing only icons, used for compact actions like favorite, share, menu.

### Visual Specifications
- **Size**: `40×40px` (desktop), `44×44px` (mobile)
- **Icon Size**: `20px` (desktop), `24px` (mobile)
- **Border Radius**: `8px` or `50%` (circular)
- **Padding**: `10px` (desktop), `10px` (mobile)

### Variants

#### Default Icon Button
```css
background: transparent;
color: #6B7280;
hover:background: #F3F4F6;
hover:color: #374151;
```

#### Primary Icon Button
```css
background: #2563EB;
color: #FFFFFF;
hover:background: #1D4ED8;
```

#### Favorite Button (Toggle)
```css
/* Unfavorited */
color: #6B7280;
stroke-width: 1.5px;

/* Favorited */
color: #EF4444;
fill: #EF4444;
```

---

## Button Group

### Purpose
Related actions grouped together, like view switchers or filters.

### Visual Specifications
- **Container**: No gap between buttons
- **Border Radius**: Only on first and last button
- **Divider**: `1px solid #E5E7EB` between buttons
- **Active Indicator**: Background color change

### Example
```tsx
<div className="inline-flex rounded-lg border border-gray-200">
  <button className="px-4 py-2 bg-primary text-white rounded-l-lg">
    List View
  </button>
  <button className="px-4 py-2 hover:bg-gray-50 border-l">
    Map View
  </button>
</div>
```

---

## Floating Action Button (FAB)

### Purpose
Primary action that floats above content, mobile-specific for key actions.

### Visual Specifications
- **Size**: `56×56px`
- **Position**: `bottom: 24px, right: 16px`
- **Border Radius**: `50%`
- **Shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Icon**: `24px` centered

### States
```css
/* Default */
background: #2563EB;
color: #FFFFFF;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Pressed */
transform: scale(0.95);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
```

---

## Loading States

### Button with Spinner
```tsx
<button disabled className="... opacity-70 cursor-wait">
  <Spinner className="w-4 h-4 mr-2 animate-spin" />
  Loading...
</button>
```

### Progressive Loading
```tsx
// Step 1: Initial state
<button>Send Message</button>

// Step 2: Loading
<button disabled>
  <Spinner /> Sending...
</button>

// Step 3: Success
<button disabled className="bg-green-500">
  <CheckIcon /> Sent!
</button>
```

---

## Responsive Behavior

### Mobile Adaptations
1. **Increased Touch Targets**: Minimum 48px height
2. **Full Width CTAs**: Primary actions span container width
3. **Sticky Positioning**: Key actions fixed at viewport bottom
4. **Larger Text**: 16px minimum to prevent zoom on iOS

### Desktop Optimizations
1. **Hover States**: Rich hover feedback for mouse users
2. **Compact Sizing**: 40px height for density
3. **Keyboard Focus**: Clear focus indicators
4. **Grouped Actions**: Related buttons inline

---

## Accessibility Requirements

### ARIA Attributes
```tsx
<button
  aria-label="Contact property owner via WhatsApp"
  aria-busy={isLoading}
  aria-disabled={isDisabled}
  role="button"
>
  {buttonText}
</button>
```

### Keyboard Support
- `Enter` or `Space` to activate
- `Tab` navigation between buttons
- Focus trap in button groups
- Escape to cancel in destructive actions

### Screen Reader Announcements
- Loading state changes announced
- Success/error states communicated
- Button purpose clearly labeled
- Icon-only buttons have descriptive labels

---

## Usage Guidelines

### Do's
- Use primary button for one main action per screen
- Include loading states for async actions
- Provide clear, action-oriented labels
- Maintain consistent sizing within sections
- Use WhatsApp button for communication CTAs

### Don'ts
- Don't use multiple primary buttons in one view
- Don't make buttons smaller than minimum touch targets
- Don't rely on color alone to indicate state
- Don't use vague labels like "Click Here"
- Don't disable buttons without clear reasoning

---

## Implementation Notes

### Performance
- Use CSS transitions for smooth state changes
- Implement touch feedback immediately on mobile
- Lazy load heavy button actions
- Debounce rapid clicks

### Testing
- Verify touch targets are 48×48px minimum
- Test keyboard navigation flow
- Validate color contrast ratios
- Check loading state implementations
- Test with screen readers

---

*Component Version: 1.0.0 | Last Updated: September 4, 2025*