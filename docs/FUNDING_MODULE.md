# Funding Management Module Documentation

## 📋 Overview

Modul Pendanaan (Funding) dirancang untuk mengelola data kontrak dan pencairan dana penelitian bagi dosen/peneliti. Module ini mencakup:

- **Contracts** - Kontrak penelitian dengan data dana yang disetujui
- **Funding Terms** - Detail termin/tahapan pencairan dana per kontrak
- **Dashboard** - View untuk dosen melihat status pendanaan mereka

---

## 🗂️ File Structure

### Models

- `app/Models/Contract.php` - Model untuk kontrak penelitian
- `app/Models/FundingTerm.php` - Model untuk termin pencairan dana

### Controllers

- `app/Http/Controllers/User/UserFundingController.php` - Controller untuk menampilkan pendanaan

### Policies

- `app/Policies/ContractPolicy.php` - Authorization policy untuk Contract

### Requests (Validation)

- `app/Http/Requests/StoreContractRequest.php` - Validasi create contract
- `app/Http/Requests/UpdateContractRequest.php` - Validasi update contract
- `app/Http/Requests/StoreFundingTermRequest.php` - Validasi create funding term
- `app/Http/Requests/UpdateFundingTermRequest.php` - Validasi update funding term

### Views

- `resources/js/pages/Proposal/FundingInfo.tsx` - React component untuk dashboard pendanaan

### Database

- `database/migrations/2026_05_13_000001_create_contracts_table.php` - Migration contracts table
- `database/migrations/2026_05_13_000002_create_funding_terms_table.php` - Migration funding_terms table
- `database/seeders/ContractSeeder.php` - Seeder untuk test data

### Factories (Testing)

- `database/factories/ContractFactory.php` - Factory untuk Contract model
- `database/factories/FundingTermFactory.php` - Factory untuk FundingTerm model

### Utilities

- `resources/js/lib/format.ts` - Utility functions untuk formatting (currency, date, dll)

### Providers

- `app/Providers/AuthServiceProvider.php` - Service provider untuk policies

### Routes

- `routes/web.php` - Routes untuk funding module

---

## 🚀 Installation & Setup

### 1. Run Migrations

```bash
php artisan migrate
```

Perintah ini akan membuat 2 tabel:

- `contracts` - Menyimpan data kontrak penelitian
- `funding_terms` - Menyimpan data termin pencairan dana

### 2. Seed Test Data (Optional)

```bash
php artisan db:seed --class=ContractSeeder
```

Atau seed semua data:

```bash
php artisan db:seed
```

Seeder ini akan membuat:

- 5 kontrak untuk 5 peneliti pertama yang memiliki role 'user'
- Masing-masing kontrak memiliki 2-4 termin pencairan
- Total persentase termin setiap kontrak selalu 100%

### 3. Register Policy (Already Done)

Policy sudah didaftarkan di `app/Providers/AuthServiceProvider.php`:

```php
protected $policies = [
    Contract::class => ContractPolicy::class,
];
```

---

## 📊 Database Schema

### Contracts Table

| Column                 | Type          | Description                    |
| ---------------------- | ------------- | ------------------------------ |
| id                     | bigint        | Primary key                    |
| researcher_id          | bigint FK     | ID peneliti/dosen              |
| contract_number        | string        | Nomor kontrak (unique)         |
| contract_date          | date          | Tanggal kontrak ditandatangani |
| party_1                | string        | LPPM/Institusi pemberi dana    |
| party_2                | string        | Peneliti utama                 |
| total_approved_funding | decimal(15,2) | Total dana yang disetujui      |
| contract_status        | enum          | aktif / selesai / ditangguhkan |
| financial_document     | string        | Path ke file dokumen           |
| created_by             | bigint FK     | User yang membuat              |
| updated_by             | bigint FK     | User yang update terakhir      |
| deleted_by             | bigint FK     | User yang soft delete          |
| created_at             | timestamp     |                                |
| updated_at             | timestamp     |                                |
| deleted_at             | timestamp     | Soft delete                    |

### Funding_Terms Table

| Column            | Type          | Description                            |
| ----------------- | ------------- | -------------------------------------- |
| id                | bigint        | Primary key                            |
| contract_id       | bigint FK     | ID kontrak                             |
| order             | integer       | Urutan termin (1, 2, 3, dll)           |
| term_name         | string        | Nama termin (e.g., Tahap 1)            |
| percentage        | decimal(5,2)  | Persentase dari total dana             |
| nominal           | decimal(15,2) | Nominal dana termin                    |
| status            | enum          | cair / menunggu / ditangguhkan / batal |
| disbursement_date | date          | Tanggal dana cair                      |
| receipt_number    | string        | Nomor kuitansi/slip transfer           |
| receipt_file      | string        | Path ke file bukti transfer            |
| notes             | text          | Catatan/keterangan                     |
| updated_by        | bigint FK     | User yang update                       |
| deleted_by        | bigint FK     | User yang soft delete                  |
| created_at        | timestamp     |                                        |
| updated_at        | timestamp     |                                        |
| deleted_at        | timestamp     | Soft delete                            |

---

## 🔐 Authorization Rules (Policies)

### ContractPolicy

**View All** (`viewAny`):

- User dengan role: user, admin_kampus, super_admin

**View Single** (`view`):

- Peneliti hanya bisa lihat kontrak mereka sendiri
- Admin kampus hanya bisa lihat kontrak dari universitas mereka
- Super admin bisa lihat semua

**Create** (`create`):

- Hanya super_admin dan admin_kampus

**Update** (`update`):

- Super admin bisa update semua
- Admin kampus hanya bisa update dari universitas mereka

**Delete** (`delete`):

- Hanya super_admin

---

## 🛣️ Routes

### User Routes

```
GET    /user/funding               -> UserFundingController@index    (name: user.funding.index)
```

**Example:**

```php
// In view
<Link href={route('user.funding.index')}>
    View Funding
</Link>

// In controller
$url = route('user.funding.index'); // /user/funding
```

---

## 📝 Validation Rules

### Contract Validation

**Create (StoreContractRequest):**

- researcher_id: required, exists:users, unique per researcher
- contract_number: required, unique across contracts
- contract_date: required, valid date
- party_1: required, max 255 chars
- party_2: required, max 255 chars
- total_approved_funding: required, numeric, >= 0
- contract_status: required, in [aktif, selesai, ditangguhkan]
- financial_document: optional, file, mimes:pdf,jpg,jpeg,png, max 5MB

**Update (UpdateContractRequest):**

- Sama seperti create, except researcher_id tidak bisa diubah
- contract_number unique except self

### Funding Term Validation

**Create & Update (StoreFundingTermRequest / UpdateFundingTermRequest):**

- term_name: required, max 255
- percentage: required, numeric, 0-100
- nominal: required, numeric, >= 0
- status: required, in [cair, menunggu, ditangguhkan, batal]
- disbursement_date: optional, valid date
- receipt_number: optional, max 100
- receipt_file: optional, file, mimes:pdf,jpg,jpeg,png, max 5MB
- notes: optional, max 500

---

## 🎨 React Component

### FundingInfo Component

Location: `resources/js/pages/Proposal/FundingInfo.tsx`

**Props:**

```typescript
interface Props {
    contracts: {
        data: Contract[];
        current_page: number;
        last_page: number;
        total: number;
        // ... pagination data
    };
    fundingStats: {
        total_approved: number;
        total_disbursed: number;
        total_remaining: number;
        active_contracts: number;
    };
    filters: {
        search: string;
    };
}
```

**Features:**

- Dashboard dengan 4 info cards (total disetujui, cair, sisa, kontrak aktif)
- List kontrak dengan expandable detail
- Table termin dengan status badge dan icon
- Progress bar visual untuk serapan dana
- Download button untuk bukti transfer
- Empty state message
- Pagination support

---

## 🏭 Factories & Seeding

### Using Factories in Tests

```php
// Create single contract
$contract = Contract::factory()->create();

// Create active contract with 3 funding terms
$contract = Contract::factory()->active()->create();
$terms = FundingTerm::factory()->count(3)->disbursed()->create([
    'contract_id' => $contract->id
]);

// Create contract with specific data
$contract = Contract::factory()->create([
    'researcher_id' => $user->id,
    'contract_number' => 'TEST-001'
]);
```

### Using Seeder

```bash
# Seed contracts and funding terms
php artisan db:seed --class=ContractSeeder

# Seed all seeders
php artisan db:seed

# Seed specific seeders in production (no confirmation)
php artisan db:seed --class=ContractSeeder --force
```

---

## 💾 Usage Examples

### In Controllers

```php
use App\Models\Contract;
use App\Models\FundingTerm;

// Get researcher's contracts with funding terms
$contracts = Contract::forResearcher($userId)
    ->withFundingTerms()
    ->paginate(10);

// Get active contracts
$active = Contract::active()->get();

// Get disbursed funding
$disbursed = FundingTerm::disbursed()->sum('nominal');

// Calculate total funding for researcher
$total = Contract::forResearcher($userId)
    ->sum('total_approved_funding');
```

### In Blade Views (Old Style - Not Recommended)

```blade
@foreach($contracts as $contract)
    <div>
        <h3>{{ $contract->contract_number }}</h3>
        <p>Dana: {{ number_format($contract->total_approved_funding) }}</p>

        @foreach($contract->fundingTerms as $term)
            <span>{{ $term->term_name }}</span>
            <span class="badge">{{ $term->status_label }}</span>
        @endforeach
    </div>
@endforeach
```

### In Inertia/React

```typescript
import { formatCurrency, formatDateID } from '@/lib/format';

export default function FundingPage({ contracts, fundingStats }) {
    return (
        <div>
            <h1>Total Dana: {formatCurrency(fundingStats.total_approved)}</h1>

            {contracts.data.map(contract => (
                <div key={contract.id}>
                    <h3>{contract.contract_number}</h3>
                    <p>Dana: {formatCurrency(contract.total_approved_funding)}</p>
                    <p>Cair: {formatCurrency(contract.total_disbursed)}</p>
                </div>
            ))}
        </div>
    );
}
```

---

## 🧪 Testing

### Feature Test Example

```php
// tests/Feature/FundingTest.php

public function test_user_can_view_their_funding()
{
    $user = User::factory()->create();
    $contract = Contract::factory()
        ->for($user, 'researcher')
        ->create();

    $this->actingAs($user)
        ->get(route('user.funding.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) =>
            $page
                ->component('Proposal/FundingInfo')
                ->has('contracts.data', 1)
        );
}

public function test_user_cannot_view_others_funding()
{
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $contract = Contract::factory()
        ->for($user1, 'researcher')
        ->create();

    $this->actingAs($user2)
        ->get(route('user.funding.index'))
        ->assertForbidden(); // Should not see user1's contracts
}
```

---

## 📌 Notes & Tips

1. **Unique Constraints:**
    - Hanya 1 kontrak per peneliti (researcher_id unique dalam soft-deleted context)
    - Nomor kontrak selalu unique
    - Order termin unique per kontrak

2. **Financial Validation:**
    - Total persentase termin harus 100% per kontrak (validasi di backend/custom rule)
    - Nominal termin otomatis calculated dari percentage \* total_approved_funding

3. **Status Flow:**
    - Contract: aktif → selesai atau aktif → ditangguhkan
    - FundingTerm: menunggu → cair atau menunggu → ditangguhkan atau menunggu → batal

4. **Soft Deletes:**
    - Contracts dan FundingTerms menggunakan soft deletes
    - Query otomatis exclude deleted records
    - Perlu `withTrashed()` untuk include deleted records

5. **Permissions:**
    - Jangan lupa authorize di controller menggunakan policy
    - Example: `$this->authorize('view', $contract);`

---

## 🔄 Next Steps / Future Enhancements

1. ✅ Create Contract & FundingTerm models
2. ✅ Create Controller with index() method
3. ✅ Create React Component FundingInfo.tsx
4. ✅ Create Migrations & Factories
5. ✅ Create Policies & Validation
6. ⏳ Create additional endpoints (store, update, destroy)
7. ⏳ Create Admin Panel untuk manage contracts
8. ⏳ Add email notifications untuk status changes
9. ⏳ Add file upload handling untuk receipt documents
10. ⏳ Add export to PDF untuk contract details

---

## 📞 Support

Untuk pertanyaan atau issues terkait modul ini, hubungi tim development.
