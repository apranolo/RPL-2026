# Meeting Notes - Bimbingan Jurnal MU
**Tanggal**: 30 Januari 2026  
**Status**: UI/UX Enhancement & Feature Refinement

---

## 📋 Ringkasan Prioritas

Berikut adalah daftar perbaikan dan enhancement yang harus diimplementasikan berdasarkan hasil bimbingan:

---

## 🔄 Perubahan yang Perlu Diimplementasikan

### 1. **Admin Kampus - Journal List Page Enhancement**

#### Filter Improvements
- [x] **Tambahkan filter "Non-Sinta"**
  - User dapat memfilter jurnal yang belum memiliki status Sinta
  - Berguna untuk identifikasi jurnal yang perlu dibina
  
- [x] **Ganti placeholder filter Sinta**
  - Placeholder saat ini: "All Sinta"
  - Ganti menjadi: "Akreditasi" atau "Status Akreditasi"
  - Lebih jelas bahwa ini filter untuk status akreditasi jurnal

- [x] **Hapus filter "All Dikti"**
  - Filter ini tidak diperlukan
  - Simplifikasi UI dengan menghapus filter yang redundant

- [x] **Hapus/Nonaktifkan filter "Status"**
  - Filter status jurnal (aktif/tidak aktif) tidak diperlukan di halaman ini
  - Fokus pada filter yang lebih relevan

#### Header Statistics Dashboard
- [x] **Tambahkan grafik statistik di header halaman**
  - **Visualisasi Indeksasi**
    - Chart/graph untuk menampilkan jumlah jurnal berdasarkan indeksasi
    - Contoh: Scopus, WoS, Doaj, Google Scholar, dll
    - Gunakan chart yang interaktif (bar chart atau pie chart)
  
  - **Visualisasi Akreditasi**
    - Breakdown jurnal berdasarkan Sinta level (S1-S6, Non-Sinta)
    - Tampilkan dalam bentuk chart dengan warna berbeda per level
    - Sertakan persentase dari total jurnal
  
  - **Visualisasi Scientific Field**
    - Distribusi jurnal berdasarkan bidang ilmu
    - Membantu admin kampus melihat kekuatan bidang ilmu di universitasnya
    - Chart dengan kategori bidang ilmu

- [x] **Dashboard Statistics Design**
  - Tempatkan di bagian atas halaman (sebelum tabel jurnal)
  - Gunakan card-based layout untuk setiap kategori statistik
  - Responsif dan mudah dibaca
  - Gunakan library chart seperti Chart.js atau Recharts
  - **Implementation Note**: Menggunakan ApexCharts dengan react-apexcharts untuk kompatibilitas penuh dengan Inertia.js + React

---

### 2. **Fitur Pembinaan - Navigation Structure**

#### Menu Navigation Redesign
- [x] **Pisahkan Pembinaan menjadi 2 sub-menu di navigasi** - **IMPLEMENTED (2 Feb 2026)**
  - **Pembinaan Akreditasi**
    - Menu tersendiri untuk pembinaan terkait akreditasi
    - Menampilkan pembinaan dengan kategori "Akreditasi"
    - User mendaftar dan mengikuti pembinaan akreditasi
    - Route: `/user/pembinaan/akreditasi` dan `/admin-kampus/pembinaan/akreditasi`
  
  - **Pembinaan Indeksasi**
    - Menu tersendiri untuk pembinaan terkait indeksasi
    - Menampilkan pembinaan dengan kategori "Indeksasi"
    - User mendaftar dan mengikuti pembinaan indeksasi
    - Route: `/user/pembinaan/indeksasi` dan `/admin-kampus/pembinaan/indeksasi`

#### Navigation Structure Implementation
```
📋 Pembinaan (parent, href: '#')
  ├── 📊 Akreditasi
  │   ├── User: route('user.pembinaan.akreditasi')
  │   └── Admin Kampus: route('admin-kampus.pembinaan.akreditasi')
  └── 🔍 Indeksasi
      ├── User: route('user.pembinaan.indeksasi')
      └── Admin Kampus: route('admin-kampus.pembinaan.indeksasi')
```

**Implementation Details:**
- ✅ Old `/pembinaan` route removed - users must choose category from navigation
- ✅ Category filtering implemented in controllers via `->byCategory($category)`
- ✅ Navigation uses nested structure with `items` property in app-sidebar.tsx
- ✅ Page components accept `category` prop for dynamic breadcrumbs and titles
- ✅ Both User and Admin Kampus roles have category-specific routes and pages

#### Clarification: Assessment adalah Bagian dari Pembinaan
- [ ] **Assessment tetap bagian dari flow pembinaan**
  - User mendaftar pembinaan → Disetujui → Mengisi Assessment
  - Assessment muncul setelah user terdaftar di pembinaan
  - Assessment menggunakan template borang yang sudah ditentukan
  - **Note**: Assessment bukan modul terpisah, tapi bagian dari proses pembinaan

---

### 3. **User - Assessment & Pembinaan Flow**

#### Assessment Enhancement
- [ ] **Tampilkan Catatan Reviewer di Assessment**
  - Setelah reviewer memberikan feedback, user dapat melihat catatan
  - Lokasi: Di halaman hasil assessment atau detail assessment
  - Format: Text area yang menampilkan feedback dari reviewer
  - Bisa berupa rekomendasi, saran perbaikan, atau validasi

#### Flow Pendaftaran Pembinaan (User)
- [ ] **User memilih kategori saat daftar pembinaan**
  - **Step 1**: User melihat list pembinaan yang tersedia
  - **Step 2**: Pilih kategori: **Akreditasi** atau **Indeksasi**
  - **Step 3**: Pilih pembinaan spesifik dalam kategori tersebut
  - **Step 4**: Pilih jurnal yang akan didaftarkan
  - **Step 5**: Submit pendaftaran

#### Issue/Problem Tracking in Assessment
- [ ] **User dapat mencatat lebih dari satu issue**
  - Saat mengisi assessment, user bisa input multiple issues/problems
  - **Implementasi**: 
    - Tambahkan tombol "Tambah Issue" di form assessment
    - Setiap issue bisa disimpan sebagai draft
    - User dapat edit/hapus issue sebelum submit final
  - **Lokasi**: Cek implementasi di bagian assessment (SSAN - mungkin singkatan dari Sub-Sub Unsur atau section tertentu)

#### Save Draft Functionality
- [ ] **Fitur simpan draft di assessment**
  - User dapat menyimpan progress pengisian assessment
  - Data tersimpan di database dengan status "draft"
  - User bisa melanjutkan di lain waktu
  - Indikator draft pada UI (badge "Draft")

---

### 4. **Reviewer - Assessment Review**

#### Assessment Naming in Reviewer Context
- [ ] **Assessment tetap digunakan namun di sisi reviewer**
  - Reviewer melihat assessment yang sudah disubmit oleh user
  - Terminology: "Review Assessment" atau "Penilaian Assessment"
  - Reviewer memberikan score, feedback, dan rekomendasi
  - Hasil review ditampilkan kembali ke user (lihat poin 3)

---

## 🔧 Technical Implementation Notes

### Frontend Changes Required

#### 1. Admin Kampus - Journal List Page
```typescript
// Update filters in AdminKampus/Journals/Index.tsx
- Add "Non-Sinta" filter option
- Change Sinta filter placeholder to "Akreditasi"
- Remove "All Dikti" filter
- Remove/Hide "Status" filter

// Add Statistics Dashboard Component
- Create new component: StatisticsDashboard.tsx
- Props: { indeksasiData, akreditasiData, scientificFieldData }
- Use chart library (Recharts recommended for React)
- Place above journal table
```

#### 2. Pembinaan Navigation Structure
```typescript
// Update sidebar/navigation menu
// Split Pembinaan into 2 sub-menus:

Pembinaan (parent)
  ├── Pembinaan Akreditasi
  │   └── Route: /user/pembinaan/akreditasi
  └── Pembinaan Indeksasi
      └── Route: /user/pembinaan/indeksasi

// Create separate pages:
- resources/js/pages/User/Pembinaan/Akreditasi/Index.tsx
- resources/js/pages/User/Pembinaan/Indeksasi/Index.tsx
```

#### 3. Assessment Form Enhancement
```typescript
// Update Assessment form to support:
- Multiple issues input (dynamic form fields)
- Save draft functionality
- Display reviewer feedback section (read-only for user)

// Component structure:
<AssessmentForm>
  <IssueList>
    {issues.map(issue => <IssueItem key={issue.id} />)}
    <AddIssueButton />
  </IssueList>
  <SaveDraftButton />
  <SubmitButton />
  {hasReviewerFeedback && <ReviewerFeedback />}
</AssessmentForm>
```

#### 4. Reviewer Assessment View
```typescript
// Create/Update Reviewer pages:
- resources/js/pages/Reviewer/Assessments/Show.tsx
  - Display submitted assessment
  - Form to input score/feedback/recommendation
  - Submit review button
```

### Backend Changes Required

#### 1. Journal Statistics API
```php
// Add endpoint for statistics dashboard
// AdminKampus\JournalController

public function statistics()
{
    $universityId = auth()->user()->university_id;
    
    $statistics = [
        'indeksasi' => Journal::where('university_id', $universityId)
            ->selectRaw('indexations, COUNT(*) as count')
            ->groupBy('indexations')
            ->get(),
        
        'akreditasi' => Journal::where('university_id', $universityId)
            ->selectRaw('sinta_level, COUNT(*) as count')
            ->groupBy('sinta_level')
            ->get(),
        
        'scientific_field' => Journal::where('university_id', $universityId)
            ->join('scientific_fields', 'journals.scientific_field_id', '=', 'scientific_fields.id')
            ->selectRaw('scientific_fields.name, COUNT(*) as count')
            ->groupBy('scientific_fields.id', 'scientific_fields.name')
            ->get(),
    ];
    
    return response()->json($statistics);
}
```

#### 2. Assessment Issues Table
```sql
-- Support multiple issues in assessment
CREATE TABLE assessment_issues (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    journal_assessment_id BIGINT UNSIGNED NOT NULL,
    issue_description TEXT NOT NULL,
    issue_category VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_assessment_id) REFERENCES journal_assessments(id) ON DELETE CASCADE
);
```

#### 3. Assessment Draft Status
```php
// Update JournalAssessment model
// Add status field: 'draft', 'submitted', 'under_review', 'completed'

// In JournalAssessmentController
public function saveDraft(Request $request)
{
    $assessment = JournalAssessment::updateOrCreate(
        ['id' => $request->assessment_id],
        [
            'status' => 'draft',
            'data' => $request->assessment_data,
            // ... other fields
        ]
    );
    
    return back()->with('success', 'Draft berhasil disimpan');
}
```

#### 4. Reviewer Feedback in Assessment
```sql
-- Add reviewer feedback columns to journal_assessments
ALTER TABLE journal_assessments 
ADD COLUMN reviewer_feedback TEXT NULL,
ADD COLUMN reviewer_score DECIMAL(5,2) NULL,
ADD COLUMN reviewed_at TIMESTAMP NULL,
ADD COLUMN reviewed_by BIGINT UNSIGNED NULL,
ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
```

---

## 📝 Implementation Priority

### Phase 1 (High Priority - Week 1-2) - ✅ **COMPLETED (2 Feb 2026)**
1. ✅ Admin Kampus Journal List: Filter improvements (Non-Sinta, remove redundant filters)
2. ✅ Admin Kampus Journal List: Statistics dashboard di header - **COMPLETED (2 Feb 2026)**
3. ✅ Pembinaan Navigation: Split into Akreditasi & Indeksasi sub-menus - **COMPLETED (2 Feb 2026)**

### Phase 2 (Medium Priority - Week 2-3) - ✅ **IN PROGRESS**
4. ✅ Assessment: Multiple issues support - **COMPLETED (2 Feb 2026)**
5. ✅ Assessment: Save draft functionality - **COMPLETED (2 Feb 2026)**
6. ⏳ Assessment: Display reviewer feedback to user - **PENDING**

### Phase 3 (Low Priority - Week 3)
7. Reviewer: Assessment review interface
8. Testing & UI polish
9. Documentation update

---

## ✅ Implementation Summary - Statistics Dashboard (Completed 2 Feb 2026)

**Implemented Components:**
1. **Backend Statistics Calculation** ([JournalController.php](app/Http/Controllers/AdminKampus/JournalController.php#L142-L232))
   - Method: `calculateJournalStatistics(int $universityId): array`
   - Aggregates journals by: indexation platforms, SINTA ranks (1-6 + Non-Sinta), scientific fields
   - Returns totals: total_journals, indexed_journals, sinta_journals, non_sinta_journals
   - Calculates percentages for each category

2. **TypeScript Interfaces** ([index.d.ts](resources/js/types/index.d.ts#L280-L301))
   - `JournalStatistics` interface with nested types
   - `IndexationStatistic`, `AccreditationStatistic`, `ScientificFieldStatistic`
   - Strongly typed for frontend usage

3. **StatisticsDashboard Component** ([StatisticsDashboard.tsx](resources/js/components/StatisticsDashboard.tsx))
   - 4 summary cards: Total Jurnal, Jurnal Terindeks, Jurnal SINTA, Non-SINTA
   - 3 interactive charts using ApexCharts:
     - **Horizontal Bar Chart**: Indexation distribution (Scopus, WoS, DOAJ, etc.)
     - **Donut Chart**: SINTA accreditation breakdown (S1-S6 + Non-Sinta)
     - **Bar Chart**: Scientific field distribution
   - Responsive grid layout (`md:grid-cols-3`)
   - Dark mode support
   - Empty state handling for no data

4. **Integration** ([AdminKampus/Journals/Index.tsx](resources/js/pages/AdminKampus/Journals/Index.tsx#L216-L218))
   - Dashboard placed between flash messages and filters
   - Receives statistics prop from backend
   - Displays above journal list table

**Tech Stack Used:**
- **Charts**: ApexCharts via `react-apexcharts` (NOT larapex-charts - incompatible with Inertia.js)
- **UI Components**: shadcn/ui Card components for consistent design
- **Icons**: Lucide React (BarChart3, PieChart, TrendingUp)
- **Colors**: Aligned with larapex-charts config colors for consistency

**Why ApexCharts instead of Larapex-charts?**
- Larapex-charts is Blade-focused (server-side rendering)
- Requires `{!! $chart->container() !!}` + `{!! $chart->script() !!}` in Blade templates
- Inertia.js uses React components (client-side rendering)
- ApexCharts provides native React support via `react-apexcharts`
- Better TypeScript integration and state management

---

## 🎯 Next Steps

1. ~~**UI/UX Design**: Design statistics dashboard layout dan chart types~~ ✅ **COMPLETED**
2. ~~**Frontend Implementation**: Update Admin Kampus journal list page dengan filters dan statistics~~ ✅ **COMPLETED**
3. **Navigation Restructure**: Implement pembinaan sub-menus (Akreditasi & Indeksasi) - **IN PROGRESS**
4. ~~**Backend API**: Create statistics endpoint untuk data visualization~~ ✅ **COMPLETED**
5. **Assessment Enhancement**: Implement multiple issues dan save draft - **PENDING**
6. **Testing**: Test flow pendaftaran pembinaan dengan kategori baru - **PENDING**

---

## 📌 Catatan Penting

- ✅ **Filter "Non-Sinta"** sangat penting untuk Admin Kampus mengidentifikasi jurnal yang perlu dibina - **IMPLEMENTED**
- ✅ **Statistics Dashboard** memberikan overview cepat kondisi jurnal di universitas - **IMPLEMENTED dengan ApexCharts**
- ✅ **Pemisahan Pembinaan Akreditasi & Indeksasi** memperjelas kategori dan mempermudah navigasi - **IMPLEMENTED**
- **Assessment adalah bagian integral dari Pembinaan**, bukan modul terpisah
- **Multiple Issues** di assessment memungkinkan user mencatat semua masalah yang ditemukan - **NEEDS IMPLEMENTATION**
- **Draft Functionality** penting agar user tidak kehilangan progress saat pengisian assessment - **NEEDS IMPLEMENTATION**
- **Reviewer Feedback** ditampilkan ke user sebagai bentuk transparansi hasil review - **NEEDS IMPLEMENTATION**

---

## 🔗 Related Documents

- [MEETING_NOTES_16_JAN_2026.md](MEETING_NOTES_16_JAN_2026.md) - Previous meeting notes
- [PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md](PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md) - Pembinaan system implementation
- [ERD Database.md](ERD Database.md) - Database schema reference

---

**Prepared by**: GitHub Copilot  
**Last Updated**: 2 Februari 2026 (Statistics Dashboard Implementation Completed)
