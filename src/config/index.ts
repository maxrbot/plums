// =============================================================================
// MAIN COMMODITY CONFIG AGGREGATOR
// =============================================================================
// Central export point for all commodity domains (produce, meat, dairy, etc.)

// Export all types
export * from './types'

// Export all domains
export * from './produce'

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
  return commodity?.defaultVariety || ''
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
