/**
 * Tiered Supplier Import with Data Source Tracking
 *
 * Data Sources:
 * - PACA License (USDA - large interstate operations)
 * - USDA Organic (certified organic operations)
 * - Company Website (validated web presence)
 * - Acrelist (supplier on platform - future)
 *
 * Tiers:
 * - Tier 1: PACA + Organic + Website (triple-verified)
 * - Tier 2: PACA + Website (large conventional)
 * - Tier 3: Organic + Website (certified organic)
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
const DB_NAME = MONGODB_URI.includes('mongodb+srv')
  ? MONGODB_URI.split('/')[3].split('?')[0]
  : 'markethunt'

// Curated suppliers with verified data sources
const SUPPLIERS = [
  // TIER 1: PACA + Organic + Website (Triple-Verified)
  {
    companyName: 'Driscoll\'s',
    tier: 1,
    location: {
      city: 'Watsonville',
      state: 'CA',
      county: 'Santa Cruz County',
      region: 'Santa Cruz County',
      full: 'Watsonville, CA'
    },
    website: 'https://www.driscolls.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19970123',
        verifiedDate: '2024-09-12',
        score: 10  // Critical
      },
      usdaOrganic: {
        verified: true,
        certificationDate: '2024-09-12',
        certifier: 'CCOF',
        score: 3  // Nice-to-have for organic products
      },
      gfsi: {
        verified: true,
        certificationType: 'Primus GFS',
        certificationDate: '2024-01-15',
        score: 10  // Critical for B2B
      },
      established: {
        verified: true,
        yearEstablished: 1904,
        yearsInBusiness: new Date().getFullYear() - 1904,
        score: 5  // Important - shows stability
      },
      website: {
        verified: true,
        url: 'https://www.driscolls.com',
        lastChecked: new Date().toISOString(),
        score: 2  // Basic
      },
      drc: {
        verified: true,
        memberSince: '2010',
        score: 2  // Trust signal
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['USDA Organic', 'GAP Certified', 'Fair Trade'],
    description: 'Leading berry grower with proprietary genetics. Year-round supply through global network.',
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Proprietary'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'premium', 'large-scale']
      },
      {
        commodity: 'Raspberries',
        varieties: ['Red Raspberries'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'california', 'premium']
      }
    ],
    scale: 'large'
  },

  {
    companyName: 'Bee Sweet Citrus',
    tier: 1,
    location: {
      city: 'Fowler',
      state: 'CA',
      county: 'Fresno County',
      region: 'Fresno County',
      full: 'Fowler, CA'
    },
    website: 'https://www.beesweetcitrus.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19980456',
        verifiedDate: '2024-10-05',
        score: 10
      },
      usdaOrganic: {
        verified: true,
        certificationDate: '2024-10-05',
        certifier: 'CCOF',
        score: 3
      },
      gfsi: {
        verified: true,
        certificationType: 'Primus GFS',
        certificationDate: '2023-11-20',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1987,
        yearsInBusiness: new Date().getFullYear() - 1987,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.beesweetcitrus.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: true,
        memberSince: '2005',
        score: 2
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['USDA Organic', 'Fair Trade', 'GAP Certified'],
    description: 'Family-owned citrus operation in the Central Valley. Known for premium mandarin varieties.',
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Murcott', 'W. Murcott', 'Tango', 'Gold Nugget'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'premium', 'large-scale']
      }
    ],
    scale: 'large'
  },

  // TIER 2: PACA + Website (Large Conventional)
  {
    companyName: 'Sunkist Growers',
    tier: 2,
    location: {
      city: 'Valencia',
      state: 'CA',
      county: 'Los Angeles County',
      region: 'Los Angeles County',
      full: 'Valencia, CA'
    },
    website: 'https://www.sunkist.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19960789',
        verifiedDate: '2024-11-20',
        score: 10
      },
      usdaOrganic: {
        verified: false,
        score: 0
      },
      gfsi: {
        verified: true,
        certificationType: 'SQF Level 2',
        certificationDate: '2024-03-10',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1893,
        yearsInBusiness: new Date().getFullYear() - 1893,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.sunkist.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: true,
        memberSince: '2000',
        score: 2
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['GAP Certified', 'Primus GFS'],
    description: 'Cooperative of California and Arizona citrus growers. Leading supplier of fresh citrus.',
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Cara Cara'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4,5,6,7], description: 'Nov-Jul' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale', 'cooperative']
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
    scale: 'large'
  },

  {
    companyName: 'Limoneira Company',
    tier: 2,
    location: {
      city: 'Santa Paula',
      state: 'CA',
      county: 'Ventura County',
      region: 'Ventura County',
      full: 'Santa Paula, CA'
    },
    website: 'https://www.limoneira.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19950234',
        verifiedDate: '2024-12-15',
        score: 10
      },
      usdaOrganic: {
        verified: false,
        score: 0
      },
      gfsi: {
        verified: true,
        certificationType: 'Global GAP',
        certificationDate: '2023-09-05',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1893,
        yearsInBusiness: new Date().getFullYear() - 1893,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.limoneira.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: false,
        score: 0
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['GAP Certified'],
    description: 'Premium California citrus grower with over 125 years of experience. Specializing in lemons.',
    products: [
      {
        commodity: 'Lemons',
        varieties: ['Eureka', 'Lisbon'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['year-round', 'california', 'large-scale', 'premium']
      }
    ],
    scale: 'large'
  },

  // TIER 3: Organic + Website (Certified Organic)
  {
    companyName: 'California Giant Berry Farms',
    tier: 3,
    location: {
      city: 'Watsonville',
      state: 'CA',
      county: 'Santa Cruz County',
      region: 'Santa Cruz County',
      full: 'Watsonville, CA'
    },
    website: 'https://www.calgiant.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19920567',
        verifiedDate: '2024-08-15',
        score: 10
      },
      usdaOrganic: {
        verified: true,
        certificationDate: '2024-08-22',
        certifier: 'CCOF',
        score: 3
      },
      gfsi: {
        verified: true,
        certificationType: 'Primus GFS',
        certificationDate: '2023-12-10',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1990,
        yearsInBusiness: new Date().getFullYear() - 1990,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.calgiant.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: false,
        score: 0
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['USDA Organic', 'GAP Certified', 'Primus GFS'],
    description: 'Cooperative of California berry growers. Organic specialty production.',
    products: [
      {
        commodity: 'Strawberries',
        varieties: ['Albion', 'San Andreas'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'organic', 'california', 'large-scale']
      }
    ],
    scale: 'large'
  },

  // NEW SUPPLIERS - Expanding to 10 total
  {
    companyName: 'Mission Produce',
    tier: 1,
    location: {
      city: 'Oxnard',
      state: 'CA',
      county: 'Ventura County',
      region: 'Ventura County',
      full: 'Oxnard, CA'
    },
    website: 'https://www.missionproduce.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19940567',
        verifiedDate: '2024-10-20',
        score: 10
      },
      usdaOrganic: {
        verified: false,
        score: 0
      },
      gfsi: {
        verified: true,
        certificationType: 'SQF Level 3',
        certificationDate: '2024-02-15',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1983,
        yearsInBusiness: new Date().getFullYear() - 1983,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.missionproduce.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: true,
        memberSince: '2008',
        score: 2
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['GFSI Certified', 'Primus GFS', 'Fair Trade'],
    description: 'World leader in avocado distribution. Year-round supply through global sourcing network.',
    products: [
      {
        commodity: 'Avocados',
        varieties: ['Hass', 'Lamb Hass', 'GEM'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'california', 'large-scale', 'global-sourcing']
      }
    ],
    scale: 'large',
    contact: {
      salesEmail: 'sales@missionproduce.com',
      salesPhone: '(805) 981-3650',
      preferredMethod: 'email',
      responseTime: '< 4 hours'
    },
    logistics: {
      fobPoints: ['Oxnard, CA', 'Laredo, TX'],
      minimumOrder: 'Full truckload (22 pallets)',
      crossdockFriendly: true
    }
  },

  {
    companyName: 'Wonderful Citrus',
    tier: 1,
    location: {
      city: 'Lost Hills',
      state: 'CA',
      county: 'Kern County',
      region: 'Kern County',
      full: 'Lost Hills, CA'
    },
    website: 'https://www.wonderful.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19910234',
        verifiedDate: '2024-11-05',
        score: 10
      },
      usdaOrganic: {
        verified: true,
        certificationDate: '2024-09-10',
        certifier: 'CCOF',
        score: 3
      },
      gfsi: {
        verified: true,
        certificationType: 'SQF Level 2',
        certificationDate: '2023-12-20',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1979,
        yearsInBusiness: new Date().getFullYear() - 1979,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.wonderful.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: false,
        score: 0
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['USDA Organic', 'SQF Certified', 'Rainforest Alliance'],
    description: 'Large-scale grower of premium mandarins and pomegranates in California Central Valley.',
    products: [
      {
        commodity: 'Mandarins',
        varieties: ['Halos', 'Wonderful'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [11,12,1,2,3,4], description: 'Nov-Apr' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'large-scale', 'premium']
      },
      {
        commodity: 'Pomegranates',
        varieties: ['Wonderful'],
        isOrganic: true,
        seasonality: { type: 'seasonal', months: [9,10,11,12,1], description: 'Sep-Jan' },
        volume: 'large',
        priceRange: 'premium',
        tags: ['seasonal', 'organic', 'california', 'premium']
      }
    ],
    scale: 'large',
    contact: {
      salesEmail: 'sales@wonderful.com',
      salesPhone: '(661) 858-2500',
      preferredMethod: 'both',
      responseTime: '< 6 hours'
    },
    logistics: {
      fobPoints: ['Lost Hills, CA', 'Delano, CA'],
      minimumOrder: 'Half truckload (11 pallets)',
      crossdockFriendly: true
    }
  },

  {
    companyName: 'Peri & Sons Farms',
    tier: 2,
    location: {
      city: 'Yerington',
      state: 'NV',
      county: 'Lyon County',
      region: 'Lyon County',
      full: 'Yerington, NV'
    },
    website: 'https://www.periandsons.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19880345',
        verifiedDate: '2024-09-15',
        score: 10
      },
      usdaOrganic: {
        verified: false,
        score: 0
      },
      gfsi: {
        verified: true,
        certificationType: 'Primus GFS',
        certificationDate: '2024-01-10',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1959,
        yearsInBusiness: new Date().getFullYear() - 1959,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.periandsons.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: false,
        score: 0
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['Primus GFS', 'GAP Certified'],
    description: 'Multi-generational onion grower in Nevada. Year-round supply through storage and field production.',
    products: [
      {
        commodity: 'Onions',
        varieties: ['Yellow', 'Red', 'White'],
        isOrganic: false,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['year-round', 'nevada', 'large-scale', 'storage']
      }
    ],
    scale: 'large',
    contact: {
      salesEmail: 'sales@periandsons.com',
      salesPhone: '(775) 463-4444',
      preferredMethod: 'phone',
      responseTime: '< 8 hours'
    },
    logistics: {
      fobPoints: ['Yerington, NV'],
      minimumOrder: 'Full truckload (24 pallets)',
      crossdockFriendly: false
    }
  },

  {
    companyName: 'Bard Valley Medjool Date Growers',
    tier: 3,
    location: {
      city: 'Yuma',
      state: 'AZ',
      county: 'Yuma County',
      region: 'Yuma County',
      full: 'Yuma, AZ'
    },
    website: 'https://www.naturaldelights.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '20010123',
        verifiedDate: '2024-08-20',
        score: 10
      },
      usdaOrganic: {
        verified: true,
        certificationDate: '2024-07-15',
        certifier: 'CCOF',
        score: 3
      },
      gfsi: {
        verified: false,
        score: 0
      },
      established: {
        verified: true,
        yearEstablished: 1995,
        yearsInBusiness: new Date().getFullYear() - 1995,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.naturaldelights.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: false,
        score: 0
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['USDA Organic', 'Non-GMO Project', 'Kosher'],
    description: 'Cooperative of date growers in Arizona. Premium Medjool dates with year-round availability.',
    products: [
      {
        commodity: 'Dates',
        varieties: ['Medjool'],
        isOrganic: true,
        seasonality: { type: 'year-round', months: [1,2,3,4,5,6,7,8,9,10,11,12], description: 'Year-round' },
        volume: 'medium',
        priceRange: 'premium',
        tags: ['year-round', 'organic', 'arizona', 'premium', 'specialty']
      }
    ],
    scale: 'medium',
    contact: {
      salesEmail: 'info@naturaldelights.com',
      salesPhone: '(928) 726-9191',
      preferredMethod: 'email',
      responseTime: '< 12 hours'
    },
    logistics: {
      fobPoints: ['Yuma, AZ'],
      minimumOrder: 'Pallet quantity (10 pallets)',
      crossdockFriendly: true
    }
  },

  {
    companyName: 'Fowler Packing Company',
    tier: 2,
    location: {
      city: 'Fresno',
      state: 'CA',
      county: 'Fresno County',
      region: 'Fresno County',
      full: 'Fresno, CA'
    },
    website: 'https://www.fowlerpacking.com',
    dataSources: {
      paca: {
        verified: true,
        licenseNumber: '19750890',
        verifiedDate: '2024-10-10',
        score: 10
      },
      usdaOrganic: {
        verified: false,
        score: 0
      },
      gfsi: {
        verified: true,
        certificationType: 'SQF Level 2',
        certificationDate: '2023-11-15',
        score: 10
      },
      established: {
        verified: true,
        yearEstablished: 1950,
        yearsInBusiness: new Date().getFullYear() - 1950,
        score: 5
      },
      website: {
        verified: true,
        url: 'https://www.fowlerpacking.com',
        lastChecked: new Date().toISOString(),
        score: 2
      },
      drc: {
        verified: true,
        memberSince: '2003',
        score: 2
      },
      acrelist: {
        verified: false,
        score: 0
      }
    },
    certifications: ['SQF Certified', 'GAP Certified', 'Primus GFS'],
    description: 'California stone fruit grower and packer. Specializing in grapes, plums, and nectarines.',
    products: [
      {
        commodity: 'Grapes',
        varieties: ['Red Globe', 'Thompson Seedless', 'Crimson'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [6,7,8,9,10,11], description: 'Jun-Nov' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'large-scale', 'fresh-market']
      },
      {
        commodity: 'Plums',
        varieties: ['Black Splendor', 'Angeleno'],
        isOrganic: false,
        seasonality: { type: 'seasonal', months: [6,7,8,9], description: 'Jun-Sep' },
        volume: 'large',
        priceRange: 'standard',
        tags: ['seasonal', 'california', 'stone-fruit']
      }
    ],
    scale: 'large',
    contact: {
      salesEmail: 'sales@fowlerpacking.com',
      salesPhone: '(559) 834-5911',
      preferredMethod: 'both',
      responseTime: '< 6 hours'
    },
    logistics: {
      fobPoints: ['Fresno, CA', 'Selma, CA'],
      minimumOrder: 'Full truckload (22 pallets)',
      crossdockFriendly: true
    }
  }
]

function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function calculateVerificationScore(dataSources) {
  let totalScore = 0
  let maxScore = 34  // Sum of all possible scores

  Object.values(dataSources).forEach(source => {
    if (source.verified && source.score) {
      totalScore += source.score
    }
  })

  return {
    score: totalScore,
    maxScore: maxScore,
    percentage: Math.round((totalScore / maxScore) * 100)
  }
}

async function importTieredSuppliers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('Connecting to MongoDB...')
    await client.connect()
    const db = client.db(DB_NAME)

    console.log('\n📊 Importing Tiered Suppliers with Data Source Tracking')
    console.log('=' .repeat(70))
    console.log(`Database: ${DB_NAME}`)
    console.log(`Total suppliers: ${SUPPLIERS.length}`)
    console.log('')

    let imported = 0

    for (const supplier of SUPPLIERS) {
      const tierLabel = ['Triple-Verified', 'PACA+Website', 'Organic+Website'][supplier.tier - 1]

      console.log(`\n📋 ${supplier.companyName} (Tier ${supplier.tier}: ${tierLabel})`)
      console.log(`   Location: ${supplier.location.full}`)

      // Show data source checkmarks
      const sources = []
      if (supplier.dataSources.paca.verified) sources.push('✓ PACA')
      else sources.push('✗ PACA')

      if (supplier.dataSources.gfsi.verified) sources.push(`✓ GFSI (${supplier.dataSources.gfsi.certificationType})`)
      else sources.push('✗ GFSI')

      if (supplier.dataSources.established.verified) sources.push(`✓ Est. ${supplier.dataSources.established.yearEstablished}`)
      else sources.push('✗ Est.')

      if (supplier.dataSources.usdaOrganic.verified) sources.push('✓ Organic')
      else sources.push('✗ Organic')

      if (supplier.dataSources.drc.verified) sources.push('✓ DRC')
      else sources.push('✗ DRC')

      console.log(`   Verifications: ${sources.join(' | ')}`)

      const slug = generateSlug(supplier.companyName)

      // Calculate verification score
      const verificationScore = calculateVerificationScore(supplier.dataSources)
      console.log(`   Verification Score: ${verificationScore.score}/${verificationScore.maxScore} (${verificationScore.percentage}%)`)

      // Embed products directly on the supplierDirectory document
      const embeddedProducts = supplier.products.map(product => ({
        commodity: product.commodity,
        varieties: product.varieties,
        isOrganic: product.isOrganic,
        seasonality: product.seasonality,
        volume: product.volume,
        priceRange: product.priceRange,
        tags: product.tags,
        // Spec fields — populate selectively as data becomes available
        minimumOrder: product.minimumOrder || null,       // e.g. { qty: 1000, unit: "lbs" }
        typicalLotSizes: product.typicalLotSizes || [],   // e.g. ["pallet", "full-truckload"]
        packaging: product.packaging || []                // e.g. ["40lb carton", "3ct carton"]
      }))

      // Create supplier directory document (self-contained, no external joins)
      const supplierDoc = {
        slug: slug,
        claimed: false,
        tier: supplier.tier,
        scale: supplier.scale,
        dataSources: supplier.dataSources,
        verificationScore: verificationScore,
        importSource: 'tiered_import_2026',
        importDate: new Date(),
        companyName: supplier.companyName,
        description: supplier.description,
        location: supplier.location,
        website: supplier.website,
        certifications: supplier.certifications,
        contact: {
          phone: supplier.contact?.salesPhone,
          salesEmail: supplier.contact?.salesEmail,
          preferredMethod: supplier.contact?.preferredMethod,
          responseTime: supplier.contact?.responseTime
        },
        logistics: supplier.logistics,
        products: embeddedProducts,
        // AcreList bridge — set when supplier claims their ProduceHunt profile
        acrelistUserId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('supplierDirectory').insertOne(supplierDoc)

      const commodities = supplier.products.map(p => p.commodity).join(', ')
      console.log(`   ✅ Imported - ${commodities}`)
      imported++
    }

    console.log('\n' + '='.repeat(70))
    console.log('🎉 Import Complete!')
    console.log(`   Tier 1 (PACA+Organic+Website): ${SUPPLIERS.filter(s => s.tier === 1).length}`)
    console.log(`   Tier 2 (PACA+Website): ${SUPPLIERS.filter(s => s.tier === 2).length}`)
    console.log(`   Tier 3 (Organic+Website): ${SUPPLIERS.filter(s => s.tier === 3).length}`)
    console.log(`   Total: ${imported}`)
    console.log('='.repeat(70))

  } catch (err) {
    console.error('Fatal error:', err)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  importTieredSuppliers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

module.exports = { importTieredSuppliers }
