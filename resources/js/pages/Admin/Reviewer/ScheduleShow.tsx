/**
 * @file ScheduleShow.tsx
 * @description Komponen halaman admin untuk menampilkan detail informasi dari jadwal penilaian review jurnal (Review Schedule).
 * @author Candra
 * @date 2026-07-09
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Clock, Edit, ExternalLink, Globe, MapPin, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Review Schedules', href: '/admin/schedules' },
    { title: 'Detail', href: '' },
];

interface ReviewSchedule {
    id: number;
    proposal_id: number;
    reviewer_id: number;
    scheduled_at: string;
    ended_at?: string;
    location?: string;
    meeting_link?: string;
    notes?: string;
    status: string;
    proposal?: {
        id: number;
        journal: {
            id: number;
            title: string;
            issn: string;
        };
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    reviewer?: {
        id: number;
        name: string;
        email: string;
    };
    creator?: {
        id: number;
        name: string;
    };
    updater?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    schedule: ReviewSchedule;
}

export default function ScheduleShow({ schedule }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.role?.name === 'Super Admin';

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            scheduled: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
        };
        return (
            <Badge variant={(variants[status] as any) || 'outline'} className="text-sm">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDateTime = (date: string) => {
        return format(new Date(date), 'EEEE, dd MMMM yyyy HH:mm', { locale: id });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule Details" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={route('admin.schedules.index')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">Schedule Details</h1>
                                    {getStatusBadge(schedule.status)}
                                </div>
                            </div>
                            {isSuperAdmin && (
                                <Button asChild className="flex items-center gap-2">
                                    <Link href={route('admin.schedules.edit', schedule.id)}>
                                        <Edit className="h-4 w-4" />
                                        Edit Schedule
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5" />
                                    Schedule Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Start Time</span>
                                    <p className="font-medium">{formatDateTime(schedule.scheduled_at)}</p>
                                </div>
                                {schedule.ended_at && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">End Time</span>
                                        <p className="font-medium">{formatDateTime(schedule.ended_at)}</p>
                                    </div>
                                )}
                                <Separator />
                                <div>
                                    <span className="text-sm text-muted-foreground">Location</span>
                                    {schedule.location ? (
                                        <p className="flex items-center gap-1 font-medium">
                                            <MapPin className="h-4 w-4" />
                                            {schedule.location}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground">Not specified</p>
                                    )}
                                </div>
                                {schedule.meeting_link && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Meeting Link</span>
                                        <p>
                                            <a
                                                href={schedule.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open Meeting
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5" />
                                    Review Assignment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Reviewer</span>
                                    <p className="font-medium">{schedule.reviewer?.name || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">{schedule.reviewer?.email}</p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-sm text-muted-foreground">Assessment (Proposal)</span>
                                    <p className="font-medium">{schedule.proposal?.journal?.title || 'N/A'}</p>
                                    {schedule.proposal?.journal?.issn && (
                                        <p className="text-sm text-muted-foreground">ISSN: {schedule.proposal.journal.issn}</p>
                                    )}
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Submitted by</span>
                                    <p className="font-medium">{schedule.proposal?.user?.name || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {schedule.notes && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Globe className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{schedule.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Audit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Created by</span>
                                <p className="font-medium">{schedule.creator?.name || 'System'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Created at</span>
                                <p className="font-medium">{formatDateTime(schedule.created_at)}</p>
                            </div>
                            {schedule.updater && (
                                <>
                                    <div>
                                        <span className="text-muted-foreground">Last updated by</span>
                                        <p className="font-medium">{schedule.updater.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Last updated at</span>
                                        <p className="font-medium">{formatDateTime(schedule.updated_at)}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
