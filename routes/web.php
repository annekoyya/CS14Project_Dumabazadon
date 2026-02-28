<?php

use App\Http\Controllers\AddResidentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessesController;
use App\Http\Controllers\CommunityEngagementController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\SocialServiceController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\ChangePasswordController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Forgot Password (OTP flow)
Route::get('/forgot-password', [\App\Http\Controllers\ForgotPasswordController::class, 'show'])->name('forgot-password');
Route::post('/forgot-password', [\App\Http\Controllers\ForgotPasswordController::class, 'send'])->name('forgot-password.send');
Route::get('/forgot-password/verify', [\App\Http\Controllers\ForgotPasswordController::class, 'showVerify'])->name('forgot-password.verify');
Route::post('/forgot-password/verify', [\App\Http\Controllers\ForgotPasswordController::class, 'verify'])->name('forgot-password.verify.post');
Route::get('/forgot-password/reset', [\App\Http\Controllers\ForgotPasswordController::class, 'showReset'])->name('forgot-password.reset');
Route::post('/forgot-password/reset', [\App\Http\Controllers\ForgotPasswordController::class, 'reset'])->name('forgot-password.reset.post');

// Change Password (authenticated)
Route::middleware(['auth', '2fa'])->group(function () {
    Route::get('/password/change', [\App\Http\Controllers\ChangePasswordController::class, 'show'])->name('password.change');
    Route::post('/password/change', [\App\Http\Controllers\ChangePasswordController::class, 'update'])->name('password.update');
});

// ── Auth ──────────────────────────────────────────────────────────────────
Route::get('/login', [AuthController::class, 'index'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── 2FA ───────────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/2fa/verify', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'show'])->name('2fa.show');
    Route::post('/2fa/verify', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'verify'])->name('2fa.verify');
    Route::post('/2fa/resend', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'resend'])->name('2fa.resend');
});

// ── Force password change ─────────────────────────────────────────────────
Route::middleware(['auth', '2fa'])->group(function () {
    Route::get('/password/change', [ChangePasswordController::class, 'show'])->name('password.change');
    Route::post('/password/change', [ChangePasswordController::class, 'update'])->name('password.update');
});

// ── SuperAdmin ────────────────────────────────────────────────────────────
Route::middleware(['auth', '2fa', 'must.change.password', 'role:superadmin'])
    ->prefix('superadmin')
    ->group(function () {
        Route::get('/admins', [\App\Http\Controllers\SuperAdminController::class, 'index'])->name('superadmin.admins');
        Route::get('/admins/create', [\App\Http\Controllers\SuperAdminController::class, 'create'])->name('superadmin.admins.create');
        Route::post('/admins', [\App\Http\Controllers\SuperAdminController::class, 'store'])->name('superadmin.admins.store');
        Route::patch('/admins/{id}/deactivate', [\App\Http\Controllers\SuperAdminController::class, 'deactivate'])->name('superadmin.admins.deactivate');
        Route::patch('/admins/{id}/activate', [\App\Http\Controllers\SuperAdminController::class, 'activate'])->name('superadmin.admins.activate');
        Route::delete('/admins/{id}', [\App\Http\Controllers\SuperAdminController::class, 'destroy'])->name('superadmin.admins.destroy');
        Route::patch('/admins/{id}/reset-password', [\App\Http\Controllers\SuperAdminController::class, 'resetPassword'])->name('superadmin.admins.reset-password');
    });

// ── Protected routes ──────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {

    Route::get('/storage/avatars/{filename}', function ($filename) {
        return response()->file(storage_path('app/public/avatars/' . $filename));
    });

    // ── Admin routes ──────────────────────────────────────────────────────
    Route::middleware(['2fa', 'must.change.password', 'role:admin'])->group(function () {

        Route::get('/', [ResidentController::class, 'index']);
        Route::get('/dashboard', [ResidentController::class, 'index'])->name('dashboard');

        Route::get('/demographic-profile', [ResidentController::class, 'DemographicProfile'])->name('demographic-profile');
        Route::get('/social-services', [ResidentController::class, 'SocialActivities'])->name('social-services');
        Route::get('/economic-activities', [ResidentController::class, 'EconomicActivities'])->name('economic-activities');
        Route::get('/community-engagement', [CommunityEngagementController::class, 'index'])->name('community-engagement');

        Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('audit-logs');
        Route::get('/backups', [\App\Http\Controllers\BackupController::class, 'index'])->name('backups');
        Route::post('/backups/run', [\App\Http\Controllers\BackupController::class, 'runNow'])->name('backups.run');
        Route::get('/backups/download', [\App\Http\Controllers\BackupController::class, 'download'])->name('backups.download');
        Route::delete('/backups/delete', [\App\Http\Controllers\BackupController::class, 'destroy'])->name('backups.delete');

        Route::prefix('residents-and-households')->group(function () {
            Route::get('/register-resident', fn() => Inertia::render('Admin/ResidentHousehold/AddResident', ['title' => 'Add Resident']))->name('register-resident');
            Route::post('/register-resident', [AddResidentController::class, 'addResident'])->name('add-resident');
            Route::get('/edit-resident/{id}', [ResidentController::class, 'edit'])->name('edit-resident');
            Route::patch('/update-resident/{resident}', [ResidentController::class, 'updateResident'])->name('update-resident');
            Route::delete('/resident/{resident}', [ResidentController::class, 'destroy'])->name('delete-resident');
            Route::post('/restore-resident/{id}', [ResidentController::class, 'restore'])->name('restore-resident');

            Route::get('/register-business', fn() => Inertia::render('Admin/ResidentHousehold/AddBusiness', ['title' => 'Register Business']))->name('register-business');
            Route::post('/register-business', [BusinessesController::class, 'registerBusiness'])->name('register-business');
            Route::get('/edit-business/{id}', [BusinessesController::class, 'edit'])->name('edit-business');
            Route::patch('/update-business/{id}', [BusinessesController::class, 'update'])->name('update-business');
            Route::delete('/delete-business/{id}', [BusinessesController::class, 'destroy'])->name('delete-business');
            Route::post('/restore-business/{id}', [BusinessesController::class, 'restore'])->name('restore-business');

            Route::get('/add-social-service', [SocialServiceController::class, 'getSocialService'])->name('add-social-service');
            Route::post('/add-social-service', [SocialServiceController::class, 'addSocialService'])->name('add-social-service');
            Route::get('/edit-social-service/{id}', [SocialServiceController::class, 'edit'])->name('edit-social-service');
            Route::patch('/update-social-service/{id}', [SocialServiceController::class, 'update'])->name('update-social-service');
            Route::delete('/delete-social-service/{id}', [SocialServiceController::class, 'destroy'])->name('delete-social-service');
            Route::post('/restore-social-service/{id}', [SocialServiceController::class, 'restore'])->name('restore-social-service');

            Route::get('/add-community-engagement', fn() => Inertia::render('Admin/ResidentHousehold/AddEvent', ['title' => 'Add Event']))->name('add-event');
            Route::post('/add-community-engagement', [CommunityEngagementController::class, 'store'])->name('add-event');
            Route::get('/edit-community-engagement/{id}', [CommunityEngagementController::class, 'edit'])->name('edit-community-engagement');
            Route::patch('/update-community-engagement/{id}', [CommunityEngagementController::class, 'update'])->name('update-community-engagement');
            Route::delete('/delete-community-engagement/{id}', [CommunityEngagementController::class, 'destroy'])->name('delete-community-engagement');
            Route::post('/restore-community-engagement/{id}', [CommunityEngagementController::class, 'restore'])->name('restore-community-engagement');

            Route::get('/resident', [ResidentController::class, 'allData'])->name('resident');
            Route::get('/deleted-datas', [TrashController::class, 'showTrashedItems'])->name('deleted-datas');
        });

        Route::get('/residents-and-households/add-household', fn() => Inertia::render('Admin/ResidentHousehold/AddHousehold', ['title' => 'Add Household']))->name('add-household');
        Route::get('/reports-and-downloads', fn() => Inertia::render('Admin/ReportsAndDownloads', ['title' => 'Reports and Downloads']))->name('reports-and-downloads');
    });
});

require __DIR__ . '/auth.php';