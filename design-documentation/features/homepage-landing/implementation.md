---
title: Homepage/Landing Page - Implementation Guide
description: Developer handoff documentation for implementing the homepage/landing page
feature: homepage-landing
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Homepage/Landing Page - Implementation Guide

## Overview
Complete technical implementation guide for developers building the HEUREKKA homepage/landing page, including component architecture, search functionality, performance optimization, and integration with property discovery and user onboarding flows.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Data Models](#data-models)
5. [Search Implementation](#search-implementation)
6. [Performance Optimization](#performance-optimization)
7. [SEO Implementation](#seo-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure
Homepage/
├── Homepage.tsx                     // Main container
├── components/
│   ├── Layout/
│   │   ├── Header.tsx              // Navigation header
│   │   ├── Footer.tsx              // Footer with links
│   │   └── SEOHead.tsx             // Meta tags management
│   ├── Hero/
│   │   ├── HeroSection.tsx         // Hero container
│   │   ├── HeroSearch.tsx          // Search component
│   │   ├── QuickSearchPills.tsx    // Quick search options
│   │   └── HeroBackground.tsx      // Background image/video
│   ├── Search/
│   │   ├── SearchBar.tsx           // Main search input
│   │   ├── SearchSuggestions.tsx   // Auto-complete dropdown
│   │   ├── SearchFilters.tsx       // Advanced filters
│   │   └── VoiceSearch.tsx         // Voice input support
│   ├── Content/
│   │   ├── ValueProposition.tsx    // Why HEUREKKA section
│   │   ├── HowItWorks.tsx         // Process explanation
│   │   ├── FeaturedProperties.tsx  // Property showcase
│   │   └── Testimonials.tsx        // Social proof
│   ├── PropertyCards/
│   │   ├── PropertyCard.tsx        // Individual property
│   │   ├── PropertyGallery.tsx     // Image carousel
│   │   ├── PropertyActions.tsx     // Save/Share buttons
│   │   └── PropertySkeleton.tsx    // Loading state
│   └── Common/
│       ├── Button.tsx               // Reusable button
│       ├── Modal.tsx                // Modal wrapper
│       ├── LoadingSpinner.tsx      // Loading indicator
│       └── ErrorBoundary.tsx       // Error handling
├── hooks/
│   ├── useSearch.ts                // Search logic
│   ├── useProperties.ts            // Property fetching
│   ├── useIntersectionObserver.ts  // Scroll animations
│   └── useMediaQuery.ts            // Responsive helpers
├── services/
│   ├── api.ts                      // API client
│   ├── analytics.ts                // Analytics tracking
│   └── cache.ts                    // Caching utilities
├── utils/
│   ├── constants.ts                // Configuration
│   ├── helpers.ts                  // Utility functions
│   └── validation.ts               // Input validation
└── styles/
    ├── homepage.module.css          // Component styles
    └── animations.css               // Animation keyframes
```

### Main Homepage Component
```typescript
// Homepage.tsx
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { SEOHead } from './components/Layout/SEOHead';
import { Header } from './components/Layout/Header';
import { HeroSection } from './components/Hero/HeroSection';
import { LoadingSpinner } from './components/Common/LoadingSpinner';

// Lazy load below-the-fold components
const ValueProposition = lazy(() => 
  import('./components/Content/ValueProposition')
);
const HowItWorks = lazy(() => 
  import('./components/Content/HowItWorks')
);
const FeaturedProperties = lazy(() => 
  import('./components/Content/FeaturedProperties')
);
const Testimonials = lazy(() => 
  import('./components/Content/Testimonials')
);
const Footer = lazy(() => 
  import('./components/Layout/Footer')
);

interface HomepageProps {
  initialProperties?: Property[];
  userLocation?: Location;
}

export const Homepage: React.FC<HomepageProps> = ({
  initialProperties,
  userLocation
}) => {
  return (
    <ErrorBoundary>
      <SEOHead />
      <div className="homepage-container">
        <Header />
        
        <main role="main">
          <HeroSection 
            userLocation={userLocation}
            onSearch={handleSearch}
          />
          
          <Suspense fallback={<LoadingSpinner />}>
            <ValueProposition />
            <HowItWorks />
            <FeaturedProperties 
              properties={initialProperties}
            />
            <Testimonials />
          </Suspense>
        </main>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
  
  function handleSearch(query: SearchQuery) {
    // Navigate to search results
    router.push({
      pathname: '/search',
      query: {
        q: query.text,
        ...query.filters
      }
    });
  }
};
```

### Hero Search Component
```typescript
// components/Hero/HeroSearch.tsx
import React, { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { SearchSuggestions } from '../Search/SearchSuggestions';
import { VoiceSearch } from '../Search/VoiceSearch';
import { useSearch } from '../../hooks/useSearch';

interface HeroSearchProps {
  onSearch: (query: SearchQuery) => void;
  userLocation?: Location;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  userLocation
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchSuggestions } = useSearch();
  
  // Debounced suggestion fetching
  const getSuggestions = useCallback(
    debounce(async (searchText: string) => {
      if (searchText.length < 2) {
        setSuggestions([]);
        return;
      }
      
      const results = await fetchSuggestions(searchText, userLocation);
      setSuggestions(results);
    }, 300),
    [userLocation]
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    getSuggestions(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch({
        text: query,
        location: userLocation,
        timestamp: Date.now()
      });
    }
  };
  
  const handleVoiceInput = (transcript: string) => {
    setQuery(transcript);
    inputRef.current?.focus();
  };
  
  return (
    <search 
      role="search" 
      className={`hero-search ${isExpanded ? 'expanded' : ''}`}
      aria-label="Property search"
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <label htmlFor="property-search" className="visually-hidden">
            Search for properties
          </label>
          
          <input
            ref={inputRef}
            type="search"
            id="property-search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder="Search by location, property type, or features..."
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={suggestions.length > 0}
            autoComplete="off"
            required
          />
          
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
          
          <VoiceSearch onTranscript={handleVoiceInput} />
          
          <button 
            type="submit" 
            className="search-submit"
            aria-label="Search properties"
          >
            <SearchIcon />
            <span className="button-text">Search</span>
          </button>
        </div>
        
        {isExpanded && suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={(suggestion) => {
              setQuery(suggestion.text);
              handleSubmit(new Event('submit') as any);
            }}
          />
        )}
      </form>
    </search>
  );
};
```

## State Management

### Global State Store
```typescript
// store/homepage.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface HomepageState {
  // Search state
  recentSearches: SearchQuery[];
  savedSearches: SearchProfile[];
  
  // Properties state
  featuredProperties: Property[];
  viewedProperties: string[];
  savedProperties: string[];
  
  // User preferences
  userLocation: Location | null;
  preferredLanguage: 'es' | 'en';
  
  // Actions
  addRecentSearch: (query: SearchQuery) => void;
  saveSearch: (profile: SearchProfile) => void;
  toggleSaveProperty: (propertyId: string) => void;
  setUserLocation: (location: Location) => void;
}

export const useHomepageStore = create<HomepageState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        recentSearches: [],
        savedSearches: [],
        featuredProperties: [],
        viewedProperties: [],
        savedProperties: [],
        userLocation: null,
        preferredLanguage: 'es',
        
        // Actions
        addRecentSearch: (query) => {
          set((state) => ({
            recentSearches: [
              query,
              ...state.recentSearches.filter(
                (q) => q.text !== query.text
              ).slice(0, 4)
            ]
          }));
        },
        
        saveSearch: (profile) => {
          set((state) => ({
            savedSearches: [...state.savedSearches, profile]
          }));
        },
        
        toggleSaveProperty: (propertyId) => {
          set((state) => {
            const isSaved = state.savedProperties.includes(propertyId);
            return {
              savedProperties: isSaved
                ? state.savedProperties.filter(id => id !== propertyId)
                : [...state.savedProperties, propertyId]
            };
          });
        },
        
        setUserLocation: (location) => {
          set({ userLocation: location });
        }
      }),
      {
        name: 'homepage-storage',
        partialize: (state) => ({
          recentSearches: state.recentSearches,
          savedSearches: state.savedSearches,
          savedProperties: state.savedProperties,
          userLocation: state.userLocation,
          preferredLanguage: state.preferredLanguage
        })
      }
    )
  )
);
```

### Local Component State
```typescript
// hooks/useComponentState.ts
import { useState, useEffect, useRef } from 'react';

export function useHeroAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Parallax calculations
      if (heroRef.current) {
        const parallaxSpeed = 0.5;
        const yPos = -(scrollY * parallaxSpeed);
        heroRef.current.style.transform = `translateY(${yPos}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial animation
    setTimeout(() => setIsVisible(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { isVisible, scrollY, heroRef };
}
```

## API Integration

### API Client Configuration
```typescript
// services/api.ts
import axios, { AxiosInstance } from 'axios';
import { setupCache } from 'axios-cache-adapter';

// Cache configuration
const cache = setupCache({
  maxAge: 5 * 60 * 1000, // 5 minutes
  exclude: {
    query: false,
    methods: ['post', 'patch', 'put', 'delete']
  }
});

class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      adapter: cache.adapter,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.getLanguage()
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request tracking
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time
        const duration = Date.now() - response.config.metadata.startTime;
        console.debug(`API call took ${duration}ms`);
        
        return response;
      },
      async (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Refresh token logic
          await this.refreshToken();
          return this.client.request(error.config);
        }
        
        if (error.response?.status === 429) {
          // Rate limiting - retry with backoff
          const retryAfter = error.response.headers['retry-after'] || 1;
          await this.delay(retryAfter * 1000);
          return this.client.request(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Search endpoints
  async searchProperties(query: SearchQuery): Promise<SearchResults> {
    const response = await this.client.get('/properties/search', {
      params: {
        q: query.text,
        lat: query.location?.lat,
        lng: query.location?.lng,
        ...query.filters
      }
    });
    
    return response.data;
  }
  
  async getSuggestions(text: string, location?: Location): Promise<Suggestion[]> {
    const response = await this.client.get('/search/suggestions', {
      params: { 
        q: text,
        lat: location?.lat,
        lng: location?.lng,
        limit: 5
      }
    });
    
    return response.data;
  }
  
  async getFeaturedProperties(): Promise<Property[]> {
    const response = await this.client.get('/properties/featured', {
      params: { limit: 6 }
    });
    
    return response.data;
  }
  
  // User actions
  async saveProperty(propertyId: string): Promise<void> {
    await this.client.post(`/properties/${propertyId}/save`);
  }
  
  async createSearchProfile(profile: SearchProfile): Promise<SearchProfile> {
    const response = await this.client.post('/search-profiles', profile);
    return response.data;
  }
  
  // Analytics
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Fire and forget
    this.client.post('/analytics/events', event).catch(() => {
      // Silently fail analytics
    });
  }
  
  // Helpers
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  private getLanguage(): string {
    return localStorage.getItem('preferred_language') || 'es';
  }
  
  private async refreshToken(): Promise<void> {
    // Token refresh logic
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiClient = new APIClient();
```

### API Hooks
```typescript
// hooks/useAPI.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Search hook
export function usePropertySearch(query: SearchQuery, enabled = true) {
  return useQuery({
    queryKey: ['properties', 'search', query],
    queryFn: () => apiClient.searchProperties(query),
    enabled: enabled && !!query.text,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
}

// Featured properties hook
export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => apiClient.getFeaturedProperties(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
}

// Save property mutation
export function useSaveProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (propertyId: string) => apiClient.saveProperty(propertyId),
    onSuccess: (_, propertyId) => {
      // Optimistic update
      queryClient.setQueryData(
        ['properties', 'saved'],
        (old: string[] = []) => [...old, propertyId]
      );
    },
    onError: (error, propertyId) => {
      // Revert optimistic update
      queryClient.setQueryData(
        ['properties', 'saved'],
        (old: string[] = []) => old.filter(id => id !== propertyId)
      );
    }
  });
}
```

## Data Models

### TypeScript Interfaces
```typescript
// types/homepage.types.ts

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'room' | 'commercial';
  
  // Location
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Details
  price: {
    amount: number;
    currency: 'HNL' | 'USD';
    period: 'month' | 'day' | 'week';
  };
  size: {
    value: number;
    unit: 'm2' | 'ft2';
  };
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  
  // Media
  images: PropertyImage[];
  virtualTour?: string;
  video?: string;
  
  // Availability
  availableFrom: Date;
  minimumStay?: number;
  maximumStay?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  saveCount: number;
  responseTime: number; // minutes
  verificationStatus: 'verified' | 'pending' | 'unverified';
  
  // Landlord
  landlord: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
    responseRate: number;
    whatsappEnabled: boolean;
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  height: number;
  order: number;
}

export interface SearchQuery {
  text: string;
  location?: Location;
  filters?: SearchFilters;
  timestamp: number;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: string[];
  bedrooms?: number[];
  bathrooms?: number[];
  amenities?: string[];
  availableFrom?: Date;
  petFriendly?: boolean;
  furnished?: boolean;
  parking?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual';
}

export interface Suggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'landmark' | 'recent';
  icon: string;
  metadata?: {
    propertyCount?: number;
    coordinates?: Location;
    popularityScore?: number;
  };
}

export interface SearchProfile {
  id?: string;
  name: string;
  query: SearchQuery;
  notifications: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
  };
  createdAt?: Date;
  lastUsed?: Date;
}

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}
```

### Validation Schemas
```typescript
// utils/validation.ts
import { z } from 'zod';

export const SearchQuerySchema = z.object({
  text: z.string().min(2).max(200),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
    source: z.enum(['gps', 'ip', 'manual'])
  }).optional(),
  filters: z.object({
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    propertyTypes: z.array(z.string()).optional(),
    bedrooms: z.array(z.number()).optional(),
    bathrooms: z.array(z.number()).optional(),
    amenities: z.array(z.string()).optional(),
    availableFrom: z.date().optional(),
    petFriendly: z.boolean().optional(),
    furnished: z.boolean().optional(),
    parking: z.boolean().optional()
  }).optional(),
  timestamp: z.number()
});

export const validateSearchQuery = (query: unknown) => {
  try {
    return SearchQuerySchema.parse(query);
  } catch (error) {
    console.error('Invalid search query:', error);
    throw new ValidationError('Invalid search parameters');
  }
};
```

## Search Implementation

### Search Suggestions Engine
```typescript
// services/searchEngine.ts
import Fuse from 'fuse.js';
import { apiClient } from './api';

class SearchEngine {
  private fuse: Fuse<any> | null = null;
  private localData: Suggestion[] = [];
  private lastUpdate: number = 0;
  private updateInterval = 5 * 60 * 1000; // 5 minutes
  
  async initialize() {
    await this.updateLocalData();
    
    this.fuse = new Fuse(this.localData, {
      keys: [
        { name: 'text', weight: 0.7 },
        { name: 'metadata.keywords', weight: 0.3 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2
    });
  }
  
  async getSuggestions(query: string, location?: Location): Promise<Suggestion[]> {
    // Check if local data needs update
    if (Date.now() - this.lastUpdate > this.updateInterval) {
      await this.updateLocalData();
    }
    
    // Get local suggestions
    const localResults = this.fuse?.search(query, { limit: 3 }) || [];
    
    // Get server suggestions for better relevance
    const serverResults = await apiClient.getSuggestions(query, location);
    
    // Merge and deduplicate
    const merged = this.mergeSuggestions(
      localResults.map(r => r.item),
      serverResults
    );
    
    // Add recent searches if relevant
    const recentSearches = this.getRecentSearches();
    const relevantRecent = recentSearches.filter(s => 
      s.text.toLowerCase().includes(query.toLowerCase())
    );
    
    return [...relevantRecent, ...merged].slice(0, 8);
  }
  
  private async updateLocalData() {
    try {
      // Fetch popular searches and locations
      const [popularSearches, popularLocations] = await Promise.all([
        apiClient.getPopularSearches(),
        apiClient.getPopularLocations()
      ]);
      
      this.localData = [
        ...popularSearches,
        ...popularLocations
      ];
      
      this.lastUpdate = Date.now();
    } catch (error) {
      console.error('Failed to update local search data:', error);
    }
  }
  
  private mergeSuggestions(
    local: Suggestion[],
    server: Suggestion[]
  ): Suggestion[] {
    const seen = new Set<string>();
    const merged: Suggestion[] = [];
    
    // Prioritize server results
    for (const suggestion of server) {
      if (!seen.has(suggestion.text)) {
        seen.add(suggestion.text);
        merged.push(suggestion);
      }
    }
    
    // Add local results
    for (const suggestion of local) {
      if (!seen.has(suggestion.text)) {
        seen.add(suggestion.text);
        merged.push(suggestion);
      }
    }
    
    return merged;
  }
  
  private getRecentSearches(): Suggestion[] {
    const stored = localStorage.getItem('recent_searches');
    if (!stored) return [];
    
    try {
      const searches = JSON.parse(stored);
      return searches.map((text: string) => ({
        id: `recent-${text}`,
        text,
        type: 'recent',
        icon: 'history'
      }));
    } catch {
      return [];
    }
  }
  
  saveSearch(query: string) {
    const stored = localStorage.getItem('recent_searches');
    const searches = stored ? JSON.parse(stored) : [];
    
    // Add to beginning, remove duplicates, limit to 10
    const updated = [
      query,
      ...searches.filter((s: string) => s !== query)
    ].slice(0, 10);
    
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  }
}

export const searchEngine = new SearchEngine();
```

### Voice Search Implementation
```typescript
// components/Search/VoiceSearch.tsx
import React, { useState, useEffect, useRef } from 'react';

interface VoiceSearchProps {
  onTranscript: (transcript: string) => void;
  language?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onTranscript,
  language = 'es-HN'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error
        if (event.error === 'no-speech') {
          showNotification('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          showNotification('Microphone access denied.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [language, onTranscript]);
  
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };
  
  if (!isSupported) {
    return null;
  }
  
  return (
    <button
      type="button"
      className={`voice-search-button ${isListening ? 'listening' : ''}`}
      onClick={toggleListening}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <MicActiveIcon className="mic-icon pulse" />
      ) : (
        <MicIcon className="mic-icon" />
      )}
      
      {isListening && (
        <span className="listening-indicator">
          <span className="pulse-ring"></span>
          <span className="pulse-ring"></span>
        </span>
      )}
    </button>
  );
};

function showNotification(message: string) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

## Performance Optimization

### Code Splitting Strategy
```typescript
// utils/lazyLoad.ts
import { lazy, ComponentType } from 'react';

// Lazy load with retry logic
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, interval));
        return lazyLoadWithRetry(importFn, retries - 1, interval * 2)();
      }
      throw error;
    }
  });
}

// Route-based code splitting
export const routes = {
  '/': lazyLoadWithRetry(() => import('../pages/Homepage')),
  '/search': lazyLoadWithRetry(() => import('../pages/Search')),
  '/property/:id': lazyLoadWithRetry(() => import('../pages/Property')),
  '/profile/create': lazyLoadWithRetry(() => import('../pages/CreateProfile'))
};
```

### Image Optimization
```typescript
// components/Common/OptimizedImage.tsx
import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  onLoad,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate responsive image sources
  const srcSet = generateSrcSet(src);
  const placeholder = generatePlaceholder(src);
  
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  return (
    <picture className={`image-container ${className}`}>
      {/* WebP version */}
      <source
        type="image/webp"
        srcSet={isInView ? generateWebPSrcSet(src) : undefined}
        sizes={sizes}
      />
      
      {/* Fallback JPEG */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        className={`
          optimized-image
          ${isLoaded ? 'loaded' : 'loading'}
        `}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="image-skeleton" aria-hidden="true" />
      )}
    </picture>
  );
};

function generateSrcSet(src: string): string {
  const widths = [320, 640, 768, 1024, 1366, 1920];
  return widths
    .map(w => `${getImageUrl(src, w)} ${w}w`)
    .join(', ');
}

function generateWebPSrcSet(src: string): string {
  const widths = [320, 640, 768, 1024, 1366, 1920];
  return widths
    .map(w => `${getImageUrl(src, w, 'webp')} ${w}w`)
    .join(', ');
}

function generatePlaceholder(src: string): string {
  // Return base64 LQIP or blur hash
  return getImageUrl(src, 20, 'jpg', 10);
}

function getImageUrl(
  src: string,
  width: number,
  format?: string,
  quality = 85
): string {
  // Use image CDN service
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    ...(format && { fm: format })
  });
  
  return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/${src}?${params}`;
}
```

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Replace React with Preact in production
      Object.assign(config.resolve.alias, {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      });
      
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha256');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20
          },
          shared: {
            name(module, chunks) {
              return crypto
                .createHash('sha256')
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                .digest('hex')
                .substring(0, 8);
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      };
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['cdn.heurekka.com'],
    deviceSizes: [320, 640, 768, 1024, 1366, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Enable compression
  compress: true,
  
  // Generate static pages
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'development';
  }
};
```

## SEO Implementation

### Meta Tags Management
```typescript
// components/Layout/SEOHead.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'HEUREKKA - Find Your Perfect Home in Honduras',
  description = 'Discover rental properties in Tegucigalpa with smart tenant profiles. Save time, find better matches, connect instantly via WhatsApp.',
  image = '/og-image.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords = ['rental', 'properties', 'Tegucigalpa', 'Honduras', 'apartments', 'houses']
}) => {
  const router = useRouter();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`;
  const imageUrl = image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_SITE_URL}${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'HEUREKKA'} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="HEUREKKA" />
      <meta property="og:locale" content="es_HN" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@heurekka" />
      
      {/* Article specific */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#667eea" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://cdn.heurekka.com" />
      <link rel="dns-prefetch" href="https://api.heurekka.com" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'HEUREKKA',
            url: process.env.NEXT_PUBLIC_SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />
    </Head>
  );
};
```

### Sitemap Generation
```typescript
// scripts/generateSitemap.ts
import fs from 'fs';
import path from 'path';
import { apiClient } from '../services/api';

async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/search', priority: 0.9, changefreq: 'daily' },
    { url: '/how-it-works', priority: 0.7, changefreq: 'weekly' },
    { url: '/landlords', priority: 0.8, changefreq: 'weekly' },
    { url: '/tenants', priority: 0.8, changefreq: 'weekly' },
    { url: '/about', priority: 0.6, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.5, changefreq: 'monthly' },
    { url: '/terms', priority: 0.5, changefreq: 'monthly' }
  ];
  
  // Dynamic pages (properties)
  const properties = await apiClient.getAllProperties();
  const propertyPages = properties.map(property => ({
    url: `/property/${property.id}`,
    priority: 0.8,
    changefreq: 'daily',
    lastmod: property.updatedAt
  }));
  
  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticPages, ...propertyPages]
    .map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`)
    .join('')}
</urlset>`;
  
  // Write to public directory
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'sitemap.xml'),
    sitemap
  );
  
  // Generate robots.txt
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Sitemap: ${baseUrl}/sitemap.xml`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'robots.txt'),
    robots
  );
}

generateSitemap();
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/components/HeroSearch.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSearch } from '../../components/Hero/HeroSearch';
import { searchEngine } from '../../services/searchEngine';

jest.mock('../../services/searchEngine');

describe('HeroSearch', () => {
  const mockOnSearch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders search input with correct attributes', () => {
    render(<HeroSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText(/search for properties/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
  
  it('shows suggestions on input', async () => {
    const mockSuggestions = [
      { id: '1', text: 'Colonia Palmira', type: 'location' },
      { id: '2', text: '2 bedroom apartment', type: 'property' }
    ];
    
    (searchEngine.getSuggestions as jest.Mock).mockResolvedValue(mockSuggestions);
    
    render(<HeroSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText(/search for properties/i);
    await userEvent.type(input, 'col');
    
    await waitFor(() => {
      expect(screen.getByText('Colonia Palmira')).toBeInTheDocument();
      expect(screen.getByText('2 bedroom apartment')).toBeInTheDocument();
    });
  });
  
  it('submits search on form submission', async () => {
    render(<HeroSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText(/search for properties/i);
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(input, 'test search');
    await userEvent.click(submitButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'test search',
        timestamp: expect.any(Number)
      })
    );
  });
  
  it('clears search input when clear button is clicked', async () => {
    render(<HeroSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText(/search for properties/i);
    await userEvent.type(input, 'test');
    
    const clearButton = screen.getByLabelText(/clear search/i);
    await userEvent.click(clearButton);
    
    expect(input).toHaveValue('');
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/homepage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Homepage } from '../../pages/Homepage';
import { server } from '../../mocks/server';
import { rest } from 'msw';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Homepage Integration', () => {
  it('loads and displays featured properties', async () => {
    render(<Homepage />, { wrapper });
    
    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByText(/featured properties/i)).toBeInTheDocument();
    });
    
    // Check if properties are displayed
    const propertyCards = screen.getAllByRole('article');
    expect(propertyCards).toHaveLength(6);
  });
  
  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.get('/api/properties/featured', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<Homepage />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/unable to load properties/i)).toBeInTheDocument();
    });
  });
  
  it('performs search and navigates to results', async () => {
    const { container } = render(<Homepage />, { wrapper });
    
    const searchInput = screen.getByLabelText(/search for properties/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(searchInput, 'Colonia Palmira');
    await userEvent.click(searchButton);
    
    // Check if navigation occurred
    await waitFor(() => {
      expect(window.location.pathname).toBe('/search');
      expect(window.location.search).toContain('q=Colonia+Palmira');
    });
  });
});
```

### E2E Tests
```typescript
// cypress/e2e/homepage.cy.ts
describe('Homepage E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('completes full search flow', () => {
    // Type in search
    cy.get('[data-testid="search-input"]')
      .type('2 bedroom apartment');
    
    // Wait for suggestions
    cy.get('[data-testid="search-suggestions"]')
      .should('be.visible');
    
    // Select a suggestion
    cy.get('[data-testid="suggestion-item"]')
      .first()
      .click();
    
    // Should navigate to search results
    cy.url().should('include', '/search');
    cy.get('[data-testid="search-results"]')
      .should('be.visible');
  });
  
  it('saves a property to favorites', () => {
    // Scroll to featured properties
    cy.get('[data-testid="featured-properties"]')
      .scrollIntoView();
    
    // Click save on first property
    cy.get('[data-testid="property-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="save-button"]')
          .click();
      });
    
    // Check if saved
    cy.get('[data-testid="save-button"]')
      .first()
      .should('have.attr', 'aria-pressed', 'true');
    
    // Verify in saved properties
    cy.visit('/saved');
    cy.get('[data-testid="saved-property"]')
      .should('have.length.at.least', 1);
  });
  
  it('responsive design works correctly', () => {
    // Mobile view
    cy.viewport('iphone-x');
    cy.get('[data-testid="mobile-menu-toggle"]')
      .should('be.visible');
    
    // Tablet view
    cy.viewport('ipad-2');
    cy.get('[data-testid="search-input"]')
      .should('have.css', 'width')
      .and('match', /[0-9]+px/);
    
    // Desktop view
    cy.viewport('macbook-15');
    cy.get('[data-testid="hero-section"]')
      .should('be.visible');
  });
});
```

## Deployment Checklist

### Pre-deployment
- [ ] **Code Quality**
  - [ ] All tests passing (unit, integration, E2E)
  - [ ] No console errors or warnings
  - [ ] ESLint and Prettier checks pass
  - [ ] TypeScript compilation successful
  - [ ] Bundle size within limits (<200KB initial)

- [ ] **Performance**
  - [ ] Lighthouse score >90 for all categories
  - [ ] First Contentful Paint <1.5s
  - [ ] Time to Interactive <3s
  - [ ] Cumulative Layout Shift <0.1
  - [ ] Images optimized and using WebP
  - [ ] Code splitting implemented

- [ ] **SEO**
  - [ ] Meta tags present on all pages
  - [ ] Sitemap generated
  - [ ] Robots.txt configured
  - [ ] Structured data validated
  - [ ] Open Graph tags tested

- [ ] **Accessibility**
  - [ ] WCAG AA compliance verified
  - [ ] Keyboard navigation tested
  - [ ] Screen reader tested
  - [ ] Color contrast verified
  - [ ] Focus indicators visible

- [ ] **Security**
  - [ ] Environment variables secured
  - [ ] API endpoints protected
  - [ ] Input validation implemented
  - [ ] XSS protection enabled
  - [ ] CSRF tokens implemented

### Deployment
```bash
# Build and deploy script
#!/bin/bash

# Run tests
npm run test:ci

# Build application
npm run build

# Run production checks
npm run analyze
npm run lighthouse

# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke

# Deploy to production
npm run deploy:production

# Verify deployment
npm run verify:production
```

### Post-deployment
- [ ] **Monitoring**
  - [ ] Analytics tracking verified
  - [ ] Error tracking enabled (Sentry)
  - [ ] Performance monitoring active
  - [ ] Uptime monitoring configured
  - [ ] User feedback system active

- [ ] **Verification**
  - [ ] All pages load correctly
  - [ ] Search functionality works
  - [ ] Images load properly
  - [ ] Forms submit successfully
  - [ ] Mobile experience smooth

## Related Documentation
- [User Journey](./user-journey.md) - Complete user flow analysis
- [Screen States](./screen-states.md) - Visual specifications for all states
- [Interactions](./interactions.md) - Animation and interaction patterns
- [Accessibility](./accessibility.md) - Detailed accessibility requirements
- [Design System](../../design-system/style-guide.md) - Platform-wide design standards