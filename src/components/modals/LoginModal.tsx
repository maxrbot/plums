'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

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
    }
  }, [isOpen, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isRegisterMode) {
        // Call register API
        const response = await fetch('http://localhost:3001/api/auth/register', {
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
        const response = await fetch('http://localhost:3001/api/auth/login', {
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

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setCompanyName('')
    setContactName('')
    setError('')
    setIsLoading(false)
    // Reset to initial mode when closing
    setIsRegisterMode(initialMode === 'signup')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setError('')
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
                      {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                    </Dialog.Title>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                    </form>

                    {!hideToggle && (
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                          {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                          <button
                            type="button"
                            onClick={toggleMode}
                            className="font-medium text-lime-600 hover:text-lime-500"
                          >
                            {isRegisterMode ? 'Sign in' : 'Create one'}
                          </button>
                        </p>
                      </div>
                    )}

                    {isRegisterMode && (
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
