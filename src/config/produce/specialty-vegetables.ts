// =============================================================================
// SPECIALTY VEGETABLES COMMODITIES
// =============================================================================
// Complete category: Asparagus, Artichoke, Fennel, Okra, Corn, Mushroom, Rhubarb

import type { CommodityConfig } from '../types'

export const specialtyVegetablesCommodities: CommodityConfig[] = [
  {
    id: 'asparagus',
    name: 'Asparagus',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Asparagus',
        specifications: 'Fresh market asparagus'
      },
      notes: 'USDA covers standard green asparagus; white and purple varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-spears',
          name: 'Whole Spears',
          description: 'Whole fresh asparagus spears',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '11lb', name: '11 lb', weight: '11lb', isDefault: true },
                { id: '15lb', name: '15 lb', weight: '15lb' }
              ],
              isDefault: true
            },
            {
              id: 'bundle',
              name: 'Bundle',
              type: 'bundle',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'trimmed',
          name: 'Trimmed',
          description: 'Trimmed asparagus spears',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
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
      'green-asparagus': {
        id: 'green-asparagus',
        name: 'Green Asparagus',
        itemWeight: { base: 0.05, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'white-asparagus': {
        id: 'white-asparagus',
        name: 'White Asparagus',
        itemWeight: { base: 0.06, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      },
      'purple-asparagus': {
        id: 'purple-asparagus',
        name: 'Purple Asparagus',
        itemWeight: { base: 0.055, sizeVariations: {} },
        pricing: { basePricePerLb: 7.25, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '11lb',
      defaultSize: '11lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'green-asparagus'
  },

  {
    id: 'artichoke',
    name: 'Artichoke',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Artichokes',
        specifications: 'Fresh market artichokes'
      },
      notes: 'USDA covers standard globe artichokes; baby artichokes estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh artichokes',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '18ct', name: '18 Count', count: '18ct', isDefault: true },
                { id: '24ct', name: '24 Count', count: '24ct' },
                { id: '36ct', name: '36 Count', count: '36ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'hearts',
          name: 'Hearts',
          description: 'Artichoke hearts',
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
      'globe-artichoke': {
        id: 'globe-artichoke',
        name: 'Globe Artichoke',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'baby-artichoke': {
        id: 'baby-artichoke',
        name: 'Baby Artichoke',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '18ct',
      defaultSize: '18ct'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'globe-artichoke'
  },

  {
    id: 'fennel',
    name: 'Fennel',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-bulb',
          name: 'Whole Bulb',
          description: 'Whole fennel bulbs with fronds',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '18ct', name: '18 Count', count: '18ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'trimmed',
          name: 'Trimmed',
          description: 'Trimmed fennel bulbs',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb', isDefault: true },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'florence-fennel': {
        id: 'florence-fennel',
        name: 'Florence Fennel',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'bronze-fennel': {
        id: 'bronze-fennel',
        name: 'Bronze Fennel',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12ct',
      defaultSize: '12ct'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'florence-fennel'
  },

  {
    id: 'okra',
    name: 'Okra',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Okra',
        specifications: 'Fresh market okra'
      },
      notes: 'USDA covers standard okra varieties'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-pods',
          name: 'Whole Pods',
          description: 'Whole fresh okra pods',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
                { id: '25lb', name: '25 lb', weight: '25lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
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
      'clemson-spineless': {
        id: 'clemson-spineless',
        name: 'Clemson Spineless',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'red-burgundy': {
        id: 'red-burgundy',
        name: 'Red Burgundy',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'emerald': {
        id: 'emerald',
        name: 'Emerald',
        itemWeight: { base: 0.022, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'annie-oakley': {
        id: 'annie-oakley',
        name: 'Annie Oakley',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10lb',
      defaultSize: '10lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'clemson-spineless'
  },

  {
    id: 'corn',
    name: 'Corn',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Sweet Corn',
        specifications: 'Fresh market sweet corn'
      },
      notes: 'USDA covers sweet corn; field corn and specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'ears',
          name: 'Ears',
          description: 'Whole corn ears with husks',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '48ct', name: '48 Count', count: '48ct', isDefault: true },
                { id: '60ct', name: '60 Count', count: '60ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'husked',
          name: 'Husked',
          description: 'Husked corn ears',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '24ct', name: '24 Count', count: '24ct' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'kernels',
          name: 'Kernels',
          description: 'Cut corn kernels',
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
      // Sweet Corn
      'silver-queen': {
        id: 'silver-queen',
        name: 'Silver Queen',
        subtype: 'sweet',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'butter-and-sugar': {
        id: 'butter-and-sugar',
        name: 'Butter and Sugar',
        subtype: 'sweet',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'honey-select': {
        id: 'honey-select',
        name: 'Honey Select',
        subtype: 'sweet',
        itemWeight: { base: 0.68, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'peaches-and-cream': {
        id: 'peaches-and-cream',
        name: 'Peaches and Cream',
        subtype: 'sweet',
        itemWeight: { base: 0.72, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      
      // Field Corn
      'dent-corn': {
        id: 'dent-corn',
        name: 'Dent Corn',
        subtype: 'field',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 0.45, priceVolatility: 'low' }
      },
      'flint-corn': {
        id: 'flint-corn',
        name: 'Flint Corn',
        subtype: 'field',
        itemWeight: { base: 0.80, sizeVariations: {} },
        pricing: { basePricePerLb: 0.55, priceVolatility: 'low' }
      },
      
      // Popcorn
      'yellow-popcorn': {
        id: 'yellow-popcorn',
        name: 'Yellow Popcorn',
        subtype: 'popcorn',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'white-popcorn': {
        id: 'white-popcorn',
        name: 'White Popcorn',
        subtype: 'popcorn',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      
      // Ornamental
      'indian-corn': {
        id: 'indian-corn',
        name: 'Indian Corn',
        subtype: 'ornamental',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'high' }
      },
      'glass-gem': {
        id: 'glass-gem',
        name: 'Glass Gem',
        subtype: 'ornamental',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 6.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '48ct',
      defaultSize: '48ct'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'silver-queen'
  },

  {
    id: 'mushroom',
    name: 'Mushroom',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Mushrooms',
        specifications: 'Fresh market mushrooms'
      },
      notes: 'USDA covers button mushrooms; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh mushrooms',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            },
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '8oz', name: '8 oz', weight: '8oz' },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced mushrooms',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '8oz', name: '8 oz', weight: '8oz', isDefault: true },
                { id: '1lb', name: '1 lb', weight: '1lb' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'button-mushroom': {
        id: 'button-mushroom',
        name: 'Button Mushroom',
        itemWeight: { base: 0.05, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'cremini': {
        id: 'cremini',
        name: 'Cremini',
        itemWeight: { base: 0.06, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'portobello': {
        id: 'portobello',
        name: 'Portobello',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'shiitake': {
        id: 'shiitake',
        name: 'Shiitake',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 8.25, priceVolatility: 'high' }
      },
      'oyster-mushroom': {
        id: 'oyster-mushroom',
        name: 'Oyster Mushroom',
        itemWeight: { base: 0.04, sizeVariations: {} },
        pricing: { basePricePerLb: 6.45, priceVolatility: 'high' }
      },
      'maitake': {
        id: 'maitake',
        name: 'Maitake',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 12.85, priceVolatility: 'high' }
      },
      'enoki': {
        id: 'enoki',
        name: 'Enoki',
        itemWeight: { base: 0.01, sizeVariations: {} },
        pricing: { basePricePerLb: 9.25, priceVolatility: 'high' }
      },
      'king-trumpet': {
        id: 'king-trumpet',
        name: 'King Trumpet',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 7.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10lb',
      defaultSize: '10lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'button-mushroom'
  },

  {
    id: 'rhubarb',
    name: 'Rhubarb',
    category: 'Specialty Vegetables',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from specialty market data'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'stalks',
          name: 'Stalks',
          description: 'Whole rhubarb stalks',
          packageTypes: [
            {
              id: 'bundle',
              name: 'Bundle',
              type: 'bundle',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '10lb', name: '10 lb', weight: '10lb' },
                { id: '20lb', name: '20 lb', weight: '20lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced rhubarb',
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
      'victoria': {
        id: 'victoria',
        name: 'Victoria',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'cherry-red': {
        id: 'cherry-red',
        name: 'Cherry Red',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'canada-red': {
        id: 'canada-red',
        name: 'Canada Red',
        itemWeight: { base: 0.20, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '1lb',
      defaultSize: '1lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'victoria'
  }
]
