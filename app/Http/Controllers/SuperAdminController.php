<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Services\AuditLogService;

class SuperAdminController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')
            ->orWhere('role', 'superadmin')
            ->get()
            ->map(fn($user) => [
                'id'                  => $user->id,
                'name'                => $user->name,
                'email'               => $user->email,
                'role'                => $user->role,
                'is_active'           => $user->is_active,
                'must_change_password'=> $user->must_change_password,
                'created_at'          => $user->created_at->format('Y-m-d H:i:s'),
            ]);
// dd($admins); 
        return Inertia::render('SuperAdmin/Admins/Index', [
            'title'  => 'Admin Users',
            'admins' => $admins,
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Admins/Create', [
            'title' => 'Create Admin User',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
        ]);

        // Auto-generate a secure temporary password
        $temporaryPassword = Str::upper(Str::random(4))
            . rand(100, 999)
            . Str::lower(Str::random(4))
            . '!';

        $admin = User::create([
            'name'                => $request->name,
            'email'               => $request->email,
            'password'            => Hash::make($temporaryPassword),
            'role'                => 'admin',
            'is_active'           => true,
            'must_change_password'=> true,
        ]);

        // Send welcome email with credentials
        Mail::send('emails.admin-welcome', [
            'name'              => $admin->name,
            'email'             => $admin->email,
            'temporaryPassword' => $temporaryPassword,
            'loginUrl'          => url('/login'),
        ], function ($mail) use ($admin) {
            $mail->to($admin->email)
                 ->subject('Your Barangay Profiling System Admin Account');
        });

        AuditLogService::log('admin_created', 'User', $admin->id, [
            'name'  => $admin->name,
            'email' => $admin->email,
        ]);

        return redirect()->route('superadmin.admins')
            ->with('success', "Admin account created. Credentials sent to {$admin->email}.");
    }

    public function deactivate($id)
    {
        $admin = User::findOrFail($id);

        if ($admin->role === 'superadmin') {
            return back()->withErrors(['error' => 'Cannot deactivate a SuperAdmin.']);
        }

        $admin->is_active = false;
        $admin->save();

        AuditLogService::log('admin_deactivated', 'User', $id, ['email' => $admin->email]);

        return back()->with('success', 'Admin deactivated successfully.');
    }

    public function activate($id)
    {
        $admin = User::findOrFail($id);
        $admin->is_active = true;
        $admin->save();

        AuditLogService::log('admin_activated', 'User', $id, ['email' => $admin->email]);

        return back()->with('success', 'Admin activated successfully.');
    }

    public function destroy($id)
    {
        $admin = User::findOrFail($id);

        if ($admin->role === 'superadmin') {
            return back()->withErrors(['error' => 'Cannot delete a SuperAdmin.']);
        }

        AuditLogService::log('admin_deleted', 'User', $id, ['email' => $admin->email]);
        $admin->delete();

        return back()->with('success', 'Admin deleted successfully.');
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = User::findOrFail($id);
        $admin->password = Hash::make($request->password);
        $admin->must_change_password = true;
        $admin->save();

        AuditLogService::log('admin_password_reset', 'User', $id, ['email' => $admin->email]);

        return back()->with('success', 'Password reset successfully.');
    }
}