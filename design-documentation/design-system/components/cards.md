# Card Component Specifications
## HEUREKKA Design System

---

## Property Card

### Purpose
Display rental property listings in browse views, search results, and favorites. Optimized for quick scanning and WhatsApp contact initiation.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Padding**: `0` (image edge-to-edge at top)
- **Hover Shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Hover Transform**: `translateY(-2px)`
- **Transition**: `all 200ms ease-out`

#### Layout Structure

##### Mobile (320-767px)
```
┌──────────────────────┐
│   Image Carousel     │ 16:9 ratio
│   [1/5] ● ○ ○ ○ ○   │ Dots indicator
├──────────────────────┤
│ L.15,000/mes    ❤️   │ Price + Favorite
│ Modern 2BR Apartment │ Title
│ Lomas del Guijarro   │ Location
│ 2 bed · 1 bath · 85m²│ Details
├──────────────────────┤
│  [WhatsApp Contact]  │ Full-width CTA
└──────────────────────┘
```

##### Desktop (1024px+)
```
┌─────────────────────────┐
│                         │
│     Image Gallery       │ 16:9 ratio
│    [Main Image]         │ Hover: Gallery
│                         │
├─────────────────────────┤
│ L.15,000/month     ❤️   │ Price + Favorite
│ Modern 2-Bedroom Apt    │ Title
│ 📍 Lomas del Guijarro   │ Location
│ 2 bed · 1 bath · 85m²   │ Details
│                         │
│ [Contact] [View More]   │ Action buttons
└─────────────────────────┘
```

### Component Sections

#### Image Gallery
- **Aspect Ratio**: `16:9`
- **Mobile**: Swipeable carousel with dot indicators
- **Desktop**: Main image with hover overlay showing "+3 photos"
- **Border Radius**: `12px 12px 0 0`
- **Lazy Loading**: Images load on viewport entry
- **Placeholder**: Blur-up effect with skeleton

#### Price Section
- **Font**: `20px/24px, 700, #2563EB`
- **Format**: "L.15,000/mes" with proper formatting
- **Position**: Top-left of content area
- **Mobile**: Slightly smaller at `18px`

#### Favorite Button
- **Position**: Top-right of content area
- **Size**: `32×32px`
- **Icon**: Heart outline/filled
- **Toggle**: Instant optimistic update
- **Color**: `#6B7280` (default), `#EF4444` (favorited)

#### Title
- **Font**: `16px/20px, 600, #111827`
- **Max Lines**: `2` with ellipsis
- **Hover**: Full title on tooltip

#### Location
- **Font**: `14px/18px, 400, #6B7280`
- **Icon**: Map pin `16px`
- **Format**: Neighborhood name only

#### Property Details
- **Font**: `14px/18px, 400, #6B7280`
- **Format**: "2 bed · 1 bath · 85m²"
- **Icons**: Optional bed/bath/area icons

#### CTA Section
- **Mobile**: Full-width WhatsApp button
- **Desktop**: Two buttons side-by-side
- **Padding**: `16px`

### States

#### Default
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

#### Hover (Desktop)
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
transform: translateY(-2px);
/* Show image count overlay */
/* Brighten CTA button */
```

#### Loading
```css
/* Skeleton screen with animated shimmer */
background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
background-size: 200% 100%;
animation: shimmer 2s infinite;
```

#### Favorited
```css
/* Heart icon filled */
.favorite-icon {
  color: #EF4444;
  fill: #EF4444;
}
```

---

## Lead Card

### Purpose
Display tenant inquiries in the landlord dashboard with qualification details and quick response actions.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `8px`
- **Padding**: `16px`
- **New Lead Indicator**: `4px left border #2563EB`

#### Layout Structure
```
┌─────────────────────────────┐
│ 🟢 María Rodriguez     NEW  │ Status badge
│ Budget: L.12,000-15,000/mo  │ Key qualifier
│ Move Date: Nov 1, 2024      │ Urgency
│ Areas: Lomas, Los Próceres  │ Preferences
│ ────────────────────────    │
│ "Looking for 2BR apartment  │ Message preview
│  near my office..."         │
│                              │
│ [WhatsApp] [View Profile]   │ Actions
└─────────────────────────────┘
```

### Component Sections

#### Header
- **Name**: `16px, 600, #111827`
- **Status Badge**: `NEW`, `CONTACTED`, `VIEWING`
- **Online Indicator**: Green dot if active

#### Qualification Info
- **Budget**: `14px, 600, #2563EB` (highlighted)
- **Move Date**: `14px, 400, #374151`
- **Urgency Indicator**: Red if <7 days
- **Areas**: `14px, 400, #6B7280`

#### Message Preview
- **Font**: `14px/20px, 400, #6B7280`
- **Max Lines**: `3` with ellipsis
- **Border Top**: `1px solid #E5E7EB`
- **Padding**: `12px 0 0`

#### Actions
- **Primary**: WhatsApp contact button
- **Secondary**: View full profile link
- **Response Time**: "Typically responds in 30min"

### Priority Indicators

#### Urgent (Move <7 days)
```css
border-left: 4px solid #EF4444;
background: #FEF2F2;
```

#### High Quality Match
```css
border-left: 4px solid #10B981;
/* "95% match" badge */
```

#### New Lead
```css
border-left: 4px solid #2563EB;
/* "NEW" badge in header */
```

---

## Dashboard Summary Card

### Purpose
Display key metrics and statistics in landlord/tenant dashboards.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF`
- **Border Radius**: `8px`
- **Shadow**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **Padding**: `20px`

#### Layout
```
┌────────────────────┐
│ Active Listings    │ Label
│ 12                 │ Large number
│ ↑ 20% from last mo │ Trend
└────────────────────┘
```

### Component Sections

#### Label
- **Font**: `12px, 500, #6B7280, uppercase`
- **Letter Spacing**: `0.025em`

#### Value
- **Font**: `32px/36px, 700, #111827`
- **Color Variants**: Success/Warning/Error

#### Trend
- **Font**: `14px, 500`
- **Up**: `#10B981` with ↑ arrow
- **Down**: `#EF4444` with ↓ arrow
- **Neutral**: `#6B7280` with → arrow

---

## Empty State Card

### Purpose
Guide users when no content is available, providing clear next actions.

### Visual Specifications

#### Container
- **Background**: `#F9FAFB`
- **Border**: `2px dashed #D1D5DB`
- **Border Radius**: `12px`
- **Padding**: `48px 24px` (mobile: `32px 16px`)
- **Text Align**: `center`

#### Content Structure
```
┌─────────────────────┐
│                     │
│    🏠 (icon)        │ 48px icon
│                     │
│  No properties yet  │ Heading
│                     │
│  Start by adding    │ Description
│  your first listing │
│                     │
│  [Add Property]     │ CTA button
│                     │
└─────────────────────┘
```

### Variants

#### No Results
- **Icon**: Magnifying glass
- **Heading**: "No properties found"
- **Description**: "Try adjusting your filters"
- **CTA**: "Clear filters"

#### First Time User
- **Icon**: Sparkles
- **Heading**: "Welcome to HEUREKKA!"
- **Description**: "Start your search journey"
- **CTA**: "Browse Properties"

#### Error State
- **Icon**: Exclamation triangle
- **Heading**: "Something went wrong"
- **Description**: "We couldn't load this content"
- **CTA**: "Try again"

---

## Feature Highlight Card

### Purpose
Showcase platform features and benefits on landing pages.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF`
- **Border**: None
- **Shadow**: None (rely on section background)
- **Padding**: `24px`
- **Hover**: `transform: scale(1.02)`

#### Layout
```
┌─────────────────────┐
│      💬             │ Icon (48px)
│                     │
│ WhatsApp Direct     │ Title
│                     │
│ Contact landlords   │ Description
│ instantly with your │
│ profile pre-loaded  │
└─────────────────────┘
```

### Component Sections

#### Icon
- **Size**: `48×48px`
- **Color**: `#2563EB`
- **Background**: `#EFF6FF` circle
- **Padding**: `12px`

#### Title
- **Font**: `18px/24px, 600, #111827`
- **Margin**: `16px 0 8px`

#### Description
- **Font**: `14px/20px, 400, #6B7280`
- **Max Width**: `280px`

---

## Responsive Behavior

### Mobile (320-767px)
- Full-width cards with 16px horizontal margin
- Single column layout
- Touch-optimized tap targets
- Swipeable image galleries
- Sticky CTAs at bottom

### Tablet (768-1023px)
- 2-column grid for property cards
- Side-by-side layout for dashboard cards
- Hover states partially enabled

### Desktop (1024px+)
- 3-4 column grid for property cards
- Full hover interactions
- Inline action buttons
- Rich media previews

---

## Accessibility Requirements

### Semantic Structure
```html
<article role="article" aria-label="Property listing">
  <img alt="2-bedroom apartment exterior view">
  <h3>Modern 2-Bedroom Apartment</h3>
  <p>Lomas del Guijarro</p>
  <button aria-label="Add to favorites">♥</button>
  <a href="#" aria-label="Contact owner via WhatsApp">Contact</a>
</article>
```

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate buttons
- Arrow keys for image gallery

### Screen Reader
- Descriptive image alt text
- Property details announced
- Price prominently read
- Status changes announced

---

## Performance Guidelines

### Image Optimization
- Lazy load below fold
- Progressive loading (blur-up)
- WebP with JPG fallback
- Responsive image sizes
- Maximum 200KB per image

### Interaction Performance
- Instant touch feedback
- Optimistic UI updates for favorites
- Skeleton screens during load
- Virtual scrolling for long lists

---

## Implementation Notes

### State Management
```tsx
interface PropertyCardProps {
  property: Property;
  isFavorited: boolean;
  onFavorite: () => void;
  onContact: () => void;
}
```

### Error Handling
- Failed image loads show placeholder
- Network errors show retry option
- Form errors inline validated

### Testing Checklist
- [ ] Images lazy load correctly
- [ ] Favorite toggle works offline
- [ ] Cards responsive at all breakpoints
- [ ] Touch targets meet 48px minimum
- [ ] Keyboard navigation complete
- [ ] Screen reader friendly

---

*Component Version: 1.0.0 | Last Updated: September 4, 2025*