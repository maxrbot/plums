"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Mock data for template preview
const mockProducts = [
  {
    id: '1',
    productName: 'Organic Strawberries, Albion',
    region: 'Salinas Valley',
    packageType: '12 x 1 lb Clamshells',
    countSize: '',
    grade: 'US No. 1',
    basePrice: 4.50,
    adjustedPrice: 4.50,
    marketPrice: 4.25,
    availability: 'Available',
    seasonality: 'Mar - Sep',
    isOrganic: true,
    inSeason: true
  },
  {
    id: '2',
    productName: 'Conventional Lettuce, Iceberg',
    region: 'Salinas Valley',
    packageType: '24 ct Carton',
    countSize: '24s',
    grade: 'US No. 1',
    basePrice: 2.75,
    adjustedPrice: 2.75,
    marketPrice: 2.85,
    availability: 'Available',
    seasonality: 'Year-round',
    isOrganic: false,
    inSeason: true
  },
  {
    id: '3',
    productName: 'Organic Tomatoes, Roma',
    region: 'Central Valley',
    packageType: '25 lb Box',
    countSize: '',
    grade: 'US No. 1',
    basePrice: 3.25,
    adjustedPrice: 3.25,
    marketPrice: 3.10,
    availability: 'Limited',
    seasonality: 'Jun - Oct',
    isOrganic: true,
    inSeason: true
  },
  {
    id: '4',
    productName: 'Conventional Carrots, Baby',
    region: 'Central Valley',
    packageType: '50 lb Bag',
    countSize: '',
    grade: 'US No. 1',
    basePrice: 1.85,
    adjustedPrice: 1.85,
    marketPrice: 1.95,
    availability: 'Available',
    seasonality: 'Year-round',
    isOrganic: false,
    inSeason: true
  }
]

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: 'classic' | 'premium' | 'compact'
  settings: {
    showMarketPrices: boolean
    groupByRegion: boolean
    includeSeasonality: boolean
    companyLogo?: string | null
  }
  companyName?: string
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  settings,
  companyName = 'Your Company'
}: TemplatePreviewModalProps) {
  
  // Group products by region if enabled
  const productsByRegion = settings.groupByRegion 
    ? mockProducts.reduce((groups, product) => {
        if (!groups[product.region]) {
          groups[product.region] = []
        }
        groups[product.region].push(product)
        return groups
      }, {} as Record<string, typeof mockProducts>)
    : { 'All Products': mockProducts }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  const renderClassicTemplate = () => (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {settings.companyLogo && (
              <img src={settings.companyLogo} alt="Company logo" className="h-12 w-12 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-gray-600">Price Sheet - {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products by Region */}
      {Object.entries(productsByRegion).map(([region, products]) => (
        <div key={region} className="mb-8">
          {settings.groupByRegion && (
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{region}</h2>
          )}
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  {settings.showMarketPrices && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        {settings.includeSeasonality && (
                          <div className="flex items-center mt-1">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              product.inSeason ? 'bg-green-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-xs text-gray-500">{product.seasonality}</span>
                          </div>
                        )}
                        {product.isOrganic && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Organic
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.packageType}
                      {product.countSize && <div className="text-xs text-gray-500">{product.countSize}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.basePrice)}
                    </td>
                    {settings.showMarketPrices && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(product.marketPrice)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.availability === 'Available' 
                          ? 'bg-green-100 text-green-800'
                          : product.availability === 'Limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.availability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPremiumTemplate = () => (
    <div className="bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {settings.companyLogo && (
              <img src={settings.companyLogo} alt="Company logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {companyName}
              </h1>
              <p className="text-gray-600 text-lg">Premium Price Sheet - {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products by Region */}
      {Object.entries(productsByRegion).map(([region, products]) => (
        <div key={region} className="mb-8 px-6">
          {settings.groupByRegion && (
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 mr-3 rounded"></div>
              {region}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.productName}</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      {product.isOrganic && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          🌱 Organic
                        </span>
                      )}
                      {settings.includeSeasonality && (
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            product.inSeason ? 'bg-green-400' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm text-gray-600">{product.seasonality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{formatPrice(product.basePrice)}</div>
                    {settings.showMarketPrices && (
                      <div className="text-sm text-gray-500">Market: {formatPrice(product.marketPrice)}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Package:</span>
                      <div className="font-medium">{product.packageType}</div>
                      {product.countSize && <div className="text-gray-500">{product.countSize}</div>}
                    </div>
                    <div>
                      <span className="text-gray-500">Grade:</span>
                      <div className="font-medium">{product.grade}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.availability === 'Available' 
                        ? 'bg-green-100 text-green-800'
                        : product.availability === 'Limited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.availability}
                    </span>
                    {!settings.groupByRegion && (
                      <span className="text-sm text-gray-500">{product.region}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderCompactTemplate = () => (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings.companyLogo && (
              <img src={settings.companyLogo} alt="Company logo" className="h-8 w-8 object-contain" />
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{companyName}</h1>
              <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products by Region */}
      {Object.entries(productsByRegion).map(([region, products]) => (
        <div key={region} className="mb-6">
          {settings.groupByRegion && (
            <h2 className="text-sm font-semibold text-gray-900 mb-2 bg-gray-50 px-2 py-1">{region}</h2>
          )}
          
          <div className="overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Pkg</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  {settings.showMarketPrices && (
                    <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Mkt</th>
                  )}
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Avail</th>
                  {settings.includeSeasonality && (
                    <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Season</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900">{product.productName}</span>
                        {product.isOrganic && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            O
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1 text-gray-900">
                      <div>{product.packageType}</div>
                      {product.countSize && <div className="text-gray-500">{product.countSize}</div>}
                    </td>
                    <td className="px-2 py-1 text-gray-900">{product.grade}</td>
                    <td className="px-2 py-1 font-medium text-gray-900">{formatPrice(product.basePrice)}</td>
                    {settings.showMarketPrices && (
                      <td className="px-2 py-1 text-gray-500">{formatPrice(product.marketPrice)}</td>
                    )}
                    <td className="px-2 py-1">
                      <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                        product.availability === 'Available' 
                          ? 'bg-green-100 text-green-800'
                          : product.availability === 'Limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.availability === 'Available' ? 'A' : product.availability === 'Limited' ? 'L' : 'N/A'}
                      </span>
                    </td>
                    {settings.includeSeasonality && (
                      <td className="px-2 py-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            product.inSeason ? 'bg-green-400' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-gray-600">{product.seasonality}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTemplate = () => {
    switch (template) {
      case 'premium':
        return renderPremiumTemplate()
      case 'compact':
        return renderCompactTemplate()
      default:
        return renderClassicTemplate()
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Price Sheet Preview - {template.charAt(0).toUpperCase() + template.slice(1)} Template
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        This is how your price sheets will look with your current settings
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    {renderTemplate()}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
