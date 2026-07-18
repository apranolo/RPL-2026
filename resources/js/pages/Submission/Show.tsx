/**
 * Halaman detail naskah (submission) untuk author.
 * Menampilkan informasi naskah, dokumen terlampir, dan linimasa status review.
 */
import { SubmissionTimeline } from '@/components/SubmissionTimeline';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
    file_path?: string;
    status: string;
    created_at: string;
    author: Author;
    reviewer?: Reviewer;
}

interface Props {
    submission: Submission;
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

export default function Show({ submission, tracking }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Submissions', href: '/submissions' },
        { title: submission.title, href: `/submissions/${submission.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission Detail" />

            <div className="space-y-6 p-6">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{submission.title}</h1>

                            <p className="mt-1 text-sm text-gray-500">Submitted by {submission.author.name}</p>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(submission.status)}`}>{submission.status}</span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <h2 className="font-semibold">Author</h2>

                            <p>{submission.author.name}</p>

                            <p className="text-sm text-gray-500">{submission.author.email}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold">Reviewer</h2>

                            <p>{submission.reviewer?.name || 'Reviewer not assigned'}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="mb-2 font-semibold">Abstract</h2>

                        <p className="text-gray-700">{submission.abstract || '-'}</p>
                    </div>

                    <div className="mt-6">
                        <h2 className="mb-2 font-semibold">Document</h2>

                        {submission.file_path ? (
                            <Button asChild>
                                <a href={submission.file_path} target="_blank" rel="noopener noreferrer">
                                    View Document
                                </a>
                            </Button>
                        ) : (
                            <p className="text-gray-500">No document uploaded</p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold">Status Tracking</h2>

                    <SubmissionTimeline tracking={tracking} />
                </div>
            </div>
        </AppLayout>
    );
}
