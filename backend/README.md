# MarketHunt Backend API

A robust Fastify-based API server for the MarketHunt agricultural supply chain platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Supabase account for authentication

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/markethunt
   
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & Supabase configuration
│   ├── models/          # TypeScript interfaces & types
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication & validation
│   ├── services/        # Business logic services
│   ├── utils/           # Helper functions
│   └── app.ts           # Main application entry
├── dist/                # Compiled JavaScript (production)
└── package.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link login
- `POST /api/auth/callback` - Handle auth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings/:section` - Update settings section
- `GET /api/users/stats` - Get dashboard statistics
- `DELETE /api/users/account` - Delete user account

### Growing Regions
- `GET /api/regions` - List user's growing regions
- `POST /api/regions` - Create new growing region
- `GET /api/regions/:id` - Get single growing region
- `PUT /api/regions/:id` - Update growing region
- `DELETE /api/regions/:id` - Delete growing region

### Crop Management
- `GET /api/crops` - List user's crops
- `POST /api/crops` - Create new crop
- `GET /api/crops/:id` - Get single crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop

### Certifications
- `GET /api/certifications` - List user's certifications
- `POST /api/certifications` - Create new certification
- `PUT /api/certifications/:id` - Update certification
- `DELETE /api/certifications/:id` - Delete certification

### Custom Packaging
- `GET /api/packaging` - List user's custom packaging
- `POST /api/packaging` - Create new packaging type
- `PUT /api/packaging/:id` - Update packaging type
- `DELETE /api/packaging/:id` - Delete packaging type

### Price Sheets
- `GET /api/price-sheets` - List user's price sheets
- `POST /api/price-sheets` - Create new price sheet with products
- `GET /api/price-sheets/:id` - Get price sheet with products
- `PUT /api/price-sheets/:id` - Update price sheet
- `DELETE /api/price-sheets/:id` - Delete price sheet and products
- `GET /api/price-sheets/:id/products` - Get products for price sheet

### Contacts
- `GET /api/contacts` - List user's contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get single contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/search` - Search contacts by name/email/company

### Chatbot (Premium Feature)
- `GET /api/chatbot/config` - Get chatbot configuration
- `PUT /api/chatbot/config` - Update chatbot configuration
- `POST /api/chatbot/populate-knowledge` - Auto-populate farm knowledge
- `POST /api/chatbot/deploy` - Deploy chatbot (Premium)
- `POST /api/chatbot/test` - Test chatbot responses

## 🔐 Authentication

All API endpoints (except auth routes) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Data Models

### Core Collections
- **users** - User profiles and settings
- **growingRegions** - Farm locations and details
- **cropManagement** - Commodities and variations
- **certifications** - Organic/sustainability certifications
- **customPackaging** - User-defined packaging types
- **priceSheets** - Price sheet metadata
- **priceSheetProducts** - Individual product entries
- **contacts** - Customer relationship management
- **chatbotConfig** - AI chatbot configuration
- **scrapedData** - Website scraping results (future)

### Subscription Tiers
- **Basic** - Core features
- **Premium** - Advanced features (chatbot, analytics)
- **Enterprise** - Full feature set with custom integrations

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when implemented)

### Environment Variables
See `.env.example` for all required environment variables.

### Database Setup
The application will automatically connect to MongoDB on startup. Ensure your MongoDB instance is running and accessible via the `MONGODB_URI`.

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

## 📝 API Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": { ... }
}
```

## 🔧 Health Check

Check server status at: `GET /health`

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

## 📞 Support

For questions or issues, please refer to the main MarketHunt repository or contact the development team.
