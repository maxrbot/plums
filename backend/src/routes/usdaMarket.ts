import { FastifyPluginAsync } from 'fastify'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
import database from '../config/database'
import { authenticate } from '../middleware/auth'

const REPORT_BASE = 'https://www.ams.usda.gov/mnreports'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

// All terminal markets USDA publishes daily. Fruit=_fv010, Veg=_fv020, Roots=_fv030
const TERMINAL_MARKETS = [
  { city: 'Los Angeles',  fruit: 'hc_fv010', veg: 'hc_fv020', roots: 'hc_fv030' },
  { city: 'New York',     fruit: 'nx_fv010', veg: 'nx_fv020', roots: 'nx_fv030' },
  { city: 'Chicago',      fruit: 'hx_fv010', veg: 'hx_fv020', roots: 'hx_fv030' },
  { city: 'Atlanta',      fruit: 'aj_fv010', veg: 'aj_fv020', roots: 'aj_fv030' },
  { city: 'Philadelphia', fruit: 'na_fv010', veg: 'na_fv020', roots: 'na_fv030' },
  { city: 'Boston',       fruit: 'bh_fv010', veg: 'bh_fv020', roots: 'bh_fv030' },
  { city: 'Baltimore',    fruit: 'bp_fv010', veg: 'bp_fv020', roots: 'bp_fv030' },
  { city: 'Detroit',      fruit: 'du_fv010', veg: 'du_fv020', roots: 'du_fv030' },
  { city: 'Miami',        fruit: 'mh_fv010', veg: 'mh_fv020', roots: 'mh_fv030' },
]

// USDA only publishes shipping point reports for these origin hubs.
// The Phoenix reports (ix_*) aggregate sub-sections for Salinas/Watsonville CA,
// Nogales AZ (Mexico imports), Imperial/Coachella Valley, and the Texas Rio Grande
// Valley — so broccoli/cauliflower/kale/cucumber/citrus from those regions all
// appear under Phoenix.
const SHIPPING_POINTS = [
  { city: 'Fresno, CA (Shipping Point)',   fruit: 'fr_fv110', veg: 'fr_fv120' },
  { city: 'Phoenix, AZ (Shipping Point)',  fruit: 'ix_fv110', veg: 'ix_fv120' },
  { city: 'Orlando, FL (Shipping Point)',  fruit: 'or_fv110', veg: 'or_fv120' },
  { city: 'Miami, FL (Shipping Point)',    fruit: 'mh_fv111', veg: 'mh_fv121' },
  { city: 'Yakima, WA (Shipping Point)',   fruit: 'ya_fv110', veg: null },
]

const ROOT_COMMODITIES = ['onion', 'potato', 'garlic', 'shallot', 'yam']
const FRUIT_COMMODITIES = [
  'apple', 'banana', 'berry', 'strawberr', 'blueberr', 'raspberr', 'blackberr',
  'grape', 'orange', 'lemon', 'lime', 'grapefruit', 'clementine', 'tangerine',
  'nectarine', 'peach', 'plum', 'apricot', 'cherry', 'mango', 'papaya',
  'pineapple', 'watermelon', 'cantaloupe', 'honeydew', 'melon', 'kiwi',
  'avocado', 'fig', 'pomegranate', 'lychee', 'coconut', 'passion fruit',
  'dragon fruit', 'guava', 'pear', 'persimmon',
]

function commodityReportType(commodity: string): 'fruit' | 'veg' | 'roots' {
  const c = commodity.toLowerCase()
  if (ROOT_COMMODITIES.some(r => c.includes(r))) return 'roots'
  if (FRUIT_COMMODITIES.some(f => c.includes(f))) return 'fruit'
  return 'veg'
}

// Fetch the PDF and extract its text content using pdf-parse.
// USDA moved all daily reports to PDF — the .txt URLs are frozen at 2024 snapshots.
async function fetchReportText(fileName: string): Promise<string | null> {
  try {
    const res = await fetch(`${REPORT_BASE}/${fileName}.pdf`, {
      headers: { 'User-Agent': 'AcreList/1.0 (agricultural market research)' },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const data = await pdfParse(Buffer.from(buffer))
    return data.text || null
  } catch {
    return null
  }
}

export interface PriceEntry {
  description: string
  low: number
  high: number
  mostlyLow: number | null
  mostlyHigh: number | null
}

export interface MarketResult {
  city: string
  reportType: 'terminal' | 'shipping_point'
  reportDate: string | null
  entries: PriceEntry[]
}

// Whether sectionName matches needle (commodity being searched)
function isSectionMatch(sectionName: string, needle: string): boolean {
  if (sectionName === needle) return true
  if (sectionName.includes(needle) || needle.includes(sectionName)) return true
  return false
}

function significantWords(s: string): string[] {
  return s.split(/\s+/).filter(w => w.length > 3)
}

// Find the commodity's section in the report text and return it.
// Handles both the legacy TXT format (---COMMODITY: content) and the
// current PDF format (COMMODITY: content, all-caps header at line start).
function findSection(text: string, commodity: string): string | null {
  const needle = commodity.toUpperCase()
  let best: string | null = null

  // --- Strategy 1: legacy TXT format with "---" prefix ---
  if (text.includes('---')) {
    const parts = text.split(/(?=---[A-Z])/)
    for (const part of parts) {
      if (!part.startsWith('---')) continue
      const colonIdx = part.indexOf(':')
      if (colonIdx === -1) continue
      const name = part.slice(3, colonIdx).trim().toUpperCase()
      if (isSectionMatch(name, needle)) return part
      if (!best && significantWords(needle).some(w => name.includes(w))) best = part
    }
    if (best) return best
  }

  // --- Strategy 2: PDF format — all-caps commodity name followed by colon ---
  // Sections look like "AVOCADOS: MARKET STEADY. California Hass..." at line start.
  // We split on boundaries where a new all-caps header begins.
  const pdfSectionRe = /(?:^|\n)([A-Z][A-Z &\/'-]{2,40}):\s/g
  const sectionBoundaries: Array<{ name: string; start: number }> = []
  let m: RegExpExecArray | null
  while ((m = pdfSectionRe.exec(text)) !== null) {
    const name = (m[1] ?? '').trim()
    // Filter out common in-paragraph caps phrases that aren't commodity names
    if (/^(MARKET|PRICES|U\.?S\.?|TRADING|SUPPLY|DEMAND|QUALITY|GRADE|NOTE|COMPARED)/.test(name)) continue
    sectionBoundaries.push({ name, start: m.index })
  }

  for (let i = 0; i < sectionBoundaries.length; i++) {
    const boundary = sectionBoundaries[i]!
    const { name, start } = boundary
    const end = sectionBoundaries[i + 1]?.start ?? text.length
    const content = text.slice(start, end)
    if (isSectionMatch(name.toUpperCase(), needle)) return content
    if (!best && significantWords(needle).some(w => name.toUpperCase().includes(w))) best = content
  }

  return best
}

function parseCommoditySection(text: string, commodity: string): PriceEntry[] {
  const section = findSection(text, commodity)
  if (!section) return []

  // Collapse all whitespace/newlines to single spaces for regex scanning
  const collapsed = section.split('\n').map(l => l.trimEnd()).join(' ')

  const priceRegex = /(\d+\.\d+)-(\d+\.\d+)(?:\s+mostly\s+(\d+\.\d+)-(\d+\.\d+))?/g
  const entries: PriceEntry[] = []
  let pm: RegExpExecArray | null
  let prevEnd = 0

  while ((pm = priceRegex.exec(collapsed)) !== null) {
    const low = parseFloat(pm[1] ?? '0')
    const high = parseFloat(pm[2] ?? '0')
    if (low <= 0 || high <= 0 || high < low) continue

    // Use text from end of previous price match to start of this one.
    // This prevents adjacent price values from bleeding into the description.
    const desc = collapsed.slice(prevEnd, pm.index).replace(/\s+/g, ' ').trim()
    prevEnd = pm.index + pm[0].length

    entries.push({
      description: desc,
      low,
      high,
      mostlyLow: pm[3] != null ? parseFloat(pm[3]) : null,
      mostlyHigh: pm[4] != null ? parseFloat(pm[4]) : null,
    })
  }

  // Deduplicate on low-high pair
  const seen = new Set<string>()
  return entries.filter(e => {
    const key = `${e.low}-${e.high}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 8)
}

function extractReportDate(text: string): string | null {
  const m = text.match(/(?:as of|prices as of)\s+([A-Z0-9-]+)/i)
    || text.match(/(\d{1,2}[- ][A-Z]{3}[- ]\d{4})/i)
    || text.match(/([A-Z]{3,}\s+\d{1,2},?\s+\d{4})/i)
  if (!m || !m[1]) return null
  try { return new Date(m[1]).toISOString() } catch { return m[1] ?? null }
}

async function fetchMarketPrices(commodity: string): Promise<MarketResult[]> {
  const reportType = commodityReportType(commodity)

  const terminalFetches = TERMINAL_MARKETS.map(async market => {
    const fileName = market[reportType]
    const text = await fetchReportText(fileName)
    if (!text) return null
    const entries = parseCommoditySection(text, commodity)
    if (!entries.length) return null
    return {
      city: market.city,
      reportType: 'terminal' as const,
      reportDate: extractReportDate(text),
      entries,
    }
  })

  const shippingFetches = SHIPPING_POINTS.map(async sp => {
    const fileName = reportType === 'veg' ? sp.veg : sp.fruit
    if (!fileName) return null
    const text = await fetchReportText(fileName)
    if (!text) return null
    const entries = parseCommoditySection(text, commodity)
    if (!entries.length) return null
    return {
      city: sp.city,
      reportType: 'shipping_point' as const,
      reportDate: extractReportDate(text),
      entries,
    }
  })

  const all = await Promise.all([...terminalFetches, ...shippingFetches])
  return all.filter((r): r is MarketResult => r !== null)
}

const usdaMarketRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  fastify.get('/usda-market', async (request, reply) => {
    const { commodity } = request.query as { commodity?: string }
    if (!commodity) return reply.status(400).send({ error: 'commodity query param required' })

    const key = commodity.toLowerCase().trim()
    const col = database.getDb().collection('usdaMarket')

    const cached = await col.findOne({ key })
    if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
      return { markets: cached.markets, fetchedAt: cached.fetchedAt, commodity, fromCache: true }
    }

    try {
      const markets = await fetchMarketPrices(commodity)
      const fetchedAt = new Date().toISOString()
      await col.updateOne({ key }, { $set: { key, markets, fetchedAt } }, { upsert: true })
      return { markets, fetchedAt, commodity, fromCache: false }
    } catch (err: any) {
      if (cached) {
        return { markets: cached.markets, fetchedAt: cached.fetchedAt, commodity, fromCache: true, stale: true }
      }
      return reply.status(502).send({ error: 'Failed to fetch USDA data', details: err.message })
    }
  })

  fastify.post('/usda-market/refresh', async (request, reply) => {
    const { commodity } = request.body as { commodity?: string }
    if (!commodity) return reply.status(400).send({ error: 'commodity required' })
    await database.getDb().collection('usdaMarket').deleteOne({ key: commodity.toLowerCase().trim() })
    return { ok: true }
  })
}

export default usdaMarketRoutes
