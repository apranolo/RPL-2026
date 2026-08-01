## 📌 Rincian Endpoint & Komponen View Manajemen Skema Penelitian (Admin)

Berikut adalah daftar lengkap rute endpoint dan komponen React view yang terdaftar secara resmi untuk fitur Manajemen Skema Penelitian (`ResearchSchema`):

### 🛠️ Daftar Endpoint & Komponen View Terdaftar

| Method | URL Endpoint Resmi | Nama Rute (Inertia/Laravel) | Controller Method | Komponen React View | Akses Peran |
|---|---|---|---|---|---|
| `GET` | `/admin/schema` | `admin.schema.index` | `SchemaController@index` | `resources/js/pages/Admin/Schema/Index.tsx` | Super Admin |
| `GET` | `/admin/schema/create` | `admin.schema.create` | `SchemaController@create` | `resources/js/pages/Admin/Schema/Create.tsx` | Super Admin |
| `POST` | `/admin/schema` | `admin.schema.store` | `SchemaController@store` | *Redirect ke admin.schema.index* | Super Admin |
| `GET` | `/admin/schema/{id}` | `admin.schema.show` | `SchemaController@show` | `resources/js/pages/Admin/Schema/Show.tsx` | Super Admin |
| `GET` | `/admin/schema/{id}/edit` | `admin.schema.edit` | `SchemaController@edit` | `resources/js/pages/Admin/Schema/Edit.tsx` | Super Admin |
| `PUT` | `/admin/schema/{id}` | `admin.schema.update` | `SchemaController@update` | *Redirect ke admin.schema.index* | Super Admin |
| `DELETE` | `/admin/schema/{id}` | `admin.schema.destroy` | `SchemaController@destroy` | *Redirect ke admin.schema.index* | Super Admin |

---

> ℹ️ **Catatan Pengujian**: Seluruh endpoint Skema Penelitian berada di bawah prefix rute `/admin/schema`. Pengujian dilakukan melalui peramban web pada alamat `http://localhost:8085/admin/schema` menggunakan akun Super Admin (`superadmin@ajm.ac.id` / `password123`).
