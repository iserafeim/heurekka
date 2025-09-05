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

### State: Default Grid View
**Layout Structure**:
- Container: 1440px max-width
- Grid: 3-column on desktop, 2 on tablet, 1 on mobile
- Card spacing: 24px gap
- Pagination: Bottom-aligned

**Visual Specifications**:
```css
/* Results Container */
.results-container {
  background: #FAFBFF;
  min-height: 100vh;
  padding: 24px;
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
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  animation: fadeIn 0.4s ease;
}

/* View Toggle */
.view-toggle {
  display: flex;
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.view-toggle button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #6B7280;
  transition: all 0.2s ease;
}

.view-toggle button.active {
  background: #6366F1;
  color: white;
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

## Map View

### State: Interactive Map
**Layout Structure**:
```css
.map-view-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: calc(100vh - 80px);
  position: relative;
}

.map-sidebar {
  background: white;
  overflow-y: auto;
  border-right: 1px solid #E5E7EB;
  padding: 16px;
}

.map-instance {
  position: relative;
  width: 100%;
  height: 100%;
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
  border: 2px solid #6366F1;
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 14px;
  color: #6366F1;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.map-marker:hover {
  background: #6366F1;
  color: white;
  transform: scale(1.1);
  z-index: 1001;
}

.map-marker.active {
  background: #6366F1;
  color: white;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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

### State: Drawing Search Area
```css
.drawing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: crosshair;
  z-index: 999;
}

.drawing-instructions {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
}

.search-area-polygon {
  fill: rgba(99, 102, 241, 0.2);
  stroke: #6366F1;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

.area-vertex {
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #6366F1;
  border-radius: 50%;
  cursor: move;
}
```

## Property Card States

### State: Default Card
**Visual Specifications**:
```css
.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
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

.property-card.selected {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
  border: 2px solid #6366F1;
}
```

### State: Quick View Overlay
```css
.quick-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.quick-view-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 500px 1fr;
}

.quick-view-gallery {
  position: relative;
  height: 500px;
  background: #F3F4F6;
}

.quick-view-content {
  padding: 32px;
  overflow-y: auto;
}

.quick-view-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

## Filter Panel

### State: Expanded Filters
```css
.filter-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

## Comparison View

### State: Property Comparison
```css
.comparison-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comparison-header {
  display: grid;
  grid-template-columns: 200px repeat(3, 1fr);
  background: #F9FAFB;
  border-bottom: 2px solid #E5E7EB;
}

.comparison-label {
  padding: 16px;
  font-weight: 600;
  color: #6B7280;
}

.comparison-property {
  padding: 16px;
  border-left: 1px solid #E5E7EB;
  text-align: center;
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