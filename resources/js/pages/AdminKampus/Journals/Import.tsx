/**
 * @description Admin Kampus - Import Journals from CSV
 * @route GET /admin-kampus/journals/import/form
 * @features Upload CSV file, auto-assign to current admin, preview data, download template, batch import with validation
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react'; // Add usePage import
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Info, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Journals',
        href: '/admin-kampus/journals',
    },
    {
        title: 'Import',
        href: '/admin-kampus/journals/import',
    },
];

interface Props {
    // scientificFields are still passed if needed for reference, or can be optional
    errors?: {
        csv_file?: string;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        import_errors?: Array<{
            row: number;
            errors: string[];
        }>;
    };
}

interface CsvRow {
    [key: string]: string;
}

export default function Import({ errors, flash }: Props) {
    const { auth } = usePage().props as any; // Get auth user info
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<CsvRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            setPreviewData([]);
            setFileError('');
            return;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
            setFileError('File harus berformat CSV (.csv)');
            setSelectedFile(null);
            setPreviewData([]);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError('Ukuran file maksimal 5MB');
            setSelectedFile(null);
            setPreviewData([]);
            return;
        }

        setFileError('');
        setSelectedFile(file);

        // Parse CSV for preview
        Papa.parse(file, {
            header: true,
            preview: 5, // Preview first 5 rows
            skipEmptyLines: true,
            complete: (results) => {
                setPreviewData(results.data as CsvRow[]);
            },
            error: (error) => {
                setFileError('Gagal membaca file CSV: ' + error.message);
                setPreviewData([]);
            },
        });
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('admin-kampus.journals.import.template');
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setFileError('File CSV harus diunggah');
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('csv_file', selectedFile);

        router.post(route('admin-kampus.journals.import.process'), formData, {
            forceFormData: true,
            onFinish: () => setIsProcessing(false),
            onError: () => setIsProcessing(false),
        });
    };

    const requiredColumns = ['title', 'publisher', 'e_issn'];

    const optionalColumns = ['issn', 'publication_year', 'sinta_rank', 'url', 'oai_url', 'email', 'phone'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Jurnal dari CSV" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Jurnal
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Import Jurnal</h1>
                        <p className="mt-1 text-muted-foreground">Unggah file CSV untuk menambahkan data jurnal secara massal ke dalam sistem.</p>
                    </div>

                    {/* Flash Messages */}
                    <div className="mb-6 space-y-4">
                        {flash?.success && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Berhasil</AlertTitle>
                                <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.warning && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertTitle className="text-yellow-800">Peringatan</AlertTitle>
                                <AlertDescription className="text-yellow-700">{flash.warning}</AlertDescription>
                            </Alert>
                        )}

                        {/* Import Errors */}
                        {flash?.import_errors && flash.import_errors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Detail Error Import</AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                                        {flash.import_errors.map((error, index) => (
                                            <div key={index} className="text-sm">
                                                <strong>Baris {error.row}:</strong>
                                                <ul className="ml-4 list-disc">
                                                    {error.errors.map((msg, idx) => (
                                                        <li key={idx}>{msg}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Import Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Auto-Assign Info */}
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Informasi Pengelola</AlertTitle>
                                            <AlertDescription>
                                                Semua jurnal yang diimport akan ditugaskan kepada Anda (<strong>{auth.user.name}</strong>) sebagai
                                                pengelola awal. Anda dapat menugaskan ulang jurnal ke pengelola lain setelah import selesai.
                                            </AlertDescription>
                                        </Alert>

                                        {/* File Upload */}
                                        <div className="space-y-2">
                                            <Label htmlFor="csv_file">
                                                File CSV <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="csv_file"
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    onChange={handleFileChange}
                                                    className={errors?.csv_file || fileError ? 'border-destructive' : ''}
                                                />
                                                <Button type="button" variant="outline" onClick={handleDownloadTemplate} className="shrink-0 gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download Template
                                                </Button>
                                            </div>
                                            {(errors?.csv_file || fileError) && (
                                                <p className="text-sm text-destructive">{errors?.csv_file || fileError}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">Maksimal ukuran file 5MB, dengan format CSV (.csv).</p>
                                        </div>

                                        {/* CSV Preview */}
                                        {previewData.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Preview Data (5 baris pertama)</Label>
                                                <div className="overflow-x-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                {Object.keys(previewData[0]).map((header) => (
                                                                    <th
                                                                        key={header}
                                                                        className="px-3 py-2 text-left font-medium text-muted-foreground"
                                                                    >
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, index) => (
                                                                <tr key={index} className="border-t transition-colors hover:bg-muted/50">
                                                                    {Object.values(row).map((value, cellIndex) => (
                                                                        <td key={cellIndex} className="px-3 py-2">
                                                                            {value || '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                            <Button type="submit" disabled={!selectedFile || isProcessing} className="w-full min-w-[150px] sm:w-auto">
                                                {isProcessing ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Import Jurnal
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(route('admin-kampus.journals.index'))}
                                                disabled={isProcessing}
                                                className="w-full sm:w-auto"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Guidelines */}
                        <div className="space-y-6">
                            {/* Format Guidelines */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Info className="h-4 w-4" />
                                        Format CSV
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="mb-2 font-medium">Kolom Wajib:</h4>
                                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                            {requiredColumns.map((col) => (
                                                <li key={col}>{col}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-medium">Kolom Opsional:</h4>
                                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                            {optionalColumns.map((col) => (
                                                <li key={col}>{col}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Format Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Catatan Penting</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <div>
                                        <strong className="text-foreground">ISSN Format:</strong> 1234-5678
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Tanggal:</strong> YYYY-MM-DD (contoh: 2026-12-31)
                                    </div>
                                    <div>
                                        <strong className="text-foreground">SINTA Rank:</strong> angka 1-6 atau kosong (non_sinta)
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Bidang Ilmu:</strong> Akan ditugaskan secara manual setelah import.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
