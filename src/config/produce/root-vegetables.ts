// =============================================================================
// ROOT VEGETABLES COMMODITIES
// =============================================================================
// Complete category: Carrot, Potato, Sweet Potato, Onion, Garlic, Beet, Turnip, Leek

import type { CommodityConfig } from '../types'

export const rootVegetablesCommodities: CommodityConfig[] = [
  {
    id: 'carrot',
    name: 'Carrot',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Carrots',
        specifications: 'Fresh market carrots, topped'
      },
      notes: 'USDA covers standard carrots; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole carrots with tops removed',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb', isDefault: true },
                { id: '10lb', name: '10 lb', weight: '10lb' },
                { id: '25lb', name: '25 lb', weight: '25lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb' },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'baby',
          name: 'Baby Carrots',
          description: 'Cut and peeled baby carrots',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '1lb', name: '1 lb', weight: '1lb' },
                { id: '2lb', name: '2 lb', weight: '2lb', isDefault: true },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ],
              isDefault: true
            }
          ]
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced carrots',
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
      'nantes': {
        id: 'nantes',
        name: 'Nantes',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'imperator': {
        id: 'imperator',
        name: 'Imperator',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      'chantenay': {
        id: 'chantenay',
        name: 'Chantenay',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 1.35, priceVolatility: 'medium' }
      },
      'danvers': {
        id: 'danvers',
        name: 'Danvers',
        itemWeight: { base: 0.16, sizeVariations: {} },
        pricing: { basePricePerLb: 1.20, priceVolatility: 'medium' }
      },
      'baby-carrots': {
        id: 'baby-carrots',
        name: 'Baby Carrots',
        itemWeight: { base: 0.05, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'purple-dragon': {
        id: 'purple-dragon',
        name: 'Purple Dragon',
        itemWeight: { base: 0.14, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'white-satin': {
        id: 'white-satin',
        name: 'White Satin',
        itemWeight: { base: 0.13, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'atomic-red': {
        id: 'atomic-red',
        name: 'Atomic Red',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '5lb',
      defaultSize: '5lb'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 36, unit: 'F' },
      shelfLife: { duration: 14, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'potato',
    name: 'Potato',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Potatoes',
        specifications: 'Fresh market potatoes, various sizes'
      },
      notes: 'USDA covers major potato types; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole potatoes, washed',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '5lb', name: '5 lb', weight: '5lb' },
                { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
                { id: '15lb', name: '15 lb', weight: '15lb' },
                { id: '20lb', name: '20 lb', weight: '20lb' },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '40lb', name: '40 lb', weight: '40lb' },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'washed',
          name: 'Washed & Graded',
          description: 'Washed and size-graded potatoes',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '5lb', name: '5 lb', weight: '5lb' },
                { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      // Russet Potatoes
      'russet-burbank': {
        id: 'russet-burbank',
        name: 'Russet Burbank',
        subtype: 'russet',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 0.85, priceVolatility: 'medium' }
      },
      'russet-norkotah': {
        id: 'russet-norkotah',
        name: 'Russet Norkotah',
        subtype: 'russet',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 0.90, priceVolatility: 'medium' }
      },
      'russet-ranger': {
        id: 'russet-ranger',
        name: 'Russet Ranger',
        subtype: 'russet',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 0.88, priceVolatility: 'medium' }
      },
      'idaho-russet': {
        id: 'idaho-russet',
        name: 'Idaho Russet',
        subtype: 'russet',
        itemWeight: { base: 0.80, sizeVariations: {} },
        pricing: { basePricePerLb: 0.95, priceVolatility: 'medium' }
      },
      'shepody': {
        id: 'shepody',
        name: 'Shepody',
        subtype: 'russet',
        itemWeight: { base: 0.68, sizeVariations: {} },
        pricing: { basePricePerLb: 0.82, priceVolatility: 'medium' }
      },
      'umatilla-russet': {
        id: 'umatilla-russet',
        name: 'Umatilla Russet',
        subtype: 'russet',
        itemWeight: { base: 0.72, sizeVariations: {} },
        pricing: { basePricePerLb: 0.87, priceVolatility: 'medium' }
      },
      
      // Yellow Potatoes
      'yukon-gold': {
        id: 'yukon-gold',
        name: 'Yukon Gold',
        subtype: 'yellow',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      'yukon-gem': {
        id: 'yukon-gem',
        name: 'Yukon Gem',
        subtype: 'yellow',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 1.20, priceVolatility: 'medium' }
      },
      'yellow-finn': {
        id: 'yellow-finn',
        name: 'Yellow Finn',
        subtype: 'yellow',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'german-butterball': {
        id: 'german-butterball',
        name: 'German Butterball',
        subtype: 'yellow',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 1.35, priceVolatility: 'medium' }
      },
      'carola': {
        id: 'carola',
        name: 'Carola',
        subtype: 'yellow',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 1.18, priceVolatility: 'medium' }
      },
      'nicola': {
        id: 'nicola',
        name: 'Nicola',
        subtype: 'yellow',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 1.22, priceVolatility: 'medium' }
      },
      
      // Red Potatoes
      'red-pontiac': {
        id: 'red-pontiac',
        name: 'Red Pontiac',
        subtype: 'red',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.05, priceVolatility: 'medium' }
      },
      'norland': {
        id: 'norland',
        name: 'Norland',
        subtype: 'red',
        itemWeight: { base: 0.48, sizeVariations: {} },
        pricing: { basePricePerLb: 1.10, priceVolatility: 'medium' }
      },
      'red-lasoda': {
        id: 'red-lasoda',
        name: 'Red LaSoda',
        subtype: 'red',
        itemWeight: { base: 0.52, sizeVariations: {} },
        pricing: { basePricePerLb: 1.08, priceVolatility: 'medium' }
      },
      'chieftain': {
        id: 'chieftain',
        name: 'Chieftain',
        subtype: 'red',
        itemWeight: { base: 0.60, sizeVariations: {} },
        pricing: { basePricePerLb: 1.12, priceVolatility: 'medium' }
      },
      'red-bliss': {
        id: 'red-bliss',
        name: 'Red Bliss',
        subtype: 'red',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'dakota-rose': {
        id: 'dakota-rose',
        name: 'Dakota Rose',
        subtype: 'red',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      
      // White Potatoes
      'kennebec': {
        id: 'kennebec',
        name: 'Kennebec',
        subtype: 'white',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 0.95, priceVolatility: 'medium' }
      },
      'superior': {
        id: 'superior',
        name: 'Superior',
        subtype: 'white',
        itemWeight: { base: 0.58, sizeVariations: {} },
        pricing: { basePricePerLb: 0.98, priceVolatility: 'medium' }
      },
      'atlantic': {
        id: 'atlantic',
        name: 'Atlantic',
        subtype: 'white',
        itemWeight: { base: 0.62, sizeVariations: {} },
        pricing: { basePricePerLb: 0.92, priceVolatility: 'medium' }
      },
      'snowden': {
        id: 'snowden',
        name: 'Snowden',
        subtype: 'white',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.00, priceVolatility: 'medium' }
      },
      'pike': {
        id: 'pike',
        name: 'Pike',
        subtype: 'white',
        itemWeight: { base: 0.60, sizeVariations: {} },
        pricing: { basePricePerLb: 0.96, priceVolatility: 'medium' }
      },
      'katahdin': {
        id: 'katahdin',
        name: 'Katahdin',
        subtype: 'white',
        itemWeight: { base: 0.68, sizeVariations: {} },
        pricing: { basePricePerLb: 0.90, priceVolatility: 'medium' }
      },
      
      // Fingerling Potatoes
      'russian-banana': {
        id: 'russian-banana',
        name: 'Russian Banana',
        subtype: 'fingerling',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'purple-peruvian': {
        id: 'purple-peruvian',
        name: 'Purple Peruvian',
        subtype: 'fingerling',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'rose-finn-apple': {
        id: 'rose-finn-apple',
        name: 'Rose Finn Apple',
        subtype: 'fingerling',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'la-ratte': {
        id: 'la-ratte',
        name: 'La Ratte',
        subtype: 'fingerling',
        itemWeight: { base: 0.14, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'austrian-crescent': {
        id: 'austrian-crescent',
        name: 'Austrian Crescent',
        subtype: 'fingerling',
        itemWeight: { base: 0.16, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'ruby-crescent': {
        id: 'ruby-crescent',
        name: 'Ruby Crescent',
        subtype: 'fingerling',
        itemWeight: { base: 0.13, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      
      // Specialty Potatoes
      'purple-majesty': {
        id: 'purple-majesty',
        name: 'Purple Majesty',
        subtype: 'specialty',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'adirondack-blue': {
        id: 'adirondack-blue',
        name: 'Adirondack Blue',
        subtype: 'specialty',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 2.35, priceVolatility: 'medium' }
      },
      'all-blue': {
        id: 'all-blue',
        name: 'All Blue',
        subtype: 'specialty',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'purple-viking': {
        id: 'purple-viking',
        name: 'Purple Viking',
        subtype: 'specialty',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'mountain-rose': {
        id: 'mountain-rose',
        name: 'Mountain Rose',
        subtype: 'specialty',
        itemWeight: { base: 0.48, sizeVariations: {} },
        pricing: { basePricePerLb: 2.05, priceVolatility: 'medium' }
      },
      'cranberry-red': {
        id: 'cranberry-red',
        name: 'Cranberry Red',
        subtype: 'specialty',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 2.55, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10lb',
      defaultSize: '10lb'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 38, max: 50, unit: 'F' },
      shelfLife: { duration: 30, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Sweet Potatoes',
        specifications: 'Fresh market sweet potatoes'
      },
      notes: 'USDA covers standard sweet potatoes; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole sweet potatoes, cured',
          packageTypes: [
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb' },
                { id: '40lb', name: '40 lb', weight: '40lb', isDefault: true },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      // Orange Flesh
      'beauregard': {
        id: 'beauregard',
        name: 'Beauregard',
        subtype: 'orange',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 1.35, priceVolatility: 'medium' }
      },
      'covington': {
        id: 'covington',
        name: 'Covington',
        subtype: 'orange',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      },
      'centennial': {
        id: 'centennial',
        name: 'Centennial',
        subtype: 'orange',
        itemWeight: { base: 0.60, sizeVariations: {} },
        pricing: { basePricePerLb: 1.40, priceVolatility: 'medium' }
      },
      'georgia-jet': {
        id: 'georgia-jet',
        name: 'Georgia Jet',
        subtype: 'orange',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.45, priceVolatility: 'medium' }
      },
      'vardaman': {
        id: 'vardaman',
        name: 'Vardaman',
        subtype: 'orange',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 1.65, priceVolatility: 'medium' }
      },
      'evangeline': {
        id: 'evangeline',
        name: 'Evangeline',
        subtype: 'orange',
        itemWeight: { base: 0.68, sizeVariations: {} },
        pricing: { basePricePerLb: 1.30, priceVolatility: 'medium' }
      },
      
      // White Flesh
      'ohenry': {
        id: 'ohenry',
        name: 'O\'Henry',
        subtype: 'white',
        itemWeight: { base: 0.75, sizeVariations: {} },
        pricing: { basePricePerLb: 1.55, priceVolatility: 'medium' }
      },
      'sumor': {
        id: 'sumor',
        name: 'Sumor',
        subtype: 'white',
        itemWeight: { base: 0.62, sizeVariations: {} },
        pricing: { basePricePerLb: 1.60, priceVolatility: 'medium' }
      },
      'japanese-sweet': {
        id: 'japanese-sweet',
        name: 'Japanese Sweet',
        subtype: 'white',
        itemWeight: { base: 0.58, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'hannah': {
        id: 'hannah',
        name: 'Hannah',
        subtype: 'white',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 1.75, priceVolatility: 'medium' }
      },
      'white-triumph': {
        id: 'white-triumph',
        name: 'White Triumph',
        subtype: 'white',
        itemWeight: { base: 0.70, sizeVariations: {} },
        pricing: { basePricePerLb: 1.65, priceVolatility: 'medium' }
      },
      'bonita': {
        id: 'bonita',
        name: 'Bonita',
        subtype: 'white',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      
      // Purple Flesh
      'stokes-purple': {
        id: 'stokes-purple',
        name: 'Stokes Purple',
        subtype: 'purple',
        itemWeight: { base: 0.60, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'purple-sweet': {
        id: 'purple-sweet',
        name: 'Purple Sweet',
        subtype: 'purple',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'okinawan': {
        id: 'okinawan',
        name: 'Okinawan',
        subtype: 'purple',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'ube': {
        id: 'ube',
        name: 'Ube',
        subtype: 'purple',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'charleston-purple': {
        id: 'charleston-purple',
        name: 'Charleston Purple',
        subtype: 'purple',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 2.65, priceVolatility: 'medium' }
      },
      'all-purple': {
        id: 'all-purple',
        name: 'All Purple',
        subtype: 'purple',
        itemWeight: { base: 0.58, sizeVariations: {} },
        pricing: { basePricePerLb: 2.75, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '40lb',
      defaultSize: '40lb'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 55, max: 60, unit: 'F' },
      shelfLife: { duration: 21, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'onion',
    name: 'Onion',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Onions',
        specifications: 'Fresh market onions, dry'
      },
      notes: 'USDA covers standard onions; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole onions, cured and topped',
          packageTypes: [
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '3lb', name: '3 lb', weight: '3lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' },
                { id: '10lb', name: '10 lb', weight: '10lb', isDefault: true },
                { id: '25lb', name: '25 lb', weight: '25lb' },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ],
              isDefault: true
            },
            {
              id: 'carton',
              name: 'Carton',
              type: 'carton',
              sizes: [
                { id: '25lb', name: '25 lb', weight: '25lb' },
                { id: '50lb', name: '50 lb', weight: '50lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'diced',
          name: 'Diced',
          description: 'Pre-diced onions',
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
      'yellow-onion': {
        id: 'yellow-onion',
        name: 'Yellow Onion',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 0.85, priceVolatility: 'medium' }
      },
      'red-onion': {
        id: 'red-onion',
        name: 'Red Onion',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 1.15, priceVolatility: 'medium' }
      },
      'white-onion': {
        id: 'white-onion',
        name: 'White Onion',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 0.95, priceVolatility: 'medium' }
      },
      'sweet-onion': {
        id: 'sweet-onion',
        name: 'Sweet Onion',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 1.35, priceVolatility: 'medium' }
      },
      'vidalia': {
        id: 'vidalia',
        name: 'Vidalia',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'walla-walla': {
        id: 'walla-walla',
        name: 'Walla Walla',
        itemWeight: { base: 0.55, sizeVariations: {} },
        pricing: { basePricePerLb: 1.95, priceVolatility: 'medium' }
      },
      'shallot': {
        id: 'shallot',
        name: 'Shallot',
        itemWeight: { base: 0.08, sizeVariations: {} },
        pricing: { basePricePerLb: 4.25, priceVolatility: 'medium' }
      },
      'green-onion': {
        id: 'green-onion',
        name: 'Green Onion',
        itemWeight: { base: 0.02, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '10lb',
      defaultSize: '10lb'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 35, unit: 'F' },
      shelfLife: { duration: 60, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'garlic',
    name: 'Garlic',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Garlic',
        specifications: 'Fresh market garlic bulbs'
      },
      notes: 'USDA covers standard garlic; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: false
    },
    
    packaging: {
      packageTypes: [
        {
          id: 'bag',
          name: 'Bag',
          type: 'bag',
          sizes: [
            { id: '1lb', name: '1 lb', weight: '1lb' },
            { id: '3lb', name: '3 lb', weight: '3lb', isDefault: true },
            { id: '5lb', name: '5 lb', weight: '5lb' },
            { id: '10lb', name: '10 lb', weight: '10lb' }
          ],
          isDefault: true
        },
        {
          id: 'carton',
          name: 'Carton',
          type: 'carton',
          sizes: [
            { id: '10lb', name: '10 lb', weight: '10lb' },
            { id: '30lb', name: '30 lb', weight: '30lb' }
          ]
        }
      ],
      defaultType: 'bag',
      defaultPackage: '3lb',
      defaultSize: '3lb',
      defaultGrade: 'No. 1'
    },
    
    varieties: {
      'softneck': {
        id: 'softneck',
        name: 'Softneck',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 8.25, priceVolatility: 'medium' }
      },
      'hardneck': {
        id: 'hardneck',
        name: 'Hardneck',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 9.85, priceVolatility: 'medium' }
      },
      'elephant-garlic': {
        id: 'elephant-garlic',
        name: 'Elephant Garlic',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 12.45, priceVolatility: 'medium' }
      },
      'purple-stripe': {
        id: 'purple-stripe',
        name: 'Purple Stripe',
        itemWeight: { base: 0.10, sizeVariations: {} },
        pricing: { basePricePerLb: 11.25, priceVolatility: 'medium' }
      },
      'porcelain': {
        id: 'porcelain',
        name: 'Porcelain',
        itemWeight: { base: 0.14, sizeVariations: {} },
        pricing: { basePricePerLb: 10.85, priceVolatility: 'medium' }
      },
      'artichoke': {
        id: 'artichoke',
        name: 'Artichoke',
        itemWeight: { base: 0.16, sizeVariations: {} },
        pricing: { basePricePerLb: 8.95, priceVolatility: 'medium' }
      },
      'rocambole': {
        id: 'rocambole',
        name: 'Rocambole',
        itemWeight: { base: 0.11, sizeVariations: {} },
        pricing: { basePricePerLb: 13.25, priceVolatility: 'medium' }
      },
      'silverskin': {
        id: 'silverskin',
        name: 'Silverskin',
        itemWeight: { base: 0.13, sizeVariations: {} },
        pricing: { basePricePerLb: 9.45, priceVolatility: 'medium' }
      }
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 35, unit: 'F' },
      shelfLife: { duration: 90, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'beet',
    name: 'Beet',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Beets',
        specifications: 'Fresh market beets, topped'
      },
      notes: 'USDA covers standard red beets; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole beets with tops removed',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '24ct', name: '24 Count', count: '24ct' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ]
            }
          ],
          isDefault: true
        },
        {
          id: 'baby',
          name: 'Baby Beets',
          description: 'Small tender beets',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true }
              ],
              isDefault: true
            }
          ]
        }
      ]
    },
    
    varieties: {
      'red-beet': {
        id: 'red-beet',
        name: 'Red Beet',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      },
      'golden-beet': {
        id: 'golden-beet',
        name: 'Golden Beet',
        itemWeight: { base: 0.22, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'chioggia': {
        id: 'chioggia',
        name: 'Chioggia',
        itemWeight: { base: 0.20, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'detroit-dark-red': {
        id: 'detroit-dark-red',
        name: 'Detroit Dark Red',
        itemWeight: { base: 0.28, sizeVariations: {} },
        pricing: { basePricePerLb: 1.75, priceVolatility: 'medium' }
      },
      'cylindra': {
        id: 'cylindra',
        name: 'Cylindra',
        itemWeight: { base: 0.30, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'bulls-blood': {
        id: 'bulls-blood',
        name: 'Bull\'s Blood',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'albino': {
        id: 'albino',
        name: 'Albino',
        itemWeight: { base: 0.24, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'sugar-beet': {
        id: 'sugar-beet',
        name: 'Sugar Beet',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 1.25, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12ct',
      defaultSize: '12ct'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 35, unit: 'F' },
      shelfLife: { duration: 14, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'turnip',
    name: 'Turnip',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Turnips',
        specifications: 'Fresh market turnips, topped'
      },
      notes: 'USDA covers standard turnips; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole turnips with tops removed',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '24ct', name: '24 Count', count: '24ct' }
              ],
              isDefault: true
            },
            {
              id: 'bag',
              name: 'Bag',
              type: 'bag',
              sizes: [
                { id: '2lb', name: '2 lb', weight: '2lb' },
                { id: '5lb', name: '5 lb', weight: '5lb' }
              ]
            }
          ],
          isDefault: true
        }
      ]
    },
    
    varieties: {
      'purple-top-white-globe': {
        id: 'purple-top-white-globe',
        name: 'Purple Top White Globe',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 1.45, priceVolatility: 'medium' }
      },
      'tokyo-cross': {
        id: 'tokyo-cross',
        name: 'Tokyo Cross',
        itemWeight: { base: 0.15, sizeVariations: {} },
        pricing: { basePricePerLb: 2.25, priceVolatility: 'medium' }
      },
      'hakurei': {
        id: 'hakurei',
        name: 'Hakurei',
        itemWeight: { base: 0.12, sizeVariations: {} },
        pricing: { basePricePerLb: 2.85, priceVolatility: 'medium' }
      },
      'scarlet-queen': {
        id: 'scarlet-queen',
        name: 'Scarlet Queen',
        itemWeight: { base: 0.18, sizeVariations: {} },
        pricing: { basePricePerLb: 2.45, priceVolatility: 'medium' }
      },
      'golden-ball': {
        id: 'golden-ball',
        name: 'Golden Ball',
        itemWeight: { base: 0.25, sizeVariations: {} },
        pricing: { basePricePerLb: 1.95, priceVolatility: 'medium' }
      },
      'white-lady': {
        id: 'white-lady',
        name: 'White Lady',
        itemWeight: { base: 0.20, sizeVariations: {} },
        pricing: { basePricePerLb: 2.15, priceVolatility: 'medium' }
      },
      'market-express': {
        id: 'market-express',
        name: 'Market Express',
        itemWeight: { base: 0.22, sizeVariations: {} },
        pricing: { basePricePerLb: 1.85, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12ct',
      defaultSize: '12ct'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 35, unit: 'F' },
      shelfLife: { duration: 21, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  },

  {
    id: 'leek',
    name: 'Leek',
    category: 'Root Vegetables',
    
    usdaCoverage: {
      hasPricing: true,
      hasProduction: true,
      primaryMapping: {
        commodity: 'Leeks',
        specifications: 'Fresh market leeks, trimmed'
      },
      notes: 'USDA covers standard leeks; specialty varieties estimated'
    },
    
    processing: {
      hasProcessing: true,
      types: [
        {
          id: 'whole',
          name: 'Whole',
          description: 'Whole leeks, trimmed and cleaned',
          packageTypes: [
            {
              id: 'bunch',
              name: 'Bunch',
              type: 'bunch',
              sizes: [
                { id: '12ct', name: '12 Count', count: '12ct', isDefault: true },
                { id: '24ct', name: '24 Count', count: '24ct' }
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
          description: 'Pre-diced leeks',
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
      'american-flag': {
        id: 'american-flag',
        name: 'American Flag',
        itemWeight: { base: 0.45, sizeVariations: {} },
        pricing: { basePricePerLb: 3.25, priceVolatility: 'medium' }
      },
      'king-richard': {
        id: 'king-richard',
        name: 'King Richard',
        itemWeight: { base: 0.35, sizeVariations: {} },
        pricing: { basePricePerLb: 3.85, priceVolatility: 'medium' }
      },
      'carentan': {
        id: 'carentan',
        name: 'Carentan',
        itemWeight: { base: 0.50, sizeVariations: {} },
        pricing: { basePricePerLb: 3.45, priceVolatility: 'medium' }
      },
      'giant-musselburgh': {
        id: 'giant-musselburgh',
        name: 'Giant Musselburgh',
        itemWeight: { base: 0.65, sizeVariations: {} },
        pricing: { basePricePerLb: 2.95, priceVolatility: 'medium' }
      },
      'lincoln': {
        id: 'lincoln',
        name: 'Lincoln',
        itemWeight: { base: 0.40, sizeVariations: {} },
        pricing: { basePricePerLb: 3.65, priceVolatility: 'medium' }
      },
      'bandit': {
        id: 'bandit',
        name: 'Bandit',
        itemWeight: { base: 0.38, sizeVariations: {} },
        pricing: { basePricePerLb: 3.95, priceVolatility: 'medium' }
      },
      'lancelot': {
        id: 'lancelot',
        name: 'Lancelot',
        itemWeight: { base: 0.42, sizeVariations: {} },
        pricing: { basePricePerLb: 3.75, priceVolatility: 'medium' }
      },
      'tadorna': {
        id: 'tadorna',
        name: 'Tadorna',
        itemWeight: { base: 0.48, sizeVariations: {} },
        pricing: { basePricePerLb: 3.55, priceVolatility: 'medium' }
      }
    },
    
    packaging: {
      types: [], // Populated from processing types
      defaultPackage: '12ct',
      defaultSize: '12ct'
    },
    
    grades: ['No. 1', 'No. 2'],
    
    quality: {
      storageTemp: { min: 32, max: 35, unit: 'F' },
      shelfLife: { duration: 14, unit: 'days' },
      ethyleneProducer: false,
      ethyleneSensitive: false
    }
  }
]
