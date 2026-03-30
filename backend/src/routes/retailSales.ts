import { FastifyPluginAsync } from 'fastify'
import database from '../config/database'
import { authenticate } from '../middleware/auth'
import { COMMODITY_MAP, detectCommodity } from '../utils/produce'

const FLIPP_BASE = 'https://flyers-ng.flippback.com/api/flipp'
const CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000 // 2 days — weekly ads rotate mid-week

// Inclusion whitelist — only pull flyers from known grocery chains
const GROCERY_MERCHANTS = [
  'safeway', 'kroger', 'albertsons', 'publix', 'meijer', 'aldi', 'lidl',
  'winn-dixie', 'food lion', 'giant', 'stop & shop', 'hannaford', 'wegmans',
  'h-e-b', 'heb', 'market basket', 'stater bros', 'winco', 'ingles',
  'sprouts', 'natural grocers', 'fresh market',
  'vons', 'ralphs', 'lucky', 'nob hill', 'raley\'s', 'raleys', 'save mart',
  'foodmaxx', 'food maxx', 'foods co', 'smart & final', 'smart and final',
  'grocery outlet', 'cardenas', 'vallarta', 'el super', 'northgate',
  'andronico', 'berkeley bowl', 'nijiya',
  'giant eagle', 'harris teeter', 'price chopper', 'shoprite', 'acme',
  'jewel', 'osco', 'fry\'s', 'frys', 'king soopers', 'smith\'s', 'smiths',
  'dillons', 'pay less', 'quality food', 'fred meyer', 'qfc',
  'biggs', 'gerbes', 'owen\'s', 'jay c', 'bakers', 'food 4 less',
  'pick n save', 'copps', 'metro market', 'mariano\'s', 'marianos',
  'weis', 'tops', 'price rite', 'food bazaar', 'hy-vee', 'hyvee', 'fareway',
]

function isGroceryMerchant(merchant: string): boolean {
  const m = merchant.toLowerCase()
  return GROCERY_MERCHANTS.some(g => m.includes(g))
}


type UnitType = 'lb' | 'each' | 'oz' | 'bunch' | 'bag' | 'unknown'

function detectUnitType(name: string, priceText: string | null): UnitType {
  const text = `${name} ${priceText || ''}`.toLowerCase()
  if (/per\s*lb|\blb\.?\b|\bpound|\bby\s+the\s+pound/.test(text)) return 'lb'
  if (/\bbunch/.test(text)) return 'bunch'
  if (/\bbag/.test(text)) return 'bag'
  if (/\boz\.?\b|\bounce/.test(text)) return 'oz'
  if (/\beach\b|\bea\.?\b|\bper\s*each/.test(text)) return 'each'
  // Single fruits/vegetables with no size indicator are typically sold each
  if (/^(jumbo|large|medium|small|extra large|xl)?\s*(hass\s+)?avocado|^(jumbo|large|medium)?\s*artichoke|^(jumbo|large|medium)?\s*pineapple/i.test(name.trim())) return 'each'
  return 'unknown'
}

// Words that disqualify an item even if a produce keyword matches
const DISQUALIFIERS = [
  'juice', 'lemonade', 'cider', 'smoothie', 'shake', 'soda', 'drink',
  'tea', 'coffee', 'water', 'kombucha', 'beer', 'wine', 'spirits', 'hard ',
  'sparkling', 'energy', 'athletic brew', 'ruthless', 'immi', 'fanta', 'pepsi', 'coca',
  'sauce', 'dressing', 'salsa', 'jam', 'jelly', 'preserve', 'curd',
  'vinegar', 'oil', 'syrup', 'soup', 'broth', 'bowl', 'pudding',
  'chips', 'crisp', 'cracker', 'snack', 'candy', 'gummy', 'kettle corn',
  'tart', 'cake', 'pie', 'pastry', 'danish', 'muffin', 'cookie', 'brownie',
  'roll', 'bread', 'bun', 'slider', 'tortilla', 'strudel', 'granola',
  'pasta', 'noodle', 'ramen', 'fusilli',
  'chicken', 'beef', 'pork', 'bacon', 'ham', 'turkey', 'tuna', 'fish',
  'shrimp', 'salmon', 'sausage', 'hot dog', 'corn dog', 'corndog',
  'meat', 'skewer', 'entrée', 'entree', 'cornish hen', 'egg bite', 'egg patty',
  'cheese', 'yogurt', 'butter', 'cream', 'milk',
  'frozen', 'canned', 'pickled', 'dried', 'powder', 'hash',
  'tissue', 'towel', 'bath', 'soap', 'shampoo', 'lotion', 'vitamin', 'supplement',
  'whiskey', 'bourbon', 'tequila', 'vodka', 'rum', 'brandy', 'scotch',
  'fanta', 'tortilla', 'chili', 'tots', 'fries', 'pantyliner', 'tampax',
  'tampon', 'diaper', 'detergent', 'bleach', 'cleaner',
  'macaroni', 'ketchup', 'ketchu',
]

function isProduce(item: any): boolean {
  const raw = item.name || item.display_name || ''
  const name = raw.toLowerCase()
  const category = (item.category || item.categories || '').toLowerCase()

  if (raw.length > 80) return false
  if (DISQUALIFIERS.some(d => name.includes(d))) return false

  if (category.includes('produce') || category.includes('fruit') || category.includes('vegetable')) {
    return true
  }

  return COMMODITY_MAP.some(([re]) => re.test(name))
}

async function fetchFlippSales(postalCode: string): Promise<any[]> {
  const sid = Math.floor(Math.random() * 1e16).toString().padStart(16, '0')

  const flyersRes = await fetch(
    `${FLIPP_BASE}/data?locale=en&postal_code=${postalCode}&sid=${sid}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcreList/1.0)' } }
  )
  if (!flyersRes.ok) throw new Error(`Flipp flyers request failed: ${flyersRes.status}`)
  const flyersData = await flyersRes.json()

  const flyers = (flyersData.flyers || []).filter((f: any) =>
    isGroceryMerchant(f.merchant || f.name || '')
  )

  const allItems: any[] = []
  for (const flyer of flyers) {
    try {
      const itemsRes = await fetch(
        `${FLIPP_BASE}/flyers/${flyer.id}/flyer_items?locale=en&postal_code=${postalCode}&sid=${sid}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcreList/1.0)' } }
      )
      if (!itemsRes.ok) continue
      const items = await itemsRes.json()
      const retailer = (flyer.merchant || flyer.name || '').trim()

      for (const item of (Array.isArray(items) ? items : [])) {
        if (!isProduce(item)) continue
        const itemName = item.name || item.display_name || ''
        const priceText = item.price_text || item.unit || null
        allItems.push({
          retailer,
          name: itemName,
          price: item.current_price || item.price || null,
          originalPrice: item.pre_price || item.original_price || null,
          unit: priceText,
          commodity: detectCommodity(itemName),
          isOrganic: /\borganic\b/i.test(itemName),
          unitType: detectUnitType(itemName, priceText),
          validFrom: flyer.valid_from || item.valid_from || null,
          validTo: flyer.valid_to || item.valid_to || null,
        })
      }
    } catch {
      // skip individual flyer errors
    }
  }

  return allItems
}

const retailSalesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  fastify.get('/retail-sales', async (request, reply) => {
    const { zip } = request.query as { zip?: string }
    if (!zip) return reply.status(400).send({ error: 'zip query param required' })

    const db = database.getDb()
    const col = db.collection('retailSales')

    const cached = await col.findOne({ zip })
    if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
      return { items: cached.items, fetchedAt: cached.fetchedAt, zip, fromCache: true }
    }

    try {
      const items = await fetchFlippSales(zip)
      const fetchedAt = new Date().toISOString()
      await col.updateOne({ zip }, { $set: { zip, items, fetchedAt } }, { upsert: true })
      return { items, fetchedAt, zip, fromCache: false }
    } catch (err: any) {
      if (cached) return { items: cached.items, fetchedAt: cached.fetchedAt, zip, fromCache: true, stale: true }
      return reply.status(502).send({ error: 'Failed to fetch retail sales', details: err.message })
    }
  })

  fastify.post('/retail-sales/refresh', async (request, reply) => {
    const { zip } = request.body as { zip?: string }
    if (!zip) return reply.status(400).send({ error: 'zip required in body' })
    await database.getDb().collection('retailSales').deleteOne({ zip })
    return { ok: true, message: `Cache cleared for ${zip}` }
  })

  fastify.get('/retail-sales/merchants', async (request, reply) => {
    const { zip } = request.query as { zip?: string }
    if (!zip) return reply.status(400).send({ error: 'zip required' })
    const sid = Math.floor(Math.random() * 1e16).toString().padStart(16, '0')
    const res = await fetch(
      `${FLIPP_BASE}/data?locale=en&postal_code=${zip}&sid=${sid}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcreList/1.0)' } }
    )
    if (!res.ok) return reply.status(502).send({ error: `Flipp returned ${res.status}` })
    const data = await res.json()
    const merchants = (data.flyers || []).map((f: any) => ({
      id: f.id,
      merchant: f.merchant || f.name,
      valid_from: f.valid_from,
      valid_to: f.valid_to,
    }))
    return { merchants, total: merchants.length }
  })
}

export default retailSalesRoutes
