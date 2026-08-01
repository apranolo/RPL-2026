/**
 * FilePreview Component
 *
 * A unified, reusable file uploader and previewer for both images and documents.
 * Supports client-side validation, drag-and-drop, and shows existing server-stored files.
 *
 * @variant 'image'    — shows a live image preview with hover-to-replace overlay
 * @variant 'document' — shows a document card with file info and an optional view link
 *
 * Usage (image):
 *   <FilePreview
 *     variant="image"
 *     name="cover_image"
 *     label="Gambar Cover"
 *     currentUrl={product.cover_image_url}
 *     onChange={(file) => setData('cover_image', file)}
 *     error={errors.cover_image}
 *   />
 *
 * Usage (document):
 *   <FilePreview
 *     variant="document"
 *     name="document"
 *     label="Dokumen Bukti"
 *     currentUrl={product.document_url}
 *     currentName="laporan-akhir.pdf"
 *     onChange={(file) => setData('document', file)}
 *     error={errors.document}
 *   />
 */

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, ExternalLink, File, FileText, ImageIcon, Trash2, UploadCloud, X } from 'lucide-react';
import { DragEvent, KeyboardEvent, MouseEvent, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'image' | 'document';

export interface FilePreviewProps {
    /** Whether to show an image preview or a document card */
    variant: Variant;

    /** HTML <input> name attribute */
    name: string;

    /** Label shown above the drop zone */
    label?: string;

    /** Optional helper text beneath the label */
    description?: string;

    /**
     * URL of the existing (server-stored) file.
     * Shown when no new file has been selected yet.
     */
    currentUrl?: string | null;

    /**
     * Original filename of the existing document.
     * Only used when variant='document'.
     */
    currentName?: string | null;

    /** Called with the File object when the user picks one, or null when cleared */
    onChange: (file: File | null) => void;

    /** Called when the user explicitly clicks "Hapus file saat ini" (server-side delete) */
    onDelete?: () => void;

    /** Server-side validation error message */
    error?: string;

    /** Whether the component is disabled (e.g. while form is submitting) */
    disabled?: boolean;

    /** Extra CSS classes on the root element */
    className?: string;
}

// ---------------------------------------------------------------------------
// Per-variant file constraints
// ---------------------------------------------------------------------------

const IMAGE_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const IMAGE_ACCEPT_EXT = '.jpg,.jpeg,.png';
const IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const DOC_ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const DOC_ACCEPT_EXT = '.pdf,.doc,.docx';
const DOC_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Derive a human-readable extension label from a MIME type */
function mimeToExt(mime: string): string {
    const map: Record<string, string> = {
        'application/pdf': 'PDF',
        'application/msword': 'DOC',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'image/jpeg': 'JPEG',
        'image/jpg': 'JPEG',
        'image/png': 'PNG',
    };
    return map[mime] ?? mime.split('/')[1]?.toUpperCase() ?? '?';
}

/** Icon that matches the document extension */
function DocIcon({ name, className }: { name?: string | null; className?: string }) {
    const ext = name?.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return <FileText className={className} />;
    return <File className={className} />;
}

// ---------------------------------------------------------------------------
// FilePreview
// ---------------------------------------------------------------------------

export function FilePreview({
    variant,
    name,
    label,
    description,
    currentUrl,
    currentName,
    onChange,
    onDelete,
    error,
    disabled = false,
    className,
}: FilePreviewProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const combinedError = clientError ?? error;
    const hasExisting = Boolean(currentUrl);

    // ---- Validation -----------------------------------------------------------

    const validate = (file: File): string | null => {
        if (variant === 'image') {
            if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) return 'Format harus JPEG atau PNG.';
            if (file.size > IMAGE_MAX_BYTES) return `Ukuran maks. 2 MB. File ini ${formatBytes(file.size)}.`;
        } else {
            if (!DOC_ACCEPTED_TYPES.includes(file.type)) return 'Format harus PDF, DOC, atau DOCX.';
            if (file.size > DOC_MAX_BYTES) return `Ukuran maks. 10 MB. File ini ${formatBytes(file.size)}.`;
        }
        return null;
    };

    // ---- Handlers -------------------------------------------------------------

    const handleFile = (file: File | null) => {
        setClientError(null);

        if (!file) {
            setLocalFile(null);
            setImagePreview(null);
            onChange(null);
            return;
        }

        const validationError = validate(file);
        if (validationError) {
            setClientError(validationError);
            setLocalFile(null);
            setImagePreview(null);
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        setLocalFile(file);
        onChange(file);

        if (variant === 'image') {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0] ?? null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFile(e.dataTransfer.files?.[0] ?? null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const clearLocalFile = (e: MouseEvent) => {
        e.stopPropagation();
        setLocalFile(null);
        setImagePreview(null);
        setClientError(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const triggerDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    };

    // ---- Derived state --------------------------------------------------------

    // What to show in the image preview area
    const displayImage = imagePreview ?? (variant === 'image' ? currentUrl : null);

    // What filename to show in the document area
    const displayDocName = localFile?.name ?? currentName;

    // Is there anything to display (new or existing)?
    const hasContent = variant === 'image' ? Boolean(displayImage) : Boolean(displayDocName || hasExisting);

    // ---- Shared drop-zone classes ---------------------------------------------

    const dropZoneBase = cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 select-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        disabled && 'cursor-not-allowed opacity-60',
    );

    const dropZoneColor = combinedError
        ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/20'
        : dragOver
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30 scale-[1.01]'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20';

    // =========================================================================
    // Render — IMAGE variant
    // =========================================================================

    if (variant === 'image') {
        return (
            <div className={cn('space-y-1.5', className)}>
                {/* Label */}
                {label && (
                    <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                    </div>
                )}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}

                {/* Drop zone */}
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={label ? `Upload ${label}` : 'Upload gambar'}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onKeyDown={handleKeyDown}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={cn(dropZoneBase, dropZoneColor, displayImage ? 'h-auto overflow-hidden p-0' : 'h-44 p-6')}
                >
                    {displayImage ? (
                        <>
                            {/* Preview image */}
                            <img src={displayImage} alt="Preview" className="block max-h-64 w-full object-contain" />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-black/50 opacity-0 transition-opacity duration-200 hover:opacity-100">
                                <UploadCloud className="h-8 w-8 text-white" />
                                <p className="text-sm font-medium text-white">Klik untuk ganti gambar</p>
                            </div>

                            {/* Clear new-file button */}
                            {localFile && (
                                <button
                                    type="button"
                                    onClick={clearLocalFile}
                                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                                    aria-label="Batalkan pilihan gambar"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}

                            {/* Delete existing (server) file */}
                            {!localFile && hasExisting && onDelete && (
                                <button
                                    type="button"
                                    onClick={triggerDelete}
                                    className="absolute top-2 right-2 rounded-full bg-red-600/80 p-1 text-white transition-colors hover:bg-red-700"
                                    aria-label="Hapus gambar saat ini"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div
                                className={cn(
                                    'rounded-full p-3 transition-colors',
                                    dragOver ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700',
                                )}
                            >
                                <UploadCloud className="h-7 w-7" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">{dragOver ? 'Lepaskan untuk upload' : 'Klik atau seret gambar ke sini'}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG · Maks 2 MB</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Newly selected file indicator */}
                {localFile && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate">{localFile.name}</span>
                        <span className="text-muted-foreground">({formatBytes(localFile.size)})</span>
                    </div>
                )}

                {/* Error */}
                {combinedError && (
                    <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {combinedError}
                    </p>
                )}

                {/* Helper text */}
                {!displayImage && !combinedError && <p className="text-xs text-muted-foreground">Format: JPG / PNG · Maks 2 MB</p>}

                {/* Hidden input */}
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={IMAGE_ACCEPT_EXT}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                />
            </div>
        );
    }

    // =========================================================================
    // Render — DOCUMENT variant
    // =========================================================================

    return (
        <div className={cn('space-y-1.5', className)}>
            {/* Label */}
            {label && (
                <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                </div>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}

            {/* Drop zone */}
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={label ? `Upload ${label}` : 'Upload dokumen'}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={handleKeyDown}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={cn(dropZoneBase, dropZoneColor, 'p-4')}
            >
                {hasContent ? (
                    /* ── File card ── */
                    <div className="flex w-full items-center gap-3">
                        {/* Icon */}
                        <div
                            className={cn(
                                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                                localFile
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
                            )}
                        >
                            <DocIcon name={displayDocName} className="h-5 w-5" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{displayDocName ?? 'Dokumen tersimpan'}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                {localFile && (
                                    <span className="text-xs text-muted-foreground">
                                        {mimeToExt(localFile.type)} · {formatBytes(localFile.size)}
                                    </span>
                                )}
                                {!localFile && currentUrl && (
                                    <a
                                        href={currentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Lihat dokumen
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {localFile && <span className="text-xs text-green-600 dark:text-green-400">Siap diupload</span>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-shrink-0 items-center gap-1">
                            {/* Replace hint */}
                            <UploadCloud className="h-4 w-4 text-gray-400" />

                            {/* Clear new file */}
                            {localFile && (
                                <button
                                    type="button"
                                    onClick={clearLocalFile}
                                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                                    aria-label="Batalkan pilihan dokumen"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            {/* Delete existing */}
                            {!localFile && hasExisting && onDelete && (
                                <button
                                    type="button"
                                    onClick={triggerDelete}
                                    className="rounded-full p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                                    aria-label="Hapus dokumen saat ini"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center gap-2 py-4 text-gray-500 dark:text-gray-400">
                        <div
                            className={cn(
                                'rounded-full p-3 transition-colors',
                                dragOver ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700',
                            )}
                        >
                            <UploadCloud className="h-7 w-7" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">{dragOver ? 'Lepaskan untuk upload' : 'Klik atau seret dokumen ke sini'}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">PDF, DOC, DOCX · Maks 10 MB</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {combinedError && (
                <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {combinedError}
                </p>
            )}

            {/* Helper text */}
            {!hasContent && !combinedError && <p className="text-xs text-muted-foreground">Format: PDF / DOC / DOCX · Maks 10 MB</p>}

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={DOC_ACCEPT_EXT}
                onChange={handleInputChange}
                disabled={disabled}
                className="hidden"
            />
        </div>
    );
}
