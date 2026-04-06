/**
 * Bulk-seed the directoryPipeline collection with 50 target produce companies.
 * Run with: npx ts-node src/scripts/seedPipeline.ts
 */
import 'dotenv/config'
import { MongoClient } from 'mongodb'

const companies = [
  // ── Salinas / Monterey Bay ──────────────────────────────────────────────
  { companyName: 'Tanimura & Antle', city: 'Salinas', state: 'CA', commodities: ['lettuce', 'broccoli', 'cauliflower'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.tanimura-antle.com', notes: 'One of the largest independent vegetable growers in the US; 36,000+ acres' },
  { companyName: 'Taylor Farms', city: 'Salinas', state: 'CA', commodities: ['salad kits', 'leafy greens', 'fresh-cut'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.taylorfarms.com', notes: "North America's largest fresh-cut salad producer" },
  { companyName: "D'Arrigo Brothers", city: 'Salinas', state: 'CA', commodities: ['broccoli', 'lettuce', 'fennel'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://darrigobros.com', notes: 'Family-founded 1920; Andy Boy brand; credited with launching US commercial broccoli industry' },
  { companyName: 'Church Brothers Farms', city: 'Salinas', state: 'CA', commodities: ['iceberg lettuce', 'romaine', 'leaf lettuce'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.churchbrothersfarms.com', notes: 'Migrates seasonally between Salinas and Yuma' },
  { companyName: 'The Nunes Company', city: 'Salinas', state: 'CA', commodities: ['lettuce', 'broccoli', 'strawberries'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.foxy.com', notes: 'Ships under Foxy and Foxy Organic brands' },
  { companyName: 'Ocean Mist Farms', city: 'Castroville', state: 'CA', commodities: ['artichokes', 'brussels sprouts', 'cauliflower'], organic: null, size: 'large', type: 'grower-shipper', website: 'https://www.oceanmist.com', notes: "Fourth-generation family; largest artichoke grower in North America; est. 1924" },
  { companyName: 'Hitchcock Farms', city: 'Salinas', state: 'CA', commodities: ['brussels sprouts', 'romaine', 'celery'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://www.hitchcockfarms.com', notes: "Among North America's largest Brussels sprouts producers" },
  { companyName: 'Pacific International Marketing', city: 'Salinas', state: 'CA', commodities: ['bok choy', 'spinach', 'broccoli'], organic: true, size: 'medium', type: 'grower-shipper', website: 'https://www.pim4u.com', notes: 'Ships ~5M packages/year; conventional and organic' },
  { companyName: 'Coastline Family Farms', city: 'Salinas', state: 'CA', commodities: ['romaine', 'lettuce', 'broccoli'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://www.coastlinefamilyfarms.com', notes: 'Western Growers member; multi-season Salinas/Yuma' },
  { companyName: 'Lakeside Organic Gardens', city: 'Watsonville', state: 'CA', commodities: ['organic vegetables', 'leafy greens'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.lakesideorganicgardens.com', notes: 'One of the largest certified organic vegetable growers in the US' },

  // ── Bakersfield / San Joaquin Valley ────────────────────────────────────
  { companyName: 'Bolthouse Farms', city: 'Bakersfield', state: 'CA', commodities: ['carrots', 'juices'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.bolthouse.com', notes: 'Large-scale carrot grower and processor; widely distributed in retail' },
  { companyName: 'Grimmway Farms', city: 'Bakersfield', state: 'CA', commodities: ['carrots', 'organic vegetables'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.grimmway.com', notes: "Largest carrot grower in the world; 10M lbs/day; Cal-Organic division" },
  { companyName: 'Cal-Organic Farms', city: 'Bakersfield', state: 'CA', commodities: ['carrots', 'mixed organic vegetables'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://calorganicfarms.com', notes: 'Division of Grimmway Farms; 65+ organic vegetable varieties' },
  { companyName: 'Progressive Produce', city: 'Bakersfield', state: 'CA', commodities: ['asparagus', 'potatoes', 'onions', 'citrus'], organic: true, size: 'medium', type: 'shipper', website: 'https://www.progressiveproduce.com', notes: 'Est. 1967; global supplier of organic and conventional asparagus and root vegetables' },
  { companyName: 'Anthony Vineyards', city: 'Bakersfield', state: 'CA', commodities: ['table grapes'], organic: true, size: 'medium', type: 'grower-shipper', website: 'https://www.anthonyvineyards.com', notes: 'Coachella Valley and Bakersfield; began organic farming 2002; 320+ organic acres' },
  { companyName: 'Grapeman Farms', city: 'Bakersfield', state: 'CA', commodities: ['table grapes'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://grapeman.com', notes: 'Founded 1974; Southern San Joaquin Valley; two distribution facilities' },

  // ── Fresno / Reedley / Kingsburg (Stone Fruit) ─────────────────────────
  { companyName: 'Prima Wawona', city: 'Fresno', state: 'CA', commodities: ['peaches', 'nectarines', 'plums'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.primawawona.com', notes: "One of North America's largest stone fruit producers" },
  { companyName: 'Kingsburg Orchards', city: 'Kingsburg', state: 'CA', commodities: ['peaches', 'nectarines', 'plums'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://www.kingsburgorchards.com', notes: 'One of the largest family-owned stone fruit operations in San Joaquin Valley' },
  { companyName: 'Brandt Farms', city: 'Reedley', state: 'CA', commodities: ['peaches', 'plums', 'nectarines', 'grapes'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://www.brandtfarms.com', notes: '77+ years; three-generation family operation' },
  { companyName: 'Mountain View Fruit Sales', city: 'Reedley', state: 'CA', commodities: ['peaches', 'nectarines', 'plums', 'plumcots'], organic: false, size: 'medium', type: 'shipper', website: 'https://www.mvfruits.com', notes: 'Family-owned since 1994; full stone fruit line including specialty varieties' },
  { companyName: 'Sunriver Sales', city: 'Exeter', state: 'CA', commodities: ['plums', 'peaches', 'nectarines'], organic: false, size: 'medium', type: 'shipper', website: 'https://www.sunriversales.net', notes: 'Largest export shipper of plums in California' },
  { companyName: 'Homegrown Organic Farms', city: 'Porterville', state: 'CA', commodities: ['stone fruit', 'citrus', 'tree fruit', 'grapes'], organic: true, size: 'medium', type: 'grower-shipper', website: 'https://hgofarms.com', notes: 'Employee-owned; exclusively certified organic since 1998' },

  // ── Delano (Table Grapes) ───────────────────────────────────────────────
  { companyName: 'Delano Farms', city: 'Delano', state: 'CA', commodities: ['table grapes'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://www.delanofarms.com', notes: 'One of the largest table grape growers; thousands of acres in San Joaquin and Coachella valleys' },
  { companyName: 'Pandol Brothers', city: 'Delano', state: 'CA', commodities: ['table grapes', 'blueberries'], organic: false, size: 'large', type: 'shipper', website: 'https://www.pandol.com', notes: "One of the country's largest table grape and blueberry shippers; multi-generational family" },
  { companyName: 'Four Star Fruit', city: 'Delano', state: 'CA', commodities: ['table grapes'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://www.fourstarfruit.com', notes: 'Family-owned since 1987; San Joaquin and Coachella Valley vineyards plus Mexico' },

  // ── Citrus ─────────────────────────────────────────────────────────────
  { companyName: 'Wonderful Citrus', city: 'Shafter', state: 'CA', commodities: ['mandarins', 'lemons', 'navel oranges'], organic: false, size: 'huge', type: 'grower-shipper', website: 'https://www.wonderful.com', notes: 'Largest integrated citrus grower/packer/shipper in the US; 65,000+ acres; Halos brand' },
  { companyName: 'Bee Sweet Citrus', city: 'Fowler', state: 'CA', commodities: ['navel oranges', 'lemons', 'mandarins'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://www.beesweetcitrus.com', notes: 'Family-owned since 1987; 420,000 sq ft facility; ~125 trucks/day; global exports' },
  { companyName: 'Booth Ranches', city: 'Orange Cove', state: 'CA', commodities: ['navel oranges', 'valencia oranges'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://boothranches.com', notes: 'Family-owned; quality-focused navel and Valencia operation in San Joaquin Valley' },

  // ── Avocados ───────────────────────────────────────────────────────────
  { companyName: 'Calavo Growers', city: 'Santa Paula', state: 'CA', commodities: ['avocados', 'tomatoes'], organic: false, size: 'huge', type: 'shipper', website: 'https://calavo.com', notes: 'Publicly traded (CVGW); est. 1924; leading US avocado packer and shipper; global sourcing' },
  { companyName: 'Mission Produce', city: 'Oxnard', state: 'CA', commodities: ['avocados', 'mangoes'], organic: false, size: 'huge', type: 'shipper', website: 'https://missionproduce.com', notes: "One of the world's largest avocado suppliers; founded 1983; global sourcing network" },
  { companyName: 'West Pak Avocado', city: 'Murrieta', state: 'CA', commodities: ['avocados'], organic: false, size: 'large', type: 'shipper', website: 'https://www.westpakavocado.com', notes: 'Family-owned; sources from 1,000+ CA growers on 65,000 acres; ~425,000 lbs/day' },
  { companyName: 'Del Rey Avocado', city: 'Fallbrook', state: 'CA', commodities: ['avocados'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://delreyavocado.com', notes: 'Three-generation family; California, Mexico, Peru, Chile sourcing' },

  // ── Berries ────────────────────────────────────────────────────────────
  { companyName: "Driscoll's", city: 'Watsonville', state: 'CA', commodities: ['strawberries', 'blueberries', 'raspberries', 'blackberries'], organic: true, size: 'huge', type: 'shipper', website: 'https://www.driscolls.com', notes: "World's largest berry company; 100+ years; sells in 48 countries; proprietary varieties" },
  { companyName: 'California Giant Berry Farms', city: 'Watsonville', state: 'CA', commodities: ['strawberries', 'blueberries', 'raspberries'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.calgiant.com', notes: 'Ships 40M+ trays/year; year-round supply; organic line available' },
  { companyName: 'Naturipe Farms', city: 'Salinas', state: 'CA', commodities: ['blueberries', 'strawberries', 'raspberries'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.naturipefarms.com', notes: 'Grower-owned cooperative; partners with Michigan Blueberry Growers and others' },
  { companyName: 'Reiter Affiliated Companies', city: 'Oxnard', state: 'CA', commodities: ['strawberries', 'raspberries', 'blueberries'], organic: false, size: 'huge', type: 'grower-shipper', website: 'https://www.berry.net', notes: 'Largest fresh multi-berry producer in the world; leading strawberry supplier' },

  // ── Pacific Northwest ──────────────────────────────────────────────────
  { companyName: 'Stemilt Growers', city: 'Wenatchee', state: 'WA', commodities: ['apples', 'cherries', 'pears', 'stone fruit'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.stemilt.com', notes: "World's largest sweet cherry shipper; family-owned since 1964; strong organic program" },
  { companyName: 'Rainier Fruit Company', city: 'Selah', state: 'WA', commodities: ['apples', 'pears', 'cherries', 'blueberries'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://rainierfruit.com', notes: 'Family-owned; one of the largest organic fruit shippers in the US' },
  { companyName: 'Chelan Fresh', city: 'Chelan', state: 'WA', commodities: ['apples', 'cherries', 'pears'], organic: false, size: 'large', type: 'shipper', website: 'https://chelanfresh.com', notes: 'Represents Borton Fruit and Gebbers Farms; 20+ apple varieties; North Central Washington' },
  { companyName: 'Starr Ranch Growers', city: 'Wenatchee', state: 'WA', commodities: ['apples', 'pears', 'cherries'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://starranch.com', notes: 'Founded 1934; leading Pacific Northwest fruit grower, packer, and shipper' },
  { companyName: 'Domex Superfresh Growers', city: 'Yakima', state: 'WA', commodities: ['apples', 'pears', 'cherries'], organic: true, size: 'large', type: 'grower-shipper', website: 'https://www.superfreshgrowers.com', notes: 'Grower-owned cooperative; Yakima Valley; strong organic apple program' },

  // ── Arizona ────────────────────────────────────────────────────────────
  { companyName: 'JV Smith Companies', city: 'Yuma', state: 'AZ', commodities: ['lettuce', 'leafy greens', 'iceberg'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://jvsmithcompanies.com', notes: '15,000+ acres across Yuma and Gila Valley; 15+ winter vegetable varieties' },

  // ── Florida ────────────────────────────────────────────────────────────
  { companyName: 'Lipman Family Farms', city: 'Immokalee', state: 'FL', commodities: ['tomatoes', 'cucumbers', 'squash', 'peppers'], organic: true, size: 'huge', type: 'grower-shipper', website: 'https://www.lipmanfamilyfarms.com', notes: "North America's largest field tomato grower and distributor; Grown True organic line" },
  { companyName: 'Duda Farm Fresh Foods', city: 'Oviedo', state: 'FL', commodities: ['celery', 'radishes', 'corn', 'lettuce'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://www.dudafresh.com', notes: 'Family-owned since 1926; grows ~33% of all US celery; operations in FL, CA, AZ' },
  { companyName: 'West Coast Tomato', city: 'Immokalee', state: 'FL', commodities: ['tomatoes'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://www.westcoasttomato.com', notes: 'Florida tomato grower-shipper; serves retail, wholesale, and foodservice' },
  { companyName: 'Florida Classic Growers', city: 'Lake Wales', state: 'FL', commodities: ['blueberries', 'citrus', 'peaches'], organic: false, size: 'medium', type: 'grower-shipper', website: 'https://flclassic.com', notes: 'In business since 1924; Florida blueberries, citrus, and peaches for wholesale buyers' },
  { companyName: 'IMG Citrus', city: 'Vero Beach', state: 'FL', commodities: ['oranges', 'grapefruit'], organic: false, size: 'large', type: 'grower-shipper', website: 'https://imgcitrus.com', notes: 'Farms 11,000+ acres of Florida citrus; major fresh citrus grower and shipper' },
  { companyName: 'Muzzarelli Farms', city: 'Plant City', state: 'FL', commodities: ['sweet potatoes', 'peppers', 'tomatoes', 'greens'], organic: false, size: 'small', type: 'grower-shipper', website: 'https://www.muzzarellifarms.com', notes: 'Florida fresh produce wholesaler; farm-to-fork grower, packer, and shipper' },

  // ── Other CA ──────────────────────────────────────────────────────────
  { companyName: 'Capay Organic', city: 'Esparto', state: 'CA', commodities: ['mixed organic vegetables', 'stone fruit'], organic: true, size: 'small', type: 'grower-shipper', website: 'https://www.capayorganic.com', notes: 'Long-standing certified organic family farm in the Capay Valley' },
]

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethunt'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const col = db.collection('directoryPipeline')

    const existing = await col.countDocuments()
    if (existing > 0) {
      console.log(`⚠️  Collection already has ${existing} entries. Skipping to avoid duplicates.`)
      console.log('   Delete the collection first if you want to re-seed.')
      return
    }

    const docs = companies.map(c => ({
      companyName: c.companyName,
      location: {
        city: c.city,
        state: c.state,
        full: `${c.city}, ${c.state}`,
      },
      commodities: c.commodities,
      organic: c.organic,
      size: c.size,
      type: c.type,
      website: c.website,
      notes: c.notes,
      status: 'pending',
      outreachSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const result = await col.insertMany(docs)
    console.log(`✅ Inserted ${result.insertedCount} pipeline entries`)
  } finally {
    await client.close()
  }
}

main().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
