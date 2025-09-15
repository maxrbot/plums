// =============================================================================
// CITRUS FRUITS CATEGORY INDEX
// =============================================================================
// 📋 AGGREGATES ALL CITRUS COMMODITIES:
// • citrus-fruits-1.ts - Major citrus (Orange, Mandarin, Minneola)
// • citrus-fruits-2.ts - Specialty citrus (Lemon, Lime, Grapefruit)
//
// 🎯 TOTAL: 6 commodities, 33 varieties

export * from './citrus-fruits-1'
export * from './citrus-fruits-2'

import { majorCitrusCommodities } from './citrus-fruits-1'
import { specialtyCitrusCommodities } from './citrus-fruits-2'
import type { CommodityConfig } from '../../types'

// Aggregate all citrus commodities
export const citrusCommodities: CommodityConfig[] = [
  ...majorCitrusCommodities,
  ...specialtyCitrusCommodities
]

// Helper functions for citrus domain
export function getCitrusCommodity(commodityId: string): CommodityConfig | undefined {
  return citrusCommodities.find(c => c.id === commodityId)
}

export function getCitrusVariety(commodityId: string, varietyId: string) {
  const commodity = getCitrusCommodity(commodityId)
  return commodity?.varieties[varietyId]
}
