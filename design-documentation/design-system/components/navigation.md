---
title: Navigation Components
description: Complete specifications for navigation patterns and components
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ../style-guide.md
  - ../tokens/spacing.md
  - ./modals.md
status: approved
---

# Navigation Components

## Overview
Comprehensive navigation component specifications including headers, menus, breadcrumbs, and mobile navigation patterns.

## Table of Contents
1. [Primary Navigation](#primary-navigation)
2. [Mobile Navigation](#mobile-navigation)
3. [Breadcrumbs](#breadcrumbs)
4. [Tab Navigation](#tab-navigation)
5. [Sidebar Navigation](#sidebar-navigation)
6. [Pagination](#pagination)
7. [Footer Navigation](#footer-navigation)

## Primary Navigation

### Desktop Header Navigation
**Component**: MainNavigation
**Variants**: Default, Sticky, Transparent
**States**: Default, Scrolled, Search-Active

**Visual Specifications**:
```css
/* Container */
.main-navigation {
  height: 72px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;
}

.main-navigation.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.main-navigation.transparent {
  background: transparent;
  border-bottom: none;
}

/* Logo */
.nav-logo {
  height: 40px;
  width: auto;
  display: flex;
  align-items: center;
}

/* Navigation Items */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 100%;
}

.nav-item {
  font-size: 16px;
  font-weight: 500;
  color: #4B5563;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  color: #6366F1;
  background: rgba(99, 102, 241, 0.05);
}

.nav-item.active {
  color: #6366F1;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -25px;
  left: 12px;
  right: 12px;
  height: 3px;
  background: #6366F1;
  border-radius: 3px 3px 0 0;
}

/* Dropdown Menu */
.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 240px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.nav-item:hover .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  padding: 12px 20px;
  color: #4B5563;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #F3F4F6;
  color: #6366F1;
  padding-left: 24px;
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-badge {
  position: relative;
}

.notification-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #EF4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
```

**Interaction Specifications**:
```javascript
// Scroll behavior
on:scroll {
  if (scrollY > 100) {
    navigation.classList.add('scrolled');
    navigation.style.height = '64px';
  } else {
    navigation.classList.remove('scrolled');
    navigation.style.height = '72px';
  }
}

// Dropdown interaction
.nav-item {
  on:mouseenter {
    clearTimeout(closeTimer);
    openDropdown(this);
  }
  
  on:mouseleave {
    closeTimer = setTimeout(() => {
      closeDropdown(this);
    }, 200);
  }
}

// Search activation
.search-trigger {
  on:click {
    navigation.classList.add('search-active');
    searchOverlay.show();
    searchInput.focus();
  }
}
```

## Mobile Navigation

### Hamburger Menu
**Component**: MobileNavigation
**Variants**: Slide-in, Full-screen, Bottom-sheet
**States**: Closed, Opening, Open, Closing

**Visual Specifications**:
```css
/* Hamburger Button */
.hamburger-button {
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: #1A1A1A;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Active state animation */
.hamburger-button.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-button.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: translateX(-10px);
}

.hamburger-button.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Menu Panel */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu.open {
  transform: translateX(0);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Mobile Menu Items */
.mobile-menu-header {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-menu-items {
  padding: 16px 0;
}

.mobile-menu-item {
  padding: 16px 20px;
  font-size: 16px;
  color: #1A1A1A;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease;
}

.mobile-menu-item:active {
  background: #F3F4F6;
}

.mobile-menu-item.active {
  color: #6366F1;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid #6366F1;
}

/* Submenu */
.mobile-submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-submenu.open {
  max-height: 500px;
}

.mobile-submenu-item {
  padding: 12px 20px 12px 40px;
  font-size: 15px;
  color: #6B7280;
}
```

**Touch Gestures**:
```javascript
// Swipe to close
let touchStartX = 0;
let currentX = 0;

mobileMenu.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

mobileMenu.addEventListener('touchmove', (e) => {
  currentX = e.touches[0].clientX;
  const diff = touchStartX - currentX;
  
  if (diff > 0) {
    mobileMenu.style.transform = `translateX(${-diff}px)`;
  }
});

mobileMenu.addEventListener('touchend', () => {
  const diff = touchStartX - currentX;
  
  if (diff > 100) {
    closeMenu();
  } else {
    mobileMenu.style.transform = 'translateX(0)';
  }
});
```

## Breadcrumbs

### Standard Breadcrumbs
**Component**: Breadcrumbs
**Variants**: Default, Collapsible, Icon-based
**States**: Default, Truncated, Mobile

**Visual Specifications**:
```css
.breadcrumbs {
  display: flex;
  align-items: center;
  padding: 16px 0;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: #6B7280;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.breadcrumb-link:hover {
  color: #6366F1;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #D1D5DB;
  user-select: none;
}

.breadcrumb-current {
  color: #1A1A1A;
  font-weight: 500;
}

/* Truncated breadcrumbs */
.breadcrumbs.truncated {
  .breadcrumb-item:not(:first-child):not(:last-child) {
    display: none;
  }
  
  .breadcrumb-ellipsis {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
  }
  
  .breadcrumb-ellipsis:hover {
    background: #F3F4F6;
    border-radius: 4px;
  }
}

/* Mobile breadcrumbs */
@media (max-width: 640px) {
  .breadcrumbs {
    font-size: 13px;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
```

## Tab Navigation

### Horizontal Tabs
**Component**: TabNavigation
**Variants**: Underline, Pill, Segmented
**States**: Default, Active, Disabled

**Visual Specifications**:
```css
/* Underline variant */
.tabs-underline {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  gap: 32px;
  position: relative;
}

.tab-underline {
  padding: 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
  position: relative;
  transition: color 0.2s ease;
  cursor: pointer;
}

.tab-underline:hover {
  color: #4B5563;
}

.tab-underline.active {
  color: #6366F1;
}

.tab-underline.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366F1;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { width: 0; }
  to { width: 100%; }
}

/* Pill variant */
.tabs-pill {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #F3F4F6;
  border-radius: 12px;
}

.tab-pill {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-pill:hover {
  color: #4B5563;
  background: rgba(255, 255, 255, 0.5);
}

.tab-pill.active {
  background: white;
  color: #6366F1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* Segmented variant */
.tabs-segmented {
  display: inline-flex;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  overflow: hidden;
}

.tab-segment {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border-right: 1px solid #E5E7EB;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-segment:last-child {
  border-right: none;
}

.tab-segment:hover {
  background: #F9FAFB;
}

.tab-segment.active {
  background: #6366F1;
  color: white;
}

/* Tab content */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollable tabs */
.tabs-scrollable {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #F3F4F6;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 2px;
  }
}
```

## Sidebar Navigation

### Vertical Navigation
**Component**: SidebarNavigation
**Variants**: Default, Collapsible, Nested
**States**: Expanded, Collapsed, Item-hover

**Visual Specifications**:
```css
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #E5E7EB;
  height: 100%;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.sidebar-nav {
  padding: 16px 12px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: #4B5563;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.sidebar-item:hover {
  background: #F3F4F6;
  color: #1A1A1A;
}

.sidebar-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: #6366F1;
  border-radius: 0 3px 3px 0;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.sidebar-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-badge {
  background: #EF4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Nested navigation */
.sidebar-submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.sidebar-submenu.open {
  max-height: 500px;
}

.sidebar-subitem {
  padding: 8px 16px 8px 48px;
  font-size: 14px;
  color: #6B7280;
}

.sidebar-subitem:hover {
  color: #6366F1;
  background: #F9FAFB;
}

/* Collapsed state */
.sidebar.collapsed {
  .sidebar-label,
  .sidebar-badge {
    opacity: 0;
    visibility: hidden;
  }
  
  .sidebar-item {
    justify-content: center;
    padding: 12px;
  }
  
  .sidebar-icon {
    margin-right: 0;
  }
  
  // Tooltip on hover
  .sidebar-item:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 100%;
    margin-left: 8px;
    background: #1A1A1A;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
  }
}
```

## Pagination

### Standard Pagination
**Component**: Pagination
**Variants**: Default, Simple, Load-more
**States**: Default, Active, Disabled

**Visual Specifications**:
```css
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 32px 0;
}

.pagination-item {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-item:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.pagination-item.active {
  background: #6366F1;
  color: white;
  border-color: #6366F1;
}

.pagination-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.pagination-ellipsis {
  padding: 0 8px;
  color: #9CA3AF;
  user-select: none;
}

/* Simple pagination */
.pagination-simple {
  display: flex;
  align-items: center;
  gap: 24px;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6366F1;
  background: white;
  border: 1px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover {
  background: #F0F1FF;
  border-color: #6366F1;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6B7280;
}

/* Load more */
.load-more {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.load-more-button {
  padding: 12px 32px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-button:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
  transform: translateY(-2px);
}

.load-more-button.loading {
  pointer-events: none;
  color: #9CA3AF;
}

.load-more-button.loading::after {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-left: 8px;
  border: 2px solid #D1D5DB;
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

## Footer Navigation

### Footer Links
**Component**: FooterNavigation
**Variants**: Multi-column, Single-row, Minimal
**States**: Default, Hover

**Visual Specifications**:
```css
.footer {
  background: #1A1A1A;
  color: white;
  padding: 64px 0 32px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-columns {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  font-size: 14px;
  color: #9CA3AF;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: white;
}

.footer-description {
  font-size: 14px;
  line-height: 1.6;
  color: #9CA3AF;
  margin-bottom: 20px;
}

.footer-social {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.social-icon:hover {
  background: #6366F1;
  transform: translateY(-2px);
}

.footer-divider {
  border: none;
  border-top: 1px solid #374151;
  margin: 48px 0 24px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #9CA3AF;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

/* Mobile footer */
@media (max-width: 768px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .footer-legal {
    flex-direction: column;
    gap: 12px;
  }
}
```

**Accessibility Considerations**:
- All navigation items keyboard accessible
- ARIA labels for icon-only items
- Focus indicators visible
- Logical tab order maintained
- Skip links for keyboard users
- Mobile gestures have button alternatives

**Usage Guidelines**:
- Use consistent navigation across pages
- Highlight current page/section
- Provide breadcrumbs for deep hierarchies
- Ensure touch targets meet minimum size (44x44px)
- Test navigation with keyboard only
- Consider mobile-first approach

**Implementation Notes**:
- Use semantic HTML (`<nav>`, `<ul>`, `<li>`)
- Implement proper ARIA attributes
- Ensure smooth animations (60fps)
- Lazy load dropdown content if heavy
- Cache navigation state in session storage
- Track navigation analytics events

## Related Documentation
- [Component Overview](./README.md)
- [Buttons](./buttons.md)
- [Forms](./forms.md)
- [Modals](./modals.md)
- [Accessibility Guidelines](../../accessibility/guidelines.md)