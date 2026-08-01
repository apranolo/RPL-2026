## 📊 Alur Proses Bisnis & Diagram Alur (Flowchart & Sequence Diagram) Modul Manajemen Proposal Penelitian (Kelas B)

Berikut adalah dokumentasi alur proses bisnis lengkap beserta diagram alur kerja (*flowchart*) dan diagram urutan eksekusi (*sequence diagram*) untuk **Modul 1: Manajemen Proposal Penelitian**:

---

### 1. Diagram Alur Proses Bisnis (Flowchart)

```mermaid
flowchart TD
    classDef dosen fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef admin fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef status fill:#fff3e0,stroke:#f57c00,stroke-width:2px;

    subgraph DOSEN["👨‍🏫 Role: Dosen / Pengusul Penelitian"]
        A[Mulai: Akses Halaman Proposal]:::dosen --> B[Pilih Skema & Isi Form Pengajuan]:::dosen
        B --> C{Pilih Opsi Simpan}:::dosen
        C -- "Simpan Draf" --> D["Status: Draft"]:::status
        D --> E[Edit / Upload Berkas PDF]:::dosen
        E --> F[Kirim Proposal / Submit]:::dosen
        C -- "Langsung Submit" --> F
    end

    subgraph LPPM["🏢 Role: Admin LPPM / Super Admin"]
        F --> G["Status: Submitted"]:::status
        G --> H[Verifikasi Berkas & Kelengkapan Administrasi]:::admin
        H --> I{Keputusan Administrasi}:::admin
        I -- "Valid / Lolos" --> J["Status: Administrasi_Valid"]:::status
        I -- "Tidak Valid / Ditolak" --> K["Status: Ditolak"]:::status
        K --> L[Isi Catatan Alasan Penolakan]:::admin
    end

    subgraph NEXT["🔄 Tahap Selanjutnya"]
        J --> M[Lanjut ke Modul Penugasan Multi-Reviewer]
        L --> N[Dosen Melihat Alasan Penolakan di Detail Proposal]:::dosen
    end
```

---

### 2. Diagram Urutan Eksekusi Endpoint (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Dosen as Dosen (Pengusul)
    participant UI as Frontend React (Inertia)
    participant Route as Laravel Router & Controller
    participant Auth as Policy & Validation
    participant DB as Database MySQL
    actor Admin as Admin LPPM (Super Admin)

    %% Flow Dosen Submit Proposal
    Note over Dosen, DB: Tahap 1: Pengajuan Proposal oleh Dosen
    Dosen->>UI: Akses Halaman /proposal/create
    UI->>Route: GET /proposal/create
    Route-->>UI: Render View Proposal/Create.tsx
    Dosen->>UI: Isi Judul, Deskripsi, Skema, Upload PDF & Klik Submit
    UI->>Route: POST /proposal (StoreProposalRequest)
    Route->>Auth: Validasi MIME PDF, Max 10MB, Required Fields
    Auth->>DB: Simpan Record Proposal (status = Submitted) & File Dokumen
    DB-->>Route: Return Response Success
    Route-->>UI: Redirect to /proposal & Flash Notification

    %% Flow Admin Review
    Note over Admin, DB: Tahap 2: Verifikasi Administrasi oleh Admin LPPM
    Admin->>UI: Akses Halaman /admin/proposals
    UI->>Route: GET /admin/proposals
    Route->>Auth: Check Policy viewAny() & Role Super Admin
    Auth->>DB: Fetch All Proposals (Filter & Pagination)
    DB-->>UI: Render View Admin/Proposals/Index.tsx
    
    alt Disetujui (Approve)
        Admin->>UI: Klik Tombol "Approve / Validasi"
        UI->>Route: POST /admin/proposals/{id}/approve
        Route->>Auth: Check Policy approve()
        Route->>DB: Update status_proposal = Administrasi_Valid
        DB-->>UI: Redirect back with success message
    else Ditolak (Reject)
        Admin->>UI: Input Alasan Penolakan & Klik "Reject"
        UI->>Route: POST /admin/proposals/{id}/reject
        Route->>Auth: Check Policy reject() & Validate rejection_reason
        Route->>DB: Update status_proposal = Ditolak & rejection_reason
        DB-->>UI: Redirect back with warning message
    end
```

---

### 3. Rincian Tahapan Lifecycle Proposal

1. **`Draft`**: Proposal disimpan sementara oleh Dosen pengusul (dapat diubah/diunggah berkas sewaktu-waktu).
2. **`Submitted`**: Proposal diajukan secara resmi dan masuk ke antrean verifikasi berkas oleh Admin LPPM.
3. **`Administrasi_Valid`**: Lolos pemeriksaan administrasi oleh Admin LPPM dan siap diteruskan ke tahap penugasan Reviewer.
4. **`Ditolak`**: Proposal ditolak pada tahap administrasi disertai catatan alasan penolakan (`rejection_reason`).
