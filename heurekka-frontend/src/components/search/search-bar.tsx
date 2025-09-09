'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, MapPin, Clock, Mic, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SearchBarProps, Suggestion } from '@/types/homepage'

interface SearchSuggestionsProps {
  suggestions: Suggestion[]
  onSelect: (suggestion: Suggestion) => void
  isVisible: boolean
}

function SearchSuggestions({ suggestions, onSelect, isVisible }: SearchSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) return null

  const getIconForType = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin className="w-4 h-4 text-primary" />
      case 'recent':
        return <Clock className="w-4 h-4 text-muted-foreground" />
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-border shadow-lg max-h-64 overflow-y-auto">
      <div className="py-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className="w-full px-4 py-3 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors duration-150 flex items-center gap-3"
            role="option"
            aria-selected={false}
          >
            {getIconForType(suggestion.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {suggestion.text}
              </div>
              {suggestion.metadata?.propertyCount && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.metadata.propertyCount} propiedades
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Buscar por ubicación, tipo de propiedad o características...", 
  value: controlledValue,
  onChange,
  suggestions = [],
  loading = false,
  className 
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const handleValueChange = controlledValue !== undefined ? onChange : setInternalValue

  // Check for voice support
  useEffect(() => {
    const hasVoiceSupport = 
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window
    setIsVoiceSupported(hasVoiceSupport)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const query = {
        text: value.trim(),
        timestamp: Date.now()
      }

      await onSearch(query)
      setShowSuggestions(false)
      
      // Track search event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: query.text
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [value, onSearch, isSubmitting])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    handleValueChange?.(newValue)
    
    // Show suggestions when typing
    if (newValue.length > 1 && suggestions.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [handleValueChange, suggestions])

  const handleInputFocus = useCallback(() => {
    if (value.length > 1 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [value, suggestions])

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    handleValueChange?.(suggestion.text)
    setShowSuggestions(false)
    
    // Auto-submit on suggestion select
    const query = {
      text: suggestion.text,
      location: suggestion.metadata?.coordinates,
      timestamp: Date.now()
    }
    
    onSearch(query)
  }, [handleValueChange, onSearch])

  const handleClearSearch = useCallback(() => {
    handleValueChange?.('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [handleValueChange])

  const handleVoiceSearch = useCallback(() => {
    if (!isVoiceSupported) return

    // This would implement voice search functionality
    // For now, just focus the input
    inputRef.current?.focus()
  }, [isVoiceSupported])

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative"
        role="search"
        aria-label="Búsqueda de propiedades"
      >
        {/* Simple, Clean Search Bar - Updated */}
        <div className="relative flex items-center h-14 bg-background rounded-xl border border-gray-300 shadow-sm overflow-hidden">
          {/* Search Icon */}
          <div className="flex items-center pl-4">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="flex-1 px-3 py-0 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground text-foreground"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
            autoComplete="off"
          />
          
          {/* Right Side Buttons */}
          <div className="flex items-center pr-2 gap-1">
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-8 w-8 p-0 hover:bg-muted/80 rounded-full shrink-0"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {isVoiceSupported && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className="h-8 w-8 p-0 hover:bg-muted/80 rounded-full shrink-0"
                aria-label="Búsqueda por voz"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}

            <button
              type="submit"
              className="h-10 px-4 rounded-lg shrink-0 text-white font-semibold shadow-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                backgroundColor: '#2563eb',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
              disabled={isSubmitting || !value.trim()}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <span className="sr-only sm:not-sr-only">Buscar</span>
            </button>
          </div>
        </div>

        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          isVisible={showSuggestions}
        />
      </form>
    </div>
  )
}