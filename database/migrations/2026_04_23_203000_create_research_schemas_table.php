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
        if (! Schema::hasTable('research_schemas')) {
            Schema::create('research_schemas', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // schema_name
                $table->text('description')->nullable();
                $table->decimal('max_funding', 15, 2)->default(0); // Pagu dana maksimal
                $table->boolean('is_active')->default(true); // Status keaktifan skema
                $table->timestamps();
            });
        } else {
            Schema::table('research_schemas', function (Blueprint $table) {
                if (! Schema::hasColumn('research_schemas', 'max_funding')) {
                    $table->decimal('max_funding', 15, 2)->default(0)->after('description');
                }
                if (! Schema::hasColumn('research_schemas', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('max_funding');
                }
            });
>>>>>>> 725b339aa70cfd2cdba61ece528275e2de962698
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe down migration
    }
};
