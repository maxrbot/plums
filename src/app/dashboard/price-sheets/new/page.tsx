"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

// Mock data based on our setup
const mockProducts = [
  {
    id: 1,
    name: 'Organic Strawberries Albion',
    region: 'Central Valley - Fresno',
    commodity: 'Strawberries',
    variety: 'Albion',
    isOrganic: true,
    availablePackaging: ['1 lb Clamshell', '2 lb Clamshell'],
    seasonality: 'Year-round'
  },
  {
    id: 2,
    name: 'Conventional Lettuce Romaine',
    region: 'Salinas Valley - Salinas',
    commodity: 'Lettuce',
    variety: 'Romaine',
    isOrganic: false,
    availablePackaging: ['24ct Carton', '12ct Carton'],
    seasonality: 'October - April'
  },
  {
    id: 3,
    name: 'Organic Tomatoes Beefsteak',
    region: 'Central Valley - Fresno',
    commodity: 'Tomatoes',
    variety: 'Beefsteak',
    isOrganic: true,
    availablePackaging: ['25 lb Box', '20 lb Box'],
    seasonality: 'June - September'
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
  price: string
  availability: string
  isSelected: boolean
  isPackStyleRow?: boolean
  parentProductId?: number
}

export default function NewPriceSheet() {
  const [priceSheetTitle, setPriceSheetTitle] = useState(`Plums AG Price Sheet - ${new Date().toLocaleDateString()}`)
  const [productRows, setProductRows] = useState<ProductRow[]>(() => 
    mockProducts.map(product => ({
      id: `${product.id}-main`,
      productId: product.id,
      packageType: product.availablePackaging[0],
      price: '',
      availability: 'Available',
      isSelected: false,
      isPackStyleRow: false
    }))
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

    const newRowId = `${productId}-pack-${Date.now()}`
    const newRow: ProductRow = {
      id: newRowId,
      productId,
      packageType: product.availablePackaging[0],
      price: '',
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

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Contact information is automatically synced from your Profile page.
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Visit your profile to update this information.
                </p>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mt-2"
                >
                  Update Profile Information →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Products and Pricing */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Products and Pricing</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select products using the checkboxes, then add pricing for the products you&apos;re currently offering. Products are pre-populated from your crop management data.
            </p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Growing Region
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Package Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Price
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
                        {!row.isPackStyleRow && (
                          <div className="text-xs text-gray-500">
                            {product.isOrganic ? 'Organic' : 'Conventional'} • {product.seasonality}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.isPackStyleRow ? '' : product.region}
                      </td>
                      
                      <td className="w-40 px-4 py-4">
                        <select
                          value={row.packageType}
                          onChange={(e) => updateRowData(row.id, 'packageType', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm min-w-0"
                        >
                          {product.availablePackaging.map(pkg => (
                            <option key={pkg} value={pkg}>{pkg}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="w-28 px-4 py-4">
                        <div className="relative">
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
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Preview Price Sheet
          </button>
        </div>
      </div>
    </>
  )
}