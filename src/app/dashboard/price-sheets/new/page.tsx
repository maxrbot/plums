"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'
import PriceSheetPreviewModal from '../../../../components/modals/PriceSheetPreviewModal'
import { getCommoditySpec, hasCountSize, getCountSizeOptions, getGradeOptions } from '../../../../lib/commoditySpecs'
import { getStandardPackaging } from '../../../../lib/packagingSpecs'

// Mock data based on our setup (packaging now comes from packagingSpecs)
const mockProducts = [
  {
    id: 1,
    name: 'Organic Strawberries Albion',
    region: 'Central Valley - Fresno',
    commodity: 'strawberries', // lowercase for consistency with specs
    variety: 'Albion',
    isOrganic: true,
    seasonality: 'Year-round'
  },
  {
    id: 2,
    name: 'Conventional Lettuce Romaine',
    region: 'Salinas Valley - Salinas',
    commodity: 'lettuce',
    variety: 'Romaine',
    isOrganic: false,
    seasonality: 'October - April'
  },
  {
    id: 3,
    name: 'Organic Tomatoes Beefsteak',
    region: 'Central Valley - Fresno',
    commodity: 'tomatoes',
    variety: 'Beefsteak',
    isOrganic: true,
    seasonality: 'June - September'
  },
  {
    id: 4,
    name: 'Conventional Mandarins Sumo Citrus',
    region: 'Central Valley - Fresno',
    commodity: 'mandarins',
    variety: 'Sumo Citrus',
    isOrganic: false,
    seasonality: 'January - April'
  },
  {
    id: 5,
    name: 'Organic Apples Honeycrisp',
    region: 'Yakima Valley - Yakima',
    commodity: 'apples',
    variety: 'Honeycrisp',
    isOrganic: true,
    seasonality: 'September - June'
  },
  {
    id: 6,
    name: 'Conventional Carrots Nantes',
    region: 'Central Valley - Bakersfield',
    commodity: 'carrots',
    variety: 'Nantes',
    isOrganic: false,
    seasonality: 'Year-round'
  }
]

const availabilityOptions = [
  'Available',
  'Limited',
  'End of Season',
  'Old Crop',
  'New Crop',
  'Pre-Order',
  'Contact for Availability'
]



interface ProductRow {
  id: string
  productId: number
  packageType: string
  countSize?: string         // "88s", "113s" for cartons
  grade?: string            // "Fancy", "Choice", "Standard"
  price: string
  marketPrice?: string      // USDA price for comparison
  marketPriceUnit?: string  // USDA unit (per lb, per carton, etc.)
  marketPriceDate?: string  // When USDA published this price
  marketPriceLoading?: boolean // Loading state for refresh
  availability: string
  isSelected: boolean
  isPackStyleRow?: boolean
  parentProductId?: number
}

interface PreviewProduct {
  id: string
  productName: string
  region: string
  packageType: string
  countSize?: string
  grade?: string
  basePrice: number
  adjustedPrice: number
  marketPrice?: number
  availability: string
}

export default function NewPriceSheet() {
  const [priceSheetTitle, setPriceSheetTitle] = useState(`MarketHunt Price Sheet - ${new Date().toLocaleDateString()}`)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [productRows, setProductRows] = useState<ProductRow[]>(() => 
    mockProducts.map((product) => {
      const spec = getCommoditySpec(product.commodity)
      const packaging = getStandardPackaging(product.commodity)
      
      return {
        id: `${product.id}-main`,
        productId: product.id,
        packageType: packaging[0]?.name || 'Standard Package', // Use first available packaging
        countSize: spec?.hasCountSize ? (spec.countSizeOptions[0] || '') : '', // Commodity-appropriate count size
        grade: spec?.gradeOptions[0] || 'US No. 1', // Commodity-appropriate grade
        price: '',
        marketPrice: '', // No preloaded data
        marketPriceUnit: '', // No preloaded data
        marketPriceDate: '', // No preloaded data
        marketPriceLoading: false,
        availability: 'Available',
        isSelected: false,
        isPackStyleRow: false
      }
    })
  )

  const toggleProductSelection = (rowId: string) => {
    setProductRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, isSelected: !row.isSelected } : row
    ))
  }

  const updateRowData = (rowId: string, field: keyof ProductRow, value: string) => {
    setProductRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ))
  }

  const addPackStyle = (productId: number) => {
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return

    const packaging = getStandardPackaging(product.commodity)
    const newRowId = `${productId}-pack-${Date.now()}`
    const newRow: ProductRow = {
      id: newRowId,
      productId,
      packageType: packaging[0]?.name || 'Standard Package',
      countSize: '',
      grade: '',
      price: '',
      marketPrice: '',
      marketPriceUnit: '',
      marketPriceDate: '',
      marketPriceLoading: false,
      availability: 'Available',
      isSelected: false,
      isPackStyleRow: true,
      parentProductId: productId
    }

    setProductRows(prev => {
      const insertIndex = prev.findLastIndex(row => row.productId === productId) + 1
      return [...prev.slice(0, insertIndex), newRow, ...prev.slice(insertIndex)]
    })
  }

  const removePackStyle = (rowId: string) => {
    setProductRows(prev => prev.filter(row => row.id !== rowId))
  }

  // Refresh market price for individual row
  const refreshMarketPrice = async (rowId: string) => {
    const row = productRows.find(r => r.id === rowId)
    const product = mockProducts.find(p => p.id === row?.productId)
    
    if (!row || !product) return
    
    // Validate required fields (commodity-aware)
    const spec = getCommoditySpec(product.commodity)
    const missingFields = []
    
    if (!row.packageType) missingFields.push('package type')
    if (!row.grade) missingFields.push('grade')
    if (spec?.hasCountSize && !row.countSize) missingFields.push('count/size')
    
    if (missingFields.length > 0) {
      alert(`Please select ${missingFields.join(', ')} first`)
      return
    }
    
    // Set loading state
    setProductRows(prev => prev.map(r => 
      r.id === rowId ? { ...r, marketPriceLoading: true } : r
    ))
    
    try {
      // Import USDA API service dynamically
      const { fetchUsdaPrice } = await import('../../../../lib/usdaApi')
      
      const result = await fetchUsdaPrice({
        commodity: product.commodity, 
        packaging: row.packageType,
        countSize: row.countSize,
        grade: row.grade
      })
      
      setProductRows(prev => prev.map(r => 
        r.id === rowId ? { 
          ...r, 
          marketPrice: result.price.toString(),
          marketPriceUnit: result.unit,
          marketPriceDate: result.publishedDate,
          marketPriceLoading: false
        } : r
      ))
    } catch (error) {
      console.error('Failed to fetch USDA price:', error)
      setProductRows(prev => prev.map(r => 
        r.id === rowId ? { 
          ...r, 
          marketPrice: 'Error',
          marketPriceDate: '',
          marketPriceLoading: false
        } : r
      ))
    }
  }

  // Load all market prices for configured rows
  const loadAllMarketPrices = async () => {
    const eligibleRows = productRows.filter(row => {
      if (row.isPackStyleRow) return false
      
      const product = mockProducts.find(p => p.id === row.productId)
      if (!product) return false
      
      const spec = getCommoditySpec(product.commodity)
      
      // Check required fields based on commodity
      if (!row.packageType || !row.grade) return false
      if (spec?.hasCountSize && !row.countSize) return false
      
      return true
    })
    
    if (eligibleRows.length === 0) {
      alert('Please configure required fields for products first (package type, grade, and count/size where applicable)')
      return
    }
    
    setBulkLoading(true)
    
    // Process rows sequentially to avoid overwhelming the API
    for (const row of eligibleRows) {
      await refreshMarketPrice(row.id)
    }
    
    setBulkLoading(false)
  }

  // Generate preview data for base price sheet
  const generatePreviewData = (): PreviewProduct[] => {
    const selectedRows = productRows.filter(row => row.isSelected && row.price)
    
    return selectedRows.map((row): PreviewProduct | null => {
      const product = mockProducts.find(p => p.id === row.productId)
      if (!product) return null

      const basePrice = parseFloat(row.price)

      return {
        id: row.id,
        productName: product.name,
        region: product.region,
        packageType: row.packageType,
        countSize: row.countSize,
        grade: row.grade,
        basePrice,
        adjustedPrice: basePrice, // No adjustment in base sheet
        marketPrice: row.marketPrice ? parseFloat(row.marketPrice) : undefined,
        availability: row.availability
      }
    }).filter((product): product is PreviewProduct => product !== null)
  }

  const handlePreview = () => {
    setIsPreviewModalOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Create New Price Sheet', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Price Sheet</h1>
          <p className="mt-2 text-gray-600">Generate a professional price sheet using your configured data.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Price Sheet Title */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Price Sheet Details</h2>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Price Sheet Title
            </label>
            <input
              type="text"
              id="title"
              value={priceSheetTitle}
              onChange={(e) => setPriceSheetTitle(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter price sheet title"
            />
          </div>
        </div>



        {/* Products and Pricing */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Products and Pricing</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure products, then refresh market prices for guidance. Products are pre-populated from your crop management data.
              </p>
            </div>
            <button
              onClick={loadAllMarketPrices}
              disabled={bulkLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  🔄 Load All Market Prices
                </>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-2 py-3 text-center">
                    {/* No text - just checkbox column */}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Package Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Count/Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    <div className="flex items-center justify-between">
                      <span>Price</span>
                      <span className="text-xs text-gray-400 font-normal">USDA-LA</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Availability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productRows.map((row) => {
                  const product = mockProducts.find(p => p.id === row.productId)
                  if (!product) return null

                  return (
                    <tr key={row.id} className={`${row.isPackStyleRow ? 'bg-gray-50' : ''}`}>
                      <td className="w-12 px-2 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.isSelected}
                          onChange={() => toggleProductSelection(row.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className={`text-sm ${row.isPackStyleRow ? 'ml-6 text-gray-600' : 'font-medium text-gray-900'}`}>
                          {row.isPackStyleRow ? '↳ Additional Pack Style' : product.name}
                        </div>
                      </td>
                      
                      <td className="w-40 px-4 py-4">
                        <select
                          value={row.packageType}
                          onChange={(e) => updateRowData(row.id, 'packageType', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          {getStandardPackaging(product.commodity).map(pkg => (
                            <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                          ))}
                        </select>
                      </td>
                      
                      {/* Count/Size */}
                      <td className="w-24 px-4 py-4">
                        {hasCountSize(product.commodity) ? (
                          <select
                            value={row.countSize || ''}
                            onChange={(e) => updateRowData(row.id, 'countSize', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                          >
                            <option value="">-</option>
                            {getCountSizeOptions(product.commodity).map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      
                      {/* Grade */}
                      <td className="w-24 px-4 py-4">
                        <select
                          value={row.grade || ''}
                          onChange={(e) => updateRowData(row.id, 'grade', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          <option value="">-</option>
                          {getGradeOptions(product.commodity).map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </td>
                      
                      {/* Combined Price Column */}
                      <td className="w-36 px-4 py-4">
                        {/* Your Price Input */}
                        <div className="relative mb-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                            <span className="text-gray-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => updateRowData(row.id, 'price', e.target.value)}
                            className="pl-6 pr-2 py-1.5 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                            placeholder="0.00"
                          />
                        </div>
                        
                        {/* USDA Market Price Below */}
                        <div className="text-xs text-gray-600">
                          {row.marketPriceLoading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading...</span>
                            </div>
                          ) : row.marketPrice && row.marketPrice !== 'Error' ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">${row.marketPrice}</span>
                                {row.marketPriceDate && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(row.marketPriceDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                )}
                              </div>
                              {row.marketPriceUnit && (
                                <div className="text-xs text-gray-500">{row.marketPriceUnit}</div>
                              )}
                            </div>
                          ) : row.marketPrice === 'Error' ? (
                            <span className="text-red-500">Error loading</span>
                          ) : (
                            <button
                              onClick={() => refreshMarketPrice(row.id)}
                              disabled={(() => {
                                const spec = getCommoditySpec(product.commodity)
                                if (row.marketPriceLoading) return true
                                if (!row.packageType || !row.grade) return true
                                if (spec?.hasCountSize && !row.countSize) return true
                                return false
                              })()}
                              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title={(() => {
                                const spec = getCommoditySpec(product.commodity)
                                const missing = []
                                if (!row.packageType) missing.push('package type')
                                if (!row.grade) missing.push('grade')
                                if (spec?.hasCountSize && !row.countSize) missing.push('count/size')
                                
                                return missing.length > 0 
                                  ? `Select ${missing.join(', ')} first`
                                  : 'Get market price'
                              })()}
                            >
                              🔄 Get market price
                            </button>
                          )}
                        </div>
                        
                        {/* Refresh button when price is loaded */}
                        {row.marketPrice && row.marketPrice !== 'Error' && (
                          <button
                            onClick={() => refreshMarketPrice(row.id)}
                            disabled={row.marketPriceLoading}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                            title="Refresh market price"
                          >
                            🔄 Refresh
                          </button>
                        )}
                      </td>
                      
                      <td className="w-36 px-4 py-4">
                        <select
                          value={row.availability}
                          onChange={(e) => updateRowData(row.id, 'availability', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          {availabilityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="w-32 px-4 py-4 text-sm font-medium">
                        {row.isPackStyleRow ? (
                          <button
                            onClick={() => removePackStyle(row.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addPackStyle(product.id)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Pack
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>



        {/* Additional Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            rows={4}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any additional notes, terms, or special information for this price sheet..."
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/price-sheets"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handlePreview}
            disabled={productRows.filter(row => row.isSelected && row.price).length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview Price Sheet
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <PriceSheetPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={priceSheetTitle}
        products={generatePreviewData()}
        additionalNotes={additionalNotes}
      />
    </>
  )
}