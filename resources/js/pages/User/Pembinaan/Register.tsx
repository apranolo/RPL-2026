/**
 * User Pembinaan Registration Form Component
 *
 * @description
 * Multi-step registration form for journal managers to register their journals
 * to pembinaan programs. Features journal selection and document upload with
 * drag-and-drop functionality, file type validation, and preview capabilities.
 *
 * @route GET /user/pembinaan/programs/{id}/register
 *
 * @features
 * - Journal selection from user's managed journals
 * - Multi-file drag-and-drop upload zone
 * - Document type categorization (ISSN Certificate, Cover, Accreditation)
 * - File validation (PDF/JPG/PNG, max 5MB per file)
 * - Uploaded file preview with remove action
 * - Form validation before submission
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Journal, type Pembinaan } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, FileText, Plus, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    program: Pembinaan;
    journals: Journal[];
    category: 'akreditasi' | 'indeksasi';
}

interface UploadedFile {
    id: string;
    file: File;
    documentType: string;
    preview: string;
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DOCUMENT_TYPES = [
    { value: 'issn_certificate', label: 'ISSN Certificate' },
    { value: 'cover', label: 'Journal Cover' },
    { value: 'accreditation_certificate', label: 'Accreditation Certificate' },
    { value: 'other', label: 'Other Document' },
];

export default function PembinaanRegister({ program, journals, category }: Props) {
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
            title: category.charAt(0).toUpperCase() + category.slice(1),
            href: route(`user.pembinaan.${category}`),
        },
        {
            title: program.name,
            href: route('user.pembinaan.programs.show', program.id),
        },
        {
            title: 'Register',
            href: route('user.pembinaan.programs.register-form', program.id),
        },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const supportingDocInputRef = useRef<HTMLInputElement>(null);
    const [selectedJournal, setSelectedJournal] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<{ journal?: string; files?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return 'File type not allowed. Please upload PDF, JPG, or PNG files.';
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 5MB limit. Current size: ${formatFileSize(file.size)}`;
        }
        return null;
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFiles: UploadedFile[] = [];
        const fileErrors: string[] = [];

        Array.from(files).forEach((file) => {
            const error = validateFile(file);
            if (error) {
                fileErrors.push(`${file.name}: ${error}`);
                return;
            }

            const id = `${Date.now()}-${Math.random()}`;
            const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';

            newFiles.push({
                id,
                file,
                documentType: '',
                preview,
            });
        });

        if (fileErrors.length > 0) {
            setErrors({ ...errors, files: fileErrors.join('\n') });
        } else {
            setErrors({ ...errors, files: undefined });
        }

        setUploadedFiles([...uploadedFiles, ...newFiles]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeFile = (id: string) => {
        const file = uploadedFiles.find((f) => f.id === id);
        if (file?.preview) {
            URL.revokeObjectURL(file.preview);
        }
        setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
    };

    const updateDocumentType = (id: string, documentType: string) => {
        setUploadedFiles(uploadedFiles.map((f) => (f.id === id ? { ...f, documentType } : f)));
    };

    const handleSupportingDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (PDF, DOC, DOCX)
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF, DOC, and DOCX files are allowed for supporting documents');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)}`);
            return;
        }

        setSupportingDocument(file);
    };

    const removeSupportingDocument = () => {
        setSupportingDocument(null);
        if (supportingDocInputRef.current) {
            supportingDocInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { journal?: string; files?: string } = {};

        if (!selectedJournal) {
            newErrors.journal = 'Please select a journal';
        }

        if (uploadedFiles.length === 0) {
            newErrors.files = 'Please upload at least one document';
        }

        const filesWithoutType = uploadedFiles.filter((f) => !f.documentType);
        if (filesWithoutType.length > 0) {
            newErrors.files = 'Please specify document type for all uploaded files';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare FormData (match controller validation: attachments[*].file and attachments[*].document_type)
        const formData = new FormData();
        formData.append('journal_id', selectedJournal);

        uploadedFiles.forEach((uploadedFile, index) => {
            formData.append(`attachments[${index}][file]`, uploadedFile.file);
            formData.append(`attachments[${index}][document_type]`, uploadedFile.documentType);
        });

        // Add optional supporting document
        if (supportingDocument) {
            formData.append('supporting_document', supportingDocument);
        }

        setIsSubmitting(true);

        router.post(route('user.pembinaan.programs.register', program.id), formData, {
            onSuccess: () => {
                // Clean up object URLs
                uploadedFiles.forEach((f) => {
                    if (f.preview) URL.revokeObjectURL(f.preview);
                });
            },
            onError: (errors) => {
                setErrors(errors as any);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Register - ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <Button variant="ghost" size="sm" asChild className="mb-2">
                                    <a href={route('user.pembinaan.programs.show', program.id)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Program
                                    </a>
                                </Button>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">Register to Program</h1>
                                <p className="mt-1 text-muted-foreground">{program.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Registration Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Journal Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Select Journal
                                        </CardTitle>
                                        <CardDescription>Choose which journal you want to register</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="journal">Journal *</Label>
                                            <Select value={selectedJournal} onValueChange={setSelectedJournal}>
                                                <SelectTrigger id="journal" className={errors.journal ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select a journal" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {journals.map((journal) => (
                                                        <SelectItem key={journal.id} value={journal.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{journal.title}</span>
                                                                <span className="text-xs text-muted-foreground">ISSN: {journal.issn || 'N/A'}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.journal && <p className="text-sm text-destructive">{errors.journal}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Supporting Document Upload (Optional) */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Supporting Document (Optional)
                                        </CardTitle>
                                        <CardDescription>
                                            Upload a supporting document such as a proposal or additional materials (PDF, DOC, DOCX - max 5MB)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {!supportingDocument ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="supporting_document">Supporting Document</Label>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => supportingDocInputRef.current?.click()}
                                                        className="w-full"
                                                    >
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Choose File
                                                    </Button>
                                                    <Input
                                                        ref={supportingDocInputRef}
                                                        id="supporting_document"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleSupportingDocumentSelect}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX (Maximum size: 5MB)</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{supportingDocument.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatFileSize(supportingDocument.size)}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeSupportingDocument}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* File Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Upload className="h-5 w-5" />
                                            Upload Documents
                                        </CardTitle>
                                        <CardDescription>Upload supporting documents (PDF, JPG, PNG - max 5MB each)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Dropzone */}
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
                                            }`}
                                        >
                                            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                            <p className="mb-2 font-medium">Click to upload or drag and drop files here</p>
                                            <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 5MB each</p>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileSelect(e.target.files)}
                                                className="hidden"
                                            />
                                        </div>

                                        {errors.files && (
                                            <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                                                <p className="text-sm whitespace-pre-line text-destructive">{errors.files}</p>
                                            </div>
                                        )}

                                        {/* Uploaded Files */}
                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-3">
                                                <Separator />
                                                <h4 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h4>
                                                <div className="space-y-3">
                                                    {uploadedFiles.map((uploadedFile) => (
                                                        <div key={uploadedFile.id} className="flex items-start gap-3 rounded-lg border p-3">
                                                            {uploadedFile.preview ? (
                                                                <img
                                                                    src={uploadedFile.preview}
                                                                    alt="Preview"
                                                                    className="h-16 w-16 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                                                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                                                </div>
                                                            )}

                                                            <div className="flex-1 space-y-2">
                                                                <div>
                                                                    <p className="font-medium">{uploadedFile.file.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(uploadedFile.file.size)}
                                                                    </p>
                                                                </div>

                                                                <Select
                                                                    value={uploadedFile.documentType}
                                                                    onValueChange={(value) => updateDocumentType(uploadedFile.id, value)}
                                                                >
                                                                    <SelectTrigger className="h-8">
                                                                        <SelectValue placeholder="Select document type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {DOCUMENT_TYPES.map((type) => (
                                                                            <SelectItem key={type.value} value={type.value}>
                                                                                {type.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile(uploadedFile.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Submit */}
                                <div className="flex gap-3">
                                    <Button type="submit" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Submit Registration
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" size="lg" asChild>
                                        <a href={route('user.pembinaan.programs.show', program.id)}>Cancel</a>
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar - Program Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Program Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Program Name</p>
                                        <p className="text-sm text-muted-foreground">{program.name}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-1 text-sm font-medium">Category</p>
                                        <Badge variant="outline" className="capitalize">
                                            {program.category}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Calendar className="h-4 w-4" />
                                            Registration Period
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(program.registration_start)}
                                            <br />
                                            to
                                            <br />
                                            {formatDate(program.registration_end)}
                                        </p>
                                    </div>

                                    {program.quota && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="mb-1 text-sm font-medium">Quota</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {program.approved_registrations_count || 0} / {program.quota} registered
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Required Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                            ISSN Certificate
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                            Journal Cover
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                            Accreditation Certificate (if any)
                                        </li>
                                        <li className="flex gap-2">
                                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            Other supporting documents
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
