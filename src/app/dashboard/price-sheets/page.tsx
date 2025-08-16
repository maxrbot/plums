import Link from 'next/link'
import { PlusIcon, EyeIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline'

// Mock price sheet data
const mockPriceSheets = [
  {
    id: 1,
    name: 'Organic Strawberries - Spring 2024',
    status: 'active',
    views: 156,
    contacts: 23,
    lastSent: '2024-03-15',
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    name: 'Spring Vegetables Collection',
    status: 'active',
    views: 89,
    contacts: 15,
    lastSent: '2024-03-12',
    createdAt: '2024-03-08'
  },
  {
    id: 3,
    name: 'Premium Tomatoes - March',
    status: 'draft',
    views: 0,
    contacts: 0,
    lastSent: null,
    createdAt: '2024-03-14'
  }
]

export default function PriceSheets() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Price Sheets</h1>
            <p className="mt-2 text-gray-600">Create and manage your price sheets for buyers.</p>
          </div>
          <Link
            href="/dashboard/price-sheets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Price Sheet
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Price Sheets</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockPriceSheets.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPriceSheets.reduce((sum, sheet) => sum + sheet.views, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sheets</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPriceSheets.filter(sheet => sheet.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Sheets List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Price Sheets</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockPriceSheets.map((sheet) => (
            <div key={sheet.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{sheet.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      sheet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{sheet.views} views</span>
                    <span>{sheet.contacts} contacts</span>
                    {sheet.lastSent && (
                      <span>Last sent: {new Date(sheet.lastSent).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/price-sheets/${sheet.id}`}
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/price-sheets/${sheet.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
