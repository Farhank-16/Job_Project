# 🏠 JobNest

> **India's hyperlocal job platform** — connecting skilled workers with employers in their vicinity using GPS-based distance matching, skill certifications, and instant mobile-first experience.

---

## 📱 What is JobNest?

JobNest is a full-stack mobile-first job portal built specifically for the Indian blue-collar and grey-collar workforce. Unlike traditional job portals, JobNest focuses on **proximity-based job matching** — seekers and employers within a defined radius (up to 100 km for premium users) see each other's listings.

The platform supports three distinct roles — **Job Seeker**, **Employer**, and **Admin** — each with a dedicated experience, subscription model, and feature set.

---

## ✨ Key Features

### 👷 For Job Seekers
- 📍 GPS-based job search with distance filter (1–10 km free / 1–100 km premium)
- 🔍 Filter jobs by skill, city, job type, and distance
- 📝 Apply for jobs with a cover letter
- 📊 Track application status (Pending → Reviewed → Shortlisted → Hired)
- 🏆 Take skill certification exams (10 random questions, 15-minute timer)
- ✅ Get a **Verified Badge** after identity verification
- 👤 Manage profile with skills, experience, and availability

### 🏢 For Employers
- 📋 Post jobs with GPS location capture
- 🔍 Search candidates by skill, availability, and radius
- 👥 View all applications with status management
- 📞 Contact candidates directly (premium feature)
- 📊 Dashboard with stats: active jobs, applications, total views

### ⚙️ For Admin
- 📊 Platform-wide dashboard: users, jobs, revenue stats
- 👥 Manage users: verify, activate/deactivate
- 💼 Monitor all jobs across the platform
- 🛠️ Manage skills catalog (50 skills across 5 categories)
- ❓ Manage exam questions (CRUD with difficulty levels)
- 💳 View all payment transactions with filters

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|------------|-------|
| **React 18** | UI framework |
| **Vite** | Build tool with HMR |
| **Tailwind CSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Plus Jakarta Sans** | Display font (headings) |
| **Inter** | Body font |

### Backend
| Technology | Usage |
|------------|-------|
| **Node.js + Express** | REST API server |
| **MySQL 8** | Relational database |
| **mysql2** | Database driver |
| **JWT** | Authentication tokens |
| **Razorpay** | Payment gateway |
| **bcrypt** | Password hashing |

---

## 📁 Project Structure

```
jobnest/
├── frontend/                      # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   │   └── OTPInput.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Select.jsx
│   │   │       ├── Skeleton.jsx
│   │   │       └── Tabs.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── useAuth.js
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   └── useLocation.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminJobs.jsx
│   │   │   │   ├── AdminPayments.jsx
│   │   │   │   ├── AdminQuestions.jsx
│   │   │   │   ├── AdminSkills.jsx
│   │   │   │   └── AdminUsers.jsx
│   │   │   ├── auth/
│   │   │   │   ├── CompleteProfile.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── SelectRole.jsx
│   │   │   │   └── VerifyOTP.jsx
│   │   │   ├── employer/
│   │   │   │   ├── CandidateProfile.jsx
│   │   │   │   ├── CandidateSearch.jsx
│   │   │   │   ├── EditJob.jsx
│   │   │   │   ├── EmployerDashboard.jsx
│   │   │   │   ├── EmployerProfile.jsx
│   │   │   │   ├── JobApplications.jsx
│   │   │   │   ├── MyJobs.jsx
│   │   │   │   └── PostJob.jsx
│   │   │   ├── seeker/
│   │   │   │   ├── ExamList.jsx
│   │   │   │   ├── JobDetails.jsx
│   │   │   │   ├── JobSearch.jsx
│   │   │   │   ├── MyApplications.jsx
│   │   │   │   ├── SeekerDashboard.jsx
│   │   │   │   ├── SeekerProfile.jsx
│   │   │   │   ├── SeekerSubscription.jsx
│   │   │   │   └── TakeExam.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── PaymentSuccess.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── authService.js
│   │   │   ├── examService.js
│   │   │   ├── jobService.js
│   │   │   ├── paymentService.js
│   │   │   ├── skillService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                       # Node.js + Express API
    ├── config/
    │   ├── config.js
    │   └── database.js
    ├── controllers/
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── examController.js
    │   ├── jobController.js
    │   ├── paymentController.js
    │   └── userController.js
    ├── middleware/
    │   ├── auth.js
    │   └── roleCheck.js
    ├── routes/
    │   ├── admin.js
    │   ├── auth.js
    │   ├── exam.js
    │   ├── jobs.js
    │   ├── payments.js
    │   └── users.js
    ├── .env
    ├── package.json
    └── server.js
```

---

## 🗄️ Database Schema

### Core Tables

```sql
users               -- All users (seekers, employers, admin)
jobs                -- Job listings posted by employers
applications        -- Job applications by seekers
skills              -- Master skills catalog (50 skills)
user_skills         -- Many-to-many: users ↔ skills
job_skills          -- Many-to-many: jobs ↔ skills (optional)
exams               -- Exam questions bank
exam_attempts       -- User exam sessions with answers
payments            -- Razorpay payment records
subscriptions       -- Active subscription tracking
admin_logs          -- Admin action audit log
```


## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourname/jobnest.git
cd jobnest

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE jobnest_db;
exit;

# Run migrations (if schema file exists)
mysql -u root -p jobnest_db < database/schema.sql

# Seed skills and exam questions
mysql -u root -p jobnest_db < database/seeds/skills_questions.sql
```

### 3. Backend Environment

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jobnest_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# OTP (use any SMS provider or test mode)
OTP_SECRET=your_otp_secret
```

### 4. Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 5. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # uses nodemon

# Terminal 2 — Frontend
cd frontend
npm run dev        # starts on http://localhost:5173
```

---

## 🔑 API Routes

### Auth
```
POST   /api/auth/request-otp       Request OTP on mobile
POST   /api/auth/verify-otp        Verify OTP, returns JWT
POST   /api/auth/register          Register with role after OTP
GET    /api/auth/me                Get current user
```

### Jobs
```
GET    /api/jobs                   Search jobs (with distance filter)
GET    /api/jobs/:id               Get job details
POST   /api/jobs                   Post a new job [employer]
PUT    /api/jobs/:id               Update job [employer]
POST   /api/jobs/:id/apply         Apply for job [seeker]
GET    /api/jobs/:id/applications  Get applicants [employer]
PUT    /api/jobs/:id/applications/:appId  Update application status
```

### Users
```
GET    /api/users/profile          Get own profile
PUT    /api/users/profile          Update profile
GET    /api/users/applications     Get my applications [seeker]
GET    /api/users/candidates       Search candidates [employer]
GET    /api/users/:id              View a user's public profile
```

### Exams
```
GET    /api/exams                  Get available exams
POST   /api/exams/:skillId/start   Start exam (requires payment)
POST   /api/exams/:attemptId/submit Submit answers
GET    /api/exams/history          Get exam history
```

### Payments
```
POST   /api/payments/create-order  Create Razorpay order
POST   /api/payments/verify        Verify payment signature
GET    /api/payments/status        Get payment/subscription status
```

### Admin
```
GET    /api/admin/dashboard        Platform stats
GET    /api/admin/users            All users (paginated)
PUT    /api/admin/users/:id/status Verify / activate user
GET    /api/admin/jobs             All jobs (paginated)
GET    /api/admin/skills           All skills
POST   /api/admin/skills           Create skill
PUT    /api/admin/skills/:id       Update skill
GET    /api/admin/questions        All exam questions
POST   /api/admin/questions        Create question
PUT    /api/admin/questions/:id    Update question
DELETE /api/admin/questions/:id    Delete question
GET    /api/admin/payments         All payments (paginated)

---


## 🔐 Authentication Flow

```
1. User enters mobile number
2. OTP sent via SMS provider
3. User enters 6-digit OTP
4. New user → SelectRole → CompleteProfile → Dashboard
5. Existing user → Dashboard directly
6. JWT stored in localStorage / memory
7. All protected routes require Bearer token
```

---

## 🧰 Scripts

```bash
# Backend
npm run dev          # Development with nodemon
npm start            # Production
npm run lint         # ESLint

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
```

---

## 📄 License

This project is private and proprietary. All rights reserved.
