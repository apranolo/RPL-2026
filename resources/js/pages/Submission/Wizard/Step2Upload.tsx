/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * @file Step2Upload.tsx
 * @description Komponen halaman langkah kedua submission wizard: Upload Manuscript & Supplementary Files.
 * @author Haryansyah Dwi Nugroho <@Haryansyah15>
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WizardProgressBar from '@/components/WizardProgressBar';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Paperclip, UploadCloud } from 'lucide-react';
import React, { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Submission', href: '/submission/step-1' },
    { title: 'Step 2 - Upload', href: '/submission/step-2' },
];

const wizardSteps = [
    { label: 'Start', description: 'Pilih Jurnal', complete: true },
    { label: 'Upload', description: 'Upload File', complete: false },
    { label: 'Metadata', description: 'Informasi Artikel', complete: false },
    { label: 'Contributor', description: 'Penulis', complete: false },
    { label: 'Confirm', description: 'Final Submit', complete: false },
];

export default function Step2Upload() {
    const [manuscript, setManuscript] = useState<File | null>(null);
    const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const supplementaryInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        setManuscript(files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFileChange(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = () => {
        if (!manuscript) {
            alert('File manuscript belum dipilih!');
            return;
        }

        const formData = new FormData();
        formData.append('manuscript', manuscript);
        supplementaryFiles.forEach((file, index) => {
            formData.append(`supplementary_files[${index}]`, file);
        });

        setLoading(true);
        router.post('/submission/step-2/upload', formData, {
            forceFormData: true,
            onSuccess: () => alert('Upload berhasil!'),
            onError: () => alert('Upload gagal'),
            onFinish: () => setLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission - Step 2" />

            <div className="mx-auto max-w-3xl p-6">
                <WizardProgressBar steps={wizardSteps} currentStep={1} className="mb-8" />

                <Card>
                    <CardHeader>
                        <CardTitle>Wizard Submission - Step 2</CardTitle>
                        <CardDescription>Upload manuscript utama dan file pendukung sebelum melanjutkan ke tahap berikutnya.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Drag & Drop Zone */}
                        <div className="space-y-3">
                            <label className="block font-semibold text-gray-800">
                                Manuscript Utama <span className="text-red-500">*</span>
                            </label>

                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50"
                            >
                                <UploadCloud className="mx-auto mb-4 text-blue-500" size={48} />
                                <p className="font-semibold text-gray-700">Drag & Drop file manuscript di sini</p>
                                <p className="text-sm text-gray-500">atau klik area ini untuk memilih file</p>
                                <p className="mt-3 text-xs text-gray-400">Format didukung: PDF, DOC, DOCX (Maks. 10 MB)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileChange(e.target.files)}
                                />
                            </div>

                            {manuscript && (
                                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                                    <FileText size={22} className="text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{manuscript.name}</p>
                                        <p className="text-xs text-gray-500">{(manuscript.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Supplementary File */}
                        <div className="space-y-3">
                            <label className="block font-semibold text-gray-800">Supplementary Files (Opsional)</label>
                            <div
                                onClick={() => supplementaryInputRef.current?.click()}
                                className="cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100"
                            >
                                <Paperclip className="mx-auto mb-2 text-gray-400" size={32} />
                                <p className="text-sm font-medium text-gray-600">Klik untuk memilih file tambahan</p>
                                <input
                                    ref={supplementaryInputRef}
                                    hidden
                                    multiple
                                    type="file"
                                    onChange={(e) => setSupplementaryFiles(e.target.files ? Array.from(e.target.files) : [])}
                                />
                            </div>

                            {supplementaryFiles.length > 0 && (
                                <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
                                    <p className="text-sm font-semibold text-gray-700">File Tambahan Terpilih:</p>
                                    <ul className="space-y-1">
                                        {supplementaryFiles.map((file, index) => (
                                            <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                                <Paperclip size={14} className="text-gray-400" />
                                                <span className="max-w-[250px] truncate">{file.name}</span>
                                                <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between border-t pt-4">
                            <Button variant="secondary" onClick={() => router.get('/submission/step-1')}>
                                Kembali
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading || !manuscript}>
                                {loading ? 'Mengunggah...' : 'Lanjut ke Step 3'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
