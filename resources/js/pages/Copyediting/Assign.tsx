/**
 * @route GET /user/editorial/copyediting/assign
 * @route POST /user/editorial/copyediting/assign
 * @features Penugasan Copyeditor ke submission yang sudah di-Approve pasca-revisi
 * @description Halaman panel Editor untuk menugaskan seorang Copyeditor ke sebuah submission.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Penugasan Copyeditor', href: '/user/editorial/copyediting/assign' },
];

interface Submission {
    id: number;
    title: string;
    author?: {
        name: string;
    };
}

interface Copyeditor {
    id: number;
    name: string;
    email: string;
}

interface Props {
    submissions: Submission[];
    copyeditors: Copyeditor[];
}

export default function AssignCopyeditor({ submissions, copyeditors }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_submission: '',
        id_copyeditor: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.editorial.copyediting.assign.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penugasan Copyeditor" />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-bold text-foreground">Panel Penugasan Copyeditor</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Pilih artikel pasca-keputusan (Approved) dan tentukan staf Copyeditor yang bertanggung jawab.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pilih Submission */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Pilih Submission (Artikel)</label>
                            <Select value={data.id_submission} onValueChange={(value) => setData('id_submission', value)}>
                                <SelectTrigger className="w-full rounded-lg">
                                    <SelectValue placeholder="-- Pilih Artikel --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {submissions.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">Belum ada submission yang siap ditugaskan.</div>
                                    ) : (
                                        submissions.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                {sub.title} {sub.author?.name ? `(${sub.author.name})` : ''}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.id_submission && <p className="mt-1 text-sm text-red-600">{errors.id_submission}</p>}
                        </div>

                        {/* Pilih Copyeditor */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Pilih Copyeditor</label>
                            <Select value={data.id_copyeditor} onValueChange={(value) => setData('id_copyeditor', value)}>
                                <SelectTrigger className="w-full rounded-lg">
                                    <SelectValue placeholder="-- Pilih Nama Copyeditor --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {copyeditors.map((editor) => (
                                        <SelectItem key={editor.id} value={String(editor.id)}>
                                            {editor.name} ({editor.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.id_copyeditor && <p className="mt-1 text-sm text-red-600">{errors.id_copyeditor}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-primary py-3 font-bold text-white disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Tugaskan Copyeditor'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
