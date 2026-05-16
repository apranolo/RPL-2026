import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface StatusHistory {
    id: number;
    status: string;
    note?: string;
    created_at: string;
}

interface Author {
    id: number;
    name: string;
    email: string;
}

interface Reviewer {
    id: number;
    name: string;
}

interface Submission {
    id: number;
    title: string;
    abstract?: string;
    document_path?: string;
    status: string;
    created_at: string;
    author: Author;
    reviewer?: Reviewer;
}

interface Props {
    submission: Submission;
    tracking: StatusHistory[];
}

export default function Show({ submission, tracking }: Props) {
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
        <AppLayout>
            <Head title="Submission Detail" />

            <div className="space-y-6 p-6">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {submission.title}
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Submitted by {submission.author.name}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(submission.status)}`}
                        >
                            {submission.status}
                        </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <h2 className="font-semibold">Author</h2>

                            <p>{submission.author.name}</p>

                            <p className="text-sm text-gray-500">
                                {submission.author.email}
                            </p>
                        </div>

                        <div>
                            <h2 className="font-semibold">Reviewer</h2>

                            <p>
                                {submission.reviewer?.name ||
                                    'Reviewer not assigned'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="mb-2 font-semibold">Abstract</h2>

                        <p className="text-gray-700">
                            {submission.abstract || '-'}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h2 className="mb-2 font-semibold">Document</h2>

                        {submission.document_path ? (
                            <a
                                href={submission.document_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                View Document
                            </a>
                        ) : (
                            <p className="text-gray-500">
                                No document uploaded
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold">
                        Status Tracking
                    </h2>

                    <div className="space-y-4">
                        {tracking.length > 0 ? (
                            tracking.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border p-4"
                                >
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
                            ))
                        ) : (
                            <p className="text-gray-500">
                                No status history available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}