// =============================================================================
// TREE NUTS COMMODITIES
// =============================================================================
// Complete category: Almond, Walnut, Pecan, Pistachio, Hazelnut, Macadamia, Cashew, Brazil Nut

import type { CommodityConfig } from '../types'

export const treeNutsCommodities: CommodityConfig[] = [
  {
    id: 'almond',
    name: 'Almond',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Almonds',
        specifications: 'California almonds, in-shell and shelled'
      },
      notes: 'USDA covers California almond varieties; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole almonds in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '30lb', name: '30 lb', weight: '30lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled almond kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Sliced almond kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'slivered',
          name: 'Slivered',
          description: 'Slivered almond kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'nonpareil': {
        id: 'nonpareil',
        name: 'Nonpareil',
        subtype: 'california',
        itemWeight: { base: 0.004, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'medium' }
      },
      'carmel': {
        id: 'carmel',
        name: 'Carmel',
        subtype: 'california',
        itemWeight: { base: 0.0038, sizeVariations: {} },
        pricing: { basePricePerLb: 6.45, priceVolatility: 'medium' }
      },
      'monterey': {
        id: 'monterey',
        name: 'Monterey',
        subtype: 'california',
        itemWeight: { base: 0.0042, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'medium' }
      },
      'butte': {
        id: 'butte',
        name: 'Butte',
        subtype: 'california',
        itemWeight: { base: 0.0035, sizeVariations: {} },
        pricing: { basePricePerLb: 6.65, priceVolatility: 'medium' }
      },
      'padre': {
        id: 'padre',
        name: 'Padre',
        subtype: 'california',
        itemWeight: { base: 0.0040, sizeVariations: {} },
        pricing: { basePricePerLb: 6.55, priceVolatility: 'medium' }
      },
      'fritz': {
        id: 'fritz',
        name: 'Fritz',
        subtype: 'california',
        itemWeight: { base: 0.0036, sizeVariations: {} },
        pricing: { basePricePerLb: 6.75, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Extra No. 1', 'No. 1', 'Select Sheller Run', 'Standard Sheller Run'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'nonpareil'
  },

  {
    id: 'walnut',
    name: 'Walnut',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Walnuts',
        specifications: 'California English walnuts, in-shell and shelled'
      },
      notes: 'USDA covers English walnuts; black walnuts estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole walnuts in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled walnut halves and pieces',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '30lb', name: '30 lb', weight: '30lb' },
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'halves',
          name: 'Halves',
          description: 'Walnut halves only',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'pieces',
          name: 'Pieces',
          description: 'Walnut pieces',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'english-chandler': {
        id: 'english-chandler',
        name: 'Chandler',
        subtype: 'english',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'medium' }
      },
      'english-howard': {
        id: 'english-howard',
        name: 'Howard',
        subtype: 'english',
        itemWeight: { base: 0.022, sizeVariations: {} },
        pricing: { basePricePerLb: 7.45, priceVolatility: 'medium' }
      },
      'english-tulare': {
        id: 'english-tulare',
        name: 'Tulare',
        subtype: 'english',
        itemWeight: { base: 0.028, sizeVariations: {} },
        pricing: { basePricePerLb: 7.25, priceVolatility: 'medium' }
      },
      'black-walnut': {
        id: 'black-walnut',
        name: 'Black Walnut',
        subtype: 'native',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Extra Light', 'Light', 'Light Amber', 'Amber'],
      defaultGrade: 'Light'
    },
    
    defaultVariety: 'english-chandler'
  },

  {
    id: 'pecan',
    name: 'Pecan',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Pecans',
        specifications: 'US pecans, in-shell and shelled'
      },
      notes: 'USDA covers major pecan varieties from Georgia, Texas, and other states'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole pecans in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled pecan halves and pieces',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '30lb', name: '30 lb', weight: '30lb' },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'halves',
          name: 'Halves',
          description: 'Pecan halves only',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'pieces',
          name: 'Pieces',
          description: 'Pecan pieces',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'desirable': {
        id: 'desirable',
        name: 'Desirable',
        subtype: 'improved',
        itemWeight: { base: 0.020, sizeVariations: {} },
        pricing: { basePricePerLb: 9.85, priceVolatility: 'high' }
      },
      'stuart': {
        id: 'stuart',
        name: 'Stuart',
        subtype: 'improved',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 9.25, priceVolatility: 'high' }
      },
      'pawnee': {
        id: 'pawnee',
        name: 'Pawnee',
        subtype: 'improved',
        itemWeight: { base: 0.016, sizeVariations: {} },
        pricing: { basePricePerLb: 10.85, priceVolatility: 'high' }
      },
      'cape-fear': {
        id: 'cape-fear',
        name: 'Cape Fear',
        subtype: 'improved',
        itemWeight: { base: 0.022, sizeVariations: {} },
        pricing: { basePricePerLb: 9.45, priceVolatility: 'high' }
      },
      'elliott': {
        id: 'elliott',
        name: 'Elliott',
        subtype: 'improved',
        itemWeight: { base: 0.014, sizeVariations: {} },
        pricing: { basePricePerLb: 11.85, priceVolatility: 'high' }
      },
      'native-pecan': {
        id: 'native-pecan',
        name: 'Native Pecan',
        subtype: 'native',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Fancy', 'Choice', 'Standard', 'Amber'],
      defaultGrade: 'Choice'
    },
    
    defaultVariety: 'desirable'
  },

  {
    id: 'pistachio',
    name: 'Pistachio',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Pistachios',
        specifications: 'California pistachios, in-shell and shelled'
      },
      notes: 'USDA covers California pistachio varieties'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole pistachios in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled pistachio kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'roasted-salted',
          name: 'Roasted & Salted',
          description: 'Roasted and salted pistachios',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'kerman': {
        id: 'kerman',
        name: 'Kerman',
        subtype: 'california',
        itemWeight: { base: 0.003, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'peters': {
        id: 'peters',
        name: 'Peters',
        subtype: 'california',
        itemWeight: { base: 0.0028, sizeVariations: {} },
        pricing: { basePricePerLb: 13.25, priceVolatility: 'high' }
      },
      'lost-hills': {
        id: 'lost-hills',
        name: 'Lost Hills',
        subtype: 'california',
        itemWeight: { base: 0.0032, sizeVariations: {} },
        pricing: { basePricePerLb: 12.45, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Fancy', 'Extra No. 1', 'No. 1'],
      defaultGrade: 'Extra No. 1'
    },
    
    defaultVariety: 'kerman'
  },

  {
    id: 'hazelnut',
    name: 'Hazelnut',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Hazelnuts',
        specifications: 'Oregon hazelnuts, in-shell and shelled'
      },
      notes: 'USDA covers Oregon hazelnut varieties'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole hazelnuts in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled hazelnut kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'blanched',
          name: 'Blanched',
          description: 'Blanched hazelnut kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'barcelona': {
        id: 'barcelona',
        name: 'Barcelona',
        subtype: 'oregon',
        itemWeight: { base: 0.0035, sizeVariations: {} },
        pricing: { basePricePerLb: 8.85, priceVolatility: 'medium' }
      },
      'jefferson': {
        id: 'jefferson',
        name: 'Jefferson',
        subtype: 'oregon',
        itemWeight: { base: 0.0038, sizeVariations: {} },
        pricing: { basePricePerLb: 9.25, priceVolatility: 'medium' }
      },
      'theta': {
        id: 'theta',
        name: 'Theta',
        subtype: 'oregon',
        itemWeight: { base: 0.0032, sizeVariations: {} },
        pricing: { basePricePerLb: 9.85, priceVolatility: 'medium' }
      },
      'gamma': {
        id: 'gamma',
        name: 'Gamma',
        subtype: 'oregon',
        itemWeight: { base: 0.0040, sizeVariations: {} },
        pricing: { basePricePerLb: 8.45, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Fancy', 'No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'barcelona'
  },

  {
    id: 'macadamia',
    name: 'Macadamia',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from Hawaii and specialty market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole macadamias in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled macadamia kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'roasted-salted',
          name: 'Roasted & Salted',
          description: 'Roasted and salted macadamias',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '8oz', name: '8 oz', weight: '8oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'beaumont': {
        id: 'beaumont',
        name: 'Beaumont',
        subtype: 'hawaii',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 18.85, priceVolatility: 'high' }
      },
      'mauka': {
        id: 'mauka',
        name: 'Mauka',
        subtype: 'hawaii',
        itemWeight: { base: 0.0085, sizeVariations: {} },
        pricing: { basePricePerLb: 19.85, priceVolatility: 'high' }
      },
      'keaau': {
        id: 'keaau',
        name: 'Keaau',
        subtype: 'hawaii',
        itemWeight: { base: 0.0075, sizeVariations: {} },
        pricing: { basePricePerLb: 17.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Style 0', 'Style 1', 'Style 2', 'Style 3'],
      defaultGrade: 'Style 1'
    },
    
    defaultVariety: 'beaumont'
  },

  {
    id: 'cashew',
    name: 'Cashew',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from imported tropical cashews'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'raw-shelled',
          name: 'Raw Shelled',
          description: 'Raw shelled cashew kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'roasted',
          name: 'Roasted',
          description: 'Roasted cashew kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'roasted-salted',
          name: 'Roasted & Salted',
          description: 'Roasted and salted cashews',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '8oz', name: '8 oz', weight: '8oz' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'pieces',
          name: 'Pieces',
          description: 'Cashew pieces',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'w180': {
        id: 'w180',
        name: 'W180 (Large)',
        subtype: 'grade-size',
        itemWeight: { base: 0.006, sizeVariations: {} },
        pricing: { basePricePerLb: 14.85, priceVolatility: 'high' }
      },
      'w240': {
        id: 'w240',
        name: 'W240 (Medium)',
        subtype: 'grade-size',
        itemWeight: { base: 0.005, sizeVariations: {} },
        pricing: { basePricePerLb: 13.85, priceVolatility: 'high' }
      },
      'w320': {
        id: 'w320',
        name: 'W320 (Small)',
        subtype: 'grade-size',
        itemWeight: { base: 0.004, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['W180', 'W240', 'W320', 'W450', 'Pieces'],
      defaultGrade: 'W240'
    },
    
    defaultVariety: 'w240'
  },

  {
    id: 'brazil-nut',
    name: 'Brazil Nut',
    category: 'Tree Nuts',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from wild-harvested South American imports'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'in-shell',
          name: 'In-Shell',
          description: 'Whole Brazil nuts in shell',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shelled',
          name: 'Shelled',
          description: 'Shelled Brazil nut kernels',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'large-brazil': {
        id: 'large-brazil',
        name: 'Large Brazil Nut',
        subtype: 'wild-harvested',
        itemWeight: { base: 0.015, sizeVariations: {} },
        pricing: { basePricePerLb: 16.85, priceVolatility: 'high' }
      },
      'medium-brazil': {
        id: 'medium-brazil',
        name: 'Medium Brazil Nut',
        subtype: 'wild-harvested',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 15.85, priceVolatility: 'high' }
      },
      'small-brazil': {
        id: 'small-brazil',
        name: 'Small Brazil Nut',
        subtype: 'wild-harvested',
        itemWeight: { base: 0.010, sizeVariations: {} },
        pricing: { basePricePerLb: 14.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['Large', 'Medium', 'Small', 'Pieces'],
      defaultGrade: 'Medium'
    },
    
    defaultVariety: 'medium-brazil'
  }
]
