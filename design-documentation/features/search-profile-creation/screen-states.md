---
title: Search Profile Creation - Screen States
description: Complete screen state specifications for search profile creation feature
feature: search-profile-creation
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/forms.md
status: approved
---

# Search Profile Creation - Screen States

## Overview
Comprehensive documentation of all screen states for the search profile creation feature, including responsive layouts, visual specifications, and interaction states.

## Table of Contents
1. [Profile Creation Landing](#profile-creation-landing)
2. [Criteria Selection Form](#criteria-selection-form)
3. [Advanced Preferences](#advanced-preferences)
4. [Notification Settings](#notification-settings)
5. [Review & Confirmation](#review--confirmation)
6. [Profile Management Dashboard](#profile-management-dashboard)

## Profile Creation Landing

### State: Default
**Layout Structure**:
- Container: 1200px max-width, centered
- Grid: 12-column with 24px gutters
- Hero section: 480px height
- Content sections: 80px vertical spacing

**Visual Specifications**:
```css
/* Container */
background: linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%);
border-radius: 16px;
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
padding: 48px;

/* Hero Section */
.hero-title {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  line-height: 32px;
  color: #666666;
  margin-bottom: 32px;
}

/* CTA Button */
.cta-primary {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}
```

**Component Layout**:
- Feature cards: 3-column grid, 32px gap
- Each card: 360px width, 240px height
- Icon size: 48px
- Card padding: 32px

### State: Loading
**Visual Changes**:
- Skeleton screens for content areas
- Pulsing animation at 1.5s intervals
- Gradient animation: `linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%)`
- Maintain layout structure

### State: Error
**Visual Changes**:
- Error banner at top: 64px height
- Background: `#FEE2E2`
- Border: `2px solid #DC2626`
- Icon: 24px error icon with `#DC2626` color
- Retry button included

### State: Authenticated User
**Visual Changes**:
- Personalized greeting in hero
- Pre-filled user data indicators
- Quick-start options displayed
- Previous profiles section visible

## Criteria Selection Form

### State: Initial
**Layout Structure**:
- Form container: 800px max-width
- Two-column layout for desktop
- Single column for mobile (<768px)
- Section spacing: 48px

**Visual Specifications**:
```css
/* Form Container */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Form Sections */
.form-section {
  padding-bottom: 48px;
  border-bottom: 1px solid #E5E7EB;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.section-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 24px;
}

/* Input Fields */
.input-field {
  height: 48px;
  padding: 12px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Range Slider */
.range-slider {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
}

.range-thumb {
  width: 24px;
  height: 24px;
  background: #6366F1;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

### State: Partially Completed
**Visual Changes**:
- Completed sections: Checkmark indicator
- Current section: Highlighted border `#6366F1`
- Progress bar: 40% filled
- Auto-save indicator visible

### State: Validation Error
**Field-Level Errors**:
```css
.input-error {
  border-color: #DC2626;
  background: #FEF2F2;
}

.error-message {
  font-size: 14px;
  color: #DC2626;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### State: Location Selection Active
**Map Interface**:
- Map container: 100% width, 400px height
- Drawing tools overlay: Top-right position
- Selected area: Blue overlay with 0.3 opacity
- Radius indicator: Dashed border
- Location pins: Custom markers 32px size

## Advanced Preferences

### State: Collapsed
**Visual Specifications**:
```css
.advanced-section {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
}

.expand-icon {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}
```

### State: Expanded
**Visual Changes**:
- Container expands with animation (0.3s ease)
- Expand icon rotates 180deg
- Additional options fade in
- Section padding increases to 24px

**Filter Grid**:
```css
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.filter-chip {
  padding: 8px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip.selected {
  background: #6366F1;
  border-color: #6366F1;
  color: white;
}
```

## Notification Settings

### State: Default
**Layout**:
- Channel cards: Vertical stack
- Card spacing: 16px
- Toggle switches: Right-aligned
- Frequency selectors: Inline dropdowns

**Visual Specifications**:
```css
.notification-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.channel-icon {
  width: 40px;
  height: 40px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #E5E7EB;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
}

.toggle-switch.active {
  background: #6366F1;
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(24px);
}
```

### State: Channel Verification Required
**Visual Changes**:
- Warning banner: Yellow background `#FEF3C7`
- Verify button: Secondary style
- Disabled state for channel until verified
- Help text visible

## Review & Confirmation

### State: Summary View
**Layout Structure**:
- Two-column layout: 60/40 split
- Left: Criteria summary
- Right: Match preview
- Action buttons: Bottom fixed bar

**Visual Specifications**:
```css
.summary-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

.criteria-summary {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.summary-section {
  padding: 20px 0;
  border-bottom: 1px solid #E5E7EB;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.edit-button {
  color: #6366F1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.match-preview {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 24px;
}

.match-count {
  font-size: 48px;
  font-weight: 700;
  color: #6366F1;
  text-align: center;
}
```

### State: Saving
**Visual Changes**:
- Loading overlay with 0.8 opacity
- Spinner animation centered
- Progress message displayed
- Buttons disabled state

### State: Success
**Success Modal**:
```css
.success-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-title {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 16px;
}
```

## Profile Management Dashboard

### State: Active Profiles
**Layout**:
- Profile cards: 3-column grid
- Card dimensions: 360px × 280px
- Status indicators: Top-right corner
- Action menu: Bottom of card

**Visual Specifications**:
```css
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.status-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #D1FAE5;
  color: #059669;
}

.status-paused {
  background: #FEE2E2;
  color: #DC2626;
}

.profile-stats {
  display: flex;
  gap: 24px;
  margin: 16px 0;
  padding: 16px 0;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  margin-top: 4px;
}
```

### State: Empty State
**Visual Specifications**:
```css
.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-illustration {
  width: 240px;
  height: 180px;
  margin: 0 auto 32px;
}

.empty-title {
  font-size: 28px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.empty-description {
  font-size: 16px;
  color: #6B7280;
  max-width: 480px;
  margin: 0 auto 32px;
}

.empty-cta {
  background: #6366F1;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}
```

## Responsive Breakpoints

### Mobile (320-767px)
- Single column layouts
- Full-width forms
- Stacked navigation
- Simplified map controls
- Bottom sheet modals

### Tablet (768-1023px)
- Two-column forms
- Grid adjustments to 2 columns
- Side panel navigation
- Touch-optimized controls

### Desktop (1024px+)
- Full multi-column layouts
- Hover states enabled
- Keyboard shortcuts active
- Advanced features visible

## Animation Specifications

### Page Transitions
```css
/* Fade and slide */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for lists */
.stagger-item {
  animation: fadeSlideIn 0.4s ease;
  animation-fill-mode: both;
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
```

### Micro-interactions
- Button hover: Scale 1.02, 0.2s ease
- Input focus: Border color change, 0.2s ease
- Toggle switch: Transform translateX, 0.2s ease
- Card hover: Elevation change, 0.3s ease
- Success checkmark: Scale and rotate, 0.4s spring

## Related Documentation
- [User Journey Map](design-documentation/features/search-profile-creation/user-journey.md)
- [Interaction Patterns](design-documentation/features/search-profile-creation/interactions.md)
- [Implementation Guide](design-documentation/features/search-profile-creation/implementation.md)
- [Component Library](design-documentation/design-system/components)
