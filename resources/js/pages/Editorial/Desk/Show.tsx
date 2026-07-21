/**
 * @file Show.tsx
 * @description Halaman detail submission untuk Editor.
 * @author Muhammad Irfan Habibi
 */

import DecisionHistoryPanel from '@/components/DecisionHistoryPanel';
import InlinePdfViewer from '@/components/InlinePdfViewer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react'; // PERBAIKAN 1: Menambahkan router

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
    editorialDecisions?: any[];
}

interface Props extends PageProps {
    submission: Submission;
}

export default function Show({ submission }: Props) {
    const mainManuscript = submission.files?.find((f) => f.file_type === 'ManuscriptMain');
    const fileUrl = mainManuscript ? `/storage/${mainManuscript.file_path}` : '';

    const breadcrumbs = [
        { title: 'Editorial Desk', href: '/editorial/desk/inbox' },
        { title: 'Detail Naskah', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                    <div className="rounded-lg border bg-white p-4 shadow">
                        <h2 className="mb-4 text-lg font-semibold">Aksi Editorial</h2>
                        <div className="grid gap-2">
                            {/* PERBAIKAN 2: Menggunakan router.get dari Inertia */}
                            <Button onClick={() => router.get(route('editorial.desk.plagiarism', submission.id_submission))} className="w-full">
                                Cek Plagiasi
                            </Button>
                            <Button variant="outline" className="w-full">
                                Tunjuk Section Editor
                            </Button>
                            <Button variant="outline" className="w-full">
                                Desk Review
                            </Button>
                            <Button className="w-full bg-green-600 text-white hover:bg-green-700">Keputusan Akhir</Button>
                        </div>
                    </div>

                    <DecisionHistoryPanel histories={submission.editorialDecisions || []} />
                </div>
            </div>
        </AppLayout>
    );
}
