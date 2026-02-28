<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@barangay.gov.ph'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('SuperAdmin@1234'),
                'role'      => 'superadmin',
                'is_active' => true,
            ]
        );

        $this->command->info('SuperAdmin created: superadmin@barangay.gov.ph / SuperAdmin@1234');
        $this->command->warn('Change the password immediately after first login!');
    }
}