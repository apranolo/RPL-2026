<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Alter table migration: contracts
 *
 * Adds columns specific to the Contract module (jobdesk: Gilang Ja'far Prasetya)
 * on top of the base contracts table created by Muhammad Naufal Afriza (PR #25).
 *
 * This migration is idempotent: it uses Schema::hasColumn() checks so it can
 * be re-run safely even if some columns were already added.
 *
 * Columns added:
 *   - pembinaan_registration_id  (nullable FK → pembinaan_registrations)
 *   - journal_id                 (nullable FK → journals)
 *   - terms                      (text, nullable) — contract body / syarat & ketentuan
 *   - contract_value             (bigInteger, nullable) — PRD Modul 3: total pendanaan disetujui
 *
 * @author GILANG JA'FAR PRASETYA
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // ── Relational links (contract lifecycle module) ────────────────

            if (! Schema::hasColumn('contracts', 'pembinaan_registration_id')) {
                $table->foreignId('pembinaan_registration_id')
                    ->nullable()
                    ->after('title')
                    ->constrained('pembinaan_registrations')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('contracts', 'journal_id')) {
                $table->foreignId('journal_id')
                    ->nullable()
                    ->after('pembinaan_registration_id')
                    ->constrained('journals')
                    ->nullOnDelete();
            }

            // ── Contract body ───────────────────────────────────────────────

            if (! Schema::hasColumn('contracts', 'terms')) {
                $table->text('terms')
                    ->nullable()
                    ->after('status')
                    ->comment('Syarat & ketentuan kontrak (free text / markdown)');
            }

            // ── Financial fields (PRD Modul 3 – Keuangan) ──────────────────

            if (! Schema::hasColumn('contracts', 'contract_value')) {
                $table->unsignedBigInteger('contract_value')
                    ->nullable()
                    ->after('terms')
                    ->comment('Total nilai / pendanaan kontrak yang disetujui (dalam Rupiah)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Drop foreign keys before dropping columns
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $foreignKeys = collect($sm->listTableForeignKeys('contracts'))
                ->map(fn ($fk) => $fk->getName());

            if ($foreignKeys->contains(fn ($name) => str_contains($name, 'pembinaan_registration_id'))) {
                $table->dropForeign(['pembinaan_registration_id']);
            }
            if ($foreignKeys->contains(fn ($name) => str_contains($name, 'journal_id'))) {
                $table->dropForeign(['journal_id']);
            }

            $columns = ['pembinaan_registration_id', 'journal_id', 'terms', 'contract_value'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('contracts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
