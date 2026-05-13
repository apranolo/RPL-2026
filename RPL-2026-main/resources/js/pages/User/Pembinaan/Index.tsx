/**
 * User Pembinaan Index Component
 *
 * @description
 * Main page for journal managers to view available pembinaan programs
 * and track their registration status. Features two tabs:
 * 1. Available Programs - Active programs open for registration
 * 2. My Registrations - User's registration history and status
 *
 * @route GET /user/pembinaan/akreditasi | GET /user/pembinaan/indeksasi
 *
 * @features
 * - Two-tab interface (Available Programs / My Registrations)
 * - Registration quota display with progress
 * - Status badges for registrations
 * - Quick actions (view details, register, view registration)
 * - Pagination for registrations
 * - Category-filtered programs (Akreditasi or Indeksasi)
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type Pembinaan, type PembinaanRegistration } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Award, BookOpen, Calendar, ChevronLeft, ChevronRight, Eye, FileText, Plus, Users } from 'lucide-react';

interface Props {
    availablePrograms: Pembinaan[];
    myRegistrations: PaginatedData<PembinaanRegistration>;
    category: 'akreditasi' | 'indeksasi';
}

export default function PembinaanIndex({ availablePrograms, myRegistrations, category }: Props) {
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
            href: `/user/pembinaan/${category}`,
        },
    ];
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status as keyof typeof variants] as any}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getCategoryBadge = (category: string) => {
        return (
            <Badge variant="outline" className="capitalize">
                {category}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const calculateProgress = (approved: number, quota?: number) => {
        if (!quota) return 0;
        return Math.min((approved / quota) * 100, 100);
    };

    const isQuotaFull = (approved: number, quota?: number) => {
        if (!quota) return false;
        return approved >= quota;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pembinaan ${categoryLabel}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Pembinaan {categoryLabel}
                                </h1>
                                <p className="mt-1 text-muted-foreground">Browse available {category} programs and manage your registrations</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="space-y-6">
                        <Tabs defaultValue="available" className="w-full space-y-6">
                            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                                <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-2">
                                    <TabsTrigger value="available" className="gap-2">
                                        <Award className="h-4 w-4" />
                                        Available Programs
                                        {availablePrograms.length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {availablePrograms.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="registrations" className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        My Registrations
                                        {myRegistrations.total > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {myRegistrations.total}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Available Programs Tab */}
                            <TabsContent value="available" className="space-y-4">
                                {availablePrograms.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">No Available Programs</h3>
                                            <p className="text-sm text-muted-foreground">
                                                There are currently no active programs open for registration.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {availablePrograms.map((program) => {
                                            const quotaFull = isQuotaFull(program.approved_registrations_count || 0, program.quota);
                                            const progress = calculateProgress(program.approved_registrations_count || 0, program.quota);

                                            return (
                                                <Card key={program.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <CardTitle className="line-clamp-2">{program.name}</CardTitle>
                                                                {program.accreditation_template && (
                                                                    <CardDescription className="mt-1">
                                                                        {program.accreditation_template.name}
                                                                    </CardDescription>
                                                                )}
                                                            </div>
                                                            {getCategoryBadge(program.category)}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="flex-1 space-y-4">
                                                        {program.description && (
                                                            <p className="line-clamp-3 text-sm text-muted-foreground">{program.description}</p>
                                                        )}

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>
                                                                    {formatDate(program.registration_start)} - {formatDate(program.registration_end)}
                                                                </span>
                                                            </div>

                                                            {program.quota && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />
                                                                            Quota
                                                                        </span>
                                                                        <span>
                                                                            {program.approved_registrations_count || 0} / {program.quota}
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                                                        <div
                                                                            className="h-full bg-primary transition-all"
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="mt-auto w-full flex-col gap-2 sm:flex-row">
                                                        <Button variant="outline" size="sm" asChild className="w-full sm:flex-1">
                                                            <Link href={route('user.pembinaan.programs.show', program.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" asChild className="w-full sm:flex-1" disabled={quotaFull}>
                                                            <Link href={route('user.pembinaan.programs.register-form', program.id)}>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                {quotaFull ? 'Quota Full' : 'Register'}
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>

                            {/* My Registrations Tab */}
                            <TabsContent value="registrations" className="space-y-4">
                                {myRegistrations.data.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">No Registrations Yet</h3>
                                            <p className="mb-4 text-sm text-muted-foreground">You haven't registered to any programs yet.</p>
                                            <Button asChild>
                                                <a href="#available">Browse Available Programs</a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {myRegistrations.data.map((registration) => (
                                                <Card key={registration.id}>
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <CardTitle className="line-clamp-1">{registration.pembinaan?.name}</CardTitle>
                                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {registration.journal?.title}
                                                                </CardDescription>
                                                            </div>
                                                            {getStatusBadge(registration.status)}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Registered:</span>
                                                                <span>{formatDate(registration.registered_at)}</span>
                                                            </div>
                                                            {registration.reviewed_at && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Reviewed:</span>
                                                                    <span>{formatDate(registration.reviewed_at)}</span>
                                                                </div>
                                                            )}
                                                            {registration.reviewer && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Reviewer:</span>
                                                                    <span>{registration.reviewer.name}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {registration.rejection_reason && (
                                                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                                                <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                                                                <p className="mt-1 text-sm text-muted-foreground">{registration.rejection_reason}</p>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                                            {registration.attachments_count !== undefined && (
                                                                <div className="flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" />
                                                                    {registration.attachments_count} files
                                                                </div>
                                                            )}
                                                            {registration.reviews_count !== undefined && registration.reviews_count > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Award className="h-3 w-3" />
                                                                    {registration.reviews_count} review
                                                                    {registration.reviews_count > 1 ? 's' : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter>
                                                        <Button variant="outline" size="sm" asChild className="w-full">
                                                            <Link href={route('user.pembinaan.registration', registration.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {myRegistrations.total > myRegistrations.per_page && (
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {myRegistrations.from} to {myRegistrations.to} of {myRegistrations.total} registrations
                                                </div>
                                                <div className="flex gap-2">
                                                    {myRegistrations.prev_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(myRegistrations.prev_page_url!)}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Previous
                                                        </Button>
                                                    )}
                                                    {myRegistrations.next_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(myRegistrations.next_page_url!)}
                                                        >
                                                            Next
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
