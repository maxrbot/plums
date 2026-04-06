'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) router.replace('/manage')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid email or password')
        return
      }
      localStorage.setItem('accessToken', data.tokens.accessToken)
      router.replace('/manage')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
              ProduceHunt
            </span>
          </Link>
          <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
            Supplier login
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
                  border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '0.9375rem',
                  outline: 'none', color: '#111'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
                  border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '0.9375rem',
                  outline: 'none', color: '#111'
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '10px', background: loading ? '#9ca3af' : '#111',
                color: 'white', border: 'none', borderRadius: '7px', fontSize: '0.9375rem',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8125rem', color: '#9ca3af' }}>
          Don&apos;t have an account?{' '}
          <Link href="/claim" style={{ color: '#374151', fontWeight: 500, textDecoration: 'none' }}>
            Claim your listing
          </Link>
        </p>
      </div>
    </div>
  )
}
