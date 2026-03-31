'use client'

import { useState } from 'react'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../components/ui'

const PRODUCT_DATA_SOURCES = [
  {
    name: 'Spreadsheet / CSV',
    logo: '📊',
    tagline: 'Excel, Google Sheets, any CSV',
    type: 'Quick Import',
    status: 'available' as const,
    action: 'upload' as const,
  },
  {
    name: 'Manual Entry',
    logo: '✏️',
    tagline: 'Add items directly in AcreList',
    type: 'Manual',
    status: 'available' as const,
    cta: 'Start setup',
    ctaHref: '/dashboard/price-sheets/regions',
  },
  {
    name: 'Famous Software',
    logo: '🏭',
    tagline: 'Item master & pack configs',
    type: 'ERP System',
    status: 'coming_soon' as const,
    notifyLabel: 'I use Famous',
  },
  {
    name: 'GrubMarket',
    logo: '🛒',
    tagline: 'Product catalog & varieties',
    type: 'Marketplace',
    status: 'coming_soon' as const,
    notifyLabel: 'I use GrubMarket',
  },
]

const SALES_DATA_SOURCES = [
  {
    name: 'Spreadsheet / CSV',
    logo: '📊',
    tagline: 'Any exported sales history',
    type: 'Quick Import',
    status: 'available' as const,
    action: 'upload' as const,
  },
  {
    name: 'Famous Software',
    logo: '🏭',
    tagline: 'Invoice & FOB price history',
    type: 'ERP System',
    status: 'coming_soon' as const,
    notifyLabel: 'I use Famous',
  },
  {
    name: 'GrubMarket',
    logo: '🛒',
    tagline: 'Order history & pricing',
    type: 'Marketplace',
    status: 'coming_soon' as const,
    notifyLabel: 'I use GrubMarket',
  },
  {
    name: 'QuickBooks',
    logo: '📒',
    tagline: 'Invoice history by commodity',
    type: 'Accounting',
    status: 'coming_soon' as const,
    notifyLabel: 'I use QuickBooks',
  },
]

type Source = typeof PRODUCT_DATA_SOURCES[number]

const TYPE_COLORS: Record<string, string> = {
  'Quick Import': 'bg-blue-50 text-blue-600',
  'ERP System':   'bg-purple-50 text-purple-600',
  'Marketplace':  'bg-orange-50 text-orange-600',
  'Accounting':   'bg-yellow-50 text-yellow-700',
  'Manual':       'bg-gray-100 text-gray-500',
}

function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Upload File</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center gap-3 text-center hover:border-gray-300 transition-colors cursor-pointer">
            <ArrowUpTrayIcon className="h-7 w-7 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">Drop your file here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse — CSV, XLS, XLSX</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            We&apos;ll map your columns and import your data. File import coming soon —{' '}
            <a href="mailto:hello@acrelist.ag?subject=Data Import" className="underline hover:text-gray-600">
              send us your file directly
            </a>{' '}
            in the meantime.
          </p>
        </div>
      </div>
    </div>
  )
}

function IntegrationCard({ source, onUpload }: { source: Source; onUpload: () => void }) {
  const isAvailable = source.status === 'available'
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{source.logo}</span>
        {isAvailable ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-lime-100 text-lime-700">Ready</span>
        ) : (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Coming soon</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{source.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{source.tagline}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${TYPE_COLORS[source.type] ?? 'bg-gray-100 text-gray-500'}`}>
          {source.type}
        </span>
        {'action' in source && source.action === 'upload' ? (
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-900 hover:bg-black text-white text-xs font-medium transition-colors"
          >
            <ArrowUpTrayIcon className="h-3 w-3" />
            Upload
          </button>
        ) : 'ctaHref' in source && source.ctaHref ? (
          <a
            href={source.ctaHref}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gray-900 hover:bg-black text-white text-xs font-medium transition-colors"
          >
            {(source as any).cta}
          </a>
        ) : (
          <a
            href={`mailto:hello@acrelist.ag?subject=Integration request: ${source.name}&body=I use ${source.name} and would like this integration.`}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Notify me
          </a>
        )}
      </div>
    </div>
  )
}

function sortedSources(sources: Source[]) {
  return [...sources].sort((a, b) => {
    if (a.status === b.status) return 0
    return a.status === 'available' ? -1 : 1
  })
}

export default function IntegrationsPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      <div className="mb-8">
        <Breadcrumbs
          items={[{ label: 'Integrations', current: true }]}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-gray-600">Connect your existing data to get set up in minutes.</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Product Data</h2>
            <p className="text-xs text-gray-500 mt-0.5">Shipping points, commodities, and pack configurations</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {sortedSources(PRODUCT_DATA_SOURCES).map(s => (
              <IntegrationCard key={s.name + 'product'} source={s} onUpload={() => setShowUpload(true)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Historical Sales Data</h2>
            <p className="text-xs text-gray-500 mt-0.5">Powers AI pricing — the more history, the smarter the recommendations</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {sortedSources(SALES_DATA_SOURCES).map(s => (
              <IntegrationCard key={s.name + 'sales'} source={s} onUpload={() => setShowUpload(true)} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Using something not listed?{' '}
        <a href="mailto:hello@acrelist.ag?subject=Integration request" className="underline hover:text-gray-600">
          Tell us what you&apos;re using
        </a>{' '}
        and we&apos;ll prioritise it.
      </p>
    </div>
  )
}
