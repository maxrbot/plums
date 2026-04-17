'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  SparklesIcon
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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-lime-50 via-white to-green-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
          {/* Hero Text */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="text-lime-500">Price Sheets</span> Made Simple
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              See how AcreList puts your agricultural products in front of premium buyers. 
              Real-time insights, professional price sheets, and buyer engagement - all in one dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={openWaitlistModal}
                className="rounded-md bg-lime-500 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
              >
                Join Early Access
              </button>
              <Link 
                href="/demo"
                className="text-lg font-semibold leading-6 text-gray-900 hover:text-lime-600"
              >
                Watch Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcases */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tools to help you sell
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Generate dynamic price sheets, manage customer outreach, and track engagement to turn inquiries into contracts.
            </p>
          </div>

          {/* Feature 1: Create Price Sheets */}
          <div className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1 lg:order-1">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-lime-700 bg-lime-100 mb-4">
                  Step 1
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Create Professional Price Sheets in Minutes
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  From iceberg lettuce to dragon fruit - build professional price sheets in minutes, not hours. Powered by real-time market data.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-lime-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">300+ varieties with custom spec flexibility</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-lime-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Real-time USDA market pricing guidance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-lime-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Price Sheet template library to elevate your brand</span>
          </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-lime-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Seamless integration to your existing software systems</span>
          </li>
                </ul>
                <div className="mt-6 text-sm text-gray-500 font-medium">
                  ⏱️ 15 hours → 15 minutes per week
                </div>
              </div>
              <div className="order-2 lg:order-2">
                {/* Mock Price Sheet Creation UI */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900">New Price Sheet</h4>
                      <span className="text-sm text-lime-600 font-medium">Draft</span>
                    </div>
                    {mockProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-lime-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{product.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.variety}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{product.price}</p>
                          <p className="text-xs text-gray-500">per lb</p>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-3 bg-lime-500 text-white font-medium rounded-lg hover:bg-lime-600 transition-colors">
                      Generate Price Sheet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Send & Personalize */}
          <div className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2">
                {/* Mock Email Outreach UI */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900">Send Price Sheet</h4>
                      <UserGroupIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {mockBuyerActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 font-semibold text-xs">{activity.buyer.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{activity.buyer}</p>
                              <p className="text-xs text-gray-500">Custom pricing tier</p>
                            </div>
                          </div>
                          <CheckCircleIcon className="h-5 w-5 text-lime-500" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <SparklesIcon className="h-5 w-5 text-lime-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-lime-900">AI-Personalized Messages</p>
                          <p className="text-xs text-lime-700 mt-1">Each buyer gets a unique message tailored to their preferences</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-cyan-700 bg-cyan-100 mb-4">
                  Step 2
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Dynamic Outreach That Converts
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Reach every buyer with tailored pricing and messaging that converts 3x better than generic sheets.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-cyan-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Buyer-specific pricing tiers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-cyan-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Personalized emails or texts written by AI, but sounding like you</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-cyan-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Automated follow-up sequences</span>
                  </li>
                </ul>
                <div className="mt-6 text-sm text-gray-500 font-medium">
                  📈 3x higher response rates
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Analytics */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1 lg:order-1">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 mb-4">
                  Step 3
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Track Every Interaction
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Know who's buying, what's selling, and optimize your margins with comprehensive buyer engagement analytics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Open & response rate tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Buyer engagement analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Product performance insights</span>
                  </li>
                </ul>
              </div>
              <div className="order-2 lg:order-2">
                {/* Mock Analytics UI */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900">Buyer Activity</h4>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Live</span>
                      </div>
                    </div>
                    {mockBuyerActivity.map((activity, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{activity.buyer}</p>
                            <p className="text-gray-600 text-xs mt-1">{activity.action}</p>
                            <p className="text-gray-400 text-xs mt-1 flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {activity.time}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            activity.status === 'hot' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-lime-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-lime-600">82%</p>
                        <p className="text-xs text-lime-700">Open Rate</p>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-cyan-600">29</p>
                        <p className="text-xs text-cyan-700">Active Buyers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-lime-50 via-white to-green-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Ready to transform your sales process?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join early access and be the first to experience the future of produce pricing.
            </p>
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
            Ready to transform your sales process?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join early access and be the first to experience the future of produce pricing.
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
              <span className="text-sm text-gray-600">Price Sheets Made Simple</span>
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