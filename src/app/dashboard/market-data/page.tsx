'use client'

import UsdaMarketWidget from '../UsdaMarketWidget'

export default function MarketDataPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">USDA Market Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live wholesale prices from USDA AMS terminal markets and FOB shipping points — updated daily.
        </p>
      </div>
      <UsdaMarketWidget />
    </div>
  )
}
