import { ChartBarIcon, EyeIcon, UserGroupIcon, ArrowTrendingUpIcon, PaperAirplaneIcon, ClockIcon } from '@heroicons/react/24/outline'

// Mock analytics data
const mockAnalytics = {
  totalViews: 1247,
  totalContacts: 89,
  engagementRate: 78,
  avgViewsPerDay: 45
}

// Mock recent price sheet sends (most recent first)
const mockRecentSends = [
  {
    id: '1',
    title: 'Spring Strawberries & Lettuce - March 2024',
    sentDate: '2024-03-15T09:30:00Z',
    sentTo: 12,
    opens: 8,
    openRate: 67,
    status: 'sent',
    regions: ['Central Valley - Fresno', 'Salinas Valley - Salinas']
  },
  {
    id: '2',
    title: 'Organic Tomato Collection',
    sentDate: '2024-03-14T14:15:00Z',
    sentTo: 8,
    opens: 6,
    openRate: 75,
    status: 'sent',
    regions: ['Central Valley - Fresno']
  },
  {
    id: '3',
    title: 'Weekly Mixed Vegetables',
    sentDate: '2024-03-13T08:45:00Z',
    sentTo: 15,
    opens: 11,
    openRate: 73,
    status: 'sent',
    regions: ['Central Valley - Fresno', 'Salinas Valley - Salinas']
  },
  {
    id: '4',
    title: 'Premium Bell Peppers & Cucumbers',
    sentDate: '2024-03-12T16:20:00Z',
    sentTo: 6,
    opens: 4,
    openRate: 67,
    status: 'sent',
    regions: ['Central Valley - Fresno']
  },
  {
    id: '5',
    title: 'End of Season Citrus Special',
    sentDate: '2024-03-11T11:00:00Z',
    sentTo: 9,
    opens: 5,
    openRate: 56,
    status: 'sent',
    regions: ['Central Valley - Fresno']
  }
]

// Helper function to get relative time
const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
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
                <EyeIcon className="h-6 w-6 text-blue-600" />
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
                  <dd className="text-lg font-medium text-gray-900">{mockAnalytics.avgViewsPerDay}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Price Sheet Activity */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Price Sheet Activity</h3>
            <p className="text-sm text-gray-500">Most recent sends first</p>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {mockRecentSends.map((send) => {
            const sentDate = new Date(send.sentDate)
            const timeAgo = getTimeAgo(sentDate)
            
            return (
              <div key={send.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                        <PaperAirplaneIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{send.title}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{timeAgo}</span>
                          </div>
                          <span>•</span>
                          <span>{send.regions.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    {/* Sent To */}
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{send.sentTo}</div>
                      <div className="text-xs text-gray-500">Sent To</div>
                    </div>
                    
                    {/* Opens */}
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{send.opens}</div>
                      <div className="text-xs text-gray-500">Opens</div>
                    </div>
                    
                    {/* Open Rate */}
                    <div className="text-center">
                      <div className={`font-medium ${
                        send.openRate >= 70 ? 'text-green-600' :
                        send.openRate >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {send.openRate}%
                      </div>
                      <div className="text-xs text-gray-500">Open Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
