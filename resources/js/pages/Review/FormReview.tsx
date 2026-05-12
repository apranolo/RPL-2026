import AppLayout from '@/layouts/app-layout';
import RubricScoreInput from '@/components/RubricScoreInput';
import { useState } from 'react';
import { router } from '@inertiajs/react';

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
    const [scores, setScores] = useState({
        score_originality: reviewDecision?.score_originality ?? 0,
        score_methodology: reviewDecision?.score_methodology ?? 0,
        score_writing: reviewDecision?.score_writing ?? 0,
        score_relevance: reviewDecision?.score_relevance ?? 0,
        score_conclusion: reviewDecision?.score_conclusion ?? 0,
    });
    const [recommendation, setRecommendation] = useState(reviewDecision?.recommendation ?? '');
    const [comments, setComments] = useState(reviewDecision?.comments ?? '');
    const [commentsPrivate, setCommentsPrivate] = useState(reviewDecision?.comments_private ?? '');

    const aggregate = Object.values(scores).reduce((a, b) => a + b, 0) / 5;

    function handleSubmit() {
        router.post(`/review/${manuscript.id}/submit`, {
            ...scores,
            recommendation,
            comments,
            comments_private: commentsPrivate,
        });
    }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Form Penilaian Reviewer</h1>

                {/* Naskah Anonim */}
                <div className="bg-white border rounded-lg p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-2">Naskah (Anonim)</h2>
                    <p className="text-sm text-gray-500 mb-1">Judul:</p>
                    <p className="font-medium mb-3">{manuscript.title}</p>
                    <p className="text-sm text-gray-500 mb-1">Abstrak:</p>
                    <p className="text-sm mb-3">{manuscript.abstract}</p>
                    <p className="text-sm text-gray-500 mb-1">Kata Kunci:</p>
                    <p className="text-sm">{manuscript.keywords}</p>
                </div>

                {/* Rubrik Penilaian */}
                <div className="bg-white border rounded-lg p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Rubrik Penilaian (1–5)</h2>
                    <RubricScoreInput scores={scores} onChange={setScores} />
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                        <span className="font-semibold">Skor Agregat: </span>
                        <span className="text-blue-600 font-bold">{aggregate.toFixed(2)}</span>
                    </div>
                </div>

                {/* Rekomendasi */}
                <div className="bg-white border rounded-lg p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Rekomendasi & Komentar</h2>
                    <select
                        className="w-full border rounded p-2 mb-4"
                        value={recommendation}
                        onChange={e => setRecommendation(e.target.value)}
                    >
                        <option value="">-- Pilih Rekomendasi --</option>
                        <option value="Accept">Accept</option>
                        <option value="Revise">Revise</option>
                        <option value="Reject">Reject</option>
                    </select>
                    <textarea
                        className="w-full border rounded p-2 mb-4"
                        rows={4}
                        placeholder="Komentar untuk penulis..."
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                    />
                    <textarea
                        className="w-full border rounded p-2"
                        rows={3}
                        placeholder="Komentar privat untuk editor..."
                        value={commentsPrivate}
                        onChange={e => setCommentsPrivate(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Kirim Review
                </button>
            </div>
        </AppLayout>
    );
}