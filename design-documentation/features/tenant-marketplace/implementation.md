---
title: Tenant Marketplace - Implementation Guide
description: Developer implementation guide for the tenant marketplace feature
feature: tenant-marketplace
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Tenant Marketplace - Implementation Guide

## Overview
Technical implementation specifications for building the tenant marketplace feature, including database schema, API endpoints, component architecture, and performance optimizations.

## Table of Contents
1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Real-time Features](#real-time-features)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategy](#testing-strategy)

## Database Schema

### Core Tables

```sql
-- Tenant posts table
CREATE TABLE tenant_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('draft', 'active', 'paused', 'fulfilled', 'expired') DEFAULT 'draft',
  
  -- Budget and timing
  budget_min INTEGER NOT NULL CHECK (budget_min >= 3000),
  budget_max INTEGER NOT NULL CHECK (budget_max <= 100000),
  move_in_date DATE NOT NULL,
  date_flexibility VARCHAR(20), -- 'exact', 'week', 'month'
  lease_duration INTEGER DEFAULT 12, -- months
  urgency VARCHAR(20), -- 'immediate', 'planned', 'flexible'
  
  -- Property preferences
  property_types TEXT[], -- ['house', 'apartment', 'condo']
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(2,1),
  min_area INTEGER, -- square meters
  preferred_areas TEXT[],
  nearby_landmarks TEXT[],
  
  -- Tenant information
  occupants INTEGER NOT NULL DEFAULT 1,
  occupation VARCHAR(255),
  has_pets BOOLEAN DEFAULT false,
  pet_details TEXT,
  needs_parking BOOLEAN DEFAULT false,
  parking_spaces INTEGER,
  
  -- Requirements
  must_haves TEXT[],
  nice_to_haves TEXT[],
  deal_breakers TEXT[],
  description TEXT,
  
  -- Metadata
  quality_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_status (status),
  INDEX idx_budget (budget_min, budget_max),
  INDEX idx_move_date (move_in_date),
  INDEX idx_areas (preferred_areas),
  INDEX idx_expires (expires_at),
  INDEX idx_quality (quality_score DESC)
);

-- Landlord responses table
CREATE TABLE landlord_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES tenant_posts(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
  
  -- Response content
  message TEXT NOT NULL,
  property_ids UUID[], -- References to offered properties
  
  -- Metadata
  read_at TIMESTAMP,
  responded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE KEY unique_response (post_id, landlord_id),
  INDEX idx_post_status (post_id, status),
  INDEX idx_landlord (landlord_id)
);

```

### Supporting Tables

```sql
-- Saved searches for landlords
CREATE TABLE saved_tenant_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  
  -- Search criteria
  budget_min INTEGER,
  budget_max INTEGER,
  areas TEXT[],
  min_occupants INTEGER,
  max_occupants INTEGER,
  property_types TEXT[],
  
  -- Notification preferences
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT true,
  notify_frequency VARCHAR(20), -- 'instant', 'daily', 'weekly'
  
  last_notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_landlord (landlord_id)
);

-- Post reports/flags
CREATE TABLE post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES tenant_posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id),
  reason VARCHAR(50), -- 'spam', 'inappropriate', 'fake', 'other'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  
  INDEX idx_status (status),
  INDEX idx_post (post_id)
);
```

## API Endpoints

### Post Management

```typescript
// POST /api/marketplace/posts
interface CreatePostRequest {
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  dateFlexibility?: 'exact' | 'week' | 'month';
  leaseDuration?: number;
  propertyTypes: PropertyType[];
  bedrooms: number;
  bathrooms: number;
  minArea?: number;
  preferredAreas: string[];
  nearbyLandmarks?: string[];
  occupants: number;
  occupation?: string;
  hasPets: boolean;
  petDetails?: string;
  needsParking: boolean;
  mustHaves: string[];
  niceToHaves: string[];
  dealBreakers: string[];
  description: string;
}

// GET /api/marketplace/posts
interface GetPostsRequest {
  page?: number;
  limit?: number;
  status?: PostStatus;
  budgetMin?: number;
  budgetMax?: number;
  areas?: string[];
  sortBy?: 'recent' | 'budget' | 'moveDate' | 'quality';
}

// PATCH /api/marketplace/posts/:id
interface UpdatePostRequest {
  status?: 'active' | 'paused';
  // Any fields from CreatePostRequest
}

// DELETE /api/marketplace/posts/:id
// Soft delete - marks as deleted but preserves data

// POST /api/marketplace/posts/:id/extend
interface ExtendPostRequest {
  days: number; // Additional days to extend
}

```

### Response Management

```typescript
// POST /api/marketplace/responses
interface CreateResponseRequest {
  postId: string;
  message: string;
  propertyIds?: string[];
}

// GET /api/marketplace/responses
interface GetResponsesRequest {
  postId?: string;
  status?: 'pending' | 'accepted' | 'declined';
  page?: number;
  limit?: number;
}

// PATCH /api/marketplace/responses/:id
interface UpdateResponseRequest {
  status: 'accepted' | 'declined';
}

// POST /api/marketplace/responses/:id/message
interface SendMessageRequest {
  message: string;
  attachments?: string[];
}
```

## Component Architecture

### Post Creation Wizard

```typescript
// PostCreationWizard.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const postSchema = z.object({
  budgetMin: z.number().min(3000),
  budgetMax: z.number().max(100000),
  moveInDate: z.date().min(new Date()),
  // ... rest of schema
});

export const PostCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TenantPost>>({});
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues
  } = useForm({
    resolver: zodResolver(postSchema),
    mode: 'onChange'
  });
  
  const steps = [
    { id: 'basics', title: 'Información Básica', component: BasicsStep },
    { id: 'preferences', title: 'Preferencias', component: PreferencesStep },
    { id: 'details', title: 'Detalles', component: DetailsStep },
    { id: 'requirements', title: 'Requisitos', component: RequirementsStep },
    { id: 'review', title: 'Revisar', component: ReviewStep }
  ];
  
  const handleNext = async () => {
    const stepFields = getStepFields(currentStep);
    const isValid = await trigger(stepFields);
    
    if (isValid) {
      const stepData = getValues(stepFields);
      setFormData({ ...formData, ...stepData });
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleSubmit = async (data: TenantPost) => {
    try {
      const post = await createPost(data);
      router.push(`/marketplace/posts/${post.id}`);
    } catch (error) {
      showError('Error al crear la publicación');
    }
  };
  
  return (
    <div className="wizard-container">
      <ProgressIndicator 
        steps={steps}
        currentStep={currentStep}
      />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {React.createElement(steps[currentStep].component, {
          register,
          errors,
          formData
        })}
        
        <WizardActions
          onPrevious={() => setCurrentStep(currentStep - 1)}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </form>
    </div>
  );
};
```

### Post Card Component

```typescript
// PostCard.tsx
interface PostCardProps {
  post: TenantPost;
  variant?: 'default' | 'compact' | 'detailed';
  onContact?: (postId: string) => void;
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'default',
  onContact,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const isLandlord = user?.role === 'landlord';
  
  const matchScore = useMemo(() => {
    if (!isLandlord) return null;
    return calculateMatchScore(post, user.properties);
  }, [post, user]);
  
  return (
    <Card className={cn('post-card', `post-card--${variant}`)}>
      {matchScore && (
        <Badge className="match-indicator">
          {matchScore}% Match
        </Badge>
      )}
      
      <CardHeader>
        <TenantInfo 
          name={post.user.name}
          occupation={post.occupation}
          verified={post.verified}
        />
        {post.urgency === 'immediate' && (
          <Badge variant="urgent">Urgente</Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <BudgetDisplay
          min={post.budgetMin}
          max={post.budgetMax}
        />
        
        <RequirementsList
          bedrooms={post.bedrooms}
          bathrooms={post.bathrooms}
          areas={post.preferredAreas}
          moveDate={post.moveInDate}
        />
        
        {variant === 'detailed' && (
          <ExpandableSection
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          >
            <Description text={post.description} />
            <RequirementTags
              mustHaves={post.mustHaves}
              niceToHaves={post.niceToHaves}
              dealBreakers={post.dealBreakers}
            />
          </ExpandableSection>
        )}
      </CardContent>
      
      <CardFooter>
        <PostStats
          views={post.viewCount}
          responses={post.responseCount}
          daysActive={calculateDaysActive(post.createdAt)}
        />
        
        {showActions && isLandlord && (
          <Button
            variant="primary"
            onClick={() => onContact?.(post.id)}
          >
            Contactar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

### Response Management

```typescript
// ResponseInbox.tsx
export const ResponseInbox: React.FC = () => {
  const { postId } = useParams();
  const [responses, setResponses] = useState<LandlordResponse[]>([]);
  const [filter, setFilter] = useState<ResponseStatus | 'all'>('all');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  
  const filteredResponses = useMemo(() => {
    if (filter === 'all') return responses;
    return responses.filter(r => r.status === filter);
  }, [responses, filter]);
  
  const handleAccept = async (responseId: string) => {
    try {
      await acceptResponse(responseId);
      
      // Update local state
      setResponses(responses.map(r => 
        r.id === responseId 
          ? { ...r, status: 'accepted' }
          : r
      ));
      
      // Open WhatsApp
      const response = responses.find(r => r.id === responseId);
      if (response) {
        openWhatsApp(response.landlord.phone);
      }
    } catch (error) {
      showError('Error al aceptar respuesta');
    }
  };
  
  return (
    <div className="response-inbox">
      <InboxHeader>
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'accepted', label: 'Aceptadas' },
            { value: 'declined', label: 'Rechazadas' }
          ]}
        />
      </InboxHeader>
      
      <ResponseList>
        {filteredResponses.map(response => (
          <ResponseItem
            key={response.id}
            response={response}
            isSelected={selectedResponse === response.id}
            onSelect={() => setSelectedResponse(response.id)}
            onAccept={() => handleAccept(response.id)}
            onDecline={() => handleDecline(response.id)}
          />
        ))}
      </ResponseList>
      
      {selectedResponse && (
        <ResponseDetail
          response={responses.find(r => r.id === selectedResponse)}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};
```

## State Management

### Marketplace Store

```typescript
// stores/marketplaceStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MarketplaceState {
  // Posts
  posts: TenantPost[];
  myPost: TenantPost | null;
  selectedPost: TenantPost | null;
  
  // Responses
  responses: LandlordResponse[];
  unreadCount: number;
  
  // Filters
  filters: PostFilters;
  sortBy: SortOption;
  
  // Actions
  createPost: (data: CreatePostData) => Promise<TenantPost>;
  updatePost: (id: string, data: Partial<TenantPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  
  fetchPosts: (params?: GetPostsParams) => Promise<void>;
  fetchMyPost: () => Promise<void>;
  fetchResponses: () => Promise<void>;
  
  acceptResponse: (id: string) => Promise<void>;
  declineResponse: (id: string) => Promise<void>;
  
  setFilters: (filters: Partial<PostFilters>) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  devtools(
    persist(
      (set, get) => ({
        posts: [],
        myPost: null,
        selectedPost: null,
        responses: [],
        unreadCount: 0,
        filters: {},
        sortBy: 'recent',
        
        createPost: async (data) => {
          const post = await api.createPost(data);
          set({ myPost: post });
          return post;
        },
        
        updatePost: async (id, data) => {
          await api.updatePost(id, data);
          if (get().myPost?.id === id) {
            set({ myPost: { ...get().myPost!, ...data } });
          }
        },
        
        fetchPosts: async (params) => {
          const posts = await api.getPosts({
            ...get().filters,
            sortBy: get().sortBy,
            ...params
          });
          set({ posts });
        },
        
        acceptResponse: async (id) => {
          await api.updateResponse(id, { status: 'accepted' });
          
          set(state => ({
            responses: state.responses.map(r =>
              r.id === id ? { ...r, status: 'accepted' } : r
            )
          }));
        },
        
        setFilters: (filters) => {
          set(state => ({
            filters: { ...state.filters, ...filters }
          }));
          get().fetchPosts();
        }
      }),
      {
        name: 'marketplace-storage',
        partialize: (state) => ({
          filters: state.filters,
          sortBy: state.sortBy
        })
      }
    )
  )
);
```

## Real-time Features

### WebSocket Integration

```typescript
// hooks/useMarketplaceSocket.ts
export const useMarketplaceSocket = () => {
  const { myPost, addResponse, incrementViewCount } = useMarketplaceStore();
  const socket = useSocket();
  
  useEffect(() => {
    if (!myPost) return;
    
    // Join post room
    socket.emit('join:post', myPost.id);
    
    // Listen for events
    socket.on('response:new', (response: LandlordResponse) => {
      addResponse(response);
      showNotification({
        title: 'Nueva respuesta',
        body: `${response.landlord.name} está interesado en tu perfil`
      });
    });
    
    socket.on('post:viewed', () => {
      incrementViewCount();
    });
    
    return () => {
      socket.emit('leave:post', myPost.id);
      socket.off('response:new');
      socket.off('post:viewed');
    };
  }, [myPost, socket]);
};
```

### Push Notifications

```typescript
// services/notifications.ts
export class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  static async showNotification(title: string, options: NotificationOptions) {
    if (Notification.permission !== 'granted') return;
    
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  
  static async scheduleReminder(post: TenantPost) {
    const dayBeforeExpiry = new Date(post.expiresAt);
    dayBeforeExpiry.setDate(dayBeforeExpiry.getDate() - 1);
    
    await scheduleNotification({
      title: 'Tu publicación expira mañana',
      body: '¿Deseas extenderla por 30 días más?',
      scheduledTime: dayBeforeExpiry,
      data: { postId: post.id, action: 'extend' }
    });
  }
}
```

## Performance Optimization

### Lazy Loading

```typescript
// Lazy load heavy components
const PostCreationWizard = lazy(() => 
  import('./components/PostCreationWizard')
);

const ResponseInbox = lazy(() => 
  import('./components/ResponseInbox')
);

const MarketplaceMap = lazy(() => 
  import('./components/MarketplaceMap')
);
```

### Image Optimization

```typescript
// components/OptimizedImage.tsx
export const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw,
             (max-width: 1200px) 50vw,
             33vw"
    />
  );
};
```

### Query Optimization

```typescript
// hooks/useOptimizedPosts.ts
export const useOptimizedPosts = (filters: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => fetchPosts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    
    // Prefetch next page
    onSuccess: (data) => {
      if (data.hasNextPage) {
        queryClient.prefetchQuery({
          queryKey: ['posts', { ...filters, page: data.page + 1 }],
          queryFn: () => fetchPosts({ ...filters, page: data.page + 1 })
        });
      }
    }
  });
};
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/PostCard.test.tsx
describe('PostCard', () => {
  it('should display budget range correctly', () => {
    const post = createMockPost({
      budgetMin: 8000,
      budgetMax: 12000
    });
    
    render(<PostCard post={post} />);
    
    expect(screen.getByText('L.8,000 - L.12,000')).toBeInTheDocument();
  });
  
  it('should show match score for landlords', () => {
    const post = createMockPost();
    const user = createMockUser({ role: 'landlord' });
    
    mockUseAuth.mockReturnValue({ user });
    
    render(<PostCard post={post} />);
    
    expect(screen.getByText(/\d+% Match/)).toBeInTheDocument();
  });
  
  it('should trigger contact action', async () => {
    const onContact = jest.fn();
    const post = createMockPost();
    
    render(<PostCard post={post} onContact={onContact} />);
    
    await userEvent.click(screen.getByText('Contactar'));
    
    expect(onContact).toHaveBeenCalledWith(post.id);
  });
});
```

### Integration Tests

```typescript
// __tests__/PostCreation.integration.test.tsx
describe('Post Creation Flow', () => {
  it('should complete full post creation', async () => {
    const user = userEvent.setup();
    
    render(<PostCreationWizard />);
    
    // Step 1: Basics
    await user.type(screen.getByLabelText('Presupuesto mínimo'), '8000');
    await user.type(screen.getByLabelText('Presupuesto máximo'), '12000');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 2: Preferences
    await user.click(screen.getByText('Casa'));
    await user.selectOptions(screen.getByLabelText('Habitaciones'), '2');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 3: Details
    await user.type(screen.getByLabelText('Ocupación'), 'Ingeniero');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 4: Requirements
    await user.type(screen.getByLabelText('Imprescindibles'), 'Aire acondicionado');
    await user.click(screen.getByText('Siguiente'));
    
    // Step 5: Review & Submit
    await user.click(screen.getByText('Publicar'));
    
    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith(/\/marketplace\/posts\//);
    });
  });
});
```

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [Interaction Specifications](./interactions.md)
- [Accessibility Requirements](./accessibility.md)
- [Design System](../../design-system/style-guide.md)