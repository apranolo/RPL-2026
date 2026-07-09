PR: Tambah fitur input termin pencairan (Akmal Putra Raihan)

Perubahan:
- Controller: `app/Http/Controllers/FundingController.php` (create, storeTermin)
- Request: `app/Http/Requests/StoreFundingRequest.php` (authorize + rules)
- Service: `app/Services/FundingService.php` (calculateSisa)
- View: `resources/js/pages/Finance/Funding/Create.tsx` (Inertia form)
- Routes: added ke `routes/web.php` (keuangan/fundings/create, keuangan/fundings/termin)

Keputusan kolaborasi:
- Pilihan A dipilih: saya menghapus `app/Models/Funding.php` lokal dan tidak commit migration.
- Mohon Muhammad Naufal Afriza meninjau model `Funding` dan migrasi `fundings` jika sudah tersedia.

Permintaan review khusus untuk Naufal:
- Konfirmasi nama kolom dan tipe pada tabel `fundings` (mis. `amount`, `termin_number`, `termin_date`, `contract_id`, `user_id`, `notes`).
- Jika ada perubahan nama kolom, beri tahu sehingga saya refactor controller/request/service.

Instruksi testing singkat:
```
# PHP syntax check (Windows PowerShell)
php -l app/Http/Controllers/FundingController.php
php -l app/Http/Requests/StoreFundingRequest.php
php -l app/Services/FundingService.php

# Frontend: run dev server
npm install
npm run dev
```
