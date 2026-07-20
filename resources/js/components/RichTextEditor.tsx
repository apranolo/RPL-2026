/**
 * RichTextEditor — Komponen WYSIWYG sederhana untuk logbook
 *
 * Fitur toolbar: Bold, Italic, Underline, Strikethrough,
 * Heading, Bullet list, Numbered list, Blockquote, Link, Clear.
 * Output: HTML string yang bisa langsung disimpan ke DB.
 */
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Quote, RemoveFormatting, Strikethrough, Underline } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface RichTextEditorProps {
    /** Nilai HTML awal */
    value: string;
    /** Callback setiap kali konten berubah — menerima string HTML */
    onChange: (html: string) => void;
    /** Placeholder yang ditampilkan saat konten kosong */
    placeholder?: string;
    /** Tinggi minimum area editor (Tailwind class) */
    minHeight?: string;
    /** Nonaktifkan editor */
    disabled?: boolean;
    /** ID unik untuk a11y */
    id?: string;
}

/* ------------------------------------------------------------------ */
/*  Toolbar Button helper                                               */
/* ------------------------------------------------------------------ */

interface ToolbarBtnProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
}

function ToolbarBtn({ label, onClick, disabled, active, children }: ToolbarBtnProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant={active ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        disabled={disabled}
                        onMouseDown={(e) => {
                            // preventDefault supaya editor tidak kehilangan fokus
                            e.preventDefault();
                            onClick();
                        }}
                        aria-label={label}
                    >
                        {children}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p className="text-xs">{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tulis catatan logbook di sini...',
    minHeight = 'min-h-[200px]',
    disabled = false,
    id,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    /* Sinkronisasi nilai awal ke DOM tanpa mengganggu kursor */
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        // Hanya update jika berbeda untuk menghindari reset kursor
        if (el.innerHTML !== value) {
            el.innerHTML = value;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* Handler perubahan konten */
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    /* Eksekusi perintah formatting */
    const exec = useCallback(
        (command: string, value?: string) => {
            document.execCommand(command, false, value);
            editorRef.current?.focus();
            handleInput();
        },
        [handleInput],
    );

    /* Insert link */
    const handleLink = useCallback(() => {
        const url = prompt('Masukkan URL:', 'https://');
        if (url) exec('createLink', url);
    }, [exec]);

    /* Clear semua formatting */
    const handleClear = useCallback(() => {
        exec('removeFormat');
        exec('unlink');
    }, [exec]);

    /* Handle paste — strip rich formatting, hanya teks biasa */
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }, []);

    return (
        <div className={`overflow-hidden rounded-md border bg-background ${disabled ? 'opacity-60' : ''}`} aria-disabled={disabled}>
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1">
                <ToolbarBtn label="Bold (Ctrl+B)" onClick={() => exec('bold')} disabled={disabled}>
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Italic (Ctrl+I)" onClick={() => exec('italic')} disabled={disabled}>
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Underline (Ctrl+U)" onClick={() => exec('underline')} disabled={disabled}>
                    <Underline className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Strikethrough" onClick={() => exec('strikeThrough')} disabled={disabled}>
                    <Strikethrough className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarBtn label="Heading 2" onClick={() => exec('formatBlock', '<h2>')} disabled={disabled}>
                    <Heading2 className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Blockquote" onClick={() => exec('formatBlock', '<blockquote>')} disabled={disabled}>
                    <Quote className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarBtn label="Bullet list" onClick={() => exec('insertUnorderedList')} disabled={disabled}>
                    <List className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Numbered list" onClick={() => exec('insertOrderedList')} disabled={disabled}>
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarBtn label="Sisipkan link" onClick={handleLink} disabled={disabled}>
                    <Link2 className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <ToolbarBtn label="Hapus formatting" onClick={handleClear} disabled={disabled}>
                    <RemoveFormatting className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* ── Editable area ── */}
            <div
                id={id}
                ref={editorRef}
                contentEditable={!disabled}
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
                data-placeholder={placeholder}
                className={[
                    'prose prose-sm dark:prose-invert max-w-none',
                    'w-full px-4 py-3 text-sm outline-none',
                    minHeight,
                    // Placeholder via CSS
                    'empty:before:pointer-events-none empty:before:text-muted-foreground',
                    'empty:before:content-[attr(data-placeholder)]',
                    // Styling untuk elemen hasil formatting
                    '[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold',
                    '[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-3 [&_blockquote]:italic',
                    '[&_ul]:list-disc [&_ul]:pl-5',
                    '[&_ol]:list-decimal [&_ol]:pl-5',
                    '[&_a]:text-primary [&_a]:underline',
                ].join(' ')}
                aria-label={placeholder}
                aria-multiline="true"
                role="textbox"
                spellCheck
            />

            {/* ── Character hint ── */}
            <div className="border-t bg-muted/20 px-3 py-1 text-right text-[10px] text-muted-foreground">
                HTML • Ctrl+B Bold • Ctrl+I Italic • Ctrl+U Underline
            </div>
        </div>
    );
}
