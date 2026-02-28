<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateBackupKey extends Command
{
    protected $signature   = 'backup:generate-key';
    protected $description = 'Generate a secure AES-256 encryption key for backups';

    public function handle(): int
    {
        $key    = openssl_random_pseudo_bytes(32); // 256 bits
        $encoded = base64_encode($key);

        $this->info('Generated backup encryption key:');
        $this->line('');
        $this->line("BACKUP_ENCRYPTION_KEY={$encoded}");
        $this->line('');
        $this->warn('Add this to your .env file and keep it safe.');
        $this->warn('Without this key, encrypted backups CANNOT be restored.');

        return self::SUCCESS;
    }
}