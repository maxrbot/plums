'use client'

import { useState, useEffect, Fragment } from 'react'
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FireIcon,
  ClockIcon,
  CurrencyDollarIcon,
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

interface ContactInsights {
  topEngaged: Array<{
    contactId: string
    firstName: string
    lastName: string
    company: string
    email: string
    totalSends: number
    totalViews: number
    openRate: number
    lastViewedAt: string | null
    lastSentAt: string
    daysSinceLastSend: number
  }>
  needsReEngagement: Array<{
    contactId: string
    firstName: string
    lastName: string
    company: string
    totalSends: number
    lastSentAt: string
    daysSinceLastSend: number
  }>
  pricingDistribution: {
    totalContacted: number
    standardCount: number
    customPricingCount: number
    cropFilterCount: number
    avgGlobalAdjustment: number
  }
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [contactInsights, setContactInsights] = useState<ContactInsights | null>(null)
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
      const [overview, insights] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getContactInsights(),
      ])
      setAnalytics(overview)
      setContactInsights(insights)
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatRelativeTime = (date: Date | string | null) => {
    if (!date) return 'Never'
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
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

  const dist = contactInsights?.pricingDistribution
  const customPct = dist && dist.totalContacted > 0
    ? Math.round((dist.customPricingCount / dist.totalContacted) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Price sheet performance and buyer engagement
        </p>
      </div>

      {/* Summary Metrics — last 30 days */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Last 30 days</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Sends</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalSends}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <EyeIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sheet Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.totalSheetViews}
                  <span className="text-sm font-normal text-gray-400 ml-1.5">({analytics.summary.viewRate}%)</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unique Viewers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.uniqueViewers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Intelligence — all time */}
      {contactInsights && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Buyer Intelligence — All Time</p>
          <div className="grid grid-cols-2 gap-4">

            {/* Hottest Buyers */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <FireIcon className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-900">Most Engaged Buyers</h2>
              </div>
              {contactInsights.topEngaged.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">No view data yet</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Buyer</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500">Views</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500">Sends</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Last viewed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contactInsights.topEngaged.map((c, i) => (
                      <tr key={c.contactId} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-medium w-4 text-right">{i + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                              <p className="text-gray-400">{c.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="font-semibold text-gray-900">{c.totalViews}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">{c.totalSends}</td>
                        <td className="px-4 py-2.5 text-right text-gray-500">
                          {c.lastViewedAt ? formatRelativeTime(c.lastViewedAt) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Re-Engagement */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900">Re-Engagement Needed</h2>
                <span className="ml-auto text-xs text-gray-400">30+ days since last send</span>
              </div>
              {contactInsights.needsReEngagement.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Everyone is up to date</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Buyer</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500">Sends</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Last sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contactInsights.needsReEngagement.map(c => (
                      <tr key={c.contactId} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-gray-400">{c.company}</p>
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">{c.totalSends}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-medium ${c.daysSinceLastSend > 60 ? 'text-red-600' : 'text-amber-600'}`}>
                            {c.daysSinceLastSend}d ago
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pricing Intelligence */}
          {dist && dist.totalContacted > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                <h2 className="text-sm font-semibold text-gray-900">Pricing Intelligence</h2>
                <span className="ml-1 text-xs text-gray-400">across {dist.totalContacted} contacted buyer{dist.totalContacted !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{dist.standardCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Standard pricing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{dist.customPricingCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Custom pricing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{dist.cropFilterCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Crop filtered</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${dist.avgGlobalAdjustment < 0 ? 'text-green-600' : dist.avgGlobalAdjustment > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {dist.avgGlobalAdjustment === 0 ? '—' : `${dist.avgGlobalAdjustment > 0 ? '+' : ''}${dist.avgGlobalAdjustment}%`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Avg adjustment</p>
                </div>
              </div>
              {/* Distribution bar */}
              {dist.totalContacted > 0 && (
                <div className="mt-4">
                  <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
                    <div
                      className="bg-green-400 transition-all"
                      style={{ width: `${100 - customPct}%` }}
                    />
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${customPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                    <span>{100 - customPct}% standard</span>
                    <span>{customPct}% custom</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sent Price Sheets table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Sent Price Sheets</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
        </div>

        {analytics.priceSheets.length === 0 ? (
          <div className="p-12 text-center">
            <ChartBarIcon className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Send your first price sheet to start tracking analytics
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Sheet</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
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
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-900">{ps.priceSheet?.title || 'Untitled'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Sent {formatDate(ps.lastSentAt)}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-700">{ps.totalRecipients}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-gray-900">{ps.sheetViews}</span>
                          <span className="text-gray-400 ml-1">({ps.viewRate}%)</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                          {formatRelativeTime(lastActivity)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleRow(ps.priceSheetId)}
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? (
                              <><ChevronDownIcon className="h-3.5 w-3.5 mr-1" />Hide</>
                            ) : (
                              <><ChevronRightIcon className="h-3.5 w-3.5 mr-1" />Recipients</>
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-5 py-4 bg-gray-50">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <table className="min-w-full text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Contact</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Sent</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Views</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Last Viewed</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {ps.sends.map((send) => {
                                    const previewUrl = `/ps/${ps.priceSheetId}?c=${send.contactHash}&preview=true`
                                    return (
                                      <tr key={send.emailId.toString()} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                          <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-blue-600 hover:underline"
                                          >
                                            {send.contact?.firstName} {send.contact?.lastName}
                                          </a>
                                          <p className="text-gray-400">{send.contact?.company}</p>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500">{formatDate(send.sentAt)}</td>
                                        <td className="px-4 py-2.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-gray-900">{send.sheetViews}</span>
                                            <a
                                              href={previewUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-gray-300 hover:text-blue-500"
                                              title="Preview what they see"
                                            >
                                              <EyeIcon className="h-3.5 w-3.5" />
                                            </a>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500">
                                          {formatRelativeTime(send.lastViewedAt)}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
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
