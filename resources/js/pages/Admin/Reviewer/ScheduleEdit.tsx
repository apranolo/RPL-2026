import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Review Schedules', href: '/admin/schedules' },
    { title: 'Edit', href: '' },
];

interface JournalAssessment {
    id: number;
    journal: { id: number; title: string; issn: string };
    user: { id: number; name: string };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface ReviewSchedule {
    id: number;
    journal_assessment_id: number;
    reviewer_id: number;
    scheduled_at: string;
    ended_at?: string;
    location?: string;
    meeting_link?: string;
    notes?: string;
    status: string;
    proposal?: { journal: { title: string } };
    reviewer?: { name: string };
}

interface Props {
    schedule: ReviewSchedule;
    assessments: JournalAssessment[];
    reviewers: User[];
}

export default function ScheduleEdit({ schedule, assessments, reviewers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        journal_assessment_id: String(schedule.journal_assessment_id),
        reviewer_id: String(schedule.reviewer_id),
        scheduled_at: schedule.scheduled_at ? schedule.scheduled_at.slice(0, 16) : '',
        ended_at: schedule.ended_at ? schedule.ended_at.slice(0, 16) : '',
        location: schedule.location || '',
        meeting_link: schedule.meeting_link || '',
        notes: schedule.notes || '',
        status: schedule.status,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(route('admin.schedules.update', schedule.id), {
            onSuccess: () => {
                toast.success('Schedule updated successfully');
            },
            onError: () => {
                toast.error('Failed to update schedule');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Review Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={route('admin.schedules.index')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit Review Schedule</h1>
                                <p className="mt-1 text-muted-foreground">
                                    {schedule.proposal?.journal?.title} - {schedule.reviewer?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="journal_assessment_id">
                                    Assessment (Proposal) <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.journal_assessment_id}
                                    onValueChange={(value) => setData('journal_assessment_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an assessment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assessments.map((assessment) => (
                                            <SelectItem key={assessment.id} value={String(assessment.id)}>
                                                {assessment.journal.title} - {assessment.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.journal_assessment_id && (
                                    <p className="text-sm text-destructive">{errors.journal_assessment_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reviewer_id">
                                    Reviewer <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.reviewer_id}
                                    onValueChange={(value) => setData('reviewer_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a reviewer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reviewers.map((reviewer) => (
                                            <SelectItem key={reviewer.id} value={String(reviewer.id)}>
                                                {reviewer.name} ({reviewer.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.reviewer_id && (
                                    <p className="text-sm text-destructive">{errors.reviewer_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">
                                        Scheduled Date & Time <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={(e) => setData('scheduled_at', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.scheduled_at && (
                                        <p className="text-sm text-destructive">{errors.scheduled_at}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ended_at">End Date & Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="ended_at"
                                            type="datetime-local"
                                            value={data.ended_at}
                                            onChange={(e) => setData('ended_at', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.ended_at && (
                                        <p className="text-sm text-destructive">{errors.ended_at}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">{errors.status}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    placeholder="e.g., Room 302, Building A"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                />
                                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meeting_link">Meeting Link</Label>
                                <Input
                                    id="meeting_link"
                                    type="url"
                                    placeholder="e.g., https://meet.google.com/abc-defg-hij"
                                    value={data.meeting_link}
                                    onChange={(e) => setData('meeting_link', e.target.value)}
                                />
                                {errors.meeting_link && (
                                    <p className="text-sm text-destructive">{errors.meeting_link}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t pt-6">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Schedule'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('admin.schedules.index')}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
