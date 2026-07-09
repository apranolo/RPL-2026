<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviewer_assignments', function (Blueprint $table) {
            $table->string('reason')->nullable()->after('status');
            $table->timestamp('responded_at')->nullable()->after('assigned_at');
            // We shouldn't change the enum easily, maybe DB::statement is needed, but for SQLite it's not. Wait, the project might be MySQL. Let's just add the columns since the controller uses 'accepted' and 'declined'. Actually, if the enum restricts it, inserting will fail. Let's change the enum to string or modify it.
            // But wait, the existing enum already caused issues. Let's change it to string for simplicity.
        });
        
        // Change enum to include new statuses
        DB::statement("ALTER TABLE reviewer_assignments MODIFY COLUMN status ENUM('assigned', 'accepted', 'declined', 'in_progress', 'completed') DEFAULT 'assigned'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviewer_assignments', function (Blueprint $table) {
            $table->dropColumn(['reason', 'responded_at']);
        });
        
        DB::statement("ALTER TABLE reviewer_assignments MODIFY COLUMN status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned'");
    }
};
