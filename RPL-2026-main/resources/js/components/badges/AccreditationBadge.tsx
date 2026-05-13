import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface AccreditationBadgeProps {
    sk_number?: string | null;
    start_year?: number | null;
    end_year?: number | null;
    sinta_rank_label?: string | null;
}

export default function AccreditationBadge({ sk_number, start_year, end_year, sinta_rank_label }: AccreditationBadgeProps) {
    if (!sk_number) {
        return null;
    }

    const currentYear = new Date().getFullYear();
    const isExpired = end_year ? end_year < currentYear : false;
    const isExpiringSoon = end_year ? end_year === currentYear : false;

    let statusColor = 'bg-green-600 text-white border-green-700 hover:bg-green-700';
    if (isExpired) {
        statusColor = 'bg-red-600 text-white border-red-700 hover:bg-red-700';
    } else if (isExpiringSoon) {
        statusColor = 'bg-yellow-500 text-gray-900 border-yellow-600 hover:bg-yellow-600';
    }

    return (
        <div className="flex flex-col gap-1">
            <Badge className={`${statusColor} font-semibold`}>
                <Award className="mr-1 h-3 w-3" />
                {sinta_rank_label || 'Terakreditasi'}
            </Badge>
            <div className="space-y-0.5 text-xs">
                <div className="font-medium text-gray-700 dark:text-gray-300">SK: {sk_number}</div>
                {start_year && end_year && (
                    <div className={`${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-700' : 'text-gray-600 dark:text-gray-400'}`}>
                        Periode: {start_year} – {end_year}
                        {isExpired && ' (Kedaluwarsa)'}
                        {isExpiringSoon && ' (Segera Berakhir)'}
                    </div>
                )}
            </div>
        </div>
    );
}
