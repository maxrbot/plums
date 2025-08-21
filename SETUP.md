# MarketHunt Demo Setup Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017
- Git

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Backend Environment

Create `backend/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/markethunt

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Simple Auth (temporary - will replace with Supabase later)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 3. Start MongoDB

Make sure MongoDB is running locally:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### 5. Start the Frontend

In a new terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🧪 Testing the Demo

### 1. Visit the Landing Page
- Go to `http://localhost:3000`
- Click the "Login" button in the header

### 2. Create a Test Account
- In the login modal, click "Create one" to switch to registration
- Fill in:
  - Company Name: "Demo Farm"
  - Your Name: "John Doe"
  - Email: "demo@example.com"
  - Password: "password123"
- Click "Create Account"

### 3. Explore the Dashboard
- After registration, you'll be redirected to `/dashboard`
- All the existing functionality should work with your new user account
- Data will be stored in your local MongoDB

## 🔧 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client-side)

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get dashboard statistics

### Data Management
- `GET /api/regions` - Get growing regions
- `POST /api/regions` - Create growing region
- `GET /api/crops` - Get crop management
- `POST /api/crops` - Create crop
- `GET /api/certifications` - Get certifications
- `POST /api/certifications` - Create certification
- `GET /api/contacts` - Get contacts
- `POST /api/contacts` - Create contact
- `GET /api/price-sheets` - Get price sheets
- `POST /api/price-sheets` - Create price sheet

## 🗄️ Database Structure

Your local MongoDB will have these collections:
- `users` - User accounts and settings
- `growingRegions` - Farm locations
- `cropManagement` - Commodities and variations
- `certifications` - Organic/sustainability certs
- `customPackaging` - User-defined packaging
- `priceSheets` - Price sheet metadata
- `priceSheetProducts` - Individual product entries
- `contacts` - Customer data

## 🔄 Next Steps

Once this is working, we can:
1. **Connect Frontend to Backend** - Replace mock data with real API calls
2. **Add Authentication Guards** - Protect dashboard routes
3. **Implement Data Persistence** - Save form data to MongoDB
4. **Add Error Handling** - Better UX for API failures
5. **Deploy to Production** - Railway + MongoDB Atlas

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` should connect
- Verify `.env` file exists in `backend/` directory
- Check port 3001 isn't in use: `lsof -i :3001`

### Frontend login fails
- Check backend is running on port 3001
- Open browser dev tools to see network errors
- Verify CORS is working (should see API calls in Network tab)

### Database connection issues
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check connection string in `.env` matches your MongoDB setup
- Try connecting manually: `mongosh mongodb://localhost:27017/markethunt`

## 📞 Ready for Production?

When you're ready to deploy:
1. **MongoDB Atlas** - Cloud database
2. **Railway** - Backend hosting
3. **Vercel** - Frontend hosting
4. **Supabase** - Replace simple auth with magic links

This setup gives you a fully functional demo environment! 🎉
