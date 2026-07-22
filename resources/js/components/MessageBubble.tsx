/**
 * Discussion Message Bubble Component
 *
 * @description
 * Komponen untuk menampilkan satu pesan pada thread diskusi submission.
 * Menampilkan identitas pengirim, isi pesan, waktu pengiriman,
 * serta attachment apabila tersedia.
 *
 * @features
 * - Menampilkan avatar berdasarkan inisial pengguna.
 * - Menampilkan bubble chat berdasarkan pengirim.
 * - Menampilkan waktu pengiriman pesan.
 * - Menampilkan attachment apabila tersedia.
 */

import { Paperclip } from 'lucide-react';

interface MessageBubbleProps {
    message: {
        id: number;
        message: string;
        attachment?: string | null;
        created_at: string;
        user?: {
            id: number;
            name: string;
        };
    };
    isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
    const initials =
        message.user?.name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() ?? 'U';
    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                        isCurrentUser ? 'bg-emerald-600' : 'bg-slate-500'
                    }`}
                >
                    {initials}
                </div>

                <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser ? 'bg-emerald-50 text-emerald-950' : 'bg-slate-100 text-slate-900'}`}
                >
                    <div className="mb-1 flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold">{message.user?.name ?? 'Unknown User'}</span>

                        <span className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</span>
                    </div>

                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>

                    {message.attachment && (
                        <a
                            href={message.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <Paperclip className="h-4 w-4" />
                            Lampiran
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
