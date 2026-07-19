/**
 * Editorial Plagiarism Check Page
 *
 * @description Upload laporan hasil cek plagiasi (Turnitin/iThenticate) dan input persentase kemiripan untuk sebuah submission.
 * @route POST /plagiarism-check
 * @features Upload PDF report, input similarity score, preview similarity badge
 */
import SimilarityBadge from '@/components/SimilarityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FileCheck2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cek Plagiasi', href: '/plagiarism-check' },
];

export default function Plagiarism() {
    const { data, setData, post, processing, errors } = useForm({
        submission_id: '',
        similarity_score: '',
        report_file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/editorial/plagiarism-check');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Laporan Plagiasi" />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Upload Laporan Plagiasi</h1>
                    <p className="text-muted-foreground">Unggah laporan hasil cek plagiasi (Turnitin/iThenticate) untuk sebuah submission.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck2 className="h-5 w-5" />
                            Detail Cek Plagiasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="submission_id">Submission ID</Label>
                                <Input
                                    id="submission_id"
                                    type="number"
                                    value={data.submission_id}
                                    onChange={(e) => setData('submission_id', e.target.value)}
                                />
                                {errors.submission_id && <p className="text-sm text-destructive">{errors.submission_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="similarity_score">Similarity Score (%)</Label>
                                <Input
                                    id="similarity_score"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.similarity_score}
                                    onChange={(e) => setData('similarity_score', e.target.value)}
                                />
                                {errors.similarity_score && <p className="text-sm text-destructive">{errors.similarity_score}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="report_file">Upload Laporan PDF</Label>
                                <Input
                                    id="report_file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setData('report_file', e.target.files?.[0] || null)}
                                />
                                {errors.report_file && <p className="text-sm text-destructive">{errors.report_file}</p>}
                            </div>

                            <Button type="submit" disabled={processing}>
                                Upload
                            </Button>
                        </form>

                        {data.similarity_score && (
                            <div className="mt-6 border-t pt-4">
                                <p className="mb-2 text-sm font-medium text-muted-foreground">Preview Similarity:</p>
                                <SimilarityBadge percentage={Number(data.similarity_score)} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
