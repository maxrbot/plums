'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginModal from '@/components/modals/LoginModal'

/**
 * Root page for app.acrelist.ag
 * 
 * This shows a login page for unauthenticated users,
 * or redirects to the dashboard if they're authenticated.
 * 
 * The marketing site lives at www.acrelist.ag (separate /marketing folder)
 */
export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, show login modal
      setIsChecking(false)
      setShowLogin(true)
    }
  }, [router])

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-green-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AcreList
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your platform for agricultural price sheets and market intelligence
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-8 py-3 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-700 transition-colors"
        >
          Sign In
        </button>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  )
}