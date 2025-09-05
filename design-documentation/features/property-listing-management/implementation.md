---
title: Property Listing Management - Implementation Guide
description: Developer handoff documentation for implementing property listing management
feature: property-listing-management
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Property Listing Management - Implementation Guide

## Overview
Complete technical implementation guide for developers building the property listing management feature, including wizard flow, photo management, form validation, and publishing system.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Data Models](#data-models)
5. [Photo Management Implementation](#photo-management-implementation)
6. [Form Validation System](#form-validation-system)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure
PropertyListingManagement/
├── ListingWizard.tsx               // Main wizard container
├── components/
│   ├── Steps/
│   │   ├── PropertyTypeStep.tsx
│   │   ├── LocationStep.tsx
│   │   ├── DetailsStep.tsx
│   │   ├── PricingStep.tsx
│   │   ├── PhotosStep.tsx
│   │   ├── FeaturesStep.tsx
│   │   ├── DescriptionStep.tsx
│   │   └── ReviewStep.tsx
│   ├── Common/
│   │   ├── WizardProgress.tsx
│   │   ├── WizardNavigation.tsx
│   │   ├── StepContainer.tsx
│   │   └── ValidationSummary.tsx
│   ├── Forms/
│   │   ├── AddressInput.tsx
│   │   ├── CounterInput.tsx
│   │   ├── PriceInput.tsx
│   │   ├── RangeSlider.tsx
│   │   └── MultiSelect.tsx
│   ├── PhotoManagement/
│   │   ├── PhotoUploader.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoEditor.tsx
│   │   ├── DragDropZone.tsx
│   │   └── PhotoReorder.tsx
│   ├── RichTextEditor/
│   │   ├── Editor.tsx
│   │   ├── Toolbar.tsx
│   │   ├── FormatButtons.tsx
│   │   └── CharacterCount.tsx
│   ├── Preview/
│   │   ├── ListingPreview.tsx
│   │   ├── DeviceToggle.tsx
│   │   └── LiveUpdates.tsx
│   └── Dashboard/
│       ├── MyListings.tsx
│       ├── ListingCard.tsx
│       ├── ListingActions.tsx
│       └── ListingAnalytics.tsx
├── hooks/
│   ├── useWizardState.ts
│   ├── usePhotoUpload.ts
│   ├── useFormValidation.ts
│   ├── useAutoSave.ts
│   └── useListingAnalytics.ts
├── services/
│   ├── listingAPI.ts
│   ├── photoService.ts
│   ├── geocodingService.ts
│   ├── validationService.ts
│   └── analyticsService.ts
└── utils/
    ├── validators.ts
    ├── formatters.ts
    ├── imageProcessing.ts
    └── constants.ts
```

### Core Components Implementation

#### Listing Wizard Component
```typescript
interface ListingWizardProps {
  listingId?: string; // For editing existing listing
  onComplete: (listing: Listing) => void;
  onExit: () => void;
}

const ListingWizard: React.FC<ListingWizardProps> = ({
  listingId,
  onComplete,
  onExit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [listingData, setListingData] = useState<Partial<Listing>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom hooks
  const { 
    canProceed, 
    validateStep,
    getStepErrors
  } = useFormValidation(listingData, currentStep);
  
  const {
    saveProgress,
    loadProgress,
    clearProgress
  } = useAutoSave(listingData);
  
  // Load existing listing for editing
  useEffect(() => {
    if (listingId) {
      loadExistingListing(listingId);
    } else {
      // Check for saved progress
      const savedData = loadProgress();
      if (savedData) {
        setListingData(savedData);
      }
    }
  }, [listingId]);
  
  // Auto-save on data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress(listingData);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [listingData]);
  
  const handleStepComplete = (stepData: Partial<Listing>) => {
    setListingData(prev => ({ ...prev, ...stepData }));
    
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handlePublish = async () => {
    setIsLoading(true);
    
    try {
      // Final validation
      const isValid = await validateAllSteps(listingData);
      if (!isValid) {
        showValidationSummary();
        return;
      }
      
      // Create or update listing
      const result = listingId
        ? await listingAPI.updateListing(listingId, listingData)
        : await listingAPI.createListing(listingData);
      
      // Clear saved progress
      clearProgress();
      
      // Callback with result
      onComplete(result);
      
      // Show success animation
      showSuccessAnimation();
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyTypeStep
            data={listingData}
            onComplete={handleStepComplete}
            errors={getStepErrors(1)}
          />
        );
      case 2:
        return (
          <LocationStep
            data={listingData}
            onComplete={handleStepComplete}
            errors={getStepErrors(2)}
          />
        );
      case 3:
        return (
          <DetailsStep
            data={listingData}
            propertyType={listingData.propertyType}
            onComplete={handleStepComplete}
            errors={getStepErrors(3)}
          />
        );
      case 4:
        return (
          <PricingStep
            data={listingData}
            onComplete={handleStepComplete}
            errors={getStepErrors(4)}
          />
        );
      case 5:
        return (
          <PhotosStep
            data={listingData}
            onComplete={handleStepComplete}
            errors={getStepErrors(5)}
          />
        );
      case 6:
        return (
          <FeaturesStep
            data={listingData}
            propertyType={listingData.propertyType}
            onComplete={handleStepComplete}
            errors={getStepErrors(6)}
          />
        );
      case 7:
        return (
          <DescriptionStep
            data={listingData}
            onComplete={handleStepComplete}
            errors={getStepErrors(7)}
          />
        );
      case 8:
        return (
          <ReviewStep
            data={listingData}
            onPublish={handlePublish}
            onEdit={(step) => setCurrentStep(step)}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <WizardContainer>
      <WizardHeader>
        <WizardProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          completedSteps={getCompletedSteps(listingData)}
        />
        <CloseButton onClick={onExit} />
      </WizardHeader>
      
      <WizardBody>
        <StepContainer>
          {renderStep()}
        </StepContainer>
        
        {currentStep < 8 && (
          <PreviewPanel>
            <ListingPreview data={listingData} />
          </PreviewPanel>
        )}
      </WizardBody>
      
      <WizardFooter>
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed}
          onPrevious={handlePreviousStep}
          onNext={() => validateStep(currentStep)}
          onSaveDraft={() => saveDraft(listingData)}
        />
      </WizardFooter>
    </WizardContainer>
  );
};
```

#### Photo Upload Component
```typescript
interface PhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  errors?: string[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  errors
}) => {
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const { 
    uploadPhoto, 
    deletePhoto,
    reorderPhotos 
  } = usePhotoUpload();
  
  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validate file count
    if (photos.length + acceptedFiles.length > maxPhotos) {
      showError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
    
    // Process each file
    for (const file of acceptedFiles) {
      const fileId = generateId();
      setUploading(prev => [...prev, fileId]);
      
      try {
        // Create preview
        const preview = await createImagePreview(file);
        
        // Start upload
        const uploadedPhoto = await uploadPhoto(
          file,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress
            }));
          }
        );
        
        // Add to photos array
        onPhotosChange([...photos, uploadedPhoto]);
        
        // Clean up
        setUploading(prev => prev.filter(id => id !== fileId));
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        handleUploadError(error, fileId);
      }
    }
  }, [photos, maxPhotos, uploadPhoto, onPhotosChange]);
  
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const reordered = reorderPhotos(photos, fromIndex, toIndex);
    onPhotosChange(reordered);
  }, [photos, onPhotosChange]);
  
  const handleSetMainPhoto = useCallback((photoId: string) => {
    const updated = photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId
    }));
    onPhotosChange(updated);
  }, [photos, onPhotosChange]);
  
  const handleDeletePhoto = useCallback(async (photoId: string) => {
    if (confirm('Delete this photo?')) {
      try {
        await deletePhoto(photoId);
        onPhotosChange(photos.filter(p => p.id !== photoId));
      } catch (error) {
        showError('Failed to delete photo');
      }
    }
  }, [photos, deletePhoto, onPhotosChange]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });
  
  return (
    <PhotoUploadContainer>
      <UploadRequirements>
        <ul>
          <li>Minimum 3 photos required</li>
          <li>Maximum {maxPhotos} photos</li>
          <li>JPG, PNG, or WebP format</li>
          <li>Maximum 10MB per photo</li>
        </ul>
      </UploadRequirements>
      
      {photos.length < maxPhotos && (
        <DropZone {...getRootProps()} isDragging={isDragActive}>
          <input {...getInputProps()} />
          <UploadIcon />
          <UploadText>
            {isDragActive
              ? 'Drop photos here'
              : 'Drag & drop photos or click to browse'}
          </UploadText>
        </DropZone>
      )}
      
      {(photos.length > 0 || uploading.length > 0) && (
        <PhotoGrid>
          <DndProvider backend={HTML5Backend}>
            {photos.map((photo, index) => (
              <DraggablePhoto
                key={photo.id}
                photo={photo}
                index={index}
                onReorder={handleReorder}
                onSetMain={() => handleSetMainPhoto(photo.id)}
                onEdit={() => openPhotoEditor(photo)}
                onDelete={() => handleDeletePhoto(photo.id)}
              />
            ))}
          </DndProvider>
          
          {uploading.map(fileId => (
            <UploadingPhoto
              key={fileId}
              progress={uploadProgress[fileId] || 0}
            />
          ))}
        </PhotoGrid>
      )}
      
      {errors?.map((error, index) => (
        <ErrorMessage key={index}>{error}</ErrorMessage>
      ))}
    </PhotoUploadContainer>
  );
};
```

## State Management

### Global State Structure
```typescript
// Redux/Context state structure
interface ListingManagementState {
  wizard: {
    currentStep: number;
    completedSteps: number[];
    listingData: Partial<Listing>;
    validationErrors: ValidationErrors;
    isDirty: boolean;
    autoSaveTimestamp: Date | null;
  };
  
  photos: {
    items: Photo[];
    uploading: UploadingPhoto[];
    mainPhotoId: string | null;
    totalSize: number;
  };
  
  listings: {
    items: Listing[];
    filters: ListingFilters;
    sorting: SortOption;
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  
  analytics: {
    selectedListingId: string | null;
    metrics: ListingMetrics;
    dateRange: DateRange;
    loading: boolean;
  };
}

// Actions
const wizardActions = {
  SET_STEP: 'wizard/setStep',
  UPDATE_DATA: 'wizard/updateData',
  VALIDATE_STEP: 'wizard/validateStep',
  SAVE_PROGRESS: 'wizard/saveProgress',
  LOAD_PROGRESS: 'wizard/loadProgress',
  CLEAR_PROGRESS: 'wizard/clearProgress',
  MARK_COMPLETE: 'wizard/markComplete'
};
```

### Wizard State Management Hook
```typescript
const useWizardState = (initialData?: Partial<Listing>) => {
  const [state, dispatch] = useReducer(wizardReducer, {
    currentStep: 1,
    completedSteps: [],
    listingData: initialData || {},
    validationErrors: {},
    isDirty: false
  });
  
  const updateStepData = useCallback((
    step: number,
    data: Partial<Listing>
  ) => {
    dispatch({
      type: 'UPDATE_STEP_DATA',
      payload: { step, data }
    });
    
    // Mark as dirty for auto-save
    dispatch({ type: 'MARK_DIRTY' });
  }, []);
  
  const validateStep = useCallback((step: number): boolean => {
    const validator = getStepValidator(step);
    const errors = validator(state.listingData);
    
    if (Object.keys(errors).length === 0) {
      dispatch({ 
        type: 'MARK_STEP_COMPLETE', 
        payload: step 
      });
      return true;
    } else {
      dispatch({
        type: 'SET_VALIDATION_ERRORS',
        payload: { step, errors }
      });
      return false;
    }
  }, [state.listingData]);
  
  const canProceed = useCallback((step: number): boolean => {
    const requiredFields = getRequiredFields(step);
    return requiredFields.every(field => 
      hasValue(state.listingData[field])
    );
  }, [state.listingData]);
  
  // Auto-save
  useEffect(() => {
    if (state.isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          'listing-draft',
          JSON.stringify(state.listingData)
        );
        dispatch({ type: 'MARK_SAVED' });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isDirty, state.listingData]);
  
  return {
    ...state,
    updateStepData,
    validateStep,
    canProceed,
    goToStep: (step: number) => dispatch({ 
      type: 'SET_STEP', 
      payload: step 
    })
  };
};
```

## API Integration

### Listing API Service
```typescript
class ListingAPIService {
  private baseURL = process.env.REACT_APP_API_URL;
  
  // Create new listing
  async createListing(data: Partial<Listing>): Promise<Listing> {
    const response = await fetch(`${this.baseURL}/listings`, {
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
  
  // Update existing listing
  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    const response = await fetch(`${this.baseURL}/listings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
  
  // Get user's listings
  async getMyListings(params: ListingQueryParams): Promise<ListingResponse> {
    const queryString = new URLSearchParams(params).toString();
    
    const response = await fetch(`${this.baseURL}/listings/my?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.json();
  }
  
  // Update listing status
  async updateListingStatus(
    id: string,
    status: 'active' | 'paused' | 'rented'
  ): Promise<void> {
    await fetch(`${this.baseURL}/listings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ status })
    });
  }
  
  // Get listing analytics
  async getListingAnalytics(
    id: string,
    dateRange: DateRange
  ): Promise<ListingAnalytics> {
    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    });
    
    const response = await fetch(
      `${this.baseURL}/listings/${id}/analytics?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    return response.json();
  }
}
```

### Photo Upload Service
```typescript
class PhotoUploadService {
  private uploadQueue: UploadTask[] = [];
  private maxConcurrent = 3;
  private activeUploads = 0;
  
  async uploadPhoto(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Photo> {
    return new Promise((resolve, reject) => {
      const task: UploadTask = {
        file,
        onProgress,
        resolve,
        reject
      };
      
      this.uploadQueue.push(task);
      this.processQueue();
    });
  }
  
  private async processQueue() {
    while (this.uploadQueue.length > 0 && this.activeUploads < this.maxConcurrent) {
      const task = this.uploadQueue.shift();
      if (task) {
        this.activeUploads++;
        this.executeUpload(task).finally(() => {
          this.activeUploads--;
          this.processQueue();
        });
      }
    }
  }
  
  private async executeUpload(task: UploadTask) {
    try {
      // Process image
      const processed = await this.processImage(task.file);
      
      // Create FormData
      const formData = new FormData();
      formData.append('photo', processed.blob);
      formData.append('metadata', JSON.stringify({
        originalName: task.file.name,
        width: processed.width,
        height: processed.height,
        size: processed.blob.size
      }));
      
      // Upload with progress tracking
      const photo = await this.uploadWithProgress(
        formData,
        task.onProgress
      );
      
      task.resolve(photo);
    } catch (error) {
      task.reject(error);
    }
  }
  
  private async processImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        // Calculate dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Resize
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          resolve({
            blob: blob!,
            width,
            height
          });
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  private async uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Photo> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('POST', `${process.env.REACT_APP_API_URL}/photos/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
      xhr.send(formData);
    });
  }
}
```

## Data Models

### TypeScript Interfaces
```typescript
// Core listing model
interface Listing {
  id: string;
  owner: {
    id: string;
    name: string;
    verified: boolean;
    responseTime: number;
  };
  
  // Basic Information
  title: string;
  type: PropertyType;
  status: ListingStatus;
  
  // Location
  address: Address;
  coordinates: Coordinates;
  neighborhood: string;
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  area: number; // m²
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition: PropertyCondition;
  
  // Pricing
  price: number;
  currency: 'HNL';
  priceIncludes: string[];
  deposit: number;
  
  // Features & Amenities
  features: Feature[];
  amenities: string[];
  utilities: Utility[];
  restrictions: string[];
  
  // Media
  photos: Photo[];
  videos?: Video[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  
  // Description
  description: string;
  highlights: string[];
  nearbyPlaces: NearbyPlace[];
  
  // Availability
  availableFrom: Date;
  minimumStay: number; // months
  maximumStay?: number;
  
  // Requirements
  tenantRequirements: TenantRequirements;
  
  // Analytics
  stats: ListingStats;
  qualityScore: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt: Date;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  caption?: string;
  isMain: boolean;
  order: number;
  uploadedAt: Date;
}

interface Address {
  street: string;
  unit?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface TenantRequirements {
  minIncome?: number;
  maxOccupants: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  studentsAllowed: boolean;
  references: boolean;
  employmentProof: boolean;
  guarantor?: boolean;
}

interface ListingStats {
  views: number;
  uniqueViews: number;
  favorites: number;
  contacts: number;
  averageViewTime: number;
  conversionRate: number;
}

// Enums
enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  ROOM = 'room',
  STUDIO = 'studio',
  LOFT = 'loft'
}

enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  RENTED = 'rented',
  EXPIRED = 'expired'
}

enum PropertyCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  NEEDS_WORK = 'needs_work'
}
```

## Form Validation System

### Validation Rules
```typescript
class ListingValidator {
  private rules: ValidationRules = {
    propertyType: {
      required: true,
      enum: Object.values(PropertyType)
    },
    address: {
      required: true,
      custom: this.validateAddress
    },
    price: {
      required: true,
      min: 1000,
      max: 100000,
      type: 'number'
    },
    bedrooms: {
      required: true,
      min: 0,
      max: 20,
      type: 'integer'
    },
    bathrooms: {
      required: true,
      min: 0,
      max: 10,
      step: 0.5,
      type: 'number'
    },
    area: {
      required: true,
      min: 10,
      max: 10000,
      type: 'number'
    },
    photos: {
      required: true,
      minLength: 3,
      maxLength: 20,
      custom: this.validatePhotos
    },
    description: {
      required: true,
      minLength: 100,
      maxLength: 2000,
      type: 'string'
    }
  };
  
  validateStep(step: number, data: Partial<Listing>): ValidationErrors {
    const stepFields = this.getStepFields(step);
    const errors: ValidationErrors = {};
    
    for (const field of stepFields) {
      const rule = this.rules[field];
      if (rule) {
        const error = this.validateField(field, data[field], rule);
        if (error) {
          errors[field] = error;
        }
      }
    }
    
    return errors;
  }
  
  private validateField(
    name: string,
    value: any,
    rule: FieldRule
  ): string | null {
    // Required check
    if (rule.required && !value) {
      return `${this.getFieldLabel(name)} is required`;
    }
    
    if (!value && !rule.required) {
      return null;
    }
    
    // Type check
    if (rule.type) {
      const type = typeof value;
      if (rule.type === 'integer' && !Number.isInteger(value)) {
        return `${this.getFieldLabel(name)} must be a whole number`;
      }
      if (rule.type !== 'integer' && type !== rule.type) {
        return `${this.getFieldLabel(name)} must be a ${rule.type}`;
      }
    }
    
    // Min/max checks
    if (rule.min !== undefined && value < rule.min) {
      return `${this.getFieldLabel(name)} must be at least ${rule.min}`;
    }
    
    if (rule.max !== undefined && value > rule.max) {
      return `${this.getFieldLabel(name)} must be at most ${rule.max}`;
    }
    
    // Length checks
    if (rule.minLength && value.length < rule.minLength) {
      return `${this.getFieldLabel(name)} must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${this.getFieldLabel(name)} must be at most ${rule.maxLength} characters`;
    }
    
    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }
    
    return null;
  }
  
  private validateAddress(address: Address): string | null {
    if (!address.street || !address.city) {
      return 'Complete address is required';
    }
    
    // Verify with geocoding service
    // This would be async in real implementation
    return null;
  }
  
  private validatePhotos(photos: Photo[]): string | null {
    if (photos.length < 3) {
      return 'At least 3 photos are required';
    }
    
    const hasMainPhoto = photos.some(p => p.isMain);
    if (!hasMainPhoto) {
      return 'Please select a main photo';
    }
    
    return null;
  }
  
  calculateQualityScore(listing: Listing): number {
    let score = 0;
    const weights = {
      photos: 25,
      description: 20,
      completeness: 20,
      features: 15,
      pricing: 10,
      responsiveness: 10
    };
    
    // Photo score
    const photoScore = Math.min(listing.photos.length / 10, 1) * weights.photos;
    score += photoScore;
    
    // Description score
    const descLength = listing.description.length;
    const descScore = Math.min(descLength / 500, 1) * weights.description;
    score += descScore;
    
    // Completeness score
    const filledFields = Object.keys(listing).filter(key => 
      listing[key] !== null && listing[key] !== undefined
    );
    const completeness = filledFields.length / 30; // Total expected fields
    score += completeness * weights.completeness;
    
    // Features score
    const featureCount = listing.features.length + listing.amenities.length;
    const featureScore = Math.min(featureCount / 20, 1) * weights.features;
    score += featureScore;
    
    // Pricing competitiveness
    // This would check against market rates
    score += weights.pricing * 0.8; // Placeholder
    
    // Owner responsiveness
    const responseScore = listing.owner.responseTime < 60 ? 1 : 0.5;
    score += responseScore * weights.responsiveness;
    
    return Math.round(score);
  }
}
```

## Performance Optimization

### Image Optimization
```typescript
// Image processing and caching
class ImageOptimizer {
  private cache = new Map<string, string>();
  private worker: Worker;
  
  constructor() {
    // Use Web Worker for image processing
    this.worker = new Worker('/workers/imageProcessor.js');
  }
  
  async optimizeImage(file: File): Promise<OptimizedImage> {
    return new Promise((resolve) => {
      const id = generateId();
      
      this.worker.postMessage({
        id,
        file,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9
      });
      
      this.worker.addEventListener('message', (e) => {
        if (e.data.id === id) {
          resolve(e.data.result);
        }
      });
    });
  }
  
  generateThumbnail(url: string, size = 300): string {
    const cacheKey = `${url}-${size}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Use CDN transformation
    const thumbnail = `${url}?w=${size}&h=${size}&fit=crop`;
    this.cache.set(cacheKey, thumbnail);
    
    return thumbnail;
  }
  
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
}

// Lazy loading component
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imageRef) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc || '/placeholder.jpg'}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
```

### Form Performance
```typescript
// Debounced validation
const useDebouncedValidation = (
  value: any,
  validator: (value: any) => string | null,
  delay = 500
) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  useEffect(() => {
    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
      setIsValidating(false);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, validator, delay]);
  
  return { error, isValidating };
};

// Optimized form field
const OptimizedField: React.FC<FieldProps> = memo(({
  name,
  value,
  onChange,
  validator,
  ...props
}) => {
  const { error, isValidating } = useDebouncedValidation(value, validator);
  
  return (
    <FormField>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      />
      {isValidating && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormField>
  );
});
```

## Testing Strategy

### Component Tests
```typescript
// Wizard component tests
describe('ListingWizard', () => {
  it('should navigate through steps correctly', async () => {
    const { getByText, getByRole } = render(
      <ListingWizard onComplete={jest.fn()} onExit={jest.fn()} />
    );
    
    // Step 1: Property Type
    expect(getByText('Select Property Type')).toBeInTheDocument();
    
    const houseOption = getByRole('button', { name: /house/i });
    fireEvent.click(houseOption);
    
    const nextButton = getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Step 2: Location
    await waitFor(() => {
      expect(getByText('Property Location')).toBeInTheDocument();
    });
  });
  
  it('should validate required fields', async () => {
    const { getByRole, getByText } = render(
      <ListingWizard onComplete={jest.fn()} onExit={jest.fn()} />
    );
    
    // Try to proceed without selecting type
    const nextButton = getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(getByText('Property type is required')).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });
  
  it('should handle photo uploads', async () => {
    const { getByText } = render(<PhotoUpload photos={[]} onPhotosChange={jest.fn()} />);
    
    const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]');
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(getByText('Uploading...')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests
```typescript
// API integration tests
describe('Listing Creation Flow', () => {
  beforeEach(() => {
    fetchMock.reset();
  });
  
  it('should create listing successfully', async () => {
    fetchMock.post('/api/listings', {
      status: 201,
      body: mockListing
    });
    
    const result = await listingAPI.createListing(mockListingData);
    
    expect(result.id).toBeDefined();
    expect(fetchMock.called('/api/listings')).toBe(true);
  });
  
  it('should handle validation errors', async () => {
    fetchMock.post('/api/listings', {
      status: 400,
      body: { errors: { price: 'Price is too low' } }
    });
    
    await expect(
      listingAPI.createListing(invalidListingData)
    ).rejects.toThrow('Validation failed');
  });
});
```

### E2E Tests
```typescript
// Cypress E2E tests
describe('Property Listing Creation E2E', () => {
  it('should complete full listing creation flow', () => {
    cy.login();
    cy.visit('/listings/create');
    
    // Step 1: Property Type
    cy.get('[data-testid="type-apartment"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 2: Location
    cy.get('[data-testid="address-input"]').type('123 Main Street');
    cy.get('[data-testid="suggestion-0"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 3: Details
    cy.get('[data-testid="bedrooms-counter"]').find('.increment').click();
    cy.get('[data-testid="bathrooms-counter"]').find('.increment').click();
    cy.get('[data-testid="area-input"]').type('75');
    cy.get('[data-testid="next-button"]').click();
    
    // Step 4: Pricing
    cy.get('[data-testid="price-input"]').type('15000');
    cy.get('[data-testid="deposit-1month"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 5: Photos
    cy.fixture('property-photo.jpg').then(fileContent => {
      cy.get('[data-testid="photo-upload"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'property-photo.jpg',
        mimeType: 'image/jpeg'
      });
    });
    
    cy.wait('@photoUpload');
    cy.get('[data-testid="next-button"]').click();
    
    // Step 6: Features
    cy.get('[data-testid="feature-parking"]').click();
    cy.get('[data-testid="feature-ac"]').click();
    cy.get('[data-testid="next-button"]').click();
    
    // Step 7: Description
    cy.get('[data-testid="description-editor"]').type(
      'Beautiful apartment in the heart of the city...'
    );
    cy.get('[data-testid="next-button"]').click();
    
    // Step 8: Review & Publish
    cy.get('[data-testid="publish-button"]').click();
    
    // Verify success
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.url().should('include', '/listings/my');
  });
});
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (>85% coverage)
- [ ] Form validation comprehensive
- [ ] Photo upload optimized
- [ ] Auto-save functionality tested
- [ ] API endpoints secured
- [ ] Rate limiting configured
- [ ] CDN configured for images

### Performance Targets
- [ ] Wizard step transition < 300ms
- [ ] Photo upload feedback < 100ms
- [ ] Form validation feedback < 500ms
- [ ] Auto-save within 2 seconds
- [ ] Image optimization < 2 seconds
- [ ] Total bundle size < 400kb

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Upload success rates
- [ ] Validation error patterns
- [ ] User drop-off points
- [ ] Conversion metrics

### Production Configuration
```javascript
// Environment variables
REACT_APP_API_URL=https://api.heurekka.com
REACT_APP_CDN_URL=https://cdn.heurekka.com
REACT_APP_MAX_PHOTO_SIZE=10485760
REACT_APP_MAX_PHOTOS=20
REACT_APP_IMAGE_QUALITY=0.9
REACT_APP_GEOCODING_API_KEY=xxx

// Performance budgets
{
  "bundles": [
    {
      "name": "listing-wizard",
      "maxSize": "250kb"
    },
    {
      "name": "photo-upload",
      "maxSize": "150kb"
    }
  ],
  "metrics": {
    "FCP": 1500,
    "TTI": 3000,
    "CLS": 0.1
  }
}

// Image optimization config
{
  "formats": ["webp", "jpeg"],
  "sizes": [320, 640, 1280, 1920],
  "quality": {
    "thumbnail": 70,
    "preview": 80,
    "full": 90
  }
}
```

## Related Documentation
- [User Journey](./user-journey.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Accessibility](./accessibility.md)
- [Design System](../../design-system/style-guide.md)