# Meeting Notes - Bimbingan Jurnal MU
**Tanggal**: 16 Januari 2026 (15:05)  
**Status**: Progress Update & Requirement Refinement

---

## 📋 Ringkasan Prioritas

Berikut adalah daftar perubahan dan fitur yang harus diimplementasikan berdasarkan hasil bimbingan:

---

## ✅ Sudah Terimplementasi

### 1. Borang Indikator (Assessment Form Builder)
- ✅ Sistem pembuatan borang dinamis seperti Google Form
- ✅ Terdiri dari 2 kategori: **Akreditasi** dan **Indeksasi**
- ✅ Struktur hierarki: Unsur → Sub-Unsur → Indikator (pilihan ganda) → Esai
- ✅ Fitur aktivasi/non-aktivasi borang (untuk pergantian template)
- ✅ Borang yang aktif akan muncul di assessment pengguna

### 2. Menu Management
- ✅ Menu dasar sudah tersedia untuk role-based access

---

## 🔄 Perlu Diimplementasikan/Diperbaiki

### 1. **Universities Management**

#### Fitur Profile Universitas
- [ ] **Profile Description** dengan limit **250 karakter**
  - Tambahkan character counter pada form
  - Validasi di backend untuk enforce limit
  
- [ ] **Status Akreditasi** (dropdown/select)
  - Options: Unggul, Baik Sekali, Baik, Cukup, dll
  - Tampilkan di profil universitas
  
- [ ] **Cluster** (dropdown/select)
  - Options: Mandiri, Utama, Madya, dll
  - Tampilkan di profil universitas

#### Struktur Menu
- [ ] **Pisahkan "Universities Management" menjadi menu sendiri**
  - Saat ini mungkin masih tergabung dengan menu lain
  - Buat menu terpisah khusus untuk Super Admin
  - Berisi: List Universities, Profile, Accreditation Status, Cluster

#### Integrasi Kode PTM
- [ ] Gunakan **PTM Code** dari PDDIKTI sebagai identifier
  - Field: `ptm_code` (5 digit)
  - Manfaat: Integrasi dengan sistem eksternal (Sinta, Garuda, dll)
  - Kode ini bersifat unik dan standar nasional

---

### 2. **User Management - Role System Enhancement**

#### Role Baru yang Harus Ditambahkan
- [ ] **Pengelola Jurnal** (Journal Manager)
  - User yang mengelola jurnal tertentu
  - Bisa mengedit profil jurnal miliknya
  - Bisa mengikuti pembinaan untuk jurnalnya

- [ ] **Reviewer**
  - Role untuk melakukan review assessment
  - Dapat di-invite oleh Super Admin atau Admin Kampus
  - Menu "Reviewer" hanya muncul untuk user yang memiliki role ini
  - Histori review tetap ada walaupun user di-remove dari role reviewer

#### Multi-Role Support
- [ ] **User dapat memiliki lebih dari satu role**
  - Contoh: Satu user bisa jadi Admin Kampus + Pengelola Jurnal + Reviewer
  - Implementasi: Many-to-many relationship (`user_roles` pivot table)
  - Authorization harus check semua role yang dimiliki user

#### User Management Menu Improvement
- [ ] **Konsolidasikan menu menjadi "User Management"**
  - Saat ini mungkin terpisah antara Admin Kampus dan User
  - Buat satu menu dengan filter berdasarkan role
  - Tampilkan: Name, Email, University, Roles (badges), Status, Actions

- [ ] **Role Management Interface**
  - Admin bisa assign/remove multiple roles ke user
  - Tampilkan dalam bentuk checkboxes atau badges
  - Super Admin: akses ke semua user
  - Admin Kampus: hanya user di universitas mereka

#### Authorization Rules
- [ ] **Admin Kampus**: Hanya bisa manage user di universitas mereka
  - Filter by `university_id`
  - Tidak bisa edit user dari universitas lain
  
- [ ] **Reviewer System**
  - Super Admin dan Admin Kampus bisa invite reviewer
  - Reviewer bisa lihat assignment mereka
  - Menu reviewer hanya visible untuk user dengan role "Reviewer"

---

### 3. **Profile User Enhancement**

- [ ] **Tambahkan field "Bidang Ilmu" (Scientific Field)**
  - Dropdown/select dari tabel `scientific_fields`
  - Required untuk user dengan role Pengelola Jurnal
  - Digunakan untuk filtering dan statistik
  - Tampilkan di profil user

- [ ] **Profile User Display**
  - Tampilkan semua role yang dimiliki (dengan badges)
  - Tampilkan bidang ilmu
  - Tampilkan universitas (dengan link ke detail universitas)

---

### 4. **Journal Profile Enhancement**

#### Tampilan Status pada Journal List/Detail
- [ ] **Status Sinta**
  - Field: `sinta_level` (S1, S2, S3, S4, S5, S6, Non-Sinta)
  - Tampilkan badge dengan warna berbeda per level
  
- [ ] **Status Indeksasi**
  - Field: multiple selection (Scopus, WoS, Doaj, dll)
  - Tampilkan sebagai badges/chips
  
- [ ] **Status Akreditasi Dikti**
  - Field: `dikti_accreditation` (dropdown)
  - Tampilkan di profil jurnal

#### Filter Enhancement
- [ ] **Tambahkan filter berdasarkan:**
  - Bidang Ilmu (Scientific Field)
  - Status Sinta
  - Status Indeksasi
  - Status Akreditasi
  - Universitas

#### Journal Ownership Transfer
- [ ] **Fitur transfer kepemilikan jurnal**
  - Skenario: Pengelola jurnal pindah/resign
  - Admin Kampus bisa mengubah pengelola jurnal
  - Histori pembinaan tetap terhubung ke jurnal (bukan ke user)
  - Log perubahan ownership di audit trail

---

### 5. **Pembinaan (Coaching/Training) System**

#### Pembinaan Creation Flow
- [ ] **Create Pembinaan Form** (Super Admin only)
  - Pilih kategori: **Akreditasi** atau **Indeksasi**
  - Pilih borang template yang sudah dibuat (hanya yang aktif)
  - Set periode:
    - Tanggal buka pendaftaran
    - Tanggal tutup pendaftaran
    - Tanggal mulai assessment
    - Tanggal selesai assessment
  - Set kuota peserta (optional)

#### User Registration Flow
- [ ] **Pendaftaran Pembinaan** (Pengelola Jurnal)
  - User memilih jurnal yang akan didaftarkan
  - Pilih pembinaan yang tersedia (sesuai kategori)
  - Upload dokumen pendukung jika diperlukan
  - Status: Pending → Approved/Rejected

#### Assessment Flow
- [ ] **Pengisian Assessment**
  - Muncul sesuai borang yang dipilih di pembinaan
  - Pertanyaan dinamis berdasarkan Unsur/Sub-Unsur/Indikator
  - Pilihan ganda untuk scoring
  - Text area untuk esai/catatan
  - Bisa save draft
  - Submit final

#### Review Process
- [ ] **Assignment Reviewer**
  - Super Admin assign reviewer ke assessment tertentu
  - Reviewer dapat notifikasi
  - Reviewer bisa lihat submission dan memberikan:
    - Score (jika ada rubrik)
    - Catatan/feedback
    - Rekomendasi tindak lanjut

#### Results Display
- [ ] **Hasil Pembinaan** (di profil Pengelola Jurnal)
  - List pembinaan yang pernah diikuti
  - Status: Selesai/Dalam Proses/Ditolak
  - Score/hasil assessment
  - Feedback dari reviewer
  - Certificate/bukti keikutsertaan (jika lulus)

- [ ] **History di Journal Profile**
  - Tampilkan pembinaan yang pernah diikuti jurnal tersebut
  - Kategori: Akreditasi/Indeksasi
  - Tahun/periode
  - Status hasil

---

### 6. **Dashboard Enhancement**

#### Super Admin Dashboard
- [ ] **Statistik Overview**
  - Total universitas
  - Total jurnal (breakdown by Sinta level)
  - Total user (breakdown by role)
  - Pembinaan aktif
  - Statistik assessment completion rate

#### Admin Kampus Dashboard
- [ ] **Statistik Universitas**
  - Total jurnal di universitas mereka
  - Breakdown by Sinta level
  - Total pengelola jurnal
  - Status pembinaan jurnal-jurnal mereka
  - Chart/graph untuk visualisasi

#### Pengelola Jurnal Dashboard
- [ ] **Personal Dashboard**
  - Jurnal yang dikelola
  - Status pembinaan yang sedang berjalan
  - Reminder untuk assessment deadline
  - History pembinaan

---

### 7. **Landing Page Jurnal**

- [ ] **Public Journal Landing Page**
  - URL: `/journals/{issn}/public` atau `/j/{issn}`
  - Tampilkan:
    - Profil jurnal (nama, deskripsi, cover image)
    - Scope & Focus
    - Bidang ilmu
    - Status Sinta/Indeksasi/Akreditasi
    - Editorial team (optional)
    - Contact information
  - **Note**: Masih dalam development, scope masih ditentukan

---

### 8. **Integration & Data Sync**

#### Sinta Integration (Future)
- [ ] **API Integration dengan Sinta**
  - Auto-fetch journal data by ISSN
  - Update Sinta level automatically
  - Sync author/citation data
  - **Note**: Menunggu akses API dari Sinta

#### PDDIKTI Integration
- [ ] **PTM Code Integration**
  - Gunakan PTM code sebagai identifier
  - Validasi saat input universitas baru
  - Link ke data PDDIKTI untuk verifikasi

---

## 🔧 Technical Implementation Notes

### Database Changes Required

1. **Users Table**
   ```sql
   ALTER TABLE users ADD COLUMN scientific_field_id BIGINT UNSIGNED NULL;
   ALTER TABLE users ADD FOREIGN KEY (scientific_field_id) REFERENCES scientific_fields(id);
   ```

2. **User Roles Pivot Table** (Multi-role support)
   ```sql
   CREATE TABLE user_roles (
       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       user_id BIGINT UNSIGNED NOT NULL,
       role_id BIGINT UNSIGNED NOT NULL,
       assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       assigned_by BIGINT UNSIGNED NULL,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
       FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
       UNIQUE KEY unique_user_role (user_id, role_id)
   );
   ```

3. **Universities Table Enhancement**
   ```sql
   ALTER TABLE universities ADD COLUMN ptm_code VARCHAR(10) UNIQUE NULL;
   ALTER TABLE universities ADD COLUMN accreditation_status VARCHAR(50) NULL;
   ALTER TABLE universities ADD COLUMN cluster VARCHAR(50) NULL;
   ALTER TABLE universities ADD COLUMN profile_description VARCHAR(250) NULL;
   ```

4. **Journals Table Enhancement**
   ```sql
   ALTER TABLE journals ADD COLUMN sinta_level VARCHAR(10) NULL;
   ALTER TABLE journals ADD COLUMN dikti_accreditation VARCHAR(50) NULL;
   ALTER TABLE journals ADD COLUMN indexations JSON NULL; -- Store array of indexations
   ```

5. **Pembinaan (Coaching) Tables**
   ```sql
   CREATE TABLE pembinaan (
       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255) NOT NULL,
       category ENUM('akreditasi', 'indeksasi') NOT NULL,
       accreditation_template_id BIGINT UNSIGNED NULL,
       registration_start DATETIME NOT NULL,
       registration_end DATETIME NOT NULL,
       assessment_start DATETIME NOT NULL,
       assessment_end DATETIME NOT NULL,
       quota INT NULL,
       status ENUM('draft', 'active', 'closed') DEFAULT 'draft',
       created_by BIGINT UNSIGNED NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (accreditation_template_id) REFERENCES accreditation_templates(id),
       FOREIGN KEY (created_by) REFERENCES users(id)
   );

   CREATE TABLE pembinaan_registrations (
       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       pembinaan_id BIGINT UNSIGNED NOT NULL,
       journal_id BIGINT UNSIGNED NOT NULL,
       user_id BIGINT UNSIGNED NOT NULL, -- Pengelola who registered
       status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
       registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       reviewed_at TIMESTAMP NULL,
       reviewed_by BIGINT UNSIGNED NULL,
       rejection_reason TEXT NULL,
       FOREIGN KEY (pembinaan_id) REFERENCES pembinaan(id) ON DELETE CASCADE,
       FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
   );

   CREATE TABLE pembinaan_reviews (
       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       registration_id BIGINT UNSIGNED NOT NULL,
       reviewer_id BIGINT UNSIGNED NOT NULL,
       score DECIMAL(5,2) NULL,
       feedback TEXT NULL,
       recommendation TEXT NULL,
       reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (registration_id) REFERENCES pembinaan_registrations(id) ON DELETE CASCADE,
       FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

6. **Add Reviewer Assignments Table**
   ```sql
   CREATE TABLE reviewer_assignments (
       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       reviewer_id BIGINT UNSIGNED NOT NULL,
       registration_id BIGINT UNSIGNED NOT NULL,
       assigned_by BIGINT UNSIGNED NOT NULL,
       assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
       FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (registration_id) REFERENCES pembinaan_registrations(id) ON DELETE CASCADE,
       FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

### Frontend Changes Required

1. **New Pages to Create**
   - `resources/js/pages/Admin/Universities/Index.tsx` - Universities list
   - `resources/js/pages/Admin/Universities/Create.tsx` - Add university
   - `resources/js/pages/Admin/Universities/Edit.tsx` - Edit university (with PTM code, accreditation, cluster)
   - `resources/js/pages/Admin/Pembinaan/Index.tsx` - Pembinaan management
   - `resources/js/pages/Admin/Pembinaan/Create.tsx` - Create pembinaan
   - `resources/js/pages/User/Pembinaan/Index.tsx` - Available pembinaan for users
   - `resources/js/pages/User/Pembinaan/Register.tsx` - Register for pembinaan
   - `resources/js/pages/User/Pembinaan/Assessment.tsx` - Fill assessment
   - `resources/js/pages/Reviewer/Assignments/Index.tsx` - Reviewer dashboard
   - `resources/js/pages/Reviewer/Assignments/Review.tsx` - Review assessment

2. **Components to Update**
   - Update `UserForm` component to support multiple role selection
   - Add `ScientificFieldSelect` component
   - Add `SintaBadge`, `IndexationBadge`, `AccreditationBadge` components
   - Update Journal cards to show status badges

3. **Layout Updates**
   - Update sidebar menu structure (separate Universities Management)
   - Add conditional menu items based on roles
   - Reviewer menu only visible to users with reviewer role

### Backend Changes Required

1. **New Controllers**
   - `UniversityController` (for Super Admin)
   - `PembinaanController` (CRUD pembinaan)
   - `PembinaanRegistrationController` (user registration)
   - `ReviewerController` (reviewer dashboard & review submission)

2. **Update Existing Controllers**
   - `UserController`: Support multi-role assignment
   - `JournalController`: Add filters, ownership transfer

3. **New Policies**
   - `PembinaanPolicy`
   - `PembinaanRegistrationPolicy`
   - `ReviewerPolicy`

4. **Update Existing Policies**
   - `UserPolicy`: Check all roles user has
   - `JournalPolicy`: Support ownership transfer authorization

5. **New Middleware**
   - Update `CheckRole` to support multiple roles check

---

## 📝 Implementation Priority

### Phase 1 (High Priority - Week 1-2)
1. ✅ Borang Indikator (DONE)
2. ✅Universities Management enhancement (PTM code, accreditation, cluster, 250 char profile)
3. ✅Multi-role system (database + UI)
4. ✅User Management consolidation
5. ✅Scientific Field in user profile

### Phase 2 (Medium Priority - Week 3-4)
6. Journal profile enhancement (Sinta, indexation, accreditation status)
7. Filter improvements
8. Dashboard statistics
9. Journal ownership transfer

### Phase 3 (Medium Priority - Week 5-6)
10. Pembinaan system (create, register, assign)
11. Assessment flow
12. Reviewer system

### Phase 4 (Low Priority - Future)
13. Journal landing page
14. Sinta API integration
15. Advanced reporting

---

## 🎯 Next Steps

1. **Database Migration**: Create migrations for all schema changes
2. **Seeders Update**: Update seeders for new roles (Pengelola Jurnal, Reviewer)
3. **Policy Refactor**: Implement multi-role authorization
4. **UI Components**: Build reusable components for status badges
5. **Testing**: Write tests for new multi-role functionality

---

## 📌 Catatan Penting

- **PTM Code** sangat penting untuk integrasi sistem nasional (Sinta, Garuda, dll)
- **Multi-role system** adalah kunci untuk fleksibilitas sistem
- **Pembinaan system** adalah fitur utama yang membedakan aplikasi ini
- **Landing page jurnal** masih dalam tahap perencanaan (scope belum final)
- **API Sinta** masih menunggu akses dari pihak Sinta

---

**Prepared by**: GitHub Copilot  
**Last Updated**: 22 Januari 2026
