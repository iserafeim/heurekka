---
title: Property Discovery - Screen States
description: Complete screen state specifications for property discovery feature
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/cards.md
status: approved
---

# Property Discovery - Screen States

## Overview
Comprehensive documentation of all screen states for the property discovery feature, including search results, property details, and interactive elements.

## Table of Contents
1. [Search Results View](#search-results-view)
2. [Map View](#map-view)
3. [Property Card States](#property-card-states)
4. [Property Details Page](#property-details-page)
5. [Filter Panel](#filter-panel)
6. [Comparison View](#comparison-view)

## Search Results View

### State: Default Split View (70/30)
**Layout Structure**:
- Container: Full viewport width
- Left Panel (70%): Property cards grid
- Right Panel (30%): Interactive map
- Card spacing: 20px gap
- Infinite scroll: No pagination

**Visual Specifications**:
```css
/* Split View Container */
.split-view-container {
  display: grid;
  grid-template-columns: 70% 30%;
  height: calc(100vh - 120px); /* Minus navbar and filter bar */
  background: #FAFBFF;
  position: relative;
}

/* Property Cards Panel */
.cards-panel {
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: #D1D5DB transparent;
}

.cards-panel::-webkit-scrollbar {
  width: 6px;
}

.cards-panel::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 24px;
}

.results-count {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns in 70% width */
  gap: 20px;
  animation: fadeIn 0.4s ease;
}

@media (max-width: 1440px) {
  .results-grid {
    grid-template-columns: 1fr; /* Single column on smaller screens */
  }
}

/* View Toggle (Top Right) */
.view-toggle {
  display: flex;
  gap: 4px;
  position: absolute;
  right: 24px;
  top: 12px;
}

.view-toggle button {
  width: 36px;
  height: 36px;
  padding: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.view-toggle button:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.view-toggle button.active {
  background: #2563EB;
  color: white;
  border-color: #2563EB;
}

/* Sort Dropdown */
.sort-dropdown {
  min-width: 200px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}
```

### State: Loading Results
**Visual Changes**:
```css
/* Skeleton Loading */
.property-skeleton {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  animation: pulse 1.5s ease infinite;
}

.skeleton-image {
  height: 240px;
  background: linear-gradient(
    90deg,
    #F3F4F6 0%,
    #E5E7EB 50%,
    #F3F4F6 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-line {
  height: 12px;
  background: #E5E7EB;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

### State: No Results
**Visual Specifications**:
```css
.no-results {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 600px;
}

.no-results-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  opacity: 0.5;
}

.no-results-title {
  font-size: 28px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.no-results-description {
  font-size: 16px;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 32px;
}

.no-results-suggestions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-chip {
  padding: 8px 16px;
  background: #F3F4F6;
  border-radius: 20px;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: #6366F1;
  color: white;
}
```

## Map Panel (Split View)

### State: Interactive Map Panel
**Layout Structure**:
```css
/* Map Panel in Split View */
.map-panel {
  position: relative;
  width: 100%;
  height: 100%;
  border-left: 1px solid #E5E7EB;
  min-width: 350px;
}

.map-instance {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Map synchronized with cards */
.map-panel.synchronized {
  /* Highlights pins for visible cards */
}

.map-panel .mapboxgl-canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Map Controls */
.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.map-control-button {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-control-button:hover {
  background: #F3F4F6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Map Markers */
.map-marker {
  background: white;
  border: 2px solid #2563EB;
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 14px;
  color: #2563EB;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.map-marker:hover {
  background: #2563EB;
  color: white;
  transform: scale(1.1);
  z-index: 1001;
}

.map-marker.synchronized {
  /* Highlighted when corresponding card is hovered */
  animation: pulse 2s infinite;
  background: #2563EB;
  color: white;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Cluster Markers */
.map-cluster {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
```

### State: Property Hover Tooltip
```css
.map-tooltip {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 280px;
  z-index: 1002;
  pointer-events: none;
  animation: fadeIn 0.2s ease;
}

.map-tooltip::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

.tooltip-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.tooltip-price {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.tooltip-address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.tooltip-specs {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #4B5563;
}
```

## Property Card States

### State: Default Card (No Contact Button)
**Visual Specifications**:
```css
.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  /* Entire card is clickable to open modal */
}

.property-image-container {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.property-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.property-badge.new {
  background: #10B981;
  color: white;
}

.property-badge.featured {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
}

.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.favorite-button:hover {
  transform: scale(1.1);
}

.favorite-button.active {
  background: #EF4444;
}

.favorite-button.active svg {
  fill: white;
}

.property-content {
  padding: 16px;
}

.property-price {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.property-address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.property-specs {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #4B5563;
}

.spec-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

/* No contact button on cards - removed */
.property-card-actions {
  display: none;
}
```

### State: Hover/Active
```css
.property-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.property-card:hover .property-image {
  transform: scale(1.05);
}

.property-card.synchronized {
  /* Highlighted when map pin is clicked */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  border: 2px solid #2563EB;
  animation: highlight 0.3s ease;
}

@keyframes highlight {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

### State: Property Detail Modal (Primary Interaction)
```css
.property-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.property-detail-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: modalEntry 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
}

.modal-close {
  width: 40px;
  height: 40px;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #E5E7EB;
  transform: rotate(90deg);
}

.modal-body {
  display: grid;
  grid-template-columns: 60% 40%;
  height: 100%;
  overflow: hidden;
}

/* Gallery Section */
.modal-gallery {
  background: #000;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gallery-main-image {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gallery-thumbnails {
  height: 120px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.gallery-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.gallery-thumbnail.active {
  opacity: 1;
  border: 2px solid white;
}

.gallery-thumbnail:hover {
  opacity: 1;
  transform: scale(1.05);
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
}

.gallery-nav button {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
}

.gallery-nav button:hover {
  background: white;
  transform: scale(1.1);
}

/* Information Section */
.modal-info {
  background: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-info-content {
  flex: 1;
  padding: 32px;
}

.property-price-block {
  margin-bottom: 24px;
}

.modal-price {
  font-size: 32px;
  font-weight: 700;
  color: #2563EB;
  margin-bottom: 4px;
}

.modal-type {
  font-size: 18px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.modal-location {
  font-size: 16px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.property-specs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 24px;
}

.spec-block {
  text-align: center;
}

.spec-value {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
}

.spec-label {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

.amenities-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.amenities-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4B5563;
}

.amenity-icon {
  color: #10B981;
}

.description-section {
  margin-bottom: 24px;
}

.description-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4B5563;
}

.location-section {
  margin-bottom: 24px;
}

.mini-map {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
}

/* WhatsApp CTA Section */
.modal-contact-section {
  padding: 24px;
  background: white;
  border-top: 1px solid #E5E7EB;
  position: sticky;
  bottom: 0;
}

.whatsapp-cta-button {
  width: 100%;
  padding: 16px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
}

.whatsapp-cta-button:hover {
  background: #1EBE5A;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
}

.whatsapp-icon {
  width: 24px;
  height: 24px;
}

/* Modal Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalEntry {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Mobile Responsive Modal */
@media (max-width: 768px) {
  .property-detail-modal {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .modal-body {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
  
  .modal-gallery {
    height: 300px;
  }
  
  .gallery-thumbnails {
    height: 80px;
  }
  
  .gallery-thumbnail {
    width: 70px;
    height: 60px;
  }
  
  .modal-info-content {
    padding: 20px;
  }
  
  .property-specs-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
  }
  
  .amenities-list {
    grid-template-columns: 1fr;
  }
}
```

## Property Details Page

### State: Full Details View
**Layout Structure**:
```css
.property-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Gallery Section */
.property-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.gallery-main {
  position: relative;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumbnails {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
}

.gallery-thumbnail {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-thumbnail:hover img {
  transform: scale(1.1);
}

.view-all-photos {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.details-main {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.property-title {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.property-location {
  font-size: 18px;
  color: #6B7280;
  margin-bottom: 24px;
}

.property-price-details {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 24px;
}

.price-main {
  font-size: 36px;
  font-weight: 700;
  color: #6366F1;
}

.price-per-sqft {
  font-size: 16px;
  color: #6B7280;
}

/* Specifications Grid */
.specifications {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 24px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 32px;
}

.spec-block {
  text-align: center;
}

.spec-value {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
}

.spec-label {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}

/* Description Section */
.property-description {
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.description-text {
  font-size: 16px;
  line-height: 1.8;
  color: #4B5563;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: #6366F1;
}

.feature-text {
  font-size: 15px;
  color: #4B5563;
}
```

### State: Sidebar Actions
```css
.details-sidebar {
  position: sticky;
  top: 24px;
}

.agent-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.agent-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.agent-company {
  font-size: 14px;
  color: #6B7280;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.contact-button {
  background: #6366F1;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-button:hover {
  background: #5558E3;
  transform: translateY(-1px);
}

.schedule-button {
  background: white;
  color: #6366F1;
  border: 2px solid #6366F1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-button:hover {
  background: #F0F1FF;
}
```

## Filter Bar & Modal

### State: Horizontal Filter Bar
```css
/* Horizontal Filter Bar */
.filter-bar {
  position: sticky;
  top: 64px; /* Below navbar */
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-dropdown {
  position: relative;
  display: inline-block;
}

.filter-dropdown-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-dropdown-button:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.filter-dropdown-button.active {
  background: #EFF6FF;
  border-color: #2563EB;
  color: #2563EB;
}

.filter-dropdown-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 280px;
  z-index: 1000;
}

/* Advanced Filters Modal */
.filter-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 2000;
}

.filter-section {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #F3F4F6;
}

.filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

/* Range Sliders */
.range-container {
  padding: 0 8px;
}

.range-track {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  position: relative;
}

.range-fill {
  position: absolute;
  height: 100%;
  background: #6366F1;
  border-radius: 2px;
}

.range-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #6366F1;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
}

.range-values {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: #6B7280;
}

/* Checkbox Groups */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.checkbox-item:hover {
  background: #F9FAFB;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E7EB;
  border-radius: 4px;
  position: relative;
}

.checkbox-input.checked {
  background: #6366F1;
  border-color: #6366F1;
}

.checkbox-label {
  font-size: 14px;
  color: #4B5563;
}

/* Filter Actions */
.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.apply-filters {
  flex: 1;
  background: #6366F1;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.clear-filters {
  padding: 12px 20px;
  background: white;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}
```

## Responsive States

### State: Mobile View (Stacked)
```css
/* Mobile View - Stacked Layout */
@media (max-width: 767px) {
  .split-view-container {
    display: block;
    height: auto;
  }
  
  .cards-panel {
    width: 100%;
    height: auto;
    padding: 16px;
  }
  
  .map-panel {
    display: none; /* Hidden by default on mobile */
  }
  
  .map-panel.active {
    display: block;
    position: fixed;
    top: 120px;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: calc(100vh - 120px);
    z-index: 1000;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .view-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 8px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Tablet View - 60/40 Split */
@media (min-width: 768px) and (max-width: 1023px) {
  .split-view-container {
    grid-template-columns: 60% 40%;
  }
  
  .results-grid {
    grid-template-columns: 1fr; /* Single column in narrower space */
  }
  
  .map-panel {
    min-width: 300px;
  }
}

/* Desktop Full List View */
.list-view-container {
  padding: 24px;
  background: #FAFBFF;
  min-height: calc(100vh - 120px);
}

.list-view-container .results-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* Desktop Full Map View */
.map-view-container {
  position: relative;
  height: calc(100vh - 120px);
}

.map-view-container .map-instance {
  width: 100%;
  height: 100%;
}

.map-view-container .property-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px;
  background: linear-gradient(to top, rgba(255,255,255,0.95), transparent);
}

.comparison-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.comparison-price {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.comparison-address {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}

.comparison-body {
  display: grid;
  grid-template-columns: 200px repeat(3, 1fr);
}

.comparison-row {
  display: contents;
}

.comparison-row:nth-child(even) {
  background: #FAFBFF;
}

.comparison-feature {
  padding: 12px 16px;
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.comparison-value {
  padding: 12px 16px;
  font-size: 14px;
  color: #1A1A1A;
  text-align: center;
  border-left: 1px solid #E5E7EB;
}

.comparison-value.highlight {
  background: #F0F1FF;
  color: #6366F1;
  font-weight: 600;
}
```

## Related Documentation
- [User Journey Map](./user-journey.md)
- [Interaction Patterns](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Component Library](../../design-system/components/)