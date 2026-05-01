# Drop of Hope ❤️🩸

A comprehensive, modern web-based blood donation management platform connecting donors, hospitals, and administrators to facilitate and streamline the life-saving process of blood donation.

> Saving lives, one drop at a time.

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features & Functionalities](#-key-features--functionalities)
- [Technology Stack](#️-technology-stack)
- [Code Quality & Type Safety](#-code-quality--type-safety)
- [Authentication Architecture](#-authentication-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#️-database-schema-supabase)
- [Error Handling](#️-error-handling)
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
| :--- | :--- |
| **Interactive Dashboard** | Personalized overview showing donation history, points, upcoming appointments, and a *Days Since Last Donation* countdown widget |
| **Find Blood Drives** | Discover nearby donation events with search, city, blood type, and date filters |
| **Book Appointments** | Schedule donation slots with calendar integration |
| **Appointment Management** | View, reschedule, or cancel bookings; generate a **Print Appointment Slip** for any upcoming appointment |
| **Profile Management** | Update personal info, blood type, contact details, eligibility status, **Emergency Contact** details (name, phone, relation), and view donation CSV export |
| **Rewards System (Gamification)** | Earn points, unlock badges, climb levels — **Share any badge** via Web Share API or clipboard fallback |
| **Community Feed** | Social feed to share stories, post pictures, like and comment |
| **Donation History Export** | Download full donation history as a CSV file directly from the Profile donations tab |
| **Blood Type Info Page** | Dedicated `/blood-types` page with blood type compatibility chart and donation facts |
| **Donation Tips & FAQs** | `/tips` page with categorized pre/post donation care tips and accordion FAQ |
| **Feedback Form** | Star-rating + comment dialog for past blood drives — appears on completed drives |
| **Forgot Password** | `/forgot-password` page that sends a Supabase password reset email |
| **Input Validation** | Form validation with real-time error feedback and user-friendly error messages |

---

### 🏥 For Hospitals

| Feature | Description |
| :--- | :--- |
| **Hospital Portal** | Dedicated control center with tabs: Inventory, Blood Requests, Appointments, Blood Drives, Analytics, Notifications |
| **Blood Requests** | Create urgent, high-priority, or routine requisitions for specific blood types |
| **Inventory Management** | Track available blood units in real-time; see per-blood-type unit counts and status badges |
| **Low Stock Alert** | Red alert banner automatically fires when any blood type falls critically low |
| **Blood Inventory Chart** | Analytics tab contains a Recharts PieChart showing inventory distribution by blood type |
| **Drive Management** | View blood drives assigned to the hospital with capacity progress bars |
| **Drive Attendance Report** | Download a CSV attendance report for any specific drive directly from the Drives tab |
| **Request Status Tracker** | 4-step inline stepper per request (Pending → Approved → Processing → Fulfilled) |
| **Print Blood Request** | Opens a formatted print slip for any blood request in a new browser window |
| **Hospital Profile Page** | Public-facing `/hospital/:id` page showing hospital info, contact details, and services |
| **Urgent Notifications** | Alert donors about urgent blood needs with targeted messaging |
| **Input Validation** | Credential validation with email format checking and password strength requirements |

---

### 👨‍💼 For Administrators

| Feature | Description |
| :--- | :--- |
| **Admin Dashboard** | 8-tab oversight dashboard with dynamic, real-time analytics fetching |
| **User Management** | View, add, edit, and manage all donors and hospital accounts with full CRUD |
| **Drive & Request Approval** | Review, approve, or reject blood drive requests and hospital blood requisitions |
| **Dynamic Analytics** | Real-time Recharts: Donors by Blood Type (Full Distribution), Blood Request Status (PieChart), Active Drive Capacity vs Registrations (Filtered BarChart) |
| **Real-time Statistics** | Accurate, database-driven metrics: Total Donors, Total Donations, Active Drives, and Lives Impacted (calculated as Donations × 3) |
| **Top Donors Leaderboard** | Ranked list of top 20 donors sorted by points — shows name, blood type, pts & level badge |
| **Export Full Report** | 4-section comprehensive CSV: Platform Summary, Top Donors, Blood Drives, Blood Requests |
| **Export User List** | Download all donor data as a CSV from the Donors tab |
| **System Activity Log** | Recent activity table populated live from DB appointments and blood requests |
| **Announcement Banner** | Create and activate a prominent banner visible sitewide; managed via Supabase `announcements` table |
| **Blood Drive Calendar** | Monthly calendar grid in the Drives tab — highlights days with scheduled drives, hover shows drive names |
| **Broadcast Notifications** | Send notifications to all donors or filtered by blood type with customizable priority |

---

### 🤖 General & UI/UX Features

| Feature | Description |
| :--- | :--- |
| **AI Chatbot Assistant** | Built-in floating chatbot with keyword matching, quick-action suggestion buttons on every page |
| **Notification Center** | Dedicated notification bell icon with notification dropdown, mark as read/delete functionality |
| **Contact Us Form** | Contact form wired to Supabase `contacts` table — messages stored and accessible to admins |
| **Dark Mode Toggle** | Navbar toggle button switches between light and dark themes with localStorage persistence |
| **Responsive Design** | Mobile-first TailwindCSS layouts with `md:` and `lg:` breakpoints throughout |
| **Global Error Boundary** | Catches unhandled React component errors and displays user-friendly fallback UI |
| **Accessibility Optimizations** | High-contrast chart tooltips and grid visibility tuned specifically for dark mode readability |
| **Standardized Error Handling** | Centralized error handling utility with consistent logging and user notifications |

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 18
- **Language:** TypeScript (with strict mode enabled)
- **Tooling:** Vite (lightning-fast dev server and bundler)
- **Styling:** TailwindCSS with dark mode support
- **UI Components:** shadcn/ui & Radix UI
- **Routing:** React Router DOM
- **State Management:** TanStack Query (React Query)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Date Utilities:** date-fns
- **Error Handling:** Centralized error handler utility + Global Error Boundary

### Backend & Auth

- **BaaS:** Supabase (PostgreSQL database & auto-generated REST API)
- **Donor Authentication:** Clerk (social logins, session management)
- **Admin/Hospital Auth:** Direct Supabase authentication with input validation
- **API Framing:** Express (Node.js)
- **Notifications:** Real-time notification system with Supabase

---

## 🔐 Code Quality & Type Safety

### TypeScript Strict Mode

- **Strict mode enabled** for enhanced type safety
- **All type errors resolved** - zero implicit any types
- **Comprehensive type annotations** throughout the codebase
- **Runtime type validation** for critical data structures

### Error Handling

- **Global Error Boundary:** Catches React component errors and prevents white-screen crashes
- **Centralized Error Handler:** Standardized error logging and user notifications
- **Input Validation:** Comprehensive validation for:
  - Admin/Hospital login credentials (email format, password strength)
  - Form inputs with real-time feedback
  - Database operations with null checks
- **Proper Error Responses:** All server errors returned to client with meaningful messages

### Code Organization

- **Hybrid Authentication Context:** Manages Clerk (donors) and direct auth (admin/hospital) seamlessly
- **Modular Component Structure:** Reusable UI components with proper separation of concerns
- **Utility Functions:** Centralized validation, error handling, and database services
- **Performance Optimizations:** Pagination on queries, race condition prevention, dependency optimization

---

## 🔐 Authentication Architecture

The platform uses a **Hybrid Authentication** model:

1. **Clerk Authentication (Donors)**
   - Handles donor sign-ups, sign-ins, and session management
   - Social login support (Google, GitHub, etc.)
   - Auto-syncs authenticated user data to the Supabase `donors` table
   - Session management with automatic refresh

2. **Direct Supabase Auth (Admins & Hospitals)**
   - Credentials stored in `admins` and `hospitals` PostgreSQL tables
   - Email format and password strength validation
   - Verified directly without external dependencies for strict internal control
   - Profile persisted in localStorage for session management
   - Password reset via email link support

---

## 📁 Project Structure

```text
drop-of-hope/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── ErrorBoundary.tsx       # Global error boundary component
│   │   ├── Navbar.tsx              # Navigation with dark mode toggle
│   │   ├── ChatbotWidget.tsx       # AI chatbot assistant
│   │   ├── NotificationCenter.tsx  # Notification dropdown
│   │   ├── AnnouncementBanner.tsx  # Sitewide announcements
│   │   └── ui/                     # shadcn/ui components (chart, button, card, etc.)
│   ├── contexts/           # Global State
│   │   └── HybridAuthContext.tsx   # Hybrid auth context (Clerk + Supabase)
│   ├── hooks/              # Custom React hooks
│   │   └── use-toast.ts            # Toast notification hook
│   ├── lib/                # Utilities and services
│   │   ├── db-services.ts          # Database service layer with CRUD operations
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── error-handler.ts        # Centralized error handling utility
│   │   ├── validation.ts           # Input validation utilities
│   │   └── utils.ts                # General utility functions
│   ├── pages/              # Application views (complete feature implementations)
│   │   ├── AdminDashboard.tsx      # 8-tab admin panel with leaderboard + reports
│   │   ├── HospitalPortal.tsx      # Hospital management center
│   │   ├── Profile.tsx             # Donor profile + emergency contacts + CSV export
│   │   ├── DonorDashboard.tsx      # Donor home with days-since-donation widget
│   │   ├── BloodDrives.tsx         # Drive discovery + feedback form
│   │   ├── BookAppointment.tsx     # Drive slot booking with validation
│   │   ├── MyAppointments.tsx      # Booking management + print slip
│   │   ├── Rewards.tsx             # Gamification + badge sharing
│   │   ├── Community.tsx           # Social feed
│   │   ├── BloodTypes.tsx          # Blood type compatibility info page
│   │   ├── DonationTips.tsx        # Tips & FAQs page
│   │   ├── HospitalProfile.tsx     # Public hospital profile
│   │   ├── ForgotPassword.tsx      # Password reset with email
│   │   └── Contact.tsx             # Contact form
│   └── App.tsx             # Root component with ErrorBoundary + routing
├── server/                 # Backend Node/Express
│   ├── index.ts            # Server entry point
│   └── routes/             # API routing configurations
│       └── notifications.ts        # Notification sending with pagination
├── shared/                 # Shared TypeScript interfaces and types
├── FEATURES.csv            # Complete feature tracking (55+ features)
├── ISSUES.md               # Issue tracking and resolution log
├── README.md               # This file
├── tsconfig.json           # TypeScript configuration (strict mode enabled)
├── tailwind.config.ts      # Tailwind CSS configuration
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
SUPABASE_SERVICE_KEY=your-service-key

# Server Configuration (optional)
NODE_ENV=development
PORT=3000
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
   The app will be available at `http://localhost:5173` or as displayed in your terminal.

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Type check (with strict mode)**

   ```bash
   npm run typecheck
   ```

---

## 🗄️ Database Schema (Supabase)

The PostgreSQL database relies on these core tables:

| Table | Purpose |
| :--- | :--- |
| `donors` | Donor profiles synced from Clerk (id, name, blood_type, points, level, is_verified, city, email, phone, address) |
| `admins` / `hospitals` | Internal secure access credentials with email + password |
| `drives` | Blood drive events (location, times, capacity, registered_count, is_active) |
| `appointments` | Links donors to specific drives (date, time, status) |
| `donations` | Verified records of completed donations (donor_id, drive_id, units_collected, date) |
| `blood_requests` | Hospital requisitions for blood types (blood_type, units_needed, priority, status) |
| `blood_inventory` | Real-time hospital blood stock per type (units_available, last_updated) |
| `rewards` | Gamification points and badge thresholds (donor_id, points, level, badges_earned) |
| `community_posts` / `community_comments` / `community_likes` | Social feed relational tables |
| `notifications` | User notifications with read/unread status (donor_id, type, title, message, is_read) |
| `announcements` | Sitewide announcement banners managed by admins (title, message, is_active) |
| `contacts` | Messages submitted via Contact Us form (name, email, message, created_at) |

---

## 🛡️ Error Handling

### Global Error Boundary

- Catches unhandled React component rendering errors
- Displays user-friendly error UI with recovery options ("Try Again" / "Go Home")
- Shows detailed error information in development mode
- Prevents entire app crashes

### Centralized Error Handling

- **Standardized Pattern:** All errors use `handleError()` utility
- **Consistent Logging:** Errors logged to console with operation context
- **User Notifications:** Toast notifications inform users of failures
- **Error Recovery:** Graceful degradation with fallback UI

### Input Validation

- **Admin/Hospital Login:** Email format validation + password strength checking
- **Form Validation:** Real-time validation with user-friendly error messages
- **Database Operations:** Null/undefined checks prevent runtime errors
- **Type Safety:** TypeScript strict mode ensures type correctness

### Performance Safeguards

- **Query Pagination:** Database queries limited to prevent excessive data fetching
- **Race Condition Prevention:** Request tracking prevents duplicate simultaneous operations
- **Dependency Optimization:** useEffect dependencies properly maintained

---

## 🌐 Deployment

The project is configured for deployment to various platforms.

**Build for production:**
```bash
npm run build
```

The build output is in the `dist/` directory.

**Environment-Specific Configuration:**

- Supports Netlify deployment via `netlify.toml`
- Supabase connection uses environment variables
- TypeScript strict mode ensures production safety

---

## 📊 Recent Improvements (Latest Session)

### Real-time Analytics & Dashboard Sync

- ✅ **Dynamic Metrics** - Removed all hardcoded placeholders from Admin and Donor dashboards
- ✅ **Filtered Analytics** - Drive capacity charts now filter for active drives to match summary counts
- ✅ **Blood Distribution Accuracy** - "Donors by Blood Type" chart now aggregates the entire 100% database distribution
- ✅ **Dark Mode Accessibility** - Optimized Recharts tooltips with high-contrast themes for better visibility

### Reliability & Data Integrity

- ✅ **Relational Fixes** - Resolved foreign key constraint issues in community comments
- ✅ **Pagination Stability** - Fixed list indexing and mapping errors in paginated views
- ✅ **TypeScript Stability** - Resolved all remaining complex type errors in Dashboard and Portal forms

---

## 🤝 Contact

Have questions or want to collaborate?

- **Email**: kharajaynam@gmail.com
- **Phone**: +91 7779069774
- **Repository**: [Drop of Hope GitHub](https://github.com/JainamKhara/drop-of-hope)

--- 

**Last Updated:** May 1, 2026  
**Status:** ✅ Production Ready with Real-time Analytics & Advanced Error Handling
