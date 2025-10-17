// =============================================================================
// HERBS COMMODITIES
// =============================================================================
// Complete category: Basil, Cilantro, Parsley, Thyme, Rosemary, Oregano, Sage, Mint

import type { CommodityConfig } from '../types'

export const herbsCommodities: CommodityConfig[] = [
  {
    id: 'basil',
    name: 'Basil',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh basil leaves',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' },
                { id: '2oz', name: '2 oz', weight: '2oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            },
            {
              id: 'bulk',
              name: 'Bulk',
              type: 'bulk',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'chopped',
          name: 'Chopped',
          description: 'Pre-chopped fresh basil',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'sweet-basil': {
        id: 'sweet-basil',
        name: 'Sweet Basil',
        subtype: 'sweet',
        itemWeight: { base: 0.002, sizeVariations: {} },
        pricing: { basePricePerLb: 24.85, priceVolatility: 'high' }
      },
      'thai-basil': {
        id: 'thai-basil',
        name: 'Thai Basil',
        subtype: 'asian',
        itemWeight: { base: 0.0018, sizeVariations: {} },
        pricing: { basePricePerLb: 32.85, priceVolatility: 'high' }
      },
      'purple-basil': {
        id: 'purple-basil',
        name: 'Purple Basil',
        subtype: 'ornamental',
        itemWeight: { base: 0.0022, sizeVariations: {} },
        pricing: { basePricePerLb: 36.85, priceVolatility: 'high' }
      },
      'lemon-basil': {
        id: 'lemon-basil',
        name: 'Lemon Basil',
        subtype: 'citrus',
        itemWeight: { base: 0.0019, sizeVariations: {} },
        pricing: { basePricePerLb: 38.85, priceVolatility: 'high' }
      },
      'holy-basil': {
        id: 'holy-basil',
        name: 'Holy Basil',
        subtype: 'medicinal',
        itemWeight: { base: 0.0016, sizeVariations: {} },
        pricing: { basePricePerLb: 42.85, priceVolatility: 'high' }
      },
      'genovese-basil': {
        id: 'genovese-basil',
        name: 'Genovese Basil',
        subtype: 'italian',
        itemWeight: { base: 0.0025, sizeVariations: {} },
        pricing: { basePricePerLb: 28.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.75oz',
      defaultSize: '0.75oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'sweet-basil'
  },

  {
    id: 'cilantro',
    name: 'Cilantro',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh cilantro leaves',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch', isDefault: true },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' },
                { id: '24bunch', name: '24 Bunch', count: '24bunch' }
              ],
              isDefault: true
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '1oz', name: '1 oz', weight: '1oz' },
                { id: '2oz', name: '2 oz', weight: '2oz' }
              ]
            },
            {
              id: 'bulk',
              name: 'Bulk',
              type: 'bulk',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'chopped',
          name: 'Chopped',
          description: 'Pre-chopped fresh cilantro',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'standard-cilantro': {
        id: 'standard-cilantro',
        name: 'Standard Cilantro',
        itemWeight: { base: 0.003, sizeVariations: {} },
        pricing: { basePricePerLb: 18.85, priceVolatility: 'high' }
      },
      'slow-bolt': {
        id: 'slow-bolt',
        name: 'Slow Bolt',
        itemWeight: { base: 0.0028, sizeVariations: {} },
        pricing: { basePricePerLb: 22.85, priceVolatility: 'high' }
      },
      'mexican-cilantro': {
        id: 'mexican-cilantro',
        name: 'Mexican Cilantro',
        itemWeight: { base: 0.0032, sizeVariations: {} },
        pricing: { basePricePerLb: 24.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '1bunch',
      defaultSize: '1bunch'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'standard-cilantro'
  },

  {
    id: 'parsley',
    name: 'Parsley',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh parsley leaves',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch', isDefault: true },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' },
                { id: '24bunch', name: '24 Bunch', count: '24bunch' }
              ],
              isDefault: true
            },
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '1oz', name: '1 oz', weight: '1oz' },
                { id: '2oz', name: '2 oz', weight: '2oz' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'chopped',
          name: 'Chopped',
          description: 'Pre-chopped fresh parsley',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'flat-leaf': {
        id: 'flat-leaf',
        name: 'Flat Leaf (Italian)',
        subtype: 'flat-leaf',
        itemWeight: { base: 0.0025, sizeVariations: {} },
        pricing: { basePricePerLb: 16.85, priceVolatility: 'high' }
      },
      'curly-leaf': {
        id: 'curly-leaf',
        name: 'Curly Leaf',
        subtype: 'curly',
        itemWeight: { base: 0.0022, sizeVariations: {} },
        pricing: { basePricePerLb: 14.85, priceVolatility: 'high' }
      },
      'hamburg-parsley': {
        id: 'hamburg-parsley',
        name: 'Hamburg Parsley',
        subtype: 'root',
        itemWeight: { base: 0.0028, sizeVariations: {} },
        pricing: { basePricePerLb: 22.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '1bunch',
      defaultSize: '1bunch'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'flat-leaf'
  },

  {
    id: 'thyme',
    name: 'Thyme',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-sprigs',
          name: 'Whole Sprigs',
          description: 'Whole fresh thyme sprigs',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz' },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'leaves-only',
          name: 'Leaves Only',
          description: 'Fresh thyme leaves stripped from stems',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.25oz', name: '0.25 oz', weight: '0.25oz', isDefault: true },
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'common-thyme': {
        id: 'common-thyme',
        name: 'Common Thyme',
        subtype: 'common',
        itemWeight: { base: 0.0008, sizeVariations: {} },
        pricing: { basePricePerLb: 48.85, priceVolatility: 'high' }
      },
      'lemon-thyme': {
        id: 'lemon-thyme',
        name: 'Lemon Thyme',
        subtype: 'citrus',
        itemWeight: { base: 0.0009, sizeVariations: {} },
        pricing: { basePricePerLb: 56.85, priceVolatility: 'high' }
      },
      'french-thyme': {
        id: 'french-thyme',
        name: 'French Thyme',
        subtype: 'culinary',
        itemWeight: { base: 0.0007, sizeVariations: {} },
        pricing: { basePricePerLb: 62.85, priceVolatility: 'high' }
      },
      'creeping-thyme': {
        id: 'creeping-thyme',
        name: 'Creeping Thyme',
        subtype: 'ornamental',
        itemWeight: { base: 0.0006, sizeVariations: {} },
        pricing: { basePricePerLb: 52.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.5oz',
      defaultSize: '0.5oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'common-thyme'
  },

  {
    id: 'rosemary',
    name: 'Rosemary',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-sprigs',
          name: 'Whole Sprigs',
          description: 'Whole fresh rosemary sprigs',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' },
                { id: '1.5oz', name: '1.5 oz', weight: '1.5oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'chopped',
          name: 'Chopped',
          description: 'Pre-chopped fresh rosemary',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'common-rosemary': {
        id: 'common-rosemary',
        name: 'Common Rosemary',
        subtype: 'upright',
        itemWeight: { base: 0.0012, sizeVariations: {} },
        pricing: { basePricePerLb: 32.85, priceVolatility: 'high' }
      },
      'prostrate-rosemary': {
        id: 'prostrate-rosemary',
        name: 'Prostrate Rosemary',
        subtype: 'creeping',
        itemWeight: { base: 0.0010, sizeVariations: {} },
        pricing: { basePricePerLb: 36.85, priceVolatility: 'high' }
      },
      'tuscan-blue': {
        id: 'tuscan-blue',
        name: 'Tuscan Blue',
        subtype: 'culinary',
        itemWeight: { base: 0.0014, sizeVariations: {} },
        pricing: { basePricePerLb: 42.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.75oz',
      defaultSize: '0.75oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'common-rosemary'
  },

  {
    id: 'oregano',
    name: 'Oregano',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh oregano leaves',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz' },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'greek-oregano': {
        id: 'greek-oregano',
        name: 'Greek Oregano',
        subtype: 'mediterranean',
        itemWeight: { base: 0.0015, sizeVariations: {} },
        pricing: { basePricePerLb: 38.85, priceVolatility: 'high' }
      },
      'italian-oregano': {
        id: 'italian-oregano',
        name: 'Italian Oregano',
        subtype: 'mediterranean',
        itemWeight: { base: 0.0018, sizeVariations: {} },
        pricing: { basePricePerLb: 34.85, priceVolatility: 'high' }
      },
      'mexican-oregano': {
        id: 'mexican-oregano',
        name: 'Mexican Oregano',
        subtype: 'mexican',
        itemWeight: { base: 0.0012, sizeVariations: {} },
        pricing: { basePricePerLb: 42.85, priceVolatility: 'high' }
      },
      'wild-oregano': {
        id: 'wild-oregano',
        name: 'Wild Oregano',
        subtype: 'wild',
        itemWeight: { base: 0.0010, sizeVariations: {} },
        pricing: { basePricePerLb: 48.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.5oz',
      defaultSize: '0.5oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'greek-oregano'
  },

  {
    id: 'sage',
    name: 'Sage',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh sage leaves',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz' },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'common-sage': {
        id: 'common-sage',
        name: 'Common Sage',
        subtype: 'culinary',
        itemWeight: { base: 0.0020, sizeVariations: {} },
        pricing: { basePricePerLb: 28.85, priceVolatility: 'high' }
      },
      'purple-sage': {
        id: 'purple-sage',
        name: 'Purple Sage',
        subtype: 'ornamental',
        itemWeight: { base: 0.0018, sizeVariations: {} },
        pricing: { basePricePerLb: 36.85, priceVolatility: 'high' }
      },
      'pineapple-sage': {
        id: 'pineapple-sage',
        name: 'Pineapple Sage',
        subtype: 'specialty',
        itemWeight: { base: 0.0022, sizeVariations: {} },
        pricing: { basePricePerLb: 42.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.5oz',
      defaultSize: '0.5oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'common-sage'
  },

  {
    id: 'mint',
    name: 'Mint',
    category: 'Herbs',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty herb market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-leaves',
          name: 'Whole Leaves',
          description: 'Whole fresh mint leaves',
          packageTypes: [
            {
              id: 'clamshell',
              name: 'Clamshell',
              type: 'clamshell',
              sizes: [
                { id: '0.75oz', name: '0.75 oz', weight: '0.75oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' },
                { id: '1.5oz', name: '1.5 oz', weight: '1.5oz' }
              ],
              isDefault: true
            },
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '1bunch', name: '1 Bunch', count: '1bunch' },
                { id: '12bunch', name: '12 Bunch', count: '12bunch' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'chopped',
          name: 'Chopped',
          description: 'Pre-chopped fresh mint',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '0.5oz', name: '0.5 oz', weight: '0.5oz', isDefault: true },
                { id: '1oz', name: '1 oz', weight: '1oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'spearmint': {
        id: 'spearmint',
        name: 'Spearmint',
        subtype: 'common',
        itemWeight: { base: 0.0018, sizeVariations: {} },
        pricing: { basePricePerLb: 22.85, priceVolatility: 'high' }
      },
      'peppermint': {
        id: 'peppermint',
        name: 'Peppermint',
        subtype: 'common',
        itemWeight: { base: 0.0020, sizeVariations: {} },
        pricing: { basePricePerLb: 26.85, priceVolatility: 'high' }
      },
      'chocolate-mint': {
        id: 'chocolate-mint',
        name: 'Chocolate Mint',
        subtype: 'specialty',
        itemWeight: { base: 0.0022, sizeVariations: {} },
        pricing: { basePricePerLb: 32.85, priceVolatility: 'high' }
      },
      'apple-mint': {
        id: 'apple-mint',
        name: 'Apple Mint',
        subtype: 'specialty',
        itemWeight: { base: 0.0025, sizeVariations: {} },
        pricing: { basePricePerLb: 28.85, priceVolatility: 'high' }
      },
      'mojito-mint': {
        id: 'mojito-mint',
        name: 'Mojito Mint',
        subtype: 'cocktail',
        itemWeight: { base: 0.0019, sizeVariations: {} },
        pricing: { basePricePerLb: 34.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '0.75oz',
      defaultSize: '0.75oz'
    },
    
    quality: {
      grades: ['Premium', 'No. 1'],
      defaultGrade: 'Premium'
    },
    
    defaultVariety: 'spearmint'
  }
]
