# Plums.ag - AI Infrastructure for High-Value Supply Chains

## 🎯 Strategic Vision

Plums.ag is building the AI nervous system for high-value supply chains (produce, seafood, floral, nuts, CPG ingredients). We're positioning beyond "harvest-centric" branding into an expansive, future-proof identity as an AI infrastructure company powering supplier-buyer communication and data flow.

## 🚀 Why This Is Brilliant

Instead of building a two-sided marketplace from scratch, we're building the supply side infrastructure first, then adding the marketplace layer. It's **"Shopify for produce suppliers, then Alibaba for produce buyers."**

## 📋 Product Vision

### Phase 1: Plums.ag (Supplier SaaS) - Revenue-Generating
- **Price Sheet Generator**: "HubSpot for price sheets" - create, send, track engagement
- **CropChat Integration**: AI handles customer inquiries using all supplier data
- **Progressive Feature Unlocking**: More data = more features
- **Revenue Model**: $50-200/month SaaS subscriptions from suppliers

### Phase 2: Buyer Marketplace
- Single AI chat interface that queries ALL supplier data in our database
- Buyers get instant access to entire supplier network
- **Revenue**: Transaction fees + premium listings

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, App Router
- **Backend**: Fastify with TypeScript (coming soon)
- **Database**: MongoDB (flexible schema for evolving supplier data)
- **Auth**: Supabase Auth with Magic Links (coming soon)
- **AI**: Single Claude integration for unified personality
- **Deployment**: Vercel + Railway (coming soon)

## 🏗 Key Architecture Decisions

- **One unified database** (not chatbot federation)
- **One AI personality** (consistent experience)
- **Shared data model** (price sheets feed AI knowledge)
- **No traditional search** (Claude handles intelligent matching)
- **Supplier opt-in** for marketplace participation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plums
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Supplier dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components (coming soon)
├── lib/                   # Utility functions
│   └── utils.ts          # Common utilities
└── types/                # TypeScript type definitions
    └── index.ts          # Database schemas
```

## 🗄 Database Schema

The project uses a unified schema supporting both suppliers and buyers:

- **Users**: Authentication and profile management
- **Suppliers**: Supplier profiles and capabilities
- **Price Sheets**: Document management and tracking
- **Price Sheet Products**: Detailed product information
- **Commodities**: Product categorization and metadata

See `src/types/index.ts` for complete schema definitions.

## 🎨 Design System

- **Colors**: Purple primary (#7C3AED), with supporting colors for different features
- **Icons**: Heroicons for consistency
- **Typography**: Tailwind CSS typography scale
- **Components**: Custom components built with Tailwind CSS

## 🔮 Development Roadmap

### Current (Phase 1 Foundation)
- ✅ Landing page with modern design
- ✅ Basic dashboard structure
- ✅ TypeScript types and schemas
- 🔄 Price sheet generator interface
- 🔄 CropChat AI integration
- 🔄 User authentication

### Next Steps
- Backend API with Fastify
- MongoDB integration
- Supabase authentication
- AI integration with Claude
- Progressive feature unlocking system

### Future (Phase 2)
- Buyer marketplace interface
- Unified AI chat system
- Transaction processing
- Advanced analytics

## 🤝 Contributing

This is a local development project. All development is done locally with placeholder APIs and authentication.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Plums.ag** - Building the AI infrastructure for high-value supply chains.
