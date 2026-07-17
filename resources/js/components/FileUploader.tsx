import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProposalDocument } from '@/types';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { AlertCircle, CheckCircle2, FileText, RefreshCw, UploadCloud, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

interface FileUploaderProps {
    uploadUrl: string; // e.g. /user/proposal/1/documents
    existingDocuments?: ProposalDocument[];
    onSuccess?: (doc: ProposalDocument) => void;
    accept?: string; // HTML input accept attribute, e.g. ".pdf,.doc,.docx,.xls,.xlsx,.zip"
    maxSizeMb?: number; // max file size in MB
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    errorMsg: string | null;
    cancelTokenSource?: CancelTokenSource;
    documentType: string;
    description: string;
}

const DOCUMENT_TYPES = [
    { value: 'Proposal', label: 'Proposal Penelitian' },
    { value: 'RAB', label: 'Rencana Anggaran Biaya (RAB)' },
    { value: 'CV', label: 'Curriculum Vitae (CV) Tim' },
    { value: 'Surat Pernyataan', label: 'Surat Pernyataan Mitra/Rektor' },
    { value: 'Lainnya', label: 'Dokumen Pendukung Lainnya' },
];

export function FileUploader({
    uploadUrl,
    existingDocuments = [],
    onSuccess,
    accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png',
    maxSizeMb = 10,
}: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [documents, setDocuments] = useState<ProposalDocument[]>(existingDocuments);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    // Sync documents if existingDocuments prop changes
    React.useEffect(() => {
        setDocuments(existingDocuments);
    }, [existingDocuments]);

    // Metadata states for the file to be uploaded next
    const [selectedDocType, setSelectedDocType] = useState('Proposal');
    const [description, setDescription] = useState('');

    const MAX_SIZE_BYTES = maxSizeMb * 1024 * 1024;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelection(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesSelection(Array.from(e.target.files));
        }
    };

    const handleFilesSelection = (files: File[]) => {
        const validFiles: UploadingFile[] = [];

        files.forEach((file) => {
            // Client-side validation: Size check
            if (file.size > MAX_SIZE_BYTES) {
                toast.error(`Ukuran file "${file.name}" melebihi batas maksimal ${maxSizeMb} MB.`);
                return;
            }

            // Client-side validation: Extension check
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            const acceptedList = accept.split(',').map((ext) => ext.trim().toLowerCase());
            if (accept !== '*' && !acceptedList.includes(extension)) {
                toast.error(`Format file "${file.name}" tidak diizinkan. Gunakan format: ${accept}`);
                return;
            }

            const localId = Math.random().toString(36).substring(2, 9);
            validFiles.push({
                id: localId,
                file,
                progress: 0,
                status: 'idle',
                errorMsg: null,
                documentType: selectedDocType,
                description: description,
            });
        });

        if (validFiles.length > 0) {
            setUploadingFiles((prev) => [...prev, ...validFiles]);
            // Clear description after scheduling upload
            setDescription('');
            // Trigger uploads
            validFiles.forEach((f) => startUpload(f));
        }
    };

    const startUpload = async (fileObj: UploadingFile) => {
        const cancelTokenSource = axios.CancelToken.source();

        setUploadingFiles((prev) => prev.map((item) => (item.id === fileObj.id ? { ...item, status: 'uploading', cancelTokenSource } : item)));

        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('document_type', fileObj.documentType);
        if (fileObj.description) {
            formData.append('description', fileObj.description);
        }

        try {
            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                cancelToken: cancelTokenSource.token,
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total ?? fileObj.file.size;
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                    setUploadingFiles((prev) => prev.map((item) => (item.id === fileObj.id ? { ...item, progress: percentCompleted } : item)));
                },
            });

            const newDoc: ProposalDocument = response.data.document;

            // Update lists
            setDocuments((prev) => [...prev, newDoc]);
            setUploadingFiles((prev) => prev.filter((item) => item.id !== fileObj.id));

            toast.success(`File "${fileObj.file.name}" berhasil diunggah.`);
            if (onSuccess) onSuccess(newDoc);
        } catch (error) {
            if (axios.isCancel(error)) {
                toast.info(`Unggahan "${fileObj.file.name}" dibatalkan.`);
                setUploadingFiles((prev) => prev.filter((item) => item.id !== fileObj.id));
                return;
            }

            let errorMsg = 'Gagal mengunggah file. Silakan coba lagi.';
            const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

            if (err.response?.data?.errors) {
                const firstKey = Object.keys(err.response.data.errors)[0];
                errorMsg = err.response.data.errors[firstKey][0];
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }

            setUploadingFiles((prev) => prev.map((item) => (item.id === fileObj.id ? { ...item, status: 'error', errorMsg } : item)));
            toast.error(`File "${fileObj.file.name}" gagal diunggah: ${errorMsg}`);
        }
    };

    const cancelUpload = (id: string) => {
        const fileObj = uploadingFiles.find((f) => f.id === id);
        if (fileObj?.cancelTokenSource) {
            fileObj.cancelTokenSource.cancel();
        } else {
            setUploadingFiles((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const retryUpload = (id: string) => {
        const fileObj = uploadingFiles.find((f) => f.id === id);
        if (fileObj) {
            setUploadingFiles((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'idle', progress: 0, errorMsg: null } : item)));
            startUpload({ ...fileObj, status: 'idle', progress: 0, errorMsg: null });
        }
    };

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Dokumen Pendukung Proposal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unggah lampiran dokumen proposal Anda seperti RAB, CV, surat pernyataan, dll.
                </p>
            </div>

            {/* Input metadata panel */}
            <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-900">
                <div className="space-y-1.5">
                    <label htmlFor="docType" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Tipe Dokumen
                    </label>
                    <select
                        id="docType"
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                    >
                        {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="description" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Deskripsi Dokumen (Opsional)
                    </label>
                    <input
                        id="description"
                        type="text"
                        placeholder="Misal: File RAB final format PDF atau Excel"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Drag & Drop Area */}
            <div
                role="button"
                tabIndex={0}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
                className={[
                    'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 outline-hidden transition-colors',
                    dragActive
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-300 bg-gray-50/50 hover:border-primary hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-primary dark:hover:bg-gray-900/50',
                ].join(' ')}
            >
                <input ref={fileInputRef} type="file" multiple accept={accept} onChange={handleFileInput} className="hidden" />

                <UploadCloud className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tarik &amp; letakkan file di sini atau klik untuk memilih</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maksimal {maxSizeMb} MB per file · Format: PDF, Word, Excel, PPT, Zip, Gambar
                </p>
            </div>

            {/* Uploading Files list */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                        Sedang Diunggah ({uploadingFiles.length})
                    </h4>
                    <div className="space-y-3">
                        {uploadingFiles.map((fileObj) => (
                            <div
                                key={fileObj.id}
                                className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50"
                            >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">{fileObj.file.name}</p>
                                        {fileObj.status === 'uploading' && (
                                            <span className="text-xs font-medium text-gray-500">{fileObj.progress}%</span>
                                        )}
                                        {fileObj.status === 'error' && <Badge variant="destructive">Gagal</Badge>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Badge variant="secondary">{fileObj.documentType}</Badge>
                                        {fileObj.description && <span className="max-w-[200px] truncate">· {fileObj.description}</span>}
                                    </div>

                                    {fileObj.status === 'uploading' && <Progress value={fileObj.progress} className="h-1.5" />}

                                    {fileObj.status === 'error' && (
                                        <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {fileObj.errorMsg}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {fileObj.status === 'error' && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                retryUpload(fileObj.id);
                                            }}
                                            title="Coba lagi"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelUpload(fileObj.id);
                                        }}
                                        title="Batal"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Uploaded Documents List */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    Dokumen Terunggah ({documents.length})
                </h4>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-gray-800">
                        <FileText className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-700" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada dokumen yang diunggah.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-gray-50/50 dark:bg-gray-950 dark:hover:bg-gray-900/30"
                            >
                                <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">{doc.file_name}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <Badge variant="secondary" className="px-1.5 py-0">
                                            {doc.document_type || 'Dokumen'}
                                        </Badge>
                                        {doc.description && <span className="max-w-[250px] truncate text-gray-400">· {doc.description}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
