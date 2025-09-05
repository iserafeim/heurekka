---
title: Search Profile Creation - Implementation Guide
description: Developer handoff documentation for implementing search profile creation
feature: search-profile-creation
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Search Profile Creation - Implementation Guide

## Overview
Complete technical implementation guide for developers building the search profile creation feature, including component structure, state management, API integration, and performance optimization.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Data Models](#data-models)
5. [Performance Optimization](#performance-optimization)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure
SearchProfileCreation/
├── SearchProfileWizard.tsx         // Main container
├── steps/
│   ├── BasicCriteria.tsx          // Step 1
│   ├── LocationSelection.tsx      // Step 2
│   ├── AdvancedFilters.tsx       // Step 3
│   ├── NotificationSettings.tsx   // Step 4
│   └── ReviewConfirm.tsx         // Step 5
├── components/
│   ├── ProgressIndicator.tsx
│   ├── StepNavigation.tsx
│   ├── LocationMap.tsx
│   ├── BudgetSlider.tsx
│   ├── FilterChips.tsx
│   └── ProfileSummary.tsx
├── hooks/
│   ├── useProfileCreation.ts
│   ├── useAutoSave.ts
│   ├── useLocationSearch.ts
│   └── useValidation.ts
└── utils/
    ├── validation.ts
    ├── formatters.ts
    └── constants.ts
```

### Core Components Implementation

#### SearchProfileWizard Component
```typescript
interface SearchProfileWizardProps {
  userId: string;
  onComplete: (profileId: string) => void;
  onCancel: () => void;
  initialData?: Partial<SearchProfile>;
}

const SearchProfileWizard: React.FC<SearchProfileWizardProps> = ({
  userId,
  onComplete,
  onCancel,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SearchProfileData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Auto-save hook
  useAutoSave(formData, userId);
  
  // Validation
  const validateStep = (step: number): boolean => {
    const stepErrors = validateStepData(step, formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  // Step component mapping
  const stepComponents = [
    <BasicCriteria data={formData} onChange={updateFormData} errors={errors} />,
    <LocationSelection data={formData} onChange={updateFormData} errors={errors} />,
    <AdvancedFilters data={formData} onChange={updateFormData} errors={errors} />,
    <NotificationSettings data={formData} onChange={updateFormData} errors={errors} />,
    <ReviewConfirm data={formData} onEdit={handleEdit} />
  ];
  
  return (
    <div className="search-profile-wizard">
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
      />
      
      <div className="wizard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {stepComponents[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <StepNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onCancel={onCancel}
        onComplete={handleComplete}
        canProgress={isStepValid(currentStep)}
      />
    </div>
  );
};
```

#### LocationMap Component
```typescript
interface LocationMapProps {
  selectedAreas: GeoArea[];
  onAreaSelect: (area: GeoArea) => void;
  onAreaRemove: (areaId: string) => void;
  searchCenter?: LatLng;
}

const LocationMap: React.FC<LocationMapProps> = ({
  selectedAreas,
  onAreaSelect,
  onAreaRemove,
  searchCenter
}) => {
  const mapRef = useRef<MapInstance>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [currentPolygon, setCurrentPolygon] = useState<LatLng[]>([]);
  
  // Initialize map
  useEffect(() => {
    if (mapRef.current) {
      initializeMap(mapRef.current, {
        center: searchCenter || DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        controls: {
          zoom: true,
          draw: true,
          search: true
        }
      });
    }
  }, []);
  
  // Drawing handlers
  const handleDrawStart = () => {
    setCurrentPolygon([]);
    setDrawingMode('polygon');
  };
  
  const handleDrawComplete = (polygon: LatLng[]) => {
    const area: GeoArea = {
      id: generateId(),
      type: 'polygon',
      coordinates: polygon,
      name: 'Custom Area',
      timestamp: Date.now()
    };
    onAreaSelect(area);
    setDrawingMode('none');
  };
  
  // Render selected areas
  const renderAreas = () => {
    return selectedAreas.map(area => (
      <MapPolygon
        key={area.id}
        coordinates={area.coordinates}
        fillColor="rgba(99, 102, 241, 0.2)"
        strokeColor="#6366F1"
        strokeWidth={2}
        onClick={() => handleAreaClick(area)}
      />
    ));
  };
  
  return (
    <div className="location-map-container">
      <div className="map-controls">
        <button 
          className="draw-button"
          onClick={handleDrawStart}
          disabled={drawingMode !== 'none'}
        >
          Draw Area
        </button>
        <button 
          className="clear-button"
          onClick={clearAllAreas}
          disabled={selectedAreas.length === 0}
        >
          Clear All
        </button>
      </div>
      
      <div ref={mapRef} className="map-instance">
        {renderAreas()}
        {drawingMode === 'polygon' && (
          <DrawingLayer
            onComplete={handleDrawComplete}
            onCancel={() => setDrawingMode('none')}
          />
        )}
      </div>
      
      <div className="selected-areas-list">
        {selectedAreas.map(area => (
          <AreaChip
            key={area.id}
            area={area}
            onRemove={() => onAreaRemove(area.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

## State Management

### Global State Structure
```typescript
// Redux/Zustand store structure
interface AppState {
  searchProfiles: {
    profiles: SearchProfile[];
    activeProfile: string | null;
    draft: Partial<SearchProfileData> | null;
    isCreating: boolean;
    error: string | null;
  };
  user: {
    id: string;
    preferences: UserPreferences;
  };
  ui: {
    wizardStep: number;
    validationErrors: ValidationErrors;
    isAutoSaving: boolean;
  };
}

// Actions
const searchProfileActions = {
  CREATE_PROFILE_START: 'searchProfiles/createStart',
  CREATE_PROFILE_SUCCESS: 'searchProfiles/createSuccess',
  CREATE_PROFILE_FAILURE: 'searchProfiles/createFailure',
  UPDATE_DRAFT: 'searchProfiles/updateDraft',
  SAVE_DRAFT: 'searchProfiles/saveDraft',
  CLEAR_DRAFT: 'searchProfiles/clearDraft',
  SET_ACTIVE_PROFILE: 'searchProfiles/setActive',
  DELETE_PROFILE: 'searchProfiles/delete'
};
```

### Local Component State
```typescript
// Form state management
const useProfileFormState = (initialData?: Partial<SearchProfileData>) => {
  const [formData, setFormData] = useState<SearchProfileData>({
    // Basic criteria
    propertyTypes: [],
    locations: [],
    budgetMin: 0,
    budgetMax: 0,
    bedrooms: { min: 1, max: null },
    bathrooms: { min: 1, max: null },
    
    // Advanced filters
    features: [],
    amenities: [],
    dealBreakers: [],
    preferredFeatures: [],
    
    // Notifications
    notificationChannels: {
      email: { enabled: false, frequency: 'daily' },
      push: { enabled: false, immediate: true },
      sms: { enabled: false, immediate: false }
    },
    
    // Metadata
    profileName: '',
    notes: '',
    isActive: true,
    ...initialData
  });
  
  const updateField = useCallback((
    field: keyof SearchProfileData,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const updateNestedField = useCallback((
    path: string,
    value: any
  ) => {
    setFormData(prev => {
      const updated = { ...prev };
      setNestedValue(updated, path, value);
      return updated;
    });
  }, []);
  
  return {
    formData,
    updateField,
    updateNestedField,
    resetForm: () => setFormData(initialData || {})
  };
};
```

## API Integration

### API Endpoints
```typescript
// API service layer
class SearchProfileAPI {
  private baseURL = process.env.REACT_APP_API_URL;
  
  // Create profile
  async createProfile(data: SearchProfileData): Promise<SearchProfile> {
    const response = await fetch(`${this.baseURL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
  
  // Save draft
  async saveDraft(userId: string, data: Partial<SearchProfileData>): Promise<void> {
    await fetch(`${this.baseURL}/profiles/draft`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ userId, data })
    });
  }
  
  // Get draft
  async getDraft(userId: string): Promise<Partial<SearchProfileData> | null> {
    const response = await fetch(`${this.baseURL}/profiles/draft/${userId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (response.status === 404) {
      return null;
    }
    
    return response.json();
  }
  
  // Validate location
  async validateLocation(location: string): Promise<LocationValidation> {
    const response = await fetch(`${this.baseURL}/locations/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ location })
    });
    
    return response.json();
  }
  
  // Get match preview
  async getMatchPreview(criteria: SearchCriteria): Promise<MatchPreview> {
    const response = await fetch(`${this.baseURL}/profiles/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(criteria)
    });
    
    return response.json();
  }
}
```

### Request/Response Handling
```typescript
// Custom hooks for API calls
const useCreateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new SearchProfileAPI();
  
  const createProfile = async (data: SearchProfileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await api.createProfile(data);
      
      // Track analytics
      trackEvent('profile_created', {
        profileId: profile.id,
        criteriaCount: Object.keys(data).length
      });
      
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create profile';
      setError(message);
      
      // Log error
      logError('profile_creation_failed', err);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { createProfile, isLoading, error };
};
```

## Data Models

### TypeScript Interfaces
```typescript
// Core data models
interface SearchProfile {
  id: string;
  userId: string;
  name: string;
  criteria: SearchCriteria;
  notifications: NotificationSettings;
  metadata: ProfileMetadata;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface SearchCriteria {
  propertyTypes: PropertyType[];
  locations: Location[];
  budget: BudgetRange;
  size: SizeRange;
  features: Feature[];
  amenities: Amenity[];
  dealBreakers: string[];
}

interface Location {
  id: string;
  type: 'city' | 'neighborhood' | 'polygon' | 'radius';
  name: string;
  coordinates?: LatLng[];
  center?: LatLng;
  radius?: number;
}

interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

interface NotificationSettings {
  channels: {
    email: ChannelSettings;
    push: ChannelSettings;
    sms: ChannelSettings;
  };
  quietHours?: {
    start: string; // HH:mm format
    end: string;
  };
  urgencyThreshold: 'all' | 'high' | 'critical';
}

interface ChannelSettings {
  enabled: boolean;
  frequency?: 'instant' | 'daily' | 'weekly';
  verified?: boolean;
}

// Enums
enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

enum Feature {
  PARKING = 'parking',
  GARAGE = 'garage',
  POOL = 'pool',
  GYM = 'gym',
  BALCONY = 'balcony',
  GARDEN = 'garden',
  SECURITY = 'security',
  ELEVATOR = 'elevator'
}
```

### Validation Schemas
```typescript
// Using Yup for validation
import * as yup from 'yup';

const searchProfileSchema = yup.object({
  name: yup.string()
    .required('Profile name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters'),
    
  propertyTypes: yup.array()
    .of(yup.string().oneOf(Object.values(PropertyType)))
    .min(1, 'Select at least one property type')
    .required('Property type is required'),
    
  locations: yup.array()
    .of(yup.object({
      type: yup.string().required(),
      name: yup.string().required(),
      coordinates: yup.array().optional()
    }))
    .min(1, 'Select at least one location')
    .required('Location is required'),
    
  budget: yup.object({
    min: yup.number()
      .positive('Minimum budget must be positive')
      .required('Minimum budget is required'),
    max: yup.number()
      .positive('Maximum budget must be positive')
      .moreThan(yup.ref('min'), 'Maximum must be greater than minimum')
      .required('Maximum budget is required')
  }).required(),
  
  notifications: yup.object({
    channels: yup.object({
      email: yup.object({
        enabled: yup.boolean(),
        frequency: yup.string().when('enabled', {
          is: true,
          then: yup.string().required('Email frequency is required')
        })
      })
    })
  })
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const LocationMap = lazy(() => import('./components/LocationMap'));
const AdvancedFilters = lazy(() => import('./steps/AdvancedFilters'));

// Route-based splitting
const routes = [
  {
    path: '/profile/create',
    component: lazy(() => import('./SearchProfileWizard'))
  },
  {
    path: '/profile/manage',
    component: lazy(() => import('./ProfileManagement'))
  }
];
```

### Memoization
```typescript
// Memoize expensive calculations
const useMatchCount = (criteria: SearchCriteria) => {
  return useMemo(() => {
    return calculateMatchCount(criteria);
  }, [
    criteria.propertyTypes,
    criteria.locations,
    criteria.budget,
    criteria.features
  ]);
};

// Memoize components
const ProfileSummaryCard = memo(({ profile }: { profile: SearchProfile }) => {
  return (
    <div className="profile-card">
      {/* Component content */}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.profile.id === nextProps.profile.id &&
         prevProps.profile.updatedAt === nextProps.profile.updatedAt;
});
```

### Debouncing and Throttling
```typescript
// Debounce auto-save
const useAutoSave = (data: any, delay = 1000) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const debouncedSave = useMemo(
    () => debounce(async (data: any) => {
      setIsSaving(true);
      try {
        await saveData(data);
      } finally {
        setIsSaving(false);
      }
    }, delay),
    [delay]
  );
  
  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);
  
  return isSaving;
};

// Throttle map updates
const throttledMapUpdate = throttle((bounds: MapBounds) => {
  updateMapMarkers(bounds);
}, 200);
```

### Virtual Scrolling
```typescript
// Virtual list for large result sets
import { FixedSizeList } from 'react-window';

const PropertyList = ({ properties }: { properties: Property[] }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={properties.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Testing Strategy

### Unit Tests
```typescript
// Component testing
describe('SearchProfileWizard', () => {
  it('should render all steps', () => {
    const { getByText } = render(<SearchProfileWizard />);
    expect(getByText('Basic Information')).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    const { getByRole, findByText } = render(<SearchProfileWizard />);
    const nextButton = getByRole('button', { name: /next/i });
    
    fireEvent.click(nextButton);
    
    const error = await findByText('Property type is required');
    expect(error).toBeInTheDocument();
  });
  
  it('should auto-save progress', async () => {
    const saveSpy = jest.spyOn(api, 'saveDraft');
    const { getByLabelText } = render(<SearchProfileWizard />);
    
    const input = getByLabelText('Profile Name');
    fireEvent.change(input, { target: { value: 'My Profile' } });
    
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});
```

### Integration Tests
```typescript
// API integration testing
describe('Profile Creation Flow', () => {
  it('should create profile successfully', async () => {
    const mockProfile = { id: '123', name: 'Test Profile' };
    server.use(
      rest.post('/api/profiles', (req, res, ctx) => {
        return res(ctx.json(mockProfile));
      })
    );
    
    const { result } = renderHook(() => useCreateProfile());
    
    const profile = await result.current.createProfile(validFormData);
    expect(profile.id).toBe('123');
  });
});
```

### E2E Tests
```typescript
// Cypress E2E tests
describe('Search Profile Creation E2E', () => {
  it('should complete full profile creation flow', () => {
    cy.visit('/profile/create');
    
    // Step 1: Basic criteria
    cy.get('[data-testid="property-type-house"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 2: Location
    cy.get('[data-testid="location-search"]').type('San Francisco');
    cy.get('[data-testid="location-suggestion-0"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 3: Budget
    cy.get('[data-testid="budget-min"]').type('2000');
    cy.get('[data-testid="budget-max"]').type('3500');
    cy.get('[data-testid="next-button"]').click();
    
    // Step 4: Notifications
    cy.get('[data-testid="email-notifications"]').check();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 5: Review and confirm
    cy.get('[data-testid="profile-name"]').type('My SF Search');
    cy.get('[data-testid="save-button"]').click();
    
    // Verify success
    cy.url().should('include', '/profile/success');
    cy.contains('Profile created successfully').should('be.visible');
  });
});
```

## Deployment Checklist

### Pre-deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Performance budget met
- [ ] Security review completed
- [ ] Code review approved
- [ ] Documentation updated

### Performance Metrics
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size < 200KB (gzipped)
- [ ] 95% Lighthouse score

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics events implemented
- [ ] Performance monitoring enabled
- [ ] User session recording setup
- [ ] A/B testing framework ready

### Rollout Strategy
```typescript
// Feature flag configuration
const featureFlags = {
  searchProfileCreation: {
    enabled: true,
    rolloutPercentage: 100,
    userGroups: ['all'],
    excludeGroups: [],
    overrides: {
      beta_users: true,
      internal_users: true
    }
  }
};

// Gradual rollout
const rolloutSchedule = [
  { date: '2024-01-15', percentage: 10, groups: ['beta'] },
  { date: '2024-01-17', percentage: 25, groups: ['beta', 'early_adopters'] },
  { date: '2024-01-20', percentage: 50, groups: ['all'] },
  { date: '2024-01-25', percentage: 100, groups: ['all'] }
];
```

## Related Documentation
- [User Journey](./user-journey.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Accessibility](./accessibility.md)
- [Design System](../../design-system/style-guide.md)