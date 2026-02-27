## 🎯 Filosofi MVP untuk Proyek AJM

Untuk solo developer dengan waktu terbatas, saya merekomendasikan:

### **Strategi: Focus on ONE Critical User Flow (End-to-End)**

**FOKUS: User (Pengelola Jurnal) → Admin Kampus → Super Admin (Linear Flow)**

**Alasan:**
- ✅ **Value Chain Lengkap**: Dari input data sampai monitoring
- ✅ **Demonstrable**: Bisa demo flow lengkap ke stakeholder
- ✅ **Scalable**: Fitur lain bisa ditambah bertahap
- ✅ **Real Impact**: User langsung bisa pakai untuk submit jurnal

---

## 🏆 TOP 10 FITUR KRITIS MVP v1.0

### **TIER 1: MUST HAVE (Core Value) - 60% Effort**

#### 1️⃣ **Authentication & SSO (Semua Role)**
**User Story:** *"Sebagai user, saya ingin login dengan akun Google agar tidak perlu ingat password baru"*

**Scope:**
- Login/Register dengan email + password
- Login dengan Google SSO (pakai Laravel Socialite)
- Logout
- Role assignment (Super Admin, Admin Kampus, User)

**Why Critical:** Tanpa ini, tidak ada yang bisa masuk sistem.

---

#### 2️⃣ **Role-Based Dashboard (Semua Role)**
**User Story:** *"Sebagai [role], saya ingin melihat ringkasan data yang relevan dengan tugas saya"*

**Scope:**
- **Super Admin Dashboard:**
  - Total PTM terdaftar
  - Total jurnal di sistem
  - Grafik sederhana (line chart: pertumbuhan jurnal per bulan)
  
- **Admin Kampus Dashboard:**
  - Total jurnal di kampusnya
  - Total pengelola jurnal (user) di kampusnya
  - Status self-assessment jurnal
  
- **User Dashboard:**
  - List jurnal yang saya kelola (max 3-5 jurnal)
  - Status self-assessment per jurnal
  - Skor self-assessment (jika sudah submit)

**Why Critical:** Ini "home base" setiap role. Harus ada sejak awal.

---

#### 3️⃣ **Manajemen Master Data PTM (Super Admin Only)**
**User Story:** *"Sebagai Super Admin, saya ingin mengelola daftar PTM agar sistem tahu kampus mana saja yang terdaftar"*

**Scope:**
- CRUD PTM (Create, Read, Update, Delete)
- Data minimal:
  - Nama PTM
  - Kode PTM
  - Alamat
  - Logo (optional untuk MVP)
- List PTM dengan search & pagination

**Why Critical:** Foundational data. Tanpa ini, tidak ada struktur organisasi.

---

#### 4️⃣ **Manajemen Admin Kampus (Super Admin Only)**
**User Story:** *"Sebagai Super Admin, saya ingin menambahkan Admin Kampus agar setiap PTM punya PIC"*

**Scope:**
- CRUD Admin Kampus
- Assign Admin ke PTM tertentu
- Data minimal:
  - Nama
  - Email
  - PTM assignment
  - Status (aktif/nonaktif)

**Why Critical:** Struktur hierarki. Super Admin → Admin Kampus → User.

---

#### 5️⃣ **Manajemen Pengelola Jurnal/User (Admin Kampus Only)**
**User Story:** *"Sebagai Admin Kampus, saya ingin menambahkan pengelola jurnal di kampus saya"*

**Scope:**
- CRUD User (pengelola jurnal) **hanya untuk kampusnya sendiri**
- Data minimal:
  - Nama
  - Email
  - Jabatan (dosen/staf)
- **Policy:** Admin Kampus hanya bisa CRUD user dari kampusnya

**Why Critical:** Admin Kampus harus bisa onboard user sendiri.

---

### **TIER 2: SHOULD HAVE (Core Functionality) - 30% Effort**

#### 6️⃣ **Input Data Jurnal (User Only)**
**User Story:** *"Sebagai User, saya ingin menginput data jurnal yang saya kelola"*

**Scope:**
- Form tambah jurnal dengan field:
  - Nama jurnal
  - ISSN
  - URL jurnal
  - Bidang ilmu (dropdown dari master data)
  - Peringkat SINTA (jika ada)
  - E-ISSN
  - Frekuensi terbit
- Edit & Delete jurnal milik sendiri
- **Policy:** User hanya bisa edit jurnal yang dia kelola

**Why Critical:** Core value untuk User. Tanpa ini, User tidak bisa submit apa-apa.

---

#### 7️⃣ **Self-Assessment Sederhana (User Only)**
**User Story:** *"Sebagai User, saya ingin mengisi self-assessment jurnal saya"*

**Scope (SIMPLIFIED untuk MVP):**
- Borang versi MINI (3-5 kategori utama saja):
  1. **Kelengkapan Administrasi** (4 indikator)
  2. **Kualitas Konten** (4 indikator)
  3. **Proses Editorial** (4 indikator)
  
- Setiap indikator:
  - Pertanyaan
  - Pilihan: Ya/Tidak atau Skala 1-5
  - Upload 1 file bukti (PDF/JPG) - optional
  - Komentar/catatan - optional
  
- Auto-calculate skor total
- Status: Draft / Submitted

**Why Critical:** Ini "produk" yang dihasilkan User. Harus ada, tapi versi sederhana dulu.

**⚠️ PENTING:** Jangan bikin borang lengkap dulu (50+ indikator). Mulai dari 12 indikator saja. Nanti bisa ditambah.

---

#### 8️⃣ **View List Jurnal (Admin Kampus & Super Admin)**
**User Story:** *"Sebagai Admin, saya ingin melihat semua jurnal yang sudah terdaftar"*

**Scope:**
- **Admin Kampus:** Lihat jurnal dari kampusnya saja
- **Super Admin:** Lihat semua jurnal dari semua PTM
- Tabel dengan kolom:
  - Nama jurnal
  - ISSN
  - PTM
  - Pengelola
  - Status self-assessment
  - Skor (jika sudah submit)
- Filter:
  - By PTM (untuk Super Admin)
  - By status (Draft/Submitted)
  - Search by nama jurnal
- Pagination

**Why Critical:** Admin harus bisa monitoring. Ini fitur "read-only" yang essential.

---

#### 9️⃣ **View Detail Jurnal & Assessment (Admin Kampus & Super Admin)**
**User Story:** *"Sebagai Admin, saya ingin melihat detail jurnal dan hasil self-assessment"*

**Scope:**
- Halaman detail dengan:
  - Info jurnal lengkap
  - Hasil self-assessment (read-only)
  - Skor per kategori
  - File bukti yang diupload (bisa download)
- **Tidak ada fitur edit** untuk Admin (read-only)

**Why Critical:** Admin perlu lihat hasil assessment untuk decision making.

---

### **TIER 3: NICE TO HAVE (Polish) - 10% Effort**

#### 🔟 **Landing Page Public (No Auth Required)**
**User Story:** *"Sebagai pengunjung, saya ingin tahu apa itu AJM dan melihat statistik jurnal PTM"*

**Scope (SUPER SIMPLE):**
- Hero section:
  - Judul: "Asistensi Jurnal Muhammadiyah"
  - Tagline: "Platform manajemen jurnal ilmiah PTM se-Indonesia"
  - CTA button: "Login" (redirect ke /login)
  
- Section statistik (ambil dari API):
  - Total PTM
  - Total Jurnal
  - Total Jurnal Terakreditasi (jika ada)
  
- Footer:
  - Copyright
  - Link: About, Contact

**Why Nice to Have:** Ini "etalase", bukan core functionality. Bisa pakai template sederhana.

---

## 📊 Comparison: Balanced vs Focused Approach

| Aspek | ❌ Balanced (All Roles) | ✅ Focused (One Flow) |
|-------|------------------------|----------------------|
| **Timeline** | 6+ bulan | 3-4 bulan |
| **Risk** | High (banyak fitur setengah jadi) | Low (sedikit tapi complete) |
| **Demo-able** | Susah (fitur terpencar) | Mudah (flow lengkap) |
| **User Adoption** | Lambat (semua setengah2) | Cepat (core flow ready) |
| **Bug Density** | Tinggi | Rendah |

---

## 🎯 REKOMENDASI FINAL

### **MVP Focus: User-Centric Flow**

```
[Super Admin] Setup PTM & Admin Kampus
       ↓
[Admin Kampus] Setup User (Pengelola Jurnal)
       ↓
[User] Input Jurnal + Self-Assessment
       ↓
[Admin Kampus] View & Monitor Jurnal
       ↓
[Super Admin] View All Jurnal (Cross-PTM)
```

**Fitur yang TIDAK masuk MVP v1.0 (bisa v1.1+):**
- ❌ Modul Pembinaan (request, assign reviewer, feedback)
- ❌ Manajemen Reviewer
- ❌ Support/Ticketing System
- ❌ Resources Management (upload materi)
- ❌ Manajemen Bidang Ilmu (hardcode dulu di seeder)
- ❌ Real-time notification
- ❌ Advanced analytics (cukup statistik sederhana)
- ❌ Export PDF/Excel
- ❌ Email notification (log dulu, kirim email nanti)

---

## 🏗️ MVP Development Priority

### **Phase 1: Foundation (Week 1-3)**
1. Auth & SSO ✅
2. Role-based routing ✅
3. Dashboard skeleton (semua role) ✅

### **Phase 2: Admin Setup (Week 4-5)**
4. Master PTM (Super Admin) ✅
5. Master Admin Kampus (Super Admin) ✅
6. Master User (Admin Kampus) ✅

### **Phase 3: Core User Flow (Week 6-9)**
7. Input Jurnal (User) ✅
8. Self-Assessment Mini (User) ✅

### **Phase 4: Monitoring (Week 10-11)**
9. View List Jurnal (Admin) ✅
10. View Detail Assessment (Admin) ✅

### **Phase 5: Public Face (Week 12)**
11. Landing Page ✅

### **Phase 6: Testing & Launch (Week 13-14)**
- Testing end-to-end
- Bug fixes
- Deployment

---

## 💡 Validasi dengan Stakeholder

Sebelum mulai coding, **wajib validasi** ke stakeholder:

**Pertanyaan untuk Stakeholder:**
1. *"Untuk MVP, kami fokus ke flow: Super Admin setup kampus → Admin Kampus setup user → User input jurnal & self-assessment → Admin monitor. Apakah ini cukup untuk launch awal?"*

2. *"Modul pembinaan (assign reviewer, feedback) akan masuk di v1.1 setelah MVP stabil. Apakah ini acceptable?"*

3. *"Self-assessment di MVP akan disederhanakan jadi 12 indikator dulu (bukan 50+). Nanti bisa ditambah. Apakah OK?"*

**Red Flag jika jawaban mereka:**
- 🚩 "Semua fitur harus ada di v1.0" → Negosiasi ulang atau minta tambah resource
- 🚩 "Modul pembinaan harus ada di awal" → Mungkin perlu re-prioritize (buang fitur lain)

---

## 🎬 Kesimpulan

**Rekomendasi Saya:**

✅ **FOKUS ke 10 fitur di atas (User-centric flow)**  
✅ **Balance antara 3 role, tapi dengan scope minimal per role**  
✅ **Pastikan 1 flow lengkap (end-to-end) bisa jalan**  
✅ **Sisanya iterasi di v1.1, v1.2, dst**

**Timeline Realistis untuk Solo Developer:**
- **MVP v1.0:** 12-14 minggu (3-3.5 bulan)
- **MVP v1.1** (+ Pembinaan): 4 minggu lagi
- **MVP v1.2** (+ Support & Resources): 3 minggu lagi

---