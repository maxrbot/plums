'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const SLIDES = [
  // 1. Cover
  {
    id: 'cover',
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center px-16">
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 bg-lime-100 border border-lime-300 rounded-full">
          <div className="w-2 h-2 rounded-full bg-lime-500" />
          <span className="text-xs font-semibold text-lime-700 uppercase tracking-widest">Pre-Seed · 2025</span>
        </div>
        <h1 className="text-7xl font-bold text-gray-900 mb-4 tracking-tight">AcreList</h1>
        <p className="text-2xl text-gray-500 mb-12 max-w-xl leading-relaxed">
          The operating system for produce sales — from price sheets to AI-powered agents.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span>Max Ratkovich</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Rick Johnston</span>
        </div>
      </div>
    ),
  },

  // 2. The Problem
  {
    id: 'problem',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">The Problem</p>
        <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight max-w-3xl">
          Fresh produce is a $200B market still running on spreadsheets, PDFs, and phone calls.
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-4">
          {[
            { stat: 'Monday morning', label: 'A sales rep manually updates prices across 6 different spreadsheets' },
            { stat: 'PDF price sheets', label: 'Emailed to buyers who screenshot them, losing all tracking and context' },
            { stat: 'Zero visibility', label: 'No way to know if a buyer opened your sheet, what they looked at, or when to follow up' },
          ].map((item, i) => (
            <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-sm font-bold text-red-700 mb-2">{item.stat}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 3. The Insight
  {
    id: 'insight',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">The Insight</p>
        <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight max-w-3xl">
          Produce sales runs on relationships and trust — not features.
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed mb-8">
          That's exactly why AI can own the routine work while humans own the exceptions. No one else is building
          a vertical-specific tool for this wedge.
        </p>
        <div className="flex items-start gap-4 bg-lime-50 border border-lime-200 rounded-xl p-6 max-w-2xl">
          <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <p className="text-sm text-lime-800 leading-relaxed">
            Generic CRMs like Salesforce weren't built for commodity pricing, pack configurations, shipping points,
            or USDA market data. The spreadsheet is the real competitor — and it's beatable.
          </p>
        </div>
      </div>
    ),
  },

  // 4. What We Built
  {
    id: 'product',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Phase 1 — Built</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 leading-tight">
          AcreList is a digital price sheet platform built specifically for produce sales.
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Digital Price Sheets', desc: 'Build and send beautiful, trackable price sheets in minutes. No PDFs. Buyers get a live link.' },
            { title: 'Contact Intelligence', desc: 'Custom pricing per buyer, primary crop interests, send history, and view tracking per contact.' },
            { title: 'USDA Market Data', desc: 'Live terminal market prices for your commodities, built into the tool where you need it.' },
            { title: 'Team & Catalog', desc: 'Shared product catalog, packaging configs, shipping points — one source of truth for the whole sales team.' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1.5">{item.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 5. Value / Time Savings
  {
    id: 'value',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Why It Matters</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 leading-tight max-w-2xl">
          A produce sales rep spends 40% of their week on admin, not selling.
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              before: '2–3 hrs',
              after: '< 15 min',
              label: 'Building and sending a weekly price sheet to 30 buyers',
            },
            {
              before: 'None',
              after: 'Real-time',
              label: 'Visibility into whether buyers opened, viewed, or acted on your sheet',
            },
            {
              before: 'Manual',
              after: 'Automatic',
              label: 'Custom pricing per buyer applied instantly at send — no version control chaos',
            },
          ].map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm line-through text-red-400 font-mono">{item.before}</span>
                <span className="text-gray-300">→</span>
                <span className="text-sm text-lime-600 font-bold font-mono">{item.after}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-400">
          Early demo feedback: "This would save me half a day every week" — produce sales rep, 15 years experience
        </p>
      </div>
    ),
  },

  // 6. Roadmap
  {
    id: 'roadmap',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Roadmap</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-12 leading-tight">
          Three phases. One north star.
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              phase: 'Phase 1',
              status: 'Built',
              statusColor: 'bg-lime-100 text-lime-700',
              title: 'The Best Tool',
              desc: 'Digital price sheets, contact management, USDA market data, send tracking. Salespeople save hours every week.',
            },
            {
              phase: 'Phase 2',
              status: '12–18 months',
              statusColor: 'bg-blue-50 text-blue-600',
              title: 'AI Copilot',
              desc: 'Pricing suggestions from market data. Automated follow-up drafts. Buyer intent signals. The rep moves faster.',
            },
            {
              phase: 'Phase 3',
              status: '3 years',
              statusColor: 'bg-gray-100 text-gray-500',
              title: 'AI Agent',
              desc: 'One person supervises 10 AI sales agents. Each handles a full book of business. Routine work disappears entirely.',
            },
          ].map((item, i) => (
            <div key={i} className={`border rounded-xl p-6 ${i === 0 ? 'border-lime-300 bg-lime-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.phase}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.statusColor}`}>{item.status}</span>
              </div>
              <p className="text-base font-bold text-gray-900 mb-2">{item.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-400 max-w-2xl">
          Every transaction through AcreList trains the model that eventually <em>is</em> the sales rep. The data flywheel starts on day one.
        </p>
      </div>
    ),
  },

  // 7. Why Now
  {
    id: 'why-now',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Why Now</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 leading-tight max-w-2xl">
          Three forces converging at the same moment.
        </h2>
        <div className="space-y-4 max-w-2xl">
          {[
            {
              n: '01',
              title: 'AI is ready',
              desc: 'LLMs can now handle the nuanced, relationship-aware communication that produce sales requires. This wasn\'t possible three years ago.',
            },
            {
              n: '02',
              title: 'The industry is digitizing',
              desc: 'Post-COVID supply chain chaos exposed how fragile spreadsheet-based operations are. Buyers and sellers both want better tools.',
            },
            {
              n: '03',
              title: 'No one owns this space',
              desc: 'Generic CRMs don\'t understand commodities, pack configs, or USDA pricing. The vertical is wide open for a purpose-built tool.',
            },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-5 bg-white border border-gray-200 rounded-xl p-5">
              <span className="text-2xl font-bold text-gray-200 flex-shrink-0">{item.n}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 8. Business Model
  {
    id: 'business-model',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Business Model</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 leading-tight">
          Starts as SaaS. Evolves to outcomes.
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              phase: 'Today',
              model: '$45 / seat / mo',
              desc: 'Per-seat SaaS. Simple, recurring, predictable. Owner + sales reps.',
              highlight: true,
            },
            {
              phase: 'Phase 2',
              model: '$45 + usage',
              desc: 'Base seat fee plus usage-based pricing for AI features — follow-up automation, pricing suggestions.',
              highlight: false,
            },
            {
              phase: 'Phase 3',
              model: '% of GMV',
              desc: 'As AI handles the full sales cycle, pricing shifts to outcomes. Tiny % of the $200B market flowing through the platform.',
              highlight: false,
            },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-6 border ${item.highlight ? 'border-lime-300 bg-lime-50' : 'border-gray-200 bg-white'}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{item.phase}</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">{item.model}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-8 text-sm text-gray-500">
          <div><span className="font-semibold text-gray-900">~50,000</span> produce sales professionals in North America</div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div><span className="font-semibold text-gray-900">$27M ARR</span> at 1% penetration, seat-only pricing</div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div><span className="font-semibold text-gray-900">$200B+</span> US fresh produce transacts annually</div>
        </div>
      </div>
    ),
  },

  // 9. TAM
  {
    id: 'tam',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Market Size</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-12 leading-tight">
          Two ways to measure it. Both are big.
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-xl p-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Near-Term · Seat-Based</p>
            <p className="text-5xl font-bold text-gray-900 mb-2">$350M</p>
            <p className="text-sm text-gray-500 mb-6">Annual recurring revenue opportunity</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between"><span>USDA registered commercial growers</span><span className="font-medium text-gray-700">10–15K</span></div>
              <div className="flex justify-between"><span>Produce sales professionals (NA)</span><span className="font-medium text-gray-700">~50K</span></div>
              <div className="flex justify-between"><span>Price per seat per month</span><span className="font-medium text-gray-700">$45</span></div>
              <div className="flex justify-between"><span>Avg seats per org</span><span className="font-medium text-gray-700">3–5</span></div>
            </div>
          </div>
          <div className="border border-lime-300 bg-lime-50 rounded-xl p-8">
            <p className="text-xs font-semibold text-lime-600 uppercase tracking-wide mb-4">Long-Term · Transaction %</p>
            <p className="text-5xl font-bold text-gray-900 mb-2">$2B+</p>
            <p className="text-sm text-gray-500 mb-6">At 0.1% take rate on transactions through the platform</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between"><span>US fresh produce market (annual)</span><span className="font-medium text-gray-700">~$200B</span></div>
              <div className="flex justify-between"><span>Addressable (grower → buyer)</span><span className="font-medium text-gray-700">~$50B</span></div>
              <div className="flex justify-between"><span>Take rate (outcome-based)</span><span className="font-medium text-gray-700">0.1–0.5%</span></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 10. Traction
  {
    id: 'traction',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Traction</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight max-w-2xl">
          We spent the last year making the product right. Now we're ready to sell.
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl leading-relaxed">
          V1 was in the hands of a real produce sales rep. They left the industry, but the feedback they gave
          shaped everything we've built since. Every gap they flagged is now handled cleanly.
        </p>
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Active demo pipeline', value: 'Strong', sub: "Everyone who's seen it wants to use it" },
            { label: 'Product gaps from V1', value: 'Closed', sub: 'All major feedback items addressed' },
            { label: 'First paying pilot', value: 'Imminent', sub: 'Rep being onboarded now' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-2">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 mb-1">{item.value}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500 italic">
            "This would save me half a day every week — and I'd finally know if buyers are actually looking at what I send them."
          </p>
          <p className="text-xs text-gray-400 mt-1">— Produce sales rep, 15 years in the industry, early demo</p>
        </div>
      </div>
    ),
  },

  // 11. Competition
  {
    id: 'competition',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Competition</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10 leading-tight max-w-2xl">
          The real competitor is the spreadsheet.
        </h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              name: 'Salesforce / HubSpot',
              verdict: 'Not built for this',
              desc: 'Generic CRM — no commodity pricing, no pack configs, no USDA data, no price sheet workflow. Overkill and wrong fit.',
              color: 'border-gray-200',
            },
            {
              name: 'Excel / Google Sheets',
              verdict: 'The real incumbent',
              desc: 'Free, familiar, and deeply embedded. We win by being dramatically faster with visibility they can\'t get from a spreadsheet.',
              color: 'border-red-200 bg-red-50',
            },
            {
              name: 'ERP / Famous Software',
              verdict: 'Back-office, not sales',
              desc: 'Handles operations and accounting. Doesn\'t help a sales rep communicate, track, or close. Complementary, not competitive.',
              color: 'border-gray-200',
            },
          ].map((item, i) => (
            <div key={i} className={`border rounded-xl p-6 ${item.color}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{item.name}</p>
              <p className="text-sm font-bold text-gray-900 mb-3">{item.verdict}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-400 max-w-2xl">
          No one is building a vertical-specific sales tool for fresh produce at this layer. The window is open.
        </p>
      </div>
    ),
  },

  // 12. Team
  {
    id: 'team',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">Team</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-12 leading-tight">
          An operator and a domain expert who both came from inside the industry.
        </h2>
        <div className="grid grid-cols-2 gap-8 max-w-3xl">
          {[
            {
              name: 'Max Ratkovich',
              role: 'Co-Founder · Product & Engineering',
              bio: 'Product manager background in AgTech, including Full Harvest — a B2B produce marketplace. Built AcreList end-to-end. Understands the buyer-seller dynamic from the inside.',
              initial: 'M',
            },
            {
              name: 'Rick Johnston',
              role: 'Co-Founder · Sales & GTM',
              bio: '20+ years leading produce sales teams. Built and scaled sales operations at brands including Sumo Citrus and Full Harvest. The exact person AcreList is built for.',
              initial: 'R',
            },
          ].map((person) => (
            <div key={person.name} className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-lime-100 border-2 border-lime-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-lime-700">{person.initial}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{person.name}</p>
                <p className="text-xs text-lime-600 font-semibold mb-3">{person.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{person.bio}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-3xl">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Shared DNA: </span>
            Both co-founders have direct experience at Full Harvest — a B2B produce marketplace. They've seen this problem from the operator side and know exactly what's broken.
          </p>
        </div>
      </div>
    ),
  },

  // 13. The Ask
  {
    id: 'ask',
    render: () => (
      <div className="flex flex-col justify-center h-full px-20">
        <p className="text-sm font-semibold text-lime-600 uppercase tracking-widest mb-6">The Ask</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          $250K pre-seed to prove the sales motion.
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl leading-relaxed">
          The product is built. The feedback is incorporated. Now we need to get it in front of buyers
          and prove that reps pay for it.
        </p>
        <div className="grid grid-cols-2 gap-8 max-w-3xl">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How it's used</p>
            <div className="space-y-3">
              {[
                { who: 'Max', what: '12 months continued product development and iteration on customer feedback' },
                { who: 'Rick', what: 'Transition to pilot sales full-time — direct outreach, demos, onboarding' },
              ].map((item) => (
                <div key={item.who} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-lime-700">{item.who[0]}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.what}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-lime-50 border border-lime-200 rounded-xl p-6">
            <p className="text-xs font-semibold text-lime-600 uppercase tracking-wide mb-4">What it unlocks</p>
            <div className="space-y-3">
              {[
                '10 paying pilot customers',
                '$50K+ ARR milestone',
                'Proof of willingness to pay',
                'Foundation for a $1–1.5M seed round',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 14. Close
  {
    id: 'close',
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center px-16">
        <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Every produce sale<br />still happens over the phone.
        </h2>
        <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed">
          We're changing that — starting with the tools, ending with the agent.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span>max@acrelist.ag</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span>acrelist.ag</span>
        </div>
      </div>
    ),
  },
]

function PasscodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (code === '102030') {
      localStorage.setItem('slides_unlocked', '1')
      onUnlock()
    } else {
      setError(true)
      setCode('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-10 py-10 flex flex-col items-center gap-5 w-80">
        <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">AcreList</p>
          <p className="text-xs text-gray-400 mt-0.5">Enter passcode to view</p>
        </div>
        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Passcode"
          autoFocus
          className={`w-full px-4 py-2.5 border rounded-lg text-sm text-center tracking-widest focus:outline-none focus:ring-2 transition-colors ${
            error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-lime-200'
          }`}
        />
        {error && <p className="text-xs text-red-500 -mt-2">Incorrect passcode</p>}
        <button
          onClick={submit}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default function SlidesPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  useEffect(() => {
    if (localStorage.getItem('slides_unlocked') === '1') setUnlocked(true)
  }, [])

  const goTo = useCallback((index: number) => {
    if (animating || index < 0 || index >= SLIDES.length) return
    setDirection(index > current ? 'next' : 'prev')
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 200)
  }, [animating, current])

  const prev = useCallback(() => goTo(current - 1), [goTo, current])
  const next = useCallback(() => goTo(current + 1), [goTo, current])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  if (!unlocked) return <PasscodeGate onUnlock={() => setUnlocked(true)} />

  const slide = SLIDES[current]
  const progress = ((current + 1) / SLIDES.length) * 100

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden select-none">
      {/* Progress bar */}
      <div className="h-0.5 bg-gray-200 flex-shrink-0">
        <div
          className="h-full bg-lime-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="h-full transition-opacity duration-200"
          style={{ opacity: animating ? 0 : 1 }}
        >
          {slide.render()}
        </div>
      </div>

      {/* Nav bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white border-t border-gray-200">
        {/* Dot navigation */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-5 h-2 bg-lime-500'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <span className="text-xs text-gray-400 tabular-nums">
          {current + 1} / {SLIDES.length}
        </span>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
