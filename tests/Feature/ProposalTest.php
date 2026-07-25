<?php

namespace Tests\Feature;

use App\Models\Proposal;
use App\Models\ProposalDocument;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProposalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    protected function createUserWithRole(string $roleName = Role::USER): User
    {
        $role = Role::firstOrCreate(['name' => $roleName], ['display_name' => $roleName]);

        /** @var User $user */
        $user = User::factory()->create(['role_id' => $role->id]);

        return $user;
    }

    /**
     * Menguji pengguna terautentikasi dapat mengakses halaman daftar proposal.
     */
    public function test_user_can_access_proposal_index_page()
    {
        $user = $this->createUserWithRole(Role::USER);

        $response = $this->actingAs($user)->get(route('proposal.index'));

        $response->assertStatus(200);
    }

    /**
     * Menguji pengguna terautentikasi dapat mengakses halaman pengajuan proposal baru.
     */
    public function test_user_can_access_create_proposal_page()
    {
        $user = $this->createUserWithRole(Role::USER);

        $response = $this->actingAs($user)->get(route('proposal.create'));

        $response->assertStatus(200);
    }

    /**
     * Menguji pengguna dapat menyimpan proposal penelitian baru.
     */
    public function test_user_can_store_proposal()
    {
        Storage::fake('public');

        $user = $this->createUserWithRole(Role::USER);
        $schema = ResearchSchema::factory()->create(['is_active' => true]);

        $file = UploadedFile::fake()->create('proposal.pdf', 500, 'application/pdf');

        $data = [
            'title' => 'Proposal Penelitian Baru',
            'description' => 'Deskripsi proposal penelitian baru.',
            'research_schema_id' => $schema->id,
            'action' => 'submit',
            'file_dokumen_proposal' => $file,
        ];

        $response = $this->actingAs($user)->post(route('proposal.store'), $data);

        $response->assertRedirect(route('proposal.index'));

        $this->assertDatabaseHas('proposals', [
            'title' => 'Proposal Penelitian Baru',
            'user_id' => $user->id,
            'research_schema_id' => $schema->id,
            'status_proposal' => Proposal::STATUS_SUBMITTED,
        ]);
    }

    /**
     * Menguji Dosen dapat menyimpan proposal sebagai Draf tanpa mengunggah file PDF.
     */
    public function test_user_can_store_proposal_as_draft()
    {
        $user = $this->createUserWithRole(Role::USER);
        $schema = ResearchSchema::factory()->create(['is_active' => true]);

        $data = [
            'title' => 'Proposal Draf Baru',
            'description' => 'Deskripsi proposal draf tanpa dokumen.',
            'research_schema_id' => $schema->id,
            'action' => 'draft',
        ];

        $response = $this->actingAs($user)->post(route('proposal.store'), $data);

        $response->assertRedirect(route('proposal.index'));

        $this->assertDatabaseHas('proposals', [
            'title' => 'Proposal Draf Baru',
            'user_id' => $user->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
            'file_dokumen_proposal' => null,
        ]);
    }

    /**
     * Menguji Dosen dapat mempublikasikan (mengirim) proposal dari Draf menjadi Submitted.
     */
    public function test_user_can_publish_draft_proposal()
    {
        Storage::fake('public');

        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $file = UploadedFile::fake()->create('proposal_final.pdf', 500, 'application/pdf');

        $updateData = [
            'title' => 'Proposal Dipublikasikan',
            'description' => 'Deskripsi proposal yang telah dilengkapi.',
            'action' => 'submit',
            'file_dokumen_proposal' => $file,
        ];

        $response = $this->actingAs($user)->put(route('proposal.update', $proposal), $updateData);

        $response->assertRedirect(route('proposal.index'));

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'title' => 'Proposal Dipublikasikan',
            'status_proposal' => Proposal::STATUS_SUBMITTED,
        ]);
    }

    /**
     * Menguji pemilik dapat melihat halaman detail proposal.
     */
    public function test_user_can_view_proposal_detail_page()
    {
        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('proposal.show', $proposal));

        $response->assertStatus(200);
    }

    /**
     * Menguji pengguna terautentikasi dapat mengakses halaman edit proposal draf.
     */
    public function test_authenticated_user_can_access_edit_proposal_page()
    {
        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $response = $this->actingAs($user)->get(route('proposal.edit', $proposal));

        $response->assertStatus(200);
    }

    /**
     * Menguji pemilik dapat memperbarui proposal Draf mereka sendiri.
     */
    public function test_user_can_update_their_own_proposal()
    {
        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $updatedData = [
            'judul' => 'Judul Baru Diubah',
            'deskripsi' => 'Deskripsi Baru Diubah',
            'action' => 'draft',
        ];

        $response = $this->actingAs($user)->put(route('proposal.update', $proposal), $updatedData);

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'title' => 'Judul Baru Diubah',
        ]);
    }

    /**
     * Menguji pengguna lain tidak dapat memperbarui proposal milik orang lain.
     */
    public function test_user_cannot_update_others_proposal()
    {
        $user1 = $this->createUserWithRole(Role::USER);
        $user2 = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user1->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $updatedData = [
            'judul' => 'Mencoba Mengubah',
            'deskripsi' => 'Mencoba Mengubah Deskripsi',
        ];

        $response = $this->actingAs($user2)->put(route('proposal.update', $proposal), $updatedData);

        $response->assertStatus(403);
    }

    /**
     * Menguji pemilik dapat menghapus proposal Draf mereka sendiri.
     */
    public function test_user_can_delete_their_own_proposal()
    {
        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $response = $this->actingAs($user)->delete(route('proposal.destroy', $proposal));

        $this->assertDatabaseMissing('proposals', [
            'id' => $proposal->id,
        ]);
    }

    /**
     * Menguji pengguna lain tidak dapat menghapus proposal milik orang lain.
     */
    public function test_user_cannot_delete_others_proposal()
    {
        $user1 = $this->createUserWithRole(Role::USER);
        $user2 = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create([
            'user_id' => $user1->id,
            'status_proposal' => Proposal::STATUS_DRAFT,
        ]);

        $response = $this->actingAs($user2)->delete(route('proposal.destroy', $proposal));

        $response->assertStatus(403);
        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
        ]);
    }

    /**
     * Menguji Super Admin dapat melihat halaman daftar proposal admin.
     */
    public function test_super_admin_can_access_admin_proposals_page()
    {
        $admin = $this->createUserWithRole(Role::SUPER_ADMIN);

        $response = $this->actingAs($admin)->get(route('admin.proposals.index'));

        $response->assertStatus(200);
    }

    /**
     * Menguji Super Admin dapat menyetujui proposal (Validasi Administrasi).
     */
    public function test_super_admin_can_approve_proposal()
    {
        $admin = $this->createUserWithRole(Role::SUPER_ADMIN);

        $proposal = Proposal::factory()->create([
            'status_proposal' => Proposal::STATUS_SUBMITTED,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.proposals.approve', $proposal));

        $response->assertRedirect(route('admin.proposals.index'));

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'status_proposal' => Proposal::STATUS_ADMINISTRASI_VALID,
        ]);
    }

    /**
     * Menguji Super Admin dapat menolak proposal dengan alasan.
     */
    public function test_super_admin_can_reject_proposal()
    {
        $admin = $this->createUserWithRole(Role::SUPER_ADMIN);

        $proposal = Proposal::factory()->create([
            'status_proposal' => Proposal::STATUS_SUBMITTED,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.proposals.reject', $proposal), [
            'rejection_reason' => 'Format dokumen proposal tidak sesuai dengan template resmi.',
        ]);

        $response->assertRedirect(route('admin.proposals.index'));

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'status_proposal' => Proposal::STATUS_DITOLAK,
            'rejection_reason' => 'Format dokumen proposal tidak sesuai dengan template resmi.',
        ]);
    }

    /**
     * Menguji pengguna dapat mengunduh dokumen proposal.
     */
    public function test_user_can_download_proposal_document()
    {
        Storage::fake('public');

        $user = $this->createUserWithRole(Role::USER);
        $proposal = Proposal::factory()->create(['user_id' => $user->id]);

        $filePath = 'proposal_documents/test_doc.pdf';
        Storage::disk('public')->put($filePath, 'PDF content');

        $document = ProposalDocument::create([
            'proposal_id' => $proposal->id,
            'file_name' => 'test_doc.pdf',
            'file_path' => $filePath,
            'file_type' => 'application/pdf',
            'file_size' => 1024,
            'document_type' => 'Dokumen Utama',
        ]);

        $response = $this->actingAs($user)->get(route('proposal.documents.download', $document));

        $response->assertStatus(200);
    }
}
