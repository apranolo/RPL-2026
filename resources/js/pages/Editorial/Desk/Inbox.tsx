import { InboxTab } from '@/components/InboxTab';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

interface InboxProps {
    counts: any;
    activeTab: string;
    submissions: any; // Paginator
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Editorial Desk', href: '/user/editorial/desk/inbox' },
    { title: 'Inbox', href: '#' },
];

export default function Inbox({ counts, activeTab, submissions }: InboxProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editorial Inbox" />

            <div className="container mx-auto py-6 space-y-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Editorial Inbox</h2>
                        <p className="text-muted-foreground">
                            Manage incoming journal submissions and editorial assignments.
                        </p>
                    </div>
                </div>

                <div className="flex w-full overflow-x-auto pb-2">
                    <InboxTab counts={counts} activeTab={activeTab} />
                </div>

                <div className="space-y-4">
                    {submissions.data.length === 0 ? (
                        <Card className="flex h-40 flex-col items-center justify-center text-center">
                            <CardDescription>No submissions found in this category.</CardDescription>
                        </Card>
                    ) : (
                        submissions.data.map((submission: any) => (
                            <Card key={submission.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold leading-none">
                                            {submission.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Submitted by {submission.author?.name || 'Unknown'} to {submission.journal?.name || 'Unknown Journal'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {submission.status.replace('_', ' ')}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-xs text-muted-foreground">
                                            Submitted on {new Date(submission.created_at).toLocaleDateString()}
                                        </div>
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link href="#">View Details</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
