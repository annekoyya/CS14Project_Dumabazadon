<div align="center">

<img src="https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Inertia.js-7853B6?style=for-the-badge&logo=inertia&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

# 🏘️ Barangay Profiling System

**A secure, web-based platform for digitizing and centralizing barangay community records.**

*CST14/L – Fundamentals of Cybersecurity | University of Mindanao | March 2026*

*Abas, Emman P. · Arzadon, Dranreb Jay B. · Dumalogdog, Annika Lois R.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Security Implementation](#-security-implementation)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Default Accounts](#-default-accounts)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Environment Variables](#-environment-variables)
- [Artisan Commands](#-artisan-commands)
- [Known Issues](#-known-issues)

---

## 🌐 Overview

The **Barangay Profiling System (BPS)** is a full-stack web application that centralizes demographic, household, business, social services, economic activity, and community engagement data for a barangay (local administrative unit in the Philippines).

Built for barangay admins and data clerks, the system replaces fragmented paper forms and spreadsheets with a unified, secure digital platform — complete with analytics dashboards, audit logging, and encrypted automated backups.

---

## ✨ Features

### 📊 Core Modules
| Module | Description |
|--------|-------------|
| **Dashboard** | Population stats, demographic charts (age, gender, education), business growth, community calendar |
| **Resident Management** | Full CRUD with demographics, household linking, voter status, government IDs, soft-delete |
| **Business Registry** | Register/manage barangay businesses linked to resident owners, permit tracking |
| **Social Services** | Track welfare programs, beneficiaries, service types, and delivery status |
| **Economic Activities** | Employment status, occupation, income sources, livelihood program participation |
| **Community Engagement** | Event scheduling, attendance tracking, interactive calendar view |
| **Trash & Recovery** | Soft-deleted records recoverable from a trash management interface |
| **Backup Manager** | View, download, manually trigger, and delete encrypted backups |
| **Audit Logs** | Full activity log — every login, CRUD action, and system change (SuperAdmin only) |
| **Admin Management** | Create, deactivate, reset, and delete admin accounts (SuperAdmin only) |

---

## 🔐 Security Implementation

This project was built as part of a cybersecurity course. All security controls address identified vulnerabilities via a **defense-in-depth** strategy.

| Control | Implementation | Status |
|---------|---------------|--------|
| **Password Hashing** | bcrypt via `Hash::make()`, 12 rounds | ✅ Done |
| **CAPTCHA** | Google reCAPTCHA v3 on every login | ✅ Done |
| **Two-Factor Auth (2FA)** | Email OTP on first-ever login; 10-min expiry | ✅ Done |
| **Session Timeout** | 30-min idle logout + 1-min frontend warning modal | ✅ Done |
| **Force Password Change** | New admins blocked until strong password is set | ✅ Done |
| **Forgot Password** | 3-step OTP flow (email → verify → reset) | ✅ Done |
| **Role-Based Access Control** | `admin` / `superadmin` with middleware enforcement | ✅ Done |
| **Audit Logging** | All actions logged to `audit_logs` table | ✅ Done |
| **Encrypted Backups** | AES-256-CBC + HMAC-SHA256; daily at midnight | ✅ Done |
| **Offline Backup Copy** | Dual storage in `backups/` and `backups_offline/` | ✅ Done |
| **Admin Lifecycle Management** | SuperAdmin creates/deactivates/resets admin accounts | ✅ Done |
| **CSRF Protection** | Laravel built-in on all POST/PATCH/DELETE routes | ✅ Done |

---

## 🛠 Tech Stack

**Backend**
- PHP 8.2.4
- Laravel 11
- SQLite

**Frontend**
- React 18
- Inertia.js
- Tailwind CSS
- Vite
- Recharts

**Security**
- Google reCAPTCHA v3
- bcrypt (rounds=12)
- AES-256-CBC + HMAC-SHA256

---

## 📦 Prerequisites

Make sure you have the following installed:

- **PHP** >= 8.2 with extensions: `pdo_sqlite`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer** >= 2.x
- **Node.js** >= 18.x + **npm**
- **Git**

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/barangay-profiling-system.git
cd barangay-profiling-system
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Set up environment file

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure `.env`

Open `.env` and fill in the required values (see [Environment Variables](#-environment-variables) below).

At minimum, set:
```env
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
VITE_CAPTCHA_SITE_KEY=your-recaptcha-site-key
CAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 6. Generate the backup encryption key

```bash
php artisan backup:generate-key
```

Copy the output and paste it as `BACKUP_ENCRYPTION_KEY=` in your `.env`.

### 7. Run database migrations

```bash
php artisan migrate
```

### 8. Seed the default accounts

```bash
php artisan db:seed --class=SuperAdminSeeder
```

> Or create accounts manually — see [Default Accounts](#-default-accounts).

---

## ▶️ Running the App

You need **two terminals running simultaneously**:

**Terminal 1 — Laravel backend:**
```bash
php artisan serve --port=8010
```

**Terminal 2 — Vite frontend:**
```bash
npm run dev
```

Then visit: **http://localhost:8010**
---

## 📁 Project Structure

```
barangay-profiling-system/
├── app/
│   ├── Console/Commands/
│   │   ├── BackupDatabase.php          # php artisan backup:database
│   │   ├── DecryptBackup.php           # php artisan backup:decrypt
│   │   └── GenerateBackupKey.php       # php artisan backup:generate-key
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── TwoFactorAuthController.php
│   │   │   ├── AuditLogController.php
│   │   │   ├── BackupController.php
│   │   │   ├── BusinessesController.php
│   │   │   ├── ChangePasswordController.php
│   │   │   ├── CommunityEngagementController.php
│   │   │   ├── ForgotPasswordController.php
│   │   │   ├── ResidentController.php
│   │   │   ├── SocialServiceController.php
│   │   │   ├── SuperAdminController.php
│   │   │   └── TrashController.php
│   │   └── Middleware/
│   │       ├── Check2fa.php
│   │       ├── CheckMustChangePassword.php
│   │       ├── CheckSessionTimeout.php
│   │       ├── HandleInertiaRequests.php
│   │       └── RoleMiddleware.php
│   ├── Models/
│   │   ├── AuditLog.php
│   │   ├── Businesses.php
│   │   ├── CommunityEngagement.php
│   │   ├── Resident.php
│   │   ├── SocialService.php
│   │   └── User.php
│   └── Services/
│       ├── AuditLogService.php
│       └── TwoFactorService.php
├── database/
│   ├── migrations/
│   └── database.sqlite
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── Sidebar.jsx             # Role-aware sidebar with profile dropdown
│   │   │   ├── CalendarComponent.jsx
│   │   │   ├── LineChart.jsx
│   │   │   ├── PieChart.jsx
│   │   │   ├── VerticalBarChart.jsx
│   │   │   └── HorizontalBarChart.jsx
│   │   ├── Layouts/
│   │   │   └── Layout.jsx              # Main layout: Sidebar + Navbar + SessionTimeout
│   │   └── Pages/
│   │       ├── Admin/                  # Dashboard, AuditLogs, Backups, etc.
│   │       ├── Auth/                   # ChangePassword, ForgotPassword*, TwoFactorVerify
│   │       ├── Login/
│   │       │   └── Login.jsx
│   │       └── SuperAdmins/
│   │           └── Admins/             # Index.jsx, Create.jsx
│   └── views/emails/
│       ├── admin-welcome.blade.php
│       ├── forgot-password-otp.blade.php
│       └── two-factor-code.blade.php
├── routes/
│   └── web.php
├── storage/
│   └── app/
│       ├── backups/                    # Primary encrypted backup location
│       └── backups_offline/            # Offline redundancy copy
└── .env
```

---

## 👥 User Roles

### SuperAdmin
- Full access to all modules
- **Exclusive access** to: Admin Management, Audit Logs
- Can create, deactivate, reactivate, reset passwords for, and delete admin accounts
- Cannot be deactivated or deleted

### Admin
- Access to: Dashboard, Demographic Profile, Social Services, Economic Activities, Community Engagement, Residents & Other Data, Backups
- Full CRUD on all day-to-day data records
- **Cannot** access Admin Management or Audit Logs

### First Login Flow (New Admins)
```
SuperAdmin creates admin → welcome email with temp password
  ↓
Admin logs in → 2FA OTP sent (first-ever login)
  ↓
Admin verifies OTP → must_change_password = true → forced to /password/change
  ↓
Admin sets strong password → redirected to dashboard ✅
```

---

## 🔧 Environment Variables

```env
APP_NAME="Barangay Profiling System"
APP_ENV=local
APP_KEY=                          # auto-generated by php artisan key:generate
APP_DEBUG=true                    # set to false in production
APP_URL=http://localhost:8010

DB_CONNECTION=sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120

BCRYPT_ROUNDS=12

# Google reCAPTCHA v3
# Get keys at: https://www.google.com/recaptcha/admin
VITE_CAPTCHA_SITE_KEY=            # public key (used in frontend JS)
CAPTCHA_SECRET_KEY=               # secret key (used in backend validation)

# Gmail SMTP (use an App Password, not your regular password)
# Enable at: https://myaccount.google.com/apppasswords
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Backup encryption key (generate with: php artisan backup:generate-key)
BACKUP_ENCRYPTION_KEY=
```

> 💡 **Mail tip:** During development you can set `MAIL_MAILER=log` to write emails to `storage/logs/laravel.log` instead of actually sending them. Useful for checking OTP codes without SMTP setup.

---

## ⚙️ Artisan Commands

```bash
# Development
php artisan serve --port=8010       # Start Laravel server
php artisan migrate                  # Run pending migrations
php artisan migrate:fresh --seed     # Wipe DB and re-seed
php artisan db:seed --class=SuperAdminSeeder

# Cache (run after config/route changes)
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Backups
php artisan backup:generate-key      # Generate AES key → paste into .env
php artisan backup:database          # Run a manual backup now
php artisan backup:list              # List all backup files
php artisan backup:decrypt <file> --output=<path>   # Decrypt a backup file

# Debug
php artisan route:list               # Show all registered routes
php artisan tinker                   # Interactive PHP console
```

