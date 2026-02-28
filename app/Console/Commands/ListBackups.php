<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;

class ListBackups extends Command
{
    protected $signature   = 'backup:list';
    protected $description = 'List all available database backups';

    public function handle(): int
    {
        $dirs = [
            'Primary'      => storage_path('app/backups'),
            'Offline Copy' => storage_path('app/backups_offline'),
        ];

        foreach ($dirs as $label => $dir) {
            $this->info("\n── {$label}: {$dir}");

            if (!is_dir($dir)) {
                $this->warn("   Directory does not exist yet.");
                continue;
            }

            $files = glob("{$dir}/backup_*.sqlite") ?: [];

            if (empty($files)) {
                $this->warn("   No backups found.");
                continue;
            }

            $rows = [];
            foreach ($files as $file) {
                $size    = round(filesize($file) / 1024, 2);
                $modified = Carbon::createFromTimestamp(filemtime($file))->format('Y-m-d H:i:s');
                $rows[]  = [basename($file), "{$size} KB", $modified];
            }

            $this->table(['Filename', 'Size', 'Created At'], $rows);
        }

        return self::SUCCESS;
    }
}