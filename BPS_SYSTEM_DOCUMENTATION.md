# Barangay Profiling System (BPS) — Complete System Documentation

> **Purpose:** This document provides a full technical reference for the BPS project so that any new chat session can understand the system without prior history.  
> **Stack:** Laravel 11 + React (Inertia.js) + SQLite + Vite + Tailwind CSS  
> **Last Updated:** February 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Database Schema](#3-database-schema)
4. [Authentication & Security Implementation](#4-authentication--security-implementation)
5. [Role System](#5-role-system)
6. [Admin Functionalities](#6-admin-functionalities)
7. [SuperAdmin Functionalities](#7-superadmin-functionalities)
8. [File Structure Reference](#8-file-structure-reference)
9. [All Controllers — Methods & Variables](#9-all-controllers--methods--variables)
10. [All Middleware](#10-all-middleware)
11. [All Services](#11-all-services)
12. [All Models](#12-all-models)
13. [Frontend Pages Reference](#13-frontend-pages-reference)
14. [Routes Reference](#14-routes-reference)
15. [Known Issues & Bugs](#15-known-issues--bugs)
16. [Pending Features](#16-pending-features)
17. [Environment Variables](#17-environment-variables)
18. [Seeded Accounts](#18-seeded-accounts)
19. [Key Commands](#19-key-commands)

---

## 1. Project Overview

The **Barangay Profiling System** is a web-based admin panel for managing barangay (local government unit) data including:
- Resident and household records
- Business registrations
- Social services beneficiaries
- Community engagement events
- Demographic analytics and charts

The system has **two user roles**: `admin` and `superadmin`, each with different access levels and responsibilities.

---

## 2. Tech Stack & Environment

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11 (PHP 8.2.4) |
| Frontend | React 18 + Inertia.js |
| Database | SQLite (`database/database.sqlite`) |
| Bundler | Vite |
| CSS | Tailwind CSS |
| Mail | Gmail SMTP (barangay.testcs14@gmail.com) |
| CAPTCHA | Google reCAPTCHA v3 |
| Server | `php artisan serve --port=8010` |
| Dev Assets | `npm run dev` (must run simultaneously) |

**Both commands must run at the same time:**
```bash
# Terminal 1
php artisan serve --port=8010

# Terminal 2
npm run dev
```

---

## 3. Database Schema

### `users` table
```sql
id                      INTEGER PRIMARY KEY
name                    VARCHAR(255)
email                   VARCHAR(255) UNIQUE
password                VARCHAR(255)           -- bcrypt hashed
role                    VARCHAR(255)           -- 'admin' or 'superadmin'
is_active               BOOLEAN DEFAULT true
must_change_password    BOOLEAN DEFAULT false  -- forces password change on first login
two_factor_code         VARCHAR(255) NULL      -- bcrypt-hashed OTP
two_factor_expires_at   TIMESTAMP NULL
2fa_verified_at         TIMESTAMP NULL         -- NULL = never verified, set = skip 2FA
remember_token          VARCHAR(100) NULL
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### `residents` table
```sql
id, full_name, age, birthdate, gender, civil_status,
education_level, occupation, household_id,
deleted_at (soft deletes), created_at, updated_at
```

### `businesses` table
```sql
id, business_name, owner_name, business_type, address,
resident_id (FK), deleted_at, created_at, updated_at
```

### `social_services` table
```sql
id, service_type, beneficiary_name, resident_id (FK),
deleted_at, created_at, updated_at
```

### `community_engagements` table
```sql
id, event_name, event_date, description, participants,
deleted_at, created_at, updated_at
```

### `audit_logs` table
```sql
id
user_id         INTEGER NULL (FK to users)
user_email      VARCHAR(255) NULL
action          VARCHAR(255)       -- e.g. 'login', 'created', 'deleted', 'backup_created'
model           VARCHAR(255) NULL  -- e.g. 'Resident', 'Business', 'User'
model_id        INTEGER NULL
changes         JSON NULL          -- before/after data
ip_address      VARCHAR(255) NULL
user_agent      TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Logged actions:**
- Auth: `login`, `logout`, `login_failed`, `2fa_triggered`, `login_blocked_inactive`
- CRUD: `created`, `updated`, `deleted`, `restored`
- Backups: `backup_created`, `backup_downloaded`, `backup_deleted`, `backup_manual_trigger`
- Admin management: `admin_created`, `admin_deactivated`, `admin_activated`, `admin_deleted`, `admin_password_reset`
- Password: `password_changed`

### `sessions` table
```sql
id, user_id, ip_address, user_agent, payload, last_activity
```

---

## 4. Authentication & Security Implementation

### 4.1 Login Flow (Complete)
```
User visits /login
    → Fills email + password
    → reCAPTCHA v3 token generated client-side
    → POST /login
    → AuthController::login()
        → Validate captcha_token (Google API)
        → Check if user exists + password correct (Hash::check)
        → Check if user is_active (blocks deactivated admins)
        → Check if 2fa_verified_at is NULL
            → NULL: generate OTP, send email, redirect to /2fa/verify
            → NOT NULL: redirect based on role
                → superadmin → /superadmin/admins
                → admin → /dashboard
        → Check must_change_password AFTER 2FA
            → true: redirect to /password/change
```

### 4.2 Two-Factor Authentication (2FA)
- **Triggers:** Only on FIRST-EVER login (when `2fa_verified_at` IS NULL)
- **Never triggers again** after first verification
- **OTP:** 6-digit code, bcrypt-hashed in DB, expires in 10 minutes
- **Email:** Sent via SMTP to user's email
- **Resend:** Available on verify page, generates new code (invalidates old)

**Key files:**
- `app/Services/TwoFactorService.php` — `generateCode()`, `sendCode()`, `verifyCode()`, `hasVerifiedBefore()`
- `app/Http/Controllers/Auth/TwoFactorAuthController.php` — `show()`, `verify()`, `resend()`
- `app/Http/Middleware/Check2fa.php` — blocks routes if `2fa_verified_at` is NULL
- `resources/js/Pages/Auth/TwoFactorVerify.jsx` — 6-digit input UI

### 4.3 Password Security
- **Storage:** bcrypt via `Hash::make()` (Laravel default)
- **Rounds:** 12 (set via `BCRYPT_ROUNDS=12` in `.env`)
- **Rules for new passwords:**
  - Minimum 8 characters
  - At least 1 uppercase letter (regex: `/[A-Z]/`)
  - At least 1 number (regex: `/[0-9]/`)
  - At least 1 special character (regex: `/[@$!%*#?&]/`)
  - Cannot reuse current password

### 4.4 Session Timeout
- **Idle timeout:** 30 minutes (configured in `.env` as `SESSION_LIFETIME=120` but frontend warns at 29 min)
- **Frontend warning:** `SessionTimeoutWarning` component in `Layout.jsx` — shows modal 1 min before logout
- **Backend middleware:** `CheckSessionTimeout` — tracks `last_activity` in session
- **Driver:** `SESSION_DRIVER=database`

### 4.5 CAPTCHA
- **Type:** Google reCAPTCHA v3
- **Triggers:** Every login attempt
- **Frontend:** Script loaded dynamically in `Login.jsx`, token generated via `window.grecaptcha.execute()`
- **Backend:** Validated in `AuthController::login()` via Google API call
- **Keys:** `VITE_CAPTCHA_SITE_KEY` and `CAPTCHA_SECRET_KEY` in `.env`

### 4.6 Force Password Change
- **Triggers:** When `must_change_password = true` on user account
- **Use case:** New admins created by SuperAdmin get a temp password + this flag set to `true`
- **Middleware:** `CheckMustChangePassword` — redirects to `/password/change` for any protected route
- **Exception:** `/password/change` and `/password/update` routes are allowed through
- **After change:** `must_change_password` set to `false`, user redirected to dashboard

### 4.7 Forgot Password Flow
```
/forgot-password (enter email)
    → POST /forgot-password → ForgotPasswordController::send()
    → Generate OTP, save to two_factor_code, send email
    → Store email in session('reset_email')
    → Redirect to /forgot-password/verify

/forgot-password/verify (enter 6-digit OTP)
    → POST /forgot-password/verify → ForgotPasswordController::verify()
    → Check OTP against DB + expiry
    → Set session('reset_verified' = true)
    → Redirect to /forgot-password/reset

/forgot-password/reset (enter new password)
    → POST /forgot-password/reset → ForgotPasswordController::reset()
    → Validate password strength
    → Check not same as old password
    → Save new password, clear OTP, set must_change_password = false
    → Clear session, redirect to /login with success message
```

### 4.8 Encrypted Backups
- **Schedule:** Daily at midnight via Laravel Scheduler (`backup:database` Artisan command)
- **Encryption:** AES-256-CBC with HMAC-SHA256 integrity check
- **Key:** `BACKUP_ENCRYPTION_KEY` in `.env` (base64-encoded 32-byte key)
- **Locations:**
  - Primary: `storage/app/backups/`
  - Offline copy: `storage/app/backups_offline/`
- **Retention:** 30 days (older files auto-deleted)
- **File format:** `backup_YYYY-MM-DD_HH-MM-SS.sqlite.enc`

### 4.9 Audit Logging
All actions logged via `AuditLogService::log($action, $model, $modelId, $changes)`:
- Automatically captures `user_id`, `user_email`, `ip_address`, `user_agent` from current request
- Stored in `audit_logs` table
- Viewable at `/audit-logs` (admin + superadmin)

---

## 5. Role System

| Feature | Admin | SuperAdmin |
|---------|-------|-----------|
| Dashboard | ✅ | ✅ |
| Demographic Profile | ✅ | ✅ |
| Social Services | ✅ | ✅ |
| Economic Activities | ✅ | ✅ |
| Community Engagement | ✅ | ✅ |
| Residents & Other Data | ✅ | ✅ |
| Audit Logs | ✅ | ✅ |
| Backups | ✅ | ✅ |
| Manage Admins | ❌ | ✅ |
| Create Admin | ❌ | ✅ |
| Deactivate Admin | ❌ | ✅ |
| Delete Admin | ❌ | ✅ |
| Reset Admin Password | ❌ | ✅ |
| Can be deactivated | ✅ | ❌ |
| Can be deleted | ✅ | ❌ |

**RoleMiddleware logic:**
```php
// SuperAdmin bypasses all role checks — can access everything
if ($user->role === 'superadmin') return $next($request);
// Admin can only access routes tagged role:admin
if ($user->role !== $role) abort(403, 'Unauthorized');
```

**Sidebar behavior:**
- Shows `SUPERADMIN` label + "Super Administrator" badge for superadmin
- Shows `ADMIN` label for admin
- "Manage Admins" link only visible to superadmin
- Profile dropdown shows name, email, role badge, account status, change password link, logout

---

## 6. Admin Functionalities

### 6.1 Dashboard (`/dashboard`)
**Controller:** `ResidentController::index()`  
**Page:** `resources/js/Pages/Admin/Dashboard.jsx`  
**Props passed:**
```php
$populationData              // array of [year, population, growth]
$ageDistributionData         // array of [age_group, population]
$genderData                  // array of [Female, Male, LGBTQ+, year]
$educationData               // array of [level, population]
$employmentRate              // float percentage
$overallGrowthRate           // float percentage
$getBusinessPopulationData   // array of [year, population, growth]
$residents                   // all residents (for table)
$communityEngagements        // all events
$calendarEvents              // formatted for CalendarComponent
```
**Charts:** LineChart (population growth), VerticalBarChart (age distribution), PieChart (education), HorizontalBarChart (gender), LineChart (business growth), CalendarComponent (events)

### 6.2 Demographic Profile (`/demographic-profile`)
**Controller:** `ResidentController::DemographicProfile()`  
**Page:** `resources/js/Pages/Admin/DemographicProfile.jsx`

### 6.3 Social Services (`/social-services`)
**Controller:** `ResidentController::SocialActivities()`  
**Page:** `resources/js/Pages/Admin/SocialServices.jsx`  
**⚠️ KNOWN BUG:** Uses `YEAR(created_at)` which is MySQL syntax. SQLite requires `strftime('%Y', created_at)`.  
**Fix:** Replace ALL `YEAR(created_at)` with `strftime('%Y', created_at)` in `ResidentController.php`

### 6.4 Economic Activities (`/economic-activities`)
**Controller:** `ResidentController::EconomicActivities()`  
**Page:** `resources/js/Pages/Admin/EconomicActivities.jsx`

### 6.5 Community Engagement (`/community-engagement`)
**Controller:** `CommunityEngagementController::index()`  
**Page:** `resources/js/Pages/Admin/CommunityEngagement.jsx`

### 6.6 Residents & Other Data (`/residents-and-households/resident`)
**Controller:** `ResidentController::allData()`  
**Page:** `resources/js/Pages/Admin/ResidentHousehold/AllData.jsx`

**Sub-pages (all within the layout — sidebar stays):**
| Route | Page | Controller |
|-------|------|-----------|
| `/residents-and-households/register-resident` | `AddResident.jsx` | `AddResidentController::addResident()` |
| `/residents-and-households/edit-resident/{id}` | `EditResident.jsx` (Admin/) | `ResidentController::edit()` |
| `/residents-and-households/register-business` | `AddBusiness.jsx` | `BusinessesController::registerBusiness()` |
| `/residents-and-households/edit-business/{id}` | `EditBusiness.jsx` (Admin/) | `BusinessesController::edit()` |
| `/residents-and-households/add-social-service` | `AddSocialServices.jsx` | `SocialServiceController::addSocialService()` |
| `/residents-and-households/edit-social-service/{id}` | `EditSocialService.jsx` | `SocialServiceController::edit()` |
| `/residents-and-households/add-community-engagement` | `AddEvent.jsx` | `CommunityEngagementController::store()` |
| `/residents-and-households/edit-community-engagement/{id}` | `EditCommunityEngagement.jsx` | `CommunityEngagementController::edit()` |
| `/residents-and-households/deleted-datas` | `DeletedDatasPage.jsx` | `TrashController::showTrashedItems()` |

### 6.7 Audit Logs (`/audit-logs`)
**Controller:** `AuditLogController::index()`  
**Page:** `resources/js/Pages/Admin/AuditLogs.jsx`  
**Props:** `logs` (paginated, 50 per page)  
**⚠️ STATUS:** Page file was missing — needs to be created (code provided in chat history)

### 6.8 Backups (`/backups`)
**Controller:** `BackupController::index()`  
**Page:** `resources/js/Pages/Admin/Backups.jsx`  
**Features:** View all backups, trigger manual backup, download, delete

### 6.9 Change Password (Profile Dropdown)
**Route:** `GET/POST /password/change`  
**Controller:** `ChangePasswordController::show()` / `update()`  
**Page:** `resources/js/Pages/Auth/ChangePassword.jsx`  
**Props:** `forced` (boolean — true if `must_change_password = true`)  
**Behavior:**
- `forced = true`: No current_password field shown (new admin first login)
- `forced = false`: Requires current_password verification

---

## 7. SuperAdmin Functionalities

### 7.1 Manage Admins (`/superadmin/admins`)
**Controller:** `SuperAdminController::index()`  
**Page:** `resources/js/Pages/SuperAdmins/Admins/Index.jsx`  
**⚠️ NOTE:** Folder is `SuperAdmins` (with S), not `SuperAdmin`  
**Props:** `admins` array with `[id, name, email, role, is_active, must_change_password, created_at]`

**Actions available:**
- Deactivate admin (sets `is_active = false`)
- Activate admin (sets `is_active = true`)
- Reset password (sets new password + `must_change_password = true`)
- Delete admin (permanent)
- ⚠️ None of these work on other superadmins

### 7.2 Create Admin (`/superadmin/admins/create`)
**Controller:** `SuperAdminController::create()` / `store()`  
**Page:** `resources/js/Pages/SuperAdmins/Admins/Create.jsx`  
**Fields:** `name` (required), `email` (required, unique)  
**NO password field** — system auto-generates a secure temp password  
**On submit:**
1. Auto-generates temp password: `Str::upper(random 4) + rand(100,999) + Str::lower(random 4) + '!'`
2. Creates user with `role=admin`, `is_active=true`, `must_change_password=true`
3. Sends welcome email to admin with temp credentials
4. Logs `admin_created` to audit_logs
5. Redirects to `/superadmin/admins` with success flash

### 7.3 New Admin First Login Flow
```
SuperAdmin creates admin → email sent with temp password
Admin logs in with temp password
    → Password correct ✅
    → 2FA: OTP sent (first login, 2fa_verified_at = NULL)
    → Admin enters OTP ✅
    → must_change_password = true → redirect to /password/change
    → Admin sets strong new password
    → must_change_password = false → redirect to /dashboard ✅
```

### 7.4 Admin Welcome Email
**Template:** `resources/views/emails/admin-welcome.blade.php`  
**Variables:**
```php
$name              // admin's name
$email             // admin's email
$temporaryPassword // auto-generated temp password
$loginUrl          // url('/login')
```

---

## 8. File Structure Reference

```
app/
├── Console/Commands/
│   ├── BackupDatabase.php          -- php artisan backup:database
│   ├── DecryptBackup.php           -- php artisan backup:decrypt <file>
│   ├── GenerateBackupKey.php       -- php artisan backup:generate-key
│   └── ListBackups.php             -- php artisan backup:list
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── AuthController.php           -- login(), logout()
│   │   │   └── TwoFactorAuthController.php  -- show(), verify(), resend()
│   │   ├── AddResidentController.php        -- addResident()
│   │   ├── AuditLogController.php           -- index()
│   │   ├── BackupController.php             -- index(), runNow(), download(), destroy()
│   │   ├── BusinessesController.php         -- registerBusiness(), edit(), update(), destroy(), restore()
│   │   ├── ChangePasswordController.php     -- show(), update()
│   │   ├── CommunityEngagementController.php
│   │   ├── ForgotPasswordController.php     -- show(), send(), showVerify(), verify(), showReset(), reset()
│   │   ├── ResidentController.php           -- index(), DemographicProfile(), SocialActivities(), EconomicActivities(), allData(), edit(), updateResident(), destroy(), restore()
│   │   ├── SocialServiceController.php
│   │   ├── SuperAdminController.php         -- index(), create(), store(), deactivate(), activate(), destroy(), resetPassword()
│   │   └── TrashController.php              -- showTrashedItems()
│   └── Middleware/
│       ├── Check2fa.php                     -- blocks if 2fa_verified_at is NULL
│       ├── CheckMustChangePassword.php      -- blocks if must_change_password is true
│       ├── CheckSessionTimeout.php          -- session idle tracking
│       ├── HandleInertiaRequests.php        -- shares auth.user to all Inertia pages
│       └── RoleMiddleware.php               -- checks user role (superadmin bypasses all)
├── Models/
│   ├── AuditLog.php
│   ├── Businesses.php               -- ⚠️ Model is named 'Businesses' not 'Business'
│   ├── CommunityEngagement.php
│   ├── Resident.php
│   ├── SocialService.php
│   └── User.php
└── Services/
    ├── AuditLogService.php          -- static log($action, $model, $modelId, $changes)
    └── TwoFactorService.php         -- generateCode(), sendCode(), verifyCode(), hasVerifiedBefore()

database/migrations/
├── 2025_02_15_000001_add_2fa_to_users.php       -- two_factor_code, two_factor_expires_at, 2fa_verified_at
├── 2026_02_25_000001_create_audit_logs_table.php
├── 2026_02_25_200000_add_is_active_to_users.php
└── 2026_02_26_000001_add_must_change_password_to_users.php

resources/
├── js/
│   ├── app.jsx                      -- Inertia setup, resolves Pages/**/*.jsx
│   ├── Components/
│   │   ├── CalendarComponent.jsx
│   │   ├── Card.jsx
│   │   ├── HorizontalBarChart.jsx
│   │   ├── LineChart.jsx
│   │   ├── Navbar.jsx
│   │   ├── PieChart.jsx
│   │   ├── Sidebar.jsx              -- Role-aware sidebar with profile dropdown
│   │   ├── TableClientSideBlog.jsx
│   │   └── VerticalBarChart.jsx
│   ├── Layouts/
│   │   └── Layout.jsx               -- Main layout: Sidebar + Navbar + SessionTimeoutWarning
│   └── Pages/
│       ├── Admin/
│       │   ├── AuditLogs.jsx        -- ⚠️ Was missing, should now be created
│       │   ├── Backups.jsx
│       │   ├── CommunityEngagement.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DeletedDatasPage.jsx
│       │   ├── DemographicProfile.jsx
│       │   ├── EconomicActivities.jsx
│       │   ├── EditBusiness.jsx
│       │   ├── EditCommunityEngagement.jsx
│       │   ├── EditResident.jsx
│       │   ├── EditSocialService.jsx
│       │   ├── ResidentHousehold/
│       │   │   ├── AddBusiness.jsx
│       │   │   ├── AddEvent.jsx
│       │   │   ├── AddResident.jsx
│       │   │   ├── AddSocialServices.jsx
│       │   │   └── AllData.jsx
│       │   └── SocialServices.jsx
│       ├── Auth/
│       │   ├── ChangePassword.jsx   -- handles both forced + voluntary password change
│       │   ├── ForgotPassword.jsx   -- email entry
│       │   ├── ForgotPasswordReset.jsx  -- new password entry
│       │   ├── ForgotPasswordVerify.jsx -- 6-digit OTP entry
│       │   └── TwoFactorVerify.jsx  -- 6-digit OTP for login
│       ├── Login/
│       │   └── Login.jsx            -- ⚠️ File is at Login/Login.jsx NOT Auth/Login.jsx
│       └── SuperAdmins/             -- ⚠️ Folder is SuperAdmins (with S)
│           └── Admins/
│               ├── Create.jsx
│               └── Index.jsx
└── views/emails/
    ├── admin-welcome.blade.php      -- sent when SuperAdmin creates admin account
    ├── forgot-password-otp.blade.php -- sent for forgot password flow
    └── two-factor-code.blade.php    -- sent for 2FA login OTP

routes/
├── web.php                          -- all routes
└── auth.php                         -- required at bottom of web.php

bootstrap/
└── app.php                          -- middleware aliases, scheduler registration
```

---

## 9. All Controllers — Methods & Variables

### `AuthController`
```php
// GET /login
public function index(): Response
// Returns: Inertia::render('Login/Login')

// POST /login
public function login(Request $request): RedirectResponse
// Validates: email, password, captcha_token
// Checks: captcha API, credentials, is_active, 2fa_verified_at
// Logs: 'login', 'login_failed', 'login_blocked_inactive', '2fa_triggered'
// Redirects:
//   → /2fa/verify (if 2fa_verified_at is null)
//   → /superadmin/admins (if superadmin, after 2FA)
//   → /dashboard (if admin, after 2FA)

// POST /logout
public function logout(Request $request): RedirectResponse
// Auth::logout(), invalidate session, regenerateToken
// Logs: 'logout'
// Redirects: /login
```

### `TwoFactorAuthController`
```php
// GET /2fa/verify
public function show(): Response
// Returns: Inertia::render('Auth/TwoFactorVerify')

// POST /2fa/verify
public function verify(Request $request): RedirectResponse
// Validates: code (required, size:6)
// Uses: TwoFactorService::verifyCode($user, $request->code)
// On success: sets 2fa_verified_at = now()
// Redirects: /dashboard or /superadmin/admins based on role

// POST /2fa/resend
public function resend(Request $request): RedirectResponse
// Uses: TwoFactorService::generateCode() + sendCode()
// Redirects back with success message
```

### `ForgotPasswordController`
```php
public function show(): Response          // GET /forgot-password
public function send(Request $request)    // POST /forgot-password
  // Validates: email (exists in users)
  // Generates OTP, saves hashed to two_factor_code
  // Sends email via Mail::send('emails.forgot-password-otp')
  // Sets session('reset_email')

public function showVerify(): Response    // GET /forgot-password/verify
  // Guards: session('reset_email') must exist

public function verify(Request $request)  // POST /forgot-password/verify
  // Validates OTP against two_factor_code + expiry
  // Sets session('reset_verified', true)

public function showReset(): Response     // GET /forgot-password/reset
  // Guards: session('reset_email') + session('reset_verified')

public function reset(Request $request)   // POST /forgot-password/reset
  // Validates password strength
  // Checks not same as current password
  // Saves new password, clears OTP, sets must_change_password = false
  // Clears session, redirects to /login
```

### `ChangePasswordController`
```php
// GET /password/change
public function show(): Response
// Props: forced = Auth::user()->must_change_password (boolean)
// Returns: Inertia::render('Auth/ChangePassword', ['forced' => $forced])

// POST /password/change
public function update(Request $request): RedirectResponse
// If forced=true: no current_password required
// If forced=false: validates current_password, checks Hash::check()
// Validates new password strength (8 chars, uppercase, number, special char)
// Prevents password reuse
// Sets must_change_password = false
// Logs 'password_changed'
// Redirects: /superadmin/admins (superadmin) or /dashboard (admin)
```

### `SuperAdminController`
```php
// GET /superadmin/admins
public function index(): Response
// Props: admins = User::where role admin or superadmin, mapped to array

// GET /superadmin/admins/create
public function create(): Response

// POST /superadmin/admins
public function store(Request $request): RedirectResponse
// Validates: name (required), email (required, unique)
// Auto-generates temp password (no password field in form)
// Creates user: role=admin, is_active=true, must_change_password=true
// Sends Mail::send('emails.admin-welcome', [...])
// Logs 'admin_created'

// PATCH /superadmin/admins/{id}/deactivate
public function deactivate($id): RedirectResponse
// Guards: cannot deactivate superadmin role
// Sets is_active = false
// Logs 'admin_deactivated'

// PATCH /superadmin/admins/{id}/activate
public function activate($id): RedirectResponse
// Sets is_active = true
// Logs 'admin_activated'

// DELETE /superadmin/admins/{id}
public function destroy($id): RedirectResponse
// Guards: cannot delete superadmin role
// Logs 'admin_deleted'
// Deletes user

// PATCH /superadmin/admins/{id}/reset-password
public function resetPassword(Request $request, $id): RedirectResponse
// Validates: password (min:8, confirmed)
// Sets new password + must_change_password = true
// Logs 'admin_password_reset'
```

### `ResidentController`
```php
public function index()             // Dashboard with all chart data
public function DemographicProfile()
public function SocialActivities()  // ⚠️ Has SQLite bug — YEAR() → strftime()
public function EconomicActivities()
public function allData()           // Residents & Other Data page
public function edit($id)
public function updateResident(Request $request, Resident $resident)
public function destroy(Resident $resident)  // soft delete
public function restore($id)        // restore soft deleted

// Private helpers:
private function getPopulationData()
private function getAgeDistributionData()
private function getGenderData()
private function getEducationData()
private function getEmploymentRate()
private function getBusinessPopulationData()
private function getSocialServicesPopulationData()  // ⚠️ BUG: duplicate ->get()->get()
private function calculateGrowthRate($year)
private function calculateSocialServicesGrowthRate($year)
```

### `BackupController`
```php
public function index(): Response
// Lists all .sqlite.enc files from backups/ and backups_offline/

public function runNow(): RedirectResponse
// Calls: Artisan::call('backup:database')
// Logs 'backup_manual_trigger'

public function download(Request $request): BinaryFileResponse
// Validates filename (regex: /^backup_[\d_-]+\.sqlite\.enc$/)
// Type: primary or offline
// Logs 'backup_downloaded'

public function destroy(Request $request): RedirectResponse
// Validates filename
// Deletes from both locations if found
// Logs 'backup_deleted'
```

### `AuditLogController`
```php
public function index(): Response
// Returns: Inertia::render('Admin/AuditLogs', ['logs' => paginated 50/page])
```

---

## 10. All Middleware

### `RoleMiddleware` — `role:admin` or `role:superadmin`
```php
// Registered as: 'role' in bootstrap/app.php
// SuperAdmin bypasses all role checks
// Usage: Route::middleware(['role:admin'])
```

### `Check2fa`
```php
// Registered as: '2fa' in bootstrap/app.php
// Blocks request if user's 2fa_verified_at is NULL
// Allows through: 2fa.show, 2fa.verify, 2fa.resend routes
// Uses: TwoFactorService::hasVerifiedBefore($user)
```

### `CheckMustChangePassword`
```php
// Registered as: 'must.change.password' in bootstrap/app.php
// Blocks request if user's must_change_password = true
// Allows through: password.change, password.update routes
// Redirects to: /password/change
```

### `CheckSessionTimeout`
```php
// In web middleware group
// Tracks session('last_activity') timestamp
// Logs out user if idle > SESSION_LIFETIME
```

### `HandleInertiaRequests`
```php
// CRITICAL: Must share auth.user for sidebar to work
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
                'role'  => $request->user()->role,
            ] : null,
        ],
        'flash' => [
            'success' => session('success'),
            'error'   => session('error'),
        ],
    ]);
}
```

**bootstrap/app.php middleware aliases:**
```php
$middleware->alias([
    'role'                 => \App\Http\Middleware\RoleMiddleware::class,
    '2fa'                  => \App\Http\Middleware\Check2fa::class,
    'must.change.password' => \App\Http\Middleware\CheckMustChangePassword::class,
]);
```

---

## 11. All Services

### `TwoFactorService`
```php
public function generateCode(User $user): string
// Generates 6-digit OTP, saves bcrypt hash to two_factor_code
// Sets two_factor_expires_at = now()->addMinutes(10)
// Returns plain OTP string

public function sendCode(User $user, string $code): void
// Sends email via Mail::send('emails.two-factor-code', ...)

public function verifyCode(User $user, string $code): bool
// Checks Hash::check($code, $user->two_factor_code)
// Checks now() < two_factor_expires_at
// Returns true/false

public function hasVerifiedBefore(User $user): bool
// Returns: $user->{'2fa_verified_at'} !== null
// ⚠️ NOTE: column name is '2fa_verified_at' (with leading digit) — must use bracket notation
```

### `AuditLogService`
```php
public static function log(
    string $action,
    ?string $model = null,
    ?int $modelId = null,
    ?array $changes = null
): void
// Auto-captures from request: user_id, user_email, ip_address, user_agent
// Creates AuditLog record
// Usage: AuditLogService::log('created', 'Resident', $resident->id, $data);
```

---

## 12. All Models

### `User`
```php
protected $fillable = [
    'name', 'email', 'password', 'role', 'is_active',
    'must_change_password', 'two_factor_code',
    'two_factor_expires_at', '2fa_verified_at',
];
protected $hidden = ['password', 'remember_token', 'two_factor_code'];
protected $casts = [
    'two_factor_expires_at' => 'datetime',
    '2fa_verified_at'       => 'datetime',
    'is_active'             => 'boolean',
    'must_change_password'  => 'boolean',
];
```

### `Resident` — has soft deletes (`SoftDeletes` trait)
### `Businesses` — ⚠️ Model class is `Businesses` (plural), soft deletes
### `SocialService` — soft deletes
### `CommunityEngagement` — soft deletes
### `AuditLog` — no soft deletes

---

## 13. Frontend Pages Reference

### Layout system
All admin/superadmin pages **must** be wrapped in `<Layout page_title="...">`:
```jsx
import Layout from '@/Layouts/Layout';
const MyPage = ({ title }) => {
    return (
        <Layout page_title={title}>
            {/* page content */}
        </Layout>
    );
};
```
Without this wrapper, the sidebar disappears.

### Auth user in components
Access authenticated user via `usePage()`:
```jsx
import { usePage } from '@inertiajs/react';
const { props } = usePage();
const user = props.auth?.user;
const isSuperAdmin = user?.role === 'superadmin';
```
This works because `HandleInertiaRequests::share()` passes `auth.user`.

### Inertia page resolution
`app.jsx` resolves pages as `./Pages/${name}.jsx`:
```
'Login/Login'           → resources/js/Pages/Login/Login.jsx
'Auth/TwoFactorVerify'  → resources/js/Pages/Auth/TwoFactorVerify.jsx
'Admin/AuditLogs'       → resources/js/Pages/Admin/AuditLogs.jsx
'SuperAdmins/Admins/Index' → resources/js/Pages/SuperAdmins/Admins/Index.jsx
```
⚠️ Folder is `SuperAdmins` (with S) — Inertia::render() must match exactly.

### Logout
Use `router.post('/logout')` — NOT `<Link href="/logout">` which does GET and causes MethodNotAllowedHttpException:
```jsx
import { router } from '@inertiajs/react';
const handleLogout = () => router.post('/logout');
```

---

## 14. Routes Reference

```php
// PUBLIC (no auth)
GET  /login                     → AuthController::index()        'login'
POST /login                     → AuthController::login()
GET  /forgot-password           → ForgotPasswordController::show()
POST /forgot-password           → ForgotPasswordController::send()
GET  /forgot-password/verify    → ForgotPasswordController::showVerify()
POST /forgot-password/verify    → ForgotPasswordController::verify()
GET  /forgot-password/reset     → ForgotPasswordController::showReset()
POST /forgot-password/reset     → ForgotPasswordController::reset()

// AUTH ONLY
POST /logout                    → AuthController::logout()       'logout'

// AUTH + 2FA ONLY (no role check)
GET  /2fa/verify                → TwoFactorAuthController::show()   '2fa.show'
POST /2fa/verify                → TwoFactorAuthController::verify() '2fa.verify'
POST /2fa/resend                → TwoFactorAuthController::resend() '2fa.resend'
GET  /password/change           → ChangePasswordController::show()  'password.change'
POST /password/change           → ChangePasswordController::update() 'password.update'

// AUTH + 2FA + MUST_CHANGE_PASSWORD + ROLE:ADMIN
GET  /                          → ResidentController::index()
GET  /dashboard                 → ResidentController::index()        'dashboard'
GET  /demographic-profile       → ResidentController::DemographicProfile()
GET  /social-services           → ResidentController::SocialActivities()
GET  /economic-activities       → ResidentController::EconomicActivities()
GET  /community-engagement      → CommunityEngagementController::index()
GET  /audit-logs                → AuditLogController::index()
GET  /backups                   → BackupController::index()
POST /backups/run               → BackupController::runNow()
GET  /backups/download          → BackupController::download()
DELETE /backups/delete          → BackupController::destroy()
GET  /residents-and-households/resident      → ResidentController::allData()  'resident'
GET  /residents-and-households/deleted-datas → TrashController::showTrashedItems()
// ... all CRUD routes for residents, businesses, social services, community engagements

// AUTH + 2FA + MUST_CHANGE_PASSWORD + ROLE:SUPERADMIN
GET    /superadmin/admins                      → SuperAdminController::index()    'superadmin.admins'
GET    /superadmin/admins/create               → SuperAdminController::create()   'superadmin.admins.create'
POST   /superadmin/admins                      → SuperAdminController::store()    'superadmin.admins.store'
PATCH  /superadmin/admins/{id}/deactivate      → SuperAdminController::deactivate()
PATCH  /superadmin/admins/{id}/activate        → SuperAdminController::activate()
DELETE /superadmin/admins/{id}                 → SuperAdminController::destroy()
PATCH  /superadmin/admins/{id}/reset-password  → SuperAdminController::resetPassword()
```

---

## 15. Known Issues & Bugs

### BUG 1 — SQLite YEAR() incompatibility
**File:** `app/Http/Controllers/ResidentController.php`  
**Problem:** `YEAR(created_at)` is MySQL syntax. SQLite uses `strftime('%Y', created_at)`  
**Affected pages:** Social Services, possibly Demographic Profile, Economic Activities  
**Fix:**
```bash
sed -i '' "s/YEAR(created_at)/strftime('%Y', created_at)/g" app/Http/Controllers/ResidentController.php
```
Then manually check for any duplicate `->get()->get()` caused by previous sed attempts.

### BUG 2 — Duplicate `->get()` call
**File:** `app/Http/Controllers/ResidentController.php` around line 356  
**Problem:** Previous sed replacement added `->get()` but original chain already had one  
**Fix:** Find `->get()\n    ->get()\n    ->map(` and remove the duplicate `->get()`

### BUG 3 — Logout causes MethodNotAllowedHttpException
**Problem:** Old Sidebar used `<Link href={route('login')}>` for logout, which does GET /logout. Logout requires POST.  
**Fix:** Use `router.post('/logout')` in Sidebar.jsx (already fixed in new version)

### BUG 4 — AuditLogs page missing
**Problem:** `AuditLogController` renders `Admin/AuditLogs` but that JSX file did not exist  
**Fix:** Create `resources/js/Pages/Admin/AuditLogs.jsx` (full code provided in chat)

### BUG 5 — Inertia render path mismatch for Login
**Problem:** Controller had `Inertia::render('Auth/Login')` but file is at `Pages/Login/Login.jsx`  
**Fix:** Change to `Inertia::render('Login/Login')`

### BUG 6 — SuperAdmin folder name mismatch
**Problem:** Controller rendered `SuperAdmin/Admins/Index` but folder is `SuperAdmins/` (with S)  
**Fix:** Change to `Inertia::render('SuperAdmins/Admins/Index')` and `SuperAdmins/Admins/Create`

### BUG 7 — Change Password link missing from sidebar dropdown
**Problem:** The `<a>` tag for Change Password was pasted without its opening/closing brackets  
**Fix:** Ensure the profile dropdown contains a proper `<a href="/password/change">` tag

### BUG 8 — HandleInertiaRequests not sharing auth user
**Problem:** If `HandleInertiaRequests::share()` doesn't include `auth.user`, sidebar shows `?` instead of user name  
**Fix:** Add auth sharing to `share()` method (see middleware section above)

### BUG 9 — SuperAdmin pages lose sidebar
**Problem:** `SuperAdmins/Admins/Index.jsx` and `Create.jsx` don't use `<Layout>` wrapper  
**Fix:** Import and wrap both pages with `<Layout page_title="...">` 

---

## 16. Pending Features

### ✅ Completed
- [x] Password hashing (bcrypt)
- [x] CAPTCHA (reCAPTCHA v3)
- [x] Session timeout (middleware + frontend warning)
- [x] Two-Factor Authentication (email OTP, first login only)
- [x] Audit logging (all actions)
- [x] Daily encrypted backups (AES-256-CBC)
- [x] Offline backup copy
- [x] SuperAdmin role and admin management
- [x] Force password change for new admins
- [x] Auto-generated temp password + welcome email
- [x] Forgot password (OTP flow)
- [x] Change password (voluntary, from profile dropdown)
- [x] Role-aware sidebar (SuperAdmin vs Admin)
- [x] Clickable profile dropdown with user info

### ⚠️ Needs Verification/Fixing
- [ ] All YEAR() → strftime() replacements in ResidentController
- [ ] AuditLogs.jsx page created and working
- [ ] HandleInertiaRequests sharing auth.user correctly
- [ ] SuperAdmin pages wrapped in Layout
- [ ] Change Password link visible in sidebar dropdown
- [ ] Forgot password OTP email sending correctly

### 🔲 Not Yet Built (Recommendations)
- [ ] HTTPS/TLS in production
- [ ] Account lockout after N failed login attempts
- [ ] TOTP (Google Authenticator) as 2FA alternative
- [ ] Password expiry policy (90-day rotation)
- [ ] Off-site cloud backups (AWS S3 / Google Cloud)
- [ ] Real-time intrusion detection alerts
- [ ] Audit log export (CSV/PDF)
- [ ] Column-level PII encryption
- [ ] Concurrent session control (1 session per user)
- [ ] Profile page with editable name/email

---

## 17. Environment Variables

```env
APP_NAME="Barangay Profiling System"
APP_ENV=local
APP_KEY=                          # generate with: php artisan key:generate
APP_DEBUG=true                    # set false in production
APP_URL=http://localhost:8010

DB_CONNECTION=sqlite
# DB_DATABASE is auto-resolved to database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120              # minutes

BCRYPT_ROUNDS=12

# Google reCAPTCHA v3
VITE_CAPTCHA_SITE_KEY=            # public key (used in frontend)
CAPTCHA_SECRET_KEY=               # secret key (used in backend)

# Gmail SMTP
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=barangay.testcs14@gmail.com
MAIL_PASSWORD=dzzgmalugbirdfgj    # Gmail app password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=barangay.testcs14@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Backup encryption (generate with: php artisan backup:generate-key)
BACKUP_ENCRYPTION_KEY=            # base64-encoded 32-byte key
```

---

## 18. Seeded Accounts

```
SuperAdmin:
  Email:    barangay.testcs14@gmail.com
  Password: superadmin123
  Role:     superadmin
  2FA:      already verified (2fa_verified_at set)
  must_change_password: false

Admin:
  Email:    enjihomybeloved@gmail.com
  Password: admin123
  Role:     admin
  2FA:      already verified (2fa_verified_at set)
  must_change_password: false
```

**To create accounts in tinker:**
```php
php artisan tinker

User::create([
    'name' => 'Super Admin',
    'email' => 'barangay.testcs14@gmail.com',
    'password' => Hash::make('superadmin123'),
    'role' => 'superadmin',
    'is_active' => true,
    'must_change_password' => false,
]);

// Then skip 2FA:
User::where('email', 'barangay.testcs14@gmail.com')
    ->update(['2fa_verified_at' => now()]);
```

---

## 19. Key Commands

```bash
# Start development
php artisan serve --port=8010     # Terminal 1
npm run dev                        # Terminal 2

# Database
php artisan migrate                # Run pending migrations
php artisan migrate:rollback       # Undo last migration batch
php artisan db:seed --class=SuperAdminSeeder

# Cache clearing (run after config/route changes)
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Backups
php artisan backup:generate-key    # Generate encryption key → copy to .env
php artisan backup:database        # Run manual backup
php artisan backup:list            # List all backups
php artisan backup:decrypt <file> --output=<path>  # Decrypt a backup

# Tinker (interactive PHP console)
php artisan tinker

# Check all routes
php artisan route:list

# Create audit_logs table if migration shows as ran but table missing
# (run inside tinker):
Schema::create('audit_logs', function ($table) {
    $table->id();
    $table->unsignedBigInteger('user_id')->nullable();
    $table->string('user_email')->nullable();
    $table->string('action');
    $table->string('model')->nullable();
    $table->unsignedBigInteger('model_id')->nullable();
    $table->json('changes')->nullable();
    $table->string('ip_address')->nullable();
    $table->text('user_agent')->nullable();
    $table->timestamps();
});
```

---

*End of documentation. When starting a new chat, paste this entire file as context.*