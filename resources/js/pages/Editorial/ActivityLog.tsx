import ActivityLogTimeline from '@/components/ActivityLogTimeline';

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
    submissionId: number;
    logs: Log[];
}

export default function ActivityLog({
    submissionId,
    logs,
}: Props) {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    Activity Log
                </h1>

                <p className="text-gray-500 mt-2">
                    Submission #{submissionId}
                </p>
            </div>

            <ActivityLogTimeline logs={logs} />
        </div>
    );
}