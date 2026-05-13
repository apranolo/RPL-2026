import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type JournalAssessment, type PaginatedData, type PembinaanReview, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Award, BookOpen, Calendar, ChevronLeft, ChevronRight, ClipboardList, Eye, FileText, User as UserIcon } from 'lucide-react';

interface Props {
    dosen: User | null;
    pembinaanReviews: PaginatedData<PembinaanReview>;
    journalAssessments: PaginatedData<JournalAssessment>;
}

export default function ReviewHistory({ dosen, pembinaanReviews, journalAssessments }: Props) {
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
        if (score >= 80) return 'default'; // primary / success equivalent
        if (score >= 60) return 'warning';
        return 'destructive';
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
                                    {dosen
                                        ? `Menampilkan riwayat review dari dosen: ${dosen.name}`
                                        : 'Menampilkan riwayat review yang telah Anda lakukan'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="space-y-6">
                        <Tabs defaultValue="pembinaan" className="w-full space-y-6">
                            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                                <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-2">
                                    <TabsTrigger value="pembinaan" className="gap-2">
                                        <Award className="h-4 w-4" />
                                        Review Pembinaan
                                        {pembinaanReviews.total > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {pembinaanReviews.total}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="journal" className="gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Review Penilaian Jurnal
                                        {journalAssessments.total > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {journalAssessments.total}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Pembinaan Reviews Tab */}
                            <TabsContent value="pembinaan" className="space-y-4">
                                {pembinaanReviews.data.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">Tidak Ada Riwayat</h3>
                                            <p className="text-sm text-muted-foreground">Belum ada riwayat review pembinaan.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {pembinaanReviews.data.map((review) => (
                                                <Card key={review.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <CardTitle className="line-clamp-2">
                                                                    {review.registration?.pembinaan?.name || 'Program Pembinaan'}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {review.registration?.journal?.title || 'Jurnal'}
                                                                </CardDescription>
                                                            </div>
                                                            {review.score && (
                                                                <Badge variant={getScoreBadgeVariant(review.score) as any} className="text-sm">
                                                                    Nilai: {review.score}
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
                                                                <span className="text-muted-foreground">Pengusul:</span>
                                                                <span className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    {review.registration?.user?.name || '-'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {review.recommendation && (
                                                            <div className="rounded-lg bg-muted p-3 text-sm">
                                                                <span className="font-semibold">Rekomendasi: </span>
                                                                <p className="mt-1 line-clamp-3 text-muted-foreground">{review.recommendation}</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                    <CardFooter className="mt-auto pt-4">
                                                        <Button variant="outline" size="sm" asChild className="w-full">
                                                            {/* Ganti rute di bawah ini sesuai dengan halaman detail review yang ada */}
                                                            <Link href="#">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Pagination for Pembinaan */}
                                        {pembinaanReviews.total > pembinaanReviews.per_page && (
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Menampilkan {pembinaanReviews.from} hingga {pembinaanReviews.to} dari {pembinaanReviews.total} review
                                                </div>
                                                <div className="flex gap-2">
                                                    {pembinaanReviews.prev_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(pembinaanReviews.prev_page_url!)}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>
                                                    )}
                                                    {pembinaanReviews.next_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(pembinaanReviews.next_page_url!)}
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

                            {/* Journal Assessments Tab */}
                            <TabsContent value="journal" className="space-y-4">
                                {journalAssessments.data.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                            <h3 className="mb-2 text-lg font-semibold">Tidak Ada Riwayat</h3>
                                            <p className="text-sm text-muted-foreground">Belum ada riwayat penilaian jurnal.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {journalAssessments.data.map((assessment) => (
                                                <Card key={assessment.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <CardTitle className="line-clamp-2">
                                                                    {assessment.journal?.title || 'Jurnal'}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                                    <Award className="h-3 w-3" />
                                                                    Penilaian Periode {assessment.period || assessment.assessment_date}
                                                                </CardDescription>
                                                            </div>
                                                            {assessment.total_score !== undefined && (
                                                                <Badge variant={getScoreBadgeVariant(assessment.percentage) as any} className="text-sm">
                                                                    Skor: {assessment.total_score}
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
                                                                    {assessment.reviewed_at ? formatDate(assessment.reviewed_at) : '-'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Pengusul:</span>
                                                                <span className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    {assessment.user?.name || '-'}
                                                                </span>
                                                            </div>
                                                            {assessment.percentage !== undefined && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Persentase:</span>
                                                                    <span className="font-medium">{assessment.percentage}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="mt-auto pt-4">
                                                        <Button variant="outline" size="sm" asChild className="w-full">
                                                            {/* Ganti rute di bawah ini sesuai dengan halaman detail penilaian yang ada */}
                                                            <Link href="#">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Pagination for Journal Assessments */}
                                        {journalAssessments.total > journalAssessments.per_page && (
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Menampilkan {journalAssessments.from} hingga {journalAssessments.to} dari {journalAssessments.total} penilaian
                                                </div>
                                                <div className="flex gap-2">
                                                    {journalAssessments.prev_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(journalAssessments.prev_page_url!)}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>
                                                    )}
                                                    {journalAssessments.next_page_url && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(journalAssessments.next_page_url!)}
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
