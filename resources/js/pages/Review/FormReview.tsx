/**
 * @file FormReview.tsx
 * @description Halaman form penilaian rubrik bagi Reviewer.
 * Menampilkan naskah anonim dan mengelola input skor per kriteria.
 */
import RubricScoreInput from '@/components/RubricScoreInput';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';

interface Manuscript {
    id: number;
    title: string;
    abstract: string;
    keywords: string;
    file_path: string;
}

interface ReviewDecision {
    recommendation: string;
    comments: string;
    comments_private: string;
    score_originality: number;
    score_methodology: number;
    score_writing: number;
    score_relevance: number;
    score_conclusion: number;
    score_aggregate: number;
}

interface Props {
    manuscript: Manuscript;
    reviewDecision: ReviewDecision | null;
}

export default function FormReview({ manuscript, reviewDecision }: Props) {
    const { data, setData, post, processing } = useForm({
        score_originality: reviewDecision?.score_originality ?? 0,
        score_methodology: reviewDecision?.score_methodology ?? 0,
        score_writing: reviewDecision?.score_writing ?? 0,
        score_relevance: reviewDecision?.score_relevance ?? 0,
        score_conclusion: reviewDecision?.score_conclusion ?? 0,
        recommendation: reviewDecision?.recommendation ?? '',
        comments: reviewDecision?.comments ?? '',
        comments_private: reviewDecision?.comments_private ?? '',
    });

    const handleScoreChange = (newScores: any) => {
        setData((prevData) => ({
            ...prevData,
            ...newScores,
        }));
    };

    function handleSubmit() {
        post(`/review/${manuscript.id}/submit`);
    }

    // Ekstrak skor untuk komponen anak
    const scores = {
        score_originality: data.score_originality,
        score_methodology: data.score_methodology,
        score_writing: data.score_writing,
        score_relevance: data.score_relevance,
        score_conclusion: data.score_conclusion,
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-bold">Form Penilaian Reviewer</h1>

                {/* Naskah Anonim */}
                <div className="mb-6 rounded-lg border bg-white p-5">
                    <h2 className="mb-2 text-lg font-semibold">Naskah (Anonim)</h2>
                    <p className="mb-1 text-sm text-gray-500">Judul:</p>
                    <p className="mb-3 font-medium">{manuscript.title}</p>
                    <p className="mb-1 text-sm text-gray-500">Abstrak:</p>
                    <p className="mb-3 text-sm">{manuscript.abstract}</p>
                    <p className="mb-1 text-sm text-gray-500">Kata Kunci:</p>
                    <p className="text-sm">{manuscript.keywords}</p>
                </div>

                {/* Rubrik Penilaian */}
                <div className="mb-6 rounded-lg border bg-white p-5">
                    <h2 className="mb-4 text-lg font-semibold">Rubrik Penilaian (1–5)</h2>
                    <RubricScoreInput scores={scores} onChange={handleScoreChange} />
                </div>

                {/* Rekomendasi */}
                <div className="mb-6 rounded-lg border bg-white p-5">
                    <h2 className="mb-4 text-lg font-semibold">Rekomendasi & Komentar</h2>
                    <select
                        className="mb-4 w-full rounded border p-2"
                        value={data.recommendation}
                        onChange={(e) => setData('recommendation', e.target.value)}
                    >
                        <option value="">-- Pilih Rekomendasi --</option>
                        <option value="Accept">Accept</option>
                        <option value="Revise">Revise</option>
                        <option value="Reject">Reject</option>
                    </select>
                    <textarea
                        className="mb-4 w-full rounded border p-2"
                        rows={4}
                        placeholder="Komentar untuk penulis..."
                        value={data.comments}
                        onChange={(e) => setData('comments', e.target.value)}
                    />
                    <textarea
                        className="w-full rounded border p-2"
                        rows={3}
                        placeholder="Komentar privat untuk editor..."
                        value={data.comments_private}
                        onChange={(e) => setData('comments_private', e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className={`w-full rounded py-2 text-white ${processing ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {processing ? 'Memproses...' : 'Kirim Review'}
                </button>
            </div>
        </AppLayout>
    );
}
