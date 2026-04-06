# ProduceHunt Search Tiers

ProduceHunt ranks supplier results in 4 tiers. Within each tier, results are sorted by verification score (descending). Organic-certified suppliers bubble up within their tier when the search includes "organic".

---

## Tier 1 — Live Pricing (AcreList Member)

**Who qualifies:** Suppliers who have claimed their listing AND have at least one price sheet marked as searchable with a matching product.

**What buyers see:**
- Company name + location
- Verification score bar
- Product name with pricing rows (packageType · size | $price/unit)
- Organic badge if applicable
- Shipping point / region name
- "Verified Member" badge

**How to achieve:** Claim your listing on ProduceHunt, then add live pricing by connecting your AcreList price sheets and marking them searchable.

**Badge:** `Verified Member` (green)

---

## Tier 2 — Verified Member (No Live Pricing)

**Who qualifies:** Suppliers who have claimed their listing and have matching products in their directory profile, but no searchable price sheet with that product.

**What buyers see:**
- Company name + location
- Verification score bar
- Product name
- "Verified Member" badge
- `💰 Pricing available on request` if the supplier has any searchable price sheet (even if no product match)

**How to achieve:** Claim your free ProduceHunt listing. Your crops sync automatically from your profile.

**Badge:** `Verified Member` (green)

---

## Tier 3 — Directory Listing (Unclaimed)

**Who qualifies:** Unclaimed directory entries where the `products[]` array contains a match for the search query.

**What buyers see:**
- Company name + location
- Verification score bar
- Product name
- No pricing, no member badge
- "Is this your business? Claim it free →" prompt

**How to achieve:** N/A — these are public records. Claim the listing to move to Tier 2.

**Badge:** None

---

## Tier 4 — Name Match Only

**Who qualifies:** Any directory entry (claimed or unclaimed) where the company name matches the query, but no product match was found.

**What buyers see:**
- Company name + location
- Verification score bar
- No product detail, no pricing

**How to achieve:** N/A — fallback results for exploratory searches.

**Badge:** None

---

## Search Mechanics

### Query Parsing
- Input is lowercased and trimmed
- Organic modifier: if query contains "organic", set `isOrganic = true` and strip "organic" from the commodity term
- Remaining term is used for product matching

### Stemming
Simple suffix rules applied when no direct match is found:
- `-ies` → `-y` (e.g. "berries" → "berry")
- `-s` → strip trailing s (e.g. "lemons" → "lemon")

### Category Expansion
Broad category terms expand to a list of specific commodities:

| Query | Expands to |
|-------|-----------|
| `citrus` | lemon, lime, orange, grapefruit, tangerine, clementine, mandarin |
| `berries` | strawberry, blueberry, raspberry, blackberry, cranberry |
| `stone fruit` | peach, nectarine, plum, cherry, apricot |
| `tropical` | mango, papaya, pineapple, guava, passion fruit, dragon fruit |
| `melons` | watermelon, cantaloupe, honeydew |

### Product Matching
For Tier 1 and 2 (claimed suppliers), matching checks:
1. `priceSheetProducts.commodity` (case-insensitive, partial match)
2. `supplierDirectory.products[].commodity` (case-insensitive, partial match)

For Tier 3 and 4 (unclaimed):
1. `supplierDirectory.products[].commodity`
2. `supplierDirectory.companyName` (Tier 4 fallback)

---

## Listing Visibility

Two independent fields control how a supplier appears:

| Field | Meaning |
|-------|---------|
| `claimed: true` | Supplier has verified ownership of the listing |
| `listed: true` | Listing is visible in search results |

A supplier can claim their listing (`claimed: true`) but choose to hide it from search (`listed: false`). Delisting does not remove the claim — they can relist at any time from the dashboard.

---

## Verification Score

Maximum score: **27 points**

| Signal | Points |
|--------|--------|
| PACA licensed | 5 |
| GFSI certification (SQF, BRC, etc.) | 5 |
| Years in business (10+) | 5 |
| USDA Organic certification | 5 |
| DRC member | 3 |
| Website present | 2 |
| ProduceHunt Member (claimed) | 2 |

Scores are pre-computed from public data sources and locked. Suppliers cannot manually edit their verification score — it reflects externally verifiable signals.

---

## Supplier Journey

```
Public records / manual entry
        ↓
  Directory entry (Tier 3/4)
  [listed, unclaimed, no member badge]
        ↓
  Claim listing (free)
  [Tier 2 — Verified Member]
  crops auto-sync from profile
        ↓
  Add live pricing (price sheets)
  mark price sheet as searchable
  [Tier 1 — Live Pricing + Verified Member]
```

---

## Domain Verification (Claim Flow)

When a supplier submits a claim:

1. Extract root domain from the directory entry's `contact.website`
2. Extract domain from the user's login email
3. If they match → claim is **instantly approved** (`claimed: true`, `listed: true`)
4. If they don't match → claim goes to **pending review** (`claimRequests` collection, admin notified)

---

## Future Tiers (Planned)

- **Tier 0** — Featured/sponsored results (manually curated or paid placement)
- **Buyer-side tiers** — Match quality signals (buyer location vs. supplier shipping regions, minimum order compatibility)
- **Review signals** — Buyer-verified transactions boosting trust score
