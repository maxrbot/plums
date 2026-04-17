"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XCircleIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PriceSheetProduct {
  _id: string
  productName?: string
  category?: string
  commodity?: string
  variety?: string
  subtype?: string
  isOrganic?: boolean
  regionName?: string
  packageType: string
  size?: string
  countSize?: string
  grade?: string
  price: number | null
  availability: string
  isStickered?: boolean
  specialNotes?: string
  hasOverride?: boolean
  overrideComment?: string
}

interface OrderItem extends PriceSheetProduct {
  quantity: number
  unit: 'units' | 'pallets'
  subtotal: number | null
}

interface PriceSheet {
  _id: string
  title: string
  status: string
  productsCount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface UserInfo {
  companyName?: string
  name?: string
  email?: string
  logo?: string | null
}

export default function PublicPriceSheetViewer() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id as string

  // Sheet state
  const [priceSheet, setPriceSheet] = useState<PriceSheet | null>(null)
  const [products, setProducts] = useState<PriceSheetProduct[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Order mode state
  const [orderMode, setOrderMode] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderComments, setOrderComments] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' })
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchPriceSheet = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const contactHash = urlParams.get('c')
        const preview = urlParams.get('preview')
        const queryParams = new URLSearchParams()
        if (contactHash) queryParams.set('c', contactHash)
        if (preview) queryParams.set('preview', preview)
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const url = queryParams.toString()
          ? `${apiBase}/public/price-sheets/${id}?${queryParams.toString()}`
          : `${apiBase}/public/price-sheets/${id}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Price sheet not found')
        const data = await response.json()
        setPriceSheet(data.priceSheet)
        setProducts(data.products || [])
        setUser(data.user)
        setShowPricing(data.showPricing || false)

        // If URL already has /order path, activate order mode immediately
        if (window.location.pathname.endsWith('/order')) setOrderMode(true)
      } catch (err) {
        setError('Unable to load price sheet. It may no longer be available.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPriceSheet()
  }, [id])

  // --- Order logic ---
  const enterOrderMode = () => {
    setOrderMode(true)
  }

  const exitOrderMode = () => {
    setOrderMode(false)
    setOrderItems([])
    setOrderComments('')
  }

  const addToOrder = (product: PriceSheetProduct) => {
    const existing = orderItems.find(i => i._id === product._id)
    if (existing) {
      updateQuantity(product._id, existing.quantity + 1)
    } else {
      setOrderItems(prev => [...prev, { ...product, quantity: 1, unit: 'units', subtotal: product.price || 0 }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromOrder(productId); return }
    setOrderItems(prev => prev.map(item => {
      if (item._id !== productId) return item
      const subtotal = item.unit === 'pallets' ? null : (item.price || 0) * quantity
      return { ...item, quantity, subtotal }
    }))
  }

  const removeFromOrder = (productId: string) =>
    setOrderItems(prev => prev.filter(i => i._id !== productId))

  const toggleUnit = (productId: string) =>
    setOrderItems(prev => prev.map(item => {
      if (item._id !== productId) return item
      const unit = item.unit === 'units' ? 'pallets' : 'units'
      return { ...item, unit, subtotal: unit === 'pallets' ? null : (item.price || 0) * item.quantity }
    }))

  const getOrderTotal = () => orderItems.reduce((t, i) => t + (i.subtotal || 0), 0)
  const hasPalletItems = () => orderItems.some(i => i.unit === 'pallets')

  const getOrderStats = () => {
    const totalUnits = orderItems.filter(i => i.unit === 'units').reduce((s, i) => s + i.quantity, 0)
    const totalPallets = orderItems.filter(i => i.unit === 'pallets').reduce((s, i) => s + i.quantity, 0)
    const palletEquivalent = totalPallets + totalUnits / 50
    const FTL = 26
    const ftlPct = Math.min((palletEquivalent / FTL) * 100, 100)
    let loadType = 'LTL'
    if (palletEquivalent >= FTL * 2) loadType = 'Multi-Truck'
    else if (palletEquivalent >= FTL) loadType = 'Full Truckload'
    else if (palletEquivalent >= FTL * 0.75) loadType = 'Near FTL'
    return {
      totalUnits, totalPallets,
      uniqueProducts: orderItems.length,
      uniqueCommodities: new Set(orderItems.map(i => i.commodity)).size,
      organicCount: orderItems.filter(i => i.isOrganic).length,
      palletEquivalent: Math.round(palletEquivalent * 10) / 10,
      ftlPercentage: Math.round(ftlPct),
      palletsToFTL: Math.round(Math.max(0, FTL - palletEquivalent) * 10) / 10,
      loadType,
    }
  }

  const handleSubmitOrder = () => {
    const lines = orderItems.map(item => {
      const priceDisplay = item.subtotal !== null
        ? `$${item.subtotal.toFixed(2)}`
        : `$${(item.price || 0).toFixed(2)} per ${item.packageType || 'unit'} × [pallet qty]`
      return `${item.quantity} ${item.unit} - ${item.productName || `${item.variety} ${item.commodity}`} (${item.packageType}) - ${priceDisplay}`
    }).join('\n')
    const comments = orderComments.trim() ? `\n\nAdditional Comments:\n${orderComments}\n` : ''
    setEmailContent({
      subject: `Order Request - ${priceSheet?.title}`,
      body: `Hi,\n\nI'm interested in the following items from your price sheet:\n\n${lines}${comments}\nPlease confirm availability.\n\nThank you!`
    })
    setEmailSent(false)
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    try {
      const contactHash = searchParams?.get('c')
      const buyerName = searchParams?.get('buyer')
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const res = await fetch(`${apiBase}/public/order-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceSheetId: id, contactHash, buyerName,
          customSubject: emailContent.subject,
          orderItems: orderItems.map(i => ({
            productName: i.productName || `${i.variety} ${i.commodity}`,
            packageType: i.packageType, size: i.size || i.countSize,
            grade: i.grade, quantity: i.quantity, unit: i.unit,
            price: i.price, subtotal: i.subtotal
          })),
          orderComments, orderTotal: getOrderTotal(), hasPalletItems: hasPalletItems()
        })
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed') }
      setEmailSent(true)
      setOrderItems([])
      setOrderComments('')
    } catch (e: any) {
      alert(`Failed to send order request: ${e.message}`)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${emailContent.subject}\n\n${emailContent.body}`)
      alert('Copied to clipboard!')
    } catch { alert('Failed to copy') }
  }

  // --- Helpers ---
  const groupedProducts = products.reduce((acc, p) => {
    const sp = p.regionName || 'Other'
    const com = p.commodity ? p.commodity.charAt(0).toUpperCase() + p.commodity.slice(1) : 'Other'
    if (!acc[sp]) acc[sp] = {}
    if (!acc[sp][com]) acc[sp][com] = []
    acc[sp][com].push(p)
    return acc
  }, {} as Record<string, Record<string, PriceSheetProduct[]>>)

  const getDisplayName = (product: PriceSheetProduct) => {
    let name = '-'
    if (product.productName) name = product.productName
    else if (product.variety && product.subtype) name = `${product.subtype} ${product.variety}`
    else if (product.subtype) name = product.subtype
    else if (product.variety) name = product.variety
    if (product.isOrganic && name.toLowerCase().startsWith('organic ')) name = name.substring(8)
    return name
  }

  const getAvailabilityBadge = (availability: string) => {
    const map: Record<string, { icon: any; cls: string; label: string }> = {
      'Available':     { icon: CheckCircleIcon,       cls: 'bg-green-50 text-green-700 border-green-200',   label: 'Available' },
      'Coming Soon':   { icon: ClockIcon,              cls: 'bg-blue-50 text-blue-700 border-blue-200',      label: 'Coming Soon' },
      'End of Season': { icon: ExclamationTriangleIcon,cls: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'End of Season' },
      'Limited Supply':{ icon: ExclamationTriangleIcon,cls: 'bg-orange-50 text-orange-700 border-orange-200',label: 'Limited Supply' },
      'Sold Out':      { icon: XCircleIcon,            cls: 'bg-red-50 text-red-700 border-red-200',         label: 'Sold Out' },
      'Program':       { icon: StarIcon,               cls: 'bg-purple-50 text-purple-700 border-purple-200',label: 'Program' },
    }
    const b = map[availability] || map['Available']
    const Icon = b.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${b.cls}`}>
        <Icon className="h-3 w-3" />{b.label}
      </span>
    )
  }

  // Inline quantity control used in both table and mobile cards
  const QuantityControl = ({ product }: { product: PriceSheetProduct }) => {
    const inOrder = orderItems.some(i => i._id === product._id)
    const isSoldOut = product.availability === 'Sold Out'
    if (inOrder) {
      return (
        <button
          onClick={() => removeFromOrder(product._id)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-300 bg-emerald-50 text-xs font-medium text-emerald-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <CheckCircleIcon className="w-3 h-3" />
          Added
        </button>
      )
    }
    return (
      <button
        onClick={() => addToOrder(product)}
        disabled={isSoldOut}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 text-xs font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    )
  }

  // --- Loading / error ---
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400 mx-auto" />
        <p className="mt-4 text-sm text-gray-500">Loading price sheet…</p>
      </div>
    </div>
  )

  if (error || !priceSheet) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Price Sheet Not Found</h1>
          <p className="text-sm text-gray-500">{error || 'This price sheet may have been removed.'}</p>
        </div>
      </div>
    </div>
  )

  const companyName = user?.companyName || user?.name || 'Supplier'
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const buyerCompany = urlParams?.get('buyer') || null

  const logoInitials = companyName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
  const logoEl = (size: 'sm' | 'md') => {
    const cls = size === 'md' ? 'h-14 w-14 text-sm' : 'h-10 w-10 text-xs'
    if (user?.logo) return (
      <img src={user.logo} alt={`${companyName} logo`}
        className={`${size === 'md' ? 'h-14' : 'h-10'} w-auto object-contain flex-shrink-0`} />
    )
    return (
      <div className={`${cls} flex-shrink-0 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center font-semibold text-gray-500`}>
        {logoInitials}
      </div>
    )
  }

  const orderButtonEl = (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <button
        onClick={orderMode ? exitOrderMode : enterOrderMode}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
          orderMode
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {orderMode ? (
          <>
            <XMarkIcon className="w-4 h-4" />
            <span>Cancel</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Order Request</span>
          </>
        )}
      </button>
      {!orderMode && (
        <p className="text-[11px] text-gray-400 whitespace-nowrap">Select and send request instantly</p>
      )}
    </div>
  )

  // --- Side panel (desktop) ---
  const stats = orderItems.length > 0 ? getOrderStats() : null
  const SidePanel = () => (
    <div className="w-80 xl:w-96 flex-shrink-0">
      <div className="sticky top-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Panel header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Order Request</h2>
          {orderItems.length > 0 && (
            <span className="text-xs font-medium text-gray-500">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {orderItems.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-400">No items added yet.</p>
            <p className="text-xs text-gray-400 mt-1">Click <span className="font-medium text-gray-500">+ Add</span> on any row.</p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[calc(100vh-12rem)] overflow-y-auto">
            {/* Items */}
            <div className="divide-y divide-gray-100">
              {orderItems.map(item => (
                <div key={item._id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.isOrganic && <span className="text-green-600">Organic </span>}
                        {item.productName || `${item.variety} ${item.commodity}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[item.packageType, item.size || item.countSize, item.grade].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button onClick={() => removeFromOrder(item._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs">−</button>
                      <input type="number" min="1" value={item.quantity}
                        onChange={e => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                        className="w-9 text-center text-xs font-medium border border-gray-200 rounded py-0.5" />
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs">+</button>
                      <div className="ml-1.5 flex rounded border border-gray-200 overflow-hidden text-[10px] font-medium">
                        <button onClick={() => item.unit !== 'units' && toggleUnit(item._id)}
                          className={`px-1.5 py-0.5 transition-colors ${item.unit === 'units' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                          Units
                        </button>
                        <button onClick={() => item.unit !== 'pallets' && toggleUnit(item._id)}
                          className={`px-1.5 py-0.5 border-l border-gray-200 transition-colors ${item.unit === 'pallets' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                          Pallets
                        </button>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {item.subtotal !== null ? `$${item.subtotal.toFixed(2)}` : (
                        <span className="text-gray-400 text-[10px]">TBD (pallets)</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* FTL insight */}
            {stats && stats.palletEquivalent > 0 && (
              <div className="mx-4 my-3 px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Truckload capacity</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
                    stats.ftlPercentage >= 100 ? 'bg-green-50 text-green-700 border-green-200' :
                    stats.ftlPercentage >= 75  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>{stats.loadType}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    stats.ftlPercentage >= 100 ? 'bg-green-500' :
                    stats.ftlPercentage >= 75  ? 'bg-amber-400' : 'bg-gray-400'
                  }`} style={{ width: `${Math.min(stats.ftlPercentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>~{stats.palletEquivalent} est. pallets</span>
                  <span>{stats.ftlPercentage}% of 26-pallet FTL</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="px-4 py-3 border-t border-gray-100">
              {hasPalletItems() ? (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Units subtotal</span>
                  <span className="font-semibold text-gray-900">${getOrderTotal().toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="font-semibold text-gray-900">${getOrderTotal().toFixed(2)}</span>
                </div>
              )}
              {hasPalletItems() && (
                <p className="text-[10px] text-gray-400 mt-0.5">Pallet lines priced on confirmation</p>
              )}
            </div>

            {/* Comments */}
            <div className="px-4 pb-3">
              <textarea
                rows={2} value={orderComments}
                onChange={e => setOrderComments(e.target.value)}
                placeholder="Delivery notes, special requests…"
                className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2 text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="px-4 pb-4">
              <button onClick={handleSubmitOrder}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors">
                Submit Order Request
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                This is a request, not a purchase order. It will be sent to {companyName} on behalf of {buyerCompany || 'your business'} — you&apos;ll be CC&apos;d on the email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between py-4 gap-6">
            <div className="flex items-center gap-4 min-w-0">
              {logoEl('md')}
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">{priceSheet.title}</h1>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  {buyerCompany && <><span className="text-gray-600 font-medium">For {buyerCompany}</span><span>·</span></>}
                  <span>{products.length} {products.length === 1 ? 'item' : 'items'}</span>
                  <span>·</span>
                  <span>Updated {new Date(priceSheet.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {priceSheet.notes && <p className="text-xs text-gray-500 mt-0.5">{priceSheet.notes}</p>}
              </div>
            </div>
            {orderButtonEl}
          </div>
          {/* Mobile */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {logoEl('sm')}
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold text-gray-900 truncate">{priceSheet.title}</h1>
                  {buyerCompany && <p className="text-xs text-gray-400">For {buyerCompany}</p>}
                </div>
              </div>
              {orderButtonEl}
            </div>
          </div>
        </div>
      </div>

      {/* Order mode instruction banner */}
      {orderMode && (
        <div className="bg-emerald-50 border-b border-emerald-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-center">
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">Select and send request instantly</span> — click <span className="font-medium">+ Add</span> on any item, adjust quantities in the panel, then submit when ready.
            </p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${orderMode ? 'lg:flex lg:gap-6 lg:items-start' : ''}`}>

        {/* Products area */}
        <div className={`${orderMode ? 'flex-1 min-w-0' : ''} ${orderMode ? 'pb-24 lg:pb-0' : ''}`}>

          {!showPricing && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md px-4 py-3 flex items-start gap-3">
              <svg className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Product Catalog View</p>
                <p className="text-sm text-blue-600 mt-0.5">Pricing is only visible via personalized links. Contact {companyName} for pricing.</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {Object.keys(groupedProducts).length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400 text-sm">
                No products in this price sheet
              </div>
            ) : Object.entries(groupedProducts).map(([shippingPoint, commodities]) => (
              <div key={shippingPoint}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shipping Point</span>
                  <span className="text-sm font-semibold text-gray-700">{shippingPoint}</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(commodities).map(([commodity, commodityProducts]) => (
                    <div key={commodity} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{commodity}</h3>
                      </div>

                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              {['Variety','Package','Size','Grade','Availability'].map(h => (
                                <th key={h} scope="col" className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                              ))}
                              {showPricing && (
                                <th scope="col" className="px-5 py-2.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  {(priceSheet as any)?.priceType || 'FOB'} Price
                                </th>
                              )}
                              {orderMode && (
                                <th scope="col" className="px-5 py-2.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {commodityProducts.map(product => {
                              const name = getDisplayName(product)
                              const inOrder = orderItems.some(i => i._id === product._id)
                              return (
                                <tr key={product._id} className={`hover:bg-gray-50 ${inOrder ? 'bg-emerald-50/40' : ''}`}>
                                  <td className="px-5 py-3.5">
                                    <div className="text-sm text-gray-900">
                                      {product.isOrganic && <span className="text-green-600 font-medium">Organic </span>}
                                      {name}
                                    </div>
                                    {product.isStickered && (
                                      <span className="mt-1 inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">Stickered</span>
                                    )}
                                    {product.specialNotes && <p className="text-xs text-gray-400 mt-1">{product.specialNotes}</p>}
                                  </td>
                                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">{product.packageType || '-'}</td>
                                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">{product.size || product.countSize || '-'}</td>
                                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-700">{product.grade || '-'}</td>
                                  <td className="px-5 py-3.5 whitespace-nowrap">{getAvailabilityBadge(product.availability)}</td>
                                  {showPricing && (
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      {product.hasOverride && product.overrideComment ? (
                                        <span className="inline-flex px-2 py-0.5 text-sm font-medium rounded bg-orange-50 text-orange-700 border border-orange-200">{product.overrideComment}</span>
                                      ) : (
                                        <span className="text-base font-semibold text-gray-900">
                                          {product.price !== null ? `$${product.price.toFixed(2)}` : 'Contact'}
                                        </span>
                                      )}
                                    </td>
                                  )}
                                  {orderMode && (
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <QuantityControl product={product} />
                                    </td>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {commodityProducts.map(product => {
                          const name = getDisplayName(product)
                          const pkgInfo = [product.packageType, product.size || product.countSize, product.grade].filter(Boolean).join(' · ')
                          const inOrder = orderItems.some(i => i._id === product._id)
                          return (
                            <div key={product._id} className={`p-4 ${inOrder ? 'bg-emerald-50/40' : ''}`}>
                              <div className="flex items-start justify-between mb-1.5">
                                <p className="text-sm text-gray-900 flex-1">
                                  {product.isOrganic && <span className="text-green-600 font-medium">Organic </span>}
                                  {name}
                                </p>
                                {showPricing && (
                                  <div className="ml-4 text-right">
                                    {product.hasOverride && product.overrideComment ? (
                                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-orange-50 text-orange-700 border border-orange-200">{product.overrideComment}</span>
                                    ) : (
                                      <span className="text-base font-semibold text-gray-900">
                                        {product.price !== null ? `$${product.price.toFixed(2)}` : 'Contact'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {pkgInfo && <p className="text-xs text-gray-400 mb-2">{pkgInfo}</p>}
                              <div className="flex items-center justify-between">
                                {getAvailabilityBadge(product.availability)}
                                {orderMode && <QuantityControl product={product} />}
                              </div>
                              {product.specialNotes && (
                                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">{product.specialNotes}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">Powered by AcreList</p>
          </div>
        </div>

        {/* Desktop side panel */}
        {orderMode && (
          <div className="hidden lg:block">
            <SidePanel />
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      {orderMode && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
          {mobileOrderOpen ? (
            /* Expanded: full panel equivalent */
            <div className="flex flex-col" style={{ maxHeight: '75vh' }}>
              {/* Drag handle + header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-sm font-semibold text-gray-900">
                  Order Request
                  {orderItems.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</span>}
                </h2>
                <button onClick={() => setMobileOrderOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {orderItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8 px-4">No items added yet — tap <span className="font-medium text-gray-500">+ Add</span> on any row above.</p>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {/* Items with quantity controls */}
                  <div className="divide-y divide-gray-100">
                    {orderItems.map(item => (
                      <div key={item._id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {item.isOrganic && <span className="text-green-600">Organic </span>}
                              {item.productName || `${item.variety} ${item.commodity}`}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {[item.packageType, item.size || item.countSize, item.grade].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <button onClick={() => removeFromOrder(item._id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm">−</button>
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                              className="w-10 text-center text-xs font-medium border border-gray-200 rounded py-0.5" />
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm">+</button>
                            <div className="ml-1.5 flex rounded border border-gray-200 overflow-hidden text-[10px] font-medium">
                              <button onClick={() => item.unit !== 'units' && toggleUnit(item._id)}
                                className={`px-1.5 py-0.5 transition-colors ${item.unit === 'units' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                                Units
                              </button>
                              <button onClick={() => item.unit !== 'pallets' && toggleUnit(item._id)}
                                className={`px-1.5 py-0.5 border-l border-gray-200 transition-colors ${item.unit === 'pallets' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                                Pallets
                              </button>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            {item.subtotal !== null ? `$${item.subtotal.toFixed(2)}` : <span className="text-gray-400 text-[10px]">TBD (pallets)</span>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FTL insight */}
                  {stats && stats.palletEquivalent > 0 && (
                    <div className="mx-4 my-3 px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Truckload capacity</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
                          stats.ftlPercentage >= 100 ? 'bg-green-50 text-green-700 border-green-200' :
                          stats.ftlPercentage >= 75  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{stats.loadType}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          stats.ftlPercentage >= 100 ? 'bg-green-500' :
                          stats.ftlPercentage >= 75  ? 'bg-amber-400' : 'bg-gray-400'
                        }`} style={{ width: `${Math.min(stats.ftlPercentage, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>~{stats.palletEquivalent} est. pallets</span>
                        <span>{stats.ftlPercentage}% of 26-pallet FTL</span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{hasPalletItems() ? 'Units subtotal' : 'Total'}</span>
                      <span className="font-semibold text-gray-900">${getOrderTotal().toFixed(2)}</span>
                    </div>
                    {hasPalletItems() && <p className="text-[10px] text-gray-400 mt-0.5">Pallet lines priced on confirmation</p>}
                  </div>

                  {/* Comments + submit */}
                  <div className="px-4 pb-4">
                    <textarea rows={2} value={orderComments} onChange={e => setOrderComments(e.target.value)}
                      placeholder="Delivery notes, special requests…"
                      className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-2 mb-3 resize-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button onClick={handleSubmitOrder}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors">
                      Submit Order Request
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      This is a request, not a purchase order. It will be sent to {companyName} on behalf of {buyerCompany || 'your business'} — you&apos;ll be CC&apos;d on the email.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed: summary bar */
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setMobileOrderOpen(true)} className="flex-1 text-left">
                <p className="text-xs font-medium text-gray-900">
                  {orderItems.length === 0
                    ? 'No items selected'
                    : `${orderItems.length} item${orderItems.length !== 1 ? 's' : ''} · $${getOrderTotal().toFixed(2)}`}
                </p>
                <p className="text-[10px] text-gray-400">
                  {orderItems.length === 0 ? 'Tap + Add on any item above' : 'Tap to review & adjust quantities'}
                </p>
              </button>
              <button
                onClick={orderItems.length > 0 ? handleSubmitOrder : () => setMobileOrderOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors flex-shrink-0"
              >
                {orderItems.length > 0 ? 'Send →' : 'View'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Email preview modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {emailSent ? 'Order Request Sent' : 'Review Order Request'}
              </h3>
              <button onClick={() => { setShowEmailModal(false); setEmailSent(false) }}
                className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {emailSent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Request sent!</h4>
                  <p className="text-sm text-gray-500">
                    {companyName} will follow up to confirm availability and details.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">To</p>
                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                      {user?.companyName && <p className="font-medium text-gray-900">{user.companyName}</p>}
                      {user?.email && <p className="text-gray-500 text-xs">{user.email}</p>}
                      {!user?.email && <p className="text-gray-400 text-xs">No email on file</p>}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                    <input type="text" value={emailContent.subject}
                      onChange={e => setEmailContent(p => ({ ...p, subject: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                    <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 whitespace-pre-wrap font-mono leading-relaxed">
                      {emailContent.body}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!emailSent && (
              <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
                <button onClick={handleCopyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowEmailModal(false)}
                    className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={handleSendEmail}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
