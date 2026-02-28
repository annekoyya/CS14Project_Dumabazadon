<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Artisan;
class BackupController extends Controller
{
    public function index()
    {
        $dirs = [
            'primary' => storage_path('app/backups'),
            'offline' => storage_path('app/backups_offline'),
        ];

        $backups = [];

        foreach ($dirs as $type => $dir) {
            $files = is_dir($dir) ? (glob("{$dir}/backup_*.sqlite.enc") ?: []) : [];

            foreach ($files as $file) {
                $backups[] = [
                    'filename'   => basename($file),
                    'type'       => $type,
                    'encrypted'  => true,
                    'size_kb'    => round(filesize($file) / 1024, 2),
                    'created_at' => Carbon::createFromTimestamp(filemtime($file))->format('Y-m-d H:i:s'),
                ];
            }
        }

        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return Inertia::render('Admin/Backups', [
            'title'   => 'Database Backups',
            'backups' => $backups,
        ]);
    }

    public function runNow()
    {
        Artisan::call('backup:database');

        AuditLogService::log('backup_manual_trigger');

        return back()->with('success', 'Encrypted backup completed successfully.');
    }

    public function download(Request $request)
    {
        $request->validate([
            'filename' => ['required', 'string', 'regex:/^backup_[\d_-]+\.sqlite\.enc$/'],
            'type'     => ['required', 'in:primary,offline'],
        ]);

        $dir  = $request->type === 'offline'
            ? storage_path('app/backups_offline')
            : storage_path('app/backups');

        $path = "{$dir}/{$request->filename}";

        if (!file_exists($path)) {
            abort(404, 'Backup file not found.');
        }

        AuditLogService::log('backup_downloaded', null, null, [
            'filename' => $request->filename,
            'type'     => $request->type,
        ]);

        return response()->download($path, $request->filename, [
            'Content-Type'        => 'application/octet-stream',
            'Content-Disposition' => "attachment; filename=\"{$request->filename}\"",
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'filename' => ['required', 'string', 'regex:/^backup_[\d_-]+\.sqlite\.enc$/'],
            'type'     => ['required', 'in:primary,offline'],
        ]);

        $dir  = $request->type === 'offline'
            ? storage_path('app/backups_offline')
            : storage_path('app/backups');

        $path = "{$dir}/{$request->filename}";

        if (!file_exists($path)) {
            abort(404, 'Backup file not found.');
        }

        unlink($path);

        AuditLogService::log('backup_deleted', null, null, [
            'filename' => $request->filename,
            'type'     => $request->type,
        ]);

        return back()->with('success', 'Backup deleted successfully.');
    }
}