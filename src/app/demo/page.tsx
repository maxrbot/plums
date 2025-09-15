'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  PlayIcon, 
  ArrowLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import LoginModal from '@/components/modals/LoginModal'

export default function DemoPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('signup')

  const openLoginModal = (mode: 'login' | 'signup' = 'signup') => {
    setLoginMode(mode)
    setIsLoginModalOpen(true)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-lime-600">
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
          <div className="flex lg:flex-1 justify-center">
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
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => openLoginModal('signup')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-500 hover:bg-lime-600"
            >
              Join Early Access
            </button>
          </div>
        </nav>
      </header>

      {/* Demo Hero */}
      <div className="relative bg-gradient-to-br from-lime-50 to-green-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-sm border border-lime-200">
                <PlayIcon className="h-6 w-6 text-lime-600" />
                <span className="text-sm font-medium text-gray-900">Product Demo</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              See AcreList in Action
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              Watch how farmers are transforming their sales process with professional price sheets, 
              customer management, and real-time analytics.
            </p>
          </div>

          {/* Video Container */}
          <div className="mx-auto max-w-5xl">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="relative bg-black" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                {/* Placeholder for now - replace with actual YouTube embed */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center">
                    <PlayIcon className="h-20 w-20 text-white mx-auto mb-6 opacity-75" />
                    <p className="text-white text-2xl font-medium mb-4">Demo Video Coming Soon</p>
                    <p className="text-gray-300 text-lg max-w-md mx-auto mb-8">
                      We're putting the finishing touches on our comprehensive demo video. 
                      Join our early access list to be notified when it's ready!
                    </p>
                    <button
                      onClick={() => openLoginModal('signup')}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-lime-400 hover:bg-lime-300"
                    >
                      Join Early Access
                    </button>
                  </div>
                </div>
                
                {/* Future YouTube embed will go here */}
                {/* 
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0&modestbranding=1"
                  title="AcreList Demo - See How Farmers Transform Their Sales"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll See */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What You'll See in the Demo
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A complete walkthrough of how AcreList transforms your farm's sales process
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-lime-100 flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-8 w-8 text-lime-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Price Sheets</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                  <span>Create branded, professional price sheets in minutes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                  <span>Customize pricing for different customer tiers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                  <span>Showcase your farm's story and certifications</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center mb-6">
                <PaperAirplaneIcon className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Management</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span>Organize contacts by industry and preferences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span>Send targeted price sheets via email or SMS</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span>Track delivery status and engagement</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Analytics</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>See which customers viewed your price sheets</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track engagement patterns and hot leads</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Monitor pricing performance across products</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farm's Sales?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of farmers already using AcreList to connect with premium buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openLoginModal('signup')}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-slate-800 bg-lime-400 hover:bg-lime-300"
            >
              Join Early Access
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-md text-white hover:bg-gray-700"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Early access • Be the first to know • No spam, ever
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-lime-500">AcreList</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Your Farm&apos;s Command Center</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 AcreList. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginMode}
      />
    </div>
  )
}