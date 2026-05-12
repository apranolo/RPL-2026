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
    { key: 'score_originality', label: 'Orisinalitas' },
    { key: 'score_methodology', label: 'Metodologi' },
    { key: 'score_writing', label: 'Penulisan' },
    { key: 'score_relevance', label: 'Relevansi' },
    { key: 'score_conclusion', label: 'Kesimpulan' },
];

export default function RubricScoreInput({ scores, onChange }: Props) {
    function handleChange(key: string, value: number) {
        onChange({ ...scores, [key]: value });
    }

    return (
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
                                onClick={() => handleChange(key, val)}
                                className={`w-10 h-10 rounded border font-semibold ${
                                    scores[key as keyof Scores] === val
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}