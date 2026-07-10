/**
 * @file Show.tsx
 * @description Halaman detail submission untuk Editor.
 * @author Muhammad Irfan Habibi
 */

import InlinePdfViewer from '@/components/InlinePdfViewer';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface SubmissionFile {
    id_file: number;
    file_path: string;
    file_type: string;
}

interface Submission {
    id_submission: number;
    title: string;
    abstract: string;
    files: SubmissionFile[];
}

interface Props extends PageProps {
    submission: Submission;
}

export default function Show({ submission }: Props) {
    const mainManuscript = submission.files?.find((f) => f.file_type === 'ManuscriptMain');
    const fileUrl = mainManuscript ? `/storage/${mainManuscript.file_path}` : '';

    return (
        <AppLayout>
            <Head title={`Detail Naskah - ${submission.title}`} />

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                <div className="space-y-4 md:col-span-2">
                    <h1 className="text-2xl font-bold">{submission.title}</h1>
                    <div className="rounded-lg bg-white p-4 shadow">
                        <h2 className="mb-2 text-lg font-semibold">Dokumen Naskah</h2>
                        {fileUrl ? <InlinePdfViewer fileUrl={fileUrl} /> : <p className="text-red-500">File naskah tidak ditemukan.</p>}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="h-full rounded-lg border bg-gray-50 p-4 shadow">
                        <h2 className="mb-4 text-lg font-semibold">Panel Riwayat & Keputusan</h2>
                        <p className="text-sm text-gray-600">Riwayat keputusan akan tampil di sini.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
