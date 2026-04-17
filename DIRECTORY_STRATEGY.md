# ProduceHunt Directory Strategy

## Why Two Phases Before Going Live

### Phase 1 — Structured Data Import (USDA Sources)
The first phase pulls from government databases: USDA Organic Integrity and USDA PACA. These give us company name, location, license numbers, and (for organic) the actual commodity data. Every record that lands in the pipeline at this stage is a real, verified business — not a guess.

This phase is fast, clean, and gives the admin team a reviewable backlog before anything goes live. The pipeline table is the staging area: import in batches, review completeness warnings, make any corrections, then push to the directory.

**Why not push directly from the import?**
Because the import is imperfect by design. USDA data can have stale addresses, misspelled company names, missing contact info, and no website URL. A human review step catches problems before buyers see them. The Push/Edit modal is that gate.

### Phase 2 — Website Enrichment (Per-Entry Scrape)
After an entry lands in the pipeline with a website URL, the admin triggers a per-entry website scrape from the Push/Edit modal. This crawls the supplier's own site and uses Claude to extract structured data:

- Brand story (1–2 sentences from About page)
- Specific varieties (e.g. Honeycrisp, Eureka Lemon, Lacinato Kale)
- Seasonality windows (e.g. "May–October for stone fruit")
- Additional certifications mentioned on site (Non-GMO, SQF, LGMA, etc.)
- Year established
- Contact email

Phase 2 is the differentiator. No external database knows what Chelan Fresh sells in Q3 or how they describe their cherry program. Their own website does. The scrape brings that into the directory profile automatically, making the push/dismiss decision much more informed.

**Why separate phases?**
Phase 1 gives you a usable directory quickly. Phase 2 makes those profiles genuinely useful to buyers. Running them separately means you can validate the pipeline flow end-to-end on real data before adding the complexity of live website crawling.

### How the Phase 2 Scraper Works

The scraper uses a smart depth-2 crawler — not homepage-only, not a full site crawl, but adaptive link discovery capped at ~15 pages.

**Why not homepage-only?**
Many suppliers bury their product detail one click deeper. Braga Fresh's homepage is vague category buckets; their `/private-label-products/` page (1 click away) lists every SKU. Massa Organics' contact emails are on `/find-us/`, not the homepage. Homepage-only would miss all of this.

**Why not crawl everything?**
A large operation can have hundreds of pages. Blog posts from 2019, press releases, careers pages, and legal pages add noise and tokens without contributing useful data. Unbounded crawling is slow and wasteful.

**The algorithm:**
1. Fetch the homepage
2. Extract all internal links, score them by relevance (URLs containing `about`, `farm`, `grow`, `product`, `variety`, `crop`, `harvest`, `season`, `certif`, `story`, `contact` score higher)
3. Skip irrelevant pages (`/blog/`, `/news/`, `/press/`, `/careers/`, `/privacy/`, `/terms/`, date-pattern blog paths, media files)
4. Fetch the top 6 depth-1 pages **in parallel** (3–4s total, not sequential)
5. From pages that look like product/category pages (URL contains `product`, `grow`, `variety`, `crop`, `catalog`), extract their links and fetch the top 4 depth-2 pages in parallel
6. Concatenate all page text with URL labels → single Claude Haiku call (~7k tokens)
7. Store `crawledUrls` in `scrapedData` so you can see exactly which pages were crawled

**What Claude extracts in one pass:**
- `brandStory`, `commodities`, `varieties`, `yearEstablished`, `seasonality`, `certifications`, `contactEmail`

**Known gap — JavaScript-heavy sites:**
Sites built as React SPAs or some Shopify themes serve an empty HTML shell to raw HTTP requests — the content loads client-side via JavaScript. A raw fetch returns little or no text. The scraper will return a thin or empty brand story in these cases. Adding a headless browser (Puppeteer/Playwright) would fix this but is a significant infrastructure dependency. For v1, if a scrape returns nothing, that's usually why — the site requires JavaScript execution to render content.

---

## Why Organic as the Beachhead

### The buyer problem we're solving first
Produce buyers sourcing organic have a worse experience than conventional buyers across every existing tool. Most directories don't filter by organic certification. The USDA Organic Integrity database is public but hard to use — it's a government search form, not a buyer tool. Distributors' websites don't expose organic certification clearly. Buyers end up calling around.

ProduceHunt can be the first place where "find certified organic lemon growers in California" is a one-second search with verified results.

### The data advantage
The USDA Organic Integrity database gives us commodity-level data that PACA doesn't. When we import an organic supplier, we already know they grow citrus or berries or leafy greens — the search result is useful immediately, even unclaimed. PACA records are company + location only; without the website scrape, they show up in directory results but with no product data.

Starting organic means every imported entry is search-ready on day one.

### The supplier profile
Organic growers tend to be more marketing-aware, more likely to have a real website, and more likely to care about how they appear to buyers. They're better candidates for the claim flow than a large conventional commodity shipper who has a sales team handling inbound already.

### Why website presence is a hard filter on import

When we first imported from USDA Organic without a website filter, we found:
- Holding companies and investment LLCs (e.g. "ACMPC California 4, LLC") with no consumer-facing brand
- Religious institutions with certified land (e.g. a Benedictine monastery with an organic walnut orchard)
- Hobby farms and research plots that aren't selling commercially

The USDA database certifies *land and operations*, not commercial intent. A website is the clearest signal that a grower is actively marketing themselves to buyers.

**Import rule: website URL required.** 29% of CA certified crop operations have a website (~731 of 2,549). That's the addressable universe for Phase 1. The other 71% aren't ready for ProduceHunt — either they sell exclusively through brokers who don't want them listed, or they're not commercially active at the scale we serve.

This also makes Phase 2 self-fulfilling: every record that enters the pipeline already has the URL the scraper needs. No Google Places enrichment pass required before scraping can start.

**DBA name extraction.** USDA records legal entity names ("1893 Pleasant Hill Road LLC dba Moon Dust Vineyard"). We extract the DBA portion as the display name ("Moon Dust Vineyard") so buyer-facing profiles use the brand name, not the holding company.

### When to expand to conventional
Once organic coverage in the top 3 commodities (citrus, berries, leafy greens) reaches ~50 suppliers each, the directory is credible for organic-focused searches. That's the signal to start layering in PACA-sourced conventional suppliers. The model is proven, the claim flow is working, and the conventional shippers see a live, credible directory to join rather than an empty one.

---

## Deduplication Strategy
Each import source uses a natural unique key:
- **USDA Organic**: `certificateNumber` — unique per operation per certifier
- **PACA**: `licenseNumber` — unique per licensee

Before inserting any record, the importer checks if that key already exists in `directoryPipeline.dataSources`. If it does, the record is skipped. This makes imports idempotent — safe to run multiple times, safe to re-run after adding new records to the source.

## Batch Size Reasoning
| Step | Batch size | Reasoning |
|------|-----------|-----------|
| USDA Organic import | 100–200 per run | Fast DB writes; creates a reviewable backlog without overwhelming it |
| Website scrape | 20–50 per run | Each scrape takes 5–15s + LLM call; don't run overnight unattended |
| Human review + push | 10–20 per session | The real bottleneck; a good session pushes 15–20 quality entries live |

Start with California, commodity by commodity. High density of suppliers + most commodities represented = fastest path to a credible directory.
