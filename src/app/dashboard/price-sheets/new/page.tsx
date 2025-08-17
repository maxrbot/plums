import Link from 'next/link'
import {
  DocumentTextIcon,
  SparklesIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

export default function NewPriceSheet() {
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

      {/* Setup Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-4">
          <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Setup Complete! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              All required data has been configured. You&apos;re ready to create professional price sheets with accurate pricing, capabilities, and growing regions.
            </p>
            
            {/* Setup Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">3 Growing Regions</p>
                  <p className="text-xs text-green-700">Central Valley, Salinas Valley, Imperial Valley</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">8 Crops Configured</p>
                  <p className="text-xs text-green-700">Strawberries, Lettuce, Tomatoes, and more</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">4 Capabilities</p>
                  <p className="text-xs text-green-700">Organic, Food Safety, Sustainability, Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Sheet Generator */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Price Sheet Generator</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Price Sheet Generator Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This is where suppliers will be able to generate professional price sheets using their configured data, with AI-powered pricing suggestions and dynamic content.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link
                href="/dashboard/price-sheets"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Price Sheets
              </Link>
              <Link
                href="/dashboard/price-sheets/setup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Manage Your Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
