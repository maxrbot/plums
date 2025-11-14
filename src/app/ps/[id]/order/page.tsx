"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeftIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  phone?: string
  logo?: string | null
}

export default function OrderBuilder() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id as string

  const [priceSheet, setPriceSheet] = useState<PriceSheet | null>(null)
  const [products, setProducts] = useState<PriceSheetProduct[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderComments, setOrderComments] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' })

  useEffect(() => {
    const fetchPriceSheet = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        const contactHash = searchParams?.get('c')
        const preview = searchParams?.get('preview')
        
        const queryParams = new URLSearchParams()
        if (contactHash) queryParams.append('c', contactHash)
        if (preview) queryParams.append('preview', preview)
        
        const url = queryParams.toString()
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/price-sheets/${id}?${queryParams.toString()}`
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/price-sheets/${id}`
        
        console.log('Fetching price sheet from:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response not OK:', response.status, errorText)
          throw new Error(`Failed to fetch price sheet: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Fetched data:', data)
        setPriceSheet(data.priceSheet)
        setProducts(data.products || [])
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching price sheet:', err)
        setError('Failed to load price sheet')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceSheet()
  }, [id, searchParams])

  const addToOrder = (product: PriceSheetProduct) => {
    const existingItem = orderItems.find(item => item._id === product._id)
    
    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 1)
    } else {
      const newItem: OrderItem = {
        ...product,
        quantity: 1,
        unit: 'units',
        subtotal: product.price || 0
      }
      setOrderItems([...orderItems, newItem])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(productId)
      return
    }
    
    setOrderItems(orderItems.map(item => {
      if (item._id === productId) {
        // If unit is pallets, subtotal is null (TBD)
        const subtotal = item.unit === 'pallets' ? null : (item.price || 0) * quantity
        return {
          ...item,
          quantity,
          subtotal
        }
      }
      return item
    }))
  }

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item._id !== productId))
  }

  const toggleUnit = (productId: string) => {
    setOrderItems(orderItems.map(item => {
      if (item._id === productId) {
        const newUnit = item.unit === 'units' ? 'pallets' : 'units'
        // If switching to pallets, set subtotal to null (TBD)
        const subtotal = newUnit === 'pallets' ? null : (item.price || 0) * item.quantity
        return {
          ...item,
          unit: newUnit,
          subtotal
        }
      }
      return item
    }))
  }

  const getOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      // Only add to total if subtotal is not null (not a pallet order)
      return total + (item.subtotal || 0)
    }, 0)
  }

  const hasPalletItems = () => {
    return orderItems.some(item => item.unit === 'pallets')
  }

  const getOrderStats = () => {
    const uniqueProducts = orderItems.length
    const totalUnits = orderItems.filter(item => item.unit === 'units').reduce((sum, item) => sum + item.quantity, 0)
    const totalPallets = orderItems.filter(item => item.unit === 'pallets').reduce((sum, item) => sum + item.quantity, 0)
    const uniqueCommodities = new Set(orderItems.map(item => item.commodity)).size
    const organicCount = orderItems.filter(item => item.isOrganic).length
    
    // FTL calculations (26 pallets = standard FTL)
    const FTL_CAPACITY = 26
    const palletEquivalent = totalPallets + (totalUnits / 50) // Rough estimate: 50 units ≈ 1 pallet
    const ftlPercentage = Math.min((palletEquivalent / FTL_CAPACITY) * 100, 100)
    const palletsToFTL = Math.max(0, FTL_CAPACITY - palletEquivalent)
    
    let loadType = 'LTL' // Less Than Truckload
    if (palletEquivalent >= FTL_CAPACITY * 2) loadType = 'Multi-Truck'
    else if (palletEquivalent >= FTL_CAPACITY) loadType = 'Full Truckload'
    else if (palletEquivalent >= FTL_CAPACITY * 0.75) loadType = 'Partial FTL'
    
    return {
      uniqueProducts,
      totalUnits,
      totalPallets,
      uniqueCommodities,
      organicCount,
      palletEquivalent: Math.round(palletEquivalent * 10) / 10,
      ftlPercentage: Math.round(ftlPercentage),
      palletsToFTL: Math.round(palletsToFTL * 10) / 10,
      loadType
    }
  }

  const handleSubmitOrder = () => {
    const orderSummary = orderItems.map(item => {
      const priceDisplay = item.subtotal !== null 
        ? `$${item.subtotal.toFixed(2)}`
        : 'Price TBD (Pallet Configuration Required)'
      return `${item.quantity} ${item.unit} - ${item.productName || `${item.variety} ${item.commodity}`} (${item.packageType}) - ${priceDisplay}`
    }).join('\n')
    
    const total = getOrderTotal()
    const hasPallets = hasPalletItems()
    const subject = `Order Request - ${priceSheet?.title}`
    const commentsSection = orderComments.trim() ? `\n\nAdditional Comments:\n${orderComments}\n` : ''
    const totalSection = hasPallets 
      ? `\n\nSubtotal (units only): $${total.toFixed(2)}\n*Final total pending pallet configuration*`
      : `\n\nTotal: $${total.toFixed(2)}`
    const body = `Hi,\n\nI would like to place the following order:\n\n${orderSummary}${totalSection}${commentsSection}\nPlease confirm availability and delivery details.\n\nThank you!`
    
    setEmailContent({ subject, body })
    setEmailSent(false)
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    try {
      const contactHash = searchParams?.get('c')
      const buyerName = searchParams?.get('buyer')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/order-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceSheetId: id,
          contactHash,
          buyerName,
          customSubject: emailContent.subject,
          orderItems: orderItems.map(item => ({
            productName: item.productName || `${item.variety} ${item.commodity}`,
            packageType: item.packageType,
            size: item.size || item.countSize,
            grade: item.grade,
            quantity: item.quantity,
            unit: item.unit,
            subtotal: item.subtotal
          })),
          orderComments,
          orderTotal: getOrderTotal(),
          hasPalletItems: hasPalletItems()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error response:', errorData)
        throw new Error(errorData.details || errorData.message || 'Failed to send order request')
      }

      // Show success state in modal
      setEmailSent(true)
      
      // Clear the order (but keep modal open for user to close)
      setOrderItems([])
      setOrderComments('')
      
    } catch (error: any) {
      console.error('Error sending order request:', error)
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack
      })
      alert(`Failed to send order request: ${error.message}\n\nPlease try again or contact support.`)
    }
  }

  const handleCopyToClipboard = async () => {
    const fullText = `Subject: ${emailContent.subject}\n\n${emailContent.body}`
    try {
      await navigator.clipboard.writeText(fullText)
      alert('Order details copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  const groupedProducts = products.reduce((acc, product) => {
    // Use commodity as the grouping key, capitalize first letter
    const groupName = product.commodity 
      ? product.commodity.charAt(0).toUpperCase() + product.commodity.slice(1)
      : 'Other'
    if (!acc[groupName]) {
      acc[groupName] = []
    }
    acc[groupName].push(product)
    return acc
  }, {} as Record<string, PriceSheetProduct[]>)

  const companyName = user?.companyName || user?.name || 'the farm'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order builder...</p>
        </div>
      </div>
    )
  }

  if (error || !priceSheet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Price sheet not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : ''
              router.push(`/ps/${id}${queryString}`)
            }}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Price Sheet
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Build Your Order</h1>
                <p className="text-gray-600 mt-1">{priceSheet.title}</p>
              </div>
              {user?.logo && (
                <img src={user.logo} alt={companyName} className="h-16 object-contain" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3">
                  <h2 className="text-lg font-semibold text-white">{category}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryProducts.map((product) => {
                    const isInOrder = orderItems.some(item => item._id === product._id)
                    const orderItem = orderItems.find(item => item._id === product._id)
                    
                    return (
                      <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {product.isOrganic && (
                                <span className="text-green-600 font-semibold">Organic </span>
                              )}
                              {product.productName || `${product.variety} ${product.commodity}`}
                            </h3>
                            <div className="mt-1 text-sm text-gray-600 space-x-3">
                              <span>{product.packageType}</span>
                              {(product.size || product.countSize) && (
                                <span>• {product.size || product.countSize}</span>
                              )}
                              {product.grade && <span>• {product.grade}</span>}
                            </div>
                            {product.specialNotes && (
                              <p className="mt-1 text-xs text-gray-500 italic">{product.specialNotes}</p>
                            )}
                          </div>
                          
                          <div className="ml-4 flex items-center gap-3">
                            <div className="text-right">
                              {product.hasOverride && product.overrideComment ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  {product.overrideComment}
                                </span>
                              ) : product.price !== null ? (
                                <span className="text-lg font-semibold text-gray-900">
                                  ${product.price.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">Contact</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => addToOrder(product)}
                              disabled={product.availability === 'Sold Out' || (product.hasOverride && product.overrideComment)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isInOrder
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                              }`}
                            >
                              {isInOrder ? (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Added
                                </span>
                              ) : (
                                'Add'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
                <div className="flex items-center text-white">
                  <ShoppingCartIcon className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">Order Request</h2>
                </div>
              </div>
              
              <div className="p-6">
                {orderItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items added yet</p>
                ) : (
                  <>
                    <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                      {orderItems.map((item) => (
                        <div key={item._id} className="border-b border-gray-200 pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {item.productName || `${item.variety} ${item.commodity}`}
                              </h4>
                              <div className="text-xs text-gray-600 space-x-1">
                                <span>{item.packageType}</span>
                                {(item.size || item.countSize) && (
                                  <span>• {item.size || item.countSize}</span>
                                )}
                                {item.grade && <span>• {item.grade}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromOrder(item._id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  updateQuantity(item._id, value)
                                }}
                                className="w-14 text-center font-medium text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                +
                              </button>
                              <button
                                onClick={() => toggleUnit(item._id)}
                                className="text-xs text-blue-600 hover:text-blue-700 underline ml-1"
                              >
                                {item.unit}
                              </button>
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {item.subtotal !== null ? (
                                `$${item.subtotal.toFixed(2)}`
                              ) : (
                                <span className="text-orange-600 text-xs">TBD</span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Insights Section */}
                    {orderItems.length > 0 && (() => {
                      const stats = getOrderStats()
                      const loadTypeColors: Record<string, string> = {
                        'LTL': 'bg-blue-100 text-blue-700 border-blue-300',
                        'Partial FTL': 'bg-yellow-100 text-yellow-700 border-yellow-300',
                        'Full Truckload': 'bg-green-100 text-green-700 border-green-300',
                        'Multi-Truck': 'bg-purple-100 text-purple-700 border-purple-300'
                      }
                      
                      return (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">Order Insights</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${loadTypeColors[stats.loadType]}`}>
                              {stats.loadType}
                            </span>
                          </div>
                          
                          {/* Quick Stats - Minimal & Sleek */}
                          {(stats.uniqueProducts > 1 || stats.uniqueCommodities > 1 || stats.totalUnits > 0 || stats.totalPallets > 0) && (
                            <div className="flex items-center gap-4 mb-3 text-xs">
                              {stats.uniqueProducts > 1 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Products:</span>
                                  <span className="font-semibold text-gray-900">{stats.uniqueProducts}</span>
                                </div>
                              )}
                              {stats.uniqueCommodities > 1 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Commodities:</span>
                                  <span className="font-semibold text-gray-900">{stats.uniqueCommodities}</span>
                                </div>
                              )}
                              {stats.totalUnits > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Units:</span>
                                  <span className="font-semibold text-blue-600">{stats.totalUnits}</span>
                                </div>
                              )}
                              {stats.totalPallets > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Pallets:</span>
                                  <span className="font-semibold text-indigo-600">{stats.totalPallets}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* FTL Progress */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">Truckload Capacity</span>
                              <span className="text-xs font-bold text-gray-900">{stats.ftlPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  stats.ftlPercentage >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                  stats.ftlPercentage >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                  'bg-gradient-to-r from-blue-400 to-blue-500'
                                }`}
                                style={{ width: `${Math.min(stats.ftlPercentage, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-start justify-between text-xs">
                              <div>
                                <span className="text-gray-600">Est. Pallets: </span>
                                <span className="font-semibold text-gray-900">{stats.palletEquivalent}</span>
                                <span className="text-gray-500"> / 26</span>
                              </div>
                              {stats.palletsToFTL > 0 && stats.ftlPercentage < 100 && (
                                <div className="text-right">
                                  <span className="text-orange-600 font-medium">
                                    +{stats.palletsToFTL} to FTL
                                  </span>
                                </div>
                              )}
                            </div>
                            {stats.ftlPercentage >= 100 && (
                              <div className="mt-2 flex items-center text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Eligible for FTL rates!
                              </div>
                            )}
                            {stats.ftlPercentage >= 50 && stats.ftlPercentage < 75 && (
                              <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
                                💡 Add {stats.palletsToFTL} more pallets for better freight rates
                              </div>
                            )}
                          </div>
                          
                          {/* Organic Badge */}
                          {stats.organicCount > 0 && (
                            <div className="mt-3 flex items-center text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">
                                {stats.organicCount} organic product{stats.organicCount > 1 ? 's' : ''} included
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    
                    <div className="border-t-2 border-gray-300 pt-4 mb-4">
                      {hasPalletItems() ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Subtotal (units only)</span>
                            <span className="text-gray-900 font-semibold">${getOrderTotal().toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-orange-600">TBD</span>
                          </div>
                          <p className="text-xs text-orange-600 italic">
                            *Final total pending pallet configuration
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-green-600">${getOrderTotal().toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Comments Section */}
                    <div className="mb-4">
                      <label htmlFor="order-comments" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        id="order-comments"
                        rows={3}
                        value={orderComments}
                        onChange={(e) => setOrderComments(e.target.value)}
                        placeholder="Delivery instructions, special requests, etc..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Submit Order Request
                    </button>
                    
                    <div className="text-xs text-gray-500 text-center mt-3 space-y-1">
                      <p>This will send a message to {companyName} with your order details.</p>
                      <p>Request will be sent on behalf of <span className="font-medium text-gray-700">{searchParams?.get('buyer') || 'your company'}</span>.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${emailSent ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
              <h3 className="text-xl font-semibold text-white">
                {emailSent ? '✓ Order Request Sent!' : 'Review Order Request'}
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailSent(false)
                }}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {emailSent ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Order Request Received!</h4>
                  <p className="text-gray-600">
                    Thanks for your interest. We'll contact you as soon as possible<br />
                    to confirm availability and delivery details.
                  </p>
                </div>
              ) : (
                <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {user?.companyName && <div className="font-semibold">{user.companyName}</div>}
                  {user?.name && <div>{user.name}</div>}
                  {user?.email && <div className="text-gray-600">{user.email}</div>}
                  {!user?.email && 'No email available'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded border border-gray-200 whitespace-pre-wrap font-mono">
                  {emailContent.body}
                </div>
              </div>
              </>
              )}
            </div>

            {/* Modal Footer */}
            {!emailSent && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                You will receive a copy of this order request at your email address
              </p>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

