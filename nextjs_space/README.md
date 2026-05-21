# ⏱️ TimeTrack Pro — Employee Time Tracker

<div align="center">

![TimeTrack Pro](https://img.shields.io/badge/TimeTrack-Pro-4F46E5?style=for-the-badge&logo=clockify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A modern, full-featured employee time tracking application with real-time clock-in/out, interactive dashboards, and comprehensive reporting.**

</div>

---

## 🌟 Features

### 🔐 Authentication & Security
- **Secure Login & Signup** — Email/password authentication powered by NextAuth.js
- **Role-Based Access Control** — Admin and Employee roles with permission-based views
- **Protected Routes** — Middleware-based route protection for all dashboard pages
- **Encrypted Passwords** — bcrypt hashing for secure credential storage

### 📊 Interactive Dashboard
- **Live Clock In/Out** — Real-time timer with elapsed time tracking
- **Weekly Hours Chart** — Visual bar chart showing daily work hours
- **Monthly Calendar View** — Heat-map style calendar showing daily activity
- **Quick Stats** — At-a-glance overview of today's, weekly, and monthly hours
- **Recent Entries** — Quick view of latest time entries with project details

### ⏰ Time Entry Management
- **Manual Time Entry** — Add entries with date, start/end times, project, task, and notes
- **Clock In/Out System** — One-click timer for automatic time tracking
- **Full CRUD Operations** — Create, read, update, and delete time entries
- **Search & Filter** — Find entries by project, task, or notes
- **Validation** — Client-side form validation with helpful error messages

### 📈 Reports & Analytics
- **Date Range Filtering** — View reports for today, this week, this month, or custom ranges
- **Project Breakdown** — Pie chart showing time distribution across projects
- **Daily Hours Chart** — Bar chart visualizing daily productivity
- **Summary Statistics** — Total hours, entries, average daily hours, and project count
- **Admin View** — Admins can filter reports by employee
- **CSV Export** — Download detailed time reports for payroll and auditing

### 🎨 Modern UI/UX
- **Responsive Design** — Works beautifully on desktop, tablet, and mobile
- **Dark/Light Theme** — Toggle between themes with persistent preference
- **Smooth Animations** — Fade-in, slide-in, and stagger animations for a polished feel
- **Toast Notifications** — Real-time feedback for all user actions
- **Professional Typography** — DM Sans, Plus Jakarta Sans, and JetBrains Mono fonts

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Prisma** | Database ORM |
| **PostgreSQL** | Relational database |
| **NextAuth.js** | Authentication |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Data visualization |
| **Lucide Icons** | Beautiful icon set |
| **date-fns** | Date manipulation |
| **bcryptjs** | Password hashing |
| **Sonner** | Toast notifications |

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth & login endpoints
│   │   ├── signup/         # User registration
│   │   ├── time-entries/   # CRUD + clock in/out
│   │   ├── reports/        # Report generation & CSV export
│   │   └── users/          # User management (admin)
│   ├── auth/               # Login/Signup pages
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard with charts
│   │   ├── time-entry/     # Time entry management
│   │   └── reports/        # Reports & analytics
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Entry redirect
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── providers.tsx       # Session provider
│   └── theme-provider.tsx  # Theme management
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── seed.ts             # Database seeding
├── middleware.ts            # Route protection
└── types/
    └── next-auth.d.ts      # Type extensions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database
- **Yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aitestlogin12-create/Aba-AI.git
   cd Aba-AI
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/timetracker"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   yarn prisma generate
   yarn prisma db push
   ```

5. **Seed the database** (optional)
   ```bash
   yarn prisma db seed
   ```

6. **Start the development server**
   ```bash
   yarn dev
   ```

7. **Open your browser** and navigate to `http://localhost:3000`

---

## 👥 Default Accounts

After seeding the database, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@company.com | admin123 |
| **Employee** | jane@company.com | employee123 |

---

## 📸 Application Pages

### 🔑 Authentication
Clean, modern login and signup forms with smooth transitions and validation.

### 📊 Dashboard
Interactive overview with live clock-in timer, weekly charts, monthly calendar, and quick stats.

### ⏰ Time Entry
Full-featured time management with search, add/edit dialogs, and bulk operations.

### 📈 Reports
Comprehensive analytics with date filtering, project breakdowns, daily charts, and CSV export.

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/signup` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/time-entries` | Fetch time entries |
| `POST` | `/api/time-entries` | Create a time entry |
| `PUT` | `/api/time-entries/[id]` | Update a time entry |
| `DELETE` | `/api/time-entries/[id]` | Delete a time entry |
| `GET` | `/api/time-entries/clock` | Check clock-in status |
| `POST` | `/api/time-entries/clock` | Clock in |
| `PUT` | `/api/time-entries/clock` | Clock out |
| `GET` | `/api/reports` | Get report data |
| `GET` | `/api/reports/export` | Export CSV report |
| `GET` | `/api/users` | List users (admin only) |

---

## 🎨 Design System

- **Primary Color:** Indigo (#4F46E5)
- **Fonts:** DM Sans (body), Plus Jakarta Sans (headings), JetBrains Mono (code)
- **Components:** Built on Radix UI primitives with Tailwind CSS
- **Animations:** Custom fade, slide, and stagger animations
- **Theme:** Supports both light and dark modes

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Lucide](https://lucide.dev/)
- Hosted on [Abacus.AI](https://abacus.ai/)

---

<div align="center">

**Made with ❤️ using Abacus AI Agent**

</div>
