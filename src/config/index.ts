// =============================================================================
// MAIN COMMODITY CONFIG AGGREGATOR
// =============================================================================
// Central export point for all commodity domains (produce, meat, dairy, etc.)

// Export all types
export * from './types'

// Export all domains
export * from './produce'

// Re-export specific types for backward compatibility
export type { ProcessingType, PackageType, PackageSize, FruitCount } from './types'

// Import domain commodities
import { produceCommodities } from './produce'
import type { CommodityConfig, CommodityDomain } from './types'

// =============================================================================
// AGGREGATED COMMODITY DATA
// =============================================================================

export const allCommodities: CommodityConfig[] = [
  ...produceCommodities,
  // Future domains will be added here:
  // ...meatCommodities,
  // ...dairyCommodities,
  // ...ingredientCommodities,
]

// =============================================================================
// HELPER FUNCTIONS (Backward Compatibility)
// =============================================================================
// Helper functions for backward compatibility and convenience

// =============================================================================
// COMPATIBILITY LAYER FOR PRICE SHEET CREATION
// =============================================================================
// These functions provide the same interface as the old commodityOptions/commodityPackaging
// but use our new domain-based structure under the hood

export interface LegacyCommodityOption {
  id: string
  name: string
  subtypes?: Array<{
    id: string
    name: string
    varieties: string[]
  }>
  varieties?: string[]
}

export interface LegacyCategoryOption {
  id: string
  name: string
  commodities: LegacyCommodityOption[]
}

// Convert our new structure to the legacy format expected by price sheet creation
export function getLegacyCommodityOptions(): LegacyCategoryOption[] {
  const categoryMap = new Map<string, LegacyCommodityOption[]>()
  
  // Group commodities by category
  allCommodities.forEach(commodity => {
    const categoryId = commodity.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, [])
    }
    
    // Convert commodity to legacy format
    const legacyCommodity: LegacyCommodityOption = {
      id: commodity.id,
      name: commodity.name,
      varieties: Object.keys(commodity.varieties)
    }
    
    categoryMap.get(categoryId)!.push(legacyCommodity)
  })
  
  // Convert to legacy category format
  return Array.from(categoryMap.entries()).map(([categoryId, commodities]) => ({
    id: categoryId,
    name: commodities[0] ? allCommodities.find(c => c.id === commodities[0].id)?.category || categoryId : categoryId,
    commodities
  }))
}

// Get packaging specs for a commodity (replaces getCommodityPackaging)
export function getLegacyCommodityPackaging(commodityId: string) {
  const commodity = getCommodityConfig(commodityId)
  if (!commodity) return null
  
  return {
    id: commodityId,
    name: commodity.name,
    hasProcessing: commodity.processing.hasProcessing,
    processingTypes: commodity.processing.types,
    packageTypes: commodity.packaging.types,
    grades: commodity.quality.grades,
    processing: commodity.processing,
    packaging: commodity.packaging,
    quality: commodity.quality
  }
}

// Helper functions that were in commodityPackaging
export function getDefaultProcessingType(commodityId: string) {
  const commodity = getCommodityConfig(commodityId)
  if (!commodity?.processing.hasProcessing || !commodity.processing.defaultType) return undefined
  
  return commodity.processing.types?.find(pt => pt.id === commodity.processing.defaultType)
}

export function getDefaultPackageType(commodityId: string, processingTypeId?: string) {
  const commodity = getCommodityConfig(commodityId)
  if (!commodity) return undefined
  
  if (commodity.processing.hasProcessing && processingTypeId) {
    // Find the processing type and return its default package type
    const processingType = commodity.processing.types?.find(pt => pt.id === processingTypeId)
    return processingType?.packageTypes?.[0] // Return first package type as default
  }
  
  // Return the default package type from commodity packaging
  return commodity.packaging.types.find(pt => pt.id === commodity.packaging.defaultPackage)
}

export function getDefaultSize(commodityId: string, processingTypeId?: string, packageTypeId?: string) {
  const commodity = getCommodityConfig(commodityId)
  if (!commodity) return undefined
  
  // If specific processing and package types are provided, find the default size for that combination
  if (processingTypeId && packageTypeId) {
    const processingType = commodity.processing.types?.find(pt => pt.id === processingTypeId)
    const packageType = processingType?.packageTypes?.find(pt => pt.id === packageTypeId)
    return packageType?.sizes?.find(s => s.isDefault)
  }
  
  // If only package type is provided, find it in main packaging
  if (packageTypeId) {
    const packageType = commodity.packaging.types.find(pt => pt.id === packageTypeId)
    return packageType?.sizes?.find(s => s.isDefault)
  }
  
  // Return default size from commodity packaging
  const defaultPackageType = commodity.packaging.types.find(pt => pt.id === commodity.packaging.defaultPackage)
  return defaultPackageType?.sizes?.find(s => s.isDefault)
}

export function getDefaultFruitCount(commodityId: string, packageTypeId?: string) {
  const commodity = getCommodityConfig(commodityId)
  if (!commodity) return undefined
  
  // Find the specific package type or use default
  let packageType
  if (packageTypeId) {
    // Look in processing types first
    if (commodity.processing.hasProcessing) {
      for (const pt of commodity.processing.types || []) {
        packageType = pt.packageTypes?.find(pkg => pkg.id === packageTypeId)
        if (packageType) break
      }
    }
    // If not found, look in main packaging types
    if (!packageType) {
      packageType = commodity.packaging.types.find(pt => pt.id === packageTypeId)
    }
  } else {
    // Use default package type
    packageType = commodity.packaging.types.find(pt => pt.id === commodity.packaging.defaultPackage)
  }
  
  if (!packageType?.fruitCounts) return undefined
  
  return packageType.fruitCounts.find(fc => fc.isDefault)
}

export function getDefaultGrade(commodityId: string) {
  const commodity = getCommodityConfig(commodityId)
  return commodity?.quality.defaultGrade
}

export function getCommodityConfig(commodityId: string): CommodityConfig | undefined {
  return allCommodities.find(c => c.id === commodityId)
}

export function getVarietyConfig(commodityId: string, varietyId: string) {
  const commodity = getCommodityConfig(commodityId)
  return commodity?.varieties[varietyId]
}

export function getItemWeight(commodityId: string, varietyId: string, sizeId?: string): number {
  const variety = getVarietyConfig(commodityId, varietyId)
  if (!variety) return 1.0
  
  // Check for size-specific weight variations
  if (sizeId && variety.itemWeight.sizeVariations?.[sizeId]) {
    return variety.itemWeight.sizeVariations[sizeId]
  }
  
  return variety.itemWeight.base
}

export function getBasePricePerLb(commodityId: string, varietyId: string): number {
  const variety = getVarietyConfig(commodityId, varietyId)
  return variety?.pricing.basePricePerLb || 2.0
}

export function getUsdaConfidence(commodityId: string, varietyId: string): string {
  const variety = getVarietyConfig(commodityId, varietyId)
  return variety?.usdaMapping?.confidence || 'none'
}

export function getDefaultVariety(commodityId: string): string {
  const commodity = getCommodityConfig(commodityId)
  return commodity?.defaultVariety || 'standard'
}

// =============================================================================
// DOMAIN-SPECIFIC HELPERS
// =============================================================================

export function getCommoditiesByDomain(domain: CommodityDomain): CommodityConfig[] {
  switch (domain) {
    case 'produce':
      return produceCommodities
    case 'meat':
      return [] // TODO: Add when meat domain is implemented
    case 'dairy':
      return [] // TODO: Add when dairy domain is implemented
    case 'ingredients':
      return [] // TODO: Add when ingredients domain is implemented
    default:
      return []
  }
}

export function getCommoditiesByCategory(category: string): CommodityConfig[] {
  return allCommodities.filter(c => c.category === category)
}

// =============================================================================
// STATISTICS & INSIGHTS
// =============================================================================

export function getCommodityStats() {
  const stats = {
    totalCommodities: allCommodities.length,
    totalVarieties: allCommodities.reduce((sum, c) => sum + Object.keys(c.varieties).length, 0),
    byDomain: {
      produce: produceCommodities.length,
      meat: 0, // TODO: Update when implemented
      dairy: 0, // TODO: Update when implemented
      ingredients: 0, // TODO: Update when implemented
    },
    byCategory: {} as Record<string, number>
  }
  
  // Count by category
  allCommodities.forEach(c => {
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1
  })
  
  return stats
}
