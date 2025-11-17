'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Get API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
  initialMode?: 'login' | 'signup'
  hideToggle?: boolean
}

export default function LoginModal({ isOpen, onClose, onLogin, initialMode = 'login', hideToggle = false }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'signup')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isInviteVerified, setIsInviteVerified] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  // Sync isRegisterMode with initialMode prop changes
  useEffect(() => {
    setIsRegisterMode(initialMode === 'signup')
  }, [initialMode])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRegisterMode(initialMode === 'signup')
      setEmail('')
      setPassword('')
      setCompanyName('')
      setContactName('')
      setError('')
      setIsLoading(false)
      setInviteCode('')
      setIsInviteVerified(false)
      setInviteError('')
      setShowCelebration(false)
      setShowWaitlist(true) // Always show waitlist by default (Early Access modal)
      setShowInviteForm(false)
      setWaitlistEmail('')
      setWaitlistSubmitted(false)
    }
  }, [isOpen, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isRegisterMode) {
        // Call register API
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            companyName,
            contactName
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed')
        }

        // Store tokens
        localStorage.setItem('accessToken', data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Call login API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        // Store tokens
        localStorage.setItem('accessToken', data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')
    
    if (inviteCode.toLowerCase() === 'early2025') {
      // Directly go to signup form with celebration message
      setShowInviteForm(false)
      setIsInviteVerified(true)
      setIsRegisterMode(true)
    } else {
      setInviteError('Invalid invite code. Please check your code and try again.')
    }
  }

  const handleShowLoginForm = () => {
    setShowWaitlist(false)
    setShowInviteForm(false)
    setIsRegisterMode(false)
    setIsInviteVerified(false)
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call to add email to waitlist
    try {
      // In a real app, you'd call your waitlist API here
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWaitlistSubmitted(true)
    } catch (err) {
      setError('Failed to join waitlist. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowInviteForm = () => {
    setShowWaitlist(false)
    setShowInviteForm(true)
  }

  const handleBackToWaitlist = () => {
    setShowInviteForm(false)
    setShowWaitlist(true)
    setInviteError('')
    setInviteCode('')
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setCompanyName('')
    setContactName('')
    setError('')
    setIsLoading(false)
    setInviteCode('')
    setIsInviteVerified(false)
    setInviteError('')
    setShowCelebration(false)
    setShowWaitlist(false)
    setShowInviteForm(false)
    setWaitlistEmail('')
    setWaitlistSubmitted(false)
    // Reset to initial mode when closing
    setIsRegisterMode(initialMode === 'signup')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const toggleMode = () => {
    const newRegisterMode = !isRegisterMode
    setIsRegisterMode(newRegisterMode)
    setError('')
    
    // If switching to register mode, show waitlist by default
    if (newRegisterMode) {
      setShowWaitlist(true)
      setShowInviteForm(false)
      setIsInviteVerified(false)
      setShowCelebration(false)
      setWaitlistSubmitted(false)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                      {showWaitlist ? 'Join AcreList' : 
                       showInviteForm ? 'Verify Access' : 
                       isRegisterMode && isInviteVerified ? 'Create Account' : 
                       'Welcome Back'}
                    </Dialog.Title>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {showWaitlist ? (
                      waitlistSubmitted ? (
                          /* Waitlist Success */
                          <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                              <span className="text-2xl">✅</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h4>
                            <p className="text-sm text-gray-600 mb-6">
                              We'll notify you at <strong>{waitlistEmail}</strong> when AcreList becomes available.
                            </p>
                            <button
                              onClick={handleClose}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Close
                            </button>
                          </div>
                        ) : (
                          /* Waitlist Form */
                          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                            <div className="text-center mb-6">
                              <div className="mx-auto h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                                <span className="text-lime-600 font-semibold text-lg">🚀</span>
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 mb-2">Early Access Required</h4>
                              <p className="text-sm text-gray-600">
                                AcreList is currently in early access. Join our waitlist to be notified when we launch.
                              </p>
                            </div>

                            <div>
                              <label htmlFor="waitlistEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="waitlistEmail"
                                value={waitlistEmail}
                                onChange={(e) => setWaitlistEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                placeholder="you@company.com"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Joining waitlist...
                                </div>
                              ) : (
                                'Join Waitlist'
                              )}
                            </button>

                            <div className="flex items-center justify-center gap-4 text-sm">
                              <button
                                type="button"
                                onClick={handleShowLoginForm}
                                className="text-gray-700 hover:text-gray-900 font-semibold hover:underline"
                              >
                                Sign in
                              </button>
                              <span className="text-gray-400">•</span>
                              <button
                                type="button"
                                onClick={handleShowInviteForm}
                                className="text-lime-600 hover:text-lime-700 font-semibold hover:underline"
                              >
                                Have an invite code?
                              </button>
                            </div>
                          </form>
                        )
                    ) : showInviteForm ? (
                      /* Invite Code Form */
                      <form onSubmit={handleInviteSubmit} className="space-y-4">
                        <div className="text-center mb-6">
                          <div className="mx-auto h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                            <span className="text-lime-600 font-semibold text-lg">🔑</span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Enter Invite Code</h4>
                          <p className="text-sm text-gray-600">
                            Please enter your invite code to continue with account creation.
                          </p>
                        </div>

                        {inviteError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{inviteError}</p>
                          </div>
                        )}

                        <div>
                          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Invite Code
                          </label>
                          <input
                            type="text"
                            id="inviteCode"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                            placeholder="Enter your invite code"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
                        >
                          Verify Invite Code
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={handleBackToWaitlist}
                            className="text-sm text-gray-600 hover:text-gray-500"
                          >
                            ← Back to waitlist
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Main Form */
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegisterMode && isInviteVerified && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-300 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-400 to-green-500 flex items-center justify-center mr-3">
                                <span className="text-xl">🎉</span>
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">You're In!</h4>
                                <p className="text-sm text-lime-700">Welcome to AcreList Early Access</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {isRegisterMode && (
                          <>
                            <div>
                              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                              </label>
                              <input
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                placeholder="Your Company"
                              />
                            </div>

                            <div>
                              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name
                              </label>
                              <input
                                type="text"
                                id="contactName"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                placeholder="John Doe"
                              />
                            </div>
                          </>
                        )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                          placeholder={isRegisterMode ? "At least 6 characters" : "Your password"}
                          minLength={isRegisterMode ? 6 : undefined}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                          </div>
                        ) : (
                          isRegisterMode ? 'Create Account' : 'Sign In'
                        )}
                      </button>

                      {!isRegisterMode && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={handleBackToWaitlist}
                            className="text-sm text-gray-600 hover:text-gray-500"
                          >
                            ← Back to waitlist
                          </button>
                        </div>
                      )}
                      </form>
                    )}

                    {isRegisterMode && isInviteVerified && (
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                          By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
