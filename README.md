# Drop of Hope ❤️🩸

A comprehensive, modern web-based blood donation management platform connecting donors, hospitals, and administrators to facilitate and streamline the life-saving process of blood donation.

> Saving lives, one drop at a time.

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features & Functionalities](#-key-features--functionalities)
- [Technology Stack](#️-technology-stack)
- [Authentication Architecture](#-authentication-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#️-database-schema-supabase)
- [Deployment](#-deployment)
- [Contact](#-contact)

---

## 💡 About the Project

**Drop of Hope** was built to solve the communication gap between individuals willing to donate blood and the hospitals or organizations in desperate need of it.

By gamifying the donor experience and providing powerful oversight tools to administrators and medical centers, Drop of Hope encourages repeat donations, ensures that blood drives are well-attended, and maintains highly accurate, real-time inventory tracking for critical patient care.

---

## 🚀 Key Features & Functionalities

### 🩸 For Donors

| Feature | Description |
|---|---|
| **Interactive Dashboard** | Personalized overview showing donation history, points, upcoming appointments, and a *Days Since Last Donation* countdown widget |
| **Find Blood Drives** | Discover nearby donation events with search, city, blood type, and date filters |
| **Book Appointments** | Schedule donation slots with calendar integration |
| **Appointment Management** | View, reschedule, or cancel bookings; generate a **Print Appointment Slip** for any upcoming appointment |
| **Profile Management** | Update personal info, blood type, contact details, eligibility status, and **Emergency Contact** details (name, phone, relation) |
| **Rewards System (Gamification)** | Earn points, unlock badges, climb levels — **Share any badge** via Web Share API or clipboard fallback |
| **Community Feed** | Social feed to share stories, post pictures, like and comment |
| **Donation History Export** | Download full donation history as a CSV file directly from the Profile donations tab |
| **Blood Type Info Page** | Dedicated `/blood-types` page with blood type compatibility chart and donation facts |
| **Donation Tips & FAQs** | `/tips` page with categorized pre/post donation care tips and accordion FAQ |
| **Feedback Form** | Star-rating + comment dialog for past blood drives — appears on completed drives |
| **Forgot Password** | `/forgot-password` page that sends a Supabase password reset email |

---

### 🏥 For Hospitals

| Feature | Description |
|---|---|
| **Hospital Portal** | Dedicated control center with tabs: Inventory, Blood Requests, Appointments, Blood Drives, Analytics |
| **Blood Requests** | Create urgent, high-priority, or routine requisitions for specific blood types |
| **Inventory Management** | Track available blood units in real-time; see per-blood-type unit counts and status badges |
| **Low Stock Alert** | Red alert banner automatically fires when any blood type falls critically low |
| **Blood Inventory Chart** | Analytics tab contains a Recharts PieChart showing inventory distribution by blood type |
| **Drive Management** | View blood drives assigned to the hospital with capacity progress bars |
| **Drive Attendance Report** | Download a CSV attendance report for any specific drive directly from the Drives tab |
| **Request Status Tracker** | 4-step inline stepper per request (Pending → Approved → Processing → Fulfilled) |
| **Print Blood Request** | Opens a formatted print slip for any blood request in a new browser window |
| **Hospital Profile Page** | Public-facing `/hospital/:id` page showing hospital info, contact details, and services |

---

### 👨‍💼 For Administrators

| Feature | Description |
|---|---|
| **Admin Dashboard** | 7-tab system-wide analytics and oversight dashboard |
| **User Management** | View, add, edit, and manage all donors and hospital accounts with full CRUD |
| **Drive & Request Approval** | Review, approve, or reject blood drive requests and hospital blood requisitions |
| **Data Analytics** | Recharts charts: Donors by Blood Type (BarChart), Blood Request Status (PieChart), Drive Capacity vs Registrations (BarChart) |
| **Monthly Statistics** | Donation count this month shown in the overview stats grid |
| **Top Donors Leaderboard** | Ranked list of top 20 donors sorted by points — shows name, blood type, pts & level badge |
| **Export Full Report** | 4-section comprehensive CSV: Platform Summary, Top Donors, Blood Drives, Blood Requests |
| **Export User List** | Download all donor data as a CSV from the Donors tab |
| **System Activity Log** | Recent activity table populated live from DB appointments and blood requests |
| **Announcement Banner** | Create and activate a prominent banner visible sitewide; managed via Supabase `announcements` table |
| **Blood Drive Calendar** | Monthly calendar grid in the Drives tab — highlights days with scheduled drives, hover shows drive names |

---

### 🤖 General & UI/UX Features

| Feature | Description |
|---|---|
| **AI Chatbot Assistant** | Built-in floating chatbot with keyword matching, quick-action suggestion buttons on every page |
| **Contact Us Form** | Contact form wired to Supabase `contacts` table — messages stored and accessible to admins |
| **Dark Mode Toggle** | Navbar toggle button switches between light and dark themes with localStorage persistence |
| **Responsive Design** | Mobile-first TailwindCSS layouts with `md:` and `lg:` breakpoints throughout |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Tooling:** Vite (lightning-fast dev server and bundler)
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui & Radix UI
- **Routing:** React Router DOM
- **State Management:** TanStack Query (React Query)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Date Utilities:** date-fns

### Backend & Auth
- **BaaS:** Supabase (PostgreSQL database & auto-generated REST API)
- **Donor Authentication:** Clerk (social logins, session management)
- **Admin/Hospital Auth:** Direct Supabase authentication
- **API Framing:** Express (Node.js)

---

## 🔐 Authentication Architecture

The platform uses a **Hybrid Authentication** model:

1. **Clerk Authentication (Donors)**
   - Handles donor sign-ups, sign-ins, and session management
   - Social login support (Google, GitHub, etc.)
   - Auto-syncs authenticated user data to the Supabase `donors` table

2. **Direct Supabase Auth (Admins & Hospitals)**
   - Credentials stored in `admins` and `hospitals` PostgreSQL tables
   - Verified directly without external dependencies for strict internal control

---

## 📁 Project Structure

```text
drop-of-hope/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components (shadcn/ui, Chatbot, Nav, AnnouncementBanner)
│   ├── contexts/           # Global State (HybridAuthContext)
│   ├── hooks/              # Custom React hooks (use-toast, etc.)
│   ├── lib/                # Database services (db-services.ts) & Supabase client
│   ├── pages/              # Application views
│   │   ├── AdminDashboard.tsx      # 7-tab admin panel with leaderboard + full report export
│   │   ├── HospitalPortal.tsx      # Hospital management center
│   │   ├── Profile.tsx             # Donor profile + emergency contacts + donation CSV export
│   │   ├── DonorDashboard.tsx      # Donor home with days-since-donation widget
│   │   ├── BloodDrives.tsx         # Drive discovery + feedback form
│   │   ├── BookAppointment.tsx     # Drive slot booking
│   │   ├── MyAppointments.tsx      # Booking management + print slip
│   │   ├── Rewards.tsx             # Gamification + badge sharing
│   │   ├── Community.tsx           # Social feed
│   │   ├── BloodTypes.tsx          # Blood type compatibility info page
│   │   ├── DonationTips.tsx        # Tips & FAQs page
│   │   ├── HospitalProfile.tsx     # Public hospital profile
│   │   ├── ForgotPassword.tsx      # Password reset page
│   │   └── Contact.tsx             # Contact form → Supabase
│   └── App.tsx             # Root component and routing
├── server/                 # Backend Node/Express scaffolding
│   ├── index.ts            # Server entry point
│   └── routes/             # API routing configurations
├── shared/                 # Shared TypeScript interfaces
├── FEATURES.csv            # Full feature tracking spreadsheet (51 features)
└── public/                 # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- `npm` or `pnpm` package manager

### Environment Variables

Create a `.env` file at the project root:

```env
# Clerk Authentication (get from clerk.com dashboard)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase Configuration (get from supabase.com dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Installation & Execution

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jainam116/drop-of-hope.git
   cd drop-of-hope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` or `http://localhost:8080`.

---

## 🗄️ Database Schema (Supabase)

The PostgreSQL database relies on these core tables:

| Table | Purpose |
|---|---|
| `donors` | Donor profiles synced from Clerk (id, name, blood_type, points, level, is_verified, city, email) |
| `admins` / `hospitals` | Internal secure access credentials |
| `drives` | Blood drive events (location, times, capacity) |
| `appointments` | Links donors to specific drives |
| `donations` | Verified records of completed donations |
| `blood_requests` | Hospital requisitions for blood types |
| `blood_inventory` | Real-time hospital blood stock per type |
| `rewards` | Gamification points and badge thresholds |
| `community_posts` / `community_comments` / `community_likes` | Social feed relational tables |
| `announcements` | Sitewide announcement banners managed by admins |
| `contacts` | Messages submitted via the Contact Us form |

---

## 🌐 Deployment

The workspace is configured for deployment to edge environments like Netlify via `netlify.toml`.

**Build for production:**
```bash
npm run build
```

---

## 🤝 Contact

Have questions or want to collaborate?

- **Email**: kharajaynam@gmail.com
- **Phone**: +91 7779069774
- **Repository**: [Drop of Hope GitHub](https://github.com/Jainam116/drop-of-hope)

---
