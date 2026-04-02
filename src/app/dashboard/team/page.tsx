'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../../contexts/UserContext'
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Breadcrumbs } from '../../../components/ui'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

interface Member {
  id: string
  email: string
  name: string
  role: 'owner' | 'member'
  lastSeenAt: string | null
  emailsSent: number
  createdAt: string
}

interface OrgInfo {
  id: string
  name: string
  slug: string
  inviteCode: string
  memberCount: number
}

export default function TeamPage() {
  const { user } = useUser()
  const [members, setMembers] = useState<Member[]>([])
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTeam()
  }, [])

  async function fetchTeam() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/team`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load team')
      }
      const data = await res.json()
      setOrg(data.org)
      setMembers(data.members)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm('Remove this team member? They will lose access to the org data.')) return
    setRemoving(memberId)
    try {
      const res = await fetch(`${API_BASE}/team/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove member')
      }
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove member')
    } finally {
      setRemoving(null)
    }
  }

  function copyInviteCode() {
    if (!org) return
    navigator.clipboard.writeText(org.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (user?.role !== 'owner') {
    return (
      <div>
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Team', current: true }]} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Team</h1>
        </div>
        <p className="text-gray-500 text-sm">Team management is only available to account owners.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Breadcrumbs items={[{ label: 'Team', current: true }]} />
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Team</h1>
        <p className="mt-1 text-sm text-gray-500">Manage who has access to your organisation.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {!loading && org && (
        <>
          {/* Invite code card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <UserPlusIcon className="h-4 w-4 text-gray-500" />
                  Invite team members
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Share this code with your team. They enter it at signup to join <span className="font-medium">{org.name}</span>.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <code className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-800 tracking-wide">
                {org.inviteCode}
              </code>
              <button
                onClick={copyInviteCode}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              They go to the AcreList signup page → "Have an invite code?" → enter the code above.
            </p>
          </div>

          {/* Members table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Members <span className="ml-1.5 text-gray-400 font-normal">({members.length})</span>
              </h2>
              <span className="text-xs text-gray-400">${45 * members.length}/mo · {members.length} seat{members.length !== 1 ? 's' : ''}</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {members.map(m => (
                <li key={m.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.name || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      m.role === 'owner' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {m.role === 'owner' ? 'Owner' : 'Member'}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-xs text-gray-500">{m.emailsSent} email{m.emailsSent !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-400">
                      {m.lastSeenAt ? `Active ${new Date(m.lastSeenAt).toLocaleDateString()}` : 'Never active'}
                    </p>
                  </div>
                  {m.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={removing === m.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                      title="Remove member"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                  {m.role === 'owner' && <div className="w-8" />}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

