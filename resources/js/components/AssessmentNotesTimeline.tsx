import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export interface AssessmentNote {
    id: number;
    journal_assessment_id: number;
    user_id: number;
    author_role: string;
    note_type: 'submission' | 'approval' | 'rejection' | 'review' | 'general';
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface AssessmentNotesTimelineProps {
    notes: AssessmentNote[];
    title?: string;
}

/**
 * AssessmentNotesTimeline Component
 *
 * Displays a timeline of assessment notes with author information, role badges,
 * and timestamps. Shows notes from User, Admin Kampus, Reviewer in chronological order.
 *
 * @component
 * @example
 * ```tsx
 * <AssessmentNotesTimeline
 *   notes={assessmentNotes}
 *   title="Catatan Assessment"
 * />
 * ```
 */
export default function AssessmentNotesTimeline({ notes, title = 'Catatan Assessment' }: AssessmentNotesTimelineProps) {
    const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
        switch (role.toLowerCase()) {
            case 'admin kampus':
            case 'lppm':
                return 'default';
            case 'reviewer':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getNoteTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            submission: 'Pengajuan',
            approval: 'Persetujuan',
            rejection: 'Penolakan',
            review: 'Review',
            general: 'Catatan Umum',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm 'WIB'", {
                locale: id,
            });
        } catch {
            return dateString;
        }
    };

    if (!notes || notes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="py-8 text-center text-sm text-muted-foreground">Belum ada catatan untuk assessment ini.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {notes.map((note, index) => (
                        <div key={note.id} className="relative border-l-2 border-gray-300 pb-4 pl-4 last:pb-0">
                            {/* Timeline dot */}
                            <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-primary" />

                            {/* Note header */}
                            <div className="mb-2 flex flex-wrap items-start gap-2">
                                <Badge variant={getRoleBadgeVariant(note.author_role)}>{note.author_role}</Badge>
                                <Badge variant="outline" className="text-xs">
                                    {getNoteTypeLabel(note.note_type)}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">{note.user.name}</span>
                            </div>

                            {/* Note content */}
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm whitespace-pre-wrap text-gray-700">{note.content}</p>
                            </div>

                            {/* Timestamp */}
                            <p className="mt-2 text-xs text-gray-500">{formatDate(note.created_at)}</p>

                            {/* Separator line (except for last item) */}
                            {index < notes.length - 1 && <div className="absolute bottom-0 left-0 h-px w-full bg-gray-200" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
