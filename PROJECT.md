# Drop of Hope - Blood Donation Platform

A comprehensive web-based blood donation management platform connecting donors, hospitals, and administrators.

---

## 📋 Project Overview

**Drop of Hope** is a modern blood donation platform designed to:
- Connect blood donors with nearby donation drives
- Enable hospitals to manage blood requests and inventory
- Provide administrators with oversight and management capabilities
- Gamify the donation experience with rewards and community features

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI component library |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |
| **Vite** | 7.1.2 | Build tool & dev server |
| **TailwindCSS** | 3.4.17 | Utility-first CSS framework |
| **Radix UI** | Various | Accessible UI primitives |
| **React Router DOM** | 6.30.1 | Client-side routing |
| **TanStack Query** | 5.84.2 | Server state management |
| **Recharts** | 2.12.7 | Data visualization (charts) |
| **Lucide React** | 0.539.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Express** | 5.1.0 | Node.js web framework |
| **Supabase** | 2.56.0 | Database & backend services |
| **Clerk** | 5.43.1 | Authentication (donors) |





---

## 📁 Project Structure

```
drop-of-hope/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components (49 files)
│   │   ├── Navbar.tsx      # Navigation header
│   │   ├── ChatbotWidget.tsx   # AI chatbot assistant
│   │   ├── ProtectedRoute.tsx  # Route guards
│   │   └── NotificationCenter.tsx
│   ├── contexts/           # React contexts
│   │   └── HybridAuthContext.tsx  # Authentication state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── supabase.ts     # Database client & types
│   │   ├── appointments.ts # Appointment helpers
│   │   ├── seedData.ts     # Demo data generation
│   │   └── utils.ts        # General utilities
│   ├── pages/              # 25 page components
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── global.css          # Global styles
├── server/                 # Backend Express server
│   ├── index.ts            # Server setup
│   ├── node-build.ts       # Production build
│   └── routes/             # API routes
├── shared/                 # Shared types between client/server
│   └── api.ts              # API response types
├── public/                 # Static assets
│   ├── favicon.ico         # Site icon
│   └── robots.txt          # SEO configuration
└── Configuration files...
```

---

## 🔐 Authentication System

### Hybrid Authentication Architecture

The platform uses a **dual authentication system**:

1. **Clerk Authentication** (Donors)
   - Modern authentication provider
   - Handles donor sign-up/sign-in
   - Profile picture and social login support
   - Automatically syncs user data to Supabase `donors` table

2. **Direct Supabase Authentication** (Admin & Hospital)
   - Credentials stored in `admins` and `hospitals` tables
   - Session persisted in localStorage
   - No external auth provider dependency

### User Roles
| Role | Dashboard | Auth Method |
|------|-----------|-------------|
| **Donor** | `/dashboard` | Clerk |
| **Admin** | `/admin` | Supabase direct |
| **Hospital** | `/hospital-portal` | Supabase direct |

---

## 📱 Features by Module

### 🩸 Donor Features
- **Dashboard** - Overview of donation history, points, upcoming appointments
- **Find Blood Drives** - Discover nearby donation events with location filtering
- **Book Appointments** - Schedule donation slots with calendar integration
- **My Appointments** - View, reschedule, or cancel bookings
- **Profile Management** - Update personal info, blood type, contact details
- **Rewards System** - Earn points, badges, and climb levels
- **Community** - Social features, posts, likes, comments

### 🏥 Hospital Features
- **Hospital Portal** - Manage blood requests and inventory
- **Blood Requests** - Create urgent/routine blood type requests
- **Inventory Management** - Track available blood units
- **Drive Management** - Organize and publish blood drive events

### 👨‍💼 Admin Features
- **Admin Dashboard** - System-wide analytics and oversight
- **User Management** - View donors, hospitals, manage accounts
- **Drive Approval** - Review and approve blood drive requests
- **Reports & Analytics** - Data visualization with charts

### 🤖 AI Chatbot
- Built-in chatbot widget for user assistance
- Answers common questions about eligibility, process, rewards
- Provides navigation suggestions
- Quick action buttons for common tasks

---

## 🗄️ Database Schema (Supabase)

### Core Tables
| Table | Description |
|-------|-------------|
| `donors` | Donor profiles linked to Clerk users |
| `admins` | Admin accounts with credentials |
| `hospitals` | Hospital profiles and credentials |
| `drives` | Blood donation drive events |
| `appointments` | Scheduled donation appointments |
| `donations` | Completed donation records |
| `blood_requests` | Hospital blood requisitions |
| `blood_inventory` | Hospital blood stock |
| `rewards` | Donor badges and achievements |
| `community_posts` | Social feed content |
| `community_comments` | Post comments |
| `community_likes` | Post likes |
| `notifications` | User notifications |

### Blood Types Supported
`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

---

## 🎨 Design System

### Color Palette (Tailwind)
```
hope-red   - Primary brand color (blood/donation theme)
hope-pink  - Light accent color
hope-coral - Secondary accent
```

### UI Components (shadcn/ui + Radix)
- Accordion, Alert Dialog, Avatar, Badge
- Button, Card, Checkbox, Dialog
- Dropdown Menu, Form, Input, Label
- Navigation Menu, Popover, Progress
- Radio Group, Select, Slider, Switch
- Tabs, Toast, Tooltip, and more...

### Animations
- TailwindCSS Animate for micro-interactions
- CSS marquee animations for content display

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Environment Variables
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server Config
PING_MESSAGE="ping pong"
```

### Installation & Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Format code
pnpm format.fix
```

---

## 📄 Pages Overview

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/` | Index | Landing page with hero, stats, features | Public |
| `/login` | Login | Role selection for login | Public |
| `/register` | Register | Role selection for signup | Public |
| `/donor/login` | DonorLogin | Clerk-powered donor login | Public |
| `/donor/register` | DonorRegister | Clerk-powered donor signup | Public |
| `/admin/login` | AdminLogin | Admin credentials login | Public |
| `/hospital/login` | HospitalLogin | Hospital credentials login | Public |
| `/dashboard` | DonorDashboard | Donor home | Donor |
| `/drives` | BloodDrives | Find donation drives | Donor |
| `/book-appointment/:id` | BookAppointment | Schedule donation | Donor |
| `/appointments` | MyAppointments | Manage bookings | Donor |
| `/profile` | Profile | Edit donor profile | Donor |
| `/rewards` | Rewards | Points and badges | Donor |
| `/community` | Community | Social feed | Donor |
| `/admin` | AdminDashboard | Admin control panel | Admin |
| `/hospital-portal` | HospitalPortal | Hospital management | Hospital |
| `/request` | RequestBlood | Blood request form | Authenticated |
| `/about` | About | Company information | Public |
| `/contact` | Contact | Contact form | Public |
| `/terms` | Terms | Terms of service | Public |
| `/privacy` | Privacy | Privacy policy | Public |
| `/clerk-setup` | ClerkSetup | Clerk configuration help | Public |

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration with Express plugin |
| `vite.config.server.ts` | Server-side build config |
| `tailwind.config.ts` | TailwindCSS theme and plugins |
| `tsconfig.json` | TypeScript compiler options |
| `postcss.config.js` | PostCSS plugins |
| `components.json` | shadcn/ui configuration |
| `netlify.toml` | Netlify deployment settings |
| `.prettierrc` | Code formatting rules |

---

## 🌐 Deployment

### Netlify
- Pre-configured with `netlify.toml`
- Automatic builds from main branch
- Serverless function support

### Production Build
```bash
pnpm build          # Builds both client and server
pnpm build:client   # Client SPA only (dist/spa)
pnpm build:server   # Server bundle only (dist/server)
```

---

## 📊 Key Metrics Tracked

- **Lives Saved** - Estimated impact from donations
- **Active Donors** - Registered and verified donors
- **Blood Drives** - Total organized events
- **Partner Hospitals** - Verified hospital partners
- **Donor Points** - Gamification engagement
- **Blood Inventory** - Real-time stock levels

---

## 🤝 Contact

- **Phone**: 1-800-DONATE
- **Email**: help@dropofhope.org
- **Website**: Drop of Hope Platform

---

*© 2024 Drop of Hope. All rights reserved. Saving lives, one drop at a time.*
