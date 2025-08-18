import Link from 'next/link'
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  PaperAirplaneIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

// Mock setup metrics - in real app this would come from API
const mockSetupMetrics = {
  regions: {
    count: 3,
    name: 'Growing Regions',
    description: 'Active growing regions and delivery zones',
    href: '/dashboard/price-sheets/setup/regions',
    icon: MapPinIcon,
    details: ['Central Valley - Fresno', 'Salinas Valley', 'Imperial Valley'],
    lastUpdated: '2024-03-10'
  },
  crops: {
    count: 8,
    name: 'Commodities',
    description: 'Configured crop varieties and seasons',
    href: '/dashboard/price-sheets/setup/crops',
    icon: SparklesIcon,
    details: ['3 Organic varieties', '5 Conventional varieties', '12 total variations'],
    lastUpdated: '2024-03-15'
  },
  capabilities: {
    count: 4,
    name: 'Capabilities & Certs',
    description: 'Processing capabilities and certifications',
    href: '/dashboard/price-sheets/setup/capabilities',
    icon: ShieldCheckIcon,
    details: ['USDA Organic', 'Food Safety Certified', 'Cold Storage', 'Custom Packaging'],
    lastUpdated: '2024-03-18'
  }
}

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

      {/* Main Action Sections */}
      <div className="space-y-8">
        
        {/* 1. Manage Your Data - Full Width Horizontal */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
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
            
            {/* Data Management Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {Object.values(mockSetupMetrics).map((metric) => {
                const Icon = metric.icon
                
                return (
                  <div key={metric.name} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{metric.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{metric.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-blue-600">{metric.count}</div>
                        <div className="text-xs text-gray-500">
                          {metric.name === 'Growing Regions' ? 'regions' :
                           metric.name === 'Commodities' ? 'commodities' :
                           'capabilities'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-1 mb-3">
                      {metric.details.slice(0, 2).map((detail, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="truncate">{detail}</span>
                        </div>
                      ))}
                      {metric.details.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{metric.details.length - 2} more...
                        </div>
                      )}
                    </div>
                    
                    {/* Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 truncate">
                        Updated {new Date(metric.lastUpdated).toLocaleDateString()}
                      </span>
                      <Link
                        href={metric.href}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      >
                        Manage
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>

        {/* Generate and Send Actions - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 2. Generate Price Sheets */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Generate Price Sheets</h3>
                    <p className="text-sm text-gray-500">Create professional price sheets</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
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
                  Generate New Price Sheet
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
      </div>


    </>
  )
}