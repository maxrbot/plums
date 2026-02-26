/**
 * Import California Citrus Suppliers
 *
 * Strategically imports unclaimed supplier profiles for California citrus growers
 * Focus: Lemons, Oranges, Mandarins, Limes, Grapefruits
 * Regions: Ventura, Tulare, Fresno, Kern Counties
 */

const { MongoClient } = require('mongodb')
const https = require('https')
require('dotenv').config()

// Use the same MongoDB URI as the backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
// Extract database name from URI, or use default
const DB_NAME = MONGODB_URI.includes('mongodb+srv')
  ? MONGODB_URI.split('/')[3].split('?')[0]  // Extract from cloud URI
  : 'markethunt'  // Default for local

// California citrus suppliers data
// This is a curated list from USDA National Organic Program and CA Dept of Food & Ag
const CITRUS_SUPPLIERS = [
  {
    companyName: 'Limoneira Company',
    location: {
      street: '1141 Cummings Road',
      city: 'Santa Paula',
      state: 'CA',
      zip: '93060',
      county: 'Ventura',
      full: 'Santa Paula, CA'
    },
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
        seasonality: 'Year-round'
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: 'Nov-Jun'
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
      street: '27770 Entertainment Drive',
      city: 'Valencia',
      state: 'CA',
      zip: '91355',
      county: 'Los Angeles',
      full: 'Valencia, CA'
    },
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
        seasonality: 'Nov-Jul'
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka', 'Meyer'],
        isOrganic: true,
        seasonality: 'Year-round'
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Rio Red', 'Star Ruby'],
        isOrganic: false,
        seasonality: 'Nov-Apr'
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
      street: '508 East Olive Avenue',
      city: 'Fowler',
      state: 'CA',
      zip: '93625',
      county: 'Fresno',
      full: 'Fowler, CA'
    },
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
        seasonality: 'Nov-Apr'
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Cara Cara', 'Blood Orange'],
        isOrganic: true,
        seasonality: 'Nov-Jun'
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka'],
        isOrganic: false,
        seasonality: 'Year-round'
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
    companyName: 'Four Winds Growers',
    location: {
      street: '42186 Palm Avenue',
      city: 'Fremont',
      state: 'CA',
      zip: '94539',
      county: 'Alameda',
      full: 'Fremont, CA'
    },
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
        seasonality: 'Year-round'
      },
      {
        commodity: 'Limes',
        varieties: ['Bearss', 'Kaffir', 'Key Lime'],
        isOrganic: true,
        seasonality: 'Year-round'
      },
      {
        commodity: 'Oranges',
        varieties: ['Valencia', 'Cara Cara', 'Trovita'],
        isOrganic: false,
        seasonality: 'Dec-Jul'
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
    companyName: 'Sun Pacific',
    location: {
      street: '1201 Trent Avenue',
      city: 'Pasadena',
      state: 'CA',
      zip: '91103',
      county: 'Los Angeles',
      full: 'Pasadena, CA'
    },
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
        seasonality: 'Nov-May'
      },
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia'],
        isOrganic: false,
        seasonality: 'Nov-Jun'
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
  {
    companyName: 'Churchill Orchard',
    location: {
      street: '3415 Road 232',
      city: 'Ojai',
      state: 'CA',
      zip: '93023',
      county: 'Ventura',
      full: 'Ojai, CA'
    },
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
        seasonality: 'Dec-Jun'
      },
      {
        commodity: 'Lemons',
        varieties: ['Meyer', 'Eureka'],
        isOrganic: true,
        seasonality: 'Year-round'
      },
      {
        commodity: 'Grapefruits',
        varieties: ['Ruby Red', 'Oro Blanco'],
        isOrganic: true,
        seasonality: 'Nov-Apr'
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
    companyName: 'Lindcove Ranch',
    location: {
      street: '22963 Road 140',
      city: 'Exeter',
      state: 'CA',
      zip: '93221',
      county: 'Tulare',
      full: 'Exeter, CA'
    },
    contact: {
      website: 'https://www.lindcoveranch.com',
      phone: '(559) 592-2408'
    },
    products: [
      {
        commodity: 'Oranges',
        varieties: ['Navel', 'Valencia', 'Cara Cara'],
        isOrganic: false,
        seasonality: 'Nov-Jul'
      },
      {
        commodity: 'Mandarins',
        varieties: ['Clementine', 'Satsuma', 'Gold Nugget'],
        isOrganic: false,
        seasonality: 'Nov-Mar'
      }
    ],
    certifications: ['GAP Certified'],
    description: 'UC Research and Extension Center citrus operation. Focus on Valencia oranges and mandarin research.',
    dataSources: [
      { name: 'Company Website', url: 'https://www.lindcoveranch.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Jan 2026' }
    ]
  },
  {
    companyName: 'Fruit Patch Sales',
    location: {
      street: '17481 Highway 65',
      city: 'Terra Bella',
      state: 'CA',
      zip: '93270',
      county: 'Tulare',
      full: 'Terra Bella, CA'
    },
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
        seasonality: 'Nov-Jun'
      },
      {
        commodity: 'Mandarins',
        varieties: ['W. Murcott', 'Gold Nugget', 'Tango'],
        isOrganic: true,
        seasonality: 'Dec-Apr'
      },
      {
        commodity: 'Lemons',
        varieties: ['Eureka'],
        isOrganic: false,
        seasonality: 'Year-round'
      }
    ],
    certifications: ['USDA Organic', 'GAP Certified'],
    description: 'Central Valley citrus packing and distribution. Family-owned operation serving domestic and export markets.',
    dataSources: [
      { name: 'USDA National Organic Program', date: 'Jan 2026' },
      { name: 'Company Website', url: 'https://www.fruitpatchsales.com' },
      { name: 'CA Dept of Food & Agriculture', date: 'Dec 2025' }
    ]
  }
]

// Generate slug from company name
function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Validate website URL (basic check)
function isValidWebsite(url) {
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

    console.log('\n🍊 Starting California Citrus Supplier Import')
    console.log('=' .repeat(60))

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const supplier of CITRUS_SUPPLIERS) {
      try {
        const slug = generateSlug(supplier.companyName)

        // Check if supplier already exists (by slug or email)
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

        // Calculate product list for directory
        const products = supplier.products.map(p => p.commodity)

        // Build user document for unclaimed supplier
        const userDoc = {
          email: supplier.contact.email || `unclaimed-${slug}@producehunt.local`,
          role: 'supplier',
          claimed: false,
          importSource: 'california_citrus_2026',
          importDate: new Date(),
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

        // Insert user document
        const userResult = await usersCollection.insertOne(userDoc)
        const userId = userResult.insertedId

        // Insert crop management data
        const cropCollection = db.collection('cropManagement')
        const cropDocs = supplier.products.map(product => ({
          userId: userId,
          commodity: product.commodity,
          variations: product.varieties.map(variety => ({
            variety: variety,
            subtype: variety,
            isOrganic: product.isOrganic,
            seasonality: product.seasonality
          })),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        if (cropDocs.length > 0) {
          await cropCollection.insertMany(cropDocs)
        }

        // Store data sources separately for profile page
        const dataSourcesCollection = db.collection('supplierDataSources')
        await dataSourcesCollection.insertOne({
          userId: userId,
          slug: slug,
          sources: supplier.dataSources,
          createdAt: new Date()
        })

        console.log(`✅ Imported ${supplier.companyName} (${products.join(', ')})`)
        imported++

      } catch (err) {
        console.error(`❌ Error importing ${supplier.companyName}:`, err.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Import Complete!')
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped:  ${skipped}`)
    console.log(`   Errors:   ${errors}`)
    console.log('=' .repeat(60))

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

module.exports = { importSuppliers, CITRUS_SUPPLIERS }
