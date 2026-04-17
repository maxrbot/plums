# ProduceHunt — Product Ideas & Future Improvements

---

## Bluebook Comparison — What We Have vs. What They Have

**Bluebook's company search parameters:**
- Company name, listing status, phone ✓ (we have this)
- Blue Book Score / Pay or Credit Worth Rating ✗ (their moat — 125 years of trade credit data)
- Country, state/province, postal code, distance ✓ (we have state; could add distance/radius)
- Commodities ✓ (we have this, and variety-level search is better than theirs)
- Classifications / Business function ✓ (our `operationScale` field directly answers this)
- Volume, Licenses, Certifications, Brands ✓ (`certifiedAcres` is volume proxy, PACA/USDA certs)
- Custom filters (watchdog, user lists) ✗ (future feature)

**What Bluebook has that we don't:**
- Credit/payment ratings (not replicable without 125 years of trade data)
- "Know Your Commodity" editorial content per commodity — paywalled guides on origins, varieties, seasonality, cultivation, storage, pests, transportation
- Market price + volume movement visualizations (but USDA AMS API is free and we have it in AcreList already)

**What we have that Bluebook doesn't:**
- Live pricing directly from sellers (Tier 1) — Bluebook shows USDA averages, not actual offers
- Variety-level search — they filter by commodity only; we search by variety name
- Organic-specific supplier search and badges
- `operationScale` classification backed by real USDA certified acreage data
- Scraped brand stories and farm context
- Direct outreach path from search result to supplier
- A supplier journey — from unclaimed directory listing → claim → live pricing. Bluebook is static.

---

## Search & Discovery Improvements

- **Advanced search filters** — operationScale (packer-shipper / commercial / small farm / direct market), state, organic-only toggle, certifications (PACA, GFSI, USDA Organic), acreage range, "has live pricing." Our `operationScale` field is now data-backed from USDA certified acres — this is a direct, better answer to Bluebook's "Classifications/Business function" filter.

- **"Is this FOB or delivered?" context** — Bluebook separates shipping point from terminal market pricing. We should surface this distinction on supplier profiles and Tier 1 pricing cards. Important context for buyers evaluating FOB vs. delivered offers.

- **Variety-level search improvements** — already better than Bluebook. Continue expanding variety name mapping (e.g. "pumpkin" → Winter Squash, "heirloom" → search within tomato varieties).

- **Buyer intent signals** — surface operationScale on search results so a Sysco-level buyer can immediately filter to packer-shippers, while a farm-to-table restaurant chef can filter to small farms and direct-market operations.

---

## Commodity Pages

- **`/commodity/[slug]` pages** — e.g. `/commodity/broccoli`, `/commodity/strawberry`. Each page shows:
  - USDA AMS current market price + simple price trend chart (free API we already use in AcreList)
  - Top suppliers in ProduceHunt directory for that commodity, with tier badges
  - Seasonal availability window
  - Key varieties
  - Brief "know your commodity" content (origins, what to look for, typical packaging)
  - This drives SEO and gives buyers market context. Bluebook's "Know Your Commodity" is this but paywalled — ours would be free and directly linked to live suppliers.

- **Market price badge on search results** — next to each supplier card: "Market avg · $33.51/carton" from USDA AMS. Buyers immediately have price context without leaving the page.

---

## Supplier Profile Improvements

- **Operation scale badge on profile** — show "Commercial Farm · 129 acres" or "Packer/Shipper" prominently on the supplier profile page, not just in the admin directory.

- **Market price context on profile** — "Current market avg for Broccoli: $33.51/carton (USDA AMS, FOB Salinas)" shown on a supplier's profile when they grow that commodity. Helps buyers calibrate before reaching out.

- **Seasonality chart** — visual availability calendar per commodity on the profile. Burns Blossom Farm has scraped availability data per variety — surface that.

---

## Trust & Verification

- **Expand verification score signals** — currently: PACA, GFSI, established, USDA Organic, DRC, website, ProduceHunt member. Could add: `certifiedAcres` above threshold, grower group membership, co-op affiliation.

- **CSA flag context** — if `operationFlags.csa = true`, show a badge like "Also sells direct / CSA" on the profile. Lets buyers understand this supplier may have minimum order or local-only constraints.

---

## Buyer-Side Features

- **Saved searches / watchlists** — let buyers save a search query (e.g. "organic strawberries, CA") and get notified when new suppliers are added or existing ones add live pricing. Analog to Bluebook's "watchdog" feature.

- **Request for quote flow** — buyers can already submit order requests (Tier 1). Extend this to Tier 3 unclaimed suppliers as a lead gen mechanic: buyer submits inquiry, we capture it and use it to prompt that supplier to claim their listing.

- **Buyer profile / company page** — right now only suppliers have profiles. A buyer profile (company name, what they buy, volume, location) would let suppliers see who's looking at them and create a two-sided marketplace dynamic.

---

## Content & SEO

- **State landing pages** — `/suppliers/california`, `/suppliers/arizona`, etc. Lists all suppliers in that state by commodity. Drives long-tail SEO for queries like "organic strawberry suppliers California."

- **Commodity + state pages** — `/commodity/broccoli/california`. High-value for buyers who search regionally.
