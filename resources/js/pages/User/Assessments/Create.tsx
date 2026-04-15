/**
 * Assessment Create/Edit Form Page
 *
 * @description Form untuk membuat atau mengedit self-assessment jurnal
 * @features Multi-step form, file upload, auto-save draft, score calculation
 * @route GET /user/assessments/create | GET /user/assessments/{id}/edit
 */
import JournalMetadataManager from '@/components/JournalMetadataManager';
import ReviewerFeedback from '@/components/ReviewerFeedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { AssessmentJournalMetadata } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, FileText, Save, Send, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface EvaluationIndicator {
    id: number;
    category: string;
    sub_category: string | null;
    code: string;
    question: string;
    description: string | null;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
    requires_attachment: boolean;
    sort_order: number;
}

interface AssessmentResponse {
    evaluation_indicator_id: number;
    answer_boolean?: boolean;
    answer_scale?: number;
    answer_text?: string;
    notes?: string;
    attachments?: File[];
    [key: string]: number | boolean | string | File[] | undefined;
}

interface Assessment {
    id: number;
    journal: Journal;
    assessment_date: string;
    period: string | null;
    notes: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    kategori_diusulkan?: string;
    jumlah_editor?: number;
    jumlah_reviewer?: number;
    jumlah_author?: number;
    jumlah_institusi_editor?: number;
    jumlah_institusi_reviewer?: number;
    jumlah_institusi_author?: number;
    journalMetadata?: AssessmentJournalMetadata[];
    responses: Array<{
        evaluation_indicator_id: number;
        answer_boolean?: boolean;
        answer_scale?: number;
        answer_text?: string;
        notes?: string;
        attachments?: Array<{
            id: number;
            original_filename: string;
            human_file_size: string;
        }>;
    }>;
}

interface Props {
    journals?: Journal[];
    indicators: Record<string, EvaluationIndicator[]>;
    assessment?: Assessment;
}

export default function AssessmentForm({ journals, indicators, assessment }: Props) {
    const isEdit = !!assessment;

    // File upload constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    // Pre-fill responses from existing assessment data
    const initialResponses: AssessmentResponse[] =
        isEdit && assessment?.responses
            ? assessment.responses.map((response) => ({
                  evaluation_indicator_id: response.evaluation_indicator_id,
                  answer_boolean: response.answer_boolean,
                  answer_scale: response.answer_scale,
                  answer_text: response.answer_text,
                  notes: response.notes,
              }))
            : [];

    const { data, setData, post, put, processing, errors } = useForm<{
        journal_id: string;
        assessment_date: string;
        period: string;
        notes: string;
        kategori_diusulkan: string;
        jumlah_editor: number;
        jumlah_reviewer: number;
        jumlah_author: number;
        jumlah_institusi_editor: number;
        jumlah_institusi_reviewer: number;
        jumlah_institusi_author: number;
        journal_metadata: any;
        responses: AssessmentResponse[];
    }>({
        journal_id: assessment?.journal.id.toString() || '',
        assessment_date: assessment?.assessment_date || new Date().toISOString().split('T')[0],
        period: assessment?.period || '',
        notes: assessment?.notes || '',
        kategori_diusulkan: assessment?.kategori_diusulkan || '',
        jumlah_editor: assessment?.jumlah_editor || 0,
        jumlah_reviewer: assessment?.jumlah_reviewer || 0,
        jumlah_author: assessment?.jumlah_author || 0,
        jumlah_institusi_editor: assessment?.jumlah_institusi_editor || 0,
        jumlah_institusi_reviewer: assessment?.jumlah_institusi_reviewer || 0,
        jumlah_institusi_author: assessment?.jumlah_institusi_author || 0,
        journal_metadata: assessment?.journalMetadata || [],
        responses: initialResponses,
    });

    const [currentCategory, setCurrentCategory] = useState(Object.keys(indicators)[0]);
    const categories = Object.keys(indicators);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEdit ? route('user.assessments.update', assessment!.id) : route('user.assessments.store');

        const method = isEdit ? put : post;

        method(url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const updateResponse = (indicatorId: number, field: keyof AssessmentResponse, value: boolean | number | string | File[]) => {
        const responses = [...(data.responses as unknown as AssessmentResponse[])];
        const index = responses.findIndex((r) => r.evaluation_indicator_id === indicatorId);

        if (index >= 0) {
            responses[index] = { ...responses[index], [field]: value };
        } else {
            responses.push({
                evaluation_indicator_id: indicatorId,
                [field]: value,
            } as AssessmentResponse);
        }

        setData('responses', responses as AssessmentResponse[]);
    };

    const getResponse = (indicatorId: number): AssessmentResponse | undefined => {
        return (data.responses as unknown as AssessmentResponse[]).find((r) => r.evaluation_indicator_id === indicatorId);
    };

    const renderAnswerInput = (indicator: EvaluationIndicator) => {
        const response = getResponse(indicator.id);

        switch (indicator.answer_type) {
            case 'boolean':
                return (
                    <RadioGroup
                        value={response?.answer_boolean?.toString() || ''}
                        onValueChange={(value) => updateResponse(indicator.id, 'answer_boolean', value === 'true')}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`${indicator.id}-yes`} />
                                <Label htmlFor={`${indicator.id}-yes`} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Ya
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`${indicator.id}-no`} />
                                <Label htmlFor={`${indicator.id}-no`} className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Tidak
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                );

            case 'scale':
                return (
                    <RadioGroup
                        value={response?.answer_scale?.toString() || ''}
                        onValueChange={(value) => updateResponse(indicator.id, 'answer_scale', parseInt(value))}
                    >
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="flex items-center space-x-2">
                                    <RadioGroupItem value={num.toString()} id={`${indicator.id}-${num}`} />
                                    <Label htmlFor={`${indicator.id}-${num}`}>{num}</Label>
                                </div>
                            ))}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">1 = Sangat Kurang, 5 = Sangat Baik</p>
                    </RadioGroup>
                );

            case 'text':
                return (
                    <Textarea
                        value={response?.answer_text || ''}
                        onChange={(e) => updateResponse(indicator.id, 'answer_text', e.target.value)}
                        placeholder="Masukkan jawaban Anda..."
                        rows={4}
                    />
                );

            default:
                return null;
        }
    };

    const renderFileUpload = (indicator: EvaluationIndicator) => {
        if (!indicator.requires_attachment) return null;

        // Get existing attachments for this indicator in edit mode
        const existingAttachments =
            isEdit && assessment?.responses ? assessment.responses.find((r) => r.evaluation_indicator_id === indicator.id)?.attachments || [] : [];

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const validFiles: File[] = [];
            const errors: string[] = [];

            files.forEach((file) => {
                // Check file size
                if (file.size > MAX_FILE_SIZE) {
                    errors.push(`${file.name}: Ukuran file melebihi 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                    return;
                }

                // Check file type
                if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                    errors.push(`${file.name}: Format file tidak didukung. Gunakan PDF, JPG, atau PNG`);
                    return;
                }

                validFiles.push(file);
            });

            // Show error toast if there are invalid files
            if (errors.length > 0) {
                toast.error('File tidak valid', {
                    description: errors.join('\n'),
                });
            }

            // Update form with valid files only
            if (validFiles.length > 0) {
                updateResponse(indicator.id, 'attachments', validFiles);
                toast.success('File berhasil ditambahkan', {
                    description: `${validFiles.length} file siap diupload`,
                });
            }

            // Reset input to allow re-selecting the same file
            e.target.value = '';
        };

        return (
            <div className="mt-4">
                <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Bukti {indicator.requires_attachment && <span className="text-red-500">*</span>}
                </Label>

                {/* Show existing attachments in edit mode */}
                {isEdit && existingAttachments.length > 0 && (
                    <div className="mb-2 space-y-1">
                        {existingAttachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>{attachment.original_filename}</span>
                                <span className="text-xs">({attachment.human_file_size})</span>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground">Upload file baru untuk mengganti</p>
                    </div>
                )}

                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="mt-2" multiple />
                <p className="mt-1 text-xs text-muted-foreground">Format: PDF, JPG, PNG (Max 5MB per file)</p>
            </div>
        );
    };

    const calculateProgress = () => {
        const totalIndicators = Object.values(indicators).flat().length;
        if (totalIndicators === 0) return 0;
        const answeredIndicators = (data.responses as unknown as AssessmentResponse[]).length;
        return Math.round((answeredIndicators / totalIndicators) * 100);
    };

    return (
        <AppLayout>
            <Head title={isEdit ? 'Edit Assessment' : 'Buat Assessment Baru'} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">{isEdit ? 'Edit Assessment' : 'Buat Assessment Baru'}</h1>
                    <p className="mt-1 text-muted-foreground">Lengkapi formulir self-assessment untuk jurnal Anda</p>
                </div>

                {/* Reviewer Feedback - Show if editing after revision request */}
                {isEdit && assessment && <ReviewerFeedback assessment={assessment as any} />}

                {/* Progress Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress Pengisian</span>
                                <span className="font-semibold">{calculateProgress()}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${calculateProgress()}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isEdit ? (
                            <div className="space-y-2">
                                <Label htmlFor="journal_id">Jurnal *</Label>
                                <Select value={data.journal_id as string} onValueChange={(value) => setData('journal_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jurnal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {journals?.map((journal) => (
                                            <SelectItem key={journal.id} value={journal.id.toString()}>
                                                {journal.title} ({journal.issn})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.journal_id && <p className="text-sm text-red-500">{errors.journal_id}</p>}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Jurnal</Label>
                                <div className="rounded-lg bg-muted p-3">
                                    <div className="font-semibold">{assessment?.journal.title}</div>
                                    <div className="text-sm text-muted-foreground">ISSN: {assessment?.journal.issn}</div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="assessment_date">Tanggal Assessment *</Label>
                                <Input
                                    id="assessment_date"
                                    type="date"
                                    value={data.assessment_date as string}
                                    onChange={(e) => setData('assessment_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Periode</Label>
                                <Input
                                    id="period"
                                    value={data.period as string}
                                    onChange={(e) => setData('period', e.target.value)}
                                    placeholder="e.g., 2025-Q1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={data.notes as string}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Catatan tambahan untuk assessment ini..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Kategori yang Diusulkan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kategori yang Diusulkan</CardTitle>
                        <CardDescription>Pilih kategori yang ingin diusulkan untuk jurnal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="kategori_diusulkan">Kategori</Label>
                            <Select value={data.kategori_diusulkan as string} onValueChange={(value) => setData('kategori_diusulkan', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sinta 1">Sinta 1</SelectItem>
                                    <SelectItem value="Sinta 2">Sinta 2</SelectItem>
                                    <SelectItem value="Sinta 3">Sinta 3</SelectItem>
                                    <SelectItem value="Sinta 4">Sinta 4</SelectItem>
                                    <SelectItem value="Sinta 5">Sinta 5</SelectItem>
                                    <SelectItem value="Sinta 6">Sinta 6</SelectItem>
                                    <SelectItem value="Scopus">Scopus</SelectItem>
                                    <SelectItem value="Web of Science">Web of Science</SelectItem>
                                    <SelectItem value="DOAJ">DOAJ</SelectItem>
                                    <SelectItem value="Other International">Other International</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.kategori_diusulkan && <p className="text-sm text-red-500">{errors.kategori_diusulkan}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Aggregate Counts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Jumlah Total Kontributor</CardTitle>
                        <CardDescription>Total keseluruhan editor, reviewer, dan author di semua terbitan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_editor">Jumlah Editor</Label>
                                <Input
                                    id="jumlah_editor"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_editor as number) || ''}
                                    onChange={(e) => setData('jumlah_editor', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_editor && <p className="text-sm text-red-500">{errors.jumlah_editor}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_reviewer">Jumlah Reviewer</Label>
                                <Input
                                    id="jumlah_reviewer"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_reviewer as number) || ''}
                                    onChange={(e) => setData('jumlah_reviewer', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_reviewer && <p className="text-sm text-red-500">{errors.jumlah_reviewer}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_author">Jumlah Author</Label>
                                <Input
                                    id="jumlah_author"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_author as number) || ''}
                                    onChange={(e) => setData('jumlah_author', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_author && <p className="text-sm text-red-500">{errors.jumlah_author}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_institusi_editor">Institusi Editor</Label>
                                <Input
                                    id="jumlah_institusi_editor"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_institusi_editor as number) || ''}
                                    onChange={(e) => setData('jumlah_institusi_editor', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_institusi_editor && <p className="text-sm text-red-500">{errors.jumlah_institusi_editor}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_institusi_reviewer">Institusi Reviewer</Label>
                                <Input
                                    id="jumlah_institusi_reviewer"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_institusi_reviewer as number) || ''}
                                    onChange={(e) => setData('jumlah_institusi_reviewer', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_institusi_reviewer && <p className="text-sm text-red-500">{errors.jumlah_institusi_reviewer}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jumlah_institusi_author">Institusi Author</Label>
                                <Input
                                    id="jumlah_institusi_author"
                                    type="number"
                                    min="0"
                                    value={(data.jumlah_institusi_author as number) || ''}
                                    onChange={(e) => setData('jumlah_institusi_author', parseInt(e.target.value) || 0)}
                                />
                                {errors.jumlah_institusi_author && <p className="text-sm text-red-500">{errors.jumlah_institusi_author}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Journal Metadata Manager */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Terbitan Jurnal</CardTitle>
                        <CardDescription>Kelola informasi per terbitan (volume, nomor, tahun)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JournalMetadataManager
                            metadata={data.journal_metadata}
                            onChange={(metadata) => setData('journal_metadata', metadata)}
                            readOnly={assessment?.status !== 'draft' && isEdit}
                            aggregateCounts={{
                                jumlah_editor: data.jumlah_editor as number,
                                jumlah_reviewer: data.jumlah_reviewer as number,
                                jumlah_author: data.jumlah_author as number,
                                jumlah_institusi_editor: data.jumlah_institusi_editor as number,
                                jumlah_institusi_reviewer: data.jumlah_institusi_reviewer as number,
                                jumlah_institusi_author: data.jumlah_institusi_author as number,
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={currentCategory === category ? 'default' : 'outline'}
                            onClick={() => setCurrentCategory(category)}
                            className="whitespace-nowrap"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {indicators[currentCategory]?.map((indicator, index) => (
                        <Card key={indicator.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge variant="outline">{indicator.code}</Badge>
                                            <Badge>{indicator.weight} poin</Badge>
                                        </div>
                                        <CardTitle className="text-lg">
                                            {index + 1}. {indicator.question}
                                        </CardTitle>
                                        {indicator.description && <CardDescription className="mt-2">{indicator.description}</CardDescription>}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {renderAnswerInput(indicator)}
                                {renderFileUpload(indicator)}

                                <div className="space-y-2">
                                    <Label>Catatan Tambahan (Optional)</Label>
                                    <Textarea
                                        value={getResponse(indicator.id)?.notes || ''}
                                        onChange={(e) => updateResponse(indicator.id, 'notes', e.target.value)}
                                        placeholder="Penjelasan atau catatan tambahan..."
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 flex justify-between gap-4 border-t bg-background py-4">
                    <Button type="button" variant="outline" onClick={() => router.visit(route('user.assessments.index'))}>
                        Batal
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Draft
                        </Button>
                        {isEdit && assessment?.status === 'draft' && (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (confirm('Yakin ingin submit assessment? Assessment yang sudah disubmit tidak dapat diedit lagi.')) {
                                        router.post(route('user.assessments.submit', assessment!.id));
                                    }
                                }}
                                disabled={processing || calculateProgress() < 100}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Assessment
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
