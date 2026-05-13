import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types'; // Import tipe data standar Inertia

// Definisikan interface untuk props agar TypeScript tidak bingung
interface GeneratorProps extends PageProps {
    auth: {
        user: any; // Ganti 'any' dengan tipe user spesifik jika ada di folder types
    };
}

// Tambahkan deklarasi untuk fungsi global 'route' agar tidak dianggap error oleh TS
declare function route(name: string, params?: any): string;

export default function Generator({ auth }: GeneratorProps) {
    const handleExport = (): void => {
        // Memanggil method exportExcel() di ReportController
        window.location.href = route('admin.report.export-excel');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Custom Report Generator
                </h2>
            }
        >
            <Head title="Report Generator" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-medium">
                            Filter Rekap Penelitian
                        </h3>

                        {/* Pastikan komponen ini menerima props sesuai definisinya */}
                        <MultiSelectFilter
                            label="Pilih Kategori Penelitian"
                            placeholder="Semua Penelitian"
                            options={[]} // Tambahkan array kosong jika komponen mewajibkan adanya options
                            onChange={() => {}} // Tambahkan fungsi kosong jika diwajibkan
                        />

                        <button
                            type="button"
                            onClick={handleExport}
                            className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                        >
                            Export ke Excel
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
