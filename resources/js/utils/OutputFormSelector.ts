/**
 * OutputFormSelector.ts
 *
 * Utilitas untuk mengelola konfigurasi form dinamis berdasarkan kategori luaran penelitian.
 * Mendefinisikan field-field tambahan (extra fields) yang ditampilkan untuk setiap kategori:
 * Jurnal, HKI, Buku, Produk, dan Prosiding.
 *
 * @package  resources/js/utils
 */

export type ExtraField = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'file';
    placeholder?: string;
    required?: boolean;
};

export type KategoriConfig = {
    value: string;
    label: string;
    extraFields: ExtraField[];
};

export type OutputMetadata = Record<string, string>;

const kategoriConfigs: Record<string, KategoriConfig> = {
    Jurnal: {
        value: 'Jurnal',
        label: 'Jurnal Ilmiah',
        extraFields: [
            { name: 'doi', label: 'DOI', type: 'text', placeholder: '10.xxxx/xxxxx', required: true },
            { name: 'nama_jurnal', label: 'Nama Jurnal', type: 'text', placeholder: 'Nama jurnal tempat publikasi', required: true },
            { name: 'volume', label: 'Volume', type: 'text', placeholder: 'Vol. 1, No. 2', required: false },
            { name: 'halaman', label: 'Halaman', type: 'text', placeholder: 'xx-xx', required: false },
        ],
    },
    HKI: {
        value: 'HKI',
        label: 'HKI / Paten',
        extraFields: [
            { name: 'nomor_paten', label: 'Nomor Paten', type: 'text', placeholder: 'IDP000123456', required: true },
            { name: 'tahun_paten', label: 'Tahun Paten', type: 'text', placeholder: '2026', required: false },
            { name: 'pemegang_paten', label: 'Pemegang Paten', type: 'text', placeholder: 'Nama institusi/perorangan', required: false },
        ],
    },
    Buku: {
        value: 'Buku',
        label: 'Buku / Modul',
        extraFields: [
            { name: 'isbn', label: 'ISBN', type: 'text', placeholder: '978-xxx-xxx-xxx-x', required: true },
            { name: 'penerbit', label: 'Penerbit', type: 'text', placeholder: 'Nama penerbit', required: true },
            { name: 'tahun_terbit', label: 'Tahun Terbit', type: 'text', placeholder: '2026', required: false },
            { name: 'penulis', label: 'Penulis', type: 'text', placeholder: 'Nama penulis buku', required: false },
        ],
    },
    Produk: {
        value: 'Produk',
        label: 'Produk / Prototipe',
        extraFields: [
            { name: 'nama_prototipe', label: 'Nama Produk/Prototipe', type: 'text', placeholder: 'Nama produk yang dihasilkan', required: true },
            { name: 'deskripsi_produk', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsikan produk/prototipe yang dihasilkan...', required: false },
        ],
    },
    Prosiding: {
        value: 'Prosiding',
        label: 'Prosiding',
        extraFields: [
            { name: 'link_prosiding', label: 'Link Prosiding', type: 'text', placeholder: 'https://...', required: true },
            { name: 'nama_konferensi', label: 'Nama Konferensi', type: 'text', placeholder: 'Nama seminar/konferensi', required: true },
            { name: 'tahun_pelaksanaan', label: 'Tahun Pelaksanaan', type: 'text', placeholder: '2026', required: false },
        ],
    },
};

export const kategoriOptions = Object.values(kategoriConfigs).map((c) => ({
    value: c.value,
    label: c.label,
}));

export function getKategoriConfig(kategori: string): KategoriConfig | undefined {
    return kategoriConfigs[kategori];
}

export function getExtraFields(kategori: string): ExtraField[] {
    return kategoriConfigs[kategori]?.extraFields ?? [];
}

export const LABEL_BY_KATEGORI: Record<string, string> = Object.fromEntries(
    Object.entries(kategoriConfigs).map(([key, config]) => [key, config.label]),
);

export default kategoriConfigs;