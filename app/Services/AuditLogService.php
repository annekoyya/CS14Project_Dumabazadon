<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    public static function log(
        string $action,
        ?string $model = null,
        ?int $modelId = null,
        ?array $changes = null
    ): void {
        $user = Auth::user();

        AuditLog::create([
            'user_id'    => $user?->id,
            'user_email' => $user?->email,
            'action'     => $action,
            'model'      => $model,
            'model_id'   => $modelId,
            'changes'    => $changes,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}