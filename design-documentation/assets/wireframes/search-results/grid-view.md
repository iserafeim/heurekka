---
title: Property Search Results - Grid View Wireframe
description: Desktop grid layout for property search results
last-updated: 2025-01-04
version: 1.0.0
---

# Property Search Results - Grid View (Desktop 1440px)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  ┌──────┐  Heurekka    Home  Buy  Rent  Sell  Agents          🔍  ♡  👤 John Doe       ║
║  │ LOGO │                                                              (3)              ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Search         Home > Mexico City > Search Results                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  🔍 <Mexico City>     ┌──────────┐ ┌────────────┐ ┌──────────┐       [SEARCH]         │
│                       │For Sale ▼│ │$0 - $1M  ▼ │ │2+ Beds  ▼│                        │
│                       └──────────┘ └────────────┘ └──────────┘                        │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬────────────────────────────────────────────────────────┐
│                                 │                                                        │
│  FILTERS           [Clear All]  │  247 Properties in Mexico City                         │
│  ────────────────────────────  │                                                        │
│                                 │  Sort by: Relevance ▼    View: ⊞ Grid  ☰ List  📍 Map  │
│  PROPERTY TYPE                  │  ──────────────────────────────────────────────────── │
│  ☐ House (142)                 │                                                        │
│  ☑ Apartment (89)              │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  ☐ Condo (52)                  │  │              │ │              │ │              │ │
│  ☐ Townhouse (38)              │  │   [Image]    │ │   [Image]    │ │   [Image]    │ │
│                                 │  │    240px     │ │    240px     │ │    240px     │ │
│  PRICE RANGE                    │  │              │ │              │ │              │ │
│  ────────────────              │  │ NEW      ★   │ │ FEATURED ★   │ │          ★   │ │
│  Min: $[500,000  ]             │  ├──────────────┤ ├──────────────┤ ├──────────────┤ │
│  Max: $[1,500,000]             │  │              │ │              │ │              │ │
│                                 │  │ $850,000     │ │ $1,200,000   │ │ $925,000     │ │
│  ●━━━━━━━━━━●                  │  │              │ │              │ │              │ │
│  $0        $5M                 │  │ Polanco      │ │ Roma Norte   │ │ Condesa      │ │
│                                 │  │ Mexico City  │ │ Mexico City  │ │ Mexico City  │ │
│  BEDROOMS                       │  │              │ │              │ │              │ │
│  ────────────────              │  │ 🛏 3  🚿 2     │ │ 🛏 4  🚿 3     │ │ 🛏 2  🚿 2     │ │
│  ○ Any                         │  │ 📐 1,500 sqft │ │ 📐 2,200 sqft │ │ 📐 1,100 sqft │ │
│  ○ 1+                          │  │              │ │              │ │              │ │
│  ● 2+                          │  │ ☐ Compare    │ │ ☐ Compare    │ │ ☐ Compare    │ │
│  ○ 3+                          │  └──────────────┘ └──────────────┘ └──────────────┘ │
│  ○ 4+                          │      (360px)          (360px)          (360px)        │
│                                 │                                                        │
│  BATHROOMS                      │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  ────────────────              │  │              │ │              │ │              │ │
│  ○ Any                         │  │   [Image]    │ │   [Image]    │ │   [Image]    │ │
│  ● 1+                          │  │    240px     │ │    240px     │ │    240px     │ │
│  ○ 2+                          │  │              │ │              │ │              │ │
│  ○ 3+                          │  │          ★   │ │ REDUCED  ★   │ │          ★   │ │
│                                 │  ├──────────────┤ ├──────────────┤ ├──────────────┤ │
│  SQUARE FEET                    │  │              │ │              │ │              │ │
│  ────────────────              │  │ $675,000     │ │ $550,000     │ │ $780,000     │ │
│  Min: [1,000    ]              │  │              │ │ ~~$600,000~~ │ │              │ │
│  Max: [3,000    ]              │  │ Coyoacán     │ │ San Angel    │ │ Santa Fe     │ │
│                                 │  │ Mexico City  │ │ Mexico City  │ │ Mexico City  │ │
│  + More Filters                │  │              │ │              │ │              │ │
│  ────────────────              │  │ 🛏 2  🚿 1     │ │ 🛏 1  🚿 1     │ │ 🛏 3  🚿 2     │ │
│                                 │  │ 📐 950 sqft   │ │ 📐 750 sqft   │ │ 📐 1,800 sqft │ │
│  AMENITIES                      │  │              │ │              │ │              │ │
│  ☐ Parking                     │  │ ☐ Compare    │ │ ☐ Compare    │ │ ☐ Compare    │ │
│  ☐ Pool                        │  └──────────────┘ └──────────────┘ └──────────────┘ │
│  ☐ Gym                         │                                                        │
│  ☐ Security                    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  ☐ Pet Friendly                │  │              │ │              │ │              │ │
│  ☐ Balcony                     │  │   [Image]    │ │   [Image]    │ │   [Image]    │ │
│                                 │  │    240px     │ │    240px     │ │    240px     │ │
│  LISTING DATE                   │  │              │ │              │ │              │ │
│  ────────────────              │  │          ★   │ │          ★   │ │ OPEN SUN ★   │ │
│  ○ Any time                    │  ├──────────────┤ ├──────────────┤ ├──────────────┤ │
│  ● Last 24 hours               │  │              │ │              │ │              │ │
│  ○ Last 7 days                 │  │ $1,100,000   │ │ $890,000     │ │ $725,000     │ │
│  ○ Last 30 days                │  │              │ │              │ │              │ │
│                                 │  │ Del Valle    │ │ Nápoles      │ │ Benito Juárez│ │
│  ────────────────              │  │ Mexico City  │ │ Mexico City  │ │ Mexico City  │ │
│                                 │  │              │ │              │ │              │ │
│  [  APPLY FILTERS  ]            │  │ 🛏 3  🚿 3     │ │ 🛏 2  🚿 2     │ │ 🛏 2  🚿 1     │ │
│                                 │  │ 📐 1,650 sqft │ │ 📐 1,200 sqft │ │ 📐 980 sqft   │ │
│  [  SAVE SEARCH  ]              │  │              │ │              │ │              │ │
│                                 │  │ ☐ Compare    │ │ ☐ Compare    │ │ ☐ Compare    │ │
│                                 │  └──────────────┘ └──────────────┘ └──────────────┘ │
│   (280px wide)                  │                                                        │
│                                 │          (Load More Properties Button)                │
│                                 │     ┌────────────────────────────────────┐            │
│                                 │     │    LOAD MORE PROPERTIES (12 of 247) │            │
│                                 │     └────────────────────────────────────┘            │
│                                 │                                                        │
│                                 │  ◯ ◯ ● ◯ ◯ ◯ ◯ ◯  ← 3 →  Page 3 of 21               │
│                                 │                                                        │
└─────────────────────────────────┴────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  RECENTLY VIEWED                                                        Clear History   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                         │
│  │ [Image] │ │ [Image] │ │ [Image] │ │ [Image] │ │ [Image] │    →                    │
│  │ $450K   │ │ $380K   │ │ $520K   │ │ $675K   │ │ $890K   │                         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                         │
│    (180px)     (180px)     (180px)     (180px)     (180px)                            │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  COMPARISON BAR (Fixed Bottom)                                          Hide ×          ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                          ║
║  Comparing 3 properties:                                                                ║
║                                                                                          ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       [COMPARE NOW]          ║
║  │ [Thumb]  │  │ [Thumb]  │  │ [Thumb]  │  │   + Add   │                              ║
║  │ $850K    │  │ $1.2M    │  │ $925K    │  │   More    │                              ║
║  │    ×     │  │    ×     │  │    ×     │  │           │                              ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘                              ║
║                                                                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

## Component Specifications

### Property Card
```
┌──────────────────────┐
│ ┌──────────────────┐ │  Dimensions: 360px × 440px
│ │                  │ │  Image: 360px × 240px
│ │   Property Image │ │  Padding: 20px
│ │                  │ │  Border: 1px solid #E5E7EB
│ │  ★ (Favorite)    │ │  Border radius: 12px
│ └──────────────────┘ │  Shadow: 0 2px 8px rgba(0,0,0,0.08)
│  Badge (if any)      │  
│                      │  Hover state:
│  $XXX,XXX           │  - Shadow: 0 8px 24px rgba(0,0,0,0.12)
│  Neighborhood        │  - Transform: translateY(-4px)
│  City, State         │  
│                      │  Typography:
│  🛏 X  🚿 X  📐 XXXX   │  - Price: 24px, bold, #1A1A1A
│                      │  - Address: 14px, regular, #6B7280
│  ☐ Compare          │  - Specs: 13px, regular, #6B7280
└──────────────────────┘
```

### Filter Panel
- Width: 280px
- Background: #FFFFFF
- Border-right: 1px solid #E5E7EB
- Padding: 24px
- Section spacing: 24px
- Sticky positioning

### Grid Layout
- Container: 1200px max-width
- Grid: 3 columns (desktop)
- Gap: 24px
- Responsive: 2 cols (tablet), 1 col (mobile)

### Interactive Elements

#### Favorite Button (★)
- Size: 32px × 32px
- Default: Outline
- Active: Filled (#EF4444)
- Hover: Scale(1.1)

#### Compare Checkbox
- Size: 18px × 18px
- Label: 14px
- Max selections: 4

#### Load More Button
- Width: 100%
- Height: 48px
- Background: White
- Border: 2px solid #E5E7EB
- Hover: Background #F3F4F6

## State Variations

### Loading State
```
┌──────────────┐
│ ░░░░░░░░░░░░ │  Skeleton loader
│ ░░░░░░░░░░░░ │  Animated shimmer
│ ░░░░░░░░░░░░ │  
│ ░░░░░░       │
│ ░░░░░░░░░    │
│ ░░░░░░       │
└──────────────┘
```

### Empty State
```
┌────────────────────────────────┐
│                                │
│        No Properties Found      │
│                                │
│    Try adjusting your filters  │
│    or search in a nearby area  │
│                                │
│    [Adjust Filters] [Clear All]│
│                                │
└────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────┐
│         ⚠ Error Loading         │
│                                │
│  Unable to load properties.    │
│  Please try again.             │
│                                │
│        [Retry] [Go Back]       │
└────────────────────────────────┘
```

## Responsive Breakpoints

### Tablet (768px - 1023px)
- 2 columns grid
- Filter panel: Slide-out drawer
- Cards: 340px wide

### Mobile (320px - 767px)
- 1 column grid
- Filter panel: Bottom sheet
- Cards: Full width
- Sticky filter button

## Interactions

### Card Hover
- Elevation increase
- Image slight zoom (1.05x)
- Quick action buttons appear

### Filter Application
- Real-time result count update
- Smooth transition animation
- Loading overlay during fetch

### Pagination
- Infinite scroll option
- Traditional pagination fallback
- Scroll to top on page change