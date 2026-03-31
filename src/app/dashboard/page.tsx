"use client"

import Link from 'next/link'
import {
  CheckCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  UsersIcon,
  PaperAirplaneIcon,
  ChevronRightIcon,
  LinkIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { useUserName, useUser } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import { regionsApi, cropsApi } from '@/lib/api'


const STEPS = [
  {
    key: 'shippingPoints' as const,
    label: 'Origin Locations',
    description: 'Add the locations your products ship from — warehouses, coolers, packing houses.',
    href: '/dashboard/price-sheets/regions',
    icon: MapPinIcon,
    cta: 'Add locations',
  },
  {
    key: 'products' as const,
    label: 'Product Catalog',
    description: 'Add the commodities and varieties you grow. Your team will use this as the foundation for every price sheet.',
    href: '/dashboard/price-sheets/crops',
    icon: SparklesIcon,
    cta: 'Add commodities',
  },
  {
    key: 'packaging' as const,
    label: 'Pack Configurations',
    description: 'Define how each commodity ships — carton types, sizes, and grade specs.',
    href: '/dashboard/price-sheets/packaging-structure',
    icon: ArchiveBoxIcon,
    cta: 'Configure packaging',
  },
]

export default function Dashboard() {
  const userName = useUserName()
  const { user } = useUser()
  const isOwner = user?.role === 'owner'

  const [done, setDone] = useState({ shippingPoints: false, products: false, packaging: false })
  const [counts, setCounts] = useState({ regions: 0, crops: 0, packaging: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [regionsRes, cropsRes] = await Promise.all([regionsApi.getAll(), cropsApi.getAll()])
        const regions = regionsRes.regions || []
        const crops = cropsRes.crops || []
        const packagingStructure = user?.packagingStructure || {}
        const configuredPack = Object.keys(packagingStructure).filter(c =>
          (packagingStructure[c]?.packageTypes?.length || 0) > 0 &&
          (packagingStructure[c]?.sizeGrades?.length || 0) > 0
        )
        setDone({ shippingPoints: regions.length > 0, products: crops.length > 0, packaging: configuredPack.length > 0 })
        setCounts({ regions: regions.length, crops: crops.length, packaging: configuredPack.length })
      } catch { /* keep defaults */ }
      finally { setLoading(false) }
    }
    load()
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [user])

  const allDone = done.shippingPoints && done.products && done.packaging

  const stepCounts: Record<typeof STEPS[number]['key'], string> = {
    shippingPoints: counts.regions > 0 ? `${counts.regions} location${counts.regions !== 1 ? 's' : ''}` : '',
    products: counts.crops > 0 ? `${counts.crops} commodit${counts.crops !== 1 ? 'ies' : 'y'}` : '',
    packaging: counts.packaging > 0 ? `${counts.packaging} configured` : '',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isOwner ? 'Your operation at a glance.' : 'Here\'s what\'s ready for your team.'}
        </p>
      </div>

      {/* Accelerated Setup — owner only, hide once all done */}
      {isOwner && !allDone && !loading && (
        <div className="bg-gradient-to-r from-lime-50 to-cyan-50 border border-lime-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <RocketLaunchIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Accelerated Setup</h3>
                <p className="text-xs text-gray-600 mt-0.5">Import your catalog from a spreadsheet, Famous, or another system — skip manual entry entirely.</p>
              </div>
            </div>
            <Link
              href="/dashboard/integration-setup"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              Import my data
            </Link>
          </div>
        </div>
      )}

      {/* Operation Readiness */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Operation Readiness</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your catalog is the foundation everything your team sends is built on</p>
          </div>
          {isOwner && (
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
            >
              <LinkIcon className="h-3 w-3" />
              Connect your data
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
          </div>
        ) : allDone ? (
          /* All complete — collapsed summary */
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {STEPS.map(s => (
                  <div key={s.key} className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Your operation is fully loaded</p>
                <p className="text-xs text-gray-500">{counts.regions} location{counts.regions !== 1 ? 's' : ''} · {counts.crops} commodit{counts.crops !== 1 ? 'ies' : 'y'} · {counts.packaging} pack config{counts.packaging !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Link
              href="/dashboard/price-sheets/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <PaperAirplaneIcon className="h-3.5 w-3.5" />
              New Price Sheet
            </Link>
          </div>
        ) : (
          /* Progressive steps */
          <div>
            {STEPS.map((step, i) => {
              const isDone = done[step.key]
              // First incomplete step is "active"
              const isActive = !isDone && STEPS.slice(0, i).every(s => done[s.key])
              const isLocked = !isDone && !isActive
              const Icon = step.icon

              if (isDone) {
                return (
                  <div key={step.key} className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      <span className="font-medium text-emerald-700">{step.label}</span>
                      {stepCounts[step.key] && <span className="ml-2 text-xs text-gray-400">{stepCounts[step.key]}</span>}
                    </p>
                    {isOwner && (
                      <Link href={step.href} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                        Edit <ChevronRightIcon className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )
              }

              if (isActive) {
                return (
                  <div key={step.key} className="px-6 py-5 border-b border-gray-100 last:border-0 bg-amber-50">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.description}</p>
                        {isOwner && (
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors"
                          >
                            {step.cta}
                            <ArrowRightIcon className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              // Locked (future step)
              return (
                <div key={step.key} className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">{step.label}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* Team snapshot */}
      {isOwner && (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Team</h2>
              <p className="text-xs text-gray-500 mt-0.5">Invite your sales reps — they share your catalog, bring their own contacts</p>
            </div>
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <UsersIcon className="h-3.5 w-3.5" />
              Manage Team
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
