import { Badge } from '@/components/ui/badge';
import { Database, Globe } from 'lucide-react';

interface IndexationBadgeProps {
    platform: string;
    /** @deprecated Use url instead */
    indexed_date?: string | null;
    url?: string | null;
    showDate?: boolean;
    variant?: 'default' | 'outline';
}

export default function IndexationBadge({ platform, url, indexed_date, showDate = false, variant = 'default' }: IndexationBadgeProps) {
    // Color mapping for different indexation platforms
    const platformColors: Record<string, string> = {
        Scopus: 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700',
        WoS: 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800',
        DOAJ: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
        Copernicus: 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700',
        'Google Scholar': 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
        Garuda: 'bg-red-700 text-white border-red-800 hover:bg-red-800',
        Dimensions: 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700',
        BASE: 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700',
    };

    // Icons for specific platforms
    const Icon = platform === 'Google Scholar' ? Globe : Database;

    const colorClass =
        variant === 'outline'
            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            : platformColors[platform] || 'bg-gray-600 text-white border-gray-700 hover:bg-gray-700';

    return (
        <div className="flex flex-col gap-1">
            <Badge className={`${colorClass} font-medium`}>
                <Icon className="mr-1 h-3 w-3" />
                {platform}
            </Badge>
            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate max-w-[160px]"
                >
                    Lihat halaman
                </a>
            )}
            {showDate && indexed_date && !url && (
                <span className="text-xs text-gray-500">
                    Terindeks:{' '}
                    {new Date(indexed_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </span>
            )}
        </div>
    );
}
