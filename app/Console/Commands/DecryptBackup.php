<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DecryptBackup extends Command
{
    protected $signature   = 'backup:decrypt {file : Path to the encrypted .sqlite.enc file} {--output= : Output path for decrypted file}';
    protected $description = 'Decrypt an encrypted database backup';

    public function handle(): int
    {
        $encryptedPath = $this->argument('file');
        $outputPath    = $this->option('output')
            ?? storage_path('app/backups/restored_' . now()->format('Y-m-d_H-i-s') . '.sqlite');

        if (!file_exists($encryptedPath)) {
            $this->error("File not found: {$encryptedPath}");
            return self::FAILURE;
        }

        $encoded = file_get_contents($encryptedPath);
        $data    = base64_decode($encoded);

        $cipher = 'AES-256-CBC';
        $ivLen  = openssl_cipher_iv_length($cipher);

        $iv         = substr($data, 0, $ivLen);
        $hmac       = substr($data, $ivLen, 32);
        $ciphertext = substr($data, $ivLen + 32);

        $key = $this->getEncryptionKey();

        // Verify HMAC integrity
        $expectedHmac = hash_hmac('sha256', $ciphertext, $key, true);
        if (!hash_equals($expectedHmac, $hmac)) {
            $this->error('Integrity check failed — backup may be corrupted or tampered with.');
            return self::FAILURE;
        }

        $plaintext = openssl_decrypt($ciphertext, $cipher, $key, OPENSSL_RAW_DATA, $iv);

        if ($plaintext === false) {
            $this->error('Decryption failed.');
            return self::FAILURE;
        }

        if (!file_exists(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        file_put_contents($outputPath, $plaintext);

        $this->info("Backup decrypted successfully to: {$outputPath}");
        return self::SUCCESS;
    }

    private function getEncryptionKey(): string
    {
        $key = env('BACKUP_ENCRYPTION_KEY');

        if (!$key) {
            throw new \RuntimeException('BACKUP_ENCRYPTION_KEY is not set in .env');
        }

        $decoded = base64_decode($key, true);
        return $decoded !== false ? $decoded : $key;
    }
}