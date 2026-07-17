import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, CheckCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProgressTimeline from '@/components/ProgressTimeline';
import { toast } from 'sonner';
import { ReviewerAssignment, PembinaanReview } from '@/types';

interface Props {
    assignment: ReviewerAssignment;
    existingReview: PembinaanReview | null;
}

export default function EvaluationNote({ assignment, existingReview }: Props) {
    const registration = assignment.registration;
    const journal = registration?.journal;
    const pembinaan = registration?.pembinaan;

    // Form for evaluation notes
    const { data, setData, post, processing, errors } = useForm({
        score: existingReview?.score !== undefined && existingReview?.score !== null ? String(existingReview.score) : '',
        feedback: existingReview?.feedback || '',
        recommendation: existingReview?.recommendation || '',
    });

    const handleSubmitNote = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reviewer.evaluations.storeNote', assignment.id), {
            onSuccess: () => toast.success('Catatan evaluasi berhasil disimpan'),
            onError: () => toast.error('Gagal menyimpan catatan evaluasi. Silakan periksa kembali form Anda.'),
        });
    };

    const handleStatusChange = (value: string) => {
        router.post(route('reviewer.evaluations.update-status', assignment.id), {
            review_status: value
        }, {
            onSuccess: () => toast.success('Status Monev berhasil diperbarui'),
            onError: () => toast.error('Gagal memperbarui status Monev'),
        });
    };

    const getStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'review_selesai':
                return 'default';
            case 'sedang_direview':
                return 'secondary';
            case 'ditolak':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'menunggu_reviewer':
                return 'Menunggu Reviewer';
            case 'sedang_direview':
                return 'Sedang Direview';
            case 'review_selesai':
                return 'Review Selesai';
            case 'ditolak':
                return 'Ditolak / Perbaikan';
            default:
                return status || '-';
        }
    };

    return (
        <AppLayout>
            <Head title="Evaluasi Proposal & Catatan Reviewer" />
            
            <div className="container mx-auto p-6 space-y-6">
                {/* Navigation Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('reviewer.evaluations.index')}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Catatan Evaluasi Reviewer</h1>
                        <p className="text-sm text-muted-foreground">
                            Berikan penilaian, rekomendasi, dan kelola status progress evaluasi Monev untuk proposal jurnal ini.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details & Progress Timeline */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Info Jurnal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Informasi Proposal</CardTitle>
                                <CardDescription>Detail pendaftaran monev jurnal</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Nama Jurnal</Label>
                                    <p className="font-medium text-gray-900">{journal?.title || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">ISSN / E-ISSN</Label>
                                    <p className="font-medium text-gray-900">{journal?.issn || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Program Pembinaan</Label>
                                    <p className="font-medium text-gray-900">{pembinaan?.name || '-'}</p>
                                    <Badge className="capitalize mt-1" variant="outline">
                                        {pembinaan?.category || '-'}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Universitas</Label>
                                    <p className="font-medium text-gray-900">{journal?.university?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Bidang Ilmu</Label>
                                    <p className="font-medium text-gray-900">{journal?.scientific_field?.name || '-'}</p>
                                </div>
                                <div className="pt-2 border-t">
                                    <Label className="text-muted-foreground text-xs block mb-1">Status Evaluasi Monev</Label>
                                    <Badge variant={getStatusBadgeVariant(registration?.review_status)}>
                                        {getStatusLabel(registration?.review_status)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Monev Selector */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Update Status Progress</CardTitle>
                                <CardDescription>Sesuaikan status tahapan monev saat ini</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="review_status">Status Monev</Label>
                                    <Select
                                        value={registration?.review_status || 'menunggu_reviewer'}
                                        onValueChange={handleStatusChange}
                                    >
                                        <SelectTrigger id="review_status">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="menunggu_reviewer">Menunggu Reviewer</SelectItem>
                                            <SelectItem value="sedang_direview">Sedang Direview</SelectItem>
                                            <SelectItem value="review_selesai">Review Selesai</SelectItem>
                                            <SelectItem value="ditolak">Ditolak / Perbaikan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Timeline */}
                        {registration && (
                            <ProgressTimeline registration={registration} />
                        )}
                    </div>

                    {/* Right Column: Note Form */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Input Catatan Evaluasi</CardTitle>
                                        <CardDescription>Berikan masukan tertulis dan nilai evaluasi reviewer</CardDescription>
                                    </div>
                                    {existingReview && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                            Sudah Dinilai
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitNote} className="space-y-6">
                                    {/* Score Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="score">Nilai Evaluasi (0 - 100)</Label>
                                        <Input
                                            type="number"
                                            id="score"
                                            placeholder="Masukkan nilai (contoh: 85)"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.score}
                                            onChange={(e) => setData('score', e.target.value)}
                                            className={errors.score ? 'border-destructive' : ''}
                                        />
                                        {errors.score && (
                                            <p className="text-sm text-destructive font-medium">{errors.score}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Masukkan skor penilaian kuantitatif proposal pembinaan/monev.
                                        </p>
                                    </div>

                                    {/* Feedback Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="feedback">Catatan Evaluasi / Masukan Reviewer <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            id="feedback"
                                            rows={6}
                                            placeholder="Berikan ulasan dan catatan detail mengenai progres jurnal serta aspek yang perlu ditingkatkan..."
                                            value={data.feedback}
                                            onChange={(e) => setData('feedback', e.target.value)}
                                            className={errors.feedback ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.feedback && (
                                            <p className="text-sm text-destructive font-medium">{errors.feedback}</p>
                                        )}
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Maksimal 2000 karakter</span>
                                            <span>{data.feedback.length}/2000</span>
                                        </div>
                                    </div>

                                    {/* Recommendation Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="recommendation">Rekomendasi Reviewer</Label>
                                        <Textarea
                                            id="recommendation"
                                            rows={4}
                                            placeholder="Tuliskan rekomendasi langkah perbaikan konkret untuk pengelola jurnal..."
                                            value={data.recommendation}
                                            onChange={(e) => setData('recommendation', e.target.value)}
                                            className={errors.recommendation ? 'border-destructive' : ''}
                                        />
                                        {errors.recommendation && (
                                            <p className="text-sm text-destructive font-medium">{errors.recommendation}</p>
                                        )}
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Maksimal 1000 karakter</span>
                                            <span>{data.recommendation.length}/1000</span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4 border-t">
                                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Menyimpan...' : 'Simpan Catatan Evaluasi'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
