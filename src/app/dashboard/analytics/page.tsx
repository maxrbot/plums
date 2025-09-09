'use client'

import { useState } from 'react'
import { ChartBarIcon, EyeIcon, UserGroupIcon, ArrowTrendingUpIcon, PaperAirplaneIcon, ClockIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, ShareIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useUser } from '@/contexts/UserContext'

// Mock analytics data
const mockAnalytics = {
  totalViews: 1247,
  totalContacts: 89,
  engagementRate: 78,
  avgViewsPerDay: 45,
  forwardRate: 12,
  avgViewTime: '2m 34s'
}

// Mock timing optimization data
const mockTimingData = {
  bestSendTime: '9:00 AM',
  bestSendDay: 'Tuesday',
  peakEngagementHour: '10:00 AM',
  hourlyEngagement: [
    { hour: '6 AM', rate: 15 },
    { hour: '7 AM', rate: 28 },
    { hour: '8 AM', rate: 45 },
    { hour: '9 AM', rate: 78 },
    { hour: '10 AM', rate: 85 },
    { hour: '11 AM', rate: 72 },
    { hour: '12 PM', rate: 58 },
    { hour: '1 PM', rate: 42 },
    { hour: '2 PM', rate: 65 },
    { hour: '3 PM', rate: 71 },
    { hour: '4 PM', rate: 68 },
    { hour: '5 PM', rate: 35 }
  ],
  dailyEngagement: [
    { day: 'Mon', rate: 65 },
    { day: 'Tue', rate: 85 },
    { day: 'Wed', rate: 78 },
    { day: 'Thu', rate: 72 },
    { day: 'Fri', rate: 58 },
    { day: 'Sat', rate: 25 },
    { day: 'Sun', rate: 18 }
  ]
}

// Mock format preference data
const mockFormatData = {
  emailViews: 68,
  mobileViews: 32,
  desktopViews: 45,
  pdfDownloads: 23,
  webViews: 77,
  avgTimeByFormat: {
    email: '1m 45s',
    mobile: '2m 12s',
    desktop: '3m 28s'
  }
}

// Mock contact engagement data with status types
const mockContacts = [
  { id: '1', name: 'Sarah Chen', company: 'Fresh Market Co.', email: 'sarah@freshmarket.com', status: 'opened', openTime: '2h ago', forwarded: true, contactType: 'active' },
  { id: '2', name: 'Mike Rodriguez', company: 'Valley Distributors', email: 'mike@valleydist.com', status: 'opened', openTime: '4h ago', forwarded: false, contactType: 'active' },
  { id: '3', name: 'Emily Johnson', company: 'Organic Plus', email: 'emily@organicplus.com', status: 'opened', openTime: '1d ago', forwarded: true, contactType: 'active' },
  { id: '4', name: 'David Park', company: 'Premium Produce', email: 'david@premiumproduce.com', status: 'not_opened', openTime: null, forwarded: false, contactType: 'prospect' },
  { id: '5', name: 'Lisa Thompson', company: 'Green Grocers', email: 'lisa@greengrocers.com', status: 'opened', openTime: '3h ago', forwarded: false, contactType: 'active' },
  { id: '6', name: 'Carlos Martinez', company: 'Farm Fresh Foods', email: 'carlos@farmfresh.com', status: 'not_opened', openTime: null, forwarded: false, contactType: 'prospect' },
  { id: '7', name: 'Jennifer Wu', company: 'Quality Foods', email: 'jennifer@qualityfoods.com', status: 'opened', openTime: '5h ago', forwarded: true, contactType: 'active' },
  { id: '8', name: 'Robert Kim', company: 'Metro Markets', email: 'robert@metromarkets.com', status: 'opened', openTime: '6h ago', forwarded: false, contactType: 'prospect' }
]

// Generate realistic price sheet names with current dates and contact details
const generateRecentSends = (companyName: string = 'AgriFarm Co.') => {
  const baseDate = new Date('2025-09-03T09:30:00Z') // Start from 9/3/2025
  
  return [
    {
      id: '1',
      title: `${companyName} Price Sheet - 9/3/2025`,
      sentDate: new Date(baseDate).toISOString(),
      sentTo: 12,
      opens: 8,
      openRate: 67,
      forwardRate: 15,
      status: 'sent',
      regions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
      contacts: mockContacts.slice(0, 12).map((contact, index) => ({
        ...contact,
        status: index < 8 ? contact.status : 'not_opened',
        forwarded: index < 8 ? contact.forwarded : false
      }))
    },
    {
      id: '2',
      title: `${companyName} Price Sheet - 9/2/2025`,
      sentDate: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      sentTo: 8,
      opens: 6,
      openRate: 75,
      forwardRate: 12,
      status: 'sent',
      regions: ['Central Valley - Fresno'],
      contacts: mockContacts.slice(0, 8).map((contact, index) => ({
        ...contact,
        status: index < 6 ? contact.status : 'not_opened',
        forwarded: index < 6 ? contact.forwarded : false
      }))
    },
    {
      id: '3',
      title: `${companyName} Price Sheet - 9/1/2025`,
      sentDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentTo: 15,
      opens: 11,
      openRate: 73,
      forwardRate: 18,
      status: 'sent',
      regions: ['Central Valley - Fresno', 'Salinas Valley - Salinas'],
      contacts: mockContacts.slice(0, 15).map((contact, index) => ({
        ...contact,
        id: `${contact.id}-3`,
        status: index < 11 ? contact.status : 'not_opened',
        forwarded: index < 11 ? contact.forwarded : false
      }))
    },
    {
      id: '4',
      title: `${companyName} Price Sheet - 8/31/2025`,
      sentDate: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sentTo: 6,
      opens: 4,
      openRate: 67,
      forwardRate: 8,
      status: 'sent',
      regions: ['Central Valley - Fresno'],
      contacts: mockContacts.slice(0, 6).map((contact, index) => ({
        ...contact,
        id: `${contact.id}-4`,
        status: index < 4 ? contact.status : 'not_opened',
        forwarded: index < 4 ? contact.forwarded : false
      }))
    },
    {
      id: '5',
      title: `${companyName} Price Sheet - 8/30/2025`,
      sentDate: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sentTo: 9,
      opens: 5,
      openRate: 56,
      forwardRate: 5,
      status: 'sent',
      regions: ['Central Valley - Fresno'],
      contacts: mockContacts.slice(0, 9).map((contact, index) => ({
        ...contact,
        id: `${contact.id}-5`,
        status: index < 5 ? contact.status : 'not_opened',
        forwarded: index < 5 ? contact.forwarded : false
      }))
    }
  ]
}

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
  const { user } = useUser()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  // Get company name from user profile, fallback to default
  const companyName = user?.profile?.companyName || 'AgriFarm Co.'
  const mockRecentSends = generateRecentSends(companyName)
  
  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

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
            const isExpanded = expandedRows.has(send.id)
            
            return (
              <div key={send.id}>
                <div 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(send.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                          <PaperAirplaneIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{send.title}</h4>
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
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
                      
                      {/* Forward Rate */}
                      <div className="text-center">
                        <div className={`font-medium ${
                          send.forwardRate >= 15 ? 'text-purple-600' :
                          send.forwardRate >= 10 ? 'text-indigo-600' :
                          'text-gray-600'
                        }`}>
                          {send.forwardRate}%
                        </div>
                        <div className="text-xs text-gray-500">Forward Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Contact Details */}
                {isExpanded && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="ml-11 pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Contact Engagement Details</h5>
                      
                      {(() => {
                        // Group contacts by type
                        const activeContacts = send.contacts?.filter(c => c.contactType === 'active') || []
                        const prospectContacts = send.contacts?.filter(c => c.contactType === 'prospect') || []
                        
                        return (
                          <div className="space-y-6">
                            {/* Active Customers */}
                            {activeContacts.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <h6 className="text-sm font-semibold text-gray-900">Active Customers ({activeContacts.length})</h6>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Forwarded</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {activeContacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                              <div className={`w-2 h-2 rounded-full ${contact.status === 'opened' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                              <div>
                                                <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                <div className="text-xs text-gray-500">{contact.email}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{contact.company}</div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              contact.status === 'opened' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {contact.status === 'opened' ? 'Opened' : 'Not opened'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {contact.status === 'opened' && contact.openTime ? contact.openTime : '—'}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {contact.forwarded ? (
                                              <ShareIcon className="h-4 w-4 text-purple-600 mx-auto" title="Forwarded" />
                                            ) : (
                                              <span className="text-gray-300">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {/* Prospects */}
                            {prospectContacts.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <h6 className="text-sm font-semibold text-gray-900">Prospects ({prospectContacts.length})</h6>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Forwarded</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {prospectContacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                              <div className={`w-2 h-2 rounded-full ${contact.status === 'opened' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                              <div>
                                                <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                <div className="text-xs text-gray-500">{contact.email}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{contact.company}</div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              contact.status === 'opened' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {contact.status === 'opened' ? 'Opened' : 'Not opened'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {contact.status === 'opened' && contact.openTime ? contact.openTime : '—'}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {contact.forwarded ? (
                                              <ShareIcon className="h-4 w-4 text-purple-600 mx-auto" title="Forwarded" />
                                            ) : (
                                              <span className="text-gray-300">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timing Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Optimal Send Times</h3>
            <p className="text-sm text-gray-500">When your customers are most engaged</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockTimingData.bestSendTime}</div>
                <div className="text-sm text-gray-600">Best Send Time</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockTimingData.bestSendDay}</div>
                <div className="text-sm text-gray-600">Best Send Day</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Engagement by Day</h4>
              {mockTimingData.dailyEngagement.map((item) => (
                <div key={item.day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-12">{item.day}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Format Performance</h3>
            <p className="text-sm text-gray-500">How customers prefer to view your sheets</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{mockFormatData.mobileViews}%</div>
                  <div className="text-xs text-gray-600">Mobile Views</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ComputerDesktopIcon className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{mockFormatData.desktopViews}%</div>
                  <div className="text-xs text-gray-600">Desktop Views</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Email Format</span>
                  <span className="text-gray-900">{mockFormatData.emailViews}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${mockFormatData.emailViews}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg. time: {mockFormatData.avgTimeByFormat.email}</div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Web View</span>
                  <span className="text-gray-900">{mockFormatData.webViews}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${mockFormatData.webViews}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg. time: {mockFormatData.avgTimeByFormat.desktop}</div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">PDF Downloads</span>
                  <span className="text-gray-900">{mockFormatData.pdfDownloads}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${mockFormatData.pdfDownloads}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Highest engagement format</div>
              </div>
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
