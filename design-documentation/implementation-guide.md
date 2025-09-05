# HEUREKKA Implementation Guide for Developers
## Frontend Development Specifications

---

## Overview

This guide provides development-ready specifications for implementing the HEUREKKA design system using Next.js 14+, TailwindCSS, shadcn/ui, and Supabase. All measurements, colors, and interactions are specified for direct implementation.

## Quick Start

### Design Token Setup

#### 1. TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          darker: '#1E40AF',
          light: '#DBEAFE',
          pale: '#EFF6FF',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          darker: '#075E54',
          light: '#DCF8C6',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.12)',
        'whatsapp': '0 2px 8px rgba(37, 211, 102, 0.3)',
        'whatsapp-lg': '0 4px 12px rgba(37, 211, 102, 0.4)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

#### 2. CSS Variables
```css
/* app/globals.css */
@layer base {
  :root {
    /* Colors */
    --primary: 37 99 235;
    --primary-foreground: 255 255 255;
    
    /* Spacing */
    --space-unit: 0.25rem;
    
    /* Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;
    
    /* Transitions */
    --transition-fast: 150ms;
    --transition-base: 200ms;
    --transition-slow: 300ms;
    
    /* Z-index */
    --z-dropdown: 10;
    --z-sticky: 20;
    --z-overlay: 30;
    --z-modal: 40;
    --z-toast: 50;
  }
}
```

---

## Component Implementation

### Button Component
```tsx
// components/ui/button.tsx
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-darker disabled:bg-neutral-200 disabled:text-neutral-400',
    secondary: 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
    ghost: 'bg-transparent text-primary hover:bg-primary-pale active:bg-primary-light',
    whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-dark active:bg-whatsapp-darker',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-10 px-5 text-sm md:h-12 md:px-6 md:text-base',
    lg: 'h-12 px-6 text-base md:h-14 md:px-8 md:text-lg',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
```

### Property Card Component
```tsx
// components/property-card.tsx
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    area: number
    images: string[]
  }
  isFavorited?: boolean
  onFavorite?: () => void
  onContact?: () => void
}

export function PropertyCard({
  property,
  isFavorited = false,
  onFavorite,
  onContact,
}: PropertyCardProps) {
  return (
    <article 
      className="group bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      aria-label={`Property: ${property.title}`}
    >
      {/* Image Gallery */}
      <div className="relative aspect-video bg-neutral-100">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
          1/{property.images.length}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price & Favorite */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              L.{property.price.toLocaleString()}/mes
            </p>
          </div>
          <button
            onClick={onFavorite}
            className="p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorited}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorited ? "fill-error text-error" : "text-neutral-400"
              )} 
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-neutral-900 line-clamp-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-neutral-600 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{property.location}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 text-neutral-500 text-sm">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            {property.area}m²
          </span>
        </div>

        {/* CTA */}
        <Button 
          variant="whatsapp" 
          size="md"
          className="w-full"
          onClick={onContact}
        >
          <WhatsAppIcon className="mr-2 h-5 w-5" />
          Contact via WhatsApp
        </Button>
      </div>
    </article>
  )
}
```

### Mobile Navigation Component
```tsx
// components/mobile-nav.tsx
import { Home, Search, Heart, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Search' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white border-t border-neutral-200">
      <div className="grid grid-cols-4 h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-neutral-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## Responsive Layout Patterns

### Container Component
```tsx
// components/container.tsx
export function Container({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
      className
    )}>
      {children}
    </div>
  )
}
```

### Grid Layout
```tsx
// Property grid responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
  {properties.map((property) => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>
```

### Split View Layout
```tsx
// Desktop split view for explore page
<div className="flex h-[calc(100vh-64px)]">
  {/* Filters Sidebar */}
  <aside className="hidden lg:block w-80 border-r border-neutral-200 overflow-y-auto">
    <Filters />
  </aside>
  
  {/* Map and List Split */}
  <div className="flex-1 flex">
    <div className="flex-1 relative">
      <Map />
    </div>
    <div className="w-96 border-l border-neutral-200 overflow-y-auto">
      <PropertyList />
    </div>
  </div>
</div>
```

---

## Form Implementation

### Search Profile Form
```tsx
// components/forms/search-profile-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid phone format (9999-9999)'),
  budgetMin: z.number().min(3000, 'Minimum budget is L.3,000'),
  budgetMax: z.number().max(100000, 'Maximum budget is L.100,000'),
  moveDate: z.date().min(new Date(), 'Move date must be in the future'),
  areas: z.array(z.string()).min(1, 'Select at least one area'),
  propertyTypes: z.array(z.string()).min(1, 'Select at least one property type'),
})

export function SearchProfileForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      budgetMin: 10000,
      budgetMax: 15000,
      moveDate: null,
      areas: [],
      propertyTypes: ['apartment'],
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          {...form.register('name')}
          type="text"
          className="mt-1 block w-full h-12 px-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          aria-required="true"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-error" role="alert">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Phone Field with Format */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
          Phone Number <span className="text-error">*</span>
        </label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-sm">
            +504
          </span>
          <input
            {...form.register('phone')}
            type="tel"
            placeholder="9999-9999"
            className="flex-1 h-12 px-4 border border-neutral-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary"
            aria-required="true"
          />
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Monthly Budget (Lempiras) <span className="text-error">*</span>
        </label>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div>
            <input
              {...form.register('budgetMin', { valueAsNumber: true })}
              type="number"
              placeholder="Min"
              className="block w-full h-12 px-4 border border-neutral-300 rounded-lg"
            />
          </div>
          <div>
            <input
              {...form.register('budgetMax', { valueAsNumber: true })}
              type="number"
              placeholder="Max"
              className="block w-full h-12 px-4 border border-neutral-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" size="lg" className="w-full">
        Create Profile
      </Button>
    </form>
  )
}
```

---

## State Management with Zustand

### Store Setup
```typescript
// stores/use-property-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PropertyStore {
  // State
  favorites: string[]
  searchFilters: {
    minPrice: number
    maxPrice: number
    bedrooms: number[]
    neighborhoods: string[]
  }
  viewMode: 'list' | 'map'
  
  // Actions
  toggleFavorite: (propertyId: string) => void
  setSearchFilters: (filters: Partial<PropertyStore['searchFilters']>) => void
  setViewMode: (mode: 'list' | 'map') => void
  resetFilters: () => void
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set) => ({
      favorites: [],
      searchFilters: {
        minPrice: 0,
        maxPrice: 100000,
        bedrooms: [],
        neighborhoods: [],
      },
      viewMode: 'list',
      
      toggleFavorite: (propertyId) =>
        set((state) => ({
          favorites: state.favorites.includes(propertyId)
            ? state.favorites.filter((id) => id !== propertyId)
            : [...state.favorites, propertyId],
        })),
      
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      resetFilters: () =>
        set({
          searchFilters: {
            minPrice: 0,
            maxPrice: 100000,
            bedrooms: [],
            neighborhoods: [],
          },
        }),
    }),
    {
      name: 'property-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)
```

---

## API Integration with TanStack Query

### Query Setup
```typescript
// hooks/use-properties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .gte('price', filters.minPrice)
        .lte('price', filters.maxPrice)
      
      if (filters.bedrooms.length > 0) {
        query = query.in('bedrooms', filters.bedrooms)
      }
      
      if (filters.neighborhoods.length > 0) {
        query = query.in('neighborhood', filters.neighborhoods)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profile: ProfileData) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
```

---

## Performance Optimizations

### Image Optimization
```tsx
// components/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

export function OptimizedImage({ src, alt, ...props }) {
  const [isLoading, setLoading] = useState(true)

  return (
    <div className="relative overflow-hidden bg-neutral-100">
      <Image
        src={src}
        alt={alt}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={() => setLoading(false)}
        {...props}
      />
    </div>
  )
}
```

### Lazy Loading
```tsx
// components/lazy-load.tsx
import { useInView } from 'react-intersection-observer'

export function LazyLoad({ children, fallback }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div ref={ref}>
      {inView ? children : fallback}
    </div>
  )
}
```

### Virtual Scrolling
```tsx
// components/virtual-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualPropertyList({ properties }) {
  const parentRef = useRef()
  
  const virtualizer = useVirtualizer({
    count: properties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PropertyCard property={properties[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Testing Guidelines

### Component Testing
```typescript
// __tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
```

### Accessibility Testing
```typescript
// __tests__/a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('PropertyCard should be accessible', async () => {
  const { container } = render(<PropertyCard property={mockProperty} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All components responsive at 320px minimum
- [ ] Touch targets 48×48px minimum
- [ ] Images optimized and lazy loaded
- [ ] Accessibility audit passed
- [ ] Performance budget met (<100 Lighthouse score)
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Offline fallbacks configured

### Production Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}
```

---

*Implementation Guide Version: 1.0.0 | Last Updated: September 4, 2025*