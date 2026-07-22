import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import MultiSelectFilter, { MultiSelectOption } from '@/components/MultiSelectFilter';
import { FileSpreadsheet, Filter, Download } from 'lucide-react';

interface FilterOptions {
    tahun: number[];
    status: string[];
}

interface PageProps {
    filterOptions: FilterOptions;
    [key: string]: any; // Catch-all for other Inertia props
}

const breadcrumbs = [
    {
        title: 'Report Generator',
        href: '/admin/report/generator',
    },
];

export default function Generator() {
    const { filterOptions } = usePage<PageProps>().props;

    const [selectedTahun, setSelectedTahun] = useState<(string | number)[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<(string | number)[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    // Transform options for the MultiSelectFilter
    const tahunOptions: MultiSelectOption[] = filterOptions?.tahun?.map(t => ({ label: String(t), value: t })) || [];
    const statusOptions: MultiSelectOption[] = filterOptions?.status?.map(s => ({ label: s, value: s })) || [];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Kita gunakan standard form submission atau fetch blob
            // Karena Inertia tidak bagus untuk mendownload file (blob), kita buat form submit atau pakai vanilla fetch
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch('/admin/report/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel mime
                },
                body: JSON.stringify({
                    filters: {
                        tahun: selectedTahun,
                        status: selectedStatus,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Get filename from Content-Disposition header if available
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'rekap_penelitian.xlsx';
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Create blob link to download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error exporting file:', error);
            alert('Gagal mengunduh file Excel. Pastikan server merespon dengan benar.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Custom Report Generator" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                            Custom Report Generator
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Pilih kriteria filter untuk menghasilkan rekapitulasi data penelitian.
                        </p>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-6 text-lg font-medium text-gray-800 border-b pb-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            Filter Data
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <MultiSelectFilter
                                label="Tahun Pelaksanaan"
                                options={tahunOptions}
                                selectedValues={selectedTahun}
                                onChange={setSelectedTahun}
                                placeholder="Semua Tahun"
                            />

                            <MultiSelectFilter
                                label="Status Penelitian"
                                options={statusOptions}
                                selectedValues={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="Semua Status"
                            />
                            
                            {/* Tempat untuk filter lainnya di masa depan (misal: Universitas, Program) */}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                                    isExporting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isExporting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyiapkan Excel...
                                    </>
                                ) : (
                                    <>
                                        <Download className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                                        Export ke Excel
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Informasi Tambahan */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">Petunjuk Penggunaan</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Pilih kombinasi filter yang Anda inginkan. Jika dibiarkan kosong, maka semua data untuk kategori tersebut akan disertakan dalam file Excel. Data yang di-export saat ini masih menggunakan format contoh sampai model data asli terintegrasi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
