---
title: Property Discovery - Interaction Patterns
description: Detailed interaction specifications and animations for property discovery
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Property Discovery - Interaction Patterns

## Overview
Complete interaction and animation specifications for the property discovery feature, including search interactions, map controls, and property browsing behaviors.

## Table of Contents
1. [Search Interactions](#search-interactions)
2. [Split View Synchronization](#split-view-synchronization)
3. [Map Interactions](#map-interactions)
4. [Property Card Interactions](#property-card-interactions)
5. [Filter Bar Interactions](#filter-bar-interactions)
6. [View Toggle Interactions](#view-toggle-interactions)
7. [Performance Patterns](#performance-patterns)

## Search Interactions

### Navbar Search Integration

#### Integrated Search Bar
```javascript
// Navbar search with Spanish support
.navbar-search {
  width: 400px;
  transition: width 0.3s ease;
  
  on:focus {
    width: 500px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }
}

// Location auto-complete in Spanish
on:input {
  // Debounce input
  debounce(() => {
    if (value.length >= 2) {
      fetchSuggestionsSpanish(value); // Spanish neighborhoods
    }
  }, 300);
}

// Suggestion dropdown animation
.suggestions-dropdown {
  opacity: 0;
  transform: translateY(-10px);
  animation: slideDown 0.2s ease forwards;
  max-height: 320px;
  overflow-y: auto;
}

@keyframes slideDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Suggestion hover
.suggestion-item:hover {
  background: linear-gradient(90deg, #F0F1FF 0%, #F9FAFB 100%);
  padding-left: 20px;
  transition: all 0.15s ease;
}

// Selection feedback
on:select {
  .selected-suggestion {
    animation: flash 0.3s ease;
    background: rgba(99, 102, 241, 0.1);
  }
}
```

#### Search Submission
```javascript
// Search button animation
.search-button {
  on:click {
    animation: pulse 0.3s ease;
    
    // Loading state
    .icon {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

// Results transition
.results-transition {
  // Fade out old results
  .old-results {
    animation: fadeOut 0.2s ease forwards;
  }
  
  // Fade in new results
  .new-results {
    animation: fadeIn 0.3s ease 0.2s forwards;
  }
}
```

## Split View Synchronization

### Card-Map Coordination

```javascript
// Card hover triggers map pin highlight
.property-card {
  on:mouseenter {
    const pinId = this.dataset.propertyId;
    mapInstance.highlightPin(pinId);
    
    // Animate pin with pulse
    .map-marker[data-id="${pinId}"] {
      animation: pulse 2s infinite;
      background: #2563EB;
      color: white;
      z-index: 1000;
    }
  }
  
  on:mouseleave {
    mapInstance.unhighlightAll();
  }
}

// Map pin click highlights card
.map-marker {
  on:click {
    const cardId = this.dataset.id;
    const card = document.querySelector(`.property-card[data-id="${cardId}"]`);
    
    // Smooth scroll to card
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    // Highlight card with glow
    card.classList.add('synchronized');
    setTimeout(() => {
      card.classList.remove('synchronized');
    }, 2000);
  }
}

// Synchronized panel scrolling
.cards-panel {
  on:scroll {
    throttle(() => {
      const visibleCards = getVisibleCards();
      const bounds = calculateBoundsForProperties(visibleCards);
      
      // Smooth map adjustment
      mapInstance.fitBounds(bounds, {
        padding: 50,
        duration: 300
      });
    }, 500);
  }
}

// Map pan updates property list
.map-instance {
  on:moveend {
    const bounds = map.getBounds();
    const visibleProperties = getPropertiesInBounds(bounds);
    
    // Update cards panel with fade
    updatePropertyCards(visibleProperties, {
      animation: 'fade',
      duration: 300
    });
    
    // Update count in Spanish
    updateResultCount(`${visibleProperties.length} propiedades`);
  }
}
```

## Map Interactions

### Map Panel Interactions (30% View)

#### Constrained Map Controls
```javascript
// Map in 30% panel - optimized interactions
.map-panel {
  // Constrained for smaller viewport
  minZoom: 10,
  maxZoom: 18,
  
  on:pan {
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
    
    // Real-time sync with cards
    throttle(() => {
      highlightVisibleProperties(bounds);
      updateCardFiltering(bounds);
    }, 100);
  }
}

// Zoom animations
.zoom-controls {
  .zoom-in, .zoom-out {
    on:click {
      map.animateZoom({
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
      
      // Button feedback
      animation: buttonPress 0.2s ease;
    }
  }
}

@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

// Scroll zoom
on:wheel {
  if (ctrlKey) {
    preventDefault();
    
    const zoomDelta = event.deltaY > 0 ? -0.5 : 0.5;
    map.smoothZoom(currentZoom + zoomDelta);
  }
}
```

#### Property Tooltip on Hover

```javascript
// Enhanced marker hover with tooltip
.map-marker {
  on:mouseenter {
    // Scale marker
    transform: scale(1.2);
    z-index: 1000;
    
    // Show property tooltip
    const tooltip = createPropertyTooltip({
      id: propertyId,
      price: propertyData.price,
      beds: propertyData.bedrooms,
      address: propertyData.address,
      image: propertyData.thumbnail
    });
    
    // Position above marker
    positionTooltip(tooltip, this, {
      position: 'top',
      offset: 10
    });
    
    // Fade in animation
    tooltip.animate([
      { opacity: 0, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 200,
      easing: 'ease-out'
    });
  }
  
  on:mouseleave {
    transform: scale(1);
    z-index: auto;
    hidePropertyPreview();
  }
  
  on:click {
    // Bounce animation
    animation: markerBounce 0.5s ease;
    
    // Center map on marker
    map.panTo(markerPosition, {
      duration: 500,
      easing: 'ease-in-out'
    });
    
    // Highlight corresponding card
    highlightPropertyCard(propertyId);
  }
}

@keyframes markerBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-5px); }
}

// Cluster interactions
.marker-cluster {
  on:click {
    // Expand animation
    animation: clusterExpand 0.3s ease;
    
    // Zoom to cluster bounds
    map.fitBounds(clusterBounds, {
      padding: 50,
      duration: 500
    });
  }
}

@keyframes clusterExpand {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
```

## Filter Bar Interactions

### Horizontal Filter Dropdowns

```javascript
// Filter dropdown behavior
.filter-dropdown {
  on:click {
    // Toggle dropdown
    this.classList.toggle('active');
    
    // Show content with animation
    .filter-dropdown-content {
      if (active) {
        display: block;
        animation: dropIn 0.2s ease;
      } else {
        animation: dropOut 0.15s ease;
        setTimeout(() => display = none, 150);
      }
    }
  }
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Price range slider in dropdown
.price-slider {
  on:input {
    // Real-time price display
    updatePriceDisplay(this.value);
    
    // Debounced filter application
    debounce(() => {
      applyPriceFilter(this.value);
      // Update both panels
      updatePropertyCards();
      updateMapMarkers();
    }, 500);
  }
}

// Room selector
.room-selector {
  .room-option {
    on:click {
      this.classList.toggle('selected');
      
      // Immediate feedback
      if (selected) {
        background: #2563EB;
        color: white;
        animation: selectPop 0.2s ease;
      }
      
      // Apply filter
      updateRoomFilter();
      syncPanels();
    }
  }
}

// Advanced filters modal
.more-filters-button {
  on:click {
    showModal({
      content: advancedFiltersForm,
      width: '600px',
      animation: 'slideUp',
      overlay: true
    });
  }
}
```

## View Toggle Interactions

### View Mode Switching

```javascript
// View toggle buttons (List/Split/Map)
.view-toggle {
  .view-button {
    on:click {
      const mode = this.dataset.view;
      
      // Transition animations
      switch(mode) {
        case 'list':
          // Full width list view
          transitionToList();
          break;
        case 'split':
          // 70/30 split view (default)
          transitionToSplit();
          break;
        case 'map':
          // Full screen map
          transitionToMap();
          break;
      }
    }
  }
}

// Transition to split view
function transitionToSplit() {
  const container = document.querySelector('.view-container');
  
  // Animate layout change
  container.animate([
    { gridTemplateColumns: getCurrentLayout() },
    { gridTemplateColumns: '70% 30%' }
  ], {
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  });
  
  // Initialize map if needed
  if (!mapInitialized) {
    initializeMapPanel();
  }
  
  // Sync current properties
  syncMapWithCards();
}

// Mobile view toggle
@media (max-width: 767px) {
  .view-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    
    on:click {
      // Toggle between list and map
      if (currentView === 'list') {
        showMapFullscreen();
      } else {
        showListView();
      }
    }
  }
}
  
## Property Card Interactions

### Enhanced Card Behaviors in Split View (Modal Trigger)
```javascript
// Card hover with map sync - No contact button
.property-card {
  transition: all 0.3s ease;
  cursor: pointer;
  
  on:mouseenter {
    // Elevate card
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    
    // Sync with map marker
    const marker = mapInstance.getMarker(this.dataset.id);
    marker.highlight();
    marker.showPriceLabel();
    
    // Image slow zoom
    .property-image {
      transform: scale(1.05);
      transition: transform 5s ease;
    }
    
    // Show "Click para ver detalles" tooltip
    showTooltip('Click para ver detalles');
  }
  
  on:mouseleave {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    // Reset map marker
    const marker = mapInstance.getMarker(this.dataset.id);
    marker.unhighlight();
    marker.hidePriceLabel();
    
    .property-image {
      transform: scale(1);
    }
    
    hideTooltip();
  }
  
  on:click {
    // Only handle favorite button, everything else opens modal
    if (e.target.matches('.favorite-button')) {
      e.stopPropagation();
      toggleFavorite(this.dataset.id);
    } else {
      // Open property detail modal
      e.preventDefault();
      openPropertyModal(this.dataset.id);
    }
  }
}
```

### Favorite Button

```javascript
// Favorite toggle
.favorite-button {
  on:click {
    event.stopPropagation();
    
    if (!favorited) {
      // Add to favorites
      animation: heartBurst 0.4s ease;
      background: #EF4444;
      
      // Success feedback
      showToast('Added to favorites', 'success');
    } else {
      // Remove from favorites
      animation: heartShrink 0.3s ease;
      background: white;
    }
  }
}

@keyframes heartBurst {
  0% { transform: scale(1); }
  30% { transform: scale(0.8); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes heartShrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.8); }
  100% { transform: scale(1); }
}

// Heart particles animation (optional)
.heart-particles {
  position: absolute;
  pointer-events: none;
  
  .particle {
    animation: floatUp 1s ease-out forwards;
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) scale(1);
    opacity: 0;
  }
}
```

### Property Detail Modal

```javascript
// Open property detail modal
function openPropertyModal(propertyId) {
  // Track event
  trackEvent('property_modal_opened', {
    property_id: propertyId,
    source: 'card_click'
  });
  
  // Create modal overlay
  const modal = createPropertyModal(propertyId);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  // Animate modal entrance
  modal.classList.add('entering');
  requestAnimationFrame(() => {
    modal.classList.add('entered');
  });
  
  // Load property data
  loadPropertyDetails(propertyId).then(data => {
    populateModal(modal, data);
    initializeGallery(modal);
    setupWhatsAppButton(modal, data);
  });
}

// Modal structure and animations
.property-modal-overlay {
  // Backdrop blur effect
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
  
  .property-detail-modal {
    // Bounce entrance animation
    animation: modalBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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

// Gallery interactions in modal
.modal-gallery {
  .gallery-thumbnail {
    on:click {
      // Update main image
      const imageUrl = this.dataset.fullsize;
      updateMainImage(imageUrl);
      
      // Update active state
      document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
      });
      this.classList.add('active');
      
      // Track gallery interaction
      trackEvent('modal_gallery_interaction', {
        action: 'thumbnail_click'
      });
    }
  }
  
  // Gallery navigation
  .gallery-nav-prev, .gallery-nav-next {
    on:click {
      const direction = this.classList.contains('gallery-nav-next') ? 1 : -1;
      navigateGallery(direction);
    }
  }
  
  // Keyboard navigation
  on:keydown {
    if (e.key === 'ArrowLeft') navigateGallery(-1);
    if (e.key === 'ArrowRight') navigateGallery(1);
    if (e.key === 'Escape') closePropertyModal();
  }
}

// WhatsApp button in modal
.whatsapp-cta-button {
  on:click {
    // Ripple effect
    createRippleEffect(this, e);
    
    // Track conversion
    trackEvent('contact_initiated', {
      property_id: currentPropertyId,
      from_modal: true,
      time_in_modal: getTimeInModal()
    });
    
    // Generate contextual message
    const message = generateWhatsAppMessage(propertyData);
    
    // Open WhatsApp
    window.open(
      `https://wa.me/${propertyData.phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  }
}

// Close modal
.modal-close, .modal-overlay {
  on:click {
    if (e.target === e.currentTarget) {
      closePropertyModal();
    }
  }
}

function closePropertyModal() {
  const modal = document.querySelector('.property-modal-overlay');
  
  // Exit animation
  modal.classList.add('exiting');
  
  // Re-enable body scroll
  document.body.style.overflow = '';
  
  // Remove after animation
  setTimeout(() => {
    modal.remove();
  }, 300);
  
  // Track time spent
  trackEvent('modal_closed', {
    time_spent: getTimeInModal(),
    interaction_count: getInteractionCount()
  });
}

@keyframes modalExit {
  to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
}
```

## Gallery Interactions

### Image Navigation

```javascript
// Gallery controls
.gallery-container {
  position: relative;
  
  // Next/Previous buttons
  .gallery-nav {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  on:hover {
    .gallery-nav {
      opacity: 1;
    }
  }
  
  .next-button, .prev-button {
    on:click {
      // Slide animation
      const direction = this.classList.contains('next') ? -1 : 1;
      
      .gallery-images {
        transform: translateX(${direction * 100}%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      // Update indicators
      updateGalleryIndicators(currentIndex);
    }
  }
}

// Touch gestures
.gallery-images {
  on:swipeleft {
    navigateGallery('next');
  }
  
  on:swiperight {
    navigateGallery('prev');
  }
  
  // Pinch to zoom
  on:pinch {
    if (scale > 1) {
      enableZoomMode();
    }
  }
}
```

### Lightbox Mode

```javascript
// Open lightbox
.gallery-image {
  on:click {
    openLightbox(imageIndex);
  }
}

.lightbox {
  // Zoom in animation
  animation: lightboxOpen 0.3s ease;
  
  .lightbox-image {
    transform-origin: center;
    transition: transform 0.3s ease;
  }
  
  // Zoom controls
  on:wheel {
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    currentZoom = Math.max(1, Math.min(3, currentZoom * zoomFactor));
    
    .lightbox-image {
      transform: scale(currentZoom);
    }
  }
  
  // Pan when zoomed
  on:mousemove {
    if (currentZoom > 1 && isDragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      
      .lightbox-image {
        transform: scale(currentZoom) translate(deltaX, deltaY);
      }
    }
  }
}

@keyframes lightboxOpen {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Virtual Tour

```javascript
// 360° viewer
.virtual-tour {
  on:mousedown {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  }
  
  on:mousemove {
    if (isDragging) {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      
      // Update camera rotation
      camera.rotation.y += deltaX * 0.01;
      camera.rotation.x += deltaY * 0.01;
      
      // Smooth animation
      requestAnimationFrame(() => {
        renderer.render(scene, camera);
      });
    }
  }
  
  // Hotspot interactions
  .tour-hotspot {
    animation: pulse 2s ease infinite;
    
    on:click {
      // Navigate to room
      navigateToRoom(roomId, {
        duration: 1000,
        easing: 'ease-in-out'
      });
      
      // Show room info
      showRoomInfo(roomData);
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}
```

### WhatsApp Contact from Modal

```javascript
// WhatsApp button only in modal now
function setupWhatsAppButton(modal, propertyData) {
  const whatsappButton = modal.querySelector('.whatsapp-cta-button');
  
  whatsappButton.addEventListener('click', (e) => {
    // Visual feedback
    whatsappButton.classList.add('sending');
    
    // Generate rich message with property details
    const message = `
Hola! Estoy interesado en la propiedad que vi en Heurekka:

📍 ${propertyData.address}
💰 ${propertyData.price}/mes
🏠 ${propertyData.type}
🛏️ ${propertyData.bedrooms} habitaciones
🚿 ${propertyData.bathrooms} baños
📐 ${propertyData.area} m²

¿Podría darme más información o agendar una visita?
    `.trim();
    
    // Track high-intent conversion
    trackEvent('whatsapp_contact_from_modal', {
      property_id: propertyData.id,
      price: propertyData.price,
      type: propertyData.type,
      time_to_contact: getTimeInModal(),
      images_viewed: getImagesViewed(),
      description_read: didReadDescription()
    });
    
    // Open WhatsApp with rich context
    const whatsappUrl = `https://wa.me/${propertyData.contact_phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Success feedback
    setTimeout(() => {
      whatsappButton.classList.remove('sending');
      whatsappButton.innerHTML = '✓ Contacto iniciado';
    }, 500);
  });
}

// Button animation styles
.whatsapp-cta-button {
  position: relative;
  overflow: hidden;
  
  &.sending {
    animation: pulse 0.6s ease;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: translate(-50%, -50%);
      animation: rippleOut 0.6s ease;
    }
  }
}

@keyframes rippleOut {
  to {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
```

### Responsive Behavior Transitions

```javascript
// Tablet to mobile transition
@media (max-width: 768px) {
  .split-view-container {
    // Collapse to single view
    on:resize {
      if (window.innerWidth < 768) {
        // Hide map panel
        .map-panel {
          animation: slideOut 0.3s ease forwards;
        }
        
        // Expand cards to full width
        .cards-panel {
          animation: expandFull 0.3s ease forwards;
        }
        
        // Show floating map button
        .map-float-button {
          animation: fadeIn 0.3s ease;
          display: block;
        }
      }
    }
  }
}

// Desktop resize handling
window.addEventListener('resize', debounce(() => {
  if (window.innerWidth >= 1024) {
    // Restore split view if previously in split mode
    if (lastViewMode === 'split') {
      restoreSplitView();
    }
  } else if (window.innerWidth < 768) {
    // Switch to stacked mobile view
    switchToMobileView();
  }
}, 300));
```


```


```

```

## Performance Patterns

### Lazy Loading

```javascript
// Image lazy loading
.property-image {
  // Intersection Observer
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load image
        const img = entry.target;
        img.src = img.dataset.src;
        
        // Fade in animation
        img.onload = () => {
          img.style.animation = 'fadeIn 0.3s ease';
        };
        
        imageObserver.unobserve(img);
      }
    });
  });
  
  // Observe all images
  document.querySelectorAll('.lazy-image').forEach(img => {
    imageObserver.observe(img);
  });
}
```

### Debouncing and Throttling

```javascript
// Search debouncing
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 500);

// Map pan throttling
const throttledMapUpdate = throttle(() => {
  updateMapMarkers();
  loadVisibleProperties();
}, 200);

// Scroll pagination
const handleScroll = throttle(() => {
  if (nearBottom()) {
    loadMoreProperties();
  }
}, 300);
```

### Optimistic Updates

```javascript
// Favorite action
.favorite-button {
  on:click {
    // Immediate UI update
    this.classList.toggle('favorited');
    
    // API call in background
    toggleFavorite(propertyId)
      .catch(error => {
        // Revert on error
        this.classList.toggle('favorited');
        showError('Failed to update favorite');
      });
  }
}

// Filter application
function applyFilter(filter) {
  // Show loading state immediately
  showFilterLoading();
  
  // Update URL immediately
  updateURLParams(filter);
  
  // Fetch results
  fetchFilteredResults(filter)
    .then(results => {
      updateResults(results);
    })
    .catch(error => {
      revertFilter();
      showError('Failed to apply filter');
    });
}
```

## Related Documentation
- [Screen States](design-documentation/features/property-discovery/screen-states.md)
- [Animation System](design-documentation/design-system/tokens/animations.md)
- [Performance Guidelines](./implementation.md#performance-optimization)
- [Accessibility Requirements](./accessibility.md)