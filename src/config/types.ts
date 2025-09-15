// =============================================================================
// SHARED COMMODITY TYPES
// =============================================================================
// Shared TypeScript interfaces used across all commodity domains (produce, meat, dairy, etc.)

// === BASIC INFO ===
export interface CommodityConfig {
  id: string
  name: string
  category: string
  
  // === USDA DATA AVAILABILITY ===
  usdaCoverage: {
    hasPricing: boolean
    hasProduction: boolean
    primaryMapping?: {
      commodity: string
      specifications?: string
    }
    notes?: string
  }
  
  // === PROCESSING & PACKAGING ===
  processing: {
    hasProcessing: boolean
    types?: ProcessingType[]
    defaultType?: string
  }
  
  packaging: {
    types: PackageType[]
    defaultPackage: string
    defaultSize: string
  }
  
  quality: {
    grades: string[]
    defaultGrade: string
  }
  
  // === VARIETY-SPECIFIC WEIGHTS ===
  varieties: Record<string, VarietyConfig>
  defaultVariety: string
}

export interface ProcessingType {
  id: string
  name: string
  description: string
  packageTypes: PackageType[]
  isDefault?: boolean
}

export interface PackageType {
  id: string
  name: string
  type: string
  sizes: PackageSize[]
  fruitCounts?: FruitCount[] // For citrus and similar items
  isDefault?: boolean
}

export interface PackageSize {
  id: string
  name: string
  weight?: string
  count?: string
  isDefault?: boolean
}

export interface FruitCount {
  id: string
  name: string
  description: string
  isDefault?: boolean
}

export interface VarietyConfig {
  id: string
  name: string
  
  // === WEIGHT SPECIFICATIONS ===
  itemWeight: {
    base: number // Base weight per item in pounds
    sizeVariations?: Record<string, number> // Size-specific weights (e.g., "56s": 0.75)
  }
  
  // === PRICING ===
  pricing: {
    basePricePerLb: number
    priceVolatility: 'low' | 'medium' | 'high'
  }
  
  // === USDA MAPPING (Variety-Specific) ===
  usdaMapping?: {
    variety?: string
    specifications?: string
    confidence: 'high' | 'medium' | 'low' | 'none'
  }
}

// =============================================================================
// HELPER FUNCTION TYPES
// =============================================================================

export type CommodityDomain = 'produce' | 'meat' | 'dairy' | 'ingredients'

export interface DomainConfig {
  domain: CommodityDomain
  commodities: CommodityConfig[]
}
