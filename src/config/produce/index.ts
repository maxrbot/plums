// =============================================================================
// PRODUCE DOMAIN INDEX
// =============================================================================
// Aggregates all produce categories (fruits, vegetables, herbs, etc.)

export * from './leafy-greens'
export * from './brassicas-cole-crops'
export * from './citrus-fruits'
export * from './root-vegetables'
export * from './vine-crops'
export * from './specialty-vegetables'
export * from './berries'
export * from './stone-fruits'
export * from './herbs'
export * from './tree-nuts'
export * from './tropical-fruits'
export * from './grapes'
export * from './pome-fruits'

import { leafyGreensCommodities } from './leafy-greens'
import { brassicasCommodities } from './brassicas-cole-crops'
import { citrusCommodities } from './citrus-fruits'
import { rootVegetablesCommodities } from './root-vegetables'
import { vineCropsCommodities } from './vine-crops'
import { specialtyVegetablesCommodities } from './specialty-vegetables'
import { berriesCommodities } from './berries'
import { stoneFruitsCommodities } from './stone-fruits'
import { herbsCommodities } from './herbs'
import { treeNutsCommodities } from './tree-nuts'
import { tropicalFruitsCommodities } from './tropical-fruits'
import { grapesCommodities } from './grapes'
import { pomeFruitsCommodities } from './pome-fruits'
import type { CommodityConfig } from '../types'

// Aggregate all produce commodities
export const produceCommodities: CommodityConfig[] = [
  ...leafyGreensCommodities,
  ...brassicasCommodities,
  ...citrusCommodities,
  ...rootVegetablesCommodities,
  ...vineCropsCommodities,
  ...specialtyVegetablesCommodities,
  ...berriesCommodities,
  ...stoneFruitsCommodities,
  ...herbsCommodities,
  ...treeNutsCommodities,
  ...tropicalFruitsCommodities,
  ...grapesCommodities,
  ...pomeFruitsCommodities,
  // All original categories now complete!
  // Future expansion categories could be added here:
  // ...grainsCerealsCommodities,
  // ...legumesPulsesCommodities,
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
