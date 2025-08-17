import Link from 'next/link'
import { 
  MapPinIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../../components/ui'

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

export default function Setup() {
  const totalMetrics = Object.values(mockSetupMetrics).reduce((sum, metric) => sum + metric.count, 0)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Price Sheets', href: '/dashboard/price-sheets' },
            { label: 'Setup Your Data', current: true }
          ]} 
          className="mb-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Data Overview</h1>
          <p className="mt-2 text-gray-600">Manage your growing regions, crop catalog, and capabilities that power your price sheets.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ready to Generate Price Sheets</h3>
            <p className="text-sm text-gray-600 mt-1">
              You have <span className="font-medium text-blue-600">{totalMetrics} items</span> configured across your growing regions, commodities, and capabilities.
            </p>
          </div>
          <Link
            href="/dashboard/price-sheets/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Price Sheet
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.values(mockSetupMetrics).map((metric) => {
          const Icon = metric.icon
          
          return (
            <div key={metric.name} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                      <p className="text-sm text-gray-500">{metric.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Big Number */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600">{metric.count}</div>
                  <div className="text-sm text-gray-500">
                    {metric.name === 'Growing Regions' ? 'active regions' :
                     metric.name === 'Commodities' ? 'configured commodities' :
                     'capabilities & certifications'}
                  </div>
                </div>
                
                {/* Details */}
                <div className="space-y-1 mb-4">
                  {metric.details.slice(0, 3).map((detail, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                      {detail}
                    </div>
                  ))}
                  {metric.details.length > 3 && (
                    <div className="text-sm text-gray-500 mt-2">
                      +{metric.details.length - 3} more...
                    </div>
                  )}
                </div>
                
                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Updated {new Date(metric.lastUpdated).toLocaleDateString()}
                  </span>
                  <Link
                    href={metric.href}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Manage
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/price-sheets/setup/regions"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Add Growing Region
          </Link>
          <Link
            href="/dashboard/price-sheets/setup/crops"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Add Commodity
          </Link>
          <Link
            href="/dashboard/price-sheets/setup/capabilities"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Add Capability
          </Link>
        </div>
      </div>
    </>
  )
}
