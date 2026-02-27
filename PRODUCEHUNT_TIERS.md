# ProduceHunt Search Result Tiers

Results are ranked into 4 tiers. **Tier 1 = highest quality, appears first.** Within each tier, results sort by verification score descending.

---

## Tier 1 — AcreList Supplier with Live Pricing

**Criteria:**
- Supplier has claimed their ProduceHunt listing (`supplierDirectory.acrelistUserId` is set)
- They have at least one price sheet marked `searchable: true`
- That price sheet contains a `priceSheetProduct` matching the search commodity

**What the buyer sees:**
- Company name, location, verification score
- Actual pricing rows: package type · size · shipping point · price/unit
- "Live Pricing" badge

**Location logic:**
- Prefer `supplierDirectory.location.full`
- Fall back to AcreList user `profile.address` (city, state)

**Shipping point:** Each pricing row includes `regionName` from `priceSheetProducts`, which maps to a `ShippingPoint` record — this tells the buyer where the product ships from (e.g., "FOB Central Valley").

---

## Tier 2 — AcreList Supplier, No Live Pricing

**Criteria:**
- Supplier has claimed their ProduceHunt listing (`acrelistUserId` is set)
- Their `supplierDirectory.products[]` matches the search (synced from their crop management)
- They do NOT have a searchable price sheet with matching products

**What the buyer sees:**
- Company name, location, verification score
- Product name (commodity + organic flag)
- "Member" badge
- "Contact for availability" CTA

**Location logic:** Same fallback as Tier 1 — directory location → AcreList profile address.

**Notes:** These suppliers are active on AcreList and have declared what they grow, but haven't published pricing to ProduceHunt. They're contactable but less transparent than Tier 1.

---

## Tier 3 — Directory Supplier with Product Match

**Criteria:**
- Supplier does NOT have `acrelistUserId` (unclaimed listing)
- Their `supplierDirectory.products[]` matches the search commodity or variety

**What the buyer sees:**
- Company name, location (from directory only), verification score
- Product name
- No tier badge

**Ranking within Tier 3:** Verification score descending (PACA, GFSI, organic cert, etc.).

**Notes:** These are growers and shippers in the ProduceHunt directory who haven't joined AcreList. Data richness varies — some are fully verified, some are basic imports.

---

## Tier 4 — Company Name Match Only

**Criteria:**
- Supplier matched on company name search, but their `products[]` do not contain a matching commodity
- Could be claimed or unclaimed

**What the buyer sees:**
- Same card as Tier 3, no badge
- Results here are lower confidence — the supplier name matched but we can't confirm they carry the searched item

**Ranking within Tier 4:** Verification score descending.

**Notes:** Useful when a buyer searches for a specific grower by name rather than a commodity. Also catches cases where the directory product list is incomplete.

---

## Organic Cross-Tier Signal

When a search includes "organic" (e.g., "organic lemons"), within each tier, organic-certified suppliers rank above conventional ones before the verification score sort is applied.

---

## Implementation

**Backend:** `backend/src/routes/public.ts` — `GET /api/public/search-products`

Each result includes a `tier: 1 | 2 | 3 | 4` field. The backend handles all sorting before returning — frontend receives results in final display order.

**Frontend:** `producehunt/app/page.tsx` — result cards read `result.tier` to show the appropriate badge.

**Key data sources:**
| Data | Collection | Field |
|------|-----------|-------|
| Product match | `supplierDirectory` | `products[]` |
| Claimed status | `supplierDirectory` | `acrelistUserId` |
| Live pricing | `priceSheetProducts` | `commodity`, `userId`, `priceSheetId` |
| Searchable flag | `priceSheets` | `searchable: true` |
| Shipping point | `priceSheetProducts` | `regionName` (denormalized from `shippingPoints`) |
| Location fallback | `users` | `profile.address.city`, `profile.address.state` |
| Verification score | `supplierDirectory` | `verificationScore.score` |
