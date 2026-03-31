<?php

namespace Tests\Feature\User;

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalFormFixTest extends TestCase
{
    use RefreshDatabase;

    protected $university;

    protected $user;

    protected $scientificField;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        $this->university = University::factory()->create();
        $this->user = User::factory()->user($this->university->id)->create([
            'is_active' => true,
        ]);
        $this->scientificField = ScientificField::factory()->create();
    }

    private function getValidJournalData(): array
    {
        return [
            'title' => 'Jurnal Teknologi Baru',
            'e_issn' => '1234-5678',
            'url' => 'https://jurnal.contoh.com',
            'frequency' => 'Bulanan',
            'scientific_field_id' => $this->scientificField->id,
            'sinta_rank' => 'non_sinta',
            'oai_urls' => ['https://jurnal.contoh.com/oai'],
        ];
    }

    public function test_scope_can_store_up_to_2500_characters()
    {
        $this->actingAs($this->user);

        $data = $this->getValidJournalData();
        $data['scope'] = str_repeat('A', 2500);

        $response = $this->post(route('user.journals.store'), $data);

        $response->assertRedirect(route('user.journals.index'));
        $this->assertDatabaseHas('journals', [
            'title' => 'Jurnal Teknologi Baru',
            'scope' => $data['scope'],
        ]);
    }

    public function test_scope_fails_if_exceeds_2500_characters()
    {
        $this->actingAs($this->user);

        $data = $this->getValidJournalData();
        $data['scope'] = str_repeat('B', 2501);

        $response = $this->post(route('user.journals.store'), $data);

        $response->assertSessionHasErrors(['scope']);
        $this->assertDatabaseMissing('journals', [
            'title' => 'Jurnal Teknologi Baru',
        ]);
    }

    public function test_first_published_year_can_be_string_and_stored_as_integer()
    {
        $this->actingAs($this->user);

        $data = $this->getValidJournalData();
        $data['first_published_year'] = '2018'; // Send as string

        $response = $this->post(route('user.journals.store'), $data);

        $response->assertRedirect(route('user.journals.index'));
        $journal = Journal::where('title', 'Jurnal Teknologi Baru')->first();
        $this->assertEquals(2018, $journal->first_published_year);
        $this->assertIsInt($journal->first_published_year);
    }

    public function test_accreditation_sk_date_today_local_timezone_is_accepted_in_store()
    {
        $this->actingAs($this->user);

        $data = $this->getValidJournalData();
        // Generate today's date in app timezone
        $localToday = now()->timezone(config('app.timezone'))->format('Y-m-d');
        $data['accreditation_sk_date'] = $localToday;

        $response = $this->post(route('user.journals.store'), $data);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('user.journals.index'));
        $this->assertDatabaseHas('journals', [
            'title' => 'Jurnal Teknologi Baru',
        ]);

        $journal = Journal::where('title', 'Jurnal Teknologi Baru')->first();
        $this->assertEquals($localToday, $journal->accreditation_sk_date->format('Y-m-d'));
    }

    public function test_accreditation_sk_date_today_local_timezone_is_accepted_in_update()
    {
        $this->actingAs($this->user);

        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $data = $this->getValidJournalData();
        // Generate today's date in app timezone
        $localToday = now()->timezone(config('app.timezone'))->format('Y-m-d');
        $data['accreditation_sk_date'] = $localToday;

        $response = $this->put(route('user.journals.update', $journal->id), $data);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('user.journals.index'));
        $this->assertEquals($localToday, $journal->fresh()->accreditation_sk_date->format('Y-m-d'));
    }

    public function test_accreditation_sk_date_is_updated_to_new_value_not_stuck_on_old_date()
    {
        $this->actingAs($this->user);

        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
            'accreditation_sk_date' => '2024-12-11',
        ]);

        $data = $this->getValidJournalData();
        $data['accreditation_sk_date'] = '2025-02-19';

        $response = $this->put(route('user.journals.update', $journal->id), $data);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('user.journals.index'));
        $this->assertEquals('2025-02-19', $journal->fresh()->accreditation_sk_date->format('Y-m-d'));
    }
}
