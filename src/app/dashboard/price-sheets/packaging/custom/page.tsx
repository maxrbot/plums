"use client"

import { useState } from 'react'
import { ArrowLeftIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../../components/ui'
import Link from 'next/link'

export default function CustomCommodityStructure() {
  const [specSheetText, setSpecSheetText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [customCommodities, setCustomCommodities] = useState<any[]>([])

  const handleParse = async () => {
    setIsProcessing(true)
    
    // TODO: Implement actual parsing logic
    // For now, simulate processing
    setTimeout(() => {
      setExtractedData({
        commodity: 'American Cucumbers',
        varieties: [
          { name: 'Supers', package: '68-72ct Volume Filled Carton' },
          { name: 'Selects', package: '70-75ct Volume Filled Carton' },
          { name: 'Selects', package: '54-58ct Volume Filled Carton' },
          { name: 'Large', package: '80-90ct Volume Filled Carton' },
          { name: 'Small', package: 'Volume Filled Carton' },
          { name: 'Plains', package: '24ct Place-Packed Carton' },
          { name: '24s', package: '36ct Place-Packed Carton' },
          { name: '36s', package: 'Place-Packed RPC #6425' },
          { name: '68-72s', package: 'Place-Packed RPC #6411' },
          { name: '36s', package: 'Place-Packed RPC #6413' }
        ],
        packages: [
          {
            name: '68-72ct Volume Filled Carton',
            logistics: { palletSize: '48"×40"', hi: 7, ti: 6, boxes: 42 }
          },
          {
            name: '70-75ct Volume Filled Carton',
            logistics: { palletSize: '48"×40"', hi: 7, ti: 6, boxes: 42 }
          },
          {
            name: '54-58ct Volume Filled Carton',
            logistics: { palletSize: '48"×40"', hi: 7, ti: 6, boxes: 42 }
          },
          {
            name: '80-90ct Volume Filled Carton',
            logistics: { palletSize: '48"×40"', hi: 7, ti: 6, boxes: 42 }
          },
          {
            name: 'Volume Filled Carton',
            logistics: { palletSize: '48"×40"', hi: 7, ti: 6, boxes: 42 }
          },
          {
            name: '24ct Place-Packed Carton',
            logistics: { palletSize: '48"×40"', hi: 10, ti: 10, boxes: 100 }
          },
          {
            name: '36ct Place-Packed Carton',
            logistics: { palletSize: '48"×40"', hi: 9, ti: 9, boxes: 81 }
          },
          {
            name: 'Place-Packed RPC #6425',
            logistics: { palletSize: '48"×40"', hi: 5, ti: 8, boxes: 40 }
          },
          {
            name: 'Place-Packed RPC #6411',
            logistics: { palletSize: '48"×40"', hi: 16, ti: 5, boxes: 80 }
          },
          {
            name: 'Place-Packed RPC #6413',
            logistics: { palletSize: '48"×40"', hi: 16, ti: 5, boxes: 80 }
          }
        ]
      })
      setIsProcessing(false)
    }, 1500)
  }

  const handleConfirm = () => {
    if (extractedData) {
      setCustomCommodities([...customCommodities, extractedData])
      setExtractedData(null)
      setSpecSheetText('')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Commodity Structure', href: '/dashboard/price-sheets/packaging' },
            { label: 'Custom Structure', current: true }
          ]} 
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Custom Commodity Structure</h1>
            <p className="mt-2 text-gray-600">
              Import your spec sheets to build a custom commodity structure for your operation.
            </p>
          </div>
          <Link
            href="/dashboard/price-sheets/packaging"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Structure
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Import Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Import Spec Sheet</h3>
            <p className="mt-1 text-sm text-gray-600">
              Paste your spec sheet data below and we'll extract the commodity structure.
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="spec-sheet" className="block text-sm font-medium text-gray-700 mb-2">
                  Spec Sheet Data
                </label>
                <textarea
                  id="spec-sheet"
                  rows={12}
                  value={specSheetText}
                  onChange={(e) => setSpecSheetText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Paste your spec sheet here..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleParse}
                  disabled={!specSheetText.trim() || isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Parse & Extract
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="bg-white shadow rounded-lg border-2 border-blue-200">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Extracted Structure Preview</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Review the extracted data and confirm to add it to your custom structure.
                  </p>
                </div>
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {extractedData.commodity}
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-6">
                {/* Processing & Packaging Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Processing & Packaging Options</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pallet Size</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hi × Ti</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boxes/Pallet</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {extractedData.packages.map((pkg: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pkg.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{pkg.logistics.palletSize}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{pkg.logistics.hi} × {pkg.logistics.ti}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{pkg.logistics.boxes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Variety-Specific Differences */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Variety-Specific Differences</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size Classification</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typical Package</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {extractedData.varieties.map((variety: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{variety.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{variety.package}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    ✓ Looks Good - Add to My Structure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Your Custom Commodities */}
        {customCommodities.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Custom Commodities</h3>
              <p className="mt-1 text-sm text-gray-600">
                Commodities you've imported from spec sheets.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                {customCommodities.map((commodity, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{commodity.commodity}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {commodity.varieties.length} varieties | {commodity.packages.length} package types
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                          View Details
                        </button>
                        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">How to use this feature</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Paste your spec sheet data in the text area above</li>
                  <li>Click "Parse & Extract" to analyze the structure</li>
                  <li>Review the extracted varieties and packaging options</li>
                  <li>Confirm to add it to your custom commodity structure</li>
                  <li>Use your custom commodities when building price sheets</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

