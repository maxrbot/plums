// =============================================================================
// GRAPES COMMODITIES
// =============================================================================
// Complete category: Table Grapes (Green, Red, Black, Specialty varieties)

import type { CommodityConfig } from '../types'

export const grapesCommodities: CommodityConfig[] = [
  {
    id: 'table-grape',
    name: 'Table Grape',
    category: 'Grapes',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Grapes',
        specifications: 'Fresh table grapes, California and imported'
      },
      notes: 'USDA covers California table grapes and imports; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'clusters',
          name: 'Clusters',
          description: 'Whole grape clusters on stems',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '19lb', name: '19 lb', weight: '19lb', isDefault: true },
                { id: '23lb', name: '23 lb', weight: '23lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ]
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'stemless',
          name: 'Stemless',
          description: 'Individual grapes removed from stems',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ]
            }
          ]
        }
      ]
    },
    
    varieties: {
      // Green Grapes
      'green-thompson-seedless': {
        id: 'green-thompson-seedless',
        name: 'Thompson Seedless',
        subtype: 'green',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'green-sugraone': {
        id: 'green-sugraone',
        name: 'Sugraone',
        subtype: 'green',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'green-princess': {
        id: 'green-princess',
        name: 'Princess',
        subtype: 'green',
        itemWeight: { base: 0.010, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'green-superior': {
        id: 'green-superior',
        name: 'Superior Seedless',
        subtype: 'green',
        itemWeight: { base: 0.009, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      
      // Red Grapes
      'red-flame-seedless': {
        id: 'red-flame-seedless',
        name: 'Flame Seedless',
        subtype: 'red',
        itemWeight: { base: 0.009, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'red-ruby-seedless': {
        id: 'red-ruby-seedless',
        name: 'Ruby Seedless',
        subtype: 'red',
        itemWeight: { base: 0.011, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'red-crimson-seedless': {
        id: 'red-crimson-seedless',
        name: 'Crimson Seedless',
        subtype: 'red',
        itemWeight: { base: 0.010, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'medium' }
      },
      'red-globe': {
        id: 'red-globe',
        name: 'Red Globe',
        subtype: 'red',
        itemWeight: { base: 0.015, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      
      // Black Grapes
      'black-beauty-seedless': {
        id: 'black-beauty-seedless',
        name: 'Beauty Seedless',
        subtype: 'black',
        itemWeight: { base: 0.011, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'black-ribier': {
        id: 'black-ribier',
        name: 'Ribier',
        subtype: 'black',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'high' }
      },
      'black-autumn-royal': {
        id: 'black-autumn-royal',
        name: 'Autumn Royal',
        subtype: 'black',
        itemWeight: { base: 0.013, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'medium' }
      },
      'black-midnight-beauty': {
        id: 'black-midnight-beauty',
        name: 'Midnight Beauty',
        subtype: 'black',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      },
      
      // Specialty Grapes
      'specialty-cotton-candy': {
        id: 'specialty-cotton-candy',
        name: 'Cotton Candy',
        subtype: 'specialty',
        itemWeight: { base: 0.010, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'specialty-moon-drops': {
        id: 'specialty-moon-drops',
        name: 'Moon Drops',
        subtype: 'specialty',
        itemWeight: { base: 0.014, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      },
      'specialty-witch-fingers': {
        id: 'specialty-witch-fingers',
        name: 'Witch Fingers',
        subtype: 'specialty',
        itemWeight: { base: 0.016, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      },
      'specialty-gum-drops': {
        id: 'specialty-gum-drops',
        name: 'Gum Drops',
        subtype: 'specialty',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 6.45, priceVolatility: 'high' }
      },
      'specialty-tear-drops': {
        id: 'specialty-tear-drops',
        name: 'Tear Drops',
        subtype: 'specialty',
        itemWeight: { base: 0.007, sizeVariations: {} },
        pricing: { basePricePerLb: 7.25, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '19lb',
      defaultSize: '19lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'green-thompson-seedless'
  }
]
