'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import WaitlistModal from '@/components/modals/WaitlistModal'

// Mock dashboard data
const mockProducts = [
  { name: 'Organic Strawberries', variety: 'Albion', price: '$4.50/lb', trend: '+12%', sheets: 8, lastSent: '2 days ago', region: 'Central Valley' },
  { name: 'Cherry Tomatoes', variety: 'Sweet 100', price: '$5.25/lb', trend: '+15%', sheets: 6, lastSent: '1 day ago', region: 'Central Valley' },
  { name: 'Romaine Lettuce', variety: 'Hearts', price: '$2.25/head', trend: '+8%', sheets: 5, lastSent: '1 week ago', region: 'Salinas Valley' },
  { name: 'Beefsteak Tomatoes', variety: 'Heirloom', price: '$3.75/lb', trend: '-3%', sheets: 3, lastSent: '3 days ago', region: 'Central Valley' }
]

const mockBuyerActivity = [
  { buyer: 'Kettle and Fire', action: 'Downloaded your 8/29/25 Price Sheet', time: '2 min ago', status: 'hot' },
  { buyer: 'Whole Foods Market', action: 'Opened price sheet (3rd time)', time: '8 min ago', status: 'hot' },
  { buyer: 'Serenity Kids', action: 'Requested updated pricing', time: '15 min ago', status: 'warm' }
]

export default function Home() {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)

  const openWaitlistModal = () => {
    setIsWaitlistModalOpen(true)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <Image
                src="/acrelist-logo.png" 
                alt="AcreList" 
                width={160} 
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="flex gap-x-8">
            {/* Removed navigation links to focus on interest generation */}
          </div>
          <div className="flex lg:flex-1 lg:justify-end gap-x-4">
            <button 
              onClick={openWaitlistModal}
              className="text-sm font-medium text-gray-700 hover:text-lime-600"
            >
              Login
            </button>
            <Link 
              href="/demo"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600"
            >
              Watch Demo
            </Link>
          </div>
        </nav>
      </header>

      {/* Dashboard Hero */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="text-lime-500">Produce Pricelists</span> Made Simple
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              See how AcreList puts your agricultural products in front of premium buyers. 
              Real-time insights, professional price sheets, and buyer engagement - all in one dashboard.
            </p>
          </div>

          {/* Live Dashboard Preview */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-lime-500 bg-opacity-20 flex items-center justify-center">
                  <span className="text-sm font-medium text-lime-400">SF</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Sunny Fields Farm</h3>
                  <p className="text-gray-300 text-sm">Premium Organic Produce</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lime-400 font-semibold">15 Sheets</p>
                  <p className="text-gray-300 text-sm">Sent this month</p>
                </div>
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Performance */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Your Products</h4>
                    <span className="text-sm text-gray-500">Price sheet performance</span>
                  </div>
                  <div className="space-y-3">
                    {mockProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-lime-300 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-lime-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{product.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.variety} • {product.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{product.price}</p>
                            <div className="flex items-center space-x-1">
                              <ArrowTrendingUpIcon className={`h-3 w-3 ${product.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                              <span className={`text-xs font-medium ${product.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {product.trend}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-gray-500">
                            <p className="text-sm font-medium">{product.sheets} sheets</p>
                            <p className="text-xs">Last sent {product.lastSent}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Buyer Activity</h4>
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">Live</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {mockBuyerActivity.map((activity, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{activity.buyer}</p>
                            <p className="text-gray-600 text-xs mt-1">{activity.action}</p>
                            <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            activity.status === 'hot' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-lime-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-lime-600">29</p>
                      <p className="text-xs text-lime-700">Active Customers</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-cyan-600">82%</p>
                      <p className="text-xs text-cyan-700">Open Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={openWaitlistModal}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600"
            >
              Join Early Access
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Be the first to know when we launch • No spam, ever
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="features" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tools to help you sell
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Generate dynamic price sheets, manage customer outreach, and track engagement to turn inquiries into contracts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-lime-100 flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-8 w-8 text-lime-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dynamic Price Sheets</h3>
              <p className="text-gray-600">
                Generate personalized, professional price sheets with custom pricing, branding, and product details that showcase your farm's unique value.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center mb-6">
                <PaperAirplaneIcon className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Send & Manage Outreach</h3>
              <p className="text-gray-600">
                Distribute price sheets to your customer base, manage contact preferences, and track delivery status all in one place.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Engagement Analytics</h3>
              <p className="text-gray-600">
                Track which customers are viewing your price sheets, monitor engagement patterns, and identify hot leads to prioritize your sales efforts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by agricultural suppliers nationwide
            </h2>
            <p className="text-gray-600">
              Join hundreds of farms already using AcreList to connect with premium buyers
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-lime-600">100+</p>
              <p className="text-sm text-gray-600">Grower Shippers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-600">20K</p>
              <p className="text-sm text-gray-600">Price Sheets Sent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">82%</p>
              <p className="text-sm text-gray-600">Open Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">15+</p>
              <p className="text-sm text-gray-600">States Served</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build your command center?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be among the first to experience the future of agricultural sales.
          </p>
          <button
            onClick={openWaitlistModal}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-slate-800 bg-lime-400 hover:bg-lime-300"
          >
            Join Early Access
          </button>
          <p className="mt-4 text-sm text-gray-400">
            Early access • Be the first to know • No spam, ever
          </p>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-lime-500">AcreList</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Your Farm&apos;s Command Center</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 AcreList. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </div>
  )
}