'use client'

import { useState, useEffect, Fragment } from 'react'
import { 
  ChartBarIcon, 
  EyeIcon, 
  UserGroupIcon, 
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { analyticsApi } from '@/lib/api'

interface AnalyticsData {
  summary: {
    totalSends: number
    totalSheetViews: number
    viewRate: number
    uniqueViewers: number
    dateRange: { start: Date; end: Date }
  }
  priceSheets: Array<{
    priceSheetId: string
    priceSheet: {
      title: string
      _id: string
    }
    sends: Array<{
      emailId: string
      contact: {
        id: string
        firstName: string
        lastName: string
        company: string
        email: string
      } | null
      sentAt: Date
      sheetViews: number
      lastViewedAt: Date | null
      contactHash: string
    }>
    totalRecipients: number
    sheetViews: number
    lastSentAt: Date
    viewRate: number
    avgViewsPerRecipient: string
  }>
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await analyticsApi.getOverview()
      setAnalytics(data)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRow = (priceSheetId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(priceSheetId)) {
        newSet.delete(priceSheetId)
      } else {
        newSet.add(priceSheetId)
      }
      return newSet
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
        <p className="mt-2 text-sm text-red-700">{error || 'No data available'}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track price sheet performance and engagement (Last 30 days)
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sends</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalSends}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <EyeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sheet Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.totalSheetViews}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({analytics.summary.viewRate}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Viewers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.uniqueViewers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sent Price Sheets</h2>
        </div>

        {analytics.priceSheets.length === 0 ? (
          <div className="p-12 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Send your first price sheet to start tracking analytics
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Sheet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sheet Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.priceSheets.map((ps) => {
                  const isExpanded = expandedRows.has(ps.priceSheetId)
                  const lastActivity = ps.sends.reduce((latest, send) => {
                    const sendDate = new Date(send.lastViewedAt || send.sentAt)
                    return sendDate > latest ? sendDate : latest
                  }, new Date(0))

                  return (
                    <Fragment key={ps.priceSheetId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {ps.priceSheet?.title || 'Untitled'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Sent {formatDate(ps.lastSentAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ps.totalRecipients}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ps.sheetViews} <span className="text-gray-500">({ps.viewRate}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatRelativeTime(lastActivity)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleRow(ps.priceSheetId)}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDownIcon className="h-4 w-4 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronRightIcon className="h-4 w-4 mr-1" />
                                View Details
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Recipient Details
                              </h4>
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        Sent At
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        Contact
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        Sheet Views
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        Last Viewed
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {ps.sends.map((send) => {
                                      const previewUrl = `/ps/${ps.priceSheetId}?c=${send.contactHash}&preview=true`
                                      
                                      return (
                                        <tr key={send.emailId.toString()} className="hover:bg-gray-50">
                                          <td className="px-4 py-3">
                                            <div className="text-sm text-gray-600">
                                              {formatDate(send.sentAt)}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-sm">
                                              <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                              >
                                                {send.contact?.firstName} {send.contact?.lastName}
                                              </a>
                                              <div className="text-gray-500 text-xs">
                                                {send.contact?.company}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm text-gray-900">
                                                {send.sheetViews} {send.sheetViews === 1 ? 'view' : 'views'}
                                              </span>
                                              <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Preview what they see"
                                              >
                                                <EyeIcon className="h-4 w-4" />
                                              </a>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-sm text-gray-500">
                                              {formatRelativeTime(send.lastViewedAt)}
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
