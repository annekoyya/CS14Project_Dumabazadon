<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'must_change_password',
        'two_factor_code',
        'two_factor_expires_at',
        '2fa_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected $casts = [
        'two_factor_expires_at'  => 'datetime',
        '2fa_verified_at'        => 'datetime',
        'is_active'              => 'boolean',
        'must_change_password'   => 'boolean',
    ];
}