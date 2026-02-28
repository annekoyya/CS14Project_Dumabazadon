<?php

use App\Http\Controllers\Auth\TwoFactorAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/2fa/verify', [TwoFactorAuthController::class, 'show'])->name('2fa.show');
    Route::post('/2fa/verify', [TwoFactorAuthController::class, 'verify'])->name('2fa.verify');
    Route::post('/2fa/resend', [TwoFactorAuthController::class, 'resend'])->name('2fa.resend');
});