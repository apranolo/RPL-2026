/**
 * JournalCoverUpload component
 *
 * Reusable cover image uploader for journal forms and the dedicated
 * "Change Cover" dialog on the Show page.
 *
 * Constraints (mirroring server-side validation):
 *  - Formats: JPEG, PNG, JPG, WebP
 *  - Max size: 2 MB
 *  - Min resolution: 300 × 400 px
 */

import { ImageIcon, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface JournalCoverUploadProps {
    /** Existing cover URL to show as current cover preview (e.g. from journal.cover_image or cover_image_url) */
    currentCover?: string | null;
    /** Called whenever the user selects (or clears) a file */
    onChange: (file: File | null) => void;
    /** Validation error message to display below the upload area */
    error?: string;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_WIDTH = 300;
const MIN_HEIGHT = 400;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp';

export function JournalCoverUpload({ currentCover, onChange, error }: JournalCoverUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        setClientError(null);

        if (!file) {
            setPreview(null);
            onChange(null);
            return;
        }

        // Client-side type check
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setClientError('Format harus JPEG, PNG, atau WebP.');
            setPreview(null);
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        // Client-side size check
        if (file.size > MAX_SIZE_BYTES) {
            setClientError('Ukuran file maksimal 2 MB.');
            setPreview(null);
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        // Read for preview + resolution check
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                if (img.naturalWidth < MIN_WIDTH || img.naturalHeight < MIN_HEIGHT) {
                    setClientError(`Resolusi minimal ${MIN_WIDTH}×${MIN_HEIGHT} px. File ini ${img.naturalWidth}×${img.naturalHeight} px.`);
                    setPreview(null);
                    onChange(null);
                    if (inputRef.current) inputRef.current.value = '';
                    return;
                }
                setPreview(dataUrl);
                onChange(file);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files?.[0] ?? null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFileChange(e.dataTransfer.files?.[0] ?? null);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setClientError(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const displayedImage = preview ?? currentCover;
    const combinedError = clientError ?? error;

    return (
        <div className="space-y-2">
            {/* Upload area */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={[
                    'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
                    combinedError
                        ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/20'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20',
                    displayedImage ? 'h-auto overflow-hidden p-0' : 'h-40 p-6',
                ].join(' ')}
            >
                {displayedImage ? (
                    <>
                        <img src={displayedImage} alt="Cover preview" className="block max-h-56 w-full object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                            <div className="text-center text-white">
                                <UploadCloud className="mx-auto mb-1 h-8 w-8" />
                                <p className="text-sm font-medium">Klik untuk ganti cover</p>
                            </div>
                        </div>
                        {/* Clear button */}
                        <button
                            type="button"
                            onClick={clearFile}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                            aria-label="Batalkan pilihan cover"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">Klik atau seret gambar ke sini</p>
                        <p className="text-xs">JPEG, PNG, WebP · Maks 2 MB · Min 300×400 px</p>
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input ref={inputRef} type="file" name="cover_image" accept={ACCEPTED_EXTENSIONS} onChange={handleInputChange} className="hidden" />

            {/* Error message */}
            {combinedError && <p className="text-sm text-red-600 dark:text-red-400">{combinedError}</p>}

            {/* Helper text (only when no preview) */}
            {!displayedImage && !combinedError && (
                <p className="text-xs text-muted-foreground">Format: JPG/PNG/WebP · Maks 2 MB · Resolusi min. 300×400 px</p>
            )}
        </div>
    );
}
