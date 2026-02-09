# 🚗 Car Workshop Management System

A complete, modern car workshop management system with AI-powered features.

## 🌟 Features

### Core Features
- ✅ Customer Management (contact info, history, vehicles)
- ✅ Vehicle Database (make, model, VIN, service history)
- ✅ Work Order Management (job tracking, status updates)
- ✅ Appointment Scheduling (calendar, mechanic assignment)
- ✅ Parts Inventory (stock tracking, reorder alerts)
- ✅ Invoicing & Payments (billing, payment tracking)
- ✅ Service History (complete maintenance records)
- ✅ Employee Management (mechanics, roles, schedules)

### AI-Powered Features
- 🤖 24/7 AI Chatbot (customer support & booking)
- 📸 Visual Damage Assessment (upload photo → get estimate)
- 🗣️ Voice-to-Text Notes (hands-free for mechanics)
- 📧 Smart Email Automation (personalized reminders)
- 📊 Predictive Maintenance (alert customers proactively)
- 💬 Review Response Generator (auto-respond to reviews)

### Reports & Analytics
- 📈 Daily/Monthly revenue reports
- 👥 Customer analytics
- 🔧 Mechanic productivity tracking
- 📦 Inventory reports
- 💰 Profit margins by service

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Caching (optional)

### AI Services
- **OpenAI API** - GPT-4, Whisper, DALL-E
- **Anthropic Claude** - Alternative AI model

### Communication
- **Twilio** - SMS & WhatsApp
- **SendGrid** - Email service

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Git** ([Download](https://git-scm.com/))

### Option 1: Docker (Easiest)

```bash
# 1. Clone the repository
git clone https://github.com/yourname/car-workshop.git
cd car-workshop

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env and add your API keys
nano .env  # or use any text editor

# 4. Start everything with Docker
docker-compose up

# Access the app:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Database Admin: http://localhost:5050
```

### Option 2: Manual Setup

#### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourname/car-workshop.git
cd car-workshop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Set Up Database

```bash
# Start PostgreSQL (if using Docker)
docker run --name workshop-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=car_workshop \
  -p 5432:5432 \
  -d postgres:15

# Or install PostgreSQL locally and create database
psql -U postgres
CREATE DATABASE car_workshop;
\q
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# Required:
# - DATABASE_URL
# - JWT_SECRET
# - NEXTAUTH_SECRET

# Optional (for AI features):
# - OPENAI_API_KEY
# - TWILIO_ACCOUNT_SID
# - SENDGRID_API_KEY
```

#### 4. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npm run seed
```

#### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

#### 6. Open Your Browser

Visit: **http://localhost:3000**

Default login (if seeded):
- Email: `admin@workshop.com`
- Password: `admin123`

---

## 📁 Project Structure

```
car-workshop/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth, validation, etc.
│   │   ├── models/            # Data models
│   │   └── utils/             # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # DB migrations
│   │   └── seed.ts            # Sample data
│   ├── tests/                 # Unit & integration tests
│   └── package.json
│
├── frontend/                   # Next.js React app
│   ├── app/                   # App router (Next.js 14)
│   │   ├── (auth)/           # Auth pages
│   │   ├── dashboard/         # Main app
│   │   ├── customers/         # Customer management
│   │   ├── vehicles/          # Vehicle database
│   │   ├── work-orders/       # Job tracking
│   │   ├── appointments/      # Scheduling
│   │   ├── inventory/         # Parts management
│   │   └── reports/           # Analytics
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── forms/            # Form components
│   │   ├── layouts/          # Page layouts
│   │   └── charts/           # Data visualization
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   ├── auth.ts           # Auth utilities
│   │   └── utils.ts          # Helper functions
│   └── package.json
│
├── shared/                     # Shared types & constants
│   └── types/
│
├── docker-compose.yml          # Docker setup
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🔑 API Keys Setup

### Required Services (Free Tiers Available)

#### 1. OpenAI (for AI features)
1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Free Tier**: $5 credit for new accounts

#### 2. Twilio (for SMS/WhatsApp)
1. Go to https://www.twilio.com/
2. Sign up for free trial
3. Get Account SID and Auth Token
4. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   ```

**Free Tier**: $15 trial credit

#### 3. SendGrid (for emails)
1. Go to https://sendgrid.com/
2. Sign up for free account
3. Create API key
4. Add to `.env`: `SENDGRID_API_KEY=SG...`

**Free Tier**: 100 emails/day forever

---

## 📚 Common Commands

### Development

```bash
# Backend
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run test             # Run tests

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma migrate reset # Reset database
npm run seed             # Seed sample data

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
```

### Docker

```bash
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose restart   # Restart services
```

---

## 🌐 Deployment

### Option 1: Vercel + Railway (Easiest)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts, set environment variables in Vercel dashboard
```

#### Backend + Database (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# Add PostgreSQL
railway add --postgres
```

**Cost**: $0-20/month (generous free tiers)

### Option 2: Traditional VPS (DigitalOcean, Hetzner)

```bash
# SSH into your server
ssh user@your-server-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx

# Clone and setup project
git clone your-repo
cd car-workshop

# Setup with PM2 (process manager)
npm install -g pm2

# Backend
cd backend
npm install
npm run build
pm2 start dist/server.js --name workshop-api

# Frontend
cd frontend
npm install
npm run build
pm2 start npm --name workshop-web -- start

# Setup nginx as reverse proxy
sudo nano /etc/nginx/sites-available/workshop
```

**Cost**: $5-20/month

### Option 3: Serverless (Vercel Functions)

Use Vercel for both frontend and API routes (Next.js API routes instead of separate Express backend).

**Cost**: $0-20/month

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Frontend tests
cd frontend
npm test
```

---

## 📊 Database Schema

View the complete database schema:
- See `database/schema.prisma` for Prisma schema
- See `docs/DATABASE_SCHEMA.md` for detailed documentation
- Open Prisma Studio: `npx prisma studio` (visual database browser)

Key tables:
- `customers` - Customer information
- `vehicles` - Vehicle database
- `work_orders` - Job tracking
- `appointments` - Booking system
- `parts` - Inventory management
- `invoices` - Billing
- `employees` - Staff management

---

## 🎨 UI Components

We use **Radix UI** + **Tailwind CSS** for a modern, accessible UI:

```tsx
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'

// Fully typed, accessible, customizable
```

Component library includes:
- Buttons, Inputs, Selects
- Dialogs, Dropdowns, Tooltips
- Tables, Forms, Cards
- Charts (via Recharts)
- Date pickers, File uploads

---

## 🔒 Security

### Implemented Security Features
- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ HTTPS ready
- ✅ Environment variable protection

### Security Checklist for Production
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment-specific configs

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 💬 Support

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/yourname/car-workshop/issues
- **Email**: support@yourworkshop.com

---

## 🗺️ Roadmap

### Phase 1 (MVP) - ✅ Complete
- Customer & vehicle management
- Work order tracking
- Basic invoicing
- Appointment scheduling

### Phase 2 (Current)
- AI chatbot integration
- SMS/Email automation
- Advanced reporting
- Mobile app (React Native)

### Phase 3 (Planned)
- Multi-location support
- Online payment processing
- Customer portal
- Advanced analytics dashboard
- Integration with accounting software
- Parts ordering from suppliers

---

## 🏆 Credits

Built with ❤️ for car workshops everywhere.

Technologies used:
- Next.js, React, TypeScript
- Node.js, Express, Prisma
- PostgreSQL, Redis
- OpenAI, Twilio, SendGrid
- And many more amazing open-source projects!

---

## 📞 Contact

**Your Workshop Name**
- Website: https://yourworkshop.com
- Email: contact@yourworkshop.com
- Phone: (555) 123-4567

---

**⭐ If this project helps you, please give it a star on GitHub!**
