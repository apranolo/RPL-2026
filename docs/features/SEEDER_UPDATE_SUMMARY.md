# Seeder Update Summary - Borang Indikator v1.1

## 📅 Update Date: January 18, 2026

## 🎯 Tujuan Update
Memperbarui seeder untuk menampilkan contoh data lengkap dari sistem Borang Indikator v1.1 yang menggunakan struktur hierarki:
- **Templates** (Accreditation Templates)
- **Categories** (Evaluation Categories - Level 1)
- **Sub-Categories** (Evaluation Sub-Categories - Level 2)
- **Indicators** (Evaluation Indicators - Level 3)
- **Essays** (Essay Questions - linked to Categories)

---

## 📦 Database Seeding Flow

### 1. **RoleSeeder** ✅
- Membuat 3 roles: Super Admin, Admin Kampus, User

### 2. **ScientificFieldSeeder** ✅
- Membuat 10 bidang ilmiah (Teknik, Kesehatan, Sosial, dll)

### 3. **UniversitySeeder** ✅
- Membuat 5 universitas PTM sample

### 4. **UserSeeder** ✅
- Membuat 10 users dengan berbagai role
- **Super Admin**: `superadmin@ajm.ac.id` / `password123`

### 5. **EvaluationIndicatorSeeder** ✅ (UPDATED)
- Membuat **12 indicators** legacy (v1.0 format)
- **Kategori yang dibuat:**
  - **Kelengkapan Administrasi** (4 indicators, 6.50 points)
    - ADM-01: ISSN valid ✅
    - ADM-02: Website aktif ✅
    - ADM-03: Dewan redaksi lengkap (min 10 anggota) ✅
    - ADM-04: Pedoman penulisan lengkap ✅
  
  - **Kualitas Konten** (4 indicators, 8.50 points)
    - KON-01: Peer review (double-blind) ✅
    - KON-02: Keberagaman penulis eksternal (scale 1-5) ✅
    - KON-03: Sitasi artikel (Google Scholar) ✅
    - KON-04: Standarisasi format (IMRAD) ✅
  
  - **Proses Editorial** (4 indicators, 9.00 points)
    - EDT-01: SOP review terdokumentasi ✅
    - EDT-02: Kecepatan review (scale 1-5) ✅
    - EDT-03: Sistem manajemen elektronik (OJS, dll) ✅
    - EDT-04: Pengecekan plagiasi (Turnitin, dll) ✅

**Total Weight: 24 points**

#### 🆕 Perubahan Penting:
- ✅ Deskripsi indicator diperluas dan lebih detail
- ✅ ADM-03: Weight dinaikkan dari 1.50 → 2.00 (requirement: min 10 anggota)
- ✅ KON-02: Weight dinaikkan dari 2.00 → 2.50 (scale scoring lebih kompleks)
- ✅ KON-03: Weight diturunkan dari 2.50 → 2.00 (diseimbangkan)
- ✅ Semua field match dengan `StoreIndicatorRequest` validation

### 6. **AccreditationTemplateSeeder** ✅
- Membuat **2 templates:**
  
  **Template 1: BAN-PT 2024 (Active)**
  - Type: `akreditasi`
  - Status: Active ✅
  - Version: `2024.1`
  - Description: Template penilaian akreditasi jurnal berdasarkan standar BAN-PT
  
  **Template 2: Scopus 2024 (Inactive)**
  - Type: `indeksasi`
  - Status: Inactive ⏸️
  - Version: `2024.0-draft`
  - Description: Template kriteria indeksasi Scopus (untuk referensi)

### 7. **DataMigrationSeeder** ✅
**Proses migrasi otomatis v1.0 → v1.1:**

#### Step 1: Create Categories
- Extract unique categories dari 12 indicators
- Link ke BAN-PT template
- Result: **3 categories** created

#### Step 2: Create Sub-Categories
- Extract unique sub_categories per category
- Result: **12 sub-categories** created (1 per indicator)

#### Step 3: Migrate Indicators
- Populate `sub_category_id` untuk semua indicators
- Result: **12 indicators** migrated ✅

#### Step 4: Validation
- ✅ All indicators migrated (no NULL sub_category_id)
- ✅ No orphaned sub-categories
- ✅ Category weight consistency validated

**Migration Summary:**
- Categories created: 3
- Sub-categories created: 12
- Indicators migrated: 12
- Failed migrations: 0 ✅

### 8. **EssayQuestionSeeder** ✅

**BAN-PT Template Essays (3 active):**
1. **ESSAY-ADM-01**: Sejarah & perkembangan jurnal (500 words, required)
2. **ESSAY-KON-01**: Proses peer review (600 words, required)
3. **ESSAY-VIS-01**: Strategi visibility & citation (500 words, optional)

**Scopus Template Essays (3 inactive draft):**
1. **ESSAY-SCOPUS-QUA-01**: Editorial board composition (400 words)
2. **ESSAY-SCOPUS-ETH-01**: Ethics policies (450 words)
3. **ESSAY-SCOPUS-CIT-01**: Citation impact evidence (350 words)

**New Scopus Placeholder Categories:**
- SCOPUS-QUA: Journal Quality & Policy (30%)
- SCOPUS-PUB: Publication Ethics (25%)
- SCOPUS-VIS: Visibility & Citation (45%)

### 9. **JournalSeeder** ✅
- Membuat 5 sample journals untuk testing

---

## 🔧 Form Modal Fixes Summary

Semua modal form telah diperbaiki agar sesuai dengan Form Request validation di backend:

### 1. **CategoryFormModal** ✅
**Required fields:**
- `code` (e.g., "A")
- `name` (e.g., "Manajemen Editorial")
- `description` (optional)
- `weight` (0-100, decimal)
- `display_order` (integer)
- `template_id` (hidden)

### 2. **SubCategoryFormModal** ✅
**Required fields:**
- `code` (e.g., "A.1")
- `name` (e.g., "Efektivitas Pengelolaan")
- `description` (optional)
- `display_order` (integer)
- `category_id` (hidden)

### 3. **IndicatorFormModal** ✅ (Completely rebuilt)
**Required fields:**
- `code` (e.g., "A.1.1")
- `question` (text - bukan `name`)
- `description` (optional)
- `weight` (0-100, decimal - bukan `score`)
- `answer_type` (select: `boolean`, `scale`, `text`)
- `requires_attachment` (checkbox)
- `sort_order` (integer)
- `is_active` (checkbox)
- `sub_category_id` (hidden)

### 4. **EssayQuestionFormModal** ✅
**Required fields:**
- `code` (e.g., "ESSAY-ADM-01")
- `question` (textarea)
- `guidance` (optional - bukan `description`)
- `max_words` (integer, 1-10000 - bukan `score`)
- `is_required` (checkbox)
- `is_active` (checkbox)
- `display_order` (integer)
- `category_id` (hidden)

### 5. **TemplateFormModal** ✅
**No schema changes**, only:
- ✅ Added toast notifications
- ✅ Added proper error handling
- ✅ Added loading state

---

## 🎨 Frontend Features

### Pages Created:
1. **`/admin/borang-indikator`** (Index) - List all templates
2. **`/admin/templates/{id}/structure`** (Tree) - Manage hierarchy with drag & drop

### UI Components:
- ✅ **TreeItems.tsx**: Sortable drag-and-drop items (CategoryItem, SubCategoryItem, IndicatorItem, EssayItem)
- ✅ All modals with toast notifications
- ✅ Form validation with error messages
- ✅ Loading states on submit buttons

---

## 🧪 Testing Checklist

### Database:
- [x] Run `php artisan migrate:fresh --seed` successfully
- [x] Verify 12 indicators created with correct weights
- [x] Verify 3 categories created
- [x] Verify 12 sub-categories created
- [x] Verify all indicators have `sub_category_id` populated
- [x] Verify 6 essay questions created (3 active, 3 inactive)
- [x] Verify 2 templates created (1 active, 1 inactive)

### Frontend (Manual Testing Required):
- [ ] Open `/admin/borang-indikator` and verify template list
- [ ] Click "Create Template" and test form submission
- [ ] Click "Manage Structure" button on BAN-PT template
- [ ] Test creating Category (should show toast notification)
- [ ] Test creating Sub-Category under a Category
- [ ] Test creating Indicator under a Sub-Category
- [ ] Test creating Essay Question under a Category
- [ ] Test drag & drop reordering (categories, sub-categories, indicators, essays)
- [ ] Test edit modals for all item types
- [ ] Test delete functionality
- [ ] Verify error messages display correctly when validation fails

---

## 📊 Data Structure Visualization

```
BAN-PT 2024 Template (Active)
├── Category 1: Kelengkapan Administrasi (6.50 pts)
│   ├── Sub: Identitas Jurnal
│   │   └── Indicator: ADM-01 (ISSN valid, 2.00 pts)
│   ├── Sub: Platform Publikasi
│   │   └── Indicator: ADM-02 (Website aktif, 1.50 pts)
│   ├── Sub: Struktur Organisasi
│   │   └── Indicator: ADM-03 (Dewan redaksi, 2.00 pts)
│   ├── Sub: Pedoman Penulisan
│   │   └── Indicator: ADM-04 (Guidelines, 1.00 pts)
│   └── Essay: ESSAY-ADM-01 (Sejarah jurnal)
│
├── Category 2: Kualitas Konten (8.50 pts)
│   ├── Sub: Proses Review
│   │   └── Indicator: KON-01 (Peer review, 3.00 pts)
│   ├── Sub: Keberagaman Penulis
│   │   └── Indicator: KON-02 (Eksternal author %, 2.50 pts)
│   ├── Sub: Dampak Publikasi
│   │   └── Indicator: KON-03 (Sitasi, 2.00 pts)
│   ├── Sub: Standarisasi Format
│   │   └── Indicator: KON-04 (Template, 1.00 pts)
│   └── Essay: ESSAY-KON-01 (Proses peer review)
│
└── Category 3: Proses Editorial (9.00 pts)
    ├── Sub: Standard Operating Procedure
    │   └── Indicator: EDT-01 (SOP, 2.00 pts)
    ├── Sub: Kecepatan Review
    │   └── Indicator: EDT-02 (Timeline, 1.50 pts)
    ├── Sub: Sistem Manajemen
    │   └── Indicator: EDT-03 (OJS, 2.50 pts)
    ├── Sub: Pengecekan Plagiasi
    │   └── Indicator: EDT-04 (Turnitin, 3.00 pts)
    └── Essay: ESSAY-VIS-01 (Strategi visibility)

Scopus 2024 Template (Inactive Draft)
├── Category 1: Journal Quality & Policy (30%)
│   └── Essay: ESSAY-SCOPUS-QUA-01
├── Category 2: Publication Ethics (25%)
│   └── Essay: ESSAY-SCOPUS-ETH-01
└── Category 3: Visibility & Citation (45%)
    └── Essay: ESSAY-SCOPUS-CIT-01
```

---

## 🚀 Next Steps

1. **Manual Testing**: Test all CRUD operations di frontend
2. **Policy Testing**: Verify authorization untuk Super Admin
3. **Drag & Drop Testing**: Test reordering functionality
4. **Validation Testing**: Test form validation dengan data invalid
5. **UI/UX Review**: Verify toast notifications, loading states, error messages

---

## 📝 Notes

- Total assessment weight: **24 points** (target: 100 points untuk assessment penuh)
- Hierarchy depth: 3 levels (Category → Sub-Category → Indicator)
- Essays are standalone (linked to Categories only, not Sub-Categories)
- All forms now use proper error handling with toast notifications
- Status 302 issue resolved by matching frontend fields with backend validation

---

## 👤 Developed By
**GitHub Copilot + Human Developer**
Date: January 18, 2026
