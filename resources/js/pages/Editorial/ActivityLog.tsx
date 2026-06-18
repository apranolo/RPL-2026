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
        
        <div className="min-h-screen overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-700 to-cyan-900">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-300 blur-3xl"></div>

                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300 blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-10">
                {/* Top Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-emerald-300"></div>

                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
                            Editorial Workflow
                        </span>
                    </div>

                    <h1 className="mt-6 text-5xl font-black tracking-tight text-white md:text-6xl">
                        Activity Log
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-emerald-100/80">
                        Monitor every editorial activity and workflow history
                        for this submission in real time.
                    </p>

                    {/* Submission Card */}
                    <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 shadow-2xl backdrop-blur-xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-300 text-lg font-bold text-slate-900">
                            #
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/50">
                                Submission ID
                            </p>

                            <h2 className="text-xl font-bold text-white">
                                #{submissionId}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
                    <ActivityLogTimeline logs={logs} />
                </div>
            </div>
        </div>
    );
}