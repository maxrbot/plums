'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ACRELIST_URL = process.env.NEXT_PUBLIC_ACRELIST_URL || 'https://app.acrelist.ag'

// ── Mock data for UI previews ─────────────────────────────────────────────────

const mockBuyers = [
  { initials: 'WF', name: 'Whole Foods Market', color: 'bg-emerald-100 text-emerald-700', tier: 'Premium', price: '$4.20/unit', opened: '9 min ago', showOpened: true },
  { initials: 'KF', name: 'Kettle and Fire', color: 'bg-sky-100 text-sky-700', tier: 'Standard', price: '$4.50/unit', opened: '2 hrs ago', showOpened: true },
  { initials: 'SK', name: 'Serenity Kids', color: 'bg-violet-100 text-violet-700', tier: 'Organic+', price: '$4.80/unit', opened: 'Yesterday', showOpened: false },
]

const mockSheet = [
  { name: 'Organic Strawberries', variety: 'Albion', pkg: '8 x 1lb clamshell', price: '$4.50', aiLow: '$4.20', aiHigh: '$4.80', mktAvg: '$4.35' },
  { name: 'Cherry Tomatoes', variety: 'Sun Gold', pkg: '12 x 1pt', price: '$5.25', aiLow: null, aiHigh: null, mktAvg: null },
  { name: 'Romaine Lettuce', variety: 'Hearts', pkg: '24ct carton', price: '$2.25', aiLow: null, aiHigh: null, mktAvg: null },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Index2() {
  const [demoEmail, setDemoEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState<'sheet' | 'activity'>('activity')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (demoEmail) setSubmitted(true)
  }

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/acrelist-logo.png" alt="AcreList" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={ACRELIST_URL} className="text-sm text-gray-500 hover:text-gray-800">Log in</Link>
            <Link href={ACRELIST_URL + '/signup'} className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-semibold text-lime-600 tracking-wide uppercase mb-4">For growers &amp; shippers</p>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto">
          Stop sending PDFs.<br />
          <span className="text-lime-500">Supercharge your price sheets.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          AI-powered pricing. Personalized price sheets. Open-rate analytics. On autopilot, or done with a single click.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={ACRELIST_URL + '/signup'}
            className="px-8 py-3.5 bg-lime-500 text-white font-semibold rounded-xl hover:bg-lime-600 transition-colors text-base shadow-sm">
            Set up your first price sheet →
          </Link>
          <Link href="/demo"
            className="px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-400 transition-colors text-base">
            Watch demo
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Free to start · No credit card required</p>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Fake browser chrome */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200">
              app.acrelist.ag/dashboard
            </div>
          </div>
          {/* Mobile tab switcher */}
          <div className="flex sm:hidden border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'sheet' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400'}`}
            >
              Price Sheet
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'activity' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400'}`}
            >
              Buyer Activity
            </button>
          </div>

          {/* Dashboard content */}
          <div className="grid grid-cols-1 sm:grid-cols-5 sm:divide-x divide-gray-200">
            {/* Left — price sheet */}
            <div className={`sm:block sm:col-span-3 ${activeTab === 'sheet' ? '' : 'hidden sm:!block'}`}>
              {/* Farm branding strip */}
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-lime-50 to-white border-b border-gray-200">
                <div className="w-7 h-7 rounded-md bg-lime-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">SO</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">Sunrise Organics</p>
                  <p className="text-xs text-gray-400">Spring 2026 Price Sheet</p>
                </div>
              </div>
              <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Price Sheet</p>
                  <p className="text-sm font-semibold text-gray-800">Week of Apr 14, 2026</p>
                </div>
                <span className="px-2 py-0.5 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full border border-lime-100">Live</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">15 products · 84 recipients</p>
              <div className="space-y-2">
                {mockSheet.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.variety} · {item.pkg}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{item.price}<span className="text-xs font-normal text-gray-400">/unit</span></p>
                    </div>
                    {item.aiLow && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 text-xs font-semibold rounded border border-violet-100">AI</span>
                        <span className="text-xs text-gray-400">Suggests {item.aiLow}–{item.aiHigh} · Market avg {item.mktAvg}</span>
                        <span className="text-xs text-lime-600 font-medium">✓ In range</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="w-full py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg">Send to 84 buyers →</button>
                <p className="text-center text-xs text-gray-400 mt-1.5">Each buyer receives their own personalized pricing</p>
              </div>
              </div>
            </div>
            {/* Right — buyer activity */}
            <div className={`sm:block col-span-1 sm:col-span-2 p-6 ${activeTab === 'activity' ? '' : 'hidden sm:!block'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyer Activity</p>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">84</p>
                  <p className="text-xs text-gray-400">Delivered</p>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <p className="text-sm font-bold text-lime-600">67</p>
                  <p className="text-xs text-gray-400">Opened</p>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <p className="text-sm font-bold text-lime-600">82%</p>
                  <p className="text-xs text-gray-400">Open rate</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {mockBuyers.map((b, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${b.color}`}>
                        {b.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-gray-800 truncate">{b.name}</p>
                          {b.showOpened && <span className="text-xs px-1.5 py-0.5 bg-lime-50 text-lime-700 rounded font-medium flex-shrink-0 border border-lime-100">Opened</span>}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-400">{b.opened === 'Yesterday' ? 'Sent · Yesterday' : `Opened · ${b.opened}`}</p>
                          <span className="text-xs text-gray-500 font-medium">{b.price}</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">{b.tier} tier</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-3 tracking-tight">Pricing in a PDF is losing you sales.</h2>
          <p className="text-center text-sm text-gray-400 mb-12">Here&apos;s what growers tell us before they switch.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-6">Before AcreList</p>
              <ul className="space-y-4">
                {[
                  'Rebuild a spreadsheet from scratch every single week',
                  'Blast the same PDF to every buyer — no personalization, no tracking',
                  'No idea if anyone opened it, or when',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                    <span className="text-red-300 mt-0.5 flex-shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-white rounded-2xl border border-lime-200 p-8 shadow-sm">
              <p className="text-xs font-semibold text-lime-600 uppercase tracking-wider mb-6">With AcreList</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>One price sheet</strong>, updated in seconds and <strong>pushed live to all buyers instantly</strong></span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>1-click send to hundreds of buyers</strong>, each with a <strong>personalized email and their own pricing</strong></span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span><strong>AI price guidance</strong> and historical sales data surface your <strong>optimal selling price</strong> before you hit send</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-lime-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Know the <strong>moment a buyer opens</strong> and follow up <strong>before they look elsewhere</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What&apos;s in your toolbelt</p>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-14 tracking-tight">AI-powered tools to sell smarter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'Build',
              color: 'border-lime-200 bg-lime-50',
              labelColor: 'text-lime-700',
              numBg: 'bg-lime-100 text-lime-600',
              points: [
                'Your branding, your template',
                'Buyer-specific pricing tiers',
                'AI pricing guidance + live market data built in',
              ],
            },
            {
              num: '02',
              title: 'Send',
              color: 'border-sky-200 bg-sky-50',
              labelColor: 'text-sky-700',
              numBg: 'bg-sky-100 text-sky-600',
              points: [
                'One click sends to hundreds of buyers at once',
                'Each buyer only sees their own pricing',
                'Looks professional, not a spreadsheet',
              ],
            },
            {
              num: '03',
              title: 'Know',
              color: 'border-violet-200 bg-violet-50',
              labelColor: 'text-violet-700',
              numBg: 'bg-violet-100 text-violet-600',
              points: [
                'See who opened and when',
                'Know who\'s ready to buy before you call',
                'Your follow-up calls are never cold',
              ],
            },
          ].map((pillar) => (
            <div key={pillar.title} className={`rounded-2xl border p-6 ${pillar.color}`}>
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mb-3 ${pillar.numBg}`}>{pillar.num}</div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${pillar.labelColor}`}>{pillar.title}</p>
              <ul className="space-y-2.5">
                {pillar.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-300 mt-0.5 flex-shrink-0">—</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '10 min', label: 'To set up your first price sheet' },
              { stat: '82%', label: 'Average open rate' },
              { stat: '300+', label: 'Commodities and varieties' },
              { stat: '15 hrs', label: 'Saved per week on pricing admin' },
            ].map((s) => (
              <div key={s.stat}>
                <p className="text-3xl font-bold text-lime-400">{s.stat}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Your buyers want your prices.<br />
          <span className="text-lime-500">Be in their inbox first.</span>
        </h2>
        <p className="text-lg text-gray-500 mb-10">
          Set up your first price sheet in 10 minutes. Free to start.
        </p>
        {submitted ? (
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-lime-50 border border-lime-200 text-lime-700 font-semibold rounded-xl text-lg">
            ✓ We&apos;ll be in touch shortly
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={demoEmail}
              onChange={e => setDemoEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button type="submit"
              className="px-6 py-3.5 bg-lime-500 text-white font-semibold rounded-xl hover:bg-lime-600 transition-colors text-sm whitespace-nowrap shadow-sm">
              Request demo →
            </button>
          </form>
        )}
        <p className="mt-4 text-sm text-gray-400">No spam. No credit card. Just a demo.</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">AcreList</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">Price Sheets Made Simple</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 AcreList</p>
        </div>
      </footer>

    </div>
  )
}
