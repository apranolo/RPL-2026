/**
 * @file Show.tsx
 * @description Halaman detail submission untuk Editor.
 * @author Muhammad Irfan Habibi
 */

import InlinePdfViewer from '@/components/InlinePdfViewer';
//import DecisionHistoryPanel from '@/components/DecisionHistoryPanel';
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
                <div className="space-y-4 md:col-span-1">
                    <div className="rounded-lg bg-white p-4 shadow border">
                        <h2 className="mb-4 text-lg font-semibold">Aksi Editorial</h2>
                        <div className="grid gap-2">
                            <button onClick={() => window.location.href = route('editorial.desk.plagiarism', submission.id_submission)}className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Cek Plagiasi</button>
                            <button className="w-full rounded-md border px-4 py-2 hover:bg-gray-50">Tunjuk Section Editor</button>
                            <button className="w-full rounded-md border px-4 py-2 hover:bg-gray-50">Desk Review</button>
                            <button className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Keputusan Akhir</button>
                        </div>
                    </div>

                    {/* Panel Riwayat - Integrasikan milik Primus
                    <DecisionHistoryPanel histories={submission.editorialDecisions || []} />  */}
                </div>
            </div>
        </AppLayout>
    );
}
