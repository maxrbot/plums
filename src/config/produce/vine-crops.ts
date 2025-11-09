// =============================================================================
// VINE CROPS COMMODITIES
// =============================================================================
// Complete category: Tomato, Bell Pepper, Hot Pepper, Cucumber, Summer Squash, Winter Squash, Melon, Eggplant

import type { CommodityConfig } from '../types'

export const vineCropsCommodities: CommodityConfig[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Tomatoes',
        specifications: 'Fresh market tomatoes, field grown'
      },
      notes: 'USDA covers standard tomatoes; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging for vine-ripe tomatoes
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        // 2-Layer Cartons (20lb)
        {
          id: '20lb-2-layer-carton',
          name: '20lb 2-Layer Carton',
          type: 'carton',
          sizes: [], // No separate size selection - weight is in package name
          sizeClassifications: [
            { id: '3x4', name: '3x4', description: '24 count', isDefault: false },
            { id: '4x4', name: '4x4', description: '32 count', isDefault: false },
            { id: '4x5', name: '4x5', description: '40 count', isDefault: true },
            { id: '5x5', name: '5x5', description: '50 count', isDefault: false },
            { id: '5x6', name: '5x6', description: '60 count', isDefault: false }
          ],
          isDefault: true
        },
        // Volume Filled Cartons (25lb)
        {
          id: '25lb-volume-filled-carton',
          name: '25lb Volume Filled Carton',
          type: 'carton',
          sizes: [], // No separate size selection - weight is in package name
          sizeClassifications: [
            { id: '4x5-larger', name: '4x5 & Larger', description: '~45 count', isDefault: false },
            { id: '5x5', name: '5x5', description: '50-58 count', isDefault: true },
            { id: '5x6', name: '5x6', description: '70-75 count', isDefault: false },
            { id: '6x6', name: '6x6', description: '90-95 count', isDefault: false }
          ]
        },
        // RPC #6408 (18lb)
        {
          id: '18lb-rpc-6408',
          name: '18lb RPC #6408',
          type: 'rpc',
          sizes: [], // No separate size selection - weight is in package name
          sizeClassifications: [
            { id: '3x4', name: '3x4', description: '1-layer', isDefault: false },
            { id: '4x4', name: '4x4', description: '1-layer', isDefault: false },
            { id: '4x5', name: '4x5', description: '1-layer', isDefault: true },
            { id: '5x5', name: '5x5', description: '1-layer', isDefault: false },
            { id: '5x6', name: '5x6', description: '1-layer', isDefault: false }
          ]
        },
        // Panta-Pack Cartons (15lb)
        {
          id: '15lb-panta-pack-carton',
          name: '15lb Panta-Pack Carton',
          type: 'carton',
          sizes: [], // No separate size selection - weight is in package name
          sizeClassifications: [
            { id: '18s', name: '18s', description: '18 count', isDefault: false },
            { id: '20s', name: '20s', description: '20 count', isDefault: false },
            { id: '22s', name: '22s', description: '22 count', isDefault: false },
            { id: '25s', name: '25s', description: '25 count', isDefault: true },
            { id: '28s', name: '28s', description: '28 count', isDefault: false },
            { id: '30s', name: '30s', description: '30 count', isDefault: false },
            { id: '32s', name: '32s', description: '32 count', isDefault: false }
          ]
        }
      ],
      defaultPackage: '20lb-2-layer-carton',
      defaultSize: '4x5'
    },
    
    varieties: {
      // Roma/Paste Tomatoes
      'san-marzano': {
        id: 'san-marzano',
        name: 'San Marzano',
        subtype: 'roma',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'roma-vf': {
        id: 'roma-vf',
        name: 'Roma VF',
        subtype: 'roma',
        itemWeight: { base: 0.22, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'amish-paste': {
        id: 'amish-paste',
        name: 'Amish Paste',
        subtype: 'roma',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'opalka': {
        id: 'opalka',
        name: 'Opalka',
        subtype: 'roma',
        itemWeight: { base: 0.28, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'medium' }
      },
      'principe-borghese': {
        id: 'principe-borghese',
        name: 'Principe Borghese',
        subtype: 'roma',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'speckled-roman': {
        id: 'speckled-roman',
        name: 'Speckled Roman',
        subtype: 'roma',
        itemWeight: { base: 0.32, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'phoenix': {
        id: 'phoenix',
        name: 'Phoenix',
        subtype: 'roma',
        itemWeight: { base: 0.26, sizeVariations: {} },
        pricing: { basePricePerLb: 3.15, priceVolatility: 'medium' }
      },
      'martinos-roma': {
        id: 'martinos-roma',
        name: 'Martino\'s Roma',
        subtype: 'roma',
        itemWeight: { base: 0.24, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      
      // Beefsteak Tomatoes
      'brandywine': {
        id: 'brandywine',
        name: 'Brandywine',
        subtype: 'beefsteak',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'big-beef': {
        id: 'big-beef',
        name: 'Big Beef',
        subtype: 'beefsteak',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'celebrity': {
        id: 'celebrity',
        name: 'Celebrity',
        subtype: 'beefsteak',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'better-boy': {
        id: 'better-boy',
        name: 'Better Boy',
        subtype: 'beefsteak',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 3.15, priceVolatility: 'medium' }
      },
      'early-girl': {
        id: 'early-girl',
        name: 'Early Girl',
        subtype: 'beefsteak',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'mortgage-lifter': {
        id: 'mortgage-lifter',
        name: 'Mortgage Lifter',
        subtype: 'beefsteak',
        itemWeight: { base: 1.25, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'german-johnson': {
        id: 'german-johnson',
        name: 'German Johnson',
        subtype: 'beefsteak',
        itemWeight: { base: 0.95, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'medium' }
      },
      'supersteak': {
        id: 'supersteak',
        name: 'Supersteak',
        subtype: 'beefsteak',
        itemWeight: { base: 1.15, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'medium' }
      },
      
      // Heirloom Tomatoes
      'brandywine-heirloom': {
        id: 'brandywine-heirloom',
        name: 'Brandywine',
        subtype: 'heirloom',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'medium' }
      },
      'cherokee-purple': {
        id: 'cherokee-purple',
        name: 'Cherokee Purple',
        subtype: 'heirloom',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'medium' }
      },
      'green-zebra': {
        id: 'green-zebra',
        name: 'Green Zebra',
        subtype: 'heirloom',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 4.95, priceVolatility: 'medium' }
      },
      'black-krim': {
        id: 'black-krim',
        name: 'Black Krim',
        subtype: 'heirloom',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'medium' }
      },
      'yellow-brandywine': {
        id: 'yellow-brandywine',
        name: 'Yellow Brandywine',
        subtype: 'heirloom',
        itemWeight: { base: 0.80, sizeVariations: {} },
        pricing: { basePricePerLb: 5.45, priceVolatility: 'medium' }
      },
      'pineapple': {
        id: 'pineapple',
        name: 'Pineapple',
        subtype: 'heirloom',
        itemWeight: { base: 1.05, sizeVariations: {} },
        pricing: { basePricePerLb: 5.95, priceVolatility: 'medium' }
      },
      'striped-german': {
        id: 'striped-german',
        name: 'Striped German',
        subtype: 'heirloom',
        itemWeight: { base: 0.95, sizeVariations: {} },
        pricing: { basePricePerLb: 5.65, priceVolatility: 'medium' }
      }
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'big-beef'
  },

  {
    id: 'cherry-tomato',
    name: 'Cherry Tomato',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Tomatoes',
        specifications: 'Fresh market cherry tomatoes'
      },
      notes: 'USDA covers cherry tomatoes under general tomato category'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        {
          id: '12x1pt-flat',
          name: '12x1pt Flat',
          type: 'flat',
          sizes: [],
          sizeClassifications: [],
          isDefault: true
        },
        {
          id: '6x1pt-flat',
          name: '6x1pt Flat',
          type: 'flat',
          sizes: [],
          sizeClassifications: []
        },
        {
          id: '12x6oz-flat',
          name: '12x6oz Flat',
          type: 'flat',
          sizes: [],
          sizeClassifications: []
        },
        {
          id: '1lb-clamshell',
          name: '1lb Clamshell',
          type: 'clamshell',
          sizes: [],
          sizeClassifications: []
        }
      ],
      defaultPackage: '12x1pt-flat',
      defaultSize: ''
    },
    
    varieties: {
      'sweet-100': {
        id: 'sweet-100',
        name: 'Sweet 100',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'sun-gold': {
        id: 'sun-gold',
        name: 'Sun Gold',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'black-cherry': {
        id: 'black-cherry',
        name: 'Black Cherry',
        itemWeight: { base: 0.03, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'medium' }
      },
      'yellow-pear': {
        id: 'yellow-pear',
        name: 'Yellow Pear',
        itemWeight: { base: 0.015, sizeVariations: {} },
        pricing: { basePricePerLb: 4.95, priceVolatility: 'medium' }
      },
      'red-cherry': {
        id: 'red-cherry',
        name: 'Red Cherry',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'chocolate-cherry': {
        id: 'chocolate-cherry',
        name: 'Chocolate Cherry',
        itemWeight: { base: 0.025, sizeVariations: {} },
        pricing: { basePricePerLb: 5.45, priceVolatility: 'medium' }
      },
      'matts-wild-cherry': {
        id: 'matts-wild-cherry',
        name: 'Matt\'s Wild Cherry',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'medium' }
      }
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'sweet-100'
  },

  {
    id: 'grape-tomato',
    name: 'Grape Tomato',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Tomatoes',
        specifications: 'Fresh market grape tomatoes'
      },
      notes: 'USDA covers grape tomatoes under general tomato category'
    },
    
    processing: {
      hasProcessing: false, // Direct packaging
      types: [],
      defaultType: undefined
    },
    
    packaging: {
      types: [
        {
          id: '12lb-place-packed-clamshells',
          name: '12lb Place-Packed Clamshells 12/1 pints',
          type: 'clamshell',
          sizes: [],
          sizeClassifications: [
            { id: 'xlarge', name: 'XLarge', description: 'Extra large grape tomatoes', isDefault: false },
            { id: 'large', name: 'Large', description: 'Large grape tomatoes', isDefault: true },
            { id: 'medium', name: 'Medium', description: 'Medium grape tomatoes', isDefault: false },
            { id: 'small', name: 'Small', description: 'Small grape tomatoes', isDefault: false }
          ],
          isDefault: true
        },
        {
          id: '20lb-volume-filled-carton',
          name: '20lb Volume Filled Carton',
          type: 'carton',
          sizes: [],
          sizeClassifications: [
            { id: 'xlarge', name: 'XLarge', description: 'Extra large grape tomatoes', isDefault: false },
            { id: 'large', name: 'Large', description: 'Large grape tomatoes', isDefault: true },
            { id: 'medium', name: 'Medium', description: 'Medium grape tomatoes', isDefault: false },
            { id: 'small', name: 'Small', description: 'Small grape tomatoes', isDefault: false }
          ]
        },
        {
          id: '10lb-volume-filled-carton',
          name: '10lb Volume Filled Carton',
          type: 'carton',
          sizes: [],
          sizeClassifications: [
            { id: 'xlarge', name: 'XLarge', description: 'Extra large grape tomatoes', isDefault: false },
            { id: 'large', name: 'Large', description: 'Large grape tomatoes', isDefault: true },
            { id: 'medium', name: 'Medium', description: 'Medium grape tomatoes', isDefault: false },
            { id: 'small', name: 'Small', description: 'Small grape tomatoes', isDefault: false }
          ]
        }
      ],
      defaultPackage: '12lb-place-packed-clamshells',
      defaultSize: 'large'
    },
    
    varieties: {
      'red-grape': {
        id: 'red-grape',
        name: 'Red Grape',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'medium' }
      },
      'yellow-grape': {
        id: 'yellow-grape',
        name: 'Yellow Grape',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'mixed-grape': {
        id: 'mixed-grape',
        name: 'Mixed Grape',
        itemWeight: { base: 0.018, sizeVariations: {} },
        pricing: { basePricePerLb: 4.75, priceVolatility: 'medium' }
      }
    },
    
    quality: {
      grades: ['No. 1', 'No. 2'],
      defaultGrade: 'No. 1'
    },
    
    defaultVariety: 'red-grape'
  },

  {
    id: 'bell-pepper',
    name: 'Bell Pepper',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Bell Peppers',
        specifications: 'Fresh market bell peppers'
      },
      notes: 'USDA covers standard bell peppers; specialty colors estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh bell peppers',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '30lb', name: '30 lb', weight: '30lb' }
              ],
              isDefault: true
            },
            {
              id: 'bushel',
              name: 'Bushel',
              type: 'bushel',
              sizes: [
                { id: '28lb', name: '28 lb', weight: '28lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced bell peppers',
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
      'green-bell': {
        id: 'green-bell',
        name: 'Green Bell',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.35, priceVolatility: 'medium' }
      },
      'red-bell': {
        id: 'red-bell',
        name: 'Red Bell',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'yellow-bell': {
        id: 'yellow-bell',
        name: 'Yellow Bell',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'orange-bell': {
        id: 'orange-bell',
        name: 'Orange Bell',
        itemWeight: { base: 0.36, sizeVariations: {} },
        pricing: { basePricePerLb: 4.15, priceVolatility: 'medium' }
      },
      'purple-bell': {
        id: 'purple-bell',
        name: 'Purple Bell',
        itemWeight: { base: 0.33, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['US Fancy', 'US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'hot-pepper',
    name: 'Hot Pepper',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Chile Peppers',
        specifications: 'Fresh market hot peppers'
      },
      notes: 'USDA covers jalapeño and some common varieties; specialty peppers estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh hot peppers',
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
                { id: '5lb', name: '5 lb', weight: '5lb' },
                { id: '10lb', name: '10 lb', weight: '10lb' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      // Mild Hot Peppers
      'banana': {
        id: 'banana',
        name: 'Banana Pepper',
        subtype: 'mild',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      },
      'poblano': {
        id: 'poblano',
        name: 'Poblano',
        subtype: 'mild',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'anaheim': {
        id: 'anaheim',
        name: 'Anaheim',
        subtype: 'mild',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'new-mexico': {
        id: 'new-mexico',
        name: 'New Mexico',
        subtype: 'mild',
        itemWeight: { base: 0.14, sizeVariations: {} },
        pricing: { basePricePerLb: 3.15, priceVolatility: 'medium' }
      },
      'hungarian-wax': {
        id: 'hungarian-wax',
        name: 'Hungarian Wax',
        subtype: 'mild',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      
      // Medium Hot Peppers
      'jalapeno': {
        id: 'jalapeno',
        name: 'Jalapeño',
        subtype: 'medium',
        itemWeight: { base: 0.05, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'serrano': {
        id: 'serrano',
        name: 'Serrano',
        subtype: 'medium',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'caribe': {
        id: 'caribe',
        name: 'Caribe',
        subtype: 'medium',
        itemWeight: { base: 0.03, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'fresno': {
        id: 'fresno',
        name: 'Fresno',
        subtype: 'medium',
        itemWeight: { base: 0.04, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'chipotle': {
        id: 'chipotle',
        name: 'Chipotle',
        subtype: 'medium',
        itemWeight: { base: 0.03, sizeVariations: {} },
        pricing: { basePricePerLb: 8.25, priceVolatility: 'medium' }
      },
      
      // Hot Peppers
      'cayenne': {
        id: 'cayenne',
        name: 'Cayenne',
        subtype: 'hot',
        itemWeight: { base: 0.015, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'medium' }
      },
      'thai-chili': {
        id: 'thai-chili',
        name: 'Thai Chili',
        subtype: 'hot',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 12.45, priceVolatility: 'medium' }
      },
      'tabasco': {
        id: 'tabasco',
        name: 'Tabasco',
        subtype: 'hot',
        itemWeight: { base: 0.01, sizeVariations: {} },
        pricing: { basePricePerLb: 9.85, priceVolatility: 'medium' }
      },
      'pequin': {
        id: 'pequin',
        name: 'Pequin',
        subtype: 'hot',
        itemWeight: { base: 0.005, sizeVariations: {} },
        pricing: { basePricePerLb: 15.25, priceVolatility: 'medium' }
      },
      
      // Super Hot Peppers
      'habanero': {
        id: 'habanero',
        name: 'Habanero',
        subtype: 'superhot',
        itemWeight: { base: 0.012, sizeVariations: {} },
        pricing: { basePricePerLb: 18.25, priceVolatility: 'medium' }
      },
      'ghost-pepper': {
        id: 'ghost-pepper',
        name: 'Ghost Pepper',
        subtype: 'superhot',
        itemWeight: { base: 0.008, sizeVariations: {} },
        pricing: { basePricePerLb: 35.45, priceVolatility: 'medium' }
      },
      'carolina-reaper': {
        id: 'carolina-reaper',
        name: 'Carolina Reaper',
        subtype: 'superhot',
        itemWeight: { base: 0.006, sizeVariations: {} },
        pricing: { basePricePerLb: 45.85, priceVolatility: 'medium' }
      },
      'trinidad-scorpion': {
        id: 'trinidad-scorpion',
        name: 'Trinidad Scorpion',
        subtype: 'superhot',
        itemWeight: { base: 0.007, sizeVariations: {} },
        pricing: { basePricePerLb: 42.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10lb',
      defaultSize: '10lb'
    },
    
    quality: {
      grades: ['US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'cucumber',
    name: 'Cucumber',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Cucumbers',
        specifications: 'Fresh market cucumbers'
      },
      notes: 'USDA covers standard cucumbers; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Fresh',
          description: 'Fresh whole cucumbers',
          packageTypes: [
            // Place-Packed Cartons (fixed counts)
            {
              id: '24ct-place-packed-carton',
              name: '24ct Place-Packed Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ],
              isDefault: true
            },
            {
              id: '36ct-place-packed-carton',
              name: '36ct Place-Packed Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            // Volume Filled Cartons (count ranges)
            {
              id: '68-72-volume-filled-carton',
              name: '68-72 Volume Filled Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            {
              id: '70-75-volume-filled-carton',
              name: '70-75 Volume Filled Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            {
              id: '54-58-volume-filled-carton',
              name: '54-58 Volume Filled Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            {
              id: '80-90-volume-filled-carton',
              name: '80-90 Volume Filled Carton',
              type: 'carton',
              sizes: [], // No separate count selection - count is in package name
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            // RPCs
            {
              id: 'rpc-6425',
              name: 'RPC #6425',
              type: 'rpc',
              sizes: [], // No separate count selection
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            {
              id: 'rpc-6411',
              name: 'RPC #6411',
              type: 'rpc',
              sizes: [], // No separate count selection
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
            {
              id: 'rpc-6413',
              name: 'RPC #6413',
              type: 'rpc',
              sizes: [], // No separate count selection
              sizeClassifications: [
                { id: 'supers', name: 'Supers', description: 'Super grade cucumbers' },
                { id: 'selects', name: 'Selects', description: 'Select grade cucumbers', isDefault: true },
                { id: 'selects-large', name: 'Selects Large', description: 'Large select grade cucumbers' },
                { id: 'small', name: 'Small', description: 'Small grade cucumbers' },
                { id: 'plains', name: 'Plains', description: 'Plains grade cucumbers' }
              ]
            },
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'american': {
        id: 'american',
        name: 'American',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 1.65, priceVolatility: 'medium' }
      },
      'slicing': {
        id: 'slicing',
        name: 'Slicing',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'pickling': {
        id: 'pickling',
        name: 'Pickling',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'english': {
        id: 'english',
        name: 'English',
        itemWeight: { base: 1.25, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'persian': {
        id: 'persian',
        name: 'Persian',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'lemon': {
        id: 'lemon',
        name: 'Lemon',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'armenian': {
        id: 'armenian',
        name: 'Armenian',
        itemWeight: { base: 1.15, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'japanese': {
        id: 'japanese',
        name: 'Japanese',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'burpless': {
        id: 'burpless',
        name: 'Burpless',
        itemWeight: { base: 0.95, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '24ct',
      defaultSize: '24ct'
    },
    
    quality: {
      grades: ['US Fancy', 'US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'summer-squash',
    name: 'Summer Squash',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Squash',
        specifications: 'Fresh market summer squash'
      },
      notes: 'USDA covers zucchini and yellow squash; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh summer squash',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '20lb', name: '20 lb', weight: '20lb', isDefault: true },
                { id: '25lb', name: '25 lb', weight: '25lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'zucchini': {
        id: 'zucchini',
        name: 'Zucchini',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'yellow-crookneck': {
        id: 'yellow-crookneck',
        name: 'Yellow Crookneck',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.95, priceVolatility: 'medium' }
      },
      'yellow-straightneck': {
        id: 'yellow-straightneck',
        name: 'Yellow Straightneck',
        itemWeight: { base: 0.58, sizeVariations: {} },
        pricing: { basePricePerLb: 1.90, priceVolatility: 'medium' }
      },
      'pattypan': {
        id: 'pattypan',
        name: 'Pattypan',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'costata-romanesco': {
        id: 'costata-romanesco',
        name: 'Costata Romanesco',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'eight-ball': {
        id: 'eight-ball',
        name: 'Eight Ball',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'sunburst': {
        id: 'sunburst',
        name: 'Sunburst',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '20lb',
      defaultSize: '20lb'
    },
    
    quality: {
      grades: ['US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'winter-squash',
    name: 'Winter Squash',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Squash',
        specifications: 'Fresh market winter squash'
      },
      notes: 'USDA covers butternut and acorn; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Fresh',
          description: 'Fresh whole winter squash',
          packageTypes: [
            {
              id: '25lb-place-packed-carton',
              name: '25lb Place-Packed Carton',
              type: 'carton',
              sizes: [], // No separate weight selection - weight is in package name
              sizeClassifications: [
                { id: 'xlarge', name: 'XLarge', description: 'Extra large squash' },
                { id: 'large', name: 'Large', description: 'Large squash' },
                { id: 'medium', name: 'Medium', description: 'Medium squash' },
                { id: 'small', name: 'Small', description: 'Small squash' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'butternut': {
        id: 'butternut',
        name: 'Butternut',
        itemWeight: { base: 2.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.45, priceVolatility: 'medium' }
      },
      'acorn': {
        id: 'acorn',
        name: 'Acorn',
        itemWeight: { base: 1.8, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'spaghetti': {
        id: 'spaghetti',
        name: 'Spaghetti',
        itemWeight: { base: 2.2, sizeVariations: {} },
        pricing: { basePricePerLb: 1.35, priceVolatility: 'medium' }
      },
      'delicata': {
        id: 'delicata',
        name: 'Delicata',
        itemWeight: { base: 1.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'kabocha': {
        id: 'kabocha',
        name: 'Kabocha',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'hubbard': {
        id: 'hubbard',
        name: 'Hubbard',
        itemWeight: { base: 8.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      'sugar-pie-pumpkin': {
        id: 'sugar-pie-pumpkin',
        name: 'Sugar Pie Pumpkin',
        itemWeight: { base: 4.2, sizeVariations: {} },
        pricing: { basePricePerLb: 0.95, priceVolatility: 'medium' }
      },
      'honeynut': {
        id: 'honeynut',
        name: 'Honeynut',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb-place-packed-carton',
      defaultSize: 'large'
    },
    
    quality: {
      grades: ['US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'melon',
    name: 'Melon',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Melons',
        specifications: 'Fresh market melons'
      },
      notes: 'USDA covers cantaloupe and honeydew; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh melons',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '40lb', name: '40 lb', weight: '40lb', isDefault: true },
                { id: '35lb', name: '35 lb', weight: '35lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      // Watermelon
      'crimson-sweet': {
        id: 'crimson-sweet',
        name: 'Crimson Sweet',
        subtype: 'watermelon',
        itemWeight: { base: 18.5, sizeVariations: {} },
        pricing: { basePricePerLb: 0.65, priceVolatility: 'medium' }
      },
      'sugar-baby': {
        id: 'sugar-baby',
        name: 'Sugar Baby',
        subtype: 'watermelon',
        itemWeight: { base: 8.5, sizeVariations: {} },
        pricing: { basePricePerLb: 0.85, priceVolatility: 'medium' }
      },
      'charleston-gray': {
        id: 'charleston-gray',
        name: 'Charleston Gray',
        subtype: 'watermelon',
        itemWeight: { base: 22.5, sizeVariations: {} },
        pricing: { basePricePerLb: 0.55, priceVolatility: 'medium' }
      },
      'jubilee': {
        id: 'jubilee',
        name: 'Jubilee',
        subtype: 'watermelon',
        itemWeight: { base: 25.0, sizeVariations: {} },
        pricing: { basePricePerLb: 0.60, priceVolatility: 'medium' }
      },
      'black-diamond': {
        id: 'black-diamond',
        name: 'Black Diamond',
        subtype: 'watermelon',
        itemWeight: { base: 35.0, sizeVariations: {} },
        pricing: { basePricePerLb: 0.45, priceVolatility: 'medium' }
      },
      'yellow-crimson': {
        id: 'yellow-crimson',
        name: 'Yellow Crimson',
        subtype: 'watermelon',
        itemWeight: { base: 16.5, sizeVariations: {} },
        pricing: { basePricePerLb: 0.95, priceVolatility: 'medium' }
      },
      'seedless-watermelon': {
        id: 'seedless-watermelon',
        name: 'Seedless Watermelon',
        subtype: 'watermelon',
        itemWeight: { base: 12.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'mini-watermelon': {
        id: 'mini-watermelon',
        name: 'Mini Watermelon',
        subtype: 'watermelon',
        itemWeight: { base: 4.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.45, priceVolatility: 'medium' }
      },
      'orange-watermelon': {
        id: 'orange-watermelon',
        name: 'Orange Watermelon',
        subtype: 'watermelon',
        itemWeight: { base: 14.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      
      // Cantaloupe
      'athena': {
        id: 'athena',
        name: 'Athena',
        subtype: 'cantaloupe',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'ambrosia': {
        id: 'ambrosia',
        name: 'Ambrosia',
        subtype: 'cantaloupe',
        itemWeight: { base: 4.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'hales-best': {
        id: 'hales-best',
        name: 'Hale\'s Best',
        subtype: 'cantaloupe',
        itemWeight: { base: 3.8, sizeVariations: {} },
        pricing: { basePricePerLb: 1.95, priceVolatility: 'medium' }
      },
      'hearts-of-gold': {
        id: 'hearts-of-gold',
        name: 'Hearts of Gold',
        subtype: 'cantaloupe',
        itemWeight: { base: 2.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'honey-rock': {
        id: 'honey-rock',
        name: 'Honey Rock',
        subtype: 'cantaloupe',
        itemWeight: { base: 3.2, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'minnesota-midget': {
        id: 'minnesota-midget',
        name: 'Minnesota Midget',
        subtype: 'cantaloupe',
        itemWeight: { base: 1.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'savor': {
        id: 'savor',
        name: 'Savor',
        subtype: 'cantaloupe',
        itemWeight: { base: 4.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'sarahs-choice': {
        id: 'sarahs-choice',
        name: 'Sarah\'s Choice',
        subtype: 'cantaloupe',
        itemWeight: { base: 3.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.35, priceVolatility: 'medium' }
      },
      
      // Honeydew
      'honey-dew': {
        id: 'honey-dew',
        name: 'Honey Dew',
        subtype: 'honeydew',
        itemWeight: { base: 5.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.65, priceVolatility: 'medium' }
      },
      'orange-honeydew': {
        id: 'orange-honeydew',
        name: 'Orange Honeydew',
        subtype: 'honeydew',
        itemWeight: { base: 4.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'temptation': {
        id: 'temptation',
        name: 'Temptation',
        subtype: 'honeydew',
        itemWeight: { base: 6.2, sizeVariations: {} },
        pricing: { basePricePerLb: 1.95, priceVolatility: 'medium' }
      },
      'earlidew': {
        id: 'earlidew',
        name: 'Earlidew',
        subtype: 'honeydew',
        itemWeight: { base: 4.5, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'venus': {
        id: 'venus',
        name: 'Venus',
        subtype: 'honeydew',
        itemWeight: { base: 5.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'honey-pearl': {
        id: 'honey-pearl',
        name: 'Honey Pearl',
        subtype: 'honeydew',
        itemWeight: { base: 3.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'green-flesh': {
        id: 'green-flesh',
        name: 'Green Flesh',
        subtype: 'honeydew',
        itemWeight: { base: 5.2, sizeVariations: {} },
        pricing: { basePricePerLb: 1.75, priceVolatility: 'medium' }
      },
      'orange-flesh': {
        id: 'orange-flesh',
        name: 'Orange Flesh',
        subtype: 'honeydew',
        itemWeight: { base: 4.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.05, priceVolatility: 'medium' }
      },
      
      // Specialty Melons
      'crenshaw': {
        id: 'crenshaw',
        name: 'Crenshaw',
        subtype: 'specialty',
        itemWeight: { base: 7.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'casaba': {
        id: 'casaba',
        name: 'Casaba',
        subtype: 'specialty',
        itemWeight: { base: 6.8, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'persian': {
        id: 'persian',
        name: 'Persian',
        subtype: 'specialty',
        itemWeight: { base: 8.2, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'galia': {
        id: 'galia',
        name: 'Galia',
        subtype: 'specialty',
        itemWeight: { base: 2.8, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'charentais': {
        id: 'charentais',
        name: 'Charentais',
        subtype: 'specialty',
        itemWeight: { base: 2.2, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'canary': {
        id: 'canary',
        name: 'Canary',
        subtype: 'specialty',
        itemWeight: { base: 4.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'juan-canary': {
        id: 'juan-canary',
        name: 'Juan Canary',
        subtype: 'specialty',
        itemWeight: { base: 5.2, sizeVariations: {} },
        pricing: { basePricePerLb: 3.15, priceVolatility: 'medium' }
      },
      'santa-claus': {
        id: 'santa-claus',
        name: 'Santa Claus',
        subtype: 'specialty',
        itemWeight: { base: 6.5, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '40lb',
      defaultSize: '40lb'
    },
    
    quality: {
      grades: ['US Fancy', 'US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  },

  {
    id: 'eggplant',
    name: 'Eggplant',
    category: 'Vine Crops',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Eggplant',
        specifications: 'Fresh market eggplant'
      },
      notes: 'USDA covers standard globe eggplant; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole fresh eggplant',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb', isDefault: true },
                { id: '30lb', name: '30 lb', weight: '30lb' }
              ],
              isDefault: true
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      // Globe Eggplant
      'black-beauty': {
        id: 'black-beauty',
        name: 'Black Beauty',
        subtype: 'globe',
        itemWeight: { base: 1.25, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'epic': {
        id: 'epic',
        name: 'Epic',
        subtype: 'globe',
        itemWeight: { base: 1.15, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'classic': {
        id: 'classic',
        name: 'Classic',
        subtype: 'globe',
        itemWeight: { base: 1.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      },
      'dusky': {
        id: 'dusky',
        name: 'Dusky',
        subtype: 'globe',
        itemWeight: { base: 1.05, sizeVariations: {} },
        pricing: { basePricePerLb: 3.15, priceVolatility: 'medium' }
      },
      'black-bell': {
        id: 'black-bell',
        name: 'Black Bell',
        subtype: 'globe',
        itemWeight: { base: 1.45, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'purple-rain': {
        id: 'purple-rain',
        name: 'Purple Rain',
        subtype: 'globe',
        itemWeight: { base: 1.20, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      
      // Italian Eggplant
      'rosa-bianca': {
        id: 'rosa-bianca',
        name: 'Rosa Bianca',
        subtype: 'italian',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'violetta-lunga': {
        id: 'violetta-lunga',
        name: 'Violetta Lunga',
        subtype: 'italian',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'listada-de-gandia': {
        id: 'listada-de-gandia',
        name: 'Listada de Gandia',
        subtype: 'italian',
        itemWeight: { base: 0.95, sizeVariations: {} },
        pricing: { basePricePerLb: 4.45, priceVolatility: 'medium' }
      },
      'prosperosa': {
        id: 'prosperosa',
        name: 'Prosperosa',
        subtype: 'italian',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'bambino': {
        id: 'bambino',
        name: 'Bambino',
        subtype: 'italian',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 5.25, priceVolatility: 'medium' }
      },
      
      // Asian Eggplant
      'japanese-long': {
        id: 'japanese-long',
        name: 'Japanese Long',
        subtype: 'asian',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'medium' }
      },
      'chinese-long': {
        id: 'chinese-long',
        name: 'Chinese Long',
        subtype: 'asian',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'ichiban': {
        id: 'ichiban',
        name: 'Ichiban',
        subtype: 'asian',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'ping-tung': {
        id: 'ping-tung',
        name: 'Ping Tung',
        subtype: 'asian',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'millionaire': {
        id: 'millionaire',
        name: 'Millionaire',
        subtype: 'asian',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 4.15, priceVolatility: 'medium' }
      },
      'orient-express': {
        id: 'orient-express',
        name: 'Orient Express',
        subtype: 'asian',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 3.75, priceVolatility: 'medium' }
      },
      
      // Specialty Eggplant
      'white-eggplant': {
        id: 'white-eggplant',
        name: 'White Eggplant',
        subtype: 'specialty',
        itemWeight: { base: 0.95, sizeVariations: {} },
        pricing: { basePricePerLb: 4.85, priceVolatility: 'medium' }
      },
      'thai-long-green': {
        id: 'thai-long-green',
        name: 'Thai Long Green',
        subtype: 'specialty',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 5.45, priceVolatility: 'medium' }
      },
      'turkish-orange': {
        id: 'turkish-orange',
        name: 'Turkish Orange',
        subtype: 'specialty',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 6.25, priceVolatility: 'medium' }
      },
      'fairy-tale': {
        id: 'fairy-tale',
        name: 'Fairy Tale',
        subtype: 'specialty',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 5.85, priceVolatility: 'medium' }
      },
      'graffiti': {
        id: 'graffiti',
        name: 'Graffiti',
        subtype: 'specialty',
        itemWeight: { base: 0.85, sizeVariations: {} },
        pricing: { basePricePerLb: 4.65, priceVolatility: 'medium' }
      },
      'calliope': {
        id: 'calliope',
        name: 'Calliope',
        subtype: 'specialty',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 5.15, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '25lb',
      defaultSize: '25lb'
    },
    
    quality: {
      grades: ['US Fancy', 'US No. 1', 'US No. 2'],
      defaultGrade: 'US No. 1'
    }
  }
]
