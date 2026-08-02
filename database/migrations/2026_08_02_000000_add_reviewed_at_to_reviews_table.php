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
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (! Schema::hasColumn('reviews', 'reviewed_at')) {
                    $table->timestamp('reviewed_at')->nullable()->after('recommendation');
                }
                if (! Schema::hasColumn('reviews', 'score')) {
                    $table->decimal('score', 5, 2)->default(0)->after('reviewer_id');
                }
                if (! Schema::hasColumn('reviews', 'feedback')) {
                    $table->text('feedback')->nullable()->after('score');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (Schema::hasColumn('reviews', 'reviewed_at')) {
                    $table->dropColumn('reviewed_at');
                }
                if (Schema::hasColumn('reviews', 'score')) {
                    $table->dropColumn('score');
                }
                if (Schema::hasColumn('reviews', 'feedback')) {
                    $table->dropColumn('feedback');
                }
            });
        }
    }
};
