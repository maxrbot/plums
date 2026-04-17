/**
 * USDA Organic Integrity importer
 *
 * Downloads or parses the USDA Organic Integrity CSV and imports
 * certified organic CROP operations into directoryPipeline.
 *
 * DATA SOURCE:
 *   Download the latest CSV from:
 *   https://organic.ams.usda.gov/integrity/Reports  (Monthly Certified Operation List)
 *   Or the Figshare archive:
 *   https://agdatacommons.nal.usda.gov/articles/dataset/The_Organic_INTEGRITY_Database/24661722
 *
 *   Save the file locally and pass it via --file flag.
 *
 * USAGE:
 *   npx tsx src/scripts/importOrganic.ts --file ./data/organic_certifiers.csv
 *   npx tsx src/scripts/importOrganic.ts --file ./data/organic_certifiers.csv --state CA
 *   npx tsx src/scripts/importOrganic.ts --file ./data/organic_certifiers.csv --state CA --commodity citrus --limit 100
 *
 * FLAGS:
 *   --file <path>       Path to the USDA Organic Integrity CSV (required)
 *   --state <abbr>      Filter by state abbreviation, e.g. CA, WA, FL (optional)
 *   --commodity <name>  Filter by commodity keyword, e.g. citrus, apple, berry (optional)
 *   --limit <n>         Max new records to import per run (default: 100)
 *   --dry-run           Parse and report without writing to DB
 */

import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { MongoClient } from 'mongodb'

// ── Commodity keyword → canonical names map ──────────────────────────────────
// Maps USDA item strings to our canonical commodity names
const COMMODITY_KEYWORDS: Record<string, string[]> = {
  // Citrus
  lemon:       ['Lemon'],
  lime:        ['Lime'],
  orange:      ['Orange'],
  grapefruit:  ['Grapefruit'],
  tangerine:   ['Tangerine'],
  clementine:  ['Clementine'],
  mandarin:    ['Mandarin'],
  citrus:      ['Lemon', 'Lime', 'Orange', 'Grapefruit'],
  // Berries
  strawberr:   ['Strawberry'],
  blueberr:    ['Blueberry'],
  raspberr:    ['Raspberry'],
  blackberr:   ['Blackberry'],
  cranberr:    ['Cranberry'],
  // Stone fruit
  peach:       ['Peach'],
  nectarine:   ['Nectarine'],
  plum:        ['Plum'],
  cherr:       ['Cherry'],
  apricot:     ['Apricot'],
  // Pome fruit
  apple:       ['Apple'],
  pear:        ['Pear'],
  // Leafy greens
  lettuce:     ['Lettuce'],
  spinach:     ['Spinach'],
  kale:        ['Kale'],
  arugula:     ['Arugula'],
  chard:       ['Chard'],
  // Vegetables
  tomato:      ['Tomato'],
  pepper:      ['Bell Pepper'],
  carrot:      ['Carrot'],
  broccoli:    ['Broccoli'],
  cauliflower: ['Cauliflower'],
  celery:      ['Celery'],
  cucumber:    ['Cucumber'],
  zucchini:    ['Zucchini'],
  squash:      ['Squash'],
  onion:       ['Onion'],
  garlic:      ['Garlic'],
  potato:      ['Potato'],
  corn:        ['Corn'],
  asparagus:   ['Asparagus'],
  artichoke:   ['Artichoke'],
  // Tropical / misc
  avocado:     ['Avocado'],
  grape:       ['Grape'],
  mango:       ['Mango'],
  pineapple:   ['Pineapple'],
  watermelon:  ['Watermelon'],
  cantaloupe:  ['Cantaloupe'],
  mushroom:    ['Mushroom'],
}

const STATE_ABBR: Record<string, string> = {
  CA: 'CALIFORNIA', WA: 'WASHINGTON', OR: 'OREGON', FL: 'FLORIDA', NY: 'NEW YORK',
  TX: 'TEXAS', MI: 'MICHIGAN', PA: 'PENNSYLVANIA', MN: 'MINNESOTA', WI: 'WISCONSIN',
  CO: 'COLORADO', AZ: 'ARIZONA', NC: 'NORTH CAROLINA', GA: 'GEORGIA', OH: 'OHIO',
  ID: 'IDAHO', MT: 'MONTANA', NM: 'NEW MEXICO', VT: 'VERMONT', ME: 'MAINE',
  MA: 'MASSACHUSETTS', CT: 'CONNECTICUT', NJ: 'NEW JERSEY', VA: 'VIRGINIA',
  MD: 'MARYLAND', IA: 'IOWA', MO: 'MISSOURI', KS: 'KANSAS', NE: 'NEBRASKA',
  ND: 'NORTH DAKOTA', SD: 'SOUTH DAKOTA', WY: 'WYOMING', UT: 'UTAH', NV: 'NEVADA',
  HI: 'HAWAII', AK: 'ALASKA', AL: 'ALABAMA', AR: 'ARKANSAS', IL: 'ILLINOIS',
  IN: 'INDIANA', KY: 'KENTUCKY', LA: 'LOUISIANA', MS: 'MISSISSIPPI',
  NH: 'NEW HAMPSHIRE', RI: 'RHODE ISLAND', SC: 'SOUTH CAROLINA', TN: 'TENNESSEE',
  WV: 'WEST VIRGINIA', DE: 'DELAWARE', OK: 'OKLAHOMA',
}

function extractCommodities(itemsField: string): string[] {
  if (!itemsField) return []
  const lower = itemsField.toLowerCase()
  const found = new Set<string>()
  for (const [keyword, canonicals] of Object.entries(COMMODITY_KEYWORDS)) {
    if (lower.includes(keyword)) canonicals.forEach(c => found.add(c))
  }
  return [...found]
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  return {
    file:      get('--file'),
    state:     get('--state')?.toUpperCase(),
    commodity: get('--commodity')?.toLowerCase(),
    limit:     parseInt(get('--limit') || '100', 10),
    dryRun:    args.includes('--dry-run'),
  }
}

async function main() {
  const opts = parseArgs()

  if (!opts.file) {
    console.error('❌ --file is required. Download the CSV from https://organic.ams.usda.gov/integrity/Reports')
    console.error('   Usage: npx tsx src/scripts/importOrganic.ts --file ./data/organic.csv --state CA --limit 100')
    process.exit(1)
  }

  const filePath = path.resolve(opts.file)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`📂 Parsing ${filePath}`)
  console.log(`   Filters: state=${opts.state || 'all'} commodity=${opts.commodity || 'all'} limit=${opts.limit}`)
  if (opts.dryRun) console.log('   DRY RUN — no DB writes')

  // ── Parse CSV ──────────────────────────────────────────────────────────────
  const raw = fs.readFileSync(filePath, 'utf-8')
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  console.log(`   Total rows in CSV: ${records.length}`)

  // ── Filter ─────────────────────────────────────────────────────────────────
  // USDA CSV column names vary slightly by download version — handle both
  const col = (row: Record<string, string>, ...names: string[]) => {
    for (const n of names) {
      const val = row[n] ?? row[n.toLowerCase()] ?? row[n.toUpperCase()]
      if (val !== undefined) return val.trim()
    }
    return ''
  }

  let filtered = records.filter(row => {
    // Only include rows where CROPS scope is certified
    const cropsStatus = col(row, 'CROPS Scope Certification Status').toLowerCase()
    if (!cropsStatus.includes('certified') && !cropsStatus.includes('active')) return false

    // Overall operation status must be active/certified
    const status = col(row, 'Operation Certification Status', 'Status').toLowerCase()
    if (!status.includes('certified') && !status.includes('active')) return false

    // State filter — CSV uses full state names ("California") not abbreviations ("CA")
    if (opts.state) {
      const state = col(row, 'Physical Address: State/Province', 'State', 'Mailing Address: State/Province')
      const stateUpper = state.toUpperCase()
      if (stateUpper !== opts.state && stateUpper !== STATE_ABBR[opts.state]) return false
    }

    // Must have a website — required for Phase 2 scraping and signals commercial intent
    const website = col(row, 'Website URL', 'Web Site', 'Website')
    if (!website) return false

    // Commodity filter
    if (opts.commodity) {
      const items = col(row, 'Certified Products Under CROPS Scope', 'Additional Certified Products Under CROPS Scope', 'Items').toLowerCase()
      if (!items.includes(opts.commodity)) return false
    }

    return true
  })

  console.log(`   After filters: ${filtered.length} matching records`)

  // ── Connect to DB ──────────────────────────────────────────────────────────
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  // Load existing certificate numbers for deduplication
  const existingCerts = new Set<string>()
  const existing = await db.collection('directoryPipeline')
    .find({ 'dataSources.usdaOrganic.certificateNumber': { $exists: true } })
    .project({ 'dataSources.usdaOrganic.certificateNumber': 1 })
    .toArray()
  existing.forEach(e => {
    const cert = e.dataSources?.usdaOrganic?.certificateNumber
    if (cert) existingCerts.add(cert)
  })

  console.log(`   Already in pipeline: ${existingCerts.size} organic entries (will skip)`)

  // ── Build pipeline entries ─────────────────────────────────────────────────
  let inserted = 0
  let skipped = 0
  let noProducts = 0

  for (const row of filtered) {
    if (inserted >= opts.limit) break

    const certNumber = col(row, 'Certificate Numbers for Certified Products under CROPS Scope', 'Certificate', 'Certificate Number')
    const rawName = col(row, 'Operation Name', 'Business Name', 'Name')

    // Extract DBA name if present ("XYZ Holdings LLC dba Sunny Farm" → "Sunny Farm")
    const dbaMatch = rawName.match(/\bdba\s+(.+)$/i)
    const companyName = dbaMatch ? dbaMatch[1].trim() : rawName

    if (!companyName) { skipped++; continue }

    // Dedup by certificate number
    if (certNumber && existingCerts.has(certNumber)) { skipped++; continue }

    const city      = col(row, 'Physical Address: City', 'City')
    const state     = col(row, 'Physical Address: State/Province', 'State')
    const zip       = col(row, 'Physical Address: ZIP/ Postal Code', 'Zip', 'Zipcode')
    const certifier = col(row, 'Certifier Name', 'Certifying Agent')
    const website   = col(row, 'Website URL', 'Web Site', 'Website')
    const phone     = col(row, 'Phone')
    const items     = col(row, 'Certified Products Under CROPS Scope', 'Additional Certified Products Under CROPS Scope', 'Items')

    const commodities = extractCommodities(items)

    if (commodities.length === 0) { noProducts++; skipped++; continue }

    const entry = {
      companyName,
      location: {
        city,
        state,
        zip,
        full: [city, state].filter(Boolean).join(', '),
      },
      commodities,
      organic: true,
      website: website || undefined,
      phone: phone || undefined,
      status: 'pending',
      importSource: 'usda-organic',
      dataSources: {
        usdaOrganic: {
          verified: true,
          score: 5,
          certifier: certifier || undefined,
          certificateNumber: certNumber || undefined,
          items,
        },
      },
      certifications: ['USDA Organic'],
      notes: certifier ? `Certified by ${certifier}` : undefined,
      outreachSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (opts.dryRun) {
      console.log(`  [dry] ${companyName} — ${city}, ${state} — ${commodities.join(', ')}`)
      inserted++
      continue
    }

    await db.collection('directoryPipeline').insertOne(entry)
    if (certNumber) existingCerts.add(certNumber)
    inserted++

    if (inserted % 10 === 0) process.stdout.write(`\r   Inserted ${inserted}...`)
  }

  await client.close()

  console.log(`\n\n✅ Import complete`)
  console.log(`   Inserted:  ${inserted}`)
  console.log(`   Skipped:   ${skipped} (${existingCerts.size} already existed, ${noProducts} had no mapped commodities)`)
  console.log(`   Run again with --offset to pull more, or change --state/--commodity to expand coverage.`)
}

main().catch(err => {
  console.error('❌ Import failed:', err.message)
  process.exit(1)
})
