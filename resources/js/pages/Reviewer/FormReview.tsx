/**
 * Form Penilaian Proposal (Reviewer)
 *
 * @description Form untuk reviewer mengisi atau mengubah penilaian proposal penelitian.
 *              Menampilkan detail proposal dan form input skor, rekomendasi, serta komentar.
 * @route POST /reviewer/assessment → reviewer.assessment.store
 * @route PUT  /reviewer/assessment/{id} → reviewer.assessment.update
 * @features Penilaian skor, rekomendasi (diterima/revisi/ditolak), komentar reviewer
 */

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface ProposalData {
    id: number;
    title: string;
    abstract: string;
}

interface ExistingReview {
    id: number;
    score: number;
    comments: string;
    recommendation: 'accepted' | 'revision' | 'rejected';
}

interface ReviewFormData {
    proposal_id: number;
    score: number | string;
    comments: string;
    recommendation: 'accepted' | 'revision' | 'rejected' | '';
}

interface Props {
    proposal: ProposalData;
    existingReview?: ExistingReview;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviewer', href: route('reviewer.assignments.index') },
    { title: 'Form Penilaian', href: '#' },
];

export default function FormReview({ proposal, existingReview }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<ReviewFormData>({
        proposal_id: proposal.id,
        score: existingReview?.score ?? '',
        comments: existingReview?.comments ?? '',
        recommendation: existingReview?.recommendation ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (existingReview) {
            put(route('reviewer.assessment.update', existingReview.id));
        } else {
            post(route('reviewer.assessment.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Penilaian Proposal" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-neutral-900">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Form Penilaian Proposal
                    </h1>

                    <div className="mb-6 rounded-md bg-gray-50 p-4 dark:bg-neutral-800">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Detail Proposal
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Judul:</span> {proposal.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Abstrak:</span> {proposal.abstract}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Skor (0 - 100)
                            </label>
                            <input
                                type="number"
                                id="score"
                                min="0"
                                max="100"
                                value={data.score}
                                onChange={(e) => setData('score', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 sm:text-sm"
                            />
                            {errors.score && <div className="mt-1 text-sm text-red-500">{errors.score}</div>}
                        </div>

                        <div>
                            <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Rekomendasi
                            </label>
                            <select
                                id="recommendation"
                                value={data.recommendation}
                                onChange={(e) =>
                                    setData('recommendation', e.target.value as ReviewFormData['recommendation'])
                                }
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 sm:text-sm"
                            >
                                <option value="">Pilih Rekomendasi...</option>
                                <option value="accepted">Diterima</option>
                                <option value="revision">Revisi</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                            {errors.recommendation && (
                                <div className="mt-1 text-sm text-red-500">{errors.recommendation}</div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Komentar / Catatan Reviewer
                            </label>
                            <textarea
                                id="comments"
                                rows={5}
                                value={data.comments}
                                onChange={(e) => setData('comments', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 sm:text-sm"
                            ></textarea>
                            {errors.comments && <div className="mt-1 text-sm text-red-500">{errors.comments}</div>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

