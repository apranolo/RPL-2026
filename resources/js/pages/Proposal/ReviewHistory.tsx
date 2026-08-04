/**
 * @file ReviewHistory.tsx
 * @description Halaman riwayat review dosen yang menampilkan riwayat review selesai dan jadwal/penugasan review.
 * @module Proposal/ReviewHistory
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Award, BookOpen, Calendar, ChevronLeft, ChevronRight, ClipboardList, Eye, FileText, User as UserIcon } from 'lucide-react';

export interface Review {
    id: number;
    proposal_id: number;
    reviewer_id: number;
    score?: number;
    total_score?: number;
    feedback?: string;
    recommendation?: string;
    reviewed_at: string;
    proposal?: {
        title: string;
        description: string;
        user?: {
            name: string;
            university?: {
                name: string;
            };
        };
        research_schema?: {
            name: string;
        };
    };
    reviewer?: User;
}

export interface ReviewSchedule {
    id: number;
    reviewer_id: number;
    proposal_id: number;
    assigned_at: string;
    status: 'assigned' | 'in_progress' | 'completed';
    status_label: string;
    status_color: string;
    proposal?: {
        title: string;
        description: string;
        user?: {
            name: string;
            university?: {
                name: string;
            };
        };
        research_schema?: {
            name: string;
        };
    };
    reviewer?: User;
}

interface Props {
    dosen: User | null;
    reviews: PaginatedData<Review>;
    reviewSchedules: PaginatedData<ReviewSchedule>;
    isReviewer?: boolean;
}

export default function ReviewHistory({ dosen, reviews, reviewSchedules, isReviewer = true }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Riwayat Review',
            href: '#',
        },
    ];

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getScoreBadgeVariant = (score?: number) => {
        if (!score) return 'secondary';
        const numScore = Number(score);
        if (numScore >= 80) return 'default'; // primary / success equivalent
        if (numScore >= 60) return 'warning';
        return 'destructive';
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'in_progress':
                return 'warning';
            case 'assigned':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Review" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Riwayat Review
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {isReviewer
                                        ? (dosen
                                            ? `Menampilkan riwayat review dari dosen: ${dosen.name}`
                                            : 'Menampilkan riwayat review yang telah Anda lakukan')
                                        : (dosen
                                            ? `Menampilkan riwayat review untuk dosen: ${dosen.name}`
                                            : 'Menampilkan riwayat review untuk proposal penelitian Anda')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="space-y-6">
                        <Tabs defaultValue="reviews" className="w-full space-y-6">
                            {isReviewer && (
                                <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                                    <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-2">
                                        <TabsTrigger value="reviews" className="gap-2">
                                            <Award className="h-4 w-4" />
                                            Riwayat Review Selesai
                                            {reviews.total > 0 && (
                                                <Badge variant="secondary" className="ml-1">
                                                    {reviews.total}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="schedules" className="gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Jadwal / Penugasan Review
                                            {reviewSchedules.total > 0 && (
                                                <Badge variant="secondary" className="ml-1">
                                                    {reviewSchedules.total}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            <TabsContent value="reviews" className="space-y-4">
                                {reviews.data.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">Tidak Ada Riwayat</h3>
                                            <p className="text-sm text-muted-foreground">Belum ada riwayat review selesai.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {reviews.data.map((review) => {
                                                const scoreToShow = review.score !== undefined && review.score !== null ? review.score : review.total_score;
                                                return (
                                                    <Card key={review.id} className="flex flex-col">
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <CardTitle className="line-clamp-2 text-lg font-bold">
                                                                        {review.proposal?.title || 'Proposal Penelitian'}
                                                                    </CardTitle>
                                                                    <CardDescription className="mt-1 flex items-center gap-2">
                                                                        <BookOpen className="h-3 w-3" />
                                                                        {review.proposal?.research_schema?.name || 'Skema Penelitian'}
                                                                    </CardDescription>
                                                                </div>
                                                                {scoreToShow !== undefined && scoreToShow !== null && (
                                                                    <Badge variant={getScoreBadgeVariant(Number(scoreToShow)) as any} className="text-sm">
                                                                        Nilai: {scoreToShow}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="flex-1 space-y-4">
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Tanggal Review:</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(review.reviewed_at)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">
                                                                        {isReviewer ? 'Pengusul:' : 'Reviewer:'}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <UserIcon className="h-3 w-3" />
                                                                        {isReviewer
                                                                            ? (review.proposal?.user?.name || '-')
                                                                            : (review.reviewer?.name || '-')}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {review.recommendation && (
                                                                <div className="rounded-lg bg-muted p-3 text-sm">
                                                                    <span className="font-semibold">Rekomendasi: </span>
                                                                    <Badge variant="outline" className="ml-1 capitalize">
                                                                        {review.recommendation}
                                                                    </Badge>
                                                                    {review.feedback && (
                                                                        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground italic">
                                                                            "{review.feedback}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                        <CardFooter className="mt-auto grid grid-cols-2 gap-2 pt-4">
                                                            <Button variant="outline" size="sm" asChild className="w-full">
                                                                <Link href={route('proposal.show', review.proposal_id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                            <Button variant="default" size="sm" asChild className="w-full">
                                                                <a
                                                                    href={route('review.print', { type: 'proposal', id: review.id })}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    Cetak BA
                                                                </a>
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination for Reviews */}
                                        {reviews.total > reviews.per_page && (
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Menampilkan {reviews.from} hingga {reviews.to} dari {reviews.total} review
                                                </div>
                                                <div className="flex gap-2">
                                                    {reviews.prev_page_url && (
                                                        <Button variant="outline" size="sm" onClick={() => router.get(reviews.prev_page_url!)}>
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>
                                                    )}
                                                    {reviews.next_page_url && (
                                                        <Button variant="outline" size="sm" onClick={() => router.get(reviews.next_page_url!)}>
                                                            Selanjutnya
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            {/* Review Schedules Tab */}
                            <TabsContent value="schedules" className="space-y-4">
                                {reviewSchedules.data.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">Tidak Ada Jadwal</h3>
                                            <p className="text-sm text-muted-foreground">Belum ada jadwal atau penugasan review.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {reviewSchedules.data.map((schedule) => (
                                                <Card key={schedule.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <CardTitle className="line-clamp-2 text-lg font-bold">
                                                                    {schedule.proposal?.title || 'Proposal Penelitian'}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {schedule.proposal?.research_schema?.name || 'Skema Penelitian'}
                                                                </CardDescription>
                                                            </div>
                                                            <Badge variant={getStatusBadgeVariant(schedule.status) as any} className="text-sm">
                                                                {schedule.status_label}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="flex-1 space-y-4">
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Tanggal Ditugaskan:</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(schedule.assigned_at)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Pengusul:</span>
                                                                <span className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    {schedule.proposal?.user?.name || '-'}
                                                                </span>
                                                            </div>
                                                            {schedule.proposal?.user?.university?.name && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Universitas:</span>
                                                                    <span>{schedule.proposal.user.university.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="mt-auto pt-4">
                                                        <Button variant="outline" size="sm" asChild className="w-full">
                                                            <Link href={route('proposal.show', schedule.proposal_id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Proposal
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Pagination for Review Schedules */}
                                        {reviewSchedules.total > reviewSchedules.per_page && (
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Menampilkan {reviewSchedules.from} hingga {reviewSchedules.to} dari {reviewSchedules.total} jadwal
                                                </div>
                                                <div className="flex gap-2">
                                                    {reviewSchedules.prev_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(reviewSchedules.prev_page_url!)}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>
                                                    )}
                                                    {reviewSchedules.next_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(reviewSchedules.next_page_url!)}
                                                        >
                                                            Selanjutnya
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
