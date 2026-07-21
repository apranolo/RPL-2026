import { Badge } from '@/components/ui/badge';

interface ReviewRoundBadgeProps {
    round: number;
    status?: 'Pending' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
}

/**
 * Small badge showing which review round an assignment belongs to
 * (e.g. "Round 1"), optionally colored by the assignment's status.
 *
 * Status values match the `review_assignments.status` enum defined in
 * Agnes's migration (Kelas G / Modul 4 - Peer Review OJS).
 */
const STATUS_VARIANT: Record<NonNullable<ReviewRoundBadgeProps['status']>, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Pending: 'outline',
    Accepted: 'default',
    Declined: 'destructive',
    Completed: 'secondary',
    Cancelled: 'destructive',
};

export default function ReviewRoundBadge({ round, status }: ReviewRoundBadgeProps) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Badge variant="outline">Round {round}</Badge>
            {status && <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>}
        </span>
    );
}