import { z } from 'zod';

// Location schema
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  source: z.enum(['gps', 'ip', 'manual'])
});

// Search filters schema
export const SearchFiltersSchema = z.object({
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'commercial'])).optional(),
  bedrooms: z.array(z.number().min(0).max(10)).optional(),
  bathrooms: z.array(z.number().min(0).max(10)).optional(),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.date().optional(),
  petFriendly: z.boolean().optional(),
  furnished: z.boolean().optional(),
  parking: z.boolean().optional()
});

// Search query schema
export const SearchQuerySchema = z.object({
  text: z.string().min(1).max(500),
  location: LocationSchema.optional(),
  filters: SearchFiltersSchema.optional(),
  timestamp: z.number()
});

// Search suggestions request schema
export const SearchSuggestionsInputSchema = z.object({
  query: z.string().min(1).max(200),
  location: LocationSchema.optional(),
  limit: z.number().min(1).max(20).default(5)
});

// Property search input schema
export const PropertySearchInputSchema = z.object({
  query: z.string().optional(),
  location: LocationSchema.optional(),
  filters: SearchFiltersSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date_desc', 'distance']).default('relevance')
});

// Featured properties input schema
export const FeaturedPropertiesInputSchema = z.object({
  limit: z.number().min(1).max(20).default(6),
  location: LocationSchema.optional()
});

// Analytics event schema
export const AnalyticsEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.any()),
  timestamp: z.number(),
  sessionId: z.string().min(1).max(100),
  userId: z.string().optional()
});

// Search profile creation schema
export const CreateSearchProfileSchema = z.object({
  name: z.string().min(2).max(100),
  query: SearchQuerySchema,
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    whatsapp: z.boolean(),
    frequency: z.enum(['instant', 'daily', 'weekly'])
  })
});

// Property save schema
export const SavePropertySchema = z.object({
  propertyId: z.string().uuid()
});

// Validation helper functions
export const validateSearchQuery = (query: unknown) => {
  try {
    return SearchQuerySchema.parse(query);
  } catch (error) {
    throw new Error('Invalid search parameters');
  }
};

export const validateSearchSuggestions = (input: unknown) => {
  try {
    return SearchSuggestionsInputSchema.parse(input);
  } catch (error) {
    throw new Error('Invalid search suggestions parameters');
  }
};

export const validatePropertySearch = (input: unknown) => {
  try {
    return PropertySearchInputSchema.parse(input);
  } catch (error) {
    throw new Error('Invalid property search parameters');
  }
};

export const validateFeaturedProperties = (input: unknown) => {
  try {
    return FeaturedPropertiesInputSchema.parse(input);
  } catch (error) {
    throw new Error('Invalid featured properties parameters');
  }
};

export const validateAnalyticsEvent = (event: unknown) => {
  try {
    return AnalyticsEventSchema.parse(event);
  } catch (error) {
    throw new Error('Invalid analytics event');
  }
};