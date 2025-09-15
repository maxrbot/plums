// =============================================================================
// PRODUCE DOMAIN INDEX
// =============================================================================
// Aggregates all produce categories (fruits, vegetables, herbs, etc.)

export * from './leafy-greens'
export * from './brassicas-cole-crops'
export * from './citrus-fruits'

import { leafyGreensCommodities } from './leafy-greens'
import { brassicasCommodities } from './brassicas-cole-crops'
import { citrusCommodities } from './citrus-fruits'
import type { CommodityConfig } from '../types'

// Aggregate all produce commodities
export const produceCommodities: CommodityConfig[] = [
  ...leafyGreensCommodities,
  ...brassicasCommodities,
  ...citrusCommodities,
  // Future categories will be added here:
  // ...rootVegetableCommodities,
]

// Helper functions for produce domain
export function getProduceCommodity(commodityId: string): CommodityConfig | undefined {
  return produceCommodities.find(c => c.id === commodityId)
}

export function getProduceVariety(commodityId: string, varietyId: string) {
  const commodity = getProduceCommodity(commodityId)
  return commodity?.varieties[varietyId]
}

export function getProduceCommoditiesByCategory(category: string): CommodityConfig[] {
  return produceCommodities.filter(c => c.category === category)
}
