import { IndexationBadge, SintaBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

interface JournalCardProps {
    id: number; // Journal ID for internal routing
    title: string;
    issn?: string | null;
    e_issn?: string | null;
    sinta_rank: string | null;
    indexation_labels?: string[];
    university?: string;
    external_url?: string | null; // External journal website URL
    coverColor?: string; // Optional color for the card header pattern
}

export default function JournalCard({
    id,
    title,
    issn,
    e_issn,
    sinta_rank,
    indexation_labels = [],
    university = 'Universitas Muhammadiyah',
    external_url = null,
    coverColor = 'bg-[#079C4E]', // Default to Official Green
}: JournalCardProps) {
    // Display max 3 indexations, prioritizing Scopus, WoS, DOAJ
    const priorityIndexations = ['Scopus', 'WoS', 'DOAJ'];
    const displayIndexations = [
        ...indexation_labels.filter((label) => priorityIndexations.includes(label)),
        ...indexation_labels.filter((label) => !priorityIndexations.includes(label)),
    ].slice(0, 3);

    const remainingCount = indexation_labels.length - displayIndexations.length;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-zinc-900">
            {/* Decorative Header / Cover Placeholder */}
            <div className={`h-24 w-full ${coverColor} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                <div className="absolute -top-8 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20" />
                <div className="absolute bottom-0 left-0 p-4">
                    <div className="rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-gray-900 backdrop-blur-sm">{university}</div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                {/* Badges Row */}
                <div className="mb-3 flex flex-wrap items-start gap-2">
                    <SintaBadge rank={sinta_rank} />

                    {displayIndexations.map((label) => (
                        <IndexationBadge key={label} platform={label} variant="default" />
                    ))}

                    {remainingCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                            +{remainingCount} more
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-heading mb-2 line-clamp-2 text-xl leading-tight font-bold text-gray-900 transition-colors group-hover:text-[#079C4E] dark:text-white">
                    <Link href={route('journals.show', id)}>{title}</Link>
                </h3>

                {/* ISSN Info */}
                <div className="mt-auto space-y-1 pt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                        <span>P-ISSN</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{issn || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>E-ISSN</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{e_issn || '-'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                    <Button asChild className="w-full bg-[#079C4E] font-semibold text-white hover:bg-[#068a45]">
                        <Link href={route('journals.show', id)}>View Journal</Link>
                    </Button>
                    {external_url && (
                        <Button asChild variant="outline" size="icon" className="shrink-0 border-[#079C4E]/20 text-[#079C4E] hover:bg-[#079C4E]/10">
                            <a href={external_url} target="_blank" rel="noopener noreferrer" title="Visit Journal Website">
                                <BookOpen className="h-4 w-4" />
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
