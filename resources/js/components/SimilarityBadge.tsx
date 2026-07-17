interface SimilarityBadgeProps {
    percentage: number;
}

export default function SimilarityBadge({ percentage }: SimilarityBadgeProps) {
    let colorClass = 'bg-green-100 text-green-700';

    if (percentage >= 30 && percentage < 70) {
        colorClass = 'bg-yellow-100 text-yellow-700';
    }

    if (percentage >= 70) {
        colorClass = 'bg-red-100 text-red-700';
    }

    return <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>{percentage}% Similarity</span>;
}
