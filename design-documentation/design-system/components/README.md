# HEUREKKA Component Library
## Reusable UI Component Specifications

---

## Overview

This component library defines the building blocks of the HEUREKKA interface. Each component is designed for reusability, accessibility, and mobile-first implementation. Components follow the shadcn/ui pattern for easy integration with Next.js and TailwindCSS.

## Component Categories

### 1. [Buttons](./buttons.md)
- Primary Button
- WhatsApp Button
- Secondary Button
- Ghost Button
- Icon Button
- Loading States

### 2. [Forms](./forms.md)
- Text Input
- Select Dropdown
- Checkbox/Radio
- Range Slider
- File Upload
- Form Groups

### 3. [Navigation](./navigation.md)
- Mobile Bottom Nav
- Desktop Header
- Breadcrumbs
- Tabs
- Pagination
- Filters

### 4. [Cards](./cards.md)
- Property Card
- Lead Card
- Dashboard Card
- Stat Card
- Empty State Card

### 5. [Modals](./modals.md)
- Standard Modal
- Bottom Sheet
- Confirmation Dialog
- Image Gallery
- Form Modal

### 6. [Feedback](./feedback.md)
- Toast Notifications
- Loading Spinners
- Skeleton Screens
- Progress Bars
- Empty States
- Error States

## Component Architecture

### Composition Pattern
```tsx
// Example component composition
<Card>
  <CardHeader>
    <CardTitle>Property Title</CardTitle>
    <CardDescription>Property details</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Contact</Button>
  </CardFooter>
</Card>
```

### Variant System
All components support a variant prop for different visual styles:
- `default` - Standard appearance
- `primary` - Primary brand color
- `secondary` - Secondary style
- `ghost` - Minimal style
- `destructive` - Error/delete actions
- `success` - Success states

### Size System
Components support standardized sizes:
- `xs` - Extra small (mobile minimum)
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

## Mobile-First Considerations

### Touch Targets
- Minimum 48×48px for all interactive elements
- 8px minimum spacing between targets
- Increased padding on mobile breakpoints

### Gesture Support
- Swipeable carousels and galleries
- Pull-to-refresh on lists
- Long-press for additional options
- Pinch-to-zoom on images

### Performance
- Lazy loading for off-screen content
- Virtualized lists for long content
- Optimistic UI updates
- Debounced search inputs

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Focus indicators visible
- Escape key handling for dismissible elements

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for dynamic content
- Role attributes where needed

### Visual Accessibility
- 4.5:1 contrast ratio minimum
- Focus indicators with 3:1 contrast
- Error states not relying on color alone
- Consistent iconography with labels

## Implementation Guidelines

### Import Pattern
```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

### Styling with Tailwind
```tsx
<Button 
  className="w-full md:w-auto" 
  variant="primary"
  size="lg"
>
  Contact via WhatsApp
</Button>
```

### Responsive Behavior
```tsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Component grid */}
</div>
```

## Component Status

| Component | Status | Mobile Optimized | Accessibility |
|-----------|--------|-----------------|---------------|
| Button | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Input | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Select | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Card | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Modal | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Navigation | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Toast | ✅ Ready | ✅ Yes | ✅ WCAG AA |
| Skeleton | ✅ Ready | ✅ Yes | ✅ WCAG AA |

## Testing Requirements

### Unit Tests
- Component renders correctly
- Props affect output as expected
- Event handlers fire correctly
- Accessibility attributes present

### Integration Tests
- Components work together
- Form submission flows
- Navigation interactions
- Modal/overlay behaviors

### Visual Regression
- Component appearance consistent
- Responsive breakpoints work
- Theme variations render correctly
- Animation states captured

---

*For detailed specifications of each component, see the individual component documentation files.*