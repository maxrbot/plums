'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Root page for app.acrelist.ag
 * 
 * This redirects users to the dashboard if they're authenticated,
 * or to the login page if they're not.
 * 
 * The marketing site lives at www.acrelist.ag (separate /marketing folder)
 */
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, redirect to marketing site or show login
      // For now, redirect to dashboard which will handle auth
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}