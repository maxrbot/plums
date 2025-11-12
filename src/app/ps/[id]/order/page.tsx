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
  unit: 'cases' | 'pallets'
  subtotal: number
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
        unit: 'cases',
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
        return {
          ...item,
          quantity,
          subtotal: (item.price || 0) * quantity
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
        return {
          ...item,
          unit: item.unit === 'cases' ? 'pallets' : 'cases'
        }
      }
      return item
    }))
  }

  const getOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleSubmitOrder = () => {
    const orderSummary = orderItems.map(item => 
      `${item.quantity} ${item.unit} - ${item.productName || `${item.variety} ${item.commodity}`} (${item.packageType}) - $${item.subtotal.toFixed(2)}`
    ).join('\n')
    
    const total = getOrderTotal()
    const subject = `Order Request - ${priceSheet?.title}`
    const commentsSection = orderComments.trim() ? `\n\nAdditional Comments:\n${orderComments}\n` : ''
    const body = `Hi,\n\nI would like to place the following order:\n\n${orderSummary}\n\nTotal: $${total.toFixed(2)}${commentsSection}\nPlease confirm availability and delivery details.\n\nThank you!`
    
    setEmailContent({ subject, body })
    setShowEmailModal(true)
  }

  const handleSendEmail = () => {
    window.location.href = `mailto:${user?.email}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`
    setShowEmailModal(false)
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
            onClick={() => router.back()}
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
                              disabled={product.availability !== 'Available'}
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
                              <p className="text-xs text-gray-600">{item.packageType}</p>
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
                              <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
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
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t-2 border-gray-300 pt-4 mb-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">${getOrderTotal().toFixed(2)}</span>
                      </div>
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
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      This will send an email to {companyName} with your order details
                    </p>
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Review Order Request</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {user?.email || 'No email available'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {emailContent.subject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded border border-gray-200 whitespace-pre-wrap font-mono">
                  {emailContent.body}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
          </div>
        </div>
      )}
    </div>
  )
}

