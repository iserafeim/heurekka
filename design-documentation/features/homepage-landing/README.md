# Homepage/Landing Page Feature
## First Impression & User Entry Point Design

---
title: Homepage/Landing Page Feature Overview
description: Primary entry point design with search, value propositions, and user path navigation
feature: homepage-landing
last-updated: 2025-01-05
version: 1.0.0
related-files:
  - ./user-journey.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
  - ./accessibility.md
dependencies:
  - ../../design-system/style-guide.md
  - ../../design-system/components/buttons.md
  - ../property-discovery/README.md
  - ../search-profile-creation/README.md
status: approved
---

## Overview

The Homepage serves as HEUREKKA's primary entry point, designed to immediately communicate value, enable quick property searches, and guide users toward creating reusable search profiles. This mobile-first design prioritizes immediate action with prominent search functionality while building trust through transparency.

## User Experience Goals

### Primary Objectives
1. **Instant Understanding**: Communicate value proposition in <3 seconds
2. **Quick Search Initiation**: Enable property search without registration
3. **Profile Creation Motivation**: Convert 40% of visitors to create profiles
4. **Trust Building**: Establish credibility through metrics and testimonials
5. **Dual Path Support**: Clear routes for both tenants and landlords

### Success Metrics
- **Bounce Rate**: <35% on mobile devices
- **Search Initiation**: >60% start a property search
- **Profile Creation**: >40% begin profile creation process
- **Time to Action**: <10 seconds to first interaction
- **Mobile Performance**: <2 second load time on 4G

---

## Information Architecture

```
Homepage
├── Navigation Header
│   ├── Logo/Brand
│   ├── Quick Links (Explore, How It Works)
│   └── Login/Sign Up
├── Hero Section
│   ├── Headline & Subheadline
│   ├── Search Bar (Prominent)
│   ├── Quick Search Suggestions
│   └── CTA: "Create Your Profile"
├── Value Proposition
│   ├── For Tenants
│   ├── For Landlords
│   └── Trust Indicators
├── How It Works
│   ├── Step 1: Create Profile
│   ├── Step 2: Browse Properties
│   ├── Step 3: Connect via WhatsApp
│   └── CTA: "Get Started"
├── Recent Listings
│   ├── Featured Properties (3-6)
│   ├── View All Properties CTA
│   └── Dynamic Updates Badge
├── Social Proof
│   ├── Success Metrics
│   ├── User Testimonials
│   └── Partner Logos
└── Footer
    ├── Navigation Links
    ├── Contact Information
    └── Social Media
```

---

## Component Specifications

### Hero Section

#### Layout Structure - Mobile
```
┌─────────────────────────┐
│  HEUREKKA     ☰         │ Minimal header
├─────────────────────────┤
│                         │
│  Find Your Perfect      │ Hero headline
│  Home in Tegucigalpa    │ 
│                         │
│  Save time with smart   │ Subheadline
│  tenant profiles        │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔍 Search area...   │ │ Search bar
│ └─────────────────────┘ │
│                         │
│ Popular: Los Próceres • │ Quick links
│ Lomas • Las Colinas     │
│                         │
│ ┌─────────────────────┐ │
│ │  Create Free Profile │ │ Primary CTA
│ └─────────────────────┘ │
│                         │
│ ✓ No fees ✓ Save time  │ Value props
└─────────────────────────┘
```

#### Layout Structure - Desktop
```
┌──────────────────────────────────────────────────────┐
│  HEUREKKA    Explore  How It Works    Login  Sign Up │ Full header
├──────────────────────────────────────────────────────┤
│                                                      │
│         Find Your Perfect Home in Tegucigalpa       │ Hero H1
│                                                      │
│      Create one profile. Contact multiple landlords. │ Subheadline
│         Save hours of repetitive conversations.      │
│                                                      │
│      ┌─────────────────────────────────────────┐    │
│      │ 🔍 Search neighborhoods or keywords...   │    │ Search bar
│      └─────────────────────────────────────────┘    │
│                                                      │
│   Popular areas: [Los Próceres] [Lomas] [Centro]    │ Quick pills
│                                                      │
│      [Create Your Free Profile]  [Browse Properties] │ Dual CTAs
│                                                      │
│         ✓ 500+ Properties  ✓ No Fees  ✓ WhatsApp    │ Trust badges
└──────────────────────────────────────────────────────┘
```

### Search Bar Component

#### Visual Design
- **Height**: `56px` (mobile), `48px` (desktop)
- **Width**: `100%` max `600px`
- **Background**: `#FFFFFF`
- **Border**: `2px solid #2563EB`
- **Border Radius**: `28px`
- **Shadow**: `0 4px 6px rgba(37, 99, 235, 0.1)`
- **Icon**: Search icon `24px`, color `#2563EB`
- **Placeholder**: "Search neighborhoods, areas, or keywords..."
- **Font**: `16px/24px, 400` (prevents zoom on iOS)

#### Interaction States
- **Default**: Border `#2563EB`, white background
- **Hover**: Shadow expanded to `0 6px 12px rgba(37, 99, 235, 0.15)`
- **Focus**: Border `#1D4ED8`, shadow `0 0 0 3px rgba(37, 99, 235, 0.1)`
- **Typing**: Show autocomplete dropdown with instant results
- **Has Value**: Show clear button (×) on right

#### Autocomplete Behavior
```
┌─────────────────────────┐
│ 📍 Popular Areas        │
│ • Los Próceres (45)     │
│ • Lomas del Guijarro(32)│
│ • Las Colinas (28)      │
│                         │
│ 🔍 Recent Searches      │
│ • 2 bedroom apartment   │
│ • House with parking    │
│                         │
│ → View all properties   │
└─────────────────────────┘
```

### Value Proposition Section

#### Three-Column Layout (Desktop)
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

#### Mobile Stack
- Single column layout
- 48px spacing between sections
- Icon size: 48px
- Centered alignment
- Alternating background colors for visual separation

### How It Works Section

#### Step Cards
```
┌────────────────────────────────┐
│ 1️⃣ Create Your Search Profile  │
│                                │
│ Tell us what you're looking   │
│ for once - budget, location,  │
│ move date                     │
│                                │
│ [Get Started →]               │
└────────────────────────────────┘
     ↓ Connecting line
┌────────────────────────────────┐
│ 2️⃣ Browse Matching Properties  │
│                                │
│ See properties that fit your  │
│ criteria with photos, maps    │
│ and details                   │
│                                │
│ [Explore Properties →]        │
└────────────────────────────────┘
     ↓ Connecting line
┌────────────────────────────────┐
│ 3️⃣ Connect via WhatsApp       │
│                                │
│ Contact landlords instantly   │
│ with your profile already     │
│ shared                        │
│                                │
│ [Learn More →]                │
└────────────────────────────────┘
```

### Recent Listings Showcase

#### Property Card Grid
- **Mobile**: 1 column, horizontal scroll for 6 cards
- **Tablet**: 2 columns, 3 rows
- **Desktop**: 3 columns, 2 rows

#### Mini Property Card Design
```
┌─────────────────────────┐
│ [Property Image]        │ 16:9 ratio
│                         │
│ L.12,000/month         │ Price
│ 2BR Apartment          │ Type
│ Los Próceres           │ Location
│                         │
│ [View Details →]        │ CTA
└─────────────────────────┘
```

### Trust Indicators Section

#### Metrics Bar
```
┌──────────────────────────────────────┐
│  500+        15min       40%        │
│  Properties  Avg Response  Matched   │
│  Listed      Time         Tenants    │
└──────────────────────────────────────┘
```

#### Visual Design
- **Background**: Linear gradient `#EFF6FF` to `#FFFFFF`
- **Numbers**: `32px, 700, #2563EB`
- **Labels**: `14px, 500, #6B7280`
- **Dividers**: `1px solid #E5E7EB`
- **Padding**: `32px` vertical, `24px` horizontal

### Footer Navigation

#### Desktop Four-Column Layout
```
┌────────────┬────────────┬────────────┬────────────┐
│ Platform   │ Resources  │ Company    │ Connect    │
├────────────┼────────────┼────────────┼────────────┤
│ Browse     │ How It     │ About Us   │ WhatsApp   │
│ Create     │ Works      │ Privacy    │ Facebook   │
│ Profile    │ FAQs       │ Terms      │ Instagram  │
│ List       │ Blog       │ Contact    │ Email      │
│ Property   │ Help       │            │            │
└────────────┴────────────┴────────────┴────────────┘
```

#### Mobile Accordion
- Collapsible sections with tap to expand
- Plus/minus icons for state indication
- Full-width tap targets (48px min height)

---

## Responsive Behavior

### Breakpoint Adaptations

#### Mobile (320-767px)
- Single column layout throughout
- Prominent search bar with full width
- Stacked CTAs with primary emphasis
- Horizontal scroll for property cards
- Simplified navigation (hamburger menu)
- Touch-optimized tap targets (min 48px)

#### Tablet (768-1023px)
- Two-column grids where applicable
- Search bar centered with 80% width
- Side-by-side CTAs
- Property card grid (2 columns)
- Expanded navigation options

#### Desktop (1024px+)
- Multi-column layouts (3-4 columns)
- Search bar with autocomplete preview
- Hover states on all interactive elements
- Full navigation in header
- Rich animations and transitions

---

## Performance Optimizations

### Critical Rendering Path
1. Inline critical CSS for above-fold content
2. Lazy load images below fold
3. Preload hero background and fonts
4. Defer non-critical JavaScript

### Image Optimization
- Hero images: WebP with JPEG fallback
- Property thumbnails: 400×300px, <50KB each
- Lazy loading with blur-up technique
- Responsive images with srcset

### Bundle Optimization
- Code split by route
- Tree shake unused components
- Minify and compress all assets
- CDN delivery for static assets

### Mobile-Specific
- Reduced animation complexity
- Simplified shadows and effects
- Progressive enhancement approach
- Service worker for offline support

---

## Animation & Motion

### Hero Section Animations
```css
/* Fade in sequence */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger timing */
.hero-headline { animation-delay: 0ms; }
.hero-subheadline { animation-delay: 100ms; }
.search-bar { animation-delay: 200ms; }
.cta-button { animation-delay: 300ms; }
```

### Scroll-Triggered Animations
- How It Works cards: Slide in from bottom
- Trust metrics: Count up animation
- Property cards: Fade in with scale
- Intersection Observer for performance

### Micro-interactions
- Button hover: Scale 1.02, shadow elevation
- Search focus: Smooth border color transition
- Card hover: Subtle lift with shadow
- Link hover: Underline slide in

---

## SEO & Meta Optimization

### Meta Tags
```html
<title>HEUREKKA - Find Long-term Rentals in Tegucigalpa</title>
<meta name="description" content="Save time finding rentals in Tegucigalpa. Create one profile, contact multiple landlords via WhatsApp. 500+ properties available.">
<meta property="og:title" content="HEUREKKA - Smart Rental Search">
<meta property="og:description" content="The easiest way to find long-term rentals in Honduras">
<meta property="og:image" content="/og-image.jpg">
```

### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "HEUREKKA",
  "url": "https://heurekka.com",
  "areaServed": "Tegucigalpa, Honduras",
  "description": "Rental marketplace with tenant profiles"
}
```

### Performance Metrics
- Core Web Vitals targets:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

---

## Analytics & Tracking

### Key Events
```javascript
// User engagement events
'homepage_viewed': { source, device_type }
'search_initiated': { query, has_location }
'cta_clicked': { button_name, position }
'profile_creation_started': { trigger_point }

// Scroll depth tracking
'scroll_milestone': { depth_percentage }

// Property interaction
'property_card_clicked': { property_id, position }
'how_it_works_expanded': { step_number }
```

### Conversion Funnel
1. Homepage View
2. Search Initiated / CTA Clicked
3. Profile Creation Started
4. Profile Completed
5. First Property Contact

---

## A/B Testing Opportunities

### Test Variations
1. **Hero Headline**: Value prop vs. action-oriented
2. **CTA Text**: "Create Profile" vs. "Get Started"
3. **Search Placeholder**: Location vs. feature focused
4. **Trust Metrics**: Numbers vs. testimonials first
5. **Property Display**: Grid vs. carousel

### Success Metrics
- Primary: Profile creation rate
- Secondary: Search initiation rate
- Tertiary: Time to first action

---

## Success Criteria

### Engagement Metrics
- Bounce rate: <35% on mobile
- Average time on page: >45 seconds
- Scroll depth: >60% reach How It Works
- CTA click rate: >15%

### Conversion Metrics
- Profile creation: >40% of visitors
- Search initiation: >60% of visitors
- Property view from homepage: >30%

### Performance Metrics
- Page load: <2s on 4G
- Time to Interactive: <3s
- Lighthouse score: >90

---

*Feature Version: 1.0.0 | Last Updated: January 5, 2025*