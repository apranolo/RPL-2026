interface User {
    id: number;
    name: string;
}

interface Log {
    id: number;
    action: string;
    description: string | null;
    created_at: string;
    user: User;
}

interface Props {
    logs: Log[];
}

export default function ActivityLogTimeline({
    logs,
}: Props) {
    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">
                    Belum ada activity log.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="flex gap-4"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>

                        <div className="w-1 h-full bg-gray-300"></div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-4 w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-lg">
                                {log.action}
                            </h2>

                            <span className="text-sm text-gray-400">
                                {new Date(
                                    log.created_at
                                ).toLocaleString()}
                            </span>
                        </div>

                        <p className="text-gray-600 mt-2">
                            {log.description ??
                                'Tidak ada deskripsi'}
                        </p>

                        <div className="mt-4 text-sm text-gray-500">
                            Oleh:{' '}
                            <span className="font-medium">
                                {log.user?.name}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}