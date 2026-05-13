import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MultiSelectFilter from '@/components/MultiSelectFilter'; // Komponen yang sudah Anda buat
import { Head } from '@inertiajs/react';

export default function Generator({ auth }) {
    const handleExport = () => {
        // Memanggil method exportExcel() di ReportController
        window.location.href = route('admin.report.export-excel');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Custom Report Generator</h2>}
        >
            <Head title="Report Generator" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="mb-4">Filter Rekap Penelitian</h3>
                        
                        {/* Menggunakan komponen MultiSelectFilter sesuai tugas 17 */}
                        <MultiSelectFilter 
                            label="Pilih Kategori Penelitian"
                            placeholder="Semua Penelitian"
                        />

                        <button 
                            onClick={handleExport}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Export ke Excel
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
