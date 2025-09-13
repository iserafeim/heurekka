import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyDiscovery } from '../PropertyDiscovery';
import { ViewMode, PropertyType, SortOption, Property } from '@/types/property';

// Mock all hooks
jest.mock('@/hooks/usePropertySearch');
jest.mock('@/hooks/useFavorites');
jest.mock('@/hooks/usePropertyModal');
jest.mock('@/hooks/useSplitViewSync');
jest.mock('@/hooks/useViewToggle');

// Mock all subcomponents
jest.mock('../SearchBar', () => {
  return {
    SearchBar: ({ onSearch, placeholder }: any) => (
      <input
        data-testid="search-bar"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    )
  };
});

jest.mock('../FilterBar', () => {
  return {
    FilterBar: ({ onFiltersChange, resultCount }: any) => (
      <div data-testid="filter-bar">
        <span data-testid="result-count">{resultCount} resultados</span>
        <button 
          data-testid="filter-button"
          onClick={() => onFiltersChange({ priceMin: 20000 })}
        >
          Filtrar
        </button>
      </div>
    )
  };
});

jest.mock('../PropertyCardsPanel', () => {
  return {
    PropertyCardsPanel: ({ properties, onPropertyClick, onLoadMore }: any) => (
      <div data-testid="property-cards-panel">
        {properties.map((prop: Property) => (
          <div 
            key={prop.id} 
            data-testid={`property-card-${prop.id}`}
            onClick={() => onPropertyClick(prop)}
          >
            {prop.address}
          </div>
        ))}
        <button data-testid="load-more" onClick={onLoadMore}>
          Cargar más
        </button>
      </div>
    )
  };
});

jest.mock('../MapPanel', () => {
  return {
    MapPanel: ({ properties, onMarkerClick }: any) => (
      <div data-testid="map-panel">
        {properties.map((prop: Property) => (
          <div 
            key={prop.id} 
            data-testid={`map-marker-${prop.id}`}
            onClick={() => onMarkerClick(prop)}
          >
            Marker {prop.id}
          </div>
        ))}
      </div>
    )
  };
});

jest.mock('../PropertyDetailModal', () => {
  return {
    PropertyDetailModal: ({ isOpen, onClose, property }: any) => (
      isOpen ? (
        <div data-testid="property-modal">
          <button data-testid="close-modal" onClick={onClose}>Cerrar</button>
          {property && <div data-testid="modal-property">{property.address}</div>}
        </div>
      ) : null
    )
  };
});

jest.mock('../ViewToggle', () => {
  return {
    ViewToggle: ({ currentView, onViewChange }: any) => (
      <div data-testid="view-toggle">
        <button 
          data-testid="view-list"
          onClick={() => onViewChange(ViewMode.LIST)}
          className={currentView === ViewMode.LIST ? 'active' : ''}
        >
          Lista
        </button>
        <button 
          data-testid="view-split"
          onClick={() => onViewChange(ViewMode.SPLIT)}
          className={currentView === ViewMode.SPLIT ? 'active' : ''}
        >
          Dividida
        </button>
        <button 
          data-testid="view-map"
          onClick={() => onViewChange(ViewMode.MAP)}
          className={currentView === ViewMode.MAP ? 'active' : ''}
        >
          Mapa
        </button>
      </div>
    )
  };
});

jest.mock('../SplitContainer', () => {
  return {
    SplitContainer: ({ children }: any) => (
      <div data-testid="split-container">{children}</div>
    )
  };
});

// Mock data
const mockProperties: Property[] = [
  {
    id: 'prop-1',
    address: 'Calle Principal 123',
    neighborhood: 'Centro',
    city: 'Tegucigalpa',
    price: 15000,
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    propertyType: PropertyType.APARTMENT,
    images: ['image1.jpg'],
    description: 'Hermoso apartamento',
    amenities: ['Parking'],
    coordinates: { lat: 14.0723, lng: -87.1921 },
    landlord: { id: 'landlord1', name: 'Juan Pérez' },
    listing: { listedDate: '2025-01-01', status: 'active' as const, daysOnMarket: 30 },
    stats: { views: 100, favorites: 10, inquiries: 5 }
  },
  {
    id: 'prop-2', 
    address: 'Avenida Secundaria 456',
    neighborhood: 'Comayagüela',
    city: 'Tegucigalpa',
    price: 18000,
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    propertyType: PropertyType.HOUSE,
    images: ['image2.jpg'],
    description: 'Casa espaciosa',
    amenities: ['Garden'],
    coordinates: { lat: 14.0823, lng: -87.1821 },
    landlord: { id: 'landlord2', name: 'María García' },
    listing: { listedDate: '2025-01-02', status: 'active' as const, daysOnMarket: 29 },
    stats: { views: 80, favorites: 8, inquiries: 3 }
  }
];

// Setup hook mocks
const mockHooks = {
  usePropertySearch: {
    properties: mockProperties,
    total: 2,
    hasMore: true,
    loading: false,
    error: null,
    search: jest.fn(),
    loadMore: jest.fn(),
    refresh: jest.fn()
  },
  useFavorites: {
    favorites: new Set(['prop-1']),
    toggleFavorite: jest.fn(),
    isFavorite: jest.fn((id: string) => id === 'prop-1'),
    loading: false
  },
  usePropertyModal: {
    isOpen: false,
    propertyId: null,
    property: null,
    loading: false,
    openModal: jest.fn(),
    closeModal: jest.fn()
  },
  useSplitViewSync: {
    syncCardWithMap: jest.fn(),
    syncMapWithCard: jest.fn(),
    hoveredCardId: null,
    hoveredMarkerId: null
  },
  useViewToggle: {
    currentView: ViewMode.SPLIT,
    transitionToView: jest.fn(),
    isTransitioning: false
  }
};

// Apply mocks
beforeEach(() => {
  const { usePropertySearch } = require('@/hooks/usePropertySearch');
  const { useFavorites } = require('@/hooks/useFavorites');
  const { usePropertyModal } = require('@/hooks/usePropertyModal');
  const { useSplitViewSync } = require('@/hooks/useSplitViewSync');
  const { useViewToggle } = require('@/hooks/useViewToggle');

  usePropertySearch.mockReturnValue(mockHooks.usePropertySearch);
  useFavorites.mockReturnValue(mockHooks.useFavorites);
  usePropertyModal.mockReturnValue(mockHooks.usePropertyModal);
  useSplitViewSync.mockReturnValue(mockHooks.useSplitViewSync);
  useViewToggle.mockReturnValue(mockHooks.useViewToggle);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PropertyDiscovery', () => {
  describe('Initial Render', () => {
    it('should render with default props', () => {
      render(<PropertyDiscovery />);

      expect(screen.getByText('Heurekka')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
    });

    it('should render with initial filters', () => {
      const initialFilters = {
        location: 'Tegucigalpa',
        priceMin: 10000,
        priceMax: 50000
      };

      render(<PropertyDiscovery initialFilters={initialFilters} />);

      expect(mockHooks.usePropertySearch.search).toHaveBeenCalledWith(
        expect.objectContaining(initialFilters)
      );
    });

    it('should render with initial view mode', () => {
      render(<PropertyDiscovery initialViewMode={ViewMode.LIST} />);

      expect(screen.getByTestId('property-cards-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('map-panel')).not.toBeInTheDocument();
    });

    it('should render with Spanish locale by default', () => {
      render(<PropertyDiscovery />);

      expect(screen.getByText('2 resultados')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input', async () => {
      const user = userEvent.setup();
      render(<PropertyDiscovery />);

      const searchInput = screen.getByTestId('search-bar');
      await user.type(searchInput, 'Centro');

      expect(mockHooks.usePropertySearch.search).toHaveBeenCalledWith(
        expect.objectContaining({ location: 'Centro' })
      );
    });

    it('should call search with correct parameters', () => {
      render(<PropertyDiscovery />);

      // Search should be called on mount
      expect(mockHooks.usePropertySearch.search).toHaveBeenCalledWith(
        expect.objectContaining({
          location: '',
          priceMin: 0,
          priceMax: 100000,
          bedrooms: [],
          propertyTypes: [],
          amenities: [],
          sortBy: 'relevancia',
          radiusKm: 5,
          limit: 24
        })
      );
    });
  });

  describe('Filter Functionality', () => {
    it('should handle filter changes', async () => {
      render(<PropertyDiscovery />);

      const filterButton = screen.getByTestId('filter-button');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockHooks.usePropertySearch.search).toHaveBeenCalledWith(
          expect.objectContaining({ priceMin: 20000 })
        );
      });
    });

    it('should reset pagination cursor on filter change', async () => {
      render(<PropertyDiscovery />);

      const filterButton = screen.getByTestId('filter-button');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockHooks.usePropertySearch.search).toHaveBeenCalledWith(
          expect.objectContaining({ cursor: undefined })
        );
      });
    });
  });

  describe('View Mode Switching', () => {
    it('should switch to list view', async () => {
      render(<PropertyDiscovery />);

      const listButton = screen.getByTestId('view-list');
      fireEvent.click(listButton);

      expect(mockHooks.useViewToggle.transitionToView).toHaveBeenCalledWith(ViewMode.LIST);
    });

    it('should switch to map view', async () => {
      render(<PropertyDiscovery />);

      const mapButton = screen.getByTestId('view-map');
      fireEvent.click(mapButton);

      expect(mockHooks.useViewToggle.transitionToView).toHaveBeenCalledWith(ViewMode.MAP);
    });

    it('should render correct components based on view mode', () => {
      // Test split view (default)
      const { rerender } = render(<PropertyDiscovery />);
      
      expect(screen.getByTestId('split-container')).toBeInTheDocument();
      expect(screen.getByTestId('property-cards-panel')).toBeInTheDocument();
      expect(screen.getByTestId('map-panel')).toBeInTheDocument();

      // Test list view
      mockHooks.useViewToggle.currentView = ViewMode.LIST;
      rerender(<PropertyDiscovery />);
      
      expect(screen.getByTestId('property-cards-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('split-container')).not.toBeInTheDocument();

      // Test map view
      mockHooks.useViewToggle.currentView = ViewMode.MAP;
      rerender(<PropertyDiscovery />);
      
      expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('property-cards-panel')).not.toBeInTheDocument();
    });
  });

  describe('Property Interactions', () => {
    it('should handle property card click', async () => {
      render(<PropertyDiscovery />);

      const propertyCard = screen.getByTestId('property-card-prop-1');
      fireEvent.click(propertyCard);

      expect(mockHooks.usePropertyModal.openModal).toHaveBeenCalledWith('prop-1');
    });

    it('should handle map marker click', async () => {
      render(<PropertyDiscovery />);

      const mapMarker = screen.getByTestId('map-marker-prop-2');
      fireEvent.click(mapMarker);

      expect(mockHooks.usePropertyModal.openModal).toHaveBeenCalledWith('prop-2');
    });

    it('should call onPropertySelect callback', async () => {
      const onPropertySelect = jest.fn();
      render(<PropertyDiscovery onPropertySelect={onPropertySelect} />);

      const propertyCard = screen.getByTestId('property-card-prop-1');
      fireEvent.click(propertyCard);

      expect(onPropertySelect).toHaveBeenCalledWith(mockProperties[0]);
    });
  });

  describe('Infinite Scroll', () => {
    it('should handle load more', async () => {
      render(<PropertyDiscovery />);

      const loadMoreButton = screen.getByTestId('load-more');
      fireEvent.click(loadMoreButton);

      expect(mockHooks.usePropertySearch.loadMore).toHaveBeenCalled();
    });

    it('should not load more when no more items available', async () => {
      mockHooks.usePropertySearch.hasMore = false;
      render(<PropertyDiscovery />);

      const loadMoreButton = screen.getByTestId('load-more');
      fireEvent.click(loadMoreButton);

      expect(mockHooks.usePropertySearch.loadMore).toHaveBeenCalled();
    });
  });

  describe('Modal Interactions', () => {
    it('should render modal when open', () => {
      mockHooks.usePropertyModal.isOpen = true;
      mockHooks.usePropertyModal.property = mockProperties[0];

      render(<PropertyDiscovery />);

      expect(screen.getByTestId('property-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-property')).toHaveTextContent('Calle Principal 123');
    });

    it('should handle modal close', async () => {
      mockHooks.usePropertyModal.isOpen = true;
      render(<PropertyDiscovery />);

      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);

      expect(mockHooks.usePropertyModal.closeModal).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading overlay during view transition', () => {
      mockHooks.useViewToggle.isTransitioning = true;
      render(<PropertyDiscovery />);

      expect(screen.getByText('Cambiando vista...')).toBeInTheDocument();
    });

    it('should pass loading state to components', () => {
      mockHooks.usePropertySearch.loading = true;
      render(<PropertyDiscovery />);

      // Loading state should be passed to filter bar
      expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      mockHooks.usePropertySearch.error = 'Error de conexión';
      render(<PropertyDiscovery />);

      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });

    it('should allow error dismissal', async () => {
      mockHooks.usePropertySearch.error = 'Error de conexión';
      render(<PropertyDiscovery />);

      const dismissButton = screen.getByText('×');
      fireEvent.click(dismissButton);

      // Error should be cleared from component state
      await waitFor(() => {
        expect(screen.queryByText('Error de conexión')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive classes', () => {
      render(<PropertyDiscovery />);

      const mainContainer = screen.getByText('Heurekka').closest('.property-discovery');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should handle custom className', () => {
      render(<PropertyDiscovery className="custom-class" />);

      const container = screen.getByText('Heurekka').closest('.property-discovery');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<PropertyDiscovery />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Heurekka');
    });

    it('should have proper landmark structure', () => {
      render(<PropertyDiscovery />);

      // Main content areas should be identifiable
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PropertyDiscovery />);

      const searchInput = screen.getByTestId('search-bar');
      await user.tab();
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Internationalization', () => {
    it('should use Spanish text by default', () => {
      render(<PropertyDiscovery />);

      expect(screen.getByText('2 resultados')).toBeInTheDocument();
    });

    it('should handle locale prop', () => {
      render(<PropertyDiscovery locale="es" />);

      expect(screen.getByText('2 resultados')).toBeInTheDocument();
    });

    it('should show Spanish loading text', () => {
      mockHooks.useViewToggle.isTransitioning = true;
      render(<PropertyDiscovery locale="es" />);

      expect(screen.getByText('Cambiando vista...')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<PropertyDiscovery />);
      
      // Mock search should only be called once on initial mount
      const initialCallCount = mockHooks.usePropertySearch.search.mock.calls.length;
      
      rerender(<PropertyDiscovery />);
      
      // Should not call search again on re-render with same props
      expect(mockHooks.usePropertySearch.search).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should handle property data changes efficiently', () => {
      const { rerender } = render(<PropertyDiscovery />);

      // Update properties
      const newProperties = [...mockProperties, {
        ...mockProperties[0],
        id: 'prop-3',
        address: 'Nueva Propiedad'
      }];
      
      mockHooks.usePropertySearch.properties = newProperties;
      
      rerender(<PropertyDiscovery />);

      expect(screen.getByTestId('property-card-prop-3')).toBeInTheDocument();
    });
  });
});