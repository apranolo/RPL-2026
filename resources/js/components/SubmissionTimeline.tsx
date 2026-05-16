interface StatusHistory {
    id: number;
    status: string;
    note?: string;
    created_at: string;
}

interface Props {
    tracking: StatusHistory[];
}

export default function SubmissionTimeline({ tracking }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'revision':
                return 'bg-yellow-100 text-yellow-700';
            case 'review':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-4">
            {tracking.length > 0 ? (
                tracking.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-4 w-4 rounded-full bg-blue-500" />

                            {index !== tracking.length - 1 && (
                                <div className="mt-1 h-full w-0.5 bg-gray-300" />
                            )}
                        </div>

                        <div className="flex-1 rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(item.status)}`}
                                >
                                    {item.status}
                                </span>

                                <span className="text-sm text-gray-500">
                                    {new Date(
                                        item.created_at,
                                    ).toLocaleString()}
                                </span>
                            </div>

                            {item.note && (
                                <p className="mt-3 text-gray-700">
                                    {item.note}
                                </p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">
                    No status history available.
                </p>
            )}
        </div>
    );
}