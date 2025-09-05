# Property Discovery Feature
## Browse & Search Experience Design

---

## Overview

The Property Discovery feature is the primary interface where tenants explore available rentals through synchronized list and map views. This mobile-first design prioritizes quick scanning, efficient filtering, and seamless WhatsApp contact initiation.

## User Experience Goals

### Primary Objectives
1. **Fast Discovery**: Find relevant properties in <30 seconds
2. **Visual Exploration**: Map-based neighborhood browsing
3. **Efficient Filtering**: Progressive filter disclosure
4. **Quick Contact**: Single tap to WhatsApp

### Success Metrics
- **Engagement Rate**: >3 properties viewed per session
- **Filter Usage**: >60% of users apply filters
- **Map Interaction**: >40% toggle to map view
- **Contact Rate**: >5% browse-to-contact conversion

---

## Information Architecture

```
Explore Page
├── Search Bar (Location/Keywords)
├── View Toggle (List/Map)
├── Quick Filters (Pills)
├── Results Section
│   ├── List View
│   │   ├── Sort Options
│   │   ├── Result Count
│   │   └── Property Cards
│   └── Map View
│       ├── Map Canvas
│       ├── Cluster Pins
│       └── Property Preview Card
└── Filter Panel (Expandable)
```

---

## Screen Specifications

## Main Explore Page

### Layout Structure - Mobile List View

```
┌─────────────────────────┐
│ 🔍 Search neighborhood  │ Search bar
│                         │
│ [List] [Map] ⚙️ Filters │ View controls
│                         │
│ Quick: [2BR] [<15K] [+] │ Filter pills
│                         │
│ 234 properties found    │ Results count
│ Sort: Newest ▼          │ Sort dropdown
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │  Property Card 1    │ │ Scrollable
│ └─────────────────────┘ │ list of
│ ┌─────────────────────┐ │ property
│ │  Property Card 2    │ │ cards
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  Property Card 3    │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

### Layout Structure - Mobile Map View

```
┌─────────────────────────┐
│ 🔍 Search neighborhood  │ Search bar
│                         │
│ [List] [Map] ⚙️ Filters │ View controls
├─────────────────────────┤
│                         │
│      Map Canvas         │ Interactive
│     📍  📍              │ map with
│   📍      📍            │ property
│      📍 📍   📍         │ pins
│                         │
│   [Current Location]    │ GPS button
│                         │
├─────────────────────────┤
│ ← Property Preview →    │ Swipeable
│ L.12,000 - Los Próceres │ cards at
│ 2BR Apartment          │ bottom
└─────────────────────────┘
```

### Layout Structure - Desktop

```
┌──────────────────────────────────────────────────┐
│ HEUREKKA  Search: [__________] [Search]  Login  │ Header
├──────────────────────────────────────────────────┤
│                                                  │
│ Filters    Results: 234 properties    Sort ▼    │ Controls
│                                                  │
├────────────────────┬─────────────────────────────┤
│                    │                             │
│   Filters Panel    │         Map View            │
│                    │                             │
│ Price Range        │      📍    📍   📍          │
│ [____] - [____]    │    📍   📍      📍          │
│                    │       📍     📍              │
│ Bedrooms           │                             │
│ ○ 1  ● 2  ○ 3+    ├─────────────────────────────┤
│                    │                             │
│ Property Type      │    Property List            │
│ ☑ Apartment        │  ┌──────────────────┐      │
│ ☑ House            │  │ Property Card 1  │      │
│ ☐ Studio           │  └──────────────────┘      │
│                    │  ┌──────────────────┐      │
│ Neighborhoods      │  │ Property Card 2  │      │
│ [Select areas...]  │  └──────────────────┘      │
│                    │                             │
└────────────────────┴─────────────────────────────┘
```

---

## Component Specifications

### Search Bar

#### Visual Design
- **Height**: `48px`
- **Background**: `#FFFFFF`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `24px`
- **Icon**: Magnifying glass `20px`
- **Placeholder**: "Search neighborhood or keyword"
- **Shadow**: `0 2px 4px rgba(0, 0, 0, 0.05)`

#### Interaction States
- **Focus**: Border `#2563EB`, Shadow expanded
- **Typing**: Show autocomplete dropdown
- **Has Value**: Show clear button

#### Autocomplete Dropdown
```
┌─────────────────────────┐
│ Recent Searches         │
│ • Lomas del Guijarro    │
│ • 2 bedroom apartment   │
│                         │
│ Popular Areas           │
│ • Los Próceres          │
│ • Tegucigalpa Centro    │
│ • Las Colinas           │
└─────────────────────────┘
```

### View Toggle

#### Visual Design
- **Container**: Segmented control
- **Height**: `40px`
- **Background**: `#F3F4F6`
- **Active Background**: `#FFFFFF`
- **Border Radius**: `8px`
- **Shadow**: `inset 0 1px 2px rgba(0, 0, 0, 0.05)`

#### States
```css
/* Inactive */
background: transparent;
color: #6B7280;

/* Active */
background: #FFFFFF;
color: #111827;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### Quick Filter Pills

#### Visual Design
- **Height**: `32px`
- **Padding**: `6px 12px`
- **Background**: `#FFFFFF`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `16px`
- **Font**: `14px, 500`
- **Active**: Background `#2563EB`, Text `#FFFFFF`

#### Common Filters
- Bedrooms: "1BR", "2BR", "3BR+"
- Price: "<10K", "10-15K", "15-20K", ">20K"
- Type: "Apartment", "House", "Studio"
- Move Date: "Available Now", "Next Month"

### Map Component

#### Map Controls
- **Zoom Controls**: +/- buttons, top-right
- **Location Button**: Bottom-right, 48×48px
- **Full Screen**: Top-right corner
- **Map Type**: Streets/Satellite toggle

#### Pin Clustering
```javascript
// Cluster logic
< 5 pins at zoom level: Show individual pins
5-20 pins: Small cluster with count
20+ pins: Large cluster with count
```

#### Pin Design
- **Individual Pin**: Custom house icon, `24×24px`
- **Color**: `#2563EB` (available), `#6B7280` (pending)
- **Cluster**: Circle with count, scales with number
- **Selected**: Enlarged with price label

#### Property Preview Card (Map)
- **Position**: Fixed bottom, 16px padding
- **Height**: `120px`
- **Swipeable**: Horizontal scroll through results
- **Tap**: Expand to full property details
- **Content**: Image, price, beds, location

### Results List

#### List Header
- **Count**: "234 properties found"
- **Sort Dropdown**: "Newest", "Price ↑", "Price ↓"
- **Sticky**: Remains at top when scrolling

#### Grid Layout
- **Mobile**: 1 column, 16px gap
- **Tablet**: 2 columns, 20px gap
- **Desktop**: 3-4 columns, 24px gap

#### Infinite Scroll
- **Initial Load**: 20 properties
- **Load More**: Trigger at 80% scroll
- **Loading Indicator**: Skeleton cards
- **End Message**: "You've seen all properties"

### Filter Panel

#### Mobile (Bottom Sheet)
```
┌─────────────────────────┐
│ ─────                   │ Drag handle
│ Filters          Clear │ Header
├─────────────────────────┤
│                         │
│ Price Range             │
│ Min [$_____]            │
│ Max [$_____]            │
│ [====|==========]       │ Slider
│                         │
│ Bedrooms                │
│ [Any][1][2][3][4+]      │ Pills
│                         │
│ Bathrooms               │
│ [Any][1][1.5][2][3+]    │ Pills
│                         │
│ Property Type           │
│ ☑ Apartment             │
│ ☑ House                 │
│ ☐ Studio                │
│                         │
│ Amenities               │
│ ☑ Parking               │
│ ☑ Security              │
│ ☐ Pool                  │
│ [Show 5 more]           │ Expandable
│                         │
├─────────────────────────┤
│ [Apply Filters]         │ Primary CTA
└─────────────────────────┘
```

#### Desktop (Sidebar)
- **Width**: `280px`
- **Position**: Sticky sidebar
- **Background**: `#FFFFFF`
- **Border Right**: `1px solid #E5E7EB`
- **Padding**: `24px`

### Empty States

#### No Results
```
┌─────────────────────────┐
│                         │
│         🏠              │
│                         │
│  No properties match    │
│  your criteria          │
│                         │
│  Try adjusting your     │
│  filters or search      │
│  in nearby areas        │
│                         │
│  [Clear Filters]        │
│                         │
└─────────────────────────┘
```

#### Loading State
- Show 6 skeleton cards
- Shimmer animation
- Map shows loading spinner

#### Error State
```
┌─────────────────────────┐
│                         │
│         ⚠️              │
│                         │
│  Unable to load         │
│  properties             │
│                         │
│  [Try Again]            │
│                         │
└─────────────────────────┘
```

---

## Interaction Patterns

### List-Map Synchronization
1. Scroll list → Map viewport updates
2. Pan map → List filters to visible area
3. Click pin → List scrolls to property
4. Select card → Pin highlights on map

### Search Behavior
1. Type in search bar
2. Show autocomplete after 2 characters
3. Debounce search by 300ms
4. Update results without page reload
5. Maintain scroll position

### Filter Application
1. Open filter panel
2. Adjust multiple filters
3. Show result count preview
4. Apply filters
5. Animate to new results

### Progressive Loading
```
Initial: 20 properties
Scroll 80%: Load next 20
Continue until all loaded
Show "End of results"
```

---

## Performance Optimizations

### Map Performance
- Cluster pins at high zoom levels
- Lazy load map tiles
- Debounce pan/zoom events
- Virtual DOM for large pin counts
- Cache rendered tiles

### List Performance
- Virtual scrolling for long lists
- Lazy load images below fold
- Progressive image loading
- Skeleton screens during fetch
- Debounced filter application

### Mobile Optimizations
- Reduce map pin detail on mobile
- Simplified card layout
- Touch-optimized controls
- Reduced animation complexity
- Aggressive image compression

---

## Responsive Behavior

### Breakpoint Adaptations

#### Mobile (320-767px)
- Single column list
- Full-width map
- Bottom sheet filters
- Swipeable property previews
- Fixed bottom CTA

#### Tablet (768-1023px)
- Two column grid
- Collapsible filter sidebar
- Hover states partially enabled
- Landscape map optimization

#### Desktop (1024px+)
- Multi-column grid (3-4)
- Split view (map + list)
- Persistent filter sidebar
- Rich hover interactions
- Keyboard shortcuts

---

## Accessibility Features

### Keyboard Navigation
- Tab through all properties
- Arrow keys for map navigation
- Enter to select property
- Escape to close filters
- Shortcuts for view toggle

### Screen Reader Support
```html
<section aria-label="Property search results">
  <h2>234 properties found in Tegucigalpa</h2>
  <button aria-label="Switch to map view">Map</button>
  <button aria-pressed="true">List</button>
</section>
```

### Visual Accessibility
- High contrast pin colors
- Focus indicators on all controls
- Alternative text for map pins
- Colorblind-safe status indicators

---

## Analytics & Tracking

### Key Events
```javascript
// Search events
'search_performed': { query, results_count }
'search_filter_applied': { filters, results_count }

// View events
'view_toggled': { from, to }
'map_interacted': { action, zoom_level }

// Property events
'property_viewed_list': { property_id, position }
'property_viewed_map': { property_id, source }

// Contact events
'contact_initiated': { property_id, view_type }
```

### Performance Metrics
- Time to first result: <2s
- Map initial load: <3s
- Filter application: <1s
- Smooth scrolling: 60fps
- Image load time: <1s per image

---

## Implementation Notes

### State Management
```typescript
interface ExploreState {
  view: 'list' | 'map';
  searchQuery: string;
  filters: FilterState;
  properties: Property[];
  mapBounds: LatLngBounds;
  selectedProperty: string | null;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}
```

### API Endpoints
```
GET /api/properties
  ?search={query}
  &min_price={number}
  &max_price={number}
  &bedrooms={number}
  &neighborhoods={array}
  &bounds={ne_lat,ne_lng,sw_lat,sw_lng}
  &page={number}
  &limit={number}
```

### Caching Strategy
- Cache search results for 5 minutes
- Cache map tiles indefinitely
- Store filter preferences in localStorage
- Prefetch next page of results
- Cache property images aggressively

---

## Success Criteria

### User Engagement
- Average properties viewed: >5 per session
- Map interaction rate: >40%
- Filter usage: >60%
- Search refinement: >30%

### Performance
- Initial load: <2 seconds
- Subsequent loads: <1 second
- Smooth interactions: 60fps
- Low data usage: <2MB per session

---

*Feature Version: 1.0.0 | Last Updated: September 4, 2025*