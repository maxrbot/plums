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
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (isRedirecting) return
    
    // First, check if tokens are in URL (from marketing site login)
    const params = new URLSearchParams(window.location.search)
    const urlAccessToken = params.get('accessToken')
    const urlRefreshToken = params.get('refreshToken')
    const urlUser = params.get('user')
    
    if (urlAccessToken && urlRefreshToken && urlUser) {
      console.log('🔐 Tokens found in URL, saving to localStorage...')
      // Save tokens to localStorage
      localStorage.setItem('accessToken', urlAccessToken)
      localStorage.setItem('refreshToken', urlRefreshToken)
      localStorage.setItem('user', urlUser)
      
      // Mark that we just saved tokens (used by dashboard to wait for UserContext)
      sessionStorage.setItem('justLoggedIn', 'true')
      
      // Clean up URL (remove tokens from URL for security)
      window.history.replaceState({}, '', '/')
      
      // Set redirecting flag and redirect to dashboard
      setIsRedirecting(true)
      console.log('🔐 Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
      return
    }
    
    // Check if user is already authenticated
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken) {
      console.log('🔐 User already authenticated, redirecting to dashboard...')
      // User is logged in, redirect to dashboard
      setIsRedirecting(true)
      router.push('/dashboard')
    } else {
      console.log('🔐 No authentication found, showing login modal...')
      // User is not logged in, show login modal
      setIsChecking(false)
      setShowLogin(true)
    }
  }, [router, isRedirecting])

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