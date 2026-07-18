import { AlertCircle } from 'lucide-react';
import { type ReactNode } from 'react';

interface RevisionNotePanelProps {
    /** Teks instruksi perbaikan dari editor (RevisionRound.editor_decision_note). */
    note: string;
}

/**
 * Parser inline yang aman (tanpa dangerouslySetInnerHTML / library eksternal).
 * Mendukung: **tebal**, *miring*, _miring_.
 */
function renderInline(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
    let lastIndex = 0;
    let key = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        if (match[2] !== undefined) {
            nodes.push(<strong key={key++}>{match[2]}</strong>);
        } else if (match[3] !== undefined) {
            nodes.push(<em key={key++}>{match[3]}</em>);
        } else if (match[4] !== undefined) {
            nodes.push(<em key={key++}>{match[4]}</em>);
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes;
}

/**
 * Parser blok: mengelompokkan baris berawalan "- " / "* " menjadi bullet list,
 * baris lain menjadi paragraf. Baris kosong dipakai sebagai pemisah.
 */
function renderNote(note: string): ReactNode[] {
    const lines = note.split(/\r?\n/);
    const blocks: ReactNode[] = [];
    let bullets: string[] = [];
    let key = 0;

    const flushBullets = () => {
        if (bullets.length > 0) {
            const items = [...bullets];
            blocks.push(
                <ul key={`ul-${key++}`} className="list-disc space-y-1 pl-5">
                    {items.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                    ))}
                </ul>,
            );
            bullets = [];
        }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);

        if (bulletMatch) {
            bullets.push(bulletMatch[1]);
        } else if (line.trim() === '') {
            flushBullets();
        } else {
            flushBullets();
            blocks.push(<p key={`p-${key++}`}>{renderInline(line)}</p>);
        }
    }

    flushBullets();
    return blocks;
}

export default function RevisionNotePanel({ note }: RevisionNotePanelProps) {
    const trimmed = (note ?? '').trim();

    return (
        // Callout kuning redup sesuai spec §3.A.2 agar author fokus membaca ulasan editor.
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-amber-900">Catatan Ulasan Redaksi</h2>
            </div>

            <div className="mt-3 space-y-2 text-sm leading-relaxed text-amber-900/90">
                {trimmed ? (
                    renderNote(trimmed)
                ) : (
                    <p className="italic text-amber-800/70">Belum ada catatan revisi dari editor.</p>
                )}
            </div>
        </div>
    );
}