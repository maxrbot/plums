// =============================================================================
// STONE FRUITS COMMODITIES
// =============================================================================
// Complete category: Peach, Plum, Apricot, Cherry, Nectarine

import type { CommodityConfig } from '../types'

export const stoneFruitsCommodities: CommodityConfig[] = [
  {
    id: 'peach',
    name: 'Peach',
    category: 'Stone Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Peaches',
        specifications: 'Fresh market peaches'
      },
      notes: 'USDA covers standard peach varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh peaches',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '20lb', name: '20 lb', weight: '20lb' },
                { id: '18lb', name: '18 lb', weight: '18lb' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ]
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
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced peaches',
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
            }
          ]
        }
      ]
    },
    
    varieties: {
      'freestone-elberta': {
        id: 'freestone-elberta',
        name: 'Elberta',
        subtype: 'freestone-yellow',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'high' }
      },
      'freestone-red-haven': {
        id: 'freestone-red-haven',
        name: 'Red Haven',
        subtype: 'freestone-yellow',
        itemWeight: { base: 0.32, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'freestone-white-lady': {
        id: 'freestone-white-lady',
        name: 'White Lady',
        subtype: 'freestone-white',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'freestone-saturn': {
        id: 'freestone-saturn',
        name: 'Saturn (Donut)',
        subtype: 'freestone-specialty',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'clingstone-halford': {
        id: 'clingstone-halford',
        name: 'Halford',
        subtype: 'clingstone-yellow',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'high' }
      },
      'clingstone-loadel': {
        id: 'clingstone-loadel',
        name: 'Loadel',
        subtype: 'clingstone-yellow',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'high' }
      },
      'clingstone-babcock': {
        id: 'clingstone-babcock',
        name: 'Babcock',
        subtype: 'clingstone-white',
        itemWeight: { base: 0.28, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'high' }
      },
      'heirloom-indian-blood': {
        id: 'heirloom-indian-blood',
        name: 'Indian Blood',
        subtype: 'heirloom',
        itemWeight: { base: 0.30, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'freestone-elberta'
  },

  {
    id: 'plum',
    name: 'Plum',
    category: 'Stone Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Plums',
        specifications: 'Fresh market plums'
      },
      notes: 'USDA covers standard plum varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh plums',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '28lb', name: '28 lb', weight: '28lb', isDefault: true },
                { id: '25lb', name: '25 lb', weight: '25lb' },
                { id: '20lb', name: '20 lb', weight: '20lb' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ]
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '4lb', name: '4 lb', weight: '4lb' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'european-stanley': {
        id: 'european-stanley',
        name: 'Stanley',
        subtype: 'european',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'high' }
      },
      'european-greengage': {
        id: 'european-greengage',
        name: 'Greengage',
        subtype: 'european',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      },
      'japanese-santa-rosa': {
        id: 'japanese-santa-rosa',
        name: 'Santa Rosa',
        subtype: 'japanese',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'japanese-beauty': {
        id: 'japanese-beauty',
        name: 'Beauty',
        subtype: 'japanese',
        itemWeight: { base: 0.20, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'high' }
      },
      'japanese-elephant-heart': {
        id: 'japanese-elephant-heart',
        name: 'Elephant Heart',
        subtype: 'japanese',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'american-wild': {
        id: 'american-wild',
        name: 'Wild American',
        subtype: 'american',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '28lb',
      defaultSize: '28lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'japanese-santa-rosa'
  },

  {
    id: 'apricot',
    name: 'Apricot',
    category: 'Stone Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Apricots',
        specifications: 'Fresh market apricots'
      },
      notes: 'USDA covers standard apricot varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh apricots',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '24lb', name: '24 lb', weight: '24lb', isDefault: true },
                { id: '20lb', name: '20 lb', weight: '20lb' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'blenheim': {
        id: 'blenheim',
        name: 'Blenheim',
        subtype: 'european',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'moorpark': {
        id: 'moorpark',
        name: 'Moorpark',
        subtype: 'european',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      },
      'goldcot': {
        id: 'goldcot',
        name: 'Goldcot',
        subtype: 'american',
        itemWeight: { base: 0.09, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'harcot': {
        id: 'harcot',
        name: 'Harcot',
        subtype: 'american',
        itemWeight: { base: 0.11, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'high' }
      },
      'manchurian-bush': {
        id: 'manchurian-bush',
        name: 'Manchurian Bush',
        subtype: 'manchurian',
        itemWeight: { base: 0.06, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '24lb',
      defaultSize: '24lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'blenheim'
  },

  {
    id: 'cherry',
    name: 'Cherry',
    category: 'Stone Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Sweet Cherries',
        specifications: 'Fresh market sweet cherries'
      },
      notes: 'USDA covers sweet cherries; tart cherries estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh cherries',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '20lb', name: '20 lb', weight: '20lb', isDefault: true },
                { id: '18lb', name: '18 lb', weight: '18lb' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
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
          ],
          isDefault: true
        },
        {
          id: 'pitted',
          name: 'Pitted',
          description: 'Pre-pitted cherries',
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
            }
          ]
        }
      ]
    },
    
    varieties: {
      'sweet-bing': {
        id: 'sweet-bing',
        name: 'Bing',
        subtype: 'sweet',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      },
      'sweet-lambert': {
        id: 'sweet-lambert',
        name: 'Lambert',
        subtype: 'sweet',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 9.25, priceVolatility: 'high' }
      },
      'sweet-rainier': {
        id: 'sweet-rainier',
        name: 'Rainier',
        subtype: 'sweet',
        itemWeight: { base: 0.022, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'sweet-royal-ann': {
        id: 'sweet-royal-ann',
        name: 'Royal Ann',
        subtype: 'sweet',
        itemWeight: { base: 0.019, sizeVariations: {} },
        pricing: { basePricePerLb: 10.85, priceVolatility: 'high' }
      },
      'tart-montmorency': {
        id: 'tart-montmorency',
        name: 'Montmorency',
        subtype: 'tart',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'tart-balaton': {
        id: 'tart-balaton',
        name: 'Balaton',
        subtype: 'tart',
        itemWeight: { base: 0.014, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '20lb',
      defaultSize: '20lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'sweet-bing'
  },

  {
    id: 'nectarine',
    name: 'Nectarine',
    category: 'Stone Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Nectarines',
        specifications: 'Fresh market nectarines'
      },
      notes: 'USDA covers standard nectarine varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh nectarines',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '22lb', name: '22 lb', weight: '22lb', isDefault: true },
                { id: '20lb', name: '20 lb', weight: '20lb' },
                { id: '18lb', name: '18 lb', weight: '18lb' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ]
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '4lb', name: '4 lb', weight: '4lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced nectarines',
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
            }
          ]
        }
      ]
    },
    
    varieties: {
      'freestone-red-gold': {
        id: 'freestone-red-gold',
        name: 'Red Gold',
        subtype: 'freestone-yellow',
        itemWeight: { base: 0.30, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'high' }
      },
      'freestone-fantasia': {
        id: 'freestone-fantasia',
        name: 'Fantasia',
        subtype: 'freestone-yellow',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'freestone-arctic-rose': {
        id: 'freestone-arctic-rose',
        name: 'Arctic Rose',
        subtype: 'freestone-white',
        itemWeight: { base: 0.28, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'clingstone-may-grand': {
        id: 'clingstone-may-grand',
        name: 'May Grand',
        subtype: 'clingstone-yellow',
        itemWeight: { base: 0.32, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '22lb',
      defaultSize: '22lb'
    },
    
    quality: {
      grades: ['Extra Fancy', 'Fancy', 'No. 1'],
      defaultGrade: 'Fancy'
    },
    
    defaultVariety: 'freestone-red-gold'
  }
]
