'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, MapPin, Clock, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
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
        return <Clock className="w-4 h-4 text-neutral-400" />
      default:
        return <Search className="w-4 h-4 text-neutral-400" />
    }
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg border border-border shadow-lg max-h-64 overflow-y-auto">
      <div className="py-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className="w-full px-4 py-3 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none transition-colors duration-150 flex items-center gap-3"
            role="option"
            aria-selected={false}
          >
            {getIconForType(suggestion.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 truncate">
                {suggestion.text}
              </div>
              {suggestion.metadata?.propertyCount && (
                <div className="text-xs text-neutral-500">
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value.trim()) return

    const query = {
      text: value.trim(),
      timestamp: Date.now()
    }

    onSearch(query)
    setShowSuggestions(false)
    
    // Track search event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query.text
      })
    }
  }, [value, onSearch])

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
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-neutral-400" />
          </div>
          
          <Input
            ref={inputRef}
            type="search"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-20 h-14 rounded-full border-2 border-primary shadow-lg",
              "focus:shadow-xl transition-shadow duration-200",
              "text-base placeholder:text-neutral-400"
            )}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
            autoComplete="off"
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-8 w-8 p-0 hover:bg-neutral-100 rounded-full"
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
                className="h-8 w-8 p-0 hover:bg-neutral-100 rounded-full"
                aria-label="Búsqueda por voz"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              className="h-10 px-4 rounded-full"
              disabled={loading || !value.trim()}
              loading={loading}
            >
              <span className="sr-only sm:not-sr-only">Buscar</span>
            </Button>
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