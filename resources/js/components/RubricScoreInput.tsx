import React from 'react';

interface Scores {
    score_originality: number;
    score_methodology: number;
    score_writing: number;
    score_relevance: number;
    score_conclusion: number;
}

interface Props {
    scores: Scores;
    onChange: (scores: Scores) => void;
}

const criteria = [
    { key: 'score_originality', label: 'Orisinalitas (Originality)' },
    { key: 'score_methodology', label: 'Metodologi (Methodology)' },
    { key: 'score_writing', label: 'Kualitas Penulisan (Writing)' },
    { key: 'score_relevance', label: 'Relevansi (Relevance)' },
    { key: 'score_conclusion', label: 'Kesimpulan (Conclusion)' },
];

export default function RubricScoreInput({ scores, onChange }: Props) {
    function handleChange(key: keyof Scores, value: number) {
        onChange({ ...scores, [key]: value });
    }

    // Auto-kalkulasi agregat real-time sesuai spesifikasi PRD
    const aggregate = Object.values(scores).reduce((a, b) => a + b, 0) / 5;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {criteria.map(({ key, label }) => (
                    <div key={key}>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-sm text-blue-600 font-bold">
                                {scores[key as keyof Scores]}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleChange(key as keyof Scores, val)}
                                    className={`w-10 h-10 rounded border font-semibold transition-colors ${
                                        scores[key as keyof Scores] === val
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Panel Kalkulasi Agregat Real-Time yang Menyatu di Komponen */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-gray-700">Skor Agregat Otomatis: </span>
                <span className="text-xl text-blue-600 font-bold">{aggregate.toFixed(2)}</span>
            </div>
        </div>
    );
}