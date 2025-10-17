// =============================================================================
// TROPICAL FRUITS COMMODITIES
// =============================================================================
// Complete category: Pineapple, Mango, Papaya, Avocado, Banana, Coconut, Passion Fruit, Dragon Fruit, Kiwi, Guava

import type { CommodityConfig } from '../types'

export const tropicalFruitsCommodities: CommodityConfig[] = [
  {
    id: 'pineapple',
    name: 'Pineapple',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: false,
      primaryMapping: {
        commodity: 'Pineapples',
        specifications: 'Fresh pineapples, imported and domestic'
      },
      notes: 'USDA covers imported pineapples; domestic Hawaii production estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh pineapples',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '6ct', name: '6 Count', count: '6ct', isDefault: true },
                { id: '7ct', name: '7 Count', count: '7ct' },
                { id: '8ct', name: '8 Count', count: '8ct' },
                { id: '10ct', name: '10 Count', count: '10ct' }
              ],
              isDefault: true
            },
            {
              id: 'individual',
              name: 'Individual',
              type: 'individual',
              sizes: [
                { id: '1each', name: '1 Each', count: '1each' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'cored',
          name: 'Cored',
          description: 'Cored pineapples (crown and core removed)',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb', isDefault: true },
                { id: '3lb', name: '3 lb', weight: '3lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'chunks',
          name: 'Chunks',
          description: 'Pre-cut pineapple chunks',
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
      'gold-pineapple': {
        id: 'gold-pineapple',
        name: 'Gold (Extra Sweet)',
        subtype: 'premium',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'md2-pineapple': {
        id: 'md2-pineapple',
        name: 'MD2',
        subtype: 'premium',
        itemWeight: { base: 3.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'smooth-cayenne': {
        id: 'smooth-cayenne',
        name: 'Smooth Cayenne',
        subtype: 'standard',
        itemWeight: { base: 4.0, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'queen-pineapple': {
        id: 'queen-pineapple',
        name: 'Queen',
        subtype: 'specialty',
        itemWeight: { base: 2.5, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '6ct',
      defaultSize: '6ct'
    },
    
    quality: {
      grades: ['Fancy', 'No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'gold-pineapple'
  },

  {
    id: 'mango',
    name: 'Mango',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: false,
      primaryMapping: {
        commodity: 'Mangoes',
        specifications: 'Fresh mangoes, imported'
      },
      notes: 'USDA covers imported mangoes; domestic Florida/California production estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh mangoes',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '10ct', name: '10 Count', count: '10ct', isDefault: true },
                { id: '12ct', name: '12 Count', count: '12ct' },
                { id: '14ct', name: '14 Count', count: '14ct' },
                { id: '18ct', name: '18 Count', count: '18ct' }
              ],
              isDefault: true
            },
            {
              id: 'tray-pack',
              name: 'Tray Pack',
              type: 'tray-pack',
              sizes: [
                { id: '4ct', name: '4 Count', count: '4ct' },
                { id: '6ct', name: '6 Count', count: '6ct' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'sliced',
          name: 'Sliced',
          description: 'Pre-sliced mango',
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
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced mango',
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
      'tommy-atkins': {
        id: 'tommy-atkins',
        name: 'Tommy Atkins',
        subtype: 'standard',
        itemWeight: { base: 1.2, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'ataulfo': {
        id: 'ataulfo',
        name: 'Ataulfo (Champagne)',
        subtype: 'premium',
        itemWeight: { base: 0.6, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'kent': {
        id: 'kent',
        name: 'Kent',
        subtype: 'premium',
        itemWeight: { base: 1.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'keitt': {
        id: 'keitt',
        name: 'Keitt',
        subtype: 'standard',
        itemWeight: { base: 1.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'haden': {
        id: 'haden',
        name: 'Haden',
        subtype: 'heritage',
        itemWeight: { base: 1.3, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'francis': {
        id: 'francis',
        name: 'Francis',
        subtype: 'specialty',
        itemWeight: { base: 1.4, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'palmer': {
        id: 'palmer',
        name: 'Palmer',
        subtype: 'specialty',
        itemWeight: { base: 1.6, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'high' }
      },
      'valencia-pride': {
        id: 'valencia-pride',
        name: 'Valencia Pride',
        subtype: 'specialty',
        itemWeight: { base: 1.1, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10ct',
      defaultSize: '10ct'
    },
    
    quality: {
      grades: ['Fancy', 'No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'tommy-atkins'
  },

  {
    id: 'papaya',
    name: 'Papaya',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: false,
      primaryMapping: {
        commodity: 'Papayas',
        specifications: 'Fresh papayas, imported and domestic'
      },
      notes: 'USDA covers imported papayas; domestic Hawaii production estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh papayas',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '8ct', name: '8 Count', count: '8ct', isDefault: true },
                { id: '10ct', name: '10 Count', count: '10ct' },
                { id: '12ct', name: '12 Count', count: '12ct' }
              ],
              isDefault: true
            },
            {
              id: 'individual',
              name: 'Individual',
              type: 'individual',
              sizes: [
                { id: '1each', name: '1 Each', count: '1each' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'halved',
          name: 'Halved',
          description: 'Halved papayas (seeded)',
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
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced papaya',
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
      'solo-papaya': {
        id: 'solo-papaya',
        name: 'Solo',
        subtype: 'hawaiian',
        itemWeight: { base: 1.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'maradol': {
        id: 'maradol',
        name: 'Maradol',
        subtype: 'mexican',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'red-lady': {
        id: 'red-lady',
        name: 'Red Lady',
        subtype: 'hybrid',
        itemWeight: { base: 2.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'tainung': {
        id: 'tainung',
        name: 'Tainung',
        subtype: 'asian',
        itemWeight: { base: 2.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '8ct',
      defaultSize: '8ct'
    },
    
    quality: {
      grades: ['Fancy', 'No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'solo-papaya'
  },

  {
    id: 'avocado',
    name: 'Avocado',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Avocados',
        specifications: 'California and imported avocados'
      },
      notes: 'USDA covers California Hass and imported varieties'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-fruit',
          name: 'Whole Fruit',
          description: 'Whole fresh avocados',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '20lb', name: '20 lb', weight: '20lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '4ct', name: '4 Count', count: '4ct' },
                { id: '5ct', name: '5 Count', count: '5ct' },
                { id: '6ct', name: '6 Count', count: '6ct' }
              ]
            },
            {
              id: 'individual',
              name: 'Individual',
              type: 'individual',
              sizes: [
                { id: '1each', name: '1 Each', count: '1each' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'halved',
          name: 'Halved',
          description: 'Halved avocados (pitted)',
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
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced avocado',
          packageTypes: [
            {
              id: 'container',
              name: 'Container',
              type: 'container',
              sizes: [
                { id: '6oz', name: '6 oz', weight: '6oz', isDefault: true },
                { id: '8oz', name: '8 oz', weight: '8oz' }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'hass': {
        id: 'hass',
        name: 'Hass',
        subtype: 'california',
        itemWeight: { base: 0.4, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'high' }
      },
      'fuerte': {
        id: 'fuerte',
        name: 'Fuerte',
        subtype: 'california',
        itemWeight: { base: 0.6, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'high' }
      },
      'bacon': {
        id: 'bacon',
        name: 'Bacon',
        subtype: 'california',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'high' }
      },
      'pinkerton': {
        id: 'pinkerton',
        name: 'Pinkerton',
        subtype: 'california',
        itemWeight: { base: 0.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'high' }
      },
      'reed': {
        id: 'reed',
        name: 'Reed',
        subtype: 'california',
        itemWeight: { base: 1.0, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'lamb-hass': {
        id: 'lamb-hass',
        name: 'Lamb Hass',
        subtype: 'california',
        itemWeight: { base: 0.7, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'hass'
  },

  {
    id: 'banana',
    name: 'Banana',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: false,
      primaryMapping: {
        commodity: 'Bananas',
        specifications: 'Fresh bananas, imported'
      },
      notes: 'USDA covers imported bananas; limited domestic production'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'hands',
          name: 'Hands',
          description: 'Banana hands (clusters)',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '40lb', name: '40 lb', weight: '40lb', isDefault: true },
                { id: '38lb', name: '38 lb', weight: '38lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'bunches',
          name: 'Bunches',
          description: 'Consumer banana bunches',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '3lb', name: '3 lb', weight: '3lb', isDefault: true },
                { id: '2lb', name: '2 lb', weight: '2lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'individual',
          name: 'Individual',
          description: 'Individual bananas',
          packageTypes: [
            {
              id: 'individual',
              name: 'Individual',
              type: 'individual',
              sizes: [
                { id: '1each', name: '1 Each', count: '1each', isDefault: true }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'cavendish': {
        id: 'cavendish',
        name: 'Cavendish',
        subtype: 'standard',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 0.85, priceVolatility: 'low' }
      },
      'plantain': {
        id: 'plantain',
        name: 'Plantain',
        subtype: 'cooking',
        itemWeight: { base: 0.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'red-banana': {
        id: 'red-banana',
        name: 'Red Banana',
        subtype: 'specialty',
        itemWeight: { base: 0.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'high' }
      },
      'baby-banana': {
        id: 'baby-banana',
        name: 'Baby Banana',
        subtype: 'specialty',
        itemWeight: { base: 0.1, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'high' }
      },
      'burro-banana': {
        id: 'burro-banana',
        name: 'Burro Banana',
        subtype: 'specialty',
        itemWeight: { base: 0.3, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'high' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '40lb',
      defaultSize: '40lb'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'cavendish'
  },

  {
    id: 'coconut',
    name: 'Coconut',
    category: 'Tropical Fruits',
    
    usdaCoverage: {
      hasPricing: false,
      hasProduction: false,
      notes: 'Limited USDA coverage; pricing estimated from imported tropical coconuts'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole-coconut',
          name: 'Whole Coconut',
          description: 'Whole coconuts with husk',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '9ct', name: '9 Count', count: '9ct', isDefault: true },
                { id: '12ct', name: '12 Count', count: '12ct' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        },
        {
          id: 'shredded',
          name: 'Shredded',
          description: 'Fresh shredded coconut meat',
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
      'young-coconut': {
        id: 'young-coconut',
        name: 'Young Coconut',
        subtype: 'drinking',
        itemWeight: { base: 2.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'mature-coconut': {
        id: 'mature-coconut',
        name: 'Mature Coconut',
        subtype: 'eating',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.45, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '9ct',
      defaultSize: '9ct'
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'young-coconut'
  }
]
