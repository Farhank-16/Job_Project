# Rural Job Matching Platform

A mobile-first full-stack web application for connecting rural workers with job opportunities.

## Features

- 📱 Mobile-first responsive design
- 🔐 OTP-based authentication via MSG91
- 💳 Razorpay payment integration
- 📍 Location-based job matching (Haversine formula)
- 🎓 Skill certification exams
- ✅ Verified badge system
- 👤 Employer & Job Seeker roles
- 🔧 Admin panel

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT + MSG91 OTP
- **Payments**: Razorpay

## Prerequisites

- Node.js v18+ 
- MySQL 8.0+
- npm or yarn
- MSG91 account (for OTP)
- Razorpay account (for payments)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Farhank-16/Job_Project.git
cd rural-job-platform
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE rural_job_platform;
USE rural_job_platform;

# Run schema
source backend/schema.sql;

# Exit MySQL
exit;
```

### 3. Backedn Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 4. Configure .env file 
 ```bash
 cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```
### 5. 