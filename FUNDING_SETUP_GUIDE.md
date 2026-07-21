# 🚀 Funding Module - Complete Setup Instructions

## ✅ What Has Been Created

Semua file infrastruktur untuk modul Pendanaan (Funding) telah berhasil dibuat. Berikut daftar lengkapnya:

### 1. **Database Migrations** (2 files)
- ✅ `database/migrations/2026_05_13_000001_create_contracts_table.php`
- ✅ `database/migrations/2026_05_13_000002_create_funding_terms_table.php`

**What it does:**
- Creates `contracts` table dengan fields untuk kontrak penelitian
- Creates `funding_terms` table dengan fields untuk termin pencairan

### 2. **Models** (2 files)
- ✅ `app/Models/Contract.php` - Model kontrak dengan relationships dan scopes
- ✅ `app/Models/FundingTerm.php` - Model termin pencairan

**Features:**
- Relationships ke User, FundingTerms
- Scopes: `forResearcher()`, `active()`, `withFundingTerms()`
- Accessors untuk kalkulasi otomatis

### 3. **Controllers** (1 file)
- ✅ `app/Http/Controllers/User/UserFundingController.php`

**Methods:**
- `index()` - Menampilkan daftar pendanaan per dosen dengan pagination

### 4. **Authorization Policies** (1 file)
- ✅ `app/Policies/ContractPolicy.php`

**Authorization rules:**
- View: User hanya lihat kontrak mereka sendiri
- Create/Update: Hanya admin/super_admin
- Delete: Hanya super_admin

### 5. **Validation Requests** (4 files)
- ✅ `app/Http/Requests/StoreContractRequest.php`
- ✅ `app/Http/Requests/UpdateContractRequest.php`
- ✅ `app/Http/Requests/StoreFundingTermRequest.php`
- ✅ `app/Http/Requests/UpdateFundingTermRequest.php`

**Validations:**
- Contract: nomor unique, tanggal valid, dana numeric
- FundingTerm: persentase 0-100, nominal >= 0, status valid

### 6. **Custom Validation Rules** (1 file)
- ✅ `app/Rules/FundingTermPercentageRule.php`

**Purpose:** Memvalidasi bahwa total persentase termin = 100%

### 7. **Services** (1 file)
- ✅ `app/Services/FundingService.php`

**Methods:**
- `getResearcherFundingStats()` - Hitung statistik pendanaan
- `validateTermPercentages()` - Validasi persentase
- `getContractDisbursementRate()` - Hitung rate pencairan
- `canDisburseTerm()` - Check apakah termin bisa dicairkan
- `formatContractResponse()` - Format data untuk API

### 8. **Factories** (2 files)
- ✅ `database/factories/ContractFactory.php`
- ✅ `database/factories/FundingTermFactory.php`

**Usage:**
```php
// Create test data
$contract = Contract::factory()->create();
$terms = FundingTerm::factory()->count(3)->disbursed()->create();
```

### 9. **Database Seeders** (1 file)
- ✅ `database/seeders/ContractSeeder.php`

**Generates:**
- 5 kontrak untuk 5 peneliti
- 2-4 termin per kontrak
- Realistic data dengan status bervariasi

### 10. **React Components** (1 file)
- ✅ `resources/js/pages/Proposal/FundingInfo.tsx`

**Features:**
- Dashboard dengan 4 info cards
- Expandable contract list
- Detail termin table
- Progress bar untuk serapan dana
- Download button untuk bukti transfer
- Empty state

### 11. **Utility Functions** (1 file)
- ✅ `resources/js/lib/format.ts`

**Functions:**
- `formatCurrency()` - Format Rupiah
- `formatPercentage()` - Format %
- `formatDateID()` - Format tanggal Indonesia
- `formatFileSize()` - Format ukuran file

### 12. **Routes** (Updated)
- ✅ Updated `routes/web.php` - Added funding routes

**Routes:**
```
GET /user/funding               -> UserFundingController@index (name: user.funding.index)
```

### 13. **Service Provider** (1 file)
- ✅ `app/Providers/AuthServiceProvider.php`

**Purpose:** Mendaftarkan ContractPolicy untuk authorization

### 14. **Tests** (1 file)
- ✅ `tests/Feature/User/FundingTest.php`

**Test cases:**
- User dapat akses funding page
- User hanya lihat kontrak mereka
- Statistik dihitung benar
- Empty state ditampilkan
- Status labels benar
- Percentage dihitung benar

### 15. **Documentation** (1 file)
- ✅ `docs/FUNDING_MODULE.md` - Dokumentasi lengkap

---

## 🔧 How to Setup & Run

### Step 1: Run Migrations

```bash
php artisan migrate
```

**Output:**
```
Migration table created successfully.
Creating table: contracts... ✓
Creating table: funding_terms... ✓
```

### Step 2: Seed Test Data (Optional)

```bash
# Seed contracts with test data
php artisan db:seed --class=ContractSeeder

# Or seed all
php artisan db:seed
```

**Output:**
```
Contract KTK-2026-001 created with 3 funding terms.
Contract KTK-2026-002 created with 2 funding terms.
...
ContractSeeder completed successfully.
```

### Step 3: Clear Cache (Recommended)

```bash
php artisan cache:clear
php artisan config:clear
```

### Step 4: Verify Installation

#### Check Database Tables

```bash
php artisan tinker
>>> \DB::select('SELECT * FROM contracts LIMIT 1;')
>>> \DB::select('SELECT * FROM funding_terms LIMIT 1;')
```

#### Access Funding Page in Browser

```
http://localhost:8000/user/funding
```

(Make sure you're logged in as a user with role 'user')

### Step 5: Run Tests (Optional)

```bash
# Run all funding tests
php artisan test tests/Feature/User/FundingTest.php

# Run with verbose output
php artisan test tests/Feature/User/FundingTest.php --verbose

# Run specific test
php artisan test tests/Feature/User/FundingTest.php --filter=user_can_view_funding_page
```

---

## 📊 Database Schema

### contracts table

```sql
CREATE TABLE contracts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  researcher_id BIGINT NOT NULL,
  contract_number VARCHAR(255) UNIQUE NOT NULL,
  contract_date DATE NOT NULL,
  party_1 VARCHAR(255) NOT NULL,
  party_2 VARCHAR(255) NOT NULL,
  total_approved_funding DECIMAL(15,2) NOT NULL,
  contract_status ENUM('aktif', 'selesai', 'ditangguhkan') DEFAULT 'aktif',
  financial_document VARCHAR(255) NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted_by BIGINT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (researcher_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (researcher_id),
  INDEX (contract_status)
);
```

### funding_terms table

```sql
CREATE TABLE funding_terms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  order INT NOT NULL,
  term_name VARCHAR(255) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  status ENUM('cair', 'menunggu', 'ditangguhkan', 'batal') DEFAULT 'menunggu',
  disbursement_date DATE NULL,
  receipt_number VARCHAR(100) NULL,
  receipt_file VARCHAR(255) NULL,
  notes TEXT NULL,
  updated_by BIGINT NULL,
  deleted_by BIGINT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  UNIQUE (contract_id, order),
  INDEX (status),
  INDEX (contract_id)
);
```

---

## 🎯 Quick Reference Commands

### Database Commands

```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Reset database (WARNING: deletes all data)
php artisan migrate:reset

# Refresh (rollback + migrate)
php artisan migrate:refresh

# Seed data
php artisan db:seed --class=ContractSeeder

# Tinker (interactive PHP shell)
php artisan tinker
```

### Testing Commands

```bash
# Run all tests
php artisan test

# Run funding tests only
php artisan test tests/Feature/User/FundingTest.php

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/User/FundingTest.php --filter=user_can_view_funding_page
```

### Cache Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Rebuild cache
php artisan config:cache
php artisan view:cache
```

---

## 💡 Usage Examples

### Create Contract via Factory

```php
// In tinker or test
$contract = Contract::factory()->create();
$contract = Contract::factory()->active()->create();
$contract = Contract::factory()->for($user, 'researcher')->create();
```

### Create Funding Terms

```php
$contract = Contract::factory()->create();

FundingTerm::factory()
    ->for($contract)
    ->disbursed()
    ->create(['order' => 1, 'percentage' => 50]);

FundingTerm::factory()
    ->for($contract)
    ->pending()
    ->create(['order' => 2, 'percentage' => 50]);
```

### Query Contracts

```php
// Get researcher's contracts
Contract::forResearcher($userId)->get();

// Get active contracts
Contract::active()->get();

// Get with funding terms
Contract::withFundingTerms()->get();

// Calculate total funding
Contract::forResearcher($userId)->sum('total_approved_funding');

// Get disbursed amount
FundingTerm::disbursed()->sum('nominal');
```

### Use Service

```php
use App\Services\FundingService;

// Get funding statistics
$stats = FundingService::getResearcherFundingStats($userId);
// Returns: [total_approved, total_disbursed, total_remaining, active_contracts, disbursement_percentage]

// Check if percentages valid
FundingService::validateTermPercentages($contractId);

// Format for API
$formatted = FundingService::formatContractResponse($contract);
```

### Use Policy

```php
// In controller
$this->authorize('view', $contract);     // Check if user can view
$this->authorize('create', Contract::class); // Check if can create
$this->authorize('update', $contract);   // Check if can update
```

---

## 🛡️ Authorization Reference

### ContractPolicy

| Method | User | Admin Kampus | Super Admin |
|--------|------|-------------|-------------|
| viewAny | ✓ | ✓ | ✓ |
| view (own) | ✓ | ✓ | ✓ |
| view (other) | ✗ | ✓* | ✓ |
| create | ✗ | ✓ | ✓ |
| update | ✗ | ✓* | ✓ |
| delete | ✗ | ✗ | ✓ |
| restore | ✗ | ✗ | ✓ |
| forceDelete | ✗ | ✗ | ✓ |

*Only for their own university

---

## 📝 Validation Rules Reference

### Contract Rules

| Field | Rule | Message |
|-------|------|---------|
| researcher_id | required, exists, unique | Peneliti harus dipilih, sudah ada |
| contract_number | required, unique, max:50 | Nomor kontrak... sudah terdaftar |
| contract_date | required, date | Tanggal harus valid |
| party_1 | required, max:255 | Pihak LPPM harus diisi |
| party_2 | required, max:255 | Pihak Peneliti harus diisi |
| total_approved_funding | required, numeric, min:0 | Dana harus berupa angka |
| contract_status | required, in:aktif,selesai,ditangguhkan | Status tidak valid |
| financial_document | nullable, file, pdf/jpg, max:5MB | File hanya PDF/JPG, max 5MB |

### FundingTerm Rules

| Field | Rule | Message |
|-------|------|---------|
| order | required, integer, unique per contract | Urutan... sudah ada |
| term_name | required, max:255 | Nama termin harus diisi |
| percentage | required, numeric, 0-100 | Persentase 0-100 |
| nominal | required, numeric, min:0 | Nominal dana... tidak valid |
| status | required, in:cair,menunggu,ditangguhkan,batal | Status tidak valid |
| disbursement_date | nullable, date | Format tanggal tidak valid |
| receipt_file | nullable, file, pdf/jpg, max:5MB | File hanya PDF/JPG, max 5MB |

---

## 🔍 Troubleshooting

### Migration Fails

**Problem:** `SQLSTATE[42S01]: Table 'contracts' already exists`

**Solution:**
```bash
php artisan migrate:reset
php artisan migrate
```

### Seeder Finds No Users

**Problem:** `No users with role "user" found. Skipping ContractSeeder.`

**Solution:**
```bash
# Create users first with role 'user'
php artisan tinker
>>> $user = User::factory()->create();
>>> $role = Role::where('name', 'user')->first();
>>> $user->roles()->attach($role);
>>> exit
```

### Policy Not Working

**Problem:** `Authorization failure` even though user should have access

**Solution:**
1. Clear cache: `php artisan cache:clear`
2. Check user role: `php artisan tinker` → `User::find(1)->roles`
3. Check policy: Review `app/Policies/ContractPolicy.php`

### Tests Fail

**Problem:** Tests not finding data

**Solution:**
```bash
# Use RefreshDatabase trait in tests
# It automatically runs migrations before each test

# Run tests with fresh database
php artisan test --env=testing
```

---

## ✨ Next Steps

1. ✅ Create & test migrations
2. ✅ Seed test data
3. ✅ Verify routes work
4. ✅ Run tests
5. ⏳ Build admin panel untuk manage contracts
6. ⏳ Add more CRUD endpoints (store, update, destroy)
7. ⏳ Add email notifications
8. ⏳ Add file upload handling
9. ⏳ Add advanced filtering & search
10. ⏳ Add export to PDF

---

## 📞 Support

For issues or questions about the Funding Module:
1. Check `docs/FUNDING_MODULE.md` for detailed documentation
2. Review test cases in `tests/Feature/User/FundingTest.php` for examples
3. Check authorization in `app/Policies/ContractPolicy.php`
4. Run tests: `php artisan test --filter=Funding`

---

**Module Created:** May 13, 2026
**Status:** Ready for Testing & Integration ✅
