import Link from 'next/link'
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  PaperAirplaneIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

export default function PriceSheets() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Sheets</h1>
          <p className="mt-2 text-gray-600">Your price sheet management hub - create, manage data, and send to contacts.</p>
        </div>
      </div>

      {/* Three Main Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Manage Your Data */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Manage Your Data</h3>
                  <p className="text-sm text-gray-500">Setup regions, crops & capabilities</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Growing Regions</span>
                </div>
                <span className="text-sm font-semibold text-green-600">3 configured</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Crop Commodities</span>
                </div>
                <span className="text-sm font-semibold text-green-600">8 commodities</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Capabilities & Certs</span>
                </div>
                <span className="text-sm font-semibold text-green-600">4 configured</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard/price-sheets/setup"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Manage Data Setup
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Configure your growing regions, crop varieties, and capabilities to power your price sheets.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Create Price Sheets */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Create Price Sheets</h3>
                  <p className="text-sm text-gray-500">Generate professional price sheets</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-sm font-medium text-green-800 mb-1">Ready to Generate</h4>
                <p className="text-sm text-green-700">
                  Your setup is complete! Create price sheets with your configured products and pricing.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">15</div>
                  <div className="text-gray-600">Total Products</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">3</div>
                  <div className="text-gray-600">Regions</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard/price-sheets/new"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Price Sheet
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Select products, set pricing, and generate professional price sheets for your buyers.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Send & Manage */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <PaperAirplaneIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Send & Manage</h3>
                  <p className="text-sm text-gray-500">Distribute to your contacts</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Saved Price Sheets</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">3 ready</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Active Contacts</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">23 contacts</span>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <div className="text-xs font-medium text-purple-800">Dynamic Pricing</div>
                <div className="text-xs text-purple-700 mt-1">Auto-adjust prices by contact tier</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard/price-sheets/send"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Price Sheets
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Select saved price sheets and send to your contacts with automatic pricing optimization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/contacts"
            className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Manage Contacts</span>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </Link>
          
          <Link
            href="/dashboard/analytics"
            className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">View Analytics</span>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </Link>
          
          <Link
            href="/dashboard/price-sheets/templates"
            className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Price Sheet Templates</span>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </>
  )
}