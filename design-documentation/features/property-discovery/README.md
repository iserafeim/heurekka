# Property Discovery Feature
## Browse & Search Experience Design

---

## Overview

The Property Discovery feature is the primary interface where tenants explore available rentals through a sophisticated split-view design with synchronized property cards and interactive map. This desktop-optimized design with mobile responsiveness prioritizes visual property exploration, efficient filtering, and seamless WhatsApp contact initiation.

## User Experience Goals

### Primary Objectives
1. **Fast Discovery**: Find relevant properties in <30 seconds
2. **Visual Exploration**: Map-based neighborhood browsing
3. **Efficient Filtering**: Progressive filter disclosure
4. **Informed Contact**: View full details before initiating WhatsApp contact

### Success Metrics
- **Engagement Rate**: >3 properties viewed per session
- **Filter Usage**: >60% of users apply filters
- **Map Interaction**: >40% toggle to map view
- **Contact Rate**: >5% browse-to-contact conversion

---

## Information Architecture

```
Explore Page
├── Navigation Bar
│   ├── Logo/Brand
│   ├── Integrated Search Bar
│   └── User Actions (Login/Menu)
├── Filter Bar (Horizontal)
│   ├── Quick Filters (Pills)
│   ├── Advanced Filters Toggle
│   └── Sort Options
├── Split View Container (70/30)
│   ├── Property Cards Panel (70%)
│   │   ├── Results Count
│   │   ├── Property Grid/List
│   │   └── Infinite Scroll
│   └── Map Panel (30%)
│       ├── Interactive Map
│       ├── Cluster Pins
│       ├── Zoom Controls
│       └── Current Location
└── View Toggle (List/Split/Map)
```

---

## Screen Specifications

## Main Explore Page

### Layout Structure - Desktop Split View (Primary)

```
┌───────────────────────────────────────────────────────────────┐
│ HEUREKKA    🔍 Buscar vecindario...    🏠 Publicar  👤 Entrar │ Navigation
├───────────────────────────────────────────────────────────────┤
│ Precio ▼  Habitaciones ▼  Tipo ▼  Más filtros  | 📑 ⊞ 🗺️   │ Filter Bar
├─────────────────────────────────────┬─────────────────────────┤
│ ↕ SCROLLABLE PANEL                  │  🔒 FIXED MAP PANEL     │
│                                     │                         │
│  234 propiedades en Tegucigalpa    │      Interactive Map    │ 70% / 30%
│  Ordenar: Más recientes ▼          │         📍 📍           │ Split
│                                     │     📍      📍 📍       │
│  ┌─────────┐┌─────────┐┌─────────┐ │       📍 📍    📍       │
│  │ [IMG]   ││ [IMG]   ││ [IMG]   │ │         📍              │
│  │      ♡  ││      ♡  ││      ♡  │ │                         │
│  │L.12,000 ││L.8,500  ││L.15,000 │ │   [+] [-]               │
│  │Apart 2BR││Estudio  ││Casa 3BR │ │   🎯 Mi ubicación       │
│  │📍Prócere││📍Comaya.││📍Guijarr│ │                         │
│  │2h•1b•65m││1h•1b•45m││3h•2b•85m│ │                         │
│  │[Contact]││[Contact]││[Contact]│ │   Cluster: 15           │
│  └─────────┘└─────────┘└─────────┘ │      ⭕                 │
│                                     │                         │
│  ┌─────────┐┌─────────┐┌─────────┐ │   🔒 STAYS FIXED        │
│  │ [IMG]   ││ [IMG]   ││ [IMG]   │ │   DURING SCROLL         │
│  │      ♡  ││      ♡  ││      ♡  │ │                         │
│  │L.9,800  ││L.7,200  ││L.11,500 │ │                         │
│  │Casa 2BR ││Apart 1BR││Casa 2BR │ │                         │
│  │📍Hatillo││📍Centro ││📍Colinas│ │                         │
│  │2h•1b•55m││1h•1b•42m││2h•2b•78m│ │                         │ ← Partial
│  │[Contact]││[Contact]││[Contact]│ │                         │   Cards
│  └─────────┴┴─────────┴┴─────────┴ │                         │
│                  ⋮                  │                         │   Cards
│         [Scroll for more]           │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

### Layout Structure - Mobile View (Responsive)

```
┌─────────────────────────┐
│ 🔔 HEUREKKA        ☰    │ Header
├─────────────────────────┤
│   Tegucigalpa, HN       │ Location
├─────────────────────────┤
│[Habit][Precio][Tipo][+]│ Filter pills
├─────────────────────────┤
│ All rentals  Sort by: ▼│ Header
├─────────────────────────┤
│ ┌───────────────────────┐│
│ │     [PROPERTY IMG]    ││ Full width
│ │  Featured  3D Tour ♡ ││ property card
│ │                       ││
│ │                       ││
│ │ 9.6 Excellent ✓ Verif││
│ │ Casa en Los Próceres  ││
│ │ Calle Principal #123  ││
│ │ Lavandería • Seguridad││
│ │ 2 habitaciones 1 baño ││
│ │ L.12,000–L.15,000     ││
│ │                       ││
│ │ [Tour] [Check Avail]  ││
│ └───────────────────────┘│
│                         │
│ ┌───────────────────────┐│
│ │     [PROPERTY IMG]    ││ Second card
│ │                       ││
│ └───────────────────────┘│
│           ⋮             │ Scroll for more
│                         │
│        [    Map    ]    │ Floating button
└─────────────────────────┘
```

### Layout Structure - Tablet View (768-1023px)

```
┌─────────────────────────────────────────────┐
│ HEUREKKA  🔍 Buscar...  🏠  👤              │ Compact Nav
├─────────────────────────────────────────────┤
│ Filters: [Precio][Hab][Tipo][+]  📑 ⊞ 🗺️  │ Filter Bar
├──────────────────────┬──────────────────────┤
│                      │                      │
│  Property Cards      │     Map View         │ 60% / 40%
│  (2 columns × 3 rows)│                      │ Split
│                      │      📍 📍           │
│  ┌────────┐ ┌────────┐     📍   📍         │
│  │ [IMG] ♡│ │ [IMG] ♡│       📍            │
│  │L.12,000│ │L.8,500 │                     │
│  │Apart2BR│ │Estudio │   [+][-] 🎯        │
│  │📍Prócer│ │📍Comaya│                     │
│  │2h•1b•65│ │1h•1b•45│                     │
│  │[Contact│ │[Contact│                     │
│  └────────┘ └────────┘                     │
│  ┌────────┐ ┌────────┐                     │
│  │ [IMG] ♡│ │ [IMG] ♡│                     │
│  │L.15,000│ │L.9,800 │                     │
│  │Casa 3BR│ │Casa 2BR│                     │
│  │📍Guijar│ │📍Hatill│                     │
│  │3h•2b•85│ │2h•1b•55│                     │
│  │[Contact│ │[Contact│                     │
│  └────────┘ └────────┘                     │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

### Layout Structure - Desktop Full List View (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEUREKKA    🔍 Buscar vecindario...    🏠 Publicar  👤 Entrar                                │ Navigation
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Precio ▼  Habitaciones ▼  Tipo ▼  Más filtros  | 📑 ⊞ 🗺️                                  │ Filter Bar
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  234 propiedades en Tegucigalpa    Ordenar: Más recientes ▼                               │
│                                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                          │
│  │ [IMG]       │ │ [IMG]       │ │ [IMG]       │ │ [IMG]       │                          │
│  │          ♡  │ │          ♡  │ │          ♡  │ │          ♡  │                          │
│  │ L.12,000    │ │ L.8,500     │ │ L.15,000    │ │ L.9,800     │                          │
│  │ Apart 2BR   │ │ Estudio     │ │ Casa 3BR    │ │ Casa 2BR    │                          │
│  │📍Los Prócer.│ │📍Comayagüela│ │📍Lomas Guij.│ │📍El Hatillo │                          │
│  │ 2h•1b•65m²  │ │ 1h•1b•45m²  │ │ 3h•2b•85m²  │ │ 2h•1b•55m²  │                          │
│  │ [Contact]   │ │ [Contact]   │ │ [Contact]   │ │ [Contact]   │                          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                          │
│                                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                          │
│  │ [IMG]       │ │ [IMG]       │ │ [IMG]       │ │ [IMG]       │                          │
│  │          ♡  │ │          ♡  │ │          ♡  │ │          ♡  │                          │
│  │ L.7,200     │ │ L.11,500    │ │ L.13,200    │ │ L.6,800     │                          │
│  │ Apart 1BR   │ │ Casa 2BR    │ │ Casa 3BR    │ │ Estudio     │                          │
│  │📍Centro     │ │📍Las Colinas│ │📍Miraflores │ │📍San Felipe │                          │
│  │ 1h•1b•42m²  │ │ 2h•2b•78m²  │ │ 3h•2b•90m²  │ │ 1h•1b•38m²  │                          │
│  │ [Contact]   │ │ [Contact]   │ │ [Contact]   │ │ [Contact]   │                          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                          │
│                                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                          │
│  │ [IMG]       │ │ [IMG]       │ │ [IMG]       │ │ [IMG]       │                          │
│  │          ♡  │ │          ♡  │ │          ♡  │ │          ♡  │                          │
│  │ L.14,500    │ │ L.10,200    │ │ L.8,900     │ │ L.16,800    │                          │
│  │ Casa 2BR    │ │ Apart 2BR   │ │ Apart 1BR   │ │ Casa 3BR    │                          │
│  │📍Palmira    │ │📍Kennedy    │ │📍Bella Vista│ │📍Residencial│                          │
│  │ 2h•2b•75m²  │ │ 2h•1b•68m²  │ │ 1h•1b•48m²  │ │ 3h•3b•120m² │                          │
│  │ [Contact]   │ │ [Contact]   │ │ [Contact]   │ │ [Contact]   │                          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                          │
│                                                                                             │
│                                    [Load More]                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Property Detail Modal - Image-First Design

#### Modal Structure
- **Trigger**: Click anywhere on property card
- **Size**: 95% viewport width, max 1400px
- **Height**: 95vh with optimized scrolling
- **Overlay**: Semi-transparent backdrop (rgba(0,0,0,0.4))
- **Animation**: Smooth scale-up entrance, fade-out exit
- **Focus**: Large, immersive image gallery as primary element

#### Enhanced Modal Layout - Desktop (1024px+) - Zillow Style
```
┌───────────────────────────────────────────────────────────────────────────┐
│                     Property Detail Modal - Image-First                   │
│  ╳                                                              🔍 ⛶      │ Header
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                         HERO IMAGE GALLERY                               │
│                           (Full Width)                                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │                    MAIN HERO IMAGE                                  │ │
│  │                     [900×400px]                                     │ │
│  │                                                                     │ │
│  │        ◀  [Image Navigation]  ▶     1/15 fotos   🔍 Ver galería   │ │
│  │                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ [+8 más]             │
│  │Img1│ │Img2│ │Img3│ │Img4│ │Img5│ │Img6│ │Img7│                      │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                      │
│  ──────────────────── THUMBNAIL STRIP ────────────────────              │
│                                                                           │
│  ┌─────────────────────────────────────────────┬─────────────────────────┐ │
│  │                                             │                         │ │
│  │           PROPERTY INFORMATION              │    STICKY ACTION BAR    │ │
│  │                (75% width)                  │       (25% width)       │ │
│  │                                             │                         │ │
│  │  ┌─────────────────────────────────────────┐│  ┌─────────────────────┐ │ │
│  │  │   L.12,000/mes    💎 Premium           ││  │   L.12,000/mes      │ │ │
│  │  │   Boulevard Morazán, Tegucigalpa        ││  │   💎 Premium        │ │ │
│  │  └─────────────────────────────────────────┘│  └─────────────────────┘ │ │
│  │                                             ││                         │ │
│  │  ┌───────────┬───────────┬──────────┐      ││  ┌─────────────────────┐ │ │
│  │  │     0     │     2     │    60    │      ││  │ 💬 Contactar por    │ │ │
│  │  │Habitacion.│  Baños    │   m²     │      ││  │    WhatsApp         │ │ │
│  │  └───────────┴───────────┴──────────┘      ││  └─────────────────────┘ │ │
│  │                                             ││                         │ │
│  │  🌟 Amenidades                              ││  ┌─────────────────────┐ │ │
│  │  ✓ parking       ✓ air_conditioning        ││  │   📞 Llamar ahora   │ │ │
│  │  ✓ security      ✓ reception_area          ││  └─────────────────────┘ │ │
│  │  [Ver todas las amenidades]                ││                         │ │
│  │                                             ││  ┌─────────────────────┐ │ │
│  │  📝 Descripción                             ││  │  📧 Enviar mensaje  │ │ │
│  │  Moderna oficina en Boulevard Morazán.     ││  └─────────────────────┘ │ │
│  │  Ideal para consultorios médicos, bufetes  ││                         │ │
│  │  de abogados o empresas pequeñas.          ││       🔒 STICKY         │ │
│  │  Excelente ubicación comercial.            ││       POSITION          │ │
│  │  [Leer más]                                ││                         │ │
│  │                                             ││                         │ │
│  │  📍 Ubicación y Área                       ││                         │ │
│  │  ┌─────────────────────────────────────────┐││                         │ │
│  │  │           [Interactive Map]             │││                         │ │
│  │  │               📍                       │││                         │ │
│  │  │        Boulevard Morazán                │││                         │ │
│  │  └─────────────────────────────────────────┘││                         │ │
│  │                                             ││                         │ │
│  │  🚗 Travel Times                            ││                         │ │
│  │  [Add destination input]                   ││                         │ │
│  │                                             ││                         │ │
│  └─────────────────────────────────────────────┴─────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Enhanced Modal Layout - Tablet (768-1023px)
```
┌─────────────────────────────────────────────────────────┐
│                Property Detail Modal                    │
│  ╳                                           🔍        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              HERO IMAGE GALLERY                     │ │
│  │                 [540×360px]                         │ │
│  │                                                     │ │
│  │      ◀  [Full Screen Gallery]  ▶                   │ │
│  │                                                     │ │
│  │           1 / 15 fotos    🔍 Ver galería           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ [+10 más]         │
│  │Img1│ │Img2│ │Img3│ │Img4│ │Img5│                   │
│  └────┘ └────┘ └────┘ └────┘ └────┘                   │
│  ────────────── THUMBNAIL STRIP ──────────────         │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  L.12,000/mes             💎 Oficina Premium       │ │
│  │  Boulevard Morazán, Tegucigalpa                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────┬────────────┬────────────┬─────────────┐ │
│  │     0      │     2      │    60      │ Amenidades  │ │
│  │Habitaciones│   Baños    │    m²      │   [Ver +]   │ │
│  └────────────┴────────────┴────────────┴─────────────┘ │
│                                                         │
│  📝 Descripción                                         │
│  Moderna oficina en Boulevard Morazán. Ideal para      │
│  consultorios médicos, bufetes de abogados o empresas  │
│  pequeñas. Excelente ubicación comercial.              │
│  [Leer más]                                             │
│                                                         │
│  📍 Ubicación                                           │
│  [Expandable mini-map section]                          │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           💬 Contactar por WhatsApp                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Enhanced Modal Layout - Mobile (320-767px)
```
┌─────────────────────────┐
│    Property Modal       │
│  ╳                     │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐ │
│  │                     │ │
│  │    FULL-SCREEN      │ │
│  │    HERO IMAGE       │ │
│  │    [320×240px]      │ │
│  │                     │ │
│  │  ◀  1/15 fotos  ▶   │ │
│  │                     │ │
│  └─────────────────────┘ │
│                         │
│  ┌─┐┌─┐┌─┐┌─┐┌─┐ +10   │
│  │1││2││3││4││5│ más    │
│  └─┘└─┘└─┘└─┘└─┘       │
│  ──── THUMBNAILS ────   │
│                         │
│  ┌─────────────────────┐ │
│  │   L.12,000/mes      │ │
│  │   💎 Premium        │ │
│  └─────────────────────┘ │
│                         │
│  Boulevard Morazán      │
│  Tegucigalpa           │
│                         │
│  ┌───┬────┬────┬──────┐ │
│  │ 0 │ 2  │ 60 │Ameni.│ │
│  │Hab│Baño│ m² │[Ver+]│ │
│  └───┴────┴────┴──────┘ │
│                         │
│  🌟 Amenidades          │
│  ✓ parking             │
│  ✓ air_conditioning    │
│  ✓ security            │
│  [Ver todas]           │
│                         │
│  📝 Descripción         │
│  Moderna oficina en    │
│  Boulevard Morazán.    │
│  Ideal para consul-    │
│  torios médicos...     │
│  [Leer más]            │
│                         │
│  📍 Ubicación           │
│  [Mini Map]            │
│                         │
│  ┌─────────────────────┐ │
│  │ 💬 Contactar por    │ │
│  │    WhatsApp         │ │
│  └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

#### Enhanced Modal Content Sections - Zillow Style

**Full-Width Hero Gallery Section (Top)**
- **Hero Image**: Large, prominent main image spanning full modal width
- **Aspect Ratio**: 16:9 or similar for optimal viewing
- **Navigation**: Left/right arrows with smooth transitions
- **Gallery Controls**: Image counter and fullscreen toggle overlay
- **Thumbnails Strip**: Horizontal scrolling thumbnails below hero
- **Image Quality**: Progressive loading with blur-to-sharp effect

**Split Content Section (Bottom)**

**Property Information Panel (Left - 75%)**
- **Header Block**: Price, badge, and location in prominent card
- **Quick Stats**: Bedrooms, bathrooms, area in clean grid layout
- **Amenities Grid**: Key features in 2-column layout with checkmarks
- **Description**: Full description with expandable "Read more"
- **Interactive Map**: Larger map section with location pin
- **Travel Times**: Input field for destination calculations (like Zillow)
- **Additional Details**: Property facts, listing info, etc.

**Sticky Action Bar (Right - 25%)**
- **Price Summary**: Current price and status at top
- **Primary CTA**: WhatsApp contact button (prominent)
- **Secondary Actions**: Call now, send message buttons
- **Sticky Behavior**: Follows user scroll on longer content
- **Fixed Position**: Always visible during property browsing
- **Visual Hierarchy**: Primary action stands out with gradient/color

**Key Design Principles**
- **Images First**: Hero gallery dominates the top portion
- **Information Flow**: Natural top-to-bottom, left-to-right reading
- **Action Accessibility**: Contact options always visible
- **Content Hierarchy**: Price and key stats prominently displayed
- **Responsive Adaptation**: Maintains usability across all devices

#### Enhanced Modal Visual Specifications
```css
/* Enhanced Modal Overlay */
.property-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.3s ease;
  padding: 2.5vh 2.5vw;
}

/* Enhanced Modal Container */
.property-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1400px;
  height: 95vh;
  display: grid;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: modalBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Desktop Layout (1024px+) - Zillow Style */
@media (min-width: 1024px) {
  .property-modal {
    grid-template-rows: auto auto 1fr;
    grid-template-columns: 1fr;
  }

  .modal-content-split {
    display: grid;
    grid-template-columns: 75% 25%;
    gap: 24px;
  }
}

/* Tablet Layout (768-1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .property-modal {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    height: 90vh;
  }
}

/* Mobile Layout (320-767px) */
@media (max-width: 767px) {
  .property-modal {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    height: 95vh;
    margin: 0;
    border-radius: 16px;
  }

  .property-modal-overlay {
    padding: 1vh 1vw;
  }
}

/* Enhanced Gallery Section */
.modal-gallery {
  background: #000;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hero-image-container {
  flex: 1;
  position: relative;
  min-height: 400px;
  background: #000;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-image:hover {
  transform: scale(1.02);
}

.image-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.image-controls:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.image-controls.prev { left: 16px; }
.image-controls.next { right: 16px; }

.image-counter {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.fullscreen-toggle {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.thumbnail-strip {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.9);
}

.thumbnail {
  min-width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #2563EB;
  transform: scale(1.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Enhanced Info Section */
.modal-info {
  padding: 32px;
  overflow-y: auto;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Mobile Info Section */
@media (max-width: 767px) {
  .modal-info {
    padding: 20px;
    gap: 20px;
  }
}

.price-block {
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
}

.price-main {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
}

.price-period {
  font-size: 16px;
  color: #6B7280;
}

.property-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}

.location-block {
  text-align: center;
  margin: 16px 0;
}

.property-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.property-location {
  font-size: 16px;
  color: #6B7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
}

.stat-card {
  background: #F9FAFB;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.amenities-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.amenity-check {
  width: 16px;
  height: 16px;
  color: #10B981;
}

.expand-button {
  color: #2563EB;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 12px;
}

.mini-map {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mini-map:hover {
  background: #E5E7EB;
}

/* Zillow-Style Action Sidebar */
.sticky-action-bar {
  position: sticky;
  top: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
}

.action-bar-price {
  text-align: center;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
}

.action-bar-price-main {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
}

.action-bar-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Primary Action Button */
.whatsapp-cta-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #25D366 0%, #1EBE5A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.whatsapp-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
}

/* Secondary Action Buttons */
.secondary-action-button {
  width: 100%;
  padding: 14px;
  background: white;
  color: #2563EB;
  border: 2px solid #2563EB;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-action-button:hover {
  background: #2563EB;
  color: white;
  transform: translateY(-1px);
}

/* Property Information Panel */
.property-info-panel {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.property-header-card {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
}

.property-title-main {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.property-location-main {
  font-size: 18px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.enhanced-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 32px 0;
}

.enhanced-stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.enhanced-stat-card:hover {
  border-color: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.large-map-section {
  margin: 32px 0;
}

.interactive-map {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.travel-times-section {
  background: #F9FAFB;
  padding: 24px;
  border-radius: 16px;
  margin: 24px 0;
}

.destination-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.destination-input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Animation Keyframes */
@keyframes fadeInOverlay {
  from {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: rgba(0, 0, 0, 0.4);
  }
}

@keyframes modalBounceIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Navigation Bar with Integrated Search

#### Layout Structure
- **Height**: `64px` (desktop), `56px` (mobile)
- **Background**: `#FFFFFF`
- **Shadow**: `0 2px 4px rgba(0, 0, 0, 0.05)`
- **Position**: Fixed top, z-index: 1000

#### Search Bar (Integrated)
- **Width**: `400px` (desktop), expandable on mobile
- **Height**: `40px`
- **Background**: `#F3F4F6`
- **Border**: `1px solid transparent`
- **Border Radius**: `20px`
- **Icon**: Magnifying glass `16px`
- **Placeholder**: "Buscar vecindario, ciudad o código postal"
- **Focus**: Border `#2563EB`, Width expands to `500px`

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

### View Toggle (Top-Right Controls)

#### Visual Design
- **Position**: Right side of filter bar
- **Container**: Icon button group
- **Height**: `36px`
- **Spacing**: `4px` between buttons
- **Icons**: List (📑), Split (⊞), Map (🗺️)

#### Button States
```css
/* Default */
background: transparent;
color: #6B7280;
border: 1px solid #E5E7EB;

/* Active */
background: #2563EB;
color: #FFFFFF;
border: 1px solid #2563EB;

/* Hover */
background: #F3F4F6;
border: 1px solid #D1D5DB;
```

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

### Horizontal Filter Bar

#### Layout
- **Position**: Below navigation, sticky at scroll
- **Height**: `56px`
- **Background**: `#FFFFFF`
- **Border Bottom**: `1px solid #E5E7EB`
- **Padding**: `12px 24px`

#### Filter Dropdowns
- **Style**: Dropdown buttons with chevron
- **Height**: `36px`
- **Padding**: `8px 16px`
- **Background**: `#FFFFFF`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Active**: Background `#EFF6FF`, Border `#2563EB`

#### Common Filters
- **Precio**: Range slider dropdown
- **Habitaciones**: Multi-select pills
- **Tipo de propiedad**: Checkboxes
- **Más filtros**: Opens modal with advanced options

#### Filter Categories
- **Precio**: Min-Max con slider
- **Habitaciones**: "Estudio", "1", "2", "3", "4+"
- **Tipo**: "Apartamento", "Casa", "Estudio", "Habitación"
- **Más filtros**: 
  - Baños
  - Área (m²)
  - Amenidades
  - Fecha disponible
  - Vecindarios
  - Características especiales

### Split View - Map Panel (30%)

#### Panel Specifications
- **Width**: 30% of viewport (min 350px)
- **Height**: calc(100vh - 120px)
- **Position**: Fixed right side, sticky position
- **Border Left**: `1px solid #E5E7EB`
- **Scroll Behavior**: Static/fixed - does not scroll with property list
- **CSS Position**: `position: sticky; top: 120px;` or `position: fixed;`

#### Map Controls
- **Zoom Controls**: +/- buttons, top-right of map
- **Location Button**: Bottom-right, 40×40px
- **Full Screen**: Expands map to 100% width
- **Map Type**: Streets/Satellite toggle (top-left)

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

#### Property Hover Card (Map)
- **Trigger**: Hover on pin or click on mobile
- **Position**: Above pin with arrow pointer
- **Size**: `280px × 100px`
- **Content**: 
  - Thumbnail image
  - Price and basic info
  - Address
  - "Ver detalles" link
- **Animation**: Fade in 200ms

### Split View - Property Cards Panel (70%)

#### Panel Specifications
- **Width**: 70% of viewport
- **Height**: calc(100vh - 120px)
- **Overflow**: Vertical scroll with hidden scrollbar (independent from map)
- **Background**: `#F9FAFB`
- **Padding**: `20px`
- **Scroll Behavior**: Independent scrolling - map remains fixed while properties scroll

#### List Header
- **Count**: "234 propiedades en Tegucigalpa"
- **Sort Dropdown**: "Más recientes", "Precio ↑", "Precio ↓", "Más relevantes"
- **Position**: Sticky top of panel

#### Grid Layout
- **Desktop Split View**: 3 columns with partial row visibility (3 full + 3 partial cards), 20px gap
- **Desktop Full List**: 4 columns × 3 rows (12 properties), 24px gap
- **Tablet**: 2 columns × 3 rows, 20px gap
- **Mobile**: 1 column (vertical scroll), 16px gap

*Note: Property cards maintain consistent dimensions across all views - more columns in full list view due to available width*

#### Infinite Scroll
- **Split View**: Initial load 6 properties (3 full + 3 partial), load more in batches of 3
- **Full List View**: Initial load 12 properties (4×3 grid), load more in batches of 4
- **Load More**: Trigger at 80% scroll
- **Loading Indicator**: Skeleton cards
- **End Message**: "You've seen all properties"

### Advanced Filters Modal

#### Desktop Modal
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

#### Desktop Modal Design
- **Width**: `600px`
- **Max Height**: `80vh`
- **Position**: Centered overlay
- **Background**: `#FFFFFF`
- **Border Radius**: `12px`
- **Shadow**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`
- **Padding**: `24px`
- **Overlay**: `rgba(0, 0, 0, 0.5)`

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

### Split View Synchronization (Fixed Map)
1. **Hover on card** → Pin highlights and shows tooltip (map stays fixed)
2. **Click on pin** → Card highlights with border glow and scrolls into view
3. **Pan map** → List dynamically filters to visible area (property panel scrolls to show matching properties)
4. **Scroll property list** → Map pins update to highlight properties currently in viewport
5. **Filter change** → Both panels update simultaneously, map remains in fixed position
6. **Select property** → Pin pulses, card scrolls into view and expands slightly
7. **Map bounds update** → Based on visible properties in scrollable panel, not entire list

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
Split View:
- Initial: 6 properties (3 full + 3 partial)
- Scroll 80%: Load next 3 properties
- Continue until all loaded

Full List View:
- Initial: 12 properties (4×3 grid)
- Scroll 80%: Load next 4 properties (1 row)
- Continue until all loaded

Show "End of results"
```

---

## Performance Optimizations

### Map Performance (Fixed Map)
- Cluster pins at high zoom levels
- Lazy load map tiles
- Debounce pan/zoom events
- Virtual DOM for large pin counts
- Cache rendered tiles
- **Fixed Position Optimizations**:
  - Map rendering optimized for sticky/fixed position
  - Efficient pin updates based on scrollable viewport
  - Debounce scroll events for pin visibility updates
  - Smart bounds calculation for visible properties only
  - Minimize map redraws during property list scroll

### List Performance (Independent Scroll)
- Virtual scrolling for long lists
- Lazy load images below fold
- Progressive image loading
- Skeleton screens during fetch
- Debounced filter application
- **Independent Scroll Optimizations**:
  - Smooth scrolling performance in property panel
  - Efficient viewport detection for map pin updates
  - Optimized scroll event handling separate from map
  - Smart property visibility calculation for map sync

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
- **Default**: Full-width vertical list view with large property cards
- **Layout**: Single column, full-width property cards with detailed information
- **Toggle**: Floating "Map" button at bottom switches to full-screen map view
- **Filters**: Horizontal scrolling filter pills below location bar
- **Search**: Location-based search in top bar
- **Cards**: Single column, full width with large images and complete property details
- **Map**: Full screen overlay when "Map" button is tapped, with property previews

#### Tablet (768-1023px)
- **Split View**: 60/40 ratio, 2 columns with partial row visibility in list panel
- **Cards**: 2 columns × 3 rows in list panel
- **Filters**: Horizontal bar, collapsible
- **Search**: Integrated in navbar
- **Touch**: Optimized for touch with hover fallbacks

#### Desktop (1024px+)
- **Split View**: 70/30 ratio, 3 columns with partial row visibility in list panel
- **Split View Scroll**: Property panel scrolls independently, map remains fixed/sticky
- **Full List View**: 4 columns × 3 rows full width (12 properties)
- **Map View**: Full screen with overlay cards
- **Filters**: Horizontal bar with dropdowns
- **Search**: Prominent in navbar
- **Interactions**: Full hover states and tooltips
- **Keyboard**: Complete keyboard navigation

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
'property_modal_opened': { property_id, source }
'modal_gallery_interaction': { property_id, action }
'contact_initiated': { property_id, from_modal: true }
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