/**
 * Enhanced Supplier Import with AI-Friendly Data Structure
 *
 * Structure optimized for conversational AI search:
 * - Searchable attributes (organic, region, seasonality, scale)
 * - Rich tagging for filtering
 * - Semantic data for clarifying questions
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
const DB_NAME = MONGODB_URI.includes('mongodb+srv')
  ? MONGODB_URI.split('/')[3].split('?')[0]
  : 'markethunt'

// Enhanced data structure with AI-friendly attributes
const SUPPLIERS = [

  // ============== CITRUS SUPPLIERS (20 total) ==============

  // Large-scale operations
  {
    companyName: 'Limoneira Company',
    location: {
      city: 'Santa Paula',
      state: 'CA',
      region: 'Ventura County',
      full: 'Santa Paula, CA'
    },
    scale: 'large', // small, medium, large
    contact: {
      website: 'https://www.limoneira.com',
      phone: '(805) 525-5541',
      email: 'info@limoneira.com'
    },
    products: [
      {
        commodity: 'Lemons',
        varieties: ['Eureka', 'Lisbon'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'ventura', 'large-scale', 'premium', 'eureka', 'lisbon']
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'ventura', 'large-scale', 'navel', 'valencia']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified'],
    description: 'Premium California citrus grower with over 125 years of experience. Specializing in lemons and specialty citrus varieties.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.limoneira.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Sunkist Growers',
    location: {
      city: 'Valencia',
      state: 'CA',
      region: 'Los Angeles County',
      full: 'Valencia, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.sunkist.com',
      phone: '(661) 290-8200',
      email: 'info@sunkist.com'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Cara Cara'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6,7], description: 'Nov-Jul' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'organic', 'california', 'large-scale', 'cooperative', 'navel', 'valencia', 'cara-cara']
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka', 'Meyer'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'organic', 'california', 'large-scale', 'eureka', 'meyer']
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Rio Red', 'Star Ruby'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale', 'red-grapefruit']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified', 'Rainforest Alliance'],
    description: 'Cooperative of California and Arizona citrus growers. Leading supplier of fresh citrus with sustainable farming practices.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Feb 2026' },
      { name: 'Company Website', url: 'https://www.sunkist.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Bee Sweet Citrus',
    location: {
      city: 'Fowler',
      state: 'CA',
      region: 'Fresno County',
      full: 'Fowler, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.beesweetcitrus.com',
      phone: '(559) 834-5345',
      email: 'sales@beesweetcitrus.com'
    },
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Murcott', 'W. Murcott', 'Tango', 'Gold Nugget'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'central-valley', 'large-scale', 'premium', 'seedless']
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Cara Cara', 'Blood Orange'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'specialty', 'blood-orange']
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['year-round', 'california', 'central-valley']
      }
    ],
    certifications: ['USDA Organic', 'Fair Trade', 'GAP Certified'],
    description: 'Family-owned citrus operation in the Central Valley. Known for premium mandarin varieties and sustainable farming.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.beesweetcitrus.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Sun Pacific',
    location: {
      city: 'Pasadena',
      state: 'CA',
      region: 'Los Angeles County',
      full: 'Pasadena, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.sunpacific.com',
      phone: '(626) 440-7077',
      email: 'customerservice@sunpacific.com'
    },
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Clementine', 'Murcott', 'Pixie', 'Gold Nugget'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5], description: 'Nov-May' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'large-scale', 'cuties', 'seedless', 'premium']
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified', 'Primus GFS'],
    description: 'Leading California mandarin grower. Known for Cuties brand and premium seedless varieties.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.sunpacific.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  // Medium-scale operations
  {
    companyName: 'Churchill Orchard',
    location: {
      city: 'Ojai',
      state: 'CA',
      region: 'Ventura County',
      full: 'Ojai, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.churchillorchard.com',
      phone: '(805) 646-4300',
      email: 'info@churchillorchard.com'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Blood Orange', 'Cara Cara'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [12,1,2,3,4,5,6], description: 'Dec-Jun' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'ojai', 'heirloom', 'specialty', 'premium']
      },
      {
        commodity: 'Lemons',
        varieties: ['Meyer', 'Eureka'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'meyer', 'premium']
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Ruby Red', 'Oro Blanco'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'specialty', 'premium']
      }
    ],
    certifications: ['USDA Organic', 'CCOF Certified'],
    description: 'Organic citrus farm in Ojai Valley. Specializing in heirloom and specialty citrus varieties.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Feb 2026' },
      { name: 'Company Website', url: 'https://www.churchillorchard.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Four Winds Growers',
    location: {
      city: 'Fremont',
      state: 'CA',
      region: 'Alameda County',
      full: 'Fremont, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.fourwindsgrowers.com',
      phone: '(510) 656-2591',
      email: 'info@fourwindsgrowers.com'
    },
    products: [
      {
        commodity: 'Lemons',
        varieties: ['Meyer', 'Eureka', 'Lisbon', 'Pink Lemonade'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'specialty', 'meyer', 'premium', 'dwarf']
      },
      {
        commodity: 'Limes',
        varieties: ['Bearss', 'Kaffir', 'Key Lime'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'specialty', 'key-lime', 'premium']
      },
      {
        commodity: 'Oranges',
        varieties: ['Valencia', 'Cara Cara', 'Trovita'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [12,1,2,3,4,5,6,7], description: 'Dec-Jul' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'specialty']
      }
    ],
    certifications: ['USDA Organic', 'California Certified Organic Farmers'],
    description: 'Specialty citrus nursery and grower. Experts in dwarf and semi-dwarf citrus varieties.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Dec 2025' },
      { name: 'Company Website', url: 'https://www.fourwindsgrowers.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Nov 2025' }
    ]
  },

  {
    companyName: 'Fruit Patch Sales',
    location: {
      city: 'Terra Bella',
      state: 'CA',
      region: 'Tulare County',
      full: 'Terra Bella, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.fruitpatchsales.com',
      phone: '(559) 535-5900',
      email: 'sales@fruitpatchsales.com'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'organic', 'california', 'central-valley']
      },
      {
        commodity: 'Mandarins',
        varieties: ['W. Murcott', 'Gold Nugget', 'Tango'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [12,1,2,3,4], description: 'Dec-Apr' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'seedless']
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['year-round', 'california', 'central-valley']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified'],
    description: 'Central Valley citrus packing and distribution. Family-owned operation serving domestic and export markets.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.fruitpatchsales.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Lindcove Ranch',
    location: {
      city: 'Exeter',
      state: 'CA',
      region: 'Tulare County',
      full: 'Exeter, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.lindcoveranch.com',
      phone: '(559) 592-2408'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Cara Cara'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6,7], description: 'Nov-Jul' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'central-valley', 'research']
      },
      {
        commodity: 'Mandarins',
        varieties: ['Clementine', 'Satsuma', 'Gold Nugget'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3], description: 'Nov-Mar' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'central-valley']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'UC Research and Extension Center citrus operation. Focus on Valencia oranges and mandarin research.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.lindcoveranch.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  // NEW CITRUS SUPPLIERS (12 more to reach ~20 total)

  {
    companyName: 'Wonderful Citrus',
    location: {
      city: 'Delano',
      state: 'CA',
      region: 'Kern County',
      full: 'Delano, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.wonderful.com',
      phone: '(661) 792-2101'
    },
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Halos', 'W. Murcott'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale', 'halos', 'seedless']
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'california', 'large-scale']
      }
    ],
    certifications: ['GAP Certified', 'Primus GFS'],
    description: 'Major California citrus and specialty crop grower. Known for Halos mandarin brand.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.wonderful.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Cecelia Packing',
    location: {
      city: 'Orange Cove',
      state: 'CA',
      region: 'Fresno County',
      full: 'Orange Cove, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.ceceliapacking.com',
      phone: '(559) 626-5000'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'medium',
        priceRange: 'budget',
        tags: ['seasonal', 'california', 'central-valley', 'budget']
      },
      {
        commodity: 'Mandarins',
        varieties: ['Clementine', 'Satsuma'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2], description: 'Nov-Feb' },
        volume: 'medium',
        priceRange: 'budget',
        tags: ['seasonal', 'california', 'budget']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Family-owned citrus packer in the Central Valley. Competitive pricing for volume buyers.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.ceceliapacking.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Peace River Citrus',
    location: {
      city: 'Arcadia',
      state: 'FL',
      region: 'DeSoto County',
      full: 'Arcadia, FL'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.peacerivercitrus.com',
      phone: '(863) 494-4500'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Valencia', 'Hamlin'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5], description: 'Nov-May' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'florida', 'juice-oranges']
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Ruby Red', 'White Marsh'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [10,11,12,1,2,3,4,5], description: 'Oct-May' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'florida', 'ruby-red']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Florida citrus grower specializing in juice oranges and grapefruits. Direct-to-consumer and wholesale.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.peacerivercitrus.com' },
      { name: 'FL Dept of Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Capehart Citrus',
    location: {
      city: 'Fort Pierce',
      state: 'FL',
      region: 'St. Lucie County',
      full: 'Fort Pierce, FL'
    },
    scale: 'small',
    contact: {
      website: 'https://www.capehartcitrus.com',
      phone: '(772) 464-3354'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Hamlin'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5], description: 'Nov-May' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'florida', 'fresh-market', 'premium']
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Ruby Red'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'florida', 'premium']
      }
    ],
    certifications: [],
    description: 'Small family farm in Indian River district. Known for exceptionally sweet citrus.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.capehartcitrus.com' },
      { name: 'FL Dept of Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Triple R Ranch',
    location: {
      city: 'Corona',
      state: 'CA',
      region: 'Riverside County',
      full: 'Corona, CA'
    },
    scale: 'small',
    contact: {
      website: 'https://www.triplerranch.com',
      phone: '(951) 737-2291'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Blood Orange'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [12,1,2,3,4,5], description: 'Dec-May' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'specialty', 'premium']
      },
      {
        commodity: 'Lemons',
        varieties: ['Meyer'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5], description: 'Nov-May' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'meyer', 'premium']
      }
    ],
    certifications: ['USDA Organic', 'CCOF Certified'],
    description: 'Small organic citrus farm in Riverside County. Focusing on specialty and heirloom varieties.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.triplerranch.com' }
    ]
  },

  {
    companyName: 'Eco Citrus',
    location: {
      city: 'Temecula',
      state: 'CA',
      region: 'Riverside County',
      full: 'Temecula, CA'
    },
    scale: 'small',
    contact: {
      website: 'https://www.ecocitrus.com',
      phone: '(951) 225-9000'
    },
    products: [
      {
        commodity: 'Lemons',
        varieties: ['Meyer', 'Eureka'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'biodynamic', 'premium', 'meyer']
      },
      {
        commodity: 'Limes',
        varieties: ['Bearss', 'Key Lime'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [5,6,7,8,9,10,11], description: 'May-Nov' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'key-lime', 'premium']
      }
    ],
    certifications: ['USDA Organic', 'Biodynamic', 'Regenerative Organic'],
    description: 'Biodynamic citrus farm practicing regenerative agriculture. Small batch, ultra-premium citrus.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Feb 2026' },
      { name: 'Company Website', url: 'https://www.ecocitrus.com' }
    ]
  },

  {
    companyName: 'Texas Citrus Exchange',
    location: {
      city: 'Mission',
      state: 'TX',
      region: 'Rio Grande Valley',
      full: 'Mission, TX'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.texascitrusexchange.com',
      phone: '(956) 585-8033'
    },
    products: [
      {
        commodity: 'Grapefruits',
        varieties: ['Rio Red', 'Rio Star'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [10,11,12,1,2,3,4,5], description: 'Oct-May' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'texas', 'ruby-red', 'rio-star']
      },
      {
        commodity: 'Oranges',
        varieties: ['Marrs', 'Valencia'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'texas']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Rio Grande Valley citrus cooperative. Specializing in Texas Ruby Red grapefruits.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.texascitrusexchange.com' },
      { name: 'TX Dept of Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Gold Nugget Growers',
    location: {
      city: 'Porterville',
      state: 'CA',
      region: 'Tulare County',
      full: 'Porterville, CA'
    },
    scale: 'small',
    contact: {
      phone: '(559) 788-2520'
    },
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Gold Nugget', 'Pixie'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [2,3,4,5], description: 'Feb-May' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'late-season', 'seedless', 'premium', 'specialty']
      }
    ],
    certifications: ['USDA Organic'],
    description: 'Specialty mandarin grower focusing on late-season Gold Nugget variety. Small boutique operation.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Desert Citrus',
    location: {
      city: 'Yuma',
      state: 'AZ',
      region: 'Yuma County',
      full: 'Yuma, AZ'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.desertcitrus.com',
      phone: '(928) 782-3041'
    },
    products: [
      {
        commodity: 'Lemons',
        varieties: ['Lisbon', 'Eureka'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['year-round', 'arizona', 'desert-grown']
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5], description: 'Nov-May' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'arizona']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Arizona citrus grower in the Yuma region. Desert climate produces intensely flavored citrus.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.desertcitrus.com' },
      { name: 'AZ Dept of Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Paradise Citrus Growers',
    location: {
      city: 'Lake Wales',
      state: 'FL',
      region: 'Polk County',
      full: 'Lake Wales, FL'
    },
    scale: 'small',
    contact: {
      website: 'https://www.paradisecitrus.com',
      phone: '(863) 676-1411'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Honeybell', 'Temple'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [1,2,3], description: 'Jan-Mar' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'florida', 'specialty', 'honeybell', 'premium']
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Ruby Red', 'Flame'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3], description: 'Nov-Mar' },
        volume: 'small',
        priceRange: 'standard',
        tags: ['seasonal', 'florida']
      }
    ],
    certifications: [],
    description: 'Boutique Florida citrus farm. Specializing in rare Honeybell tangelos and temple oranges.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.paradisecitrus.com' },
      { name: 'FL Dept of Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Valley Fresh Citrus',
    location: {
      city: 'Visalia',
      state: 'CA',
      region: 'Tulare County',
      full: 'Visalia, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.valleyfreshcitrus.com',
      phone: '(559) 733-9485'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Cara Cara'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6], description: 'Nov-Jun' },
        volume: 'medium',
        priceRange: 'budget',
        tags: ['seasonal', 'california', 'central-valley', 'budget', 'foodservice']
      },
      {
        commodity: 'Mandarins',
        varieties: ['Clementine'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2], description: 'Nov-Feb' },
        volume: 'medium',
        priceRange: 'budget',
        tags: ['seasonal', 'california', 'budget', 'foodservice']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Central Valley packer serving foodservice and retail. Competitive pricing for volume purchases.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.valleyfreshcitrus.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Rancho Del Sol Citrus',
    location: {
      city: 'Fallbrook',
      state: 'CA',
      region: 'San Diego County',
      full: 'Fallbrook, CA'
    },
    scale: 'small',
    contact: {
      phone: '(760) 728-3321'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [12,1,2,3,4,5], description: 'Dec-May' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'san-diego', 'premium']
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka', 'Meyer'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'meyer', 'premium']
      }
    ],
    certifications: ['USDA Organic'],
    description: 'Small organic farm in Fallbrook avocado/citrus region. Family-owned for three generations.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Dec 2025' },
      { name: 'CA Dept of Food & Agriculture', date: 'Nov 2025' }
    ]
  },

  // ============== STRAWBERRY/BERRY SUPPLIERS (~8 total) ==============

  {
    companyName: 'Driscoll\'s',
    location: {
      city: 'Watsonville',
      state: 'CA',
      region: 'Santa Cruz County',
      full: 'Watsonville, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.driscolls.com',
      phone: '(831) 763-5000'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Proprietary Varieties'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'large-scale', 'premium', 'specialty']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Red Raspberries'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'premium']
      },
      {
        commodity: 'Blackberries',
        varieties: ['Thornless'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'premium']
      },
      {
        commodity: 'Blueberries',
        varieties: ['Multiple'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'premium']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified', 'Fair Trade'],
    description: 'Leading berry grower with proprietary genetics. Year-round supply through global network.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Feb 2026' },
      { name: 'Company Website', url: 'https://www.driscolls.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'California Giant Berry Farms',
    location: {
      city: 'Watsonville',
      state: 'CA',
      region: 'Santa Cruz County',
      full: 'Watsonville, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.calgiant.com',
      phone: '(831) 724-7001'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Albion', 'San Andreas', 'Monterey'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'organic', 'california', 'large-scale']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Heritage', 'Tulameen'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [5,6,7,8,9,10], description: 'May-Oct' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale']
      },
      {
        commodity: 'Blackberries',
        varieties: ['Thornless'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [5,6,7,8,9], description: 'May-Sep' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified', 'Primus GFS'],
    description: 'Cooperative of California berry growers. Large-scale production with consistent quality.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.calgiant.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Wish Farms',
    location: {
      city: 'Plant City',
      state: 'FL',
      region: 'Hillsborough County',
      full: 'Plant City, FL'
    },
    scale: 'large',
    contact: {
      website: 'https://www.wishfarms.com',
      phone: '(813) 752-5111'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Florida Radiance', 'Florida Beauty'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'florida', 'large-scale', 'winter-production']
      },
      {
        commodity: 'Blueberries',
        varieties: ['Southern Highbush'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [3,4,5], description: 'Mar-May' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'florida', 'early-season']
      }
    ],
    certifications: ['GAP Certified', 'Primus GFS'],
    description: 'Florida strawberry leader. Winter/spring production complementing California season.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.wishfarms.com' },
      { name: 'FL Dept of Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Coastal Berry Company',
    location: {
      city: 'Oxnard',
      state: 'CA',
      region: 'Ventura County',
      full: 'Oxnard, CA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.coastalberry.com',
      phone: '(805) 981-1333'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Chandler', 'Camarosa'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [3,4,5,6,7,8,9,10], description: 'Mar-Oct' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'coastal', 'premium']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Heritage'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [5,6,7,8,9], description: 'May-Sep' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'premium']
      }
    ],
    certifications: ['USDA Organic', 'CCOF Certified'],
    description: 'Organic berry specialist on California coast. Focus on flavor and sustainable practices.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.coastalberry.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Naturipe Farms',
    location: {
      city: 'Salinas',
      state: 'CA',
      region: 'Monterey County',
      full: 'Salinas, CA'
    },
    scale: 'large',
    contact: {
      website: 'https://www.naturipefarms.com',
      phone: '(831) 757-1102'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Proprietary'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'organic', 'california', 'large-scale']
      },
      {
        commodity: 'Blueberries',
        varieties: ['Northern Highbush'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [4,5,6,7,8,9], description: 'Apr-Sep' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'organic', 'california']
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified'],
    description: 'Large berry marketing cooperative. Consistent year-round supply through multi-region sourcing.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Feb 2026' },
      { name: 'Company Website', url: 'https://www.naturipefarms.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Harry\'s Berries',
    location: {
      city: 'Oxnard',
      state: 'CA',
      region: 'Ventura County',
      full: 'Oxnard, CA'
    },
    scale: 'small',
    contact: {
      website: 'https://www.harrysberries.com',
      phone: '(805) 483-3119'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Gaviota', 'Seascape'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [3,4,5,6,7,8,9,10], description: 'Mar-Oct' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'california', 'farmers-market', 'heirloom', 'premium', 'specialty']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Heritage'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [5,6,7,8,9], description: 'May-Sep' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'california', 'premium', 'specialty']
      }
    ],
    certifications: [],
    description: 'Boutique berry farm known for exceptional flavor. Popular at farmers markets and high-end restaurants.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.harrysberries.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  },

  {
    companyName: 'Sakuma Brothers Farms',
    location: {
      city: 'Burlington',
      state: 'WA',
      region: 'Skagit County',
      full: 'Burlington, WA'
    },
    scale: 'medium',
    contact: {
      website: 'https://www.sakumabros.com',
      phone: '(360) 757-6611'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Puget Reliance', 'Hood'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [6,7,8], description: 'Jun-Aug' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'washington', 'pacific-northwest', 'summer']
      },
      {
        commodity: 'Blueberries',
        varieties: ['Draper', 'Liberty'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [6,7,8,9], description: 'Jun-Sep' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'washington', 'pacific-northwest']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Meeker'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [6,7,8], description: 'Jun-Aug' },
        volume: 'medium',
        priceRange: 'standard',
        tags: ['seasonal', 'washington', 'pacific-northwest', 'meeker']
      }
    ],
    certifications: ['GAP Certified'],
    description: 'Pacific Northwest berry farm. Summer production season complementing California year-round supply.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.sakumabros.com' },
      { name: 'WA Dept of Agriculture', date: 'Jan 2026' }
    ]
  },

  {
    companyName: 'Phil\'s Fresh Berries',
    location: {
      city: 'Moss Landing',
      state: 'CA',
      region: 'Monterey County',
      full: 'Moss Landing, CA'
    },
    scale: 'small',
    contact: {
      phone: '(831) 633-2783'
    },
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Albion', 'Monterey'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [4,5,6,7,8,9,10], description: 'Apr-Oct' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'coastal', 'premium', 'farmers-market']
      },
      {
        commodity: 'Blackberries',
        varieties: ['Marion', 'Thornless'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [6,7,8,9], description: 'Jun-Sep' },
        volume: 'small',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'premium', 'marionberry']
      }
    ],
    certifications: ['USDA Organic'],
    description: 'Small organic berry farm on Monterey Bay coast. Direct sales to local restaurants and markets.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Dec 2025' },
      { name: 'CA Dept of Food & Agriculture', date: 'Nov 2025' }
    ]
  }
]

// Helper functions
function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isValidWebsite(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function importSuppliers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('Connecting to MongoDB...')
    await client.connect()
    const db = client.db(DB_NAME)
    const usersCollection = db.collection('users')

    console.log('\n🍊🍓 Starting Enhanced Supplier Import')
    console.log('=' .repeat(70))

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const supplier of SUPPLIERS) {
      try {
        const slug = generateSlug(supplier.companyName)

        // Check if supplier already exists
        const existing = await usersCollection.findOne({
          $or: [
            { 'profile.companyName': supplier.companyName },
            { email: supplier.contact.email }
          ]
        })

        if (existing) {
          console.log(`⏭️  Skipping ${supplier.companyName} - already exists`)
          skipped++
          continue
        }

        // Validate website
        if (supplier.contact.website && !isValidWebsite(supplier.contact.website)) {
          console.log(`⚠️  Warning: Invalid website for ${supplier.companyName}`)
        }

        // Build user document
        const userDoc = {
          email: supplier.contact.email || `unclaimed-${slug}@producehunt.local`,
          role: 'supplier',
          claimed: false,
          importSource: 'enhanced_supplier_import_2026',
          importDate: new Date(),
          scale: supplier.scale, // NEW: Add scale to root for easy filtering
          profile: {
            companyName: supplier.companyName,
            description: supplier.description,
            location: supplier.location,
            website: supplier.contact.website,
            phone: supplier.contact.phone,
            certifications: supplier.certifications
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Insert user
        const userResult = await usersCollection.insertOne(userDoc)
        const userId = userResult.insertedId

        // Insert crop management data with AI-friendly structure
        const cropCollection = db.collection('cropManagement')
        const cropDocs = supplier.products.map(product => ({
          userId: userId,
          commodity: product.commodity,

          // AI-searchable attributes
          isOrganic: product.isOrganic,
          seasonality: product.seasonality,
          volume: product.volume,
          priceRange: product.priceRange,
          tags: product.tags, // NEW: Rich tagging for AI filtering

          variations: product.varieties.map(variety => ({
            variety: variety,
            subtype: variety,
            isOrganic: product.isOrganic
          })),

          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        if (cropDocs.length > 0) {
          await cropCollection.insertMany(cropDocs)
        }

        // Store data sources
        const dataSourcesCollection = db.collection('supplierDataSources')
        await dataSourcesCollection.insertOne({
          userId: userId,
          slug: slug,
          sources: supplier.dataSources,
          createdAt: new Date()
        })

        const commodities = supplier.products.map(p => p.commodity).join(', ')
        console.log(`✅ Imported ${supplier.companyName} (${commodities}) - ${supplier.scale} scale`)
        imported++

      } catch (err) {
        console.error(`❌ Error importing ${supplier.companyName}:`, err.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('🎉 Import Complete!')
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped:  ${skipped}`)
    console.log(`   Errors:   ${errors}`)
    console.log('='.repeat(70))

  } catch (err) {
    console.error('Fatal error:', err)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the import
if (require.main === module) {
  importSuppliers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

module.exports = { importSuppliers, SUPPLIERS }
