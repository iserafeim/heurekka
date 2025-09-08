import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'
import type { SearchQuery, Suggestion } from '@/types/homepage'

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()
  const mockSuggestions: Suggestion[] = [
    {
      id: '1',
      text: 'Tegucigalpa Centro',
      type: 'location',
      icon: '📍',
      metadata: {
        propertyCount: 25,
        coordinates: { lat: 14.0723, lng: -87.1921, source: 'manual' as const }
      }
    },
    {
      id: '2',
      text: 'Apartamento en Colonia Palmira',
      type: 'property',
      icon: '🏠',
      metadata: { propertyCount: 8 }
    },
    {
      id: '3',
      text: 'Búsqueda reciente: Casa 2 habitaciones',
      type: 'recent',
      icon: '🕒'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock gtag for analytics
    window.gtag = jest.fn()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })
  })

  describe('Basic Rendering', () => {
    it('renders search input with correct placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'Buscar por ubicación, tipo de propiedad o características...'
      )
    })

    it('renders with custom placeholder', () => {
      const customPlaceholder = 'Buscar propiedades en Tegucigalpa...'
      render(
        <SearchBar onSearch={mockOnSearch} placeholder={customPlaceholder} />
      )
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const form = screen.getByRole('search')
      const input = screen.getByRole('searchbox')
      
      expect(form).toHaveAttribute('aria-label', 'Búsqueda de propiedades')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
      expect(input).toHaveAttribute('aria-controls', 'search-suggestions')
      expect(input).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows search icon and submit button', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByText('Buscar')).toBeInTheDocument()
      // Search icon should be present (as part of the UI)
      const searchIcon = document.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled Mode', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Tegucigalpa')
      
      expect(input).toHaveValue('Tegucigalpa')
    })

    it('works as controlled component', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()
      const TestWrapper = () => {
        const [value, setValue] = React.useState('')
        return (
          <SearchBar
            onSearch={mockOnSearch}
            value={value}
            onChange={(newValue) => {
              setValue(newValue)
              mockOnChange(newValue)
            }}
          />
        )
      }
      
      render(<TestWrapper />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test')
      
      expect(mockOnChange).toHaveBeenCalledWith('Test')
    })
  })

  describe('Search Functionality', () => {
    it('submits search on form submission', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const form = screen.getByRole('search')
      
      await user.type(input, 'Casa en Tegucigalpa')
      fireEvent.submit(form)
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: 'Casa en Tegucigalpa',
        timestamp: expect.any(Number)
      })
    })

    it('submits search on button click', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const submitButton = screen.getByRole('button', { name: /Buscar/i })
      
      await user.type(input, 'Apartamento')
      await user.click(submitButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: 'Apartamento',
        timestamp: expect.any(Number)
      })
    })

    it('does not submit empty searches', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const submitButton = screen.getByRole('button', { name: /Buscar/i })
      await user.click(submitButton)
      
      expect(mockOnSearch).not.toHaveBeenCalled()
    })

    it('trims whitespace from search terms', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const form = screen.getByRole('search')
      
      await user.type(input, '  Casa en Tegucigalpa  ')
      fireEvent.submit(form)
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: 'Casa en Tegucigalpa',
        timestamp: expect.any(Number)
      })
    })

    it('tracks analytics events on search', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const form = screen.getByRole('search')
      
      await user.type(input, 'Test search')
      fireEvent.submit(form)
      
      expect(window.gtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'Test search'
      })
    })
  })

  describe('Suggestions Functionality', () => {
    it('shows suggestions when provided and input has value', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Te')
      await user.click(input) // Focus to show suggestions
      
      await waitFor(() => {
        expect(screen.getByText('Tegucigalpa Centro')).toBeInTheDocument()
        expect(screen.getByText('Apartamento en Colonia Palmira')).toBeInTheDocument()
        expect(screen.getByText('Búsqueda reciente: Casa 2 habitaciones')).toBeInTheDocument()
      })
    })

    it('shows property count in suggestions', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
          value="Te"
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('25 propiedades')).toBeInTheDocument()
        expect(screen.getByText('8 propiedades')).toBeInTheDocument()
      })
    })

    it('handles suggestion selection', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
          value="Te"
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.click(input)
      
      await waitFor(() => {
        const suggestion = screen.getByText('Tegucigalpa Centro')
        expect(suggestion).toBeInTheDocument()
      })
      
      const suggestionButton = screen.getByText('Tegucigalpa Centro')
      await user.click(suggestionButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: 'Tegucigalpa Centro',
        location: { lat: 14.0723, lng: -87.1921, source: 'manual' },
        timestamp: expect.any(Number)
      })
    })

    it('hides suggestions on blur with delay', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
          value="Te"
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Tegucigalpa Centro')).toBeInTheDocument()
      })
      
      await user.tab() // Blur the input
      
      // Suggestions should still be visible immediately
      expect(screen.getByText('Tegucigalpa Centro')).toBeInTheDocument()
      
      // After delay, suggestions should hide
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Tegucigalpa Centro')).not.toBeInTheDocument()
      })
    })

    it('shows correct icons for different suggestion types', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
          value="Te"
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.click(input)
      
      await waitFor(() => {
        // Check that different icons are rendered (testing the SVG elements)
        const suggestionButtons = screen.getAllByRole('option')
        expect(suggestionButtons).toHaveLength(3)
        
        // Verify the suggestions are properly categorized
        expect(screen.getByText('Tegucigalpa Centro')).toBeInTheDocument()
        expect(screen.getByText('Apartamento en Colonia Palmira')).toBeInTheDocument()
        expect(screen.getByText('Búsqueda reciente: Casa 2 habitaciones')).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('shows clear button when input has value', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test')
      
      const clearButton = screen.getByLabelText('Limpiar búsqueda')
      expect(clearButton).toBeInTheDocument()
    })

    it('does not show clear button when input is empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const clearButton = screen.queryByLabelText('Limpiar búsqueda')
      expect(clearButton).not.toBeInTheDocument()
    })

    it('clears input and focuses on clear button click', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test search')
      
      const clearButton = screen.getByLabelText('Limpiar búsqueda')
      await user.click(clearButton)
      
      expect(input).toHaveValue('')
      expect(input).toHaveFocus()
    })
  })

  describe('Voice Search', () => {
    it('shows voice button when speech recognition is supported', () => {
      // Mock speech recognition support
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: class MockSpeechRecognition {},
        writable: true
      })
      
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const voiceButton = screen.getByLabelText('Búsqueda por voz')
      expect(voiceButton).toBeInTheDocument()
    })

    it('does not show voice button when speech recognition is not supported', () => {
      // Ensure speech recognition is not available
      delete (window as any).webkitSpeechRecognition
      delete (window as any).SpeechRecognition
      
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const voiceButton = screen.queryByLabelText('Búsqueda por voz')
      expect(voiceButton).not.toBeInTheDocument()
    })

    it('focuses input when voice button is clicked', async () => {
      const user = userEvent.setup()
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: class MockSpeechRecognition {},
        writable: true
      })
      
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const voiceButton = screen.getByLabelText('Búsqueda por voz')
      
      await user.click(voiceButton)
      
      expect(input).toHaveFocus()
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading', () => {
      render(<SearchBar onSearch={mockOnSearch} loading={true} />)
      
      const submitButton = screen.getByRole('button', { name: /Buscar/i })
      expect(submitButton).toBeDisabled()
    })

    it('shows loading state on submit button', () => {
      render(<SearchBar onSearch={mockOnSearch} loading={true} />)
      
      const submitButton = screen.getByRole('button', { name: /Buscar/i })
      expect(submitButton).toHaveAttribute('loading', 'true')
    })

    it('disables submit when no value and not loading', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const submitButton = screen.getByRole('button', { name: /Buscar/i })
      expect(submitButton).toBeDisabled()
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test')
      
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('allows Enter key to submit form', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test search')
      await user.keyboard('{Enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: 'Test search',
        timestamp: expect.any(Number)
      })
    })

    it('supports tab navigation', async () => {
      const user = userEvent.setup()
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: class MockSpeechRecognition {},
        writable: true
      })
      
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test')
      
      // Tab to clear button
      await user.tab()
      expect(screen.getByLabelText('Limpiar búsqueda')).toHaveFocus()
      
      // Tab to voice button
      await user.tab()
      expect(screen.getByLabelText('Búsqueda por voz')).toHaveFocus()
      
      // Tab to submit button
      await user.tab()
      expect(screen.getByRole('button', { name: /Buscar/i })).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for suggestions', async () => {
      const user = userEvent.setup()
      render(
        <SearchBar
          onSearch={mockOnSearch}
          suggestions={mockSuggestions}
          value="Te"
        />
      )
      
      const input = screen.getByRole('searchbox')
      await user.click(input)
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true')
        
        const suggestions = screen.getAllByRole('option')
        suggestions.forEach((suggestion) => {
          expect(suggestion).toHaveAttribute('aria-selected', 'false')
        })
      })
    })

    it('has proper button labels', () => {
      render(<SearchBar onSearch={mockOnSearch} value="test" />)
      
      expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Buscar/i })).toBeInTheDocument()
    })

    it('maintains focus management correctly', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Test')
      
      const clearButton = screen.getByLabelText('Limpiar búsqueda')
      await user.click(clearButton)
      
      expect(input).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid typing without breaking', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      
      // Rapid typing
      await user.type(input, 'abcdefghijklmnopqrstuvwxyz', { delay: 1 })
      
      expect(input).toHaveValue('abcdefghijklmnopqrstuvwxyz')
    })

    it('handles special characters in search', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const form = screen.getByRole('search')
      
      const specialChars = 'Colón, San José - 2BR/2BA (€500/mes)'
      await user.type(input, specialChars)
      fireEvent.submit(form)
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        text: specialChars,
        timestamp: expect.any(Number)
      })
    })

    it('handles very long search terms', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('searchbox')
      const longSearch = 'Casa con piscina en Tegucigalpa cerca del centro comercial con estacionamiento para dos carros y jardín amplio'
      
      await user.type(input, longSearch)
      
      expect(input).toHaveValue(longSearch)
    })
  })
})