<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'status')) {
                $table->string('status')->default('pending');
            }
            if (! Schema::hasColumn('reviews', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (! Schema::hasColumn('reviews', 'start_date')) {
                $table->timestamp('start_date')->nullable();
            }
            if (! Schema::hasColumn('reviews', 'end_date')) {
                $table->timestamp('end_date')->nullable();
            }
            if (! Schema::hasColumn('reviews', 'total_score')) {
                $table->decimal('total_score', 8, 2)->unsigned()->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['status', 'notes', 'start_date', 'end_date', 'total_score']);
        });
    }
};
