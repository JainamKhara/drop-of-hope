# Drop of Hope ❤️🩸

A comprehensive, modern web-based blood donation management platform connecting donors, hospitals, and administrators to facilitate and streamline the life-saving process of blood donation.

> Saving lives, one drop at a time.

---

## 📋 Table of Contents

- [Drop of Hope ❤️🩸](#drop-of-hope-️)
  - [📋 Table of Contents](#-table-of-contents)
  - [💡 About the Project](#-about-the-project)
  - [🚀 Key Features \& Functionalities](#-key-features--functionalities)
    - [🩸 For Donors](#-for-donors)
    - [🏥 For Hospitals](#-for-hospitals)
    - [👨‍💼 For Administrators](#-for-administrators)
    - [🤖 General Features](#-general-features)
  - [🛠️ Technology Stack](#️-technology-stack)
    - [Frontend](#frontend)
    - [Backend \& Auth](#backend--auth)
  - [🔐 Authentication Architecture](#-authentication-architecture)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation \& Execution](#installation--execution)
  - [🗄️ Database Schema (Supabase)](#️-database-schema-supabase)
  - [🌐 Deployment](#-deployment)
  - [🤝 Contact](#-contact)

---

## 💡 About the Project

**Drop of Hope** was built to solve the communication gap between individuals willing to donate blood and the hospitals or organizations in desperate need of it. 

By gamifying the donor experience and providing powerful oversight tools to administrators and medical centers, Drop of Hope encourages repeat donations, ensures that blood drives are well-attended, and maintains highly accurate, real-time inventory tracking for critical patient care.

---

## 🚀 Key Features & Functionalities

### 🩸 For Donors
- **Interactive Dashboard:** Get a personalized overview of your donation history, total points earned, and upcoming appointments.
- **Find Blood Drives:** Discover nearby donation events using location filtering and mapping.
- **Book Appointments:** Seamlessly schedule donation slots with calendar integration to avoid waiting in line.
- **Appointment Management:** View, easily reschedule, or cancel existing bookings through the "My Appointments" hub.
- **Profile Management:** Maintain up-to-date personal information, including blood type, contact details, and eligibility status.
- **Rewards System (Gamification):** Earn points for every donation, unlock exclusive badges, and climb levels to encourage ongoing participation.
- **Community Feed:** Engage with a social feed tailored for donors—share stories, post pictures, and like/comment on community posts.

### 🏥 For Hospitals
- **Hospital Portal:** A dedicated control center to manage critical blood stock and requests.
- **Blood Requests:** Generate urgent, high-priority, or routine requisitions for specific blood types (`A+`, `O-`, etc.).
- **Inventory Management:** Track available blood units in real-time, preventing shortages and minimizing expiration waste.
- **Drive Organizations:** Plan, organize, and publish new blood drive events to attract the local community.

### 👨‍💼 For Administrators
- **Admin Dashboard:** Gain system-wide analytics, metrics, and complete oversight.
- **User Management:** Quickly view lists of all donors and hospitals. Perform moderation or account management as necessary.
- **Drive & Request Approval:** Review, approve, or reject blood drive requests and incoming urgent hospital blood requisitions.
- **Data Analytics:** Access rich data visualization and charts regarding lives impacted, active donors, and historical donation trends.

### 🤖 General Features
- **AI Chatbot Assistant:** A built-in, floating chatbot widget available on all pages to answer user questions about donation eligibility, the booking process, and how the rewards system works.
- **Modern UI/UX:** A beautiful, responsive interface built with TailwindCSS, utilizing accessible components (Radix UI/shadcn) for a frictionless user journey.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Tooling:** Vite (Lightning-fast dev server and bundler)
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui & Radix UI (Accessible primitive components)
- **Routing:** React Router DOM
- **State Management:** TanStack Query (React Query)
- **Data Visualization:** Recharts
- **Icons:** Lucide React

### Backend & Auth
- **BaaS (Backend as a Service):** Supabase (PostgreSQL Database & API generation)
- **Donor Authentication:** Clerk (Modern, secure auth provider with social logins)
- **Admin/Hospital Auth:** Direct Supabase Authentication (Session persistence)
- **API Framing:** Express (Node.js)

---

## 🔐 Authentication Architecture

The platform uniquely utilizes a **Hybrid Authentication** model to balance security and ease of use:

1. **Clerk Authentication (For Donors):** 
   - Handles donor sign-ups, sign-ins, and session management.
   - Provides out-of-the-box support for profile pictures and social logins.
   - Automatically synchronizes authenticated user data down to the Supabase `donors` table securely.
2. **Direct Supabase Auth (For Admins & Hospitals):**
   - Credentials safely stored inside the `admins` and `hospitals` PostgreSQL tables.
   - Access verified directly without external dependencies, focusing on strict internal control.

---

## 📁 Project Structure

```text
drop-of-hope/
├── client/                 # Frontend React application workspace
│   ├── components/         # Reusable UI components (shadcn/ui, Chatbot, Nav)
│   ├── contexts/           # Global State (HybridAuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Database services (db-services.ts) & Utilities
│   ├── pages/              # Application views (Dashboards, Booking forms, Auth)
│   └── App.tsx             # Root component and Routing definitions
├── server/                 # Backend Node/Express scaffolding
│   ├── index.ts            # Server entry point
│   └── routes/             # API routing configurations
├── shared/                 # Shared TypeScript interfaces (Client/Server)
└── public/                 # Static graphical assets (Favicons, placeholders)
```

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `pnpm` package manager

### Environment Variables
You will need to create a `.env` file at the root of the project with the following configuration:

```env
# Clerk Authentication (Get from clerk.com dashboard)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase Configuration (Get from supabase.com dashboard)
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
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The application will be running locally (usually at `http://localhost:5173` or `http://localhost:8080`).

---

## 🗄️ Database Schema (Supabase)

The PostgreSQL database powering the backend relies on the following core entities:

- `donors`: Donor profiles synced automatically from Clerk.
- `admins` / `hospitals`: Internal secure access credentials.
- `drives`: Locations, times, and organizers for physical blood donation events.
- `appointments`: The connection linking a `donor` to a specific `drive`.
- `donations`: Verified records of completed blood offerings.
- `blood_requests`: Requisitions made by hospitals for fulfillment.
- `blood_inventory`: Live tracking database for the hospital's current stock (A+, B-, O+, etc.).
- `rewards`: Gamification points and threshold unlocks.
- `community_posts` / `community_comments` / `community_likes`: Relational tables managing the social feed.

---

## 🌐 Deployment

The workspace is configured to be easily deployable to edge environments like Netlify. It includes pre-configured `netlify.toml` build commands.

**To manually build for production:**
```bash
# Builds both the client SPA and the server bundle
npm run build
```

---

## 🤝 Contact

Have questions or want to collaborate?

- **Email**: kharajaynam@gmail.com
- **Phone**: +91 7779069774
- **Repository**: [Drop of Hope GitHub](https://github.com/Jainam116/drop-of-hope)

---
