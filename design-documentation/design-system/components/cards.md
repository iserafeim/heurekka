# Card Component Specifications
## HEUREKKA Design System - Homepage Authority

---

## Property Card (Homepage Pattern)

### Purpose
Display rental property listings in homepage showcase, browse views, search results, and favorites. Optimized for quick scanning and WhatsApp contact initiation.

### Visual Specifications (Homepage Extracted)

#### Container
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `8px` (homepage standard)
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Padding**: `0` (image full width), content `16px`
- **Hover Shadow**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Hover Transform**: `translateY(-2px)`
- **Active Transform**: `translateY(0)`
- **Transition**: `all 200ms ease-out`

#### Layout Structure (Homepage Mini Card)

##### Mobile (320-767px) - Horizontal Scroll
```
┌──────────────────────┐
│   [Property Image]   │ 16:9 ratio
│                      │ 400×225px
├──────────────────────┤
│ L.12,000/month       │ Price (16px/20px, 600)
│ 2BR Apartment        │ Type (14px/20px)
│ Los Próceres         │ Location (14px/20px)
│                      │
│ [View Details →]     │ Text link CTA
└──────────────────────┘
```

##### Desktop (1024px+) - Grid Layout
```
┌─────────────────────────┐
│                         │
│    [Property Image]     │ 16:9 ratio
│                         │ With overlay on hover
│                         │
├─────────────────────────┤
│ L.12,000/month          │ Price
│ 2BR Apartment           │ Type
│ Los Próceres            │ Location
│                         │
│ WhatsApp • 2 hours ago  │ Meta info
│                         │
│ [View Details →]        │ CTA
└─────────────────────────┘
```

### Component Sections (Homepage Standard)

#### Image
- **Aspect Ratio**: `16:9` (400×225px optimized)
- **Border Radius**: `8px 8px 0 0` (top corners only)
- **Loading**: Lazy load with blur-up effect
- **Hover (Desktop)**: Slight zoom, overlay with "→ View Details"
- **Mobile**: No hover, direct tap to view

#### Price
- **Font**: `16px/20px, 600, #111827`
- **Format**: "L.12,000/month" or "L.12,000/mes"
- **Position**: Top of content area
- **Color**: Primary text color (not blue)

#### Property Type
- **Font**: `14px/20px, 400, #111827`
- **Format**: "2BR Apartment" or "Casa 3 Habitaciones"
- **Position**: Below price

#### Location
- **Font**: `14px/20px, 400, #6B7280`
- **Format**: Neighborhood name only
- **Icon**: Optional map pin `16px`

#### Meta Information
- **Font**: `12px/16px, 400, #6B7280`
- **Format**: "WhatsApp • 2 hours ago"
- **Position**: Bottom of content area

#### CTA
- **Type**: Text link with arrow
- **Font**: `14px/20px, 500, #2563EB`
- **Text**: "View Details →"
- **Hover**: Underline, arrow animates right

### States

#### Default
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

#### Hover (Desktop)
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
transition: all 200ms ease-out;

/* Image overlay */
.image-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.4);
}

.view-details-text {
  color: #FFFFFF;
  transform: translateX(0);
}
```

#### Loading (Skeleton)
```css
/* Homepage shimmer pattern */
background: linear-gradient(
  90deg,
  #F3F4F6 25%,
  #E5E7EB 50%,
  #F3F4F6 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

---

## Recent Listings Grid (Homepage Specific)

### Purpose
Showcase 6 recent properties on homepage with responsive grid layout.

### Layout Specifications

#### Mobile (320-767px)
- **Layout**: Horizontal scroll
- **Cards**: 6 cards in single row
- **Card Width**: `280px` each
- **Gap**: `16px`
- **Hint**: "← Swipe to see more →"

#### Tablet (768-1023px)
- **Layout**: 2×3 grid
- **Columns**: 2
- **Rows**: 3
- **Gap**: `20px`

#### Desktop (1024px+)
- **Layout**: 3×2 grid
- **Columns**: 3
- **Rows**: 2
- **Gap**: `24px`
- **Max Width**: `1280px` container

### Implementation
```tsx
<section className="recent-listings">
  <h2 className="text-[22px] md:text-[28px] font-semibold">
    Recent Properties
  </h2>
  
  {/* Mobile: Horizontal scroll */}
  <div className="md:hidden overflow-x-auto">
    <div className="flex gap-4 pb-4">
      {properties.map(property => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  </div>
  
  {/* Desktop: Grid */}
  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
    {properties.slice(0, 6).map(property => (
      <PropertyCard key={property.id} {...property} />
    ))}
  </div>
  
  <a href="/properties" className="text-[#2563EB] hover:underline">
    View All Properties →
  </a>
</section>
```

---

## Value Proposition Card (Homepage Pattern)

### Purpose
Display key platform benefits in "Why HEUREKKA?" section.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF` or transparent
- **Border**: None
- **Padding**: `24px` (mobile), `32px` (desktop)
- **Text Align**: Center

#### Layout (Three-Column Desktop)
```
┌─────────────┬─────────────┬─────────────┐
│  For Tenants│ For Landlords│ Why HEUREKKA│
├─────────────┼─────────────┼─────────────┤
│     📝      │     🏠      │     ✨      │
│             │             │             │
│ One Profile,│  Qualified  │ 100% Free   │
│ Multiple    │   Leads     │ Platform    │
│ Inquiries   │   Only      │             │
│             │             │             │
│ Create once,│ See budgets │ No hidden   │
│ reuse       │ before      │ fees or     │
│ everywhere  │ responding  │ commissions │
└─────────────┴─────────────┴─────────────┘
```

### Component Sections

#### Icon
- **Size**: `48px`
- **Color**: `#2563EB` or thematic
- **Margin Bottom**: `16px`

#### Title
- **Font**: `18px/28px, 600, #111827`
- **Margin Bottom**: `8px`

#### Description
- **Font**: `14px/20px, 400, #6B7280`
- **Max Width**: `280px` (centered)

### Mobile Stack
- Single column layout
- `48px` spacing between cards
- Alternating background colors optional

---

## How It Works Card (Homepage Step Card)

### Purpose
Display the 3-step process on homepage with visual connections.

### Visual Specifications

#### Container
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `8px`
- **Padding**: `24px`
- **Shadow**: `0 1px 2px rgba(0, 0, 0, 0.05)`

#### Layout Structure
```
┌────────────────────────────────┐
│ 1️⃣ Create Your Search Profile  │ Step number + title
│                                │
│ Tell us what you're looking   │ Description
│ for once - budget, location,  │
│ move date                     │
│                                │
│ [Get Started →]               │ CTA link
└────────────────────────────────┘
     ↓ Connecting line (desktop)
```

### Component Sections

#### Step Number
- **Style**: Emoji or styled number
- **Font**: `20px/28px, 700, #2563EB`

#### Title
- **Font**: `16px/24px, 600, #111827`
- **Margin**: `8px 0`

#### Description
- **Font**: `14px/20px, 400, #6B7280`
- **Max Lines**: 3-4

#### CTA Link
- **Font**: `14px/20px, 500, #2563EB`
- **Style**: Text link with arrow
- **Hover**: Underline

### Desktop Connection
```css
/* Connecting line between steps */
.step-connector {
  position: absolute;
  top: 50%;
  right: -24px;
  width: 24px;
  height: 2px;
  background: #E5E7EB;
}

.step-connector::after {
  content: '→';
  position: absolute;
  right: -8px;
  top: -10px;
  color: #6B7280;
}
```

---

## Trust Metrics Card (Homepage Pattern)

### Purpose
Display platform statistics to build trust on homepage.

### Visual Specifications

#### Container
- **Background**: `linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)`
- **Border**: None
- **Padding**: `32px 24px`
- **Text Align**: Center

#### Layout (Metrics Bar)
```
┌──────────────────────────────────────┐
│  500+        15min       40%        │
│  Properties  Avg Response  Matched   │
│  Listed      Time         Tenants    │
└──────────────────────────────────────┘
```

### Component Sections

#### Number
- **Font**: `32px/40px, 700, #2563EB`
- **Animation**: Count up on scroll

#### Label
- **Font**: `14px/20px, 500, #6B7280`
- **Margin Top**: `4px`

#### Dividers
- **Style**: `1px solid #E5E7EB`
- **Height**: `40px`
- **Margin**: `0 24px`

### Mobile Layout
- Vertical stack
- No dividers
- `32px` spacing between metrics

---

## Empty State Card

### Purpose
Guide users when no content is available, maintaining homepage visual consistency.

### Visual Specifications

#### Container
- **Background**: `#F9FAFB`
- **Border**: `2px dashed #D1D5DB`
- **Border Radius**: `8px`
- **Padding**: `48px 24px`
- **Text Align**: Center

#### Content Structure
```
┌─────────────────────┐
│                     │
│    🏠               │ 48px icon
│                     │
│  No properties yet  │ Heading (20px, 600)
│                     │
│  Start by adding    │ Description (14px)
│  your first listing │
│                     │
│  [Add Property]     │ Primary button
│                     │
└─────────────────────┘
```

---

## Responsive Grid System (Homepage Authority)

### Property Cards Grid
```scss
// Mobile: Horizontal scroll
@media (max-width: 767px) {
  .property-grid {
    display: flex;
    overflow-x: auto;
    gap: 16px;
    padding-bottom: 16px;
    
    .property-card {
      flex: 0 0 280px;
    }
  }
}

// Tablet: 2 columns
@media (min-width: 768px) and (max-width: 1023px) {
  .property-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

// Desktop: 3 columns
@media (min-width: 1024px) {
  .property-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

// Wide: 4 columns optional
@media (min-width: 1440px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Accessibility Requirements

### Card Structure
```html
<article class="property-card" role="article">
  <img src="..." alt="2 bedroom apartment in Los Próceres exterior view" />
  <div class="card-content">
    <p class="price">L.12,000/month</p>
    <h3>2BR Apartment</h3>
    <p class="location">Los Próceres</p>
    <p class="meta">
      <span class="sr-only">Available on</span>
      WhatsApp • 2 hours ago
    </p>
    <a href="#" aria-label="View details for 2BR Apartment in Los Próceres">
      View Details →
    </a>
  </div>
</article>
```

### Focus Management
- Tab order follows visual hierarchy
- Focus visible on all interactive elements
- Skip links for card grids

---

## Implementation Tokens

```scss
// Card specifications
--card-bg: #FFFFFF;
--card-border: 1px solid #E5E7EB;
--card-radius: 8px;
--card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--card-shadow-hover: 0 4px 6px rgba(0, 0, 0, 0.1);
--card-padding: 16px;

// Card typography
--card-price-size: 16px;
--card-price-weight: 600;
--card-title-size: 16px;
--card-text-size: 14px;
--card-meta-size: 12px;

// Card image
--card-image-ratio: 16/9;
--card-image-radius: 8px 8px 0 0;
```

---

*Component Version: 2.0.0 | Last Updated: January 12, 2025*
*Source: Homepage Design Specifications*