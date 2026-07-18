/**
 * Komponen linimasa (timeline) yang menampilkan riwayat perubahan
 * status sebuah naskah secara kronologis.
 */

interface StatusHistory {
    id: number;
    status: string;
    note?: string;
    created_at: string;
}

interface Props {
    tracking: StatusHistory[];
}

/**
 * Mengembalikan kelas warna badge status sesuai token Progressive Aurora.
 */
function getStatusBadge(status: string): string {
    switch (status.toLowerCase()) {
        case 'accepted':
            return 'bg-emerald-100 text-emerald-700';
        case 'rejected':
            return 'bg-rose-100 text-rose-700';
        case 'revision':
            return 'bg-amber-100 text-amber-700';
        case 'review':
            return 'bg-indigo-100 text-indigo-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

export function SubmissionTimeline({ tracking }: Props) {
    return (
        <div className="space-y-4">
            {tracking.length > 0 ? (
                tracking.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-4 w-4 rounded-full bg-indigo-500" />

                            {index !== tracking.length - 1 && <div className="mt-1 h-full w-0.5 bg-slate-300" />}
                        </div>

                        <div className="flex-1 rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(item.status)}`}>{item.status}</span>

                                <span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                            </div>

                            {item.note && <p className="mt-3 text-gray-700">{item.note}</p>}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No status history available.</p>
            )}
        </div>
    );
}

export default SubmissionTimeline;
