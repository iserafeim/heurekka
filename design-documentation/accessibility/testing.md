---
title: Accessibility Testing Procedures
description: Comprehensive testing procedures and checklists for accessibility compliance
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./guidelines.md
  - ./compliance.md
  - ./README.md
status: approved
---

# Accessibility Testing Procedures

## Overview
Complete testing procedures, tools, and checklists to ensure Heurekka meets WCAG 2.1 AA standards and provides an inclusive experience for all users.

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Screen Reader Testing](#screen-reader-testing)
5. [Keyboard Testing](#keyboard-testing)
6. [Visual Testing](#visual-testing)
7. [Cognitive Testing](#cognitive-testing)
8. [Mobile Accessibility](#mobile-accessibility)
9. [Testing Tools](#testing-tools)
10. [Reporting & Remediation](#reporting--remediation)

## Testing Strategy

### Testing Phases
1. **Development Testing**: Continuous testing during development
2. **Integration Testing**: Testing complete features
3. **Regression Testing**: Ensuring fixes don't break existing functionality
4. **User Acceptance Testing**: Testing with actual users including those with disabilities
5. **Production Monitoring**: Ongoing monitoring of live application

### Testing Coverage
- **WCAG 2.1 Level AA**: All success criteria
- **Section 508**: US federal compliance
- **ADA**: Americans with Disabilities Act compliance
- **EN 301 549**: European accessibility standard

### Testing Frequency
- **Daily**: Automated testing in CI/CD pipeline
- **Sprint**: Manual testing of new features
- **Release**: Full accessibility audit
- **Quarterly**: Third-party accessibility review

## Automated Testing

### CI/CD Integration
```yaml
# GitHub Actions workflow
name: Accessibility Testing
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run axe-core tests
        run: npm run test:a11y
      
      - name: Run Pa11y tests
        run: npm run test:pa11y
      
      - name: Generate accessibility report
        run: npm run a11y:report
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: accessibility-report
          path: reports/accessibility/
```

### Axe-Core Testing
```javascript
// Jest test example
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have any accessibility violations on homepage', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should not have violations in property search', async () => {
    const { container } = render(<PropertySearch />);
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'label': { enabled: true },
        'aria-roles': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });
});
```

### Pa11y Configuration
```javascript
// .pa11yrc.json
{
  "defaults": {
    "timeout": 30000,
    "wait": 2000,
    "standard": "WCAG2AA",
    "runners": ["axe", "htmlcs"],
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": [
    {
      "url": "http://localhost:3000",
      "actions": [
        "wait for element .main-content to be visible"
      ]
    },
    {
      "url": "http://localhost:3000/properties",
      "actions": [
        "wait for element .property-grid to be visible",
        "click element .filter-button",
        "wait for element .filter-panel to be visible"
      ]
    }
  ]
}
```

### Lighthouse CI
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/properties',
        'http://localhost:3000/profile'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['accessibility']
      }
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'aria-allowed-attr': 'error',
        'aria-hidden-body': 'error',
        'aria-required-attr': 'error',
        'aria-roles': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'color-contrast': ['error', { minScore: 0.95 }],
        'document-title': 'error',
        'duplicate-id': 'error',
        'heading-order': 'warn',
        'html-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'meta-viewport': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

## Manual Testing

### Manual Testing Checklist

#### Page Structure
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Semantic HTML elements used correctly
- [ ] Landmarks properly defined (header, main, footer, nav)
- [ ] Skip links present and functional
- [ ] Page title unique and descriptive
- [ ] Language attribute set correctly

#### Forms
- [ ] All inputs have associated labels
- [ ] Required fields clearly marked
- [ ] Field purpose clear from label
- [ ] Error messages associated with fields
- [ ] Form validation accessible
- [ ] Instructions provided before form
- [ ] Success messages announced

#### Images & Media
- [ ] Meaningful alt text for informative images
- [ ] Empty alt for decorative images
- [ ] Complex images have long descriptions
- [ ] Video captions available
- [ ] Audio transcripts provided
- [ ] Auto-play disabled or controllable

#### Interactive Elements
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Touch targets minimum 44×44px
- [ ] Hover content accessible via keyboard
- [ ] Drag functionality has alternatives
- [ ] Time limits adjustable or removable

#### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text)
- [ ] UI component contrast ≥ 3:1
- [ ] Information not conveyed by color alone
- [ ] Focus indicators meet contrast requirements
- [ ] Error states not just color-based

### Component Testing Matrix

| Component | Keyboard | Screen Reader | Touch | Color Contrast | Motion |
|-----------|----------|---------------|-------|----------------|---------|
| Navigation | ✓ Test tab order | ✓ Announce current page | ✓ 44px targets | ✓ 4.5:1 ratio | ✓ Reduce motion |
| Forms | ✓ Enter submits | ✓ Label association | ✓ Input sizing | ✓ Error contrast | ✓ No auto-advance |
| Modals | ✓ Focus trap | ✓ Role="dialog" | ✓ Close button size | ✓ Overlay contrast | ✓ Smooth open/close |
| Cards | ✓ Focusable | ✓ Read full content | ✓ Action targets | ✓ Text on images | ✓ Hover effects |
| Maps | ✓ Controls accessible | ✓ Text alternative | ✓ Zoom controls | ✓ Marker contrast | ✓ Pan smoothly |

## Screen Reader Testing

### Testing Protocol

#### NVDA (Windows)
```
1. Launch NVDA
2. Navigate to application
3. Test with Browse Mode (default)
   - Use H to navigate headings
   - Use K for links
   - Use F for form fields
   - Use T for tables
4. Test with Focus Mode
   - Use Tab to navigate
   - Test form interactions
5. Verify announcements
   - Live regions updating
   - Error messages announced
   - State changes communicated
```

#### JAWS (Windows)
```
1. Launch JAWS
2. Use Virtual PC Cursor
   - Navigate with arrow keys
   - Use quick navigation keys
3. Test Forms Mode
   - Automatic switching
   - Manual switching (Enter)
4. Verify verbosity settings
   - Test with beginner
   - Test with intermediate
   - Test with advanced
```

#### VoiceOver (macOS/iOS)
```
macOS:
1. Enable with Cmd+F5
2. Navigate with Control+Option+arrows
3. Use rotor (Control+Option+U)
4. Test gestures on trackpad

iOS:
1. Enable in Settings > Accessibility
2. Swipe right/left to navigate
3. Double-tap to activate
4. Use rotor gesture
5. Test with braille display
```

#### TalkBack (Android)
```
1. Enable with volume keys
2. Swipe right/left to navigate
3. Double-tap to activate
4. Use reading controls
5. Test with Switch Access
```

### Screen Reader Test Scripts

#### Homepage Navigation
```
1. Load homepage
2. Verify page title announced
3. Navigate to main content (skip link)
4. Read all headings (H key)
5. Navigate through navigation menu
6. Test search functionality
7. Verify hero content readable
8. Check footer links accessible
```

#### Property Search Flow
```
1. Navigate to search page
2. Complete search form
   - Enter location
   - Set price range
   - Select property type
3. Submit search
4. Verify results announced
5. Navigate through results
6. Test filter panel
7. Open property details
8. Test favorite/compare actions
```

## Keyboard Testing

### Keyboard Navigation Map
```
Tab Order:
1. Skip to main content
2. Logo/Home
3. Main navigation items
4. Search bar
5. User menu
6. Main content area
7. Interactive elements (in order)
8. Footer navigation
9. Footer links
```

### Keyboard Shortcuts
```javascript
// Global shortcuts
Ctrl/Cmd + K: Focus search
Ctrl/Cmd + /: Open help
Escape: Close modal/dialog
Enter: Activate focused element
Space: Toggle selection
Arrow keys: Navigate within components

// Custom shortcuts
M: Toggle map view
F: Toggle filters
G then H: Go home
G then P: Go to properties
G then S: Go to saved searches
```

### Keyboard Testing Checklist
- [ ] Tab through entire page
- [ ] Shift+Tab reverses direction
- [ ] No keyboard traps
- [ ] Skip links work
- [ ] All interactive elements reachable
- [ ] Custom widgets keyboard accessible
- [ ] Keyboard shortcuts documented
- [ ] Keyboard shortcuts don't conflict
- [ ] Focus never lost
- [ ] Focus order logical

## Visual Testing

### Browser Testing Matrix
| Browser | Zoom 200% | High Contrast | Dark Mode | Reader Mode |
|---------|-----------|---------------|-----------|-------------|
| Chrome | ✓ | ✓ Windows | ✓ | ✓ |
| Firefox | ✓ | ✓ | ✓ | ✓ |
| Safari | ✓ | ✓ macOS | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ | ✓ |

### Color Blindness Testing
```javascript
// Simulate different types
const colorBlindnessTypes = [
  'protanopia',    // Red-blind
  'protanomaly',   // Red-weak
  'deuteranopia',  // Green-blind
  'deuteranomaly', // Green-weak
  'tritanopia',    // Blue-blind
  'tritanomaly',   // Blue-weak
  'achromatomaly', // Color weakness
  'achromatopsia'  // Complete color blindness
];

// Test with each type
colorBlindnessTypes.forEach(type => {
  // Apply filter
  document.body.style.filter = getColorBlindnessFilter(type);
  // Verify UI still understandable
  // Check that information is perceivable
});
```

### Zoom Testing Procedure
```
1. Set browser zoom to 200%
2. Verify no horizontal scroll at 1280px width
3. Check text remains readable
4. Verify layout doesn't break
5. Test at 400% for text-only zoom
6. Verify reflow works properly
7. Check images scale appropriately
8. Test form fields remain usable
```

## Cognitive Testing

### Cognitive Load Assessment
```
1. Task Complexity
   - Can tasks be completed in <3 steps?
   - Are complex tasks broken down?
   - Is help readily available?

2. Memory Requirements
   - Is important information persistent?
   - Are there memory aids?
   - Can users save progress?

3. Attention Management
   - Is focus clearly directed?
   - Are distractions minimized?
   - Is important information highlighted?

4. Error Recovery
   - Are errors clearly explained?
   - Can users easily fix mistakes?
   - Is destructive action reversible?

5. Language Clarity
   - Is language simple and clear?
   - Are technical terms explained?
   - Is text concise?
```

### User Testing with Cognitive Disabilities
```
Participants: 5-8 users with various cognitive disabilities

Tasks:
1. Find a property in specific area
2. Save a search
3. Contact an agent
4. Compare properties
5. Understand property details

Metrics:
- Task completion rate
- Time to complete
- Error frequency
- Help usage
- Satisfaction rating

Observations:
- Points of confusion
- Abandoned tasks
- Requests for help
- Emotional responses
```

## Mobile Accessibility

### Touch Testing Checklist
- [ ] Touch targets ≥ 44×44px (iOS) / 48×48dp (Android)
- [ ] Adequate spacing between targets
- [ ] Gestures have alternatives
- [ ] No hover-only functionality
- [ ] Pinch-zoom not disabled
- [ ] Screen rotation supported
- [ ] Text scalable to 200%
- [ ] Inputs appropriate type

### Mobile Screen Reader Testing
```
iOS VoiceOver:
1. One-finger swipe: Navigate
2. Double-tap: Activate
3. Three-finger swipe: Scroll
4. Two-finger rotate: Rotor
5. Two-finger scrub: Go back

Android TalkBack:
1. Swipe right/left: Navigate
2. Double-tap: Activate
3. Two-finger swipe: Scroll
4. Swipe up-then-right: Global gesture
5. Two-finger swipe down: Reading controls
```

## Testing Tools

### Browser Extensions
```
Chrome/Firefox:
- axe DevTools
- WAVE (WebAIM)
- Lighthouse
- Accessibility Insights
- ChromeLens
- ColorZilla
- HeadingsMap
- Landmarks
- ARIA DevTools
```

### Desktop Applications
```
Screen Readers:
- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (macOS, built-in)
- Orca (Linux, free)

Testing Tools:
- Accessibility Insights for Windows
- Colour Contrast Analyser
- Screen Reader Testing Tool
```

### Command Line Tools
```bash
# Pa11y
pa11y https://example.com

# axe-cli
axe https://example.com

# Lighthouse CLI
lighthouse https://example.com --only-categories=accessibility

# WAVE CLI
wave-cli https://example.com
```

### Automated Testing Services
```
- Deque axe Monitor
- Siteimprove
- Level Access AMP
- UsableNet AQA
- AudioEye
- accessiBe
```

## Reporting & Remediation

### Issue Severity Levels
```
Critical (P0):
- Blocks access to content
- Prevents task completion
- Legal compliance risk
- Fix immediately

High (P1):
- Significant barrier
- Workaround difficult
- Poor user experience
- Fix within sprint

Medium (P2):
- Moderate impact
- Workaround available
- Inconvenient
- Fix within release

Low (P3):
- Minor issue
- Best practice
- Enhancement
- Fix when possible
```

### Issue Tracking Template
```markdown
## Accessibility Issue

**Issue ID**: A11Y-2024-001
**Severity**: High (P1)
**WCAG Criterion**: 1.4.3 Contrast (Minimum)
**Component**: Button - Primary
**Page/URL**: /properties/search

### Description
Primary button text (#6B7280) on white background (#FFFFFF) has contrast ratio of 3.5:1, below the required 4.5:1 for normal text.

### Steps to Reproduce
1. Navigate to property search page
2. Locate "Apply Filters" button
3. Test with color contrast analyzer

### Expected Result
Text contrast ratio should be at least 4.5:1

### Actual Result
Text contrast ratio is 3.5:1

### Impact
Users with low vision may have difficulty reading button text

### Proposed Solution
Change text color to #4B5563 (contrast ratio 7.1:1)

### Testing Notes
- Test in multiple browsers
- Verify in high contrast mode
- Check hover/focus states

### Resources
- [WCAG 1.4.3 Understanding](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
```

### Remediation Process
```
1. Identify: Automated scan + manual review
2. Prioritize: Assign severity level
3. Document: Create detailed issue report
4. Assign: Route to appropriate team
5. Fix: Implement solution
6. Test: Verify fix works
7. Validate: Retest with tools
8. Document: Update test results
9. Monitor: Prevent regression
```

### Accessibility Report Template
```markdown
# Accessibility Audit Report

**Date**: January 2024
**Scope**: Full application
**Standard**: WCAG 2.1 Level AA

## Executive Summary
- Total issues found: 47
- Critical: 2
- High: 8
- Medium: 15
- Low: 22

## Compliance Score
- Overall: 91%
- Perceivable: 88%
- Operable: 93%
- Understandable: 92%
- Robust: 91%

## Critical Issues
1. Missing alt text on property images
2. Keyboard trap in map component

## Recommendations
1. Implement automated testing in CI/CD
2. Conduct regular manual audits
3. Train developers on accessibility
4. Include users with disabilities in testing

## Next Steps
- Fix critical issues immediately
- Schedule high priority fixes
- Plan accessibility training
- Implement monitoring tools
```

## Related Documentation
- [Accessibility Guidelines](./guidelines.md)
- [WCAG Compliance](./compliance.md)
- [Component Accessibility](../design-system/components/)
- [Feature Accessibility](../features/)