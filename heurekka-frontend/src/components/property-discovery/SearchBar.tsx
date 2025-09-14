'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc';
import { SPANISH_TEXT } from '@/types/property';
import { sanitizeSearchQuery, sanitizeText } from '@/lib/security/validation';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'neighborhood' | 'city' | 'landmark';
  subtitle?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface SearchBarProps {
  onSearch: (location: string) => void;
  initialLocation?: string;
  placeholder?: string;
  locale?: 'es' | 'en';
  className?: string;
}

/**
 * SearchBar component with Spanish autocomplete support
 * Provides location search with suggestions from the backend
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialLocation = '',
  placeholder = SPANISH_TEXT.search.placeholder,
  locale = 'es',
  className = ''
}) => {
  const [query, setQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounce query for autocomplete
  const debouncedQuery = useDebounce(query, 300);
  
  // Fetch suggestions from backend
  const { data: suggestionsData, isLoading } = trpc.homepage.getSearchSuggestions.useQuery(
    {
      query: debouncedQuery,
      limit: 8,
    },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 60000, // Cache for 1 minute
    }
  );

  // Update suggestions when data changes
  useEffect(() => {
    if (suggestionsData?.success && suggestionsData.data && Array.isArray(suggestionsData.data)) {
      // Transform backend data to SearchSuggestion format with sanitization
      const transformedSuggestions: SearchSuggestion[] = suggestionsData.data.map((item: any, index: number) => ({
        id: `suggestion-${index}`,
        text: sanitizeText(item.name || item.text || item.title || item),
        type: item.type || 'neighborhood',
        subtitle: sanitizeText(item.subtitle || item.city || item.neighborhood || ''),
        coordinates: item.coordinates || item.location
      }));

      setSuggestions(transformedSuggestions);
      setShowSuggestions(transformedSuggestions.length > 0 && debouncedQuery.length >= 2);
    } else if (suggestionsData?.success === false) {
      // API returned error, use fallback suggestions
      const fallbackSuggestions: SearchSuggestion[] = [
        {
          id: 'fallback-1',
          text: 'Lomas del Guijarro',
          type: 'neighborhood',
          subtitle: 'Tegucigalpa',
          coordinates: { lat: 14.0850, lng: -87.1950 }
        },
        {
          id: 'fallback-2',
          text: 'Colonia Palmira',
          type: 'neighborhood',
          subtitle: 'Tegucigalpa',
          coordinates: { lat: 14.0723, lng: -87.1921 }
        }
      ].filter(suggestion =>
        suggestion.text.toLowerCase().includes(debouncedQuery.toLowerCase())
      );

      setSuggestions(fallbackSuggestions);
      setShowSuggestions(fallbackSuggestions.length > 0 && debouncedQuery.length >= 2);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [suggestionsData, debouncedQuery]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeSearchQuery(e.target.value);
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length < 2) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, []);

  // Handle search submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedQuery = sanitizeSearchQuery(query.trim());
    if (sanitizedQuery) {
      onSearch(sanitizedQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [query, onSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    const sanitizedText = sanitizeSearchQuery(suggestion.text);
    setQuery(sanitizedText);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch(sanitizedText);
    inputRef.current?.blur();
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionSelect, handleSubmit]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 && query.length >= 2) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, query.length]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'city':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'landmark':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default: // neighborhood
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
    }
  };

  return (
    <div className={`search-bar relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            autoComplete="off"
            aria-label={locale === 'es' ? 'Buscar ubicación' : 'Search location'}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            role="combobox"
          />
          
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Loading spinner or search button */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <button
                type="submit"
                className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200"
                aria-label={SPANISH_TEXT.search.button}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            role="listbox"
            aria-label={locale === 'es' ? 'Sugerencias de búsqueda' : 'Search suggestions'}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.text}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;