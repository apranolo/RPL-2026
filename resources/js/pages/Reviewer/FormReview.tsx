import React, { FormEventHandler } from 'react';
import { useForm, Head } from '@inertiajs/react';
// import AppLayout from '@/Layouts/AppLayout'; // Uncomment this to wrap with layout if needed

interface Props {
    proposal: {
        id: number;
        title: string;
        abstract: string;
    };
    existingReview?: {
        id: number;
        score: number;
        comments: string;
        recommendation: string;
    };
}

export default function FormReview({ proposal, existingReview }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
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
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Head title="Form Penilaian Proposal" />
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Penilaian Proposal</h1>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h2 className="text-lg font-semibold text-gray-800">Detail Proposal</h2>
                    <p className="mt-2 text-sm text-gray-600"><span className="font-medium">Judul:</span> {proposal.title}</p>
                    <p className="mt-1 text-sm text-gray-600"><span className="font-medium">Abstrak:</span> {proposal.abstract}</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="score" className="block text-sm font-medium text-gray-700">Skor (0 - 100)</label>
                        <input
                            type="number"
                            id="score"
                            min="0"
                            max="100"
                            value={data.score}
                            onChange={(e) => setData('score', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                        {errors.score && <div className="text-red-500 text-sm mt-1">{errors.score}</div>}
                    </div>

                    <div>
                        <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700">Rekomendasi</label>
                        <select
                            id="recommendation"
                            value={data.recommendation}
                            onChange={(e) => setData('recommendation', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="">Pilih Rekomendasi...</option>
                            <option value="accepted">Diterima</option>
                            <option value="revision">Revisi</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                        {errors.recommendation && <div className="text-red-500 text-sm mt-1">{errors.recommendation}</div>}
                    </div>

                    <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Komentar / Catatan Reviewer</label>
                        <textarea
                            id="comments"
                            rows={5}
                            value={data.comments}
                            onChange={(e) => setData('comments', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        ></textarea>
                        {errors.comments && <div className="text-red-500 text-sm mt-1">{errors.comments}</div>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
