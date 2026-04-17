'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  ClockIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  InboxIcon,
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import WaitlistModal from '@/components/modals/WaitlistModal'

const ACRELIST_URL = process.env.NEXT_PUBLIC_ACRELIST_URL || 'https://app.acrelist.ag'

// ─── Data ────────────────────────────────────────────────────────────────────

const products = [
  { id: 1, name: 'Lemons', variety: '115ct', pkg: '40 lb carton', origin: 'Coachella, CA', price: 24.50, avail: 'in_stock', organic: false },
  { id: 2, name: 'Valencia Oranges', variety: '56ct', pkg: '40 lb carton', origin: 'Riverside, CA', price: 21.00, avail: 'in_stock', organic: false },
  { id: 3, name: 'Tango Mandarins', variety: '10/3lb', pkg: 'Case', origin: 'San Joaquin, CA', price: 28.00, avail: 'limited', organic: true },
  { id: 4, name: 'Navel Oranges', variety: '88ct', pkg: '40 lb carton', origin: 'Tulare, CA', price: 19.50, avail: 'in_stock', organic: false },
  { id: 5, name: 'Meyer Lemons', variety: '95ct', pkg: 'Case', origin: 'San Diego, CA', price: 32.00, avail: 'limited', organic: true },
  { id: 6, name: 'Blood Oranges', variety: '48ct', pkg: '25 lb carton', origin: 'Sicily Variety, CA', price: 38.00, avail: 'sold_out', organic: false },
]

const activityRows = [
  { buyer: 'Safeway — Northern CA', last: '9:14 AM', item: 'Lemons 115ct', opens: 3, status: 'hot' },
  { buyer: 'Buyer Co.', last: '9:20 AM', item: 'Tango Mandarins', opens: 2, status: 'warm' },
  { buyer: 'Whole Foods Market', last: '10:01 AM', item: 'Valencia Oranges', opens: 5, status: 'hot' },
  { buyer: 'Sprouts Farmers Market', last: '10:44 AM', item: 'Meyer Lemons', opens: 1, status: 'new' },
  { buyer: 'Central Produce Co.', last: 'Yesterday', item: 'Navel Oranges', opens: 2, status: 'warm' },
]

const orders = [
  {
    id: 'ORD-1041',
    buyer: 'ABC Produce',
    submitted: '9:32 AM',
    items: [
      { qty: '50 cs', name: 'Lemons 115ct', price: '$24.50' },
      { qty: '30 cs', name: 'Valencia Oranges', price: '$21.00' },
    ],
    delivery: 'Monday',
    status: 'new',
    total: '$1,855.00',
  },
  {
    id: 'ORD-1040',
    buyer: 'Fresh Direct Markets',
    submitted: 'Yesterday',
    items: [
      { qty: '20 cs', name: 'Tango Mandarins', price: '$28.00' },
    ],
    delivery: 'Friday',
    status: 'confirmed',
    total: '$560.00',
  },
  {
    id: 'ORD-1039',
    buyer: 'Pacific Grocery',
    submitted: '2 days ago',
    items: [
      { qty: '40 cs', name: 'Navel Oranges', price: '$19.50' },
      { qty: '15 cs', name: 'Meyer Lemons', price: '$32.00' },
    ],
    delivery: 'Thursday',
    status: 'fulfilled',
    total: '$1,260.00',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AvailBadge({ avail }: { avail: string }) {
  if (avail === 'in_stock') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      In Stock
    </span>
  )
  if (avail === 'limited') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Limited
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Sold Out
    </span>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new:       { label: 'New',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    fulfilled: { label: 'Fulfilled', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const { label, cls } = map[status] || map.new
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}

function ActivityDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    hot:  'bg-red-500',
    warm: 'bg-amber-400',
    new:  'bg-blue-500',
  }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status] || 'bg-gray-400'}`} />
}

// ─── Tab 1: Buyer Price Sheet ─────────────────────────────────────────────────

function PriceSheetTab() {
  const [search, setSearch] = useState('')
  const [cartIds, setCartIds] = useState<number[]>([])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.variety.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: number) =>
    setCartIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xl bg-white max-w-4xl mx-auto">
      {/* Sheet header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
              <Image src="/grp-logo.png" alt="Granite Ridge Produce" width={48} height={48} className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Granite Ridge Produce</h2>
              <p className="text-sm text-gray-500 mt-0.5">Today&apos;s Availability &amp; Pricing — <span className="text-gray-400 text-xs">FOB Shipping Point</span></p>
            </div>
          </div>
          {cartIds.length > 0 ? (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              <ShoppingCartIcon className="w-4 h-4" />
              Order Request ({cartIds.length})
            </button>
          ) : (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              Order Request
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-lime-400 focus:border-lime-400 outline-none"
          />
        </div>
      </div>

      {/* Citrus group */}
      <div>
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Citrus</span>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Variety', 'Package', 'Origin', 'Availability', 'FOB Price', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => {
                const inCart = cartIds.includes(p.id)
                const soldOut = p.avail === 'sold_out'
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${inCart ? 'bg-emerald-50/40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{p.name}</span>
                        {p.organic && <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">Organic</span>}
                      </div>
                      <span className="text-xs text-gray-400">{p.variety}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{p.pkg}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.origin}</td>
                    <td className="px-5 py-3.5"><AvailBadge avail={p.avail} /></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">
                      {soldOut ? <span className="text-gray-400 font-normal text-xs">—</span> : `$${p.price.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {soldOut ? (
                        <span className="text-xs text-gray-400">Unavailable</span>
                      ) : inCart ? (
                        <button onClick={() => toggle(p.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors">
                          <CheckCircleIcon className="w-3.5 h-3.5" />Added
                        </button>
                      ) : (
                        <button onClick={() => toggle(p.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                          + Add
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map(p => {
            const inCart = cartIds.includes(p.id)
            const soldOut = p.avail === 'sold_out'
            return (
              <div key={p.id} className={`px-4 py-3 ${inCart ? 'bg-emerald-50/40' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{p.name} {p.variety}</span>
                      {p.organic && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">Organic</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <AvailBadge avail={p.avail} />
                      {!soldOut && <span className="text-sm font-semibold text-gray-900">${p.price.toFixed(2)}</span>}
                    </div>
                  </div>
                  {!soldOut && (
                    inCart ? (
                      <button onClick={() => toggle(p.id)} className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircleIcon className="w-3.5 h-3.5" />Added
                      </button>
                    ) : (
                      <button onClick={() => toggle(p.id)} className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 border border-gray-200">
                        + Add
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">Pricing and availability subject to change</p>
        <p className="text-xs text-gray-400">Powered by AcreList</p>
      </div>
    </div>
  )
}

// ─── Tab 2: Engagement Dashboard ─────────────────────────────────────────────

function DashboardTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Customers Viewed Sheet', value: '28', icon: EyeIcon, color: 'blue' },
          { label: 'Opened in Last Hour',     value: '9',  icon: ClockIcon, color: 'amber' },
          { label: 'Forwarded Internally',    value: '4',  icon: ArrowTrendingUpIcon, color: 'purple' },
          { label: 'Orders Submitted',         value: '6',  icon: CheckCircleIcon, color: 'emerald' },
        ].map(({ label, value, icon: Icon, color }) => {
          const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
            blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    iconBg: 'bg-blue-100' },
            amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
            purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  iconBg: 'bg-purple-100' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
          }
          const c = colorMap[color]
          return (
            <div key={label} className={`${c.bg} rounded-xl p-4 border border-white shadow-sm`}>
              <div className={`${c.iconBg} w-8 h-8 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${c.text}`} />
              </div>
              <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Activity table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live buyer engagement on your latest price sheet</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Viewed</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items Clicked</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Opens</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activityRows.map(row => (
                <tr key={row.buyer} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-gray-900">{row.buyer}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{row.last}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{row.item}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{row.opens}×</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <ActivityDot status={row.status} />
                      <span className="text-xs capitalize text-gray-600">{row.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight bar */}
      <div className="bg-lime-50 border border-lime-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <ArrowTrendingUpIcon className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-lime-900">Whole Foods has viewed your sheet 5 times today</p>
          <p className="text-xs text-lime-700 mt-0.5">Consider reaching out — high engagement typically signals purchasing intent.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Order Flow ────────────────────────────────────────────────────────

function OrderFlowTab() {
  const [activeOrder, setActiveOrder] = useState<string | null>('ORD-1041')

  const selected = orders.find(o => o.id === activeOrder)

  const statusSteps = ['New', 'Confirmed', 'Fulfilled']
  const currentStep = selected
    ? statusSteps.findIndex(s => s.toLowerCase() === selected.status) + 1
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Order list */}
        <div className="sm:w-72 flex-shrink-0 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Recent Orders</p>
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => setActiveOrder(order.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                activeOrder === order.id
                  ? 'border-lime-400 bg-lime-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gray-500">{order.id}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{order.buyer}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.submitted} · {order.total}</p>
            </button>
          ))}
        </div>

        {/* Order detail */}
        {selected && (
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <InboxIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-mono">{selected.id}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mt-1">New Order Received</h3>
                <p className="text-sm text-gray-500">Buyer: {selected.buyer}</p>
              </div>
              <OrderStatusBadge status={selected.status} />
            </div>

            {/* Progress */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-0">
                {statusSteps.map((step, i) => {
                  const done = i + 1 < currentStep
                  const active = i + 1 === currentStep
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0 ${
                        done    ? 'bg-emerald-500 text-white' :
                        active  ? 'bg-lime-500 text-white ring-2 ring-lime-200' :
                                  'bg-gray-100 text-gray-400'
                      }`}>
                        {done ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={`ml-1.5 text-xs font-medium ${active ? 'text-gray-900' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {step}
                      </span>
                      {i < statusSteps.length - 1 && (
                        <div className={`flex-1 h-px mx-3 ${done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-lime-100 flex items-center justify-center flex-shrink-0">
                        <BuildingStorefrontIcon className="w-4 h-4 text-lime-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.qty}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.price} / cs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TruckIcon className="w-4 h-4 text-gray-400" />
                Delivery: <span className="font-medium">{selected.delivery}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">Total: {selected.total}</span>
                {selected.status === 'new' && (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-xs font-medium rounded-lg transition-colors">
                    <CheckIcon className="w-3.5 h-3.5" />
                    Confirm Order
                  </button>
                )}
              </div>
            </div>

            {/* ERP badge */}
            {selected.status !== 'new' && (
              <div className="mx-5 mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-medium">Sent to ERP · No re-keying required</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const tabs = [
  {
    id: 'pricesheet',
    label: 'Digital Price Sheet',
    sublabel: 'Not every buyer gets the same price — and now your sheet reflects that. Dynamic, personalized, and live the moment you hit send.',
  },
  {
    id: 'dashboard',
    label: 'Engagement Analytics',
    sublabel: 'Know exactly who opened it, what they clicked, and how many times they came back — before you ever pick up the phone.',
  },
  {
    id: 'orders',
    label: 'Order Flow',
    sublabel: 'Buyers submit structured order requests right from your price sheet. No emails to decode, no re-keying into your system.',
  },
]

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState('pricesheet')
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header — matches /index2 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/acrelist-logo.png" alt="AcreList" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={ACRELIST_URL} className="text-sm text-gray-500 hover:text-gray-800">Log in</Link>
            <Link href={ACRELIST_URL + '/signup'} className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="text-sm font-semibold text-lime-600 tracking-wide uppercase mb-4">For growers &amp; shippers</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Supercharge your <span className="text-lime-500">price sheets.</span>
          </h1>
        </div>
      </div>

      {/* Tab selector — 3 cards with inline context */}
      <div className="bg-gray-50 border-b border-gray-200 py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">3 Interactive Product Demos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-5 py-4 rounded-xl border transition-all ${
                  activeTab === tab.id
                    ? 'bg-white border-gray-900 shadow-md ring-2 ring-gray-900'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <p className={`text-sm font-semibold mb-1.5 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {tab.label}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{tab.sublabel}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {activeTab === 'pricesheet' && <PriceSheetTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'orders' && <OrderFlowTab />}
      </div>

      {/* Before / After */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-3 tracking-tight">Pricing in a PDF is losing you sales.</h2>
          <p className="text-center text-sm text-gray-400 mb-12">Here&apos;s what growers tell us before they switch.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-6">Before AcreList</p>
              <ul className="space-y-4">
                {[
                  'Rebuild a spreadsheet from scratch every single week',
                  'Blast the same PDF to every buyer — no personalization, no tracking',
                  'No idea if anyone opened it, or when',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                    <span className="text-red-300 mt-0.5 flex-shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-white rounded-2xl border border-lime-200 p-8 shadow-sm">
              <p className="text-xs font-semibold text-lime-600 uppercase tracking-wider mb-6">With AcreList</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>One price sheet</strong>, updated in seconds and <strong>pushed live to all buyers instantly</strong></span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>1-click send to hundreds of buyers</strong>, each with a <strong>personalized email and their own pricing</strong></span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>AI price guidance</strong> and historical sales data surface your <strong>optimal selling price</strong> before you hit send</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Know the <strong>moment a buyer opens</strong> and follow up <strong>before they look elsewhere</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to try it with your own products?</h2>
          <p className="text-gray-600 mb-6">
            Get early access and have your first price sheet live in under 30 minutes.
          </p>
          <button
            onClick={() => setIsWaitlistModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Get Early Access
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <p className="mt-3 text-sm text-gray-400">No credit card required · Setup in minutes</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">AcreList</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">Price Sheets Made Simple</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 AcreList</p>
        </div>
      </footer>

      <WaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
    </div>
  )
}
