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
        Schema::table('user_roles', function (Blueprint $table) {
            // 1. Make role_id nullable
            $table->unsignedBigInteger('role_id')->nullable()->change();

            // 2. Add new columns
            $table->foreignId('id_journal')->nullable()->after('role_id')->constrained('journals')->nullOnDelete();
            $table->string('role_name')->nullable()->after('id_journal');
            $table->string('status')->default('Active')->after('role_name');

            // 3. Create new unique index
            $table->unique(['user_id', 'role_name', 'id_journal'], 'user_journal_role_unique');

            // 4. Add separate index on id_journal to optimize performance
            $table->index('id_journal', 'user_roles_id_journal_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete records with null role_id first to prevent rollback failure
        DB::table('user_roles')->whereNull('role_id')->delete();

        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropUnique('user_journal_role_unique');
            $table->dropForeign(['id_journal']);
            $table->dropIndex('user_roles_id_journal_index');
            $table->dropColumn(['id_journal', 'role_name', 'status']);
            $table->unsignedBigInteger('role_id')->nullable(false)->change();
        });
    }
};
