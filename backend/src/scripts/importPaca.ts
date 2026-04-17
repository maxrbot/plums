/**
 * USDA PACA Licensee importer
 *
 * Parses a PACA licensee CSV and imports produce businesses into directoryPipeline.
 *
 * DATA SOURCE:
 *   PACA has no public API or bulk download. Request the licensee list from USDA:
 *   National License Center: (800) 495-7222
 *   Or check: https://www.ams.usda.gov/rules-regulations/paca
 *
 *   The AMS data catalog lists it as a dataset:
 *   https://catalog.data.gov/dataset/perishable-agricultural-commodities-act-search-engine
 *
 *   Once you have the CSV/Excel export, save it locally and pass via --file.
 *   Expected columns: License Number, Business Name, City, State, Zip, License Type, Status
 *
 * USAGE:
 *   npx tsx src/scripts/importPaca.ts --file ./data/paca_licensees.csv
 *   npx tsx src/scripts/importPaca.ts --file ./data/paca_licensees.csv --state CA --limit 200
 *
 * FLAGS:
 *   --file <path>   Path to PACA CSV (required)
 *   --state <abbr>  Filter by state, e.g. CA, WA, FL
 *   --limit <n>     Max new records to import (default: 200)
 *   --dry-run       Parse and report without writing to DB
 *
 * NOTE:
 *   PACA records have no commodity data — commodities will be empty until
 *   the per-entry website scrape (Phase 2) runs. These entries will appear
 *   in the pipeline as pending with a completeness warning until enriched.
 */

import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { MongoClient } from 'mongodb'

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  return {
    file:   get('--file'),
    state:  get('--state')?.toUpperCase(),
    limit:  parseInt(get('--limit') || '200', 10),
    dryRun: args.includes('--dry-run'),
  }
}

function col(row: Record<string, string>, ...names: string[]): string {
  for (const n of names) {
    const val = row[n] ?? row[n.toLowerCase()] ?? row[n.toUpperCase()]
    if (val !== undefined) return val.trim()
  }
  return ''
}

async function main() {
  const opts = parseArgs()

  if (!opts.file) {
    console.error('❌ --file is required.')
    console.error('   PACA has no public API — request the licensee list from USDA at (800) 495-7222')
    console.error('   Usage: npx tsx src/scripts/importPaca.ts --file ./data/paca.csv --state CA')
    process.exit(1)
  }

  const filePath = path.resolve(opts.file)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`📂 Parsing ${filePath}`)
  console.log(`   Filters: state=${opts.state || 'all'} limit=${opts.limit}`)
  if (opts.dryRun) console.log('   DRY RUN — no DB writes')

  const raw = fs.readFileSync(filePath, 'utf-8')
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  console.log(`   Total rows in CSV: ${records.length}`)

  // Filter: active licenses, shippers/grower-shippers (not brokers/dealers)
  let filtered = records.filter(row => {
    const status = col(row, 'Status', 'License Status').toLowerCase()
    if (!status.includes('active') && !status.includes('licensed')) return false

    // Prefer growers, shippers, grower-shippers over brokers/dealers
    const type = col(row, 'License Type', 'Type', 'LicenseType').toLowerCase()
    if (type.includes('broker') || type.includes('dealer only')) return false

    if (opts.state) {
      const state = col(row, 'State', 'Mailing State', 'MailingState')
      if (state.toUpperCase() !== opts.state) return false
    }

    return true
  })

  console.log(`   After filters: ${filtered.length} matching records`)

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  // Dedup by PACA license number
  const existingLicenses = new Set<string>()
  const existing = await db.collection('directoryPipeline')
    .find({ 'dataSources.paca.licenseNumber': { $exists: true } })
    .project({ 'dataSources.paca.licenseNumber': 1 })
    .toArray()
  existing.forEach(e => {
    const lic = e.dataSources?.paca?.licenseNumber
    if (lic) existingLicenses.add(lic)
  })

  console.log(`   Already in pipeline: ${existingLicenses.size} PACA entries (will skip)`)

  let inserted = 0
  let skipped = 0

  for (const row of filtered) {
    if (inserted >= opts.limit) break

    const licenseNumber = col(row, 'License Number', 'LicenseNumber', 'PACA License', 'license_number')
    const companyName   = col(row, 'Business Name', 'Company', 'Name', 'company_name')

    if (!companyName) { skipped++; continue }
    if (licenseNumber && existingLicenses.has(licenseNumber)) { skipped++; continue }

    const city    = col(row, 'City', 'Mailing City', 'MailingCity')
    const state   = col(row, 'State', 'Mailing State', 'MailingState')
    const zip     = col(row, 'Zip', 'Mailing Zip', 'MailingZip', 'Zipcode')
    const phone   = col(row, 'Phone', 'PhoneNumber')
    const type    = col(row, 'License Type', 'Type', 'LicenseType').toLowerCase()

    const supplierType = type.includes('grower') && type.includes('ship') ? 'grower-shipper'
      : type.includes('grower') ? 'grower'
      : type.includes('ship') ? 'shipper'
      : 'distributor'

    const entry = {
      companyName,
      location: {
        city,
        state,
        zip,
        full: [city, state].filter(Boolean).join(', '),
      },
      commodities: [], // Empty until website scrape (Phase 2)
      organic: null,
      type: supplierType,
      phone: phone || undefined,
      status: 'pending',
      importSource: 'usda-paca',
      dataSources: {
        paca: {
          verified: true,
          score: 5,
          licenseNumber: licenseNumber || undefined,
        },
      },
      certifications: [],
      notes: `PACA license: ${licenseNumber || 'unknown'}`,
      outreachSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (opts.dryRun) {
      console.log(`  [dry] ${companyName} — ${city}, ${state} — ${supplierType}`)
      inserted++
      continue
    }

    await db.collection('directoryPipeline').insertOne(entry)
    if (licenseNumber) existingLicenses.add(licenseNumber)
    inserted++

    if (inserted % 20 === 0) process.stdout.write(`\r   Inserted ${inserted}...`)
  }

  await client.close()

  console.log(`\n\n✅ Import complete`)
  console.log(`   Inserted:  ${inserted}`)
  console.log(`   Skipped:   ${skipped}`)
  console.log(`\n   ⚠️  PACA entries have no commodity data — run the website scraper (Phase 2) to enrich them.`)
  console.log(`   Entries missing website URLs will show a completeness warning in the pipeline table.`)
}

main().catch(err => {
  console.error('❌ Import failed:', err.message)
  process.exit(1)
})
