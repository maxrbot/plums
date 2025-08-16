import { ChartBarIcon, EyeIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

// Mock analytics data
const mockAnalytics = {
  totalViews: 1247,
  totalContacts: 89,
  engagementRate: 78,
  topPerformingSheet: 'Organic Strawberries - Spring 2024',
  recentActivity: [
    { date: '2024-03-15', views: 45, contacts: 8 },
    { date: '2024-03-14', views: 32, contacts: 5 },
    { date: '2024-03-13', views: 67, contacts: 12 },
    { date: '2024-03-12', views: 28, contacts: 4 },
    { date: '2024-03-11', views: 53, contacts: 9 },
  ]
}

export default function Analytics() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Track engagement and optimize your price sheet performance.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockAnalytics.totalViews.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockAnalytics.totalContacts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
                              <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Engagement Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockAnalytics.engagementRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Views/Day</dt>
                  <dd className="text-lg font-medium text-gray-900">45</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Top Performing Price Sheet */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Price Sheet</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{mockAnalytics.topPerformingSheet}</h4>
                <p className="text-sm text-gray-500 mt-1">156 views • 23 contacts</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">+23%</p>
                <p className="text-sm text-gray-500">vs last week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity (5 days)</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockAnalytics.recentActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">{new Date(day.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.views} views • {day.contacts} contacts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Chart Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Engagement Over Time</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization coming soon</p>
              <p className="text-sm text-gray-400">View trends, patterns, and insights</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
