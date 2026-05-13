Sempurna! Mari kita buat **ERD Database** yang solid untuk 10 fitur MVP Anda. Saya akan design database yang **normalized, scalable, dan mengikuti best practice Laravel**.

## 🗄️ ERD Database - Platform AJM (Updated for v1.1)

**Version History:**
- **v1.0 (Q1 2026):** Base MVP schema - Authentication, RBAC, Journals, Self-Assessment
- **v1.1 (Q2 2026):** Added Pembinaan/Coaching tables, Reviewer management

### **Database Design Principles:**
- ✅ **Normalized** (3NF - Third Normal Form)
- ✅ **Laravel Conventions** (snake_case, timestamps, soft deletes)
- ✅ **Scalable** (siap untuk fitur v1.1+)
- ✅ **Indexed** (untuk query performance)

---

## 📋 Table Structure Overview

### **v1.0 Tables (Base MVP)**
```
┌─────────────────┐
│     users       │ (Semua role: Super Admin, Admin Kampus, User)
└────────┬────────┘
         │
         ├──────────┬─────────────────────────────┐
         │          │                             │
┌────────▼────────┐ │                    ┌────────▼────────┐
│  universities   │ │                    │     roles       │
│      (PTM)      │ │                    └─────────────────┘
└────────┬────────┘ │
         │          │
         │  ┌───────▼────────┐
         │  │    journals    │
         │  └───────┬────────┘
         │          │
         │  ┌───────▼──────────────┐
         │  │  journal_assessments │
         │  └───────┬──────────────┘
         │          │
         │  ┌───────▼─────────────────────┐
         │  │ assessment_responses        │
         │  │ (jawaban per indikator)     │
         │  └───────┬─────────────────────┘
         │          │
         │  ┌───────▼─────────────────────┐
         │  │ assessment_attachments      │
         │  │ (file bukti)                │
         │  └─────────────────────────────┘
         │
┌────────▼────────────────┐
│  scientific_fields      │
│  (Bidang Ilmu)          │
└─────────────────────────┘
         │
┌────────▼────────────────┐
│ evaluation_indicators   │
│ (Borang Indikator)      │
└─────────────────────────┘
```

### **v1.1 New Tables (Pembinaan/Coaching Module)**
```
┌───────────────────┐
│     journals      │ (from v1.0)
└─────────┬─────────┘
          │
          │  ┌────────────────────────┐
          └──│  coaching_requests     │
             │  (User requests help)  │
             └─────────┬──────────────┘
                       │
                       ├──────────────────────────────────┐
                       │                                  │
              ┌────────▼───────────────┐        ┌────────▼────────────┐
              │ coaching_assignments   │        │  coaching_feedback  │
              │ (Admin assigns reviewer)│        │ (Reviewer feedback) │
              └────────────────────────┘        └─────────────────────┘
                       │
              ┌────────▼────────┐
              │     users       │ (reviewers: is_reviewer=true)
              └─────────────────┘
```

---

## 📝 Detailed Table Schemas

### **1. `users` Table**
> Menyimpan semua user (Super Admin, Admin Kampus, User/Pengelola Jurnal)

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NULL, -- Nullable untuk SSO-only users
    
    -- SSO Fields
    google_id VARCHAR(255) NULL UNIQUE,
    microsoft_id VARCHAR(255) NULL UNIQUE,
    avatar_url VARCHAR(500) NULL,
    
    -- Profile
    phone VARCHAR(20) NULL,
    position VARCHAR(100) NULL COMMENT 'Jabatan: Dosen, Staf, dll',
    
    -- Role & Organization
    role_id BIGINT UNSIGNED NOT NULL,
    university_id BIGINT UNSIGNED NULL COMMENT 'Null untuk Super Admin',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    
    -- Remember Token
    remember_token VARCHAR(100) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_role_id (role_id),
    INDEX idx_university_id (university_id),
    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    
    -- Foreign Keys
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Penjelasan:**
- `role_id`: Foreign key ke tabel `roles`
- `university_id`: NULL untuk Super Admin, wajib isi untuk Admin Kampus & User
- `google_id` / `microsoft_id`: Untuk SSO
- `deleted_at`: Soft delete (Laravel soft deletes)

---

### **2. `roles` Table**
> Menyimpan role: Super Admin, Admin Kampus, User

```sql
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'super_admin, admin_kampus, user',
    display_name VARCHAR(100) NOT NULL COMMENT 'Super Admin, Admin Kampus, Pengelola Jurnal',
    description TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed Data:**
```sql
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'Super Admin', 'Akses penuh ke semua data PTM'),
('admin_kampus', 'Admin Kampus', 'Mengelola data jurnal dan user di kampusnya'),
('user', 'Pengelola Jurnal', 'Mengelola jurnal yang ditugaskan');
```

---

### **3. `universities` Table**
> Menyimpan data Perguruan Tinggi Muhammadiyah (PTM)

```sql
CREATE TABLE universities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Info
    code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Kode PTM unik, e.g., UAD, UMY',
    name VARCHAR(255) NOT NULL COMMENT 'Nama lengkap PTM',
    short_name VARCHAR(100) NULL COMMENT 'Nama singkat',
    
    -- Contact
    address TEXT NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,
    postal_code VARCHAR(10) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    
    -- Branding
    logo_url VARCHAR(500) NULL COMMENT 'URL logo PTM',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **4. `scientific_fields` Table**
> Menyimpan bidang ilmu (master data)

```sql
CREATE TABLE scientific_fields (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Kode bidang ilmu, e.g., COMP, MED',
    name VARCHAR(255) NOT NULL COMMENT 'Nama bidang ilmu',
    description TEXT NULL,
    
    -- Hierarchy (optional untuk grouping)
    parent_id BIGINT UNSIGNED NULL COMMENT 'Untuk sub-bidang ilmu',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    
    -- Foreign Keys
    FOREIGN KEY (parent_id) REFERENCES scientific_fields(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed Data Example:**
```sql
INSERT INTO scientific_fields (code, name) VALUES
('COMP', 'Ilmu Komputer'),
('MED', 'Ilmu Kedokteran'),
('EDU', 'Ilmu Pendidikan'),
('ENG', 'Teknik'),
('SOC', 'Ilmu Sosial'),
('ECO', 'Ekonomi dan Bisnis');
```

---

### **5. `journals` Table**
> Menyimpan data jurnal yang dikelola oleh User

```sql
CREATE TABLE journals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Ownership
    university_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Pengelola jurnal (User)',
    
    -- Basic Info
    title VARCHAR(255) NOT NULL COMMENT 'Nama jurnal',
    issn VARCHAR(20) NULL COMMENT 'ISSN cetak',
    e_issn VARCHAR(20) NULL COMMENT 'ISSN elektronik',
    
    -- Publication Details
    url VARCHAR(500) NULL COMMENT 'URL jurnal',
    publisher VARCHAR(255) NULL COMMENT 'Penerbit',
    frequency VARCHAR(50) NULL COMMENT 'Frekuensi terbit: Bulanan, Triwulan, dll',
    first_published_year YEAR NULL COMMENT 'Tahun terbit pertama',
    
    -- Classification
    scientific_field_id BIGINT UNSIGNED NULL,
    
    -- Indexing & Accreditation
    sinta_rank TINYINT NULL COMMENT '1-6, atau NULL jika belum terindeks',
    accreditation_status VARCHAR(50) NULL COMMENT 'Terakreditasi/Belum',
    accreditation_grade VARCHAR(10) NULL COMMENT 'S1, S2, S3, S4',
    
    -- Contact
    editor_in_chief VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_university_id (university_id),
    INDEX idx_user_id (user_id),
    INDEX idx_scientific_field_id (scientific_field_id),
    INDEX idx_sinta_rank (sinta_rank),
    INDEX idx_title (title),
    
    -- Foreign Keys
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scientific_field_id) REFERENCES scientific_fields(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **6. `evaluation_indicators` Table**
> Menyimpan borang indikator self-assessment (master template)

```sql
CREATE TABLE evaluation_indicators (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Hierarchy: Category > Sub-Category > Indicator
    category VARCHAR(100) NOT NULL COMMENT 'Kategori utama, e.g., Kelengkapan Administrasi',
    sub_category VARCHAR(100) NULL COMMENT 'Sub-kategori (optional)',
    
    -- Indicator Details
    code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Kode indikator, e.g., ADM-01',
    question TEXT NOT NULL COMMENT 'Pertanyaan indikator',
    description TEXT NULL COMMENT 'Penjelasan detail',
    
    -- Scoring
    weight DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Bobot penilaian',
    answer_type ENUM('boolean', 'scale', 'text') DEFAULT 'boolean' 
        COMMENT 'boolean: Ya/Tidak, scale: 1-5, text: input bebas',
    
    -- Attachment
    requires_attachment BOOLEAN DEFAULT FALSE COMMENT 'Wajib upload bukti?',
    
    -- Ordering
    sort_order INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category (category),
    INDEX idx_code (code),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed Data Example (12 indikator untuk MVP):**
```sql
-- Kategori 1: Kelengkapan Administrasi (4 indikator)
INSERT INTO evaluation_indicators (code, category, question, answer_type, weight, sort_order) VALUES
('ADM-01', 'Kelengkapan Administrasi', 'Apakah jurnal memiliki ISSN yang valid?', 'boolean', 2.00, 1),
('ADM-02', 'Kelengkapan Administrasi', 'Apakah jurnal memiliki website resmi yang aktif?', 'boolean', 1.50, 2),
('ADM-03', 'Kelengkapan Administrasi', 'Apakah jurnal memiliki struktur dewan redaksi yang jelas?', 'boolean', 1.50, 3),
('ADM-04', 'Kelengkapan Administrasi', 'Apakah jurnal memiliki pedoman penulisan yang dipublikasikan?', 'boolean', 1.00, 4);

-- Kategori 2: Kualitas Konten (4 indikator)
INSERT INTO evaluation_indicators (code, category, question, answer_type, weight, sort_order) VALUES
('KON-01', 'Kualitas Konten', 'Apakah jurnal menggunakan sistem peer review?', 'boolean', 3.00, 5),
('KON-02', 'Kualitas Konten', 'Berapa persentase artikel dari penulis eksternal?', 'scale', 2.00, 6),
('KON-03', 'Kualitas Konten', 'Apakah jurnal memiliki artikel dengan sitasi?', 'boolean', 2.50, 7),
('KON-04', 'Kualitas Konten', 'Apakah artikel menggunakan template yang konsisten?', 'boolean', 1.00, 8);

-- Kategori 3: Proses Editorial (4 indikator)
INSERT INTO evaluation_indicators (code, category, question, answer_type, weight, sort_order) VALUES
('EDT-01', 'Proses Editorial', 'Apakah jurnal memiliki SOP review yang terdokumentasi?', 'boolean', 2.00, 9),
('EDT-02', 'Proses Editorial', 'Berapa lama rata-rata waktu review (dalam hari)?', 'scale', 1.50, 10),
('EDT-03', 'Proses Editorial', 'Apakah jurnal menggunakan sistem manajemen jurnal (OJS/lainnya)?', 'boolean', 2.50, 11),
('EDT-04', 'Proses Editorial', 'Apakah jurnal melakukan pengecekan plagiasi?', 'boolean', 3.00, 12);
```

---

### **7. `journal_assessments` Table**
> Menyimpan header/summary dari setiap self-assessment yang dilakukan User

```sql
CREATE TABLE journal_assessments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Ownership
    journal_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'User yang mengisi assessment',
    
    -- Assessment Info
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period VARCHAR(20) NULL COMMENT 'Periode assessment, e.g., 2025-Q1',
    
    -- Status
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT UNSIGNED NULL COMMENT 'Admin yang review (untuk v1.1+)',
    
    -- Scoring
    total_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Total skor (auto-calculated)',
    max_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Skor maksimal',
    percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Persentase (total/max * 100)',
    
    -- Notes
    notes TEXT NULL COMMENT 'Catatan dari User',
    admin_notes TEXT NULL COMMENT 'Catatan dari Admin (untuk v1.1+)',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_journal_id (journal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_assessment_date (assessment_date),
    
    -- Foreign Keys
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **8. `assessment_responses` Table**
> Menyimpan jawaban per indikator dalam sebuah assessment

```sql
CREATE TABLE assessment_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relationships
    journal_assessment_id BIGINT UNSIGNED NOT NULL,
    evaluation_indicator_id BIGINT UNSIGNED NOT NULL,
    
    -- Response
    answer_boolean BOOLEAN NULL COMMENT 'Untuk answer_type: boolean',
    answer_scale TINYINT NULL COMMENT 'Untuk answer_type: scale (1-5)',
    answer_text TEXT NULL COMMENT 'Untuk answer_type: text',
    
    -- Scoring
    score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Skor untuk jawaban ini',
    
    -- Notes
    notes TEXT NULL COMMENT 'Catatan tambahan dari User',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_journal_assessment_id (journal_assessment_id),
    INDEX idx_evaluation_indicator_id (evaluation_indicator_id),
    
    -- Foreign Keys
    FOREIGN KEY (journal_assessment_id) REFERENCES journal_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluation_indicator_id) REFERENCES evaluation_indicators(id) ON DELETE CASCADE,
    
    -- Unique Constraint (satu indikator hanya dijawab 1x per assessment)
    UNIQUE KEY unique_assessment_indicator (journal_assessment_id, evaluation_indicator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Scoring Logic Example:**
```
- answer_type = 'boolean':
  - TRUE = bobot penuh (sesuai evaluation_indicators.weight)
  - FALSE = 0
  
- answer_type = 'scale' (1-5):
  - score = (answer_scale / 5) * weight
  
- answer_type = 'text':
  - score = 0 (tidak dihitung otomatis, butuh review manual)
```

---

### **9. `assessment_attachments` Table**
> Menyimpan file bukti yang diupload untuk setiap jawaban assessment

```sql
CREATE TABLE assessment_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relationships
    assessment_response_id BIGINT UNSIGNED NOT NULL,
    
    -- File Info
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL COMMENT 'Nama file di storage',
    file_path VARCHAR(500) NOT NULL COMMENT 'Path di storage',
    file_size INT UNSIGNED NOT NULL COMMENT 'Ukuran file dalam bytes',
    mime_type VARCHAR(100) NOT NULL COMMENT 'e.g., application/pdf, image/jpeg',
    
    -- Uploader
    uploaded_by BIGINT UNSIGNED NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_assessment_response_id (assessment_response_id),
    INDEX idx_uploaded_by (uploaded_by),
    
    -- Foreign Keys
    FOREIGN KEY (assessment_response_id) REFERENCES assessment_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Storage Strategy:**
- Gunakan Laravel Storage Facade
- Path structure: `assessments/{journal_id}/{assessment_id}/{indicator_code}/{filename}`
- Max file size: 5MB (bisa diatur di validation)
- Allowed types: PDF, JPG, PNG, DOCX

---

## 🔗 Relationship Summary

```
users (1) ─────── (M) journals
  │                     │
  │                     └── (1) ────── (M) journal_assessments
  │                                           │
  └── (M) ────── (1) roles                    │
  │                                           ├── (M) ────── (M) evaluation_indicators
  └── (M) ────── (1) universities             │              (via assessment_responses)
                                              │
                                              └── (1) ────── (M) assessment_attachments
                                                                  (via assessment_responses)

scientific_fields (1) ─────── (M) journals
```

**Cardinality:**
- **1 User** → **M Journals** (User bisa kelola banyak jurnal)
- **1 Journal** → **M Journal Assessments** (Jurnal bisa di-assess berkali-kali)
- **1 Journal Assessment** → **M Assessment Responses** (12 indikator = 12 responses)
- **1 Assessment Response** → **M Attachments** (bisa upload banyak file bukti)

---

## 📊 ER Diagram (Visual)

Saya akan buatkan visual ERD menggunakan Mermaid syntax:

```mermaid
erDiagram
    roles ||--o{ users : has
    universities ||--o{ users : employs
    users ||--o{ journals : manages
    universities ||--o{ journals : owns
    scientific_fields ||--o{ journals : categorizes
    journals ||--o{ journal_assessments : has
    users ||--o{ journal_assessments : creates
    journal_assessments ||--o{ assessment_responses : contains
    evaluation_indicators ||--o{ assessment_responses : defines
    assessment_responses ||--o{ assessment_attachments : includes
    users ||--o{ assessment_attachments : uploads

    roles {
        bigint id PK
        string name UK
        string display_name
    }

    users {
        bigint id PK
        string name
        string email UK
        string google_id UK
        bigint role_id FK
        bigint university_id FK
        boolean is_active
    }

    universities {
        bigint id PK
        string code UK
        string name
        string city
        boolean is_active
    }

    scientific_fields {
        bigint id PK
        string code UK
        string name
        bigint parent_id FK
    }

    journals {
        bigint id PK
        bigint university_id FK
        bigint user_id FK
        string title
        string issn
        bigint scientific_field_id FK
        int sinta_rank
    }

    evaluation_indicators {
        bigint id PK
        string code UK
        string category
        text question
        enum answer_type
        decimal weight
    }

    journal_assessments {
        bigint id PK
        bigint journal_id FK
        bigint user_id FK
        enum status
        decimal total_score
        date assessment_date
    }

    assessment_responses {
        bigint id PK
        bigint journal_assessment_id FK
        bigint evaluation_indicator_id FK
        boolean answer_boolean
        int answer_scale
        text answer_text
        decimal score
    }

    assessment_attachments {
        bigint id PK
        bigint assessment_response_id FK
        string original_filename
        string file_path
        bigint uploaded_by FK
    }
```

---

## 🎯 Key Design Decisions

### 1. **Why Separate `assessment_responses` and `assessment_attachments`?**
- ✅ Flexibility: 1 response bisa punya multiple files
- ✅ Easier file management
- ✅ Query performance (tidak bloat tabel responses)

### 2. **Why `total_score` in `journal_assessments`?**
- ✅ Denormalisasi untuk performance (tidak perlu SUM setiap query)
- ✅ Update via Laravel Observer/Event saat responses diubah

### 3. **Why ENUM for `status` and `answer_type`?**
- ✅ Data integrity (hanya nilai valid yang bisa masuk)
- ✅ Lebih efisien storage daripada VARCHAR

### 4. **Why Soft Deletes (`deleted_at`)?**
- ✅ Audit trail (data tidak hilang permanen)
- ✅ Bisa restore jika salah hapus
- ✅ Laravel convention

---

## 🚀 Next Steps

Setelah ERD ini, kita bisa generate:

1. **Laravel Migration Files** - Siap pakai untuk `php artisan migrate`
2. **Laravel Models** - Dengan relationships sudah didefinisikan
3. **Seeder Files** - Untuk populate data dummy (roles, scientific_fields, dll)
4. **Factory Files** - Untuk testing (generate fake data)

---

## 🆕 V1.1 NEW TABLES (Pembinaan/Coaching Module)

### **10. `coaching_requests` Table**
> Menyimpan permintaan pembinaan/coaching dari User untuk jurnal mereka

```sql
CREATE TABLE coaching_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relationships
    journal_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Requester (User yang minta pembinaan)',
    university_id BIGINT UNSIGNED NOT NULL COMMENT 'For scoping by Admin Kampus',
    
    -- Request Details
    request_type ENUM('akreditasi', 'indeksasi', 'editorial', 'technical') NOT NULL
        COMMENT 'Jenis bantuan yang diminta',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    description TEXT NOT NULL COMMENT 'Penjelasan kebutuhan pembinaan',
    attachment_path VARCHAR(500) NULL COMMENT 'File pendukung (optional)',
    
    -- Status Tracking
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    rejected_reason TEXT NULL COMMENT 'Alasan jika ditolak',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_journal_id (journal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_university_id (university_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_requested_at (requested_at),
    
    -- Foreign Keys
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Rules:**
- User can only request coaching for journals with **reviewed assessments** (status='reviewed')
- One journal can have multiple coaching requests over time
- Requests can be edited/deleted only if status='pending'

---

### **11. `coaching_assignments` Table**
> Menyimpan assignment reviewer ke coaching request oleh Admin Kampus

```sql
CREATE TABLE coaching_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relationships
    coaching_request_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL COMMENT 'User yang ditugaskan sebagai reviewer',
    assigned_by BIGINT UNSIGNED NOT NULL COMMENT 'Admin Kampus yang assign',
    
    -- Assignment Details
    notes_to_reviewer TEXT NULL COMMENT 'Catatan dari admin untuk reviewer',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_coaching_request_id (coaching_request_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_assigned_by (assigned_by),
    
    -- Foreign Keys
    FOREIGN KEY (coaching_request_id) REFERENCES coaching_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Rule: 1 coaching request = 1 active assignment (can be reassigned)
    UNIQUE KEY unique_coaching_request (coaching_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Rules:**
- One coaching request can only have ONE active assignment at a time
- Admin can reassign (delete old assignment, create new one)
- When assigned, coaching_requests.status changes to 'assigned'

---

### **12. `coaching_feedback` Table**
> Menyimpan feedback dari reviewer untuk coaching request

```sql
CREATE TABLE coaching_feedback (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relationships
    coaching_request_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL COMMENT 'User yang memberikan feedback',
    
    -- Feedback Content
    feedback_text TEXT NOT NULL COMMENT 'Detailed feedback from reviewer',
    rating TINYINT NULL CHECK (rating BETWEEN 1 AND 5) 
        COMMENT 'Overall journal quality rating (1-5)',
    areas_covered JSON NULL COMMENT 'Checklist: ["administrative", "content", "editorial", "technical"]',
    attachment_path VARCHAR(500) NULL COMMENT 'File dari reviewer (template, marked-up docs)',
    
    -- Status
    is_final BOOLEAN DEFAULT FALSE COMMENT 'Jika true, feedback sudah final dan coaching complete',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_coaching_request_id (coaching_request_id),
    INDEX idx_reviewer_id (reviewer_id),
    
    -- Foreign Keys
    FOREIGN KEY (coaching_request_id) REFERENCES coaching_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Rule: 1 coaching request = 1 feedback (can be updated before marked final)
    UNIQUE KEY unique_coaching_feedback (coaching_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Rules:**
- Reviewer can save draft feedback (is_final=false) and update multiple times
- When is_final=true, coaching_requests.status changes to 'completed'
- Once marked final, feedback can still be updated but original is preserved (via updated_at)

---

### **V1.1 Changes to Existing Tables**

#### **`users` Table - Add Reviewer Fields**

```sql
ALTER TABLE users 
ADD COLUMN is_reviewer BOOLEAN DEFAULT FALSE COMMENT 'User can act as reviewer for coaching',
ADD COLUMN reviewer_expertise JSON NULL COMMENT 'Array of scientific_field_id for expertise matching',
ADD COLUMN reviewer_bio TEXT NULL COMMENT 'Qualifications and experience',
ADD COLUMN reviewer_is_active BOOLEAN DEFAULT TRUE COMMENT 'Active reviewer status';

-- Add index for reviewer queries
CREATE INDEX idx_is_reviewer ON users(is_reviewer);
```

**Usage:**
- Admin Kampus can promote users to reviewers by setting `is_reviewer = true`
- `reviewer_expertise` stores scientific field IDs: `[1, 3, 5]` for matching with journals
- When assigning coaching, system can suggest reviewers with matching expertise

---

#### **`evaluation_indicators` Table - Add Admin Tracking (Optional)**

```sql
ALTER TABLE evaluation_indicators 
ADD COLUMN help_text TEXT NULL COMMENT 'Tooltip guidance for indicator',
ADD COLUMN last_modified_by BIGINT UNSIGNED NULL COMMENT 'Admin who last edited',
ADD FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE SET NULL;
```

**Usage:**
- Track who modified indicators for audit trail
- Help text shown as tooltip in assessment form

---

## 🔗 Updated Relationship Summary (v1.1)

```
users (1) ─────── (M) journals
  │                     │
  │                     ├── (1) ────── (M) journal_assessments
  │                     │
  │                     └── (1) ────── (M) coaching_requests ───┐
  │                                                               │
  └── (M) ────── (1) roles                                       │
  │                                                               │
  └── (M) ────── (1) universities                                │
  │                                                               │
  └── (is_reviewer=true) ────── (1) coaching_assignments         │
                                      │                          │
                                      └──────────────────────────┘
                                                                  │
scientific_fields (1) ─────── (M) journals                       │
                │                                                 │
                └─── (via users.reviewer_expertise) ─────────────┤
                                                                  │
coaching_feedback (1) ────────────────────────────────────────────┘
```

**New Cardinality:**
- **1 Journal** → **M Coaching Requests** (dapat request coaching berkali-kali)
- **1 Coaching Request** → **1 Coaching Assignment** (1 request = 1 reviewer)
- **1 Coaching Request** → **1 Coaching Feedback** (1 request = 1 feedback)
- **1 User (reviewer)** → **M Coaching Assignments** (1 reviewer bisa handle banyak requests)

---

## 📊 Updated ER Diagram (v1.1)

```mermaid
erDiagram
    %% v1.0 Core Tables
    roles ||--o{ users : has
    universities ||--o{ users : employs
    users ||--o{ journals : manages
    universities ||--o{ journals : owns
    scientific_fields ||--o{ journals : categorizes
    journals ||--o{ journal_assessments : has
    users ||--o{ journal_assessments : creates
    journal_assessments ||--o{ assessment_responses : contains
    evaluation_indicators ||--o{ assessment_responses : defines
    assessment_responses ||--o{ assessment_attachments : includes
    users ||--o{ assessment_attachments : uploads

    %% v1.1 Coaching Tables
    journals ||--o{ coaching_requests : "requests coaching"
    users ||--o{ coaching_requests : "creates request"
    universities ||--o{ coaching_requests : "owns request"
    coaching_requests ||--|| coaching_assignments : "assigned to"
    coaching_requests ||--|| coaching_feedback : "receives feedback"
    users ||--o{ coaching_assignments : "reviews (is_reviewer)"
    users ||--o{ coaching_feedback : "provides feedback"

    %% v1.1 New Fields in users
    users {
        bigint id PK
        string name
        string email UK
        bigint role_id FK
        bigint university_id FK
        boolean is_reviewer "NEW v1.1"
        json reviewer_expertise "NEW v1.1"
        text reviewer_bio "NEW v1.1"
        boolean reviewer_is_active "NEW v1.1"
    }

    coaching_requests {
        bigint id PK
        bigint journal_id FK
        bigint user_id FK
        bigint university_id FK
        enum request_type
        enum priority
        text description
        enum status
        timestamp requested_at
        timestamp completed_at
    }

    coaching_assignments {
        bigint id PK
        bigint coaching_request_id FK
        bigint reviewer_id FK
        bigint assigned_by FK
        text notes_to_reviewer
        timestamp assigned_at
    }

    coaching_feedback {
        bigint id PK
        bigint coaching_request_id FK
        bigint reviewer_id FK
        text feedback_text
        int rating
        json areas_covered
        string attachment_path
        boolean is_final
    }
```

---

## 🎯 V1.1 Data Flow Examples

### **Flow 1: Request Coaching**
```
1. User (Budi) submits assessment → status='submitted'
2. Admin Kampus (Siti) reviews → status='reviewed'
3. Budi clicks "Request Pembinaan" on journal detail page
4. System checks: journal has reviewed assessment? ✅
5. Budi fills form:
   - request_type = 'indeksasi'
   - priority = 'high'
   - description = "Need help getting into Scopus"
   - uploads rejection letter (attachment_path)
6. INSERT INTO coaching_requests:
   - journal_id = Budi's journal
   - user_id = Budi
   - university_id = Budi's university
   - status = 'pending'
7. Email notification sent to Admin Kampus (Siti)
```

### **Flow 2: Assign Reviewer**
```
1. Admin Kampus (Siti) views coaching requests (filter: status='pending')
2. Clicks on Budi's request
3. System shows:
   - Request details
   - Journal info
   - Assessment results (link)
4. Siti clicks "Assign Reviewer"
5. Modal shows reviewers from same university with expertise matching
   - Dr. Ahmad: reviewer_expertise = [1, 2] (Informatics, Engineering)
   - Budi's journal: scientific_field_id = 1 (Informatics)
   - Dr. Ahmad highlighted as "Recommended"
6. Siti selects Dr. Ahmad, adds notes: "Please focus on indexation strategy"
7. INSERT INTO coaching_assignments:
   - coaching_request_id = Budi's request
   - reviewer_id = Dr. Ahmad
   - assigned_by = Siti
8. UPDATE coaching_requests SET status='assigned'
9. Email notification to Dr. Ahmad and Budi
```

### **Flow 3: Provide Feedback**
```
1. Reviewer (Dr. Ahmad) logs in
2. Views "My Assigned Coaching Requests" (filter: status='assigned')
3. Clicks on Budi's request
4. Reads:
   - Journal assessment results
   - Budi's description
   - Downloads Budi's attachment (rejection letter)
5. Fills feedback form:
   - feedback_text = "Here's a detailed plan for Scopus indexation..."
   - rating = 4 (out of 5)
   - areas_covered = ["administrative", "content", "editorial"]
   - uploads marked-up template (attachment_path)
   - Checks "Mark as Complete" (is_final = true)
6. INSERT/UPDATE coaching_feedback
7. UPDATE coaching_requests SET status='completed', completed_at=NOW()
8. Email notification to Budi and Siti
9. Budi views feedback and downloads Dr. Ahmad's template
```

---

## 🚀 Migration Strategy (v1.0 → v1.1)

### **Migration Order (Important!)**

```bash
# v1.1 New Tables
1. php artisan migrate --path=database/migrations/2026_02_01_create_coaching_requests_table.php
2. php artisan migrate --path=database/migrations/2026_02_01_create_coaching_assignments_table.php
3. php artisan migrate --path=database/migrations/2026_02_01_create_coaching_feedback_table.php

# v1.1 Alter Existing Tables
4. php artisan migrate --path=database/migrations/2026_02_02_add_reviewer_fields_to_users_table.php
5. php artisan migrate --path=database/migrations/2026_02_02_add_admin_tracking_to_evaluation_indicators_table.php
```

### **Rollback Safety**
All v1.1 migrations should have `down()` methods:

```php
public function down()
{
    Schema::dropIfExists('coaching_feedback');
    Schema::dropIfExists('coaching_assignments');
    Schema::dropIfExists('coaching_requests');
}
```

For `ALTER` migrations:
```php
public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['is_reviewer', 'reviewer_expertise', 'reviewer_bio', 'reviewer_is_active']);
        $table->dropIndex('idx_is_reviewer');
    });
}
```

---

## 📝 Notes for Developers

### **V1.0 Tables (Already Implemented)**
All v1.0 tables exist in production. Do NOT modify:
- ✅ `roles`
- ✅ `users` (will be altered in v1.1)
- ✅ `universities`
- ✅ `scientific_fields`
- ✅ `journals`
- ✅ `evaluation_indicators` (will be altered in v1.1)
- ✅ `journal_assessments`
- ✅ `assessment_responses`
- ✅ `assessment_attachments`

### **V1.1 New Tables (To Be Created)**
- 🆕 `coaching_requests`
- 🆕 `coaching_assignments`
- 🆕 `coaching_feedback`

### **V1.1 Alterations (Add Columns)**
- 🔧 `users` - Add reviewer fields
- 🔧 `evaluation_indicators` - Add help_text, last_modified_by (optional)

---

## 🎓 Best Practices Applied

1. **Soft Deletes:** All coaching tables use `deleted_at` for audit trail
2. **Foreign Keys:** Proper CASCADE and SET NULL rules
3. **Indexes:** Added on all FK columns and filter columns (status, priority)
4. **JSON Columns:** Used for flexible arrays (reviewer_expertise, areas_covered)
5. **ENUMs:** Used for fixed value sets (status, request_type, priority)
6. **Timestamps:** All tables have created_at, updated_at
7. **Unique Constraints:** Prevent duplicate assignments/feedback
8. **CHECK Constraints:** Rating must be 1-5

---

## 📚 Related Documentation

- **[JurnalMu MVP v1.1](jurnal_mu MVP v1.1.md)** - Feature specification
- **[JurnalMu Roadmap v1.1](jurnal_mu roadmap v1.1.md)** - Development timeline
- **[V1.1 Migration Strategy](v1.1 Migration Strategy.md)** - Deployment guide

---

**ERD Document Version:** 1.1  
**Last Updated:** January 15, 2026  
**Status:** Ready for Migration Development

Apakah Anda ingin saya:
- ✅ **Generate Laravel Migration files** (untuk v1.1 tables)?
- ✅ **Generate Laravel Model files** (CoachingRequest, CoachingAssignment, CoachingFeedback)?
- ✅ **Generate Seeder files** (untuk reviewer test data)?

Atau mau lanjut ke **V1.1 Migration Strategy document** dulu?

Pilih langkah selanjutnya! 🎯