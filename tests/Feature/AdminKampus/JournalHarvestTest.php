<?php

use App\Jobs\HarvestJournalArticlesJob;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seedRoles();
    Queue::fake();
});

it('can bulk harvest journals from same university', function () {
    $university = \App\Models\University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create();
    $journal1 = Journal::factory()->create([
        'university_id' => $university->id,
        'oai_pmh_url' => 'https://example.com/oai',
    ]);
    $journal2 = Journal::factory()->create([
        'university_id' => $university->id,
        'oai_pmh_url' => 'https://example.com/oai2',
    ]);

    actingAs($adminKampus)
        ->post(route('admin-kampus.journals.harvest.bulk'), [
            'journal_ids' => [$journal1->id, $journal2->id],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    Queue::assertPushedOn('harvesting', HarvestJournalArticlesJob::class, function ($job) use ($journal1) {
        return $job->journal->id === $journal1->id;
    });
    Queue::assertPushedOn('harvesting', HarvestJournalArticlesJob::class, function ($job) use ($journal2) {
        return $job->journal->id === $journal2->id;
    });
});

it('cannot bulk harvest journals from different university', function () {
    $university = \App\Models\University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create();
    // Create journal belonging to a different university
    $otherUniversity = \App\Models\University::factory()->create();
    $otherJournal = Journal::factory()->create([
        'university_id' => $otherUniversity->id,
        'oai_pmh_url' => 'https://example.com/oai',
    ]);

    $response = actingAs($adminKampus)
        ->post(route('admin-kampus.journals.harvest.bulk'), [
            'journal_ids' => [$otherJournal->id],
        ]);

    // Validation ensures that either the journal is ignored or throws an error.
    // Assuming policy handles this or they get filtered out, we just assert no job is dispatched.
    Queue::assertNotPushed(HarvestJournalArticlesJob::class);
});

it('fails validation on empty array', function () {
    $university = \App\Models\University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create();

    actingAs($adminKampus)
        ->post(route('admin-kampus.journals.harvest.bulk'), [
            'journal_ids' => [],
        ])
        ->assertSessionHasErrors(['journal_ids']);
});

it('fails validation on invalid ids', function () {
    $university = \App\Models\University::factory()->create();
    $adminKampus = User::factory()->adminKampus($university->id)->create();

    actingAs($adminKampus)
        ->post(route('admin-kampus.journals.harvest.bulk'), [
            'journal_ids' => [999999], // non-existent
        ])
        ->assertSessionHasErrors(['journal_ids.0']);
});
