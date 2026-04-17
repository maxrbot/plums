# ProduceHunt Supplier Pipeline

This document describes how a supplier record is built from raw public data into a live ProduceHunt listing. There are three stages: Phase 1 (import), Phase 2 (scrape), and Push (live).

All pipeline work happens in the `directoryPipeline` collection. Pushing writes a new document to `supplierDirectory`.

---

## Phase 1 — Import (`directoryPipeline`)

Source: USDA NOP Organic Integrity CSV (primary), USDA PACA (secondary).

The import reads the row, normalizes state names (full name → abbreviation), skips duplicates by cert number and company+state key, and inserts one document per eligible row.

### Fields written at import

```
companyName           ← "Operation Name"
location
  city                ← "Physical Address: City"
  state               ← normalized from "Physical Address: State/Province" (e.g. "California" → "CA")
  zip                 ← "Physical Address: ZIP/ Postal Code"
  county              ← "County"
  full                ← "City, State" string

commodities[]         ← parsed from "Certified Products Under CROPS Scope"
                        e.g. "Apples, Pears, Cherries" → ["Apple", "Pear", "Cherry"]
                        simple taxonomy normalization applied

organic               ← true for USDA source, null for PACA

website               ← "Website URL"

contact
  phone               ← "Phone"
  email               ← "Email"

certifiedAcres        ← "Total Certified Acres" (float)

operationFlags        ← boolean flags from CSV columns:
  csa                 ← "Community Supported Agriculture (CSA)" = "Yes"
  distributor         ← "Distributor" = "Yes"
  broker              ← "Broker" = "Yes"
  coPacker            ← "Co-Packer" = "Yes"
  marketer            ← "Marketer/Trader" = "Yes"
  growerGroup         ← "Grower Group" = "Yes"
  handler             ← "HANDLING Scope Certification Status" includes "certif"

operationScale        ← auto-derived from flags + acres:
  "packer-shipper"    if distributor | broker | marketer | coPacker | handler
  "direct-market"     if csa=true AND acres < 50 (or acres unknown)
  "major-grower"      if acres >= 500
  "commercial-farm"   if acres 25–499
  "small-farm"        if acres < 25

certifications[]      ← ["USDA Organic"] for USDA source

dataSources
  usdaOrganic
    verified: true
    score: 5
    certifier           ← "Certifier Name"
    certificateNumber   ← "Certificate Numbers for Certified Products under CROPS Scope"
    effectiveDate       ← "Effective Date of Operation Status"
  established           ← populated if effectiveDate is present
    verified: true
    yearEstablished     ← year parsed from effectiveDate
    score: 2

status: "pending"
importSource: "usda-organic" | "usda-paca"
```

### What Phase 1 does NOT have
- Varieties (only flat commodity names)
- Brand story
- Detailed contact info beyond phone/email
- Product-level organic status or seasonality
- Scraped/confirmed year established (effectiveDate is certification date, not founding date)

---

## Phase 2 — Scrape (`directoryPipeline`, same document updated)

Triggered manually per entry from the admin pipeline UI. Crawls up to ~8 pages of the supplier's website, classifies each URL by trust level, sends combined text to Claude (Haiku) for structured extraction.

### URL trust classification
- **[PRODUCT PAGE]** — URLs matching produce taxonomy terms (farm, orchard, grove, harvest, grove, etc.). High trust: extract all products and varieties found here.
- **[GENERAL PAGE]** — About, contact, home pages. Medium trust: extract products only if clearly stated as grown/sold.
- **[REFERENCE PAGE]** — News, blog, press. Low trust: used only for brand story, year established, contact email. No products extracted.
- **SKIPPED** — /store/, /shop/, /csa, /subscription, /membership, /merchandise, /gift, /box/ — e-commerce and program pages that would hallucinate products.

### Fields written at scrape

The scrape **does not overwrite any Phase 1 fields**. It writes to new keys only:

```
phase1Commodities[]   ← snapshot of commodities[] at scrape time (frozen, used for UI strikethrough display)

brandStory            ← 1–2 sentence description extracted by Claude

scrapedData
  products[]          ← structured product list from Claude:
    commodity         ← mapped to taxonomy (e.g. "Lemon", "Strawberry")
    category          ← taxonomy category (e.g. "Citrus Fruits", "Berries")
    varieties[]
      name            ← variety name as found on site (e.g. "Meyer Lemon", "Albion")
      availability    ← harvest/shipping window if mentioned, null otherwise
      organic         ← true/false/null
      growingPractices ← ["USDA Organic", "Non-GMO", "Regenerative", etc.]
  brandStory          ← same as top-level brandStory
  yearEstablished     ← founding year if found on site (may differ from CSV effectiveDate)
  seasonality         ← farm-level harvest window description
  certifications[]    ← additional certs found on site (beyond USDA Organic)
  contactEmail        ← sales or general email found on site (may differ from CSV email)
  crawledUrls[]       ← list of pages that were fetched

status: "scraped"
scraped: true
scrapedAt: Date
```

### Phase 1 fields that remain unchanged after scrape
- `commodities[]` — still reflects Phase 1 CSV data; `phase1Commodities[]` is a frozen copy
- `contact.phone`, `contact.email` — CSV values preserved
- `certifiedAcres`, `operationScale`, `operationFlags` — CSV values preserved
- `dataSources.usdaOrganic`, `dataSources.established` — CSV values preserved
- `website` — unchanged (scrape uses it as entry point but doesn't overwrite it)

---

## Push — Live Directory (`supplierDirectory`)

Triggered manually from the push modal. Admin reviews Phase 1 + Phase 2 data, can override any field, then pushes. Creates a new `supplierDirectory` document.

### Merge logic (push endpoint)

| Field | Source priority |
|-------|----------------|
| `companyName` | body override → entry.companyName |
| `location` | body override → entry.location |
| `website` | body override → entry.website |
| `contact.salesEmail` | body contactEmail → entry.contactEmail → entry.contact.email |
| `contact.phone` | entry.contact.phone (Phase 1 CSV, always carried through) |
| `products[]` | body.products (scraped, with varieties) → commodities[] as flat list (no varieties) |
| `brandStory` | body override → entry.brandStory (from scrape) |
| `yearEstablished` | body override → scrapedData.yearEstablished → dataSources.established.yearEstablished |
| `certifications[]` | body override → entry certifications |
| `dataSources` | Phase 1 dataSources merged with body dataSources (body wins on conflict) |
| `operationScale` | entry.operationScale (Phase 1 derived, carried through) |
| `certifiedAcres` | entry.certifiedAcres (Phase 1 CSV, carried through) |
| `operationFlags` | entry.operationFlags (Phase 1 CSV, carried through) |

### Fields in `supplierDirectory` after push

```
slug                  ← slugified companyName, deduplicated if collision
companyName
claimed: false        ← supplier has not yet claimed the listing
listed: true          ← visible in ProduceHunt search immediately
location              ← city, state, full
website
contact
  salesEmail
  phone               ← from Phase 1 CSV
  website
certifications[]
products[]            ← with full variety objects if scraped, flat if not
brandStory
yearEstablished
operationScale        ← "packer-shipper" | "major-grower" | "commercial-farm" | "small-farm" | "direct-market"
certifiedAcres        ← float, from USDA CSV
operationFlags        ← csa, distributor, broker, etc.
dataSources           ← merged Phase 1 + any push overrides
verificationScore
  score               ← sum of verified dataSources scores
  maxScore: 27
importSource: "admin-pipeline"
```

---

## Operation Scale Reference

| Scale | Criteria | Buyer type |
|-------|----------|-----------|
| `packer-shipper` | CSV flags: Distributor, Broker, Marketer, Co-Packer, or HANDLING scope certified | Retailers, distributors, foodservice broadliners |
| `major-grower` | 500+ certified acres, no handler flags | Retail buyers, regional distributors |
| `commercial-farm` | 25–499 certified acres | Regional distributors, foodservice |
| `small-farm` | <25 certified acres | Local distributors, specialty buyers |
| `direct-market` | CSA=Yes, typically <50 acres | Restaurants, co-ops, direct accounts |

Scale is auto-derived at import and can be manually overridden in the directory edit modal.

---

## Data Lifecycle Summary

```
USDA CSV row
    │
    ▼
Phase 1 (import)
  commodities[], contact.phone/email, certifiedAcres,
  operationScale, operationFlags, dataSources.usdaOrganic,
  dataSources.established (from effectiveDate)
    │
    ▼ (optional, manual trigger)
Phase 2 (scrape)
  scrapedData.products[] (with varieties),
  brandStory, scrapedData.yearEstablished,
  scrapedData.contactEmail, scrapedData.crawledUrls
  ← Phase 1 fields untouched
    │
    ▼ (manual, admin reviews + approves)
Push → supplierDirectory
  All Phase 1 fields carried through
  Phase 2 products[] preferred over Phase 1 commodities[]
  Phase 2 yearEstablished preferred over Phase 1 effectiveDate year
  Admin body overrides win over both
```
