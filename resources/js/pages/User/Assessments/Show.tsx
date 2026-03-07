/**
 * Assessment Show/Detail Page
 *
 * @description Display assessment details with all responses and scoring
 * @features View only, download attachments, submit button for drafts
 * @route GET /user/assessments/{id}
 */
import JournalMetadataManager from '@/components/JournalMetadataManager';
import ReviewerFeedback from '@/components/ReviewerFeedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { AssessmentJournalMetadata } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Download, Edit, FileText, Send, TrendingUp, XCircle } from 'lucide-react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    url: string;
}

interface EvaluationIndicator {
    id: number;
    code: string;
    category: string;
    question: string;
    description: string | null;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
}

interface Attachment {
    id: number;
    original_filename: string;
    file_size: number;
    human_file_size: string;
    mime_type: string;
    download_url: string;
}

interface Response {
    id: number;
    evaluation_indicator: EvaluationIndicator;
    answer_boolean: boolean | null;
    answer_scale: number | null;
    answer_text: string | null;
    formatted_answer: string;
    score: number;
    notes: string | null;
    attachments: Attachment[];
}

interface Assessment {
    id: number;
    journal: Journal;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    notes: string | null;
    admin_notes: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
    kategori_diusulkan?: string | null;
    jumlah_editor?: number | null;
    jumlah_reviewer?: number | null;
    jumlah_author?: number | null;
    jumlah_institusi_editor?: number | null;
    jumlah_institusi_reviewer?: number | null;
    jumlah_institusi_author?: number | null;
    journalMetadata?: AssessmentJournalMetadata[];
}

interface Props {
    assessment: Assessment;
    responsesByCategory: Record<string, Response[]>;
}

export default function AssessmentShow({ assessment, responsesByCategory }: Props) {
    const handleSubmit = () => {
        if (confirm('Yakin ingin submit assessment? Assessment yang sudah disubmit tidak dapat diedit lagi.')) {
            router.post(route('user.assessments.submit', assessment.id));
        }
    };

    const handleDownload = (attachmentId: number) => {
        window.open(route('user.assessments.attachments.download', attachmentId), '_blank');
    };

    // Helper function to safely convert percentage to number
    const getPercentage = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0;
        return 0;
    };

    // Helper function to safely convert score to number
    const getScore = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0;
        return 0;
    };

    const getStatusBadge = () => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            gray: 'secondary',
            yellow: 'default',
            green: 'outline',
        };

        return (
            <Badge variant={variants[assessment.status_color] || 'default'} className="px-4 py-1 text-lg">
                {assessment.status_label}
            </Badge>
        );
    };

    const getGradeBadge = () => {
        const percentage = getPercentage(assessment.percentage);
        if (percentage >= 90) return <Badge className="bg-green-500 px-6 py-2 text-2xl text-white">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500 px-6 py-2 text-2xl text-white">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500 px-6 py-2 text-2xl text-white">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500 px-6 py-2 text-2xl text-white">D</Badge>;
        return (
            <Badge variant="destructive" className="px-6 py-2 text-2xl">
                E
            </Badge>
        );
    };

    const renderAnswer = (response: Response) => {
        const indicator = response.evaluation_indicator;

        if (indicator.answer_type === 'boolean') {
            return response.answer_boolean ? (
                <div className="flex items-center gap-2 font-semibold text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Ya
                </div>
            ) : (
                <div className="flex items-center gap-2 font-semibold text-red-600">
                    <XCircle className="h-5 w-5" />
                    Tidak
                </div>
            );
        }

        if (indicator.answer_type === 'scale') {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{response.answer_scale}/5</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className={`h-3 w-3 rounded-full ${num <= (response.answer_scale || 0) ? 'bg-primary' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </div>
            );
        }

        return <p className="text-sm whitespace-pre-wrap">{response.answer_text}</p>;
    };

    return (
        <AppLayout>
            <Head title="Detail Assessment" />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Link href={route('user.assessments.index')}>
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Detail Self-Assessment</h1>
                        <p className="mt-1 text-muted-foreground">Hasil penilaian mandiri untuk jurnal {assessment.journal.title}</p>
                    </div>
                    <div className="flex gap-2">
                        {assessment.status === 'draft' && (
                            <>
                                <Link href={route('user.assessments.edit', assessment.id)}>
                                    <Button variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button onClick={handleSubmit}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Assessment
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Reviewer Feedback */}
                <ReviewerFeedback assessment={assessment as any} />

                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{assessment.journal.title}</CardTitle>
                                <CardDescription className="mt-2">ISSN: {assessment.journal.issn}</CardDescription>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Tanggal Assessment:</span>
                                    <span className="font-semibold">
                                        {new Date(assessment.assessment_date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {assessment.period && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Periode:</span>
                                        <span className="font-semibold">{assessment.period}</span>
                                    </div>
                                )}
                            </div>

                            {assessment.status !== 'draft' && (
                                <div className="border-l pl-6">
                                    <div className="space-y-2 text-center">
                                        <div className="text-sm text-muted-foreground">Nilai Akhir</div>
                                        {getGradeBadge()}
                                        <div className="text-sm font-semibold">{getPercentage(assessment.percentage).toFixed(1)}%</div>
                                        <div className="text-xs text-muted-foreground">
                                            {getScore(assessment.total_score).toFixed(2)} / {getScore(assessment.max_score).toFixed(2)} poin
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {assessment.notes && (
                            <div className="mt-4 border-t pt-4">
                                <p className="mb-1 text-sm font-semibold">Catatan:</p>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assessment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Kategori yang Diusulkan */}
                {assessment.kategori_diusulkan && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kategori yang Diusulkan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline" className="px-4 py-2 text-lg">
                                {assessment.kategori_diusulkan}
                            </Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Aggregate Counts */}
                {(assessment.jumlah_editor !== null || assessment.jumlah_reviewer !== null || assessment.jumlah_author !== null) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Jumlah Total Kontributor</CardTitle>
                            <CardDescription>Total keseluruhan editor, reviewer, dan author di semua terbitan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {assessment.jumlah_editor !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Jumlah Editor</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_editor}</div>
                                    </div>
                                )}
                                {assessment.jumlah_reviewer !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Jumlah Reviewer</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_reviewer}</div>
                                    </div>
                                )}
                                {assessment.jumlah_author !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Jumlah Author</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_author}</div>
                                    </div>
                                )}
                                {assessment.jumlah_institusi_editor !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Institusi Editor</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_institusi_editor}</div>
                                    </div>
                                )}
                                {assessment.jumlah_institusi_reviewer !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Institusi Reviewer</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_institusi_reviewer}</div>
                                    </div>
                                )}
                                {assessment.jumlah_institusi_author !== null && (
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-1 text-sm text-muted-foreground">Institusi Author</div>
                                        <div className="text-2xl font-bold">{assessment.jumlah_institusi_author}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Journal Metadata */}
                {assessment.journalMetadata && assessment.journalMetadata.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Terbitan Jurnal</CardTitle>
                            <CardDescription>Informasi per terbitan (volume, nomor, tahun)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <JournalMetadataManager metadata={assessment.journalMetadata} onChange={() => {}} readOnly={true} />
                        </CardContent>
                    </Card>
                )}

                {/* Score Summary */}
                {assessment.status !== 'draft' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Skor per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {Object.keys(responsesByCategory).map((category) => {
                                    const responses = responsesByCategory[category];
                                    const totalScore = responses.reduce((sum, r) => sum + getScore(r.score), 0);
                                    const maxScore = responses.reduce((sum, r) => sum + getScore(r.evaluation_indicator.weight), 0);
                                    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

                                    return (
                                        <div key={category} className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-semibold">{category}</h3>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {totalScore.toFixed(2)} / {maxScore.toFixed(2)} poin
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Responses by Category */}
                {Object.keys(responsesByCategory).map((category) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {responsesByCategory[category].map((response, index) => (
                                    <div key={response.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge variant="outline">{response.evaluation_indicator.code}</Badge>
                                                    <Badge>{response.evaluation_indicator.weight} poin</Badge>
                                                    {assessment.status !== 'draft' && (
                                                        <Badge variant="secondary">Skor: {getScore(response.score).toFixed(2)}</Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold">
                                                    {index + 1}. {response.evaluation_indicator.question}
                                                </h4>
                                                {response.evaluation_indicator.description && (
                                                    <p className="mt-1 text-sm text-muted-foreground">{response.evaluation_indicator.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                                            <div>
                                                <span className="text-sm font-semibold">Jawaban:</span>
                                                <div className="mt-2">{renderAnswer(response)}</div>
                                            </div>

                                            {response.notes && (
                                                <div>
                                                    <span className="text-sm font-semibold">Catatan:</span>
                                                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{response.notes}</p>
                                                </div>
                                            )}

                                            {response.attachments.length > 0 && (
                                                <div>
                                                    <span className="text-sm font-semibold">File Bukti:</span>
                                                    <div className="mt-2 space-y-2">
                                                        {response.attachments.map((attachment) => (
                                                            <div
                                                                key={attachment.id}
                                                                className="flex items-center justify-between rounded-lg border bg-background p-3"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    <div>
                                                                        <div className="text-sm font-medium">{attachment.original_filename}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {attachment.human_file_size}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="sm" onClick={() => handleDownload(attachment.id)}>
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Admin Notes (if reviewed) */}
                {assessment.admin_notes && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>Catatan Admin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{assessment.admin_notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
