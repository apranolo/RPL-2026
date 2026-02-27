<?php

namespace Tests;

use App\Models\Journal;
use App\Models\Role;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed roles for testing.
     * This is required because many tests use User::factory() which needs roles to exist.
     */
    protected function seedRoles(): void
    {
        Role::create([
            'name' => Role::SUPER_ADMIN,
            'display_name' => 'Super Administrator',
            'description' => 'Super Administrator with full access',
        ]);

        Role::create([
            'name' => Role::ADMIN_KAMPUS,
            'display_name' => 'Administrator Kampus',
            'description' => 'University Administrator',
        ]);

        Role::create([
            'name' => Role::USER,
            'display_name' => 'Pengelola Jurnal',
            'description' => 'Journal Manager',
        ]);
    }

    /**
     * Seed realistic statistics test data.
     * Creates universities, scientific fields, users, and journals with representative distributions.
     *
     * @param  int  $universitiesCount  Number of universities to create
     * @param  int  $journalsPerUniversity  Average journals per university
     * @return array{universities: \Illuminate\Support\Collection, fields: \Illuminate\Support\Collection, users: \Illuminate\Support\Collection}
     */
    protected function seedStatisticsTestData(int $universitiesCount = 3, int $journalsPerUniversity = 30): array
    {
        $this->seedRoles();

        // Create scientific fields
        $fields = collect([
            ScientificField::factory()->create(['name' => 'Teknik dan Teknologi']),
            ScientificField::factory()->create(['name' => 'Ilmu Kesehatan']),
            ScientificField::factory()->create(['name' => 'Ekonomi dan Bisnis']),
            ScientificField::factory()->create(['name' => 'Ilmu Sosial dan Humaniora']),
            ScientificField::factory()->create(['name' => 'Matematika dan Ilmu Pengetahuan Alam']),
        ]);

        // Create universities with users and journals
        $universities = collect();
        $users = collect();

        for ($i = 1; $i <= $universitiesCount; $i++) {
            $university = University::factory()->create([
                'name' => "Universitas Test {$i}",
            ]);
            $universities->push($university);

            // Create admin kampus for university
            $adminKampus = User::factory()->adminKampus()->create([
                'university_id' => $university->id,
                'name' => "Admin Kampus {$i}",
            ]);
            $users->push($adminKampus);

            // Create regular users for university
            for ($j = 1; $j <= 3; $j++) {
                $user = User::factory()->user()->create([
                    'university_id' => $university->id,
                    'name' => "User {$i}-{$j}",
                ]);
                $users->push($user);

                // Create journals for user with distribution:
                // - 40% Scopus indexed
                // - 30% other platforms only
                // - 30% no indexation
                // - 50% SINTA accredited (ranks 1-6)
                // - Scientific fields distributed evenly

                $journalsForUser = (int) ($journalsPerUniversity / 3);

                for ($k = 0; $k < $journalsForUser; $k++) {
                    $field = $fields->random();
                    $rand = rand(1, 100);

                    $journal = Journal::factory()->create([
                        'user_id' => $user->id,
                        'university_id' => $university->id,
                        'scientific_field_id' => $field->id,
                        'title' => "Journal {$i}-{$j}-{$k}",
                    ]);

                    // Set indexations
                    $indexations = [];
                    if ($rand <= 40) {
                        // Scopus indexed (often with other platforms)
                        $indexations['Scopus'] = true;
                        if (rand(1, 100) <= 70) {
                            $indexations['Google Scholar'] = true;
                        }
                    } elseif ($rand <= 70) {
                        // Other platforms only
                        $platforms = ['Google Scholar', 'DOAJ', 'Web of Science'];
                        $selectedPlatforms = array_rand(array_flip($platforms), rand(1, 2));
                        foreach ((array) $selectedPlatforms as $platform) {
                            $indexations[$platform] = true;
                        }
                    }
                    // else: no indexation (30%)

                    // Set SINTA rank
                    $sintaRank = null;
                    if (rand(1, 100) <= 50) {
                        // Distribution: SINTA 1 (5%), 2 (10%), 3 (15%), 4 (30%), 5 (25%), 6 (15%)
                        $sintaDistribution = [1 => 5, 2 => 10, 3 => 15, 4 => 30, 5 => 25, 6 => 15];
                        $roll = rand(1, 100);
                        $cumulative = 0;

                        foreach ($sintaDistribution as $rank => $percentage) {
                            $cumulative += $percentage;
                            if ($roll <= $cumulative) {
                                $sintaRank = (string) $rank;
                                break;
                            }
                        }
                    }

                    $journal->update([
                        'indexations' => ! empty($indexations) ? $indexations : null,
                        'sinta_rank' => $sintaRank,
                    ]);
                }
            }
        }

        return [
            'universities' => $universities,
            'fields' => $fields,
            'users' => $users,
        ];
    }
}
