# AcreList — Product Ideas & Future Improvements

---

## Market Intelligence (USDA AMS Integration)

**Current status:** `/dashboard/market-data` fetches real USDA PDF reports from `ams.usda.gov/mnreports`, parses them server-side with `pdf-parse`, caches in MongoDB for 12 hours. Covers 9 terminal markets + 5 shipping points. Data displays as narrative text with price ranges — functional but not structured into columns.

**`/dashboard/price-sheets/usda-pricing`** still uses the old `src/lib/usdaApi.ts` which falls back to simulated/hardcoded prices — this should eventually be wired to the same real backend route.

**MARS API upgrade (future):** The USDA MARS API (`marsapi.ams.usda.gov`) returns fully structured tabular data — date · location · district · package · size · organic flag · grade · low · high · avg — exactly what Bluebook shows. It's free but requires a separate registration at `apps.ams.usda.gov/MarketNewsApiAccount/Register` (different from the NOP key in `.env` which is `USDA_API_KEY`). Once registered, add as `MARS_API_KEY`. Would enable proper filterable table UI and make the price sheet sidebar accurate. Not urgent since PDF parsing is working — upgrade when we want to match Bluebook's data quality exactly.

**Ideas:**

- **Pricing intelligence sidebar in price sheets** — when a user adds a line item for a commodity (e.g. Broccoli), show a live widget: "USDA AMS market range this week: $28–$38 · avg $33.51 · FOB Shipping Point." Surfaced at exactly the right moment so sellers price competitively. Same data Bluebook charges for, free and contextual.

- **Price alerts / notifications** — "The market price for Broccoli dropped 22% this week. Your listed price may be out of range." Proactive push to keep pricing current. This is a retention/engagement feature Bluebook doesn't offer — they're read-only.

- **Seasonal movement chart on crop management** — pull USDA AMS volume/movement data to show sellers when their commodity peaks, so they know when to push pricing vs. hold back. Helps plan the selling season.

- **"You're priced below market" / "above market" indicator** — passive badge on the price sheet list view (not just when editing). A glance shows sellers where they stand without having to open each sheet.

- **Enable the real USDA API call** — the backend proxy at `usdaMarket.ts` was built to avoid CORS. The `simulateUsdaApiCall` fallback should be replaced with live data from `marsapi.ams.usda.gov`. Report slugs are already mapped in `usdaApi.ts`.

---

## Bluebook Comparison — What We Have vs. What They Have

**Bluebook has that we don't:**
- Credit / payment worth ratings (their real moat — 125 years of trade credit data, not replicable)
- "Know Your Commodity" editorial content per commodity (origins, varieties, cultivation, storage, pests, transportation)
- Market price + volume movement visualizations (but we already have the API wired up)

**We have that Bluebook doesn't:**
- Live pricing directly from sellers — Bluebook shows USDA market averages, not actual offers from specific farms
- Variety-level price sheet detail
- Organic-specific pricing and market context
- Direct outreach path from the platform (email price sheets, contact forms)
- Supplier-side tooling (price sheets, crop management, customer contacts) — Bluebook is purely buyer/credit-focused
- ProduceHunt integration — a discovery layer tied to real pricing data

---

## Other Ideas

- **Famous Software auto-import at onboarding** — use Claude computer use to pull crop and pricing data from Famous at signup. Eliminates manual re-entry for existing Famous users. (See `memory/project_famous_integration.md`)

- **Multi-user / sub-accounts** — allow a supplier to add sales reps or ops staff under one account, each with their own login but shared price sheets and contacts.

- **Price sheet versioning** — keep a history of price changes per sheet so sellers can see how their pricing has drifted over time vs. market.

- **Buyer engagement analytics** — show sellers which buyers are viewing their price sheets most, how long they spend, and if they're returning. Currently `priceSheetViews` collection tracks views but this isn't surfaced to users.

- **Order request workflow improvements** — buyers can already submit order requests, but there's no seller-side accept/decline/counter flow. A lightweight quoting workflow would close the loop.
