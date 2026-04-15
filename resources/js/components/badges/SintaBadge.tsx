import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface SintaBadgeProps {
    rank: string | null;
}

export default function SintaBadge({ rank }: SintaBadgeProps) {
    if (!rank || rank === 'non_sinta') {
        return (
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-600">
                <Award className="mr-1 h-3 w-3" />
                Non-SINTA
            </Badge>
        );
    }

    // Extract numeric rank from string enum (e.g. 'sinta_1' -> 1)
    const numericRank = parseInt(rank.replace('sinta_', ''), 10);

    // Color mapping for SINTA ranks
    const colors: Record<number, string> = {
        1: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
        2: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
        3: 'bg-yellow-500 text-gray-900 border-yellow-600 hover:bg-yellow-600',
        4: 'bg-yellow-400 text-gray-900 border-yellow-500 hover:bg-yellow-500',
        5: 'bg-blue-900 text-white border-blue-950 hover:bg-blue-950',
        6: 'bg-blue-800 text-white border-blue-900 hover:bg-blue-900',
    };

    const colorClass = colors[numericRank] || 'bg-gray-500 text-white';

    // Label mapping
    const labels: Record<string, string> = {
        sinta_1: 'SINTA 1',
        sinta_2: 'SINTA 2',
        sinta_3: 'SINTA 3',
        sinta_4: 'SINTA 4',
        sinta_5: 'SINTA 5',
        sinta_6: 'SINTA 6',
    };

    const label = labels[rank] || rank;

    return (
        <Badge className={`${colorClass} font-semibold`}>
            <Award className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}
