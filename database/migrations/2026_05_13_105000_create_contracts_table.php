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
        if (! Schema::hasTable('contracts')) {
            Schema::create('contracts', function (Blueprint $table) {
                $table->id();
                $table->string('contract_number')->unique();

                // Core fields
                $table->string('title')->nullable();
                $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
                $table->foreignId('proposal_id')->nullable()->constrained('proposals')->nullOnDelete();

                // Dates
                $table->date('signed_at')->nullable();
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();

                // Status
                $table->string('status')->default('draft');

                // Contract body
                $table->text('terms')->nullable();
                $table->text('notes')->nullable();

                // Financial
                $table->unsignedBigInteger('contract_value')->nullable();

                // Audit trail
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

                $table->softDeletes();
                $table->timestamps();
            });
        } else {
            // Ensure all columns exist for existing tables
            Schema::table('contracts', function (Blueprint $table) {
                if (! Schema::hasColumn('contracts', 'title')) {
                    $table->string('title')->nullable()->after('contract_number');
                }
                if (! Schema::hasColumn('contracts', 'university_id')) {
                    $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
                }
                if (! Schema::hasColumn('contracts', 'proposal_id')) {
                    $table->foreignId('proposal_id')->nullable()->constrained('proposals')->nullOnDelete();
                }
                if (! Schema::hasColumn('contracts', 'signed_at')) {
                    $table->date('signed_at')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'start_date')) {
                    $table->date('start_date')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'end_date')) {
                    $table->date('end_date')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'status')) {
                    $table->string('status')->default('draft');
                }
                if (! Schema::hasColumn('contracts', 'terms')) {
                    $table->text('terms')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'notes')) {
                    $table->text('notes')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'contract_value')) {
                    $table->unsignedBigInteger('contract_value')->nullable();
                }
                if (! Schema::hasColumn('contracts', 'created_by')) {
                    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('contracts', 'updated_by')) {
                    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('contracts', 'deleted_by')) {
                    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('contracts', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
