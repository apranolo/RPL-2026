import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssessmentJournalMetadata } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JournalMetadataFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (metadata: Omit<AssessmentJournalMetadata, 'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'>) => void;
    metadata?: AssessmentJournalMetadata | null;
    mode?: 'create' | 'edit';
    aggregateCounts?: {
        jumlah_editor?: number;
        jumlah_reviewer?: number;
        jumlah_author?: number;
        jumlah_institusi_editor?: number;
        jumlah_institusi_reviewer?: number;
        jumlah_institusi_author?: number;
    };
}

const currentYear = new Date().getFullYear();
const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export default function JournalMetadataFormDialog({
    open,
    onOpenChange,
    onSave,
    metadata,
    mode = 'create',
    aggregateCounts = {},
}: JournalMetadataFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        volume: '',
        number: '',
        year: currentYear,
        month: 1,
        url_issue: '',
        jumlah_negara_editor: 0,
        jumlah_institusi_editor: 0,
        jumlah_negara_reviewer: 0,
        jumlah_institusi_reviewer: 0,
        jumlah_negara_author: undefined as number | undefined,
        jumlah_institusi_author: undefined as number | undefined,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens or metadata changes
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && metadata) {
                setFormData({
                    volume: metadata.volume,
                    number: metadata.number,
                    year: metadata.year,
                    month: metadata.month,
                    url_issue: metadata.url_issue || '',
                    jumlah_negara_editor: metadata.jumlah_negara_editor,
                    jumlah_institusi_editor: metadata.jumlah_institusi_editor,
                    jumlah_negara_reviewer: metadata.jumlah_negara_reviewer,
                    jumlah_institusi_reviewer: metadata.jumlah_institusi_reviewer,
                    jumlah_negara_author: metadata.jumlah_negara_author ?? undefined,
                    jumlah_institusi_author: metadata.jumlah_institusi_author ?? undefined,
                });
            } else {
                setFormData({
                    volume: '',
                    number: '',
                    year: currentYear,
                    month: 1,
                    url_issue: '',
                    jumlah_negara_editor: 0,
                    jumlah_institusi_editor: 0,
                    jumlah_negara_reviewer: 0,
                    jumlah_institusi_reviewer: 0,
                    jumlah_negara_author: undefined,
                    jumlah_institusi_author: undefined,
                });
            }
            setErrors({});
        }
    }, [open, metadata, mode]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.volume.trim()) {
            newErrors.volume = 'Volume is required';
        }

        if (!formData.number.trim()) {
            newErrors.number = 'Number is required';
        }

        if (formData.year < 1900 || formData.year > currentYear) {
            newErrors.year = `Year must be between 1900 and ${currentYear}`;
        }

        // Cross-validation with aggregate counts (only validate on submit, not draft)
        if (aggregateCounts.jumlah_editor !== undefined && formData.jumlah_negara_editor > aggregateCounts.jumlah_editor) {
            newErrors.jumlah_negara_editor = `Cannot exceed total editors (${aggregateCounts.jumlah_editor})`;
        }

        if (aggregateCounts.jumlah_reviewer !== undefined && formData.jumlah_negara_reviewer > aggregateCounts.jumlah_reviewer) {
            newErrors.jumlah_negara_reviewer = `Cannot exceed total reviewers (${aggregateCounts.jumlah_reviewer})`;
        }

        if (aggregateCounts.jumlah_institusi_editor !== undefined && formData.jumlah_institusi_editor > aggregateCounts.jumlah_institusi_editor) {
            newErrors.jumlah_institusi_editor = `Cannot exceed total editor institutions (${aggregateCounts.jumlah_institusi_editor})`;
        }

        if (
            aggregateCounts.jumlah_institusi_reviewer !== undefined &&
            formData.jumlah_institusi_reviewer > aggregateCounts.jumlah_institusi_reviewer
        ) {
            newErrors.jumlah_institusi_reviewer = `Cannot exceed total reviewer institutions (${aggregateCounts.jumlah_institusi_reviewer})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Simulate async operation
        setTimeout(() => {
            onSave({
                ...formData,
                jumlah_negara_author: formData.jumlah_negara_author ?? null,
                jumlah_institusi_author: formData.jumlah_institusi_author ?? null,
            } as any);
            setIsSubmitting(false);
            onOpenChange(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Edit Data Terbitan' : 'Tambah Data Terbitan'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit'
                                ? 'Update informasi terbitan jurnal di bawah ini.'
                                : 'Masukkan informasi terbitan jurnal (volume, nomor, tahun, dll).'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Row 1: Volume, Number, Year, Month */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="volume">
                                    Volume <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="volume"
                                    placeholder="5"
                                    value={formData.volume}
                                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                    className={errors.volume ? 'border-destructive' : ''}
                                />
                                {errors.volume && <span className="text-xs text-destructive">{errors.volume}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="number">
                                    Nomor <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="number"
                                    placeholder="2"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className={errors.number ? 'border-destructive' : ''}
                                />
                                {errors.number && <span className="text-xs text-destructive">{errors.number}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">
                                    Tahun <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min="1900"
                                    max={currentYear}
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
                                    className={errors.year ? 'border-destructive' : ''}
                                />
                                {errors.year && <span className="text-xs text-destructive">{errors.year}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="month">
                                    Bulan <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.month.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                                >
                                    <SelectTrigger id="month">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* URL Issue */}
                        <div className="space-y-2">
                            <Label htmlFor="url_issue">
                                URL Terbitan <span className="text-xs text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="url_issue"
                                type="url"
                                placeholder="https://journal.example.com/vol5no2"
                                value={formData.url_issue}
                                onChange={(e) => setFormData({ ...formData, url_issue: e.target.value })}
                            />
                        </div>

                        {/* Editor Metrics */}
                        <div className="space-y-3 rounded-lg border p-4">
                            <h4 className="text-sm font-semibold">Metrik Editor</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_negara_editor">
                                        Jumlah Negara Editor <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="jumlah_negara_editor"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_negara_editor}
                                        onChange={(e) => setFormData({ ...formData, jumlah_negara_editor: parseInt(e.target.value) || 0 })}
                                        className={errors.jumlah_negara_editor ? 'border-destructive' : ''}
                                    />
                                    {errors.jumlah_negara_editor && <span className="text-xs text-destructive">{errors.jumlah_negara_editor}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_institusi_editor">
                                        Jumlah Institusi Editor <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="jumlah_institusi_editor"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_institusi_editor}
                                        onChange={(e) => setFormData({ ...formData, jumlah_institusi_editor: parseInt(e.target.value) || 0 })}
                                        className={errors.jumlah_institusi_editor ? 'border-destructive' : ''}
                                    />
                                    {errors.jumlah_institusi_editor && (
                                        <span className="text-xs text-destructive">{errors.jumlah_institusi_editor}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reviewer Metrics */}
                        <div className="space-y-3 rounded-lg border p-4">
                            <h4 className="text-sm font-semibold">Metrik Reviewer</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_negara_reviewer">
                                        Jumlah Negara Reviewer <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="jumlah_negara_reviewer"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_negara_reviewer}
                                        onChange={(e) => setFormData({ ...formData, jumlah_negara_reviewer: parseInt(e.target.value) || 0 })}
                                        className={errors.jumlah_negara_reviewer ? 'border-destructive' : ''}
                                    />
                                    {errors.jumlah_negara_reviewer && (
                                        <span className="text-xs text-destructive">{errors.jumlah_negara_reviewer}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_institusi_reviewer">
                                        Jumlah Institusi Reviewer <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="jumlah_institusi_reviewer"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_institusi_reviewer}
                                        onChange={(e) => setFormData({ ...formData, jumlah_institusi_reviewer: parseInt(e.target.value) || 0 })}
                                        className={errors.jumlah_institusi_reviewer ? 'border-destructive' : ''}
                                    />
                                    {errors.jumlah_institusi_reviewer && (
                                        <span className="text-xs text-destructive">{errors.jumlah_institusi_reviewer}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Author Metrics (Optional) */}
                        <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                            <h4 className="text-sm font-semibold">
                                Metrik Author <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_negara_author">Jumlah Negara Author</Label>
                                    <Input
                                        id="jumlah_negara_author"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_negara_author ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                jumlah_negara_author: e.target.value ? parseInt(e.target.value) : undefined,
                                            })
                                        }
                                        placeholder="Kosongkan jika tidak tersedia"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_institusi_author">Jumlah Institusi Author</Label>
                                    <Input
                                        id="jumlah_institusi_author"
                                        type="number"
                                        min="0"
                                        value={formData.jumlah_institusi_author ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                jumlah_institusi_author: e.target.value ? parseInt(e.target.value) : undefined,
                                            })
                                        }
                                        placeholder="Kosongkan jika tidak tersedia"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'edit' ? 'Update' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
