// =============================================================================
// BERRIES COMMODITIES
// =============================================================================
// Complete category: Strawberry, Blueberry, Raspberry, Blackberry, Cranberry, Gooseberry, Currant

import type { CommodityConfig } from '../types'

export const berriesCommodities: CommodityConfig[] = [
  {
    id: 'strawberry',
    name: 'Strawberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Strawberries',
        specifications: 'Fresh market strawberries'
      },
      notes: 'USDA covers standard strawberry varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh strawberries',
          packageTypes: [
            {
              id: 'flat',
              name: 'Flat',
              type: 'flat',
              sizes: [
                { id: '12x1pt', name: '12 x 1 Pint', count: '12x1pt', isDefault: true },
                { id: '8x1pt', name: '8 x 1 Pint', count: '8x1pt' },
                { id: '12x1qt', name: '12 x 1 Quart', count: '12x1qt' }
              ],
              isDefault: true
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '8lb', name: '8 lb', weight: '8lb' },
                { id: '12lb', name: '12 lb', weight: '12lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced strawberries',
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
      'june-bearing-chandler': {
        id: 'june-bearing-chandler',
        name: 'Chandler',
        subtype: 'june-bearing',
        itemWeight: { base: 0.035, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'high' }
      },
      'june-bearing-albion': {
        id: 'june-bearing-albion',
        name: 'Albion',
        subtype: 'june-bearing',
        itemWeight: { base: 0.032, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'high' }
      },
      'day-neutral-seascape': {
        id: 'day-neutral-seascape',
        name: 'Seascape',
        subtype: 'day-neutral',
        itemWeight: { base: 0.028, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'high' }
      },
      'day-neutral-monterey': {
        id: 'day-neutral-monterey',
        name: 'Monterey',
        subtype: 'day-neutral',
        itemWeight: { base: 0.030, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'high' }
      },
      'everbearing-ozark-beauty': {
        id: 'everbearing-ozark-beauty',
        name: 'Ozark Beauty',
        subtype: 'everbearing',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'high' }
      },
      'everbearing-quinault': {
        id: 'everbearing-quinault',
        name: 'Quinault',
        subtype: 'everbearing',
        itemWeight: { base: 0.027, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12x1pt',
      defaultSize: '12x1pt'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'june-bearing-chandler'
  },

  {
    id: 'blueberry',
    name: 'Blueberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Blueberries',
        specifications: 'Fresh market blueberries'
      },
      notes: 'USDA covers standard blueberry varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh blueberries',
          packageTypes: [
            // Flats
            {
              id: '12x1pt-flat',
              name: '12x1pt Flat',
              type: 'flat',
              sizes: [], // No separate size selection - count is in package name
              sizeClassifications: [], // No size classifications
              isDefault: true
            },
            {
              id: '6x1pt-flat',
              name: '6x1pt Flat',
              type: 'flat',
              sizes: [], // No separate size selection - count is in package name
              sizeClassifications: [] // No size classifications
            },
            {
              id: '12x6oz-flat',
              name: '12x6oz Flat',
              type: 'flat',
              sizes: [], // No separate size selection - count is in package name
              sizeClassifications: [] // No size classifications
            },
            // Clamshells
            {
              id: '6oz-clamshell',
              name: '6oz Clamshell',
              type: 'clamshell',
              sizes: [], // No separate size selection - weight is in package name
              sizeClassifications: [] // No size classifications
            },
            {
              id: '1lb-clamshell',
              name: '1lb Clamshell',
              type: 'clamshell',
              sizes: [], // No separate size selection - weight is in package name
              sizeClassifications: [] // No size classifications
            },
            // Bulk
            {
              id: '10lb-bulk',
              name: '10lb Bulk',
              type: 'bulk',
              sizes: [], // No separate size selection - weight is in package name
              sizeClassifications: [] // No size classifications
            },
            {
              id: '18lb-bulk',
              name: '18lb Bulk',
              type: 'bulk',
              sizes: [], // No separate size selection - weight is in package name
              sizeClassifications: [] // No size classifications
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'duke': {
        id: 'duke',
        name: 'Duke',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'bluecrop': {
        id: 'bluecrop',
        name: 'Bluecrop',
        itemWeight: { base: 0.009, sizeVariations: {} },
        pricing: { basePricePerLb: 6.45, priceVolatility: 'high' }
      },
      'jersey': {
        id: 'jersey',
        name: 'Jersey',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'high' }
      },
      'elliott': {
        id: 'elliott',
        name: 'Elliott',
        itemWeight: { base: 0.007, sizeVariations: {} },
        pricing: { basePricePerLb: 6.95, priceVolatility: 'high' }
      },
      'chandler': {
        id: 'chandler',
        name: 'Chandler',
        itemWeight: { base: 0.009, sizeVariations: {} },
        pricing: { basePricePerLb: 7.45, priceVolatility: 'high' }
      },
      'legacy': {
        id: 'legacy',
        name: 'Legacy',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 6.75, priceVolatility: 'high' }
      },
      'emerald': {
        id: 'emerald',
        name: 'Emerald',
        itemWeight: { base: 0.007, sizeVariations: {} },
        pricing: { basePricePerLb: 7.25, priceVolatility: 'high' }
      },
      'jewel': {
        id: 'jewel',
        name: 'Jewel',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      },
      'sunshine-blue': {
        id: 'sunshine-blue',
        name: 'Sunshine Blue',
        itemWeight: { base: 0.006, sizeVariations: {} },
        pricing: { basePricePerLb: 8.25, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12x1pt-flat',
      defaultSize: ''
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'bluecrop'
  },

  {
    id: 'raspberry',
    name: 'Raspberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Raspberries',
        specifications: 'Fresh market raspberries'
      },
      notes: 'USDA covers red raspberries; specialty colors estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh raspberries',
          packageTypes: [
            {
              id: 'flat',
              name: 'Flat',
              type: 'flat',
              sizes: [
                { id: '12x6oz', name: '12 x 6 oz', count: '12x6oz', isDefault: true },
                { id: '6x6oz', name: '6 x 6 oz', count: '6x6oz' }
              ],
              isDefault: true
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '6oz', name: '6 oz', weight: '6oz' },
                { id: '12oz', name: '12 oz', weight: '12oz' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'red-heritage': {
        id: 'red-heritage',
        name: 'Heritage',
        subtype: 'red',
        itemWeight: { base: 0.004, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      },
      'red-caroline': {
        id: 'red-caroline',
        name: 'Caroline',
        subtype: 'red',
        itemWeight: { base: 0.0045, sizeVariations: {} },
        pricing: { basePricePerLb: 9.25, priceVolatility: 'high' }
      },
      'black-cumberland': {
        id: 'black-cumberland',
        name: 'Cumberland',
        subtype: 'black',
        itemWeight: { base: 0.003, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'black-jewel': {
        id: 'black-jewel',
        name: 'Jewel',
        subtype: 'black',
        itemWeight: { base: 0.0035, sizeVariations: {} },
        pricing: { basePricePerLb: 11.85, priceVolatility: 'high' }
      },
      'purple-royalty': {
        id: 'purple-royalty',
        name: 'Royalty',
        subtype: 'purple',
        itemWeight: { base: 0.004, sizeVariations: {} },
        pricing: { basePricePerLb: 14.85, priceVolatility: 'high' }
      },
      'golden-anne': {
        id: 'golden-anne',
        name: 'Anne',
        subtype: 'golden',
        itemWeight: { base: 0.0042, sizeVariations: {} },
        pricing: { basePricePerLb: 16.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12x6oz',
      defaultSize: '12x6oz'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'red-heritage'
  },

  {
    id: 'blackberry',
    name: 'Blackberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Blackberries',
        specifications: 'Fresh market blackberries'
      },
      notes: 'USDA covers standard blackberries; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh blackberries',
          packageTypes: [
            {
              id: 'flat',
              name: 'Flat',
              type: 'flat',
              sizes: [
                { id: '12x6oz', name: '12 x 6 oz', count: '12x6oz', isDefault: true },
                { id: '6x6oz', name: '6 x 6 oz', count: '6x6oz' }
              ],
              isDefault: true
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '6oz', name: '6 oz', weight: '6oz' },
                { id: '12oz', name: '12 oz', weight: '12oz' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'thornless-triple-crown': {
        id: 'thornless-triple-crown',
        name: 'Triple Crown',
        subtype: 'thornless',
        itemWeight: { base: 0.006, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      },
      'thornless-apache': {
        id: 'thornless-apache',
        name: 'Apache',
        subtype: 'thornless',
        itemWeight: { base: 0.0065, sizeVariations: {} },
        pricing: { basePricePerLb: 8.25, priceVolatility: 'high' }
      },
      'thorny-natchez': {
        id: 'thorny-natchez',
        name: 'Natchez',
        subtype: 'thorny',
        itemWeight: { base: 0.007, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'thorny-ouachita': {
        id: 'thorny-ouachita',
        name: 'Ouachita',
        subtype: 'thorny',
        itemWeight: { base: 0.0055, sizeVariations: {} },
        pricing: { basePricePerLb: 7.25, priceVolatility: 'high' }
      },
      'hybrid-tayberry': {
        id: 'hybrid-tayberry',
        name: 'Tayberry',
        subtype: 'hybrid',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'hybrid-loganberry': {
        id: 'hybrid-loganberry',
        name: 'Loganberry',
        subtype: 'hybrid',
        itemWeight: { base: 0.0075, sizeVariations: {} },
        pricing: { basePricePerLb: 11.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12x6oz',
      defaultSize: '12x6oz'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'thornless-triple-crown'
  },

  {
    id: 'cranberry',
    name: 'Cranberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Cranberries',
        specifications: 'Fresh market cranberries'
      },
      notes: 'USDA covers standard cranberries; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh cranberries',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '12oz', name: '12 oz', weight: '12oz', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'dried',
          name: 'Dried',
          description: 'Dried cranberries',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '6oz', name: '6 oz', weight: '6oz', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'stevens': {
        id: 'stevens',
        name: 'Stevens',
        itemWeight: { base: 0.002, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'ben-lear': {
        id: 'ben-lear',
        name: 'Ben Lear',
        itemWeight: { base: 0.0018, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'medium' }
      },
      'pilgrim': {
        id: 'pilgrim',
        name: 'Pilgrim',
        itemWeight: { base: 0.0022, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12oz',
      defaultSize: '12oz'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'stevens'
  },

  {
    id: 'gooseberry',
    name: 'Gooseberry',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh gooseberries',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '6oz', name: '6 oz', weight: '6oz', isDefault: true },
                { id: '12oz', name: '12 oz', weight: '12oz' }
              ],
              isDefault: true
            },
            {
              id: 'flat',
              name: 'Flat',
              type: 'flat',
              sizes: [
                { id: '12x6oz', name: '12 x 6 oz', count: '12x6oz' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'hinnomaki-red': {
        id: 'hinnomaki-red',
        name: 'Hinnomaki Red',
        subtype: 'european',
        itemWeight: { base: 0.01, sizeVariations: {} },
        pricing: { basePricePerLb: 14.85, priceVolatility: 'high' }
      },
      'invicta': {
        id: 'invicta',
        name: 'Invicta',
        subtype: 'european',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 13.85, priceVolatility: 'high' }
      },
      'pixwell': {
        id: 'pixwell',
        name: 'Pixwell',
        subtype: 'american',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'oregon-champion': {
        id: 'oregon-champion',
        name: 'Oregon Champion',
        subtype: 'american',
        itemWeight: { base: 0.009, sizeVariations: {} },
        pricing: { basePricePerLb: 13.25, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '6oz',
      defaultSize: '6oz'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'hinnomaki-red'
  },

  {
    id: 'currant',
    name: 'Currant',
    category: 'Berries',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-berries',
          name: 'Whole Berries',
          description: 'Whole fresh currants',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '4oz', name: '4 oz', weight: '4oz', isDefault: true },
                { id: '6oz', name: '6 oz', weight: '6oz' }
              ],
              isDefault: true
            },
            {
              id: 'flat',
              name: 'Flat',
              type: 'flat',
              sizes: [
                { id: '12x4oz', name: '12 x 4 oz', count: '12x4oz' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'red-lake': {
        id: 'red-lake',
        name: 'Red Lake',
        subtype: 'red',
        itemWeight: { base: 0.002, sizeVariations: {} },
        pricing: { basePricePerLb: 18.85, priceVolatility: 'high' }
      },
      'rovada': {
        id: 'rovada',
        name: 'Rovada',
        subtype: 'red',
        itemWeight: { base: 0.0025, sizeVariations: {} },
        pricing: { basePricePerLb: 19.85, priceVolatility: 'high' }
      },
      'consort': {
        id: 'consort',
        name: 'Consort',
        subtype: 'black',
        itemWeight: { base: 0.003, sizeVariations: {} },
        pricing: { basePricePerLb: 22.85, priceVolatility: 'high' }
      },
      'ben-sarek': {
        id: 'ben-sarek',
        name: 'Ben Sarek',
        subtype: 'black',
        itemWeight: { base: 0.0028, sizeVariations: {} },
        pricing: { basePricePerLb: 24.85, priceVolatility: 'high' }
      },
      'white-imperial': {
        id: 'white-imperial',
        name: 'White Imperial',
        subtype: 'white',
        itemWeight: { base: 0.002, sizeVariations: {} },
        pricing: { basePricePerLb: 26.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '4oz',
      defaultSize: '4oz'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'red-lake'
  }
]
