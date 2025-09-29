/**
 * Smart Search Parser - Converts natural language queries into structured filters
 * Examples:
 * - "apartamentos de 2 habitaciones" → type: apartment, bedrooms: 2
 * - "casa con 3 cuartos en Tegucigalpa" → type: house, bedrooms: 3, location: Tegucigalpa
 * - "studio bajo 15000 lempiras" → type: studio, maxPrice: 15000
 */

interface ParsedSearch {
  location?: string;
  propertyTypes?: string[];
  bedrooms?: number[];
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  originalQuery: string;
}

// Property type mappings (Spanish to Backend Enum)
const PROPERTY_TYPE_KEYWORDS = {
  apartment: ['apartamento', 'apartamentos', 'apto', 'aptos', 'depto', 'deptos', 'condo', 'condos', 'condominio', 'condominios'],
  house: ['casa', 'casas', 'vivienda', 'viviendas', 'townhouse', 'townhouses', 'casa adosada', 'casas adosadas'],
  room: ['studio', 'studios', 'estudio', 'estudios', 'habitacion individual', 'cuarto'],
  commercial: ['oficina', 'oficinas', 'local', 'locales', 'comercial', 'negocio']
};

// Bedroom keywords
const BEDROOM_KEYWORDS = [
  'habitacion', 'habitaciones', 'cuarto', 'cuartos', 'dormitorio', 'dormitorios',
  'recamara', 'recamaras', 'bedroom', 'bedrooms'
];

// Price keywords
const PRICE_KEYWORDS = {
  under: ['bajo', 'menor', 'menos de', 'máximo', 'max', 'hasta', 'under', 'below'],
  over: ['sobre', 'mayor', 'más de', 'mínimo', 'min', 'desde', 'over', 'above'],
  currency: ['lempiras', 'lps', 'l', 'pesos', 'dolares', 'dollars', '$']
};

// Feature keywords
const FEATURE_KEYWORDS = {
  parking: ['estacionamiento', 'parking', 'cochera', 'garaje', 'garage'],
  pool: ['piscina', 'alberca', 'pool'],
  gym: ['gimnasio', 'gym', 'fitness'],
  security: ['seguridad', 'security', 'vigilancia'],
  furnished: ['amueblado', 'amueblada', 'furnished'],
  pets: ['mascotas', 'pets', 'pet friendly'],
  wifi: ['wifi', 'internet'],
  ac: ['aire acondicionado', 'a/c', 'ac', 'clima']
};

// Common location indicators
const LOCATION_KEYWORDS = ['en', 'de', 'cerca de', 'por', 'zona'];

/**
 * Extract numbers from text with Spanish number words support
 */
function extractNumbers(text: string): number[] {
  const numbers: number[] = [];

  // Spanish number words
  const numberWords: { [key: string]: number } = {
    'uno': 1, 'una': 1, 'un': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
  };

  // Extract digit numbers
  const digitMatches = text.match(/\d+/g);
  if (digitMatches) {
    numbers.push(...digitMatches.map(n => parseInt(n, 10)));
  }

  // Extract word numbers
  const words = text.toLowerCase().split(/\s+/);
  words.forEach(word => {
    if (numberWords[word]) {
      numbers.push(numberWords[word]);
    }
  });

  return [...new Set(numbers)]; // Remove duplicates
}

/**
 * Extract property types from query
 */
function extractPropertyTypes(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const types: string[] = [];

  Object.entries(PROPERTY_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      types.push(type);
    }
  });

  return types;
}

/**
 * Extract bedroom count from query
 */
function extractBedrooms(query: string): number[] {
  const lowerQuery = query.toLowerCase();
  const bedrooms: number[] = [];

  // Check if query mentions bedrooms/rooms
  const hasBedromKeyword = BEDROOM_KEYWORDS.some(keyword =>
    lowerQuery.includes(keyword)
  );

  if (hasBedromKeyword) {
    const numbers = extractNumbers(query);
    // Filter reasonable bedroom counts (1-10)
    bedrooms.push(...numbers.filter(n => n >= 1 && n <= 10));
  }

  return bedrooms;
}

/**
 * Extract price range from query
 */
function extractPriceRange(query: string): { minPrice?: number; maxPrice?: number } {
  const lowerQuery = query.toLowerCase();
  const numbers = extractNumbers(query);

  // Look for price-related keywords
  const hasUnderKeyword = PRICE_KEYWORDS.under.some(keyword =>
    lowerQuery.includes(keyword)
  );
  const hasOverKeyword = PRICE_KEYWORDS.over.some(keyword =>
    lowerQuery.includes(keyword)
  );

  // Filter numbers that could be prices (> 1000)
  const priceNumbers = numbers.filter(n => n >= 1000);

  if (priceNumbers.length === 0) {
    return {};
  }

  if (hasUnderKeyword) {
    return { maxPrice: Math.max(...priceNumbers) };
  }

  if (hasOverKeyword) {
    return { minPrice: Math.min(...priceNumbers) };
  }

  // If no specific keyword, treat as max price for single number
  if (priceNumbers.length === 1) {
    return { maxPrice: priceNumbers[0] };
  }

  // For multiple numbers, use range
  return {
    minPrice: Math.min(...priceNumbers),
    maxPrice: Math.max(...priceNumbers)
  };
}

/**
 * Extract features from query
 */
function extractFeatures(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const features: string[] = [];

  Object.entries(FEATURE_KEYWORDS).forEach(([feature, keywords]) => {
    if (keywords.some(keyword => {
      // Use word boundaries to match complete words only
      const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerQuery);
    })) {
      features.push(feature);
    }
  });

  return features;
}

/**
 * Extract location from query
 */
function extractLocation(query: string): string | undefined {
  const lowerQuery = query.toLowerCase();

  // Look for location indicators as whole words
  for (const keyword of LOCATION_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    const match = regex.exec(lowerQuery);
    if (match) {
      // Extract text after the location keyword
      const afterKeyword = query.substring(match.index + keyword.length).trim();

      // Only consider it a location if what follows looks like a place name
      // (starts with capital letter and is not a number or common property keyword)
      const locationMatch = afterKeyword.match(/^([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü\s]*?)(?:\s+(con|de|bajo|sobre|max|min)|$)/i);
      if (locationMatch && locationMatch[1]) {
        const potentialLocation = locationMatch[1].trim();

        // Check if it's not a common property keyword
        const isPropertyKeyword = [
          ...BEDROOM_KEYWORDS,
          ...Object.values(PROPERTY_TYPE_KEYWORDS).flat(),
          ...PRICE_KEYWORDS.currency,
          'habitaciones', 'cuartos', 'lempiras'
        ].some(keyword => potentialLocation.toLowerCase().includes(keyword.toLowerCase()));

        if (!isPropertyKeyword && !extractNumbers(potentialLocation).length) {
          return potentialLocation;
        }
      }
    }
  }

  // If no location keyword found, check if query ends with a potential location
  // (Common pattern: "apartamento 2 habitaciones Tegucigalpa")
  const words = query.trim().split(/\s+/);
  if (words.length >= 2) {
    const lastWord = words[words.length - 1];
    const secondLastWord = words[words.length - 2];

    // Check if last word looks like a location (capitalized, not a number or common keyword)
    if (lastWord.match(/^[A-ZÁÉÍÓÚÑÜ]/)) {
      const isCommonKeyword = [
        ...BEDROOM_KEYWORDS,
        ...Object.values(PROPERTY_TYPE_KEYWORDS).flat(),
        ...PRICE_KEYWORDS.currency,
        'habitaciones', 'cuartos', 'lempiras'
      ].some(keyword => lastWord.toLowerCase() === keyword.toLowerCase());

      if (!isCommonKeyword && !extractNumbers(lastWord).length) {
        // Include second last word if it's also capitalized (e.g., "San Pedro")
        if (secondLastWord.match(/^[A-ZÁÉÍÓÚÑÜ]/) && !extractNumbers(secondLastWord).length) {
          return `${secondLastWord} ${lastWord}`;
        }
        return lastWord;
      }
    }
  }

  return undefined;
}

/**
 * Main parsing function
 */
export function parseSmartSearch(query: string): ParsedSearch {
  if (!query?.trim()) {
    return { originalQuery: query };
  }

  const cleanQuery = query.trim();

  const result: ParsedSearch = {
    originalQuery: cleanQuery
  };

  // Extract different components
  const propertyTypes = extractPropertyTypes(cleanQuery);
  const bedrooms = extractBedrooms(cleanQuery);
  const priceRange = extractPriceRange(cleanQuery);
  const features = extractFeatures(cleanQuery);
  const location = extractLocation(cleanQuery);

  // Add to result if found
  if (propertyTypes.length > 0) {
    result.propertyTypes = propertyTypes;
  }

  if (bedrooms.length > 0) {
    result.bedrooms = bedrooms;
  }

  if (priceRange.minPrice !== undefined) {
    result.minPrice = priceRange.minPrice;
  }

  if (priceRange.maxPrice !== undefined) {
    result.maxPrice = priceRange.maxPrice;
  }

  if (features.length > 0) {
    result.features = features;
  }

  if (location) {
    result.location = location;
  }

  return result;
}

/**
 * Test examples for development
 */
export const TEST_QUERIES = [
  "apartamentos de 2 habitaciones",
  "casa con 3 cuartos en Tegucigalpa",
  "studio bajo 15000 lempiras",
  "apartamento amueblado con estacionamiento",
  "casa 4 habitaciones sobre 20000",
  "depto 1 cuarto Colonia Palmira",
  "apartamento 2 habitaciones con piscina en San Pedro Sula"
];

// Debug function for testing
export function debugSmartSearch(query: string): void {
  console.log(`Query: "${query}"`);
  console.log('Parsed:', parseSmartSearch(query));
  console.log('---');
}