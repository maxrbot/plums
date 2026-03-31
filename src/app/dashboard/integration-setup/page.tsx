"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../components/ui'
import { usersApi } from '@/lib/api'

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none'

interface AnalysisResults {
  companyName: string
  farmingMethods: string[]
  regions: string[]
  commodities: string[]
  contact: string
  confidence: Record<string, ConfidenceLevel>
}

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: 'text-green-500',
  medium: 'text-yellow-500',
  low: 'text-orange-400',
  none: 'text-red-400',
}

function ConfidenceIcon({ level }: { level: ConfidenceLevel }) {
  if (level === 'none' || level === 'low') {
    return <ExclamationTriangleIcon className={`h-5 w-5 ${CONFIDENCE_COLORS[level]}`} />
  }
  return <CheckCircleIcon className={`h-5 w-5 ${CONFIDENCE_COLORS[level]}`} />
}

export default function IntegrationSetup() {
  const [companyUrl, setCompanyUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [urlPlaceholder, setUrlPlaceholder] = useState('https://yourcompany.com')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    usersApi.getProfile().then((profile: any) => {
      const domain = profile?.email?.split('@')[1]
      if (domain) setUrlPlaceholder(`https://${domain}`)
    }).catch(() => {})
  }, [])

  const handleAnalyze = () => {
    if (!companyUrl) return
    setIsAnalyzing(true)
    setAnalysisResults(null)
    setTimeout(() => {
      setAnalysisResults({
        companyName: 'Your Farm',
        farmingMethods: ['Sustainable', 'GAP Certified'],
        regions: ['Central Valley, CA'],
        commodities: ['Detected from your website — review before importing'],
        contact: companyUrl.replace('https://', '').replace('http://', '').split('/')[0],
        confidence: {
          companyName: 'medium',
          farmingMethods: 'medium',
          regions: 'low',
          commodities: 'medium',
          contact: 'high',
        },
      })
      setIsAnalyzing(false)
    }, 2200)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs
          items={[{ label: 'Get Started', current: true }]}
          className="mb-4"
        />
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <RocketLaunchIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Get set up fast</h1>
            <p className="mt-1 text-gray-600">Scan your website or import existing data — skip the manual entry.</p>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* LEFT — Website scan */}
        <div className="flex-1 p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">Quick Start</span>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Scan your website</h2>
          <p className="text-xs text-gray-500 mb-6">AI pulls what it can from your site — a fast starting point you can fill in from there.</p>

          {!analysisResults ? (
            <>
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={e => setCompanyUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    placeholder={urlPlaceholder}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-lime-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!companyUrl || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700 transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing your website...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Launch AI Analysis
                  </>
                )}
              </button>

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { icon: SparklesIcon, color: 'bg-lime-100 text-lime-600', label: 'AI-Powered', desc: 'Extracts your data automatically' },
                  { icon: RocketLaunchIcon, color: 'bg-cyan-100 text-cyan-600', label: 'Takes 30 seconds', desc: 'Not hours of manual entry' },
                  { icon: CheckCircleIcon, color: 'bg-green-100 text-green-600', label: 'Review first', desc: 'Edit everything before it saves' },
                ].map(({ icon: Icon, color, label, desc }) => (
                  <div key={label} className="text-center p-3">
                    <div className={`h-9 w-9 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-semibold text-gray-900">Analysis complete</span>
                <span className="text-xs text-gray-400 truncate">{companyUrl}</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'companyName', label: 'Company Name', value: analysisResults.companyName },
                  { key: 'farmingMethods', label: 'Farming Methods', value: analysisResults.farmingMethods.join(', ') },
                  { key: 'regions', label: 'Growing Regions', value: analysisResults.regions.join(', ') },
                  { key: 'commodities', label: 'Commodities', value: analysisResults.commodities[0] },
                  { key: 'contact', label: 'Contact', value: analysisResults.contact },
                ].map(({ key, label, value }) => (
                  <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ConfidenceIcon level={analysisResults.confidence[key]} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700">{label}</p>
                        <p className="text-xs text-gray-500 truncate">{value}</p>
                      </div>
                    </div>
                    <button className="text-xs text-lime-600 hover:text-lime-800 font-medium ml-3 flex-shrink-0">Edit</button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setAnalysisResults(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Start over
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700 text-white text-xs font-medium shadow transition-all">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Preview & Import
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-center w-px flex-shrink-0 bg-gray-100" />

        {/* RIGHT — Import from data */}
        <div className="flex-1 p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-wide">Full Import</span>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Import your data</h2>
          <p className="text-xs text-gray-500 mb-6">Have a CSV or system export? It's 10× faster than manual entry — your entire catalog in one shot.</p>

          {/* CSV Upload */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl py-6 flex flex-col items-center gap-2 text-center transition-colors group mb-4"
          >
            <ArrowUpTrayIcon className="h-7 w-7 text-blue-400 group-hover:text-blue-500 transition-colors" />
            <div>
              <p className="text-sm font-medium text-gray-900">Upload a spreadsheet or CSV</p>
              <p className="text-xs text-gray-400 mt-0.5">Excel, Google Sheets, or any export — we'll map the columns</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 mt-1">Ready</span>
          </button>

          {/* ERP / System integrations — coming soon, no action */}
          <div className="space-y-2 mb-6">
            {[
              { logo: '🏭', name: 'Famous Software', desc: 'Item master, pack configs, invoice history' },
              { logo: '🛒', name: 'GrubMarket', desc: 'Product catalog and order history' },
              { logo: '📒', name: 'QuickBooks', desc: 'Invoice history by commodity' },
            ].map(s => (
              <div
                key={s.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 opacity-50 cursor-default select-none"
              >
                <span className="text-lg grayscale">{s.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">Coming soon</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/price-sheets/regions"
              className="flex items-center justify-between text-sm text-gray-400 hover:text-gray-600 transition-colors group"
            >
              <span>Prefer to enter everything manually?</span>
              <span className="flex items-center gap-1 text-xs font-medium group-hover:text-gray-700">
                Start manual setup <ArrowRightIcon className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Upload File</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center gap-3 text-center hover:border-lime-300 transition-colors cursor-pointer">
                <ArrowUpTrayIcon className="h-7 w-7 text-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Drop your file here</p>
                  <p className="text-xs text-gray-400 mt-0.5">or click to browse — CSV, XLS, XLSX</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                File import coming soon —{' '}
                <a href="mailto:hello@acrelist.ag?subject=Data Import" className="underline hover:text-gray-600">
                  send us your file directly
                </a>{' '}
                in the meantime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
