<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable(); // Nullable for SSO users

            // SSO Fields
            $table->string('google_id')->nullable()->unique();
            $table->string('microsoft_id')->nullable()->unique();
            $table->string('avatar_url', 500)->nullable();

            // Profile
            $table->string('phone', 20)->nullable();
            $table->string('position', 100)->nullable(); // e.g., 'Lecturer', 'Researcher'

            // Role & Organization
            $table->foreignId('role_id')->constrained('roles')->restrictOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete(); // Nullable for super admins

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();

            // Remember Token
            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('role_id');
            $table->index('university_id');
            $table->index('email');
            $table->index('google_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
