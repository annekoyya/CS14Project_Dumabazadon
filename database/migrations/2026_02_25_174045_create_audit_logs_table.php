<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // null if not logged in
            $table->string('user_email')->nullable();
            $table->string('action');           // e.g. login, logout, created, updated, deleted, restored
            $table->string('model')->nullable(); // e.g. Resident, Business
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('changes')->nullable(); // before/after data for updates
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};