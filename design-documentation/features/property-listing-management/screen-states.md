---
title: Property Listing Management - Screen States
description: Complete screen state specifications for property listing management feature
feature: property-listing-management
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/forms.md
status: approved
---

# Property Listing Management - Screen States

## Overview
Comprehensive documentation of all screen states for the property listing management feature, including creation wizard, editing interfaces, media management, and listing analytics.

## Table of Contents
1. [Listing Creation Wizard](#listing-creation-wizard)
2. [Property Details Forms](#property-details-forms)
3. [Photo Management](#photo-management)
4. [Listing Preview](#listing-preview)
5. [My Listings Dashboard](#my-listings-dashboard)
6. [Listing Analytics](#listing-analytics)
7. [Mobile Creation Flow](#mobile-creation-flow)

## Listing Creation Wizard

### State: Wizard Container
**Layout Structure**:
- Container: 1200px max-width on desktop
- Progress bar: Fixed top position
- Content area: 800px max-width centered
- Navigation: Bottom fixed on mobile
- Sidebar: Preview panel on desktop

**Visual Specifications**:
```css
/* Wizard Container */
.wizard-container {
  min-height: 100vh;
  background: #FAFBFF;
  display: flex;
  flex-direction: column;
}

.wizard-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  z-index: 100;
  padding: 16px 0;
}

.progress-bar {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #E5E7EB;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-indicator.completed {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

.step-indicator.active {
  background: #6366F1;
  border-color: #6366F1;
  color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.step-label {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: calc(100% - 40px);
  height: 2px;
  background: #E5E7EB;
  z-index: -1;
}

.step-connector.completed {
  background: #10B981;
}

/* Content Area */
.wizard-body {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px;
}

.wizard-content {
  flex: 1;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.wizard-preview {
  width: 320px;
  margin-left: 32px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

/* Navigation */
.wizard-footer {
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 20px 0;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.wizard-nav {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button.secondary {
  background: white;
  border: 1px solid #E5E7EB;
  color: #4B5563;
}

.nav-button.primary {
  background: #6366F1;
  color: white;
  border: none;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### State: Step 1 - Property Type & Location
```css
/* Property Type Selection */
.property-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.type-card {
  padding: 20px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.type-card:hover {
  border-color: #6366F1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-card.selected {
  border-color: #6366F1;
  background: #F0F1FF;
}

.type-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 12px;
}

.type-card.selected .type-icon {
  background: #6366F1;
  color: white;
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

.type-description {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
}

/* Location Input */
.location-section {
  margin-top: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.address-input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #6366F1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-helper {
  font-size: 13px;
  color: #6B7280;
  margin-top: 6px;
}

/* Map Preview */
.map-preview {
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 20px;
  position: relative;
}

.map-marker-custom {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 40px;
  height: 40px;
  background: #6366F1;
  border-radius: 50% 50% 50% 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.map-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

.adjust-location-btn {
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
```

### State: Step 2 - Property Details
```css
/* Property Details Form */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.input-group {
  position: relative;
}

.input-group.full-width {
  grid-column: span 2;
}

.number-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 60px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
}

.input-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6B7280;
  font-size: 14px;
}

/* Counter Input */
.counter-input {
  display: flex;
  align-items: center;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.counter-button {
  width: 40px;
  height: 44px;
  border: none;
  background: #F3F4F6;
  color: #4B5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.counter-button:hover:not(:disabled) {
  background: #E5E7EB;
}

.counter-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.counter-value {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

/* Select Dropdown */
.select-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Chevron down */
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

/* Year Built Slider */
.slider-container {
  margin-top: 8px;
}

.slider-track {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  position: relative;
}

.slider-fill {
  height: 100%;
  background: #6366F1;
  border-radius: 3px;
}

.slider-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #6366F1;
  border-radius: 50%;
  position: absolute;
  top: -7px;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-value {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}
```

### State: Step 3 - Pricing & Terms
```css
/* Pricing Section */
.pricing-container {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.price-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.currency-symbol {
  font-size: 24px;
  font-weight: 600;
  color: #6B7280;
}

.price-input {
  flex: 1;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 600;
  text-align: right;
  transition: all 0.2s ease;
}

.price-input:focus {
  border-color: #6366F1;
  outline: none;
}

.price-period {
  font-size: 16px;
  color: #6B7280;
}

/* Included Utilities */
.utilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.utility-checkbox {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.utility-checkbox:hover {
  background: #F3F4F6;
}

.utility-checkbox.checked {
  background: #F0F1FF;
  border-color: #6366F1;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #6366F1;
}

.checkbox-label {
  flex: 1;
  font-size: 14px;
  color: #1A1A1A;
}

/* Deposit Section */
.deposit-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.deposit-option {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deposit-option:hover {
  border-color: #6366F1;
}

.deposit-option.selected {
  border-color: #6366F1;
  background: #F0F1FF;
}

.deposit-amount {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

.deposit-label {
  font-size: 13px;
  color: #6B7280;
}

/* Lease Terms */
.lease-terms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.term-slider {
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
}

.term-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 12px;
}

.term-value {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  text-align: center;
  margin-bottom: 12px;
}
```

## Photo Management

### State: Photo Upload Interface
```css
/* Photo Upload Container */
.photo-upload-section {
  margin-bottom: 32px;
}

.upload-requirements {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.requirements-list {
  font-size: 14px;
  color: #92400E;
  margin: 0;
  padding-left: 20px;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: #FAFBFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: #6366F1;
  background: #F0F1FF;
}

.upload-zone.dragging {
  border-color: #6366F1;
  background: #E0E7FF;
  border-style: solid;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  opacity: 0.5;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 16px;
}

.upload-button {
  padding: 10px 24px;
  background: #6366F1;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
}

/* Photo Grid */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.photo-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  background: #F3F4F6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.photo-item.main {
  grid-column: span 2;
  grid-row: span 2;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-item:hover .photo-actions {
  opacity: 1;
}

.photo-action {
  flex: 1;
  padding: 6px;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
}

.main-photo-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 12px;
  background: #10B981;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Upload Progress */
.upload-progress {
  margin-top: 20px;
}

.progress-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-bottom: 8px;
}

.progress-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}

.progress-info {
  flex: 1;
}

.progress-name {
  font-size: 14px;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.progress-bar-container {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #6366F1;
  transition: width 0.3s ease;
}

.progress-status {
  margin-left: 12px;
  font-size: 14px;
  color: #6B7280;
}

.progress-status.complete {
  color: #10B981;
}

.progress-status.error {
  color: #EF4444;
}
```

### State: Photo Editing
```css
/* Photo Editor Modal */
.photo-editor {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.editor-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.editor-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #F3F4F6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1A1A1A;
  position: relative;
}

.editor-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.editor-sidebar {
  width: 280px;
  background: #F9FAFB;
  padding: 24px;
  overflow-y: auto;
}

.editor-tools {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.tool-button {
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-button:hover {
  border-color: #6366F1;
  background: #F0F1FF;
}

.tool-button.active {
  border-color: #6366F1;
  background: #6366F1;
  color: white;
}

.caption-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.editor-footer {
  padding: 20px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

## Property Details Forms

### State: Features & Amenities
```css
/* Features Section */
.features-section {
  margin-bottom: 32px;
}

.feature-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tab {
  padding: 8px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tab:hover {
  background: #F3F4F6;
}

.category-tab.active {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: #F3F4F6;
}

.feature-item.selected {
  background: #F0F1FF;
  border-color: #6366F1;
}

.feature-checkbox {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #6366F1;
}

.feature-label {
  flex: 1;
  font-size: 14px;
  color: #1A1A1A;
}

.feature-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  opacity: 0.6;
}

/* Custom Features */
.custom-features {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.custom-feature-input {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.custom-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
}

.add-feature-btn {
  padding: 12px 20px;
  background: white;
  border: 1px solid #6366F1;
  color: #6366F1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-feature-btn:hover {
  background: #F0F1FF;
}

.custom-feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.custom-feature-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #E0E7FF;
  color: #6366F1;
  border-radius: 20px;
  font-size: 14px;
}

.remove-chip {
  margin-left: 8px;
  cursor: pointer;
  opacity: 0.7;
}

.remove-chip:hover {
  opacity: 1;
}
```

### State: Description & Highlights
```css
/* Rich Text Editor */
.description-editor {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  flex-wrap: wrap;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toolbar-button:hover {
  background: #E5E7EB;
}

.toolbar-button.active {
  background: #6366F1;
  color: white;
}

.toolbar-separator {
  width: 1px;
  height: 32px;
  background: #E5E7EB;
  margin: 0 8px;
}

.editor-content {
  min-height: 200px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
}

.editor-content:focus {
  outline: none;
}

.character-count {
  padding: 8px 16px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  text-align: right;
  font-size: 13px;
  color: #6B7280;
}

.character-count.warning {
  color: #F59E0B;
}

.character-count.error {
  color: #EF4444;
}

/* Highlights Section */
.highlights-section {
  margin-bottom: 32px;
}

.highlights-list {
  margin-bottom: 16px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 8px;
}

.highlight-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #6366F1;
  flex-shrink: 0;
}

.highlight-text {
  flex: 1;
  font-size: 14px;
  color: #1A1A1A;
  padding-right: 12px;
}

.highlight-remove {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.highlight-remove:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

.add-highlight {
  display: flex;
  gap: 12px;
}

.highlight-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
}

/* Nearby Places */
.nearby-places {
  margin-top: 32px;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.place-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
}

.place-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 8px;
}

.place-info {
  flex: 1;
}

.place-name {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

.place-distance {
  font-size: 12px;
  color: #6B7280;
}
```

## Listing Preview

### State: Preview Mode
```css
/* Preview Container */
.preview-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.preview-header {
  padding: 20px 24px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.preview-toggle {
  display: flex;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.preview-option {
  padding: 8px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-option.active {
  background: #6366F1;
  color: white;
}

/* Preview Content */
.preview-content {
  padding: 32px;
}

.listing-preview {
  /* Matches actual listing display */
  font-family: inherit;
}

.preview-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.preview-main-image {
  grid-row: span 2;
  position: relative;
}

.preview-main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-thumb {
  position: relative;
  overflow: hidden;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-all-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.preview-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.preview-main-info {
  /* Main content styling */
}

.preview-sidebar {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.preview-price-box {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.preview-price {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
}

.preview-price-period {
  font-size: 16px;
  color: #6B7280;
}

.preview-cta {
  width: 100%;
  padding: 14px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.preview-cta.secondary {
  background: white;
  color: #6366F1;
  border: 2px solid #6366F1;
}
```

## My Listings Dashboard

### State: Listings Grid
```css
/* Listings Dashboard */
.listings-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
}

.create-listing-btn {
  padding: 12px 24px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Listings Tabs */
.listings-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 2px solid #E5E7EB;
  margin-bottom: 32px;
}

.tab-button {
  padding: 12px 4px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab-button:hover {
  color: #4B5563;
}

.tab-button.active {
  color: #6366F1;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366F1;
}

.tab-count {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #F3F4F6;
  border-radius: 12px;
  font-size: 13px;
}

.tab-button.active .tab-count {
  background: #E0E7FF;
  color: #6366F1;
}

/* Listings Grid */
.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.listing-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.listing-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.listing-status.active {
  background: #10B981;
  color: white;
}

.listing-status.paused {
  background: #F59E0B;
  color: white;
}

.listing-status.draft {
  background: #6B7280;
  color: white;
}

.listing-stats {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.listing-content {
  padding: 20px;
}

.listing-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.listing-address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 12px;
}

.listing-price {
  font-size: 20px;
  font-weight: 700;
  color: #6366F1;
  margin-bottom: 16px;
}

.listing-meta {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #4B5563;
}

.listing-actions {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.action-button {
  flex: 1;
  padding: 8px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.action-button.primary {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

.action-button.primary:hover {
  background: #5558E3;
}
```

## Listing Analytics

### State: Performance Dashboard
```css
/* Analytics Container */
.analytics-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.analytics-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.date-range-selector {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #F3F4F6;
  border-radius: 8px;
}

.range-option {
  padding: 6px 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.range-option:hover {
  background: rgba(255, 255, 255, 0.5);
}

.range-option.active {
  background: white;
  color: #1A1A1A;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.metric-box {
  padding: 20px;
  background: #F9FAFB;
  border-radius: 8px;
}

.metric-label {
  font-size: 13px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.metric-trend.positive {
  color: #10B981;
}

.metric-trend.negative {
  color: #EF4444;
}

/* Performance Chart */
.performance-chart {
  height: 300px;
  margin-bottom: 24px;
  padding: 20px;
  background: #FAFBFF;
  border-radius: 8px;
}

/* Quality Score */
.quality-score-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  padding: 24px;
  background: #F9FAFB;
  border-radius: 12px;
}

.score-display {
  text-align: center;
}

.score-circle {
  width: 160px;
  height: 160px;
  margin: 0 auto 16px;
  position: relative;
}

.score-value {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 48px;
  font-weight: 700;
  color: #1A1A1A;
}

.score-label {
  font-size: 14px;
  color: #6B7280;
}

.score-factors {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.factor-label {
  flex: 1;
  font-size: 14px;
  color: #4B5563;
}

.factor-bar {
  width: 200px;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.factor-fill {
  height: 100%;
  background: #6366F1;
  transition: width 0.5s ease;
}

.factor-value {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
}

/* Suggestions */
.suggestions-panel {
  margin-top: 24px;
  padding: 20px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
}

.suggestions-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 12px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.suggestion-icon {
  width: 20px;
  height: 20px;
  color: #92400E;
  flex-shrink: 0;
  margin-top: 2px;
}

.suggestion-text {
  font-size: 14px;
  color: #92400E;
  line-height: 1.5;
}
```

## Mobile Creation Flow

### State: Mobile Optimized Forms
```css
/* Mobile Layout (320-767px) */
@media (max-width: 767px) {
  .wizard-container {
    padding: 0;
  }
  
  .wizard-header {
    padding: 12px 16px;
  }
  
  .progress-steps {
    display: none; /* Use dots on mobile */
  }
  
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  
  .progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #E5E7EB;
    transition: all 0.3s ease;
  }
  
  .progress-dot.active {
    width: 24px;
    border-radius: 4px;
    background: #6366F1;
  }
  
  .progress-dot.completed {
    background: #10B981;
  }
  
  .wizard-body {
    padding: 16px;
  }
  
  .wizard-content {
    padding: 20px 16px;
    border-radius: 0;
    box-shadow: none;
  }
  
  .wizard-preview {
    display: none;
  }
  
  /* Mobile Footer */
  .wizard-footer {
    padding: 16px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .wizard-nav {
    padding: 0;
  }
  
  /* Mobile Property Type */
  .property-type-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .type-card {
    padding: 16px 12px;
  }
  
  .type-icon {
    width: 40px;
    height: 40px;
  }
  
  .type-name {
    font-size: 14px;
  }
  
  .type-description {
    display: none;
  }
  
  /* Mobile Forms */
  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .input-group.full-width {
    grid-column: 1;
  }
  
  /* Mobile Photo Upload */
  .upload-zone {
    padding: 24px 16px;
  }
  
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .photo-item.main {
    grid-column: span 2;
    grid-row: span 1;
  }
  
  /* Mobile Features */
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-categories {
    justify-content: flex-start;
  }
  
  /* Mobile Preview */
  .preview-container {
    border-radius: 0;
  }
  
  .preview-gallery {
    grid-template-columns: 1fr;
    height: 250px;
  }
  
  .preview-details {
    grid-template-columns: 1fr;
  }
  
  .preview-sidebar {
    position: static;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
  }
  
  /* Mobile Listings Grid */
  .listings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  /* Mobile Analytics */
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .quality-score-section {
    grid-template-columns: 1fr;
  }
  
  .score-factors {
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
  }
}

/* Tablet Adaptations (768-1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .wizard-body {
    flex-direction: column;
  }
  
  .wizard-content {
    max-width: 100%;
  }
  
  .wizard-preview {
    width: 100%;
    margin-left: 0;
    margin-top: 24px;
    position: static;
  }
  
  .property-type-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .listings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Related Documentation
- [User Journey](./user-journey.md)
- [Interaction Patterns](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Form Components](../../design-system/components/forms.md)