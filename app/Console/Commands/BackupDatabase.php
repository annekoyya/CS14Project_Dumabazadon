<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AuditLogService;
use Carbon\Carbon;

class BackupDatabase extends Command
{
    protected $signature   = 'backup:database';
    protected $description = 'Backup and encrypt the SQLite database to local and offline storage';

    public function handle(): int
    {
        $dbPath    = database_path('database.sqlite');
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename  = "backup_{$timestamp}.sqlite.enc";

        if (!file_exists($dbPath)) {
            $this->error("SQLite database not found at: {$dbPath}");
            return self::FAILURE;
        }

        // ── Read & encrypt ────────────────────────────────────────────────
        $plaintext = file_get_contents($dbPath);

        if ($plaintext === false) {
            $this->error('Could not read database file.');
            return self::FAILURE;
        }

        $encrypted = $this->encrypt($plaintext);

        if ($encrypted === false) {
            $this->error('Encryption failed.');
            return self::FAILURE;
        }

        // ── Primary backup: storage/app/backups/ ──────────────────────────
        $primaryDir  = storage_path('app/backups');
        $primaryPath = "{$primaryDir}/{$filename}";

        if (!file_exists($primaryDir)) {
            mkdir($primaryDir, 0755, true);
        }

        if (file_put_contents($primaryPath, $encrypted) === false) {
            $this->error('Failed to write primary backup.');
            return self::FAILURE;
        }

        $this->info("Primary encrypted backup saved: {$primaryPath}");

        // ── Offline copy: storage/app/backups_offline/ ────────────────────
        $offlineDir  = storage_path('app/backups_offline');
        $offlinePath = "{$offlineDir}/{$filename}";

        if (!file_exists($offlineDir)) {
            mkdir($offlineDir, 0755, true);
        }

        if (file_put_contents($offlinePath, $encrypted) === false) {
            $this->warn('Primary backup succeeded but offline copy failed.');
        } else {
            $this->info("Offline encrypted copy saved: {$offlinePath}");
        }

        // ── Purge backups older than 30 days ──────────────────────────────
        $this->purgeOldBackups($primaryDir);
        $this->purgeOldBackups($offlineDir);

        // ── Audit log ─────────────────────────────────────────────────────
        AuditLogService::log('backup_created', null, null, [
            'filename'     => $filename,
            'encrypted'    => true,
            'primary'      => $primaryPath,
            'offline_copy' => $offlinePath,
        ]);

        $this->info('Encrypted backup completed successfully.');
        return self::SUCCESS;
    }

    private function encrypt(string $plaintext): string|false
    {
        $key    = $this->getEncryptionKey();
        $cipher = 'AES-256-CBC';
        $ivLen  = openssl_cipher_iv_length($cipher);
        $iv     = openssl_random_pseudo_bytes($ivLen);

        $ciphertext = openssl_encrypt($plaintext, $cipher, $key, OPENSSL_RAW_DATA, $iv);

        if ($ciphertext === false) {
            return false;
        }

        // Prepend IV to ciphertext so we can decrypt later
        // Format: [IV (16 bytes)][HMAC (32 bytes)][ciphertext]
        $hmac = hash_hmac('sha256', $ciphertext, $key, true);

        return base64_encode($iv . $hmac . $ciphertext);
    }

    private function getEncryptionKey(): string
    {
        $key = env('BACKUP_ENCRYPTION_KEY');

        if (!$key) {
            throw new \RuntimeException(
                'BACKUP_ENCRYPTION_KEY is not set in .env — run: php artisan backup:generate-key'
            );
        }

        // Decode if stored as base64
        $decoded = base64_decode($key, true);
        return $decoded !== false ? $decoded : $key;
    }

    private function purgeOldBackups(string $directory): void
    {
        if (!is_dir($directory)) {
            return;
        }

        $cutoff = Carbon::now()->subDays(30)->timestamp;
        $files  = glob("{$directory}/backup_*.sqlite.enc") ?: [];

        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
                $this->info("Purged old backup: " . basename($file));
            }
        }
    }
}