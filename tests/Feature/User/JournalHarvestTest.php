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

it('can trigger harvest for own journal', function () {
    $university = \App\Models\University::factory()->create();
    $user = User::factory()->user($university->id)->create();
    $journal = Journal::factory()->create([
        'user_id' => $user->id,
        'university_id' => $user->university_id,
        'oai_pmh_url' => 'https://example.com/oai',
    ]);

    actingAs($user)
        ->post(route('user.journals.harvest', $journal))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    Queue::assertPushedOn('harvesting', HarvestJournalArticlesJob::class, function ($job) use ($journal) {
        return $job->journal->id === $journal->id;
    });
});

it("cannot trigger harvest for someone else's journal", function () {
    $university = \App\Models\University::factory()->create();
    $user = User::factory()->user($university->id)->create();
    $university2 = \App\Models\University::factory()->create();
    $otherJournal = Journal::factory()->create([
        'university_id' => $university2->id,
        'oai_pmh_url' => 'https://example.com/oai',
    ]);

    actingAs($user)
        ->post(route('user.journals.harvest', $otherJournal))
        ->assertForbidden(); // Policy should block this

    Queue::assertNotPushed(HarvestJournalArticlesJob::class);
});

it('cannot trigger harvest if oai_pmh_url is missing', function () {
    $university = \App\Models\University::factory()->create();
    $user = User::factory()->user($university->id)->create();
    $journal = Journal::factory()->create([
        'user_id' => $user->id,
        'university_id' => $user->university_id,
        'oai_pmh_url' => '',
    ]);

    actingAs($user)
        ->post(route('user.journals.harvest', $journal))
        ->assertRedirect()
        ->assertSessionHas('error'); // Usually redirects with an error flash message

    Queue::assertNotPushed(HarvestJournalArticlesJob::class);
});
