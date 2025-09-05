---
title: Tenant Marketplace - Screen States
description: Complete screen state specifications for the tenant marketplace feature
feature: tenant-marketplace
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/cards.md
status: approved
---

# Tenant Marketplace - Screen States

## Overview
Comprehensive documentation of all screen states for the tenant marketplace, including post creation, marketplace browsing, and response management interfaces.

## Table of Contents
1. [Marketplace Landing Page](#marketplace-landing-page)
2. [Post Creation Wizard](#post-creation-wizard)
3. [Post Card Components](#post-card-components)
4. [Post Management Dashboard](#post-management-dashboard)
5. [Response Management](#response-management)
6. [Landlord View](#landlord-view)

## Marketplace Landing Page

### State: Default View
**Layout Structure**:
```css
.marketplace-landing {
  background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
  min-height: 100vh;
}

.hero-section {
  padding: 48px 24px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  line-height: 1.1;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
}

.hero-subtitle {
  font-size: 20px;
  color: #6B7280;
  margin-bottom: 32px;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: #6366F1;
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover {
  background: #4F46E5;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.btn-secondary {
  background: white;
  color: #6366F1;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #6366F1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #EEF2FF;
}
```

### State: Success Banner
**Visual Specifications**:
```css
.success-banner {
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 500;
}

.success-icon {
  width: 24px;
  height: 24px;
  animation: celebrate 0.5s ease;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

.success-text {
  font-size: 16px;
}

.success-number {
  font-weight: 700;
  font-size: 18px;
}
```

### State: Sample Posts Grid
**Layout Structure**:
```css
.sample-posts-section {
  padding: 48px 24px;
  background: #FFFFFF;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: #6B7280;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
```

## Post Creation Wizard

### State: Step Progress Indicator
**Visual Specifications**:
```css
.wizard-progress {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 100;
}

.progress-step {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step-number.active {
  background: #6366F1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.step-number.completed {
  background: #10B981;
  color: white;
}

.step-number.completed::after {
  content: '✓';
  position: absolute;
  font-size: 16px;
}

.step-label {
  margin-left: 12px;
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.step-label.active {
  color: #111827;
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 12px;
}

.step-connector.completed {
  background: #10B981;
}
```

### State: Form Container
**Layout Structure**:
```css
.wizard-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  min-height: calc(100vh - 200px);
}

.wizard-form {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-section {
  margin-bottom: 32px;
}

.form-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.form-section-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

### State: Budget Range Input
**Visual Specifications**:
```css
.budget-range-input {
  position: relative;
}

.budget-slider {
  margin: 24px 0;
}

.slider-track {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  position: relative;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: 3px;
  position: absolute;
  transition: width 0.2s ease;
}

.slider-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border: 3px solid #6366F1;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.slider-thumb:active {
  cursor: grabbing;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.budget-values {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.budget-min,
.budget-max {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.budget-currency {
  font-size: 14px;
  color: #6B7280;
}
```

### State: Area Selection Map
**Visual Specifications**:
```css
.area-selection {
  position: relative;
}

.map-container {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
  position: relative;
}

.map-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.selected-areas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.area-tag {
  background: #EEF2FF;
  color: #6366F1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.area-tag-remove {
  width: 16px;
  height: 16px;
  background: #6366F1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.area-tag-remove:hover {
  background: #4F46E5;
}
```

## Post Card Components

### State: Default Post Card
**Visual Specifications**:
```css
.post-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tenant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tenant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.tenant-details {
  flex: 1;
}

.tenant-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.tenant-occupation {
  font-size: 14px;
  color: #6B7280;
}

.post-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-verified {
  background: #D1FAE5;
  color: #065F46;
}

.badge-urgent {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-new {
  background: #DBEAFE;
  color: #1E40AF;
}
```

### State: Post Content
**Visual Specifications**:
```css
.post-content {
  margin-bottom: 16px;
}

.budget-display {
  font-size: 24px;
  font-weight: 700;
  color: #6366F1;
  margin-bottom: 12px;
}

.post-requirements {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4B5563;
}

.requirement-icon {
  width: 20px;
  height: 20px;
  color: #9CA3AF;
}

.post-description {
  font-size: 14px;
  line-height: 1.5;
  color: #4B5563;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.post-tag {
  padding: 4px 8px;
  background: #F3F4F6;
  border-radius: 6px;
  font-size: 12px;
  color: #6B7280;
}
```

### State: Post Actions
**Visual Specifications**:
```css
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.post-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6B7280;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.post-action-btn {
  padding: 10px 20px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-action-btn:hover {
  background: #4F46E5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}
```

## Post Management Dashboard

### State: Dashboard Overview
**Layout Structure**:
```css
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.metric-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.metric-change {
  font-size: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #10B981;
}

.metric-change.negative {
  color: #EF4444;
}
```

### State: Active Post Preview
**Visual Specifications**:
```css
.active-post-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
}

.post-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}

.status-dot.active {
  background: #10B981;
}

.status-dot.paused {
  background: #F59E0B;
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.post-quality-score {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 20px auto;
}

.score-circle {
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  animation: fillCircle 1s ease forwards;
}

@keyframes fillCircle {
  to {
    stroke-dashoffset: calc(314 - (314 * var(--score)) / 100);
  }
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}
```

## Response Management

### State: Response Inbox
**Layout Structure**:
```css
.response-inbox {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.inbox-header {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inbox-filters {
  display: flex;
  gap: 12px;
}

.filter-btn {
  padding: 8px 16px;
  background: #F3F4F6;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #6366F1;
  color: white;
}

.response-list {
  max-height: 600px;
  overflow-y: auto;
}

.response-item {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.response-item:hover {
  background: #F9FAFB;
}

.response-item.unread {
  background: #EFF6FF;
  border-left: 4px solid #6366F1;
}

.response-item.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #6366F1;
  border-radius: 50%;
}
```

### State: Response Details Modal
**Visual Specifications**:
```css
.response-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.response-modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.landlord-profile {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 16px;
}

.landlord-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.landlord-info {
  flex: 1;
}

.landlord-name {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.landlord-properties {
  font-size: 14px;
  color: #6B7280;
}

.property-offers {
  padding: 24px;
}

.offer-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.offer-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.offer-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.offer-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 14px;
  color: #4B5563;
}

.response-actions {
  padding: 20px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

## Landlord View

### State: Marketplace Browse
**Visual Specifications**:
```css
.landlord-marketplace {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 1024px) {
  .landlord-marketplace {
    grid-template-columns: 1fr;
  }
}

.filters-sidebar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.results-section {
  min-height: 100vh;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.results-count {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.sort-dropdown {
  padding: 10px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #4B5563;
  cursor: pointer;
}

.match-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.match-percentage {
  font-size: 14px;
  font-weight: 700;
}
```

## Responsive Behavior

### Mobile Adaptations (320-767px)
```css
@media (max-width: 767px) {
  .wizard-progress {
    display: none;
  }
  
  .mobile-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .mobile-step-indicator {
    font-size: 14px;
    font-weight: 600;
    color: #6B7280;
  }
  
  .posts-grid {
    padding: 16px;
  }
  
  .post-card {
    border-radius: 12px;
  }
  
  .dashboard-container {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
```

### Tablet Adaptations (768-1023px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .landlord-marketplace {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    position: static;
    margin-bottom: 24px;
  }
}
```

### Desktop Optimizations (1024px+)
```css
@media (min-width: 1024px) {
  .post-card:hover .post-preview {
    display: block;
  }
  
  .post-preview {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    margin-left: 16px;
    width: 400px;
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }
  
  .keyboard-shortcuts {
    display: block;
  }
}
```

## Related Documentation
- [User Journey Documentation](./user-journey.md)
- [Interaction Specifications](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)