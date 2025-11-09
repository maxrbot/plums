"use client"

import { useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import { allCommodities } from '../../../../config'

export default function CommodityStructure() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedCommodities, setExpandedCommodities] = useState<Set<string>>(new Set())

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleCommodity = (commodityId: string) => {
    const newExpanded = new Set(expandedCommodities)
    if (newExpanded.has(commodityId)) {
      newExpanded.delete(commodityId)
    } else {
      newExpanded.add(commodityId)
    }
    setExpandedCommodities(newExpanded)
  }

  const commodities = allCommodities

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Commodity Structure', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commodity Structure</h1>
            <p className="mt-2 text-gray-600">
              Complete breakdown of processing, packaging, and sizing specifications for all supported commodities.
            </p>
          </div>
          <div>
            <a
              href="/dashboard/price-sheets/packaging/custom"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Custom Commodity Structure
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Processing & Packaging Options</h3>
                <p className="mt-1 text-sm text-gray-600">
                  View variety-specific differences and available configurations for each commodity.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Expand all categories
                    const allCategories = [...new Set(commodities.map(c => c.category))]
                    setExpandedCategories(new Set(allCategories))
                    
                    // Expand all commodities
                    setExpandedCommodities(new Set(commodities.map(c => c.id)))
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Expand All
                </button>
                <button
                  onClick={() => {
                    setExpandedCategories(new Set())
                    setExpandedCommodities(new Set())
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 p-6">
            {(() => {
              // Group commodities by category
              const categorizedCommodities = commodities.reduce((acc, commodity) => {
                if (!acc[commodity.category]) {
                  acc[commodity.category] = []
                }
                acc[commodity.category].push(commodity)
                return acc
              }, {} as Record<string, typeof commodities>)

              return Object.entries(categorizedCommodities).map(([categoryName, commoditiesInCategory]) => {
                const isCategoryExpanded = expandedCategories.has(categoryName)
                const totalCommodities = commoditiesInCategory.length
                const totalVarieties = commoditiesInCategory.reduce((sum, c) => sum + Object.keys(c.varieties).length, 0)
                
                return (
                  <div key={categoryName} className="border border-gray-300 rounded-lg">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`transform transition-transform ${isCategoryExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRightIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-blue-900">{categoryName}</h3>
                          <p className="text-sm text-blue-700">{totalCommodities} commodities • {totalVarieties} varieties</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Category
                        </span>
                      </div>
                    </button>

                    {/* Category Content */}
                    {isCategoryExpanded && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        <div className="space-y-4">
                          {commoditiesInCategory.map(commodity => {
                            const isExpanded = expandedCommodities.has(commodity.id)
                            const varietyCount = Object.keys(commodity.varieties).length
                            
                            return (
                              <div key={commodity.id} className="border border-gray-200 rounded-lg">
                                {/* Commodity Header */}
                                <button
                                  onClick={() => toggleCommodity(commodity.id)}
                                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <div className="text-left">
                                      <h4 className="text-lg font-semibold text-gray-900">{commodity.name}</h4>
                                      <p className="text-sm text-gray-600">{varietyCount} varieties • {commodity.category}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      commodity.usdaCoverage.hasPricing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {commodity.usdaCoverage.hasPricing ? 'USDA Pricing' : 'No USDA Data'}
                                    </span>
                                  </div>
                                </button>

                                {/* Commodity Content */}
                                {isExpanded && (
                                  <div className="border-t border-gray-200">
                                    {(() => {
                                      // Check if all varieties have identical processing/packaging configurations
                                      const varieties = Object.entries(commodity.varieties)
                                      
                                      // Generate base configurations (same for all varieties)
                                      const baseConfigurations: any[] = []
                                      
                                      if (commodity.processing.hasProcessing && commodity.processing.types) {
                                        commodity.processing.types.forEach(processingType => {
                                          processingType.packageTypes.forEach(packageType => {
                                            packageType.sizes.forEach(size => {
                                              if (packageType.sizeClassifications && packageType.sizeClassifications.length > 0) {
                                                packageType.sizeClassifications.forEach(fruitCount => {
                                                  baseConfigurations.push({
                                                    processing: processingType.name,
                                                    packageType: packageType.name,
                                                    packageSize: size.name,
                                                    itemSize: fruitCount.name
                                                  })
                                                })
                                              } else {
                                                baseConfigurations.push({
                                                  processing: processingType.name,
                                                  packageType: packageType.name,
                                                  packageSize: size.name,
                                                  itemSize: '-'
                                                })
                                              }
                                            })
                                          })
                                        })
                                      } else {
                                        commodity.packaging.types.forEach(packageType => {
                                          packageType.sizes.forEach(size => {
                                            if (packageType.sizeClassifications && packageType.sizeClassifications.length > 0) {
                                              packageType.sizeClassifications.forEach(fruitCount => {
                                                baseConfigurations.push({
                                                  processing: 'Fresh',
                                                  packageType: packageType.name,
                                                  packageSize: size.name,
                                                  itemSize: fruitCount.name
                                                })
                                              })
                                            } else {
                                              baseConfigurations.push({
                                                processing: 'Fresh',
                                                packageType: packageType.name,
                                                packageSize: size.name,
                                                itemSize: '-'
                                              })
                                            }
                                          })
                                        })
                                      }

                                      // If there are multiple varieties, show unified view with variety comparison
                                      if (varieties.length > 1) {
                                        return (
                                          <div className="p-6">
                                            <div className="mb-4">
                                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                                Processing & Packaging Options
                                                <span className="ml-2 text-xs text-gray-500">(applies to all varieties)</span>
                                              </h5>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead>
                                                    <tr className="border-b border-gray-200">
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cut/Processing</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Size</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Size</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-100">
                                                    {baseConfigurations.map((config, index) => {
                                                      // Check if this is the default configuration
                                                      const isDefault = (() => {
                                                        if (commodity.processing.hasProcessing) {
                                                          const defaultProcessing = commodity.processing.types?.find(pt => pt.isDefault)?.name
                                                          const defaultPackage = commodity.packaging.defaultPackage
                                                          const defaultSize = commodity.packaging.defaultSize
                                                          return config.processing === defaultProcessing && 
                                                                 config.packageType === defaultPackage &&
                                                                 config.packageSize === defaultSize
                                                        } else {
                                                          const defaultPackage = commodity.packaging.defaultPackage
                                                          const defaultSize = commodity.packaging.defaultSize
                                                          return config.packageType === defaultPackage && config.packageSize === defaultSize
                                                        }
                                                      })()

                                                      return (
                                                        <tr key={index} className={isDefault ? 'bg-green-50' : ''}>
                                                          <td className="px-3 py-2 text-sm text-gray-900">
                                                            {config.processing}
                                                            {isDefault && <span className="ml-2 text-xs text-green-600 font-medium">(default)</span>}
                                                          </td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.packageType}</td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.packageSize}</td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.itemSize}</td>
                                                        </tr>
                                                      )
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>

                                            {/* Variety-Specific Differences */}
                                            <div className="mt-6">
                                              <h5 className="text-sm font-medium text-gray-900 mb-2">Variety-Specific Differences</h5>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead>
                                                    <tr className="border-b border-gray-200">
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight/Item</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Price/lb</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">USDA Coverage</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-100">
                                                    {varieties.map(([varietyId, variety]) => (
                                                      <tr key={varietyId} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{variety.name}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-900">
                                                          {variety.itemWeight ? `${variety.itemWeight.base.toFixed(2)} lbs` : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">${variety.pricing.basePricePerLb.toFixed(2)}</td>
                                                        <td className="px-3 py-2">
                                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            variety.usdaMapping?.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                                            variety.usdaMapping?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            variety.usdaMapping?.confidence === 'low' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                          }`}>
                                                            {variety.usdaMapping?.confidence || 'none'}
                                                          </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-xs text-gray-500">
                                                          {varietyId === commodity.defaultVariety && <span className="font-medium text-blue-600">Default</span>}
                                                          {variety.pricing.priceVolatility === 'high' && <span className="ml-1 text-orange-600">High volatility</span>}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      } else {
                                        // Single variety - show simplified view
                                        const [varietyId, variety] = varieties[0]
                                        return (
                                          <div className="p-6">
                                            <div className="mb-4">
                                              <h5 className="text-sm font-medium text-gray-900 mb-2">
                                                Processing & Packaging Options
                                              </h5>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead>
                                                    <tr className="border-b border-gray-200">
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cut/Processing</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Size</th>
                                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Size</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-100">
                                                    {baseConfigurations.map((config, index) => {
                                                      const isDefault = (() => {
                                                        if (commodity.processing.hasProcessing) {
                                                          const defaultProcessing = commodity.processing.types?.find(pt => pt.isDefault)?.name
                                                          const defaultPackage = commodity.packaging.defaultPackage
                                                          const defaultSize = commodity.packaging.defaultSize
                                                          return config.processing === defaultProcessing && 
                                                                 config.packageType === defaultPackage &&
                                                                 config.packageSize === defaultSize
                                                        } else {
                                                          const defaultPackage = commodity.packaging.defaultPackage
                                                          const defaultSize = commodity.packaging.defaultSize
                                                          return config.packageType === defaultPackage && config.packageSize === defaultSize
                                                        }
                                                      })()

                                                      return (
                                                        <tr key={index} className={isDefault ? 'bg-green-50' : ''}>
                                                          <td className="px-3 py-2 text-sm text-gray-900">
                                                            {config.processing}
                                                            {isDefault && <span className="ml-2 text-xs text-green-600 font-medium">(default)</span>}
                                                          </td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.packageType}</td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.packageSize}</td>
                                                          <td className="px-3 py-2 text-sm text-gray-700">{config.itemSize}</td>
                                                        </tr>
                                                      )
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>

                                            {/* Variety Details */}
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                              <h5 className="text-sm font-medium text-gray-900 mb-3">{variety.name} Details</h5>
                                              <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">Base Price:</span>
                                                  <span className="font-medium text-gray-900">
                                                    ${variety.pricing.basePricePerLb.toFixed(2)}/lb
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">Price Volatility:</span>
                                                  <span className={`font-medium capitalize ${
                                                    variety.pricing.priceVolatility === 'high' ? 'text-red-600' :
                                                    variety.pricing.priceVolatility === 'medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                  }`}>
                                                    {variety.pricing.priceVolatility}
                                                  </span>
                                                </div>
                                                {variety.itemWeight && (
                                                  <div className="flex justify-between">
                                                    <span className="text-gray-600">Avg Item Weight:</span>
                                                    <span className="font-medium text-gray-900">
                                                      {variety.itemWeight.base.toFixed(3)} lbs
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
