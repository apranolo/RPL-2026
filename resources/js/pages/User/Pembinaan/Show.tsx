/**
 * User Pembinaan Program Show Component
 *
 * @description
 * Detailed view of a specific pembinaan program for journal managers.
 * Displays comprehensive program information including registration periods,
 * assessment timeline, quota availability, and template requirements.
 * Provides primary CTA for program registration.
 *
 * @route GET /user/pembinaan/programs/{id}
 *
 * @features
 * - Complete program information display
 * - Registration and assessment period timeline
 * - Quota availability with progress visualization
 * - Accreditation template details
 * - Large prominent register CTA button
 * - Status-based conditional rendering
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Pembinaan } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, Calendar, CheckCircle2, Clock, FileText, Plus, Users, XCircle, type LucideIcon } from 'lucide-react';

interface Props {
    program: Pembinaan;
    isRegistered: boolean;
    category: 'akreditasi' | 'indeksasi';
}

export default function PembinaanShow({ program, isRegistered, category }: Props) {
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pembinaan',
            href: '#',
        },
        {
            title: categoryLabel,
            href: route(`user.pembinaan.${category}`),
        },
        {
            title: program.name,
            href: route('user.pembinaan.programs.show', program.id),
        },
    ];

    const getCategoryBadge = (category: string) => {
        return (
            <Badge variant="outline" className="capitalize">
                {category}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: LucideIcon; label: string }> = {
            draft: { variant: 'secondary', icon: Clock, label: 'Draft' },
            active: { variant: 'default', icon: CheckCircle2, label: 'Active' },
            closed: { variant: 'outline', icon: XCircle, label: 'Closed' },
        };

        const config = variants[status] || variants.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateProgress = () => {
        if (!program.quota) return 0;
        const approved = program.approved_registrations_count || 0;
        return Math.min((approved / program.quota) * 100, 100);
    };

    const isQuotaFull = () => {
        if (!program.quota) return false;
        return (program.approved_registrations_count || 0) >= program.quota;
    };

    const canRegister = () => {
        if (program.status !== 'active') return false;
        if (isQuotaFull()) return false;
        if (isRegistered) return false;

        const now = new Date();
        const registrationStart = new Date(program.registration_start);
        const registrationEnd = new Date(program.registration_end);

        return now >= registrationStart && now <= registrationEnd;
    };

    const getRegistrationMessage = () => {
        if (isRegistered) {
            return 'You have already registered to this program';
        }
        if (program.status !== 'active') {
            return 'This program is not active';
        }
        if (isQuotaFull()) {
            return 'Registration quota is full';
        }

        const now = new Date();
        const registrationStart = new Date(program.registration_start);
        const registrationEnd = new Date(program.registration_end);

        if (now < registrationStart) {
            return `Registration opens on ${formatDate(program.registration_start)}`;
        }
        if (now > registrationEnd) {
            return 'Registration period has ended';
        }

        return null;
    };

    const progress = calculateProgress();
    const registrationMessage = getRegistrationMessage();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={program.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    {getCategoryBadge(program.category)}
                                    {getStatusBadge(program.status)}
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{program.name}</h1>
                                {program.accreditation_template?.name && (
                                    <p className="mt-1 text-lg text-muted-foreground">{program.accreditation_template.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Program Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {program.description ? (
                                        <p className="whitespace-pre-wrap text-muted-foreground">{program.description}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No description available</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Program Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Registration Period */}
                                    <div>
                                        <h4 className="mb-3 font-semibold">Registration Period</h4>
                                        <div className="space-y-2 rounded-lg border p-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Start:</span>
                                                <span className="text-sm font-medium">{formatDateTime(program.registration_start)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">End:</span>
                                                <span className="text-sm font-medium">{formatDateTime(program.registration_end)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assessment Period */}
                                    <div>
                                        <h4 className="mb-3 font-semibold">Assessment Period</h4>
                                        <div className="space-y-2 rounded-lg border p-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Start:</span>
                                                <span className="text-sm font-medium">{formatDateTime(program.assessment_start)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">End:</span>
                                                <span className="text-sm font-medium">{formatDateTime(program.assessment_end)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Template Information */}
                            {program.accreditation_template?.name && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Assessment Template
                                        </CardTitle>
                                        <CardDescription>This program uses {program.accreditation_template.name} for evaluation</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg bg-muted p-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Template Name:</span>
                                                    <span className="font-medium">{program.accreditation_template.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Template Type:</span>
                                                    <span className="font-medium capitalize">{program.accreditation_template.type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <span className="font-medium">
                                                        {program.accreditation_template.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Registration CTA */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {registrationMessage && (
                                        <div
                                            className={`rounded-lg border p-3 text-sm ${
                                                canRegister()
                                                    ? 'border-primary/50 bg-primary/10 text-primary'
                                                    : 'border-muted bg-muted/50 text-muted-foreground'
                                            }`}
                                        >
                                            {registrationMessage}
                                        </div>
                                    )}

                                    {canRegister() ? (
                                        <Button size="lg" className="w-full" asChild>
                                            <Link href={route('user.pembinaan.programs.register-form', program.id)}>
                                                <Plus className="mr-2 h-5 w-5" />
                                                Register Now
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="w-full" disabled>
                                            {isRegistered ? 'Already Registered' : 'Registration Unavailable'}
                                        </Button>
                                    )}

                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={route(`user.pembinaan.${category}`)}>Back to Programs</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quota Information */}
                            {program.quota && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Quota Availability
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">{program.approved_registrations_count || 0}</span>
                                            <span className="text-sm text-muted-foreground">/ {program.quota}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="h-3 overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={`h-full transition-all ${isQuotaFull() ? 'bg-destructive' : 'bg-primary'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {isQuotaFull()
                                                    ? 'Quota is full'
                                                    : `${program.quota - (program.approved_registrations_count || 0)} spots remaining`}
                                            </p>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Registrations:</span>
                                                <span className="font-medium">{program.registrations_count || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Pending Review:</span>
                                                <span className="font-medium">{program.pending_registrations_count || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Approved:</span>
                                                <span className="font-medium text-green-600">{program.approved_registrations_count || 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Program Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Program Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="font-medium capitalize">{program.category}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        {getStatusBadge(program.status)}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span className="font-medium">{formatDate(program.created_at)}</span>
                                    </div>
                                    {program.creator?.name && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Created by:</span>
                                                <span className="font-medium">{program.creator.name}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
