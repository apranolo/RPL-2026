/**
 * Submission Discussion Thread Page
 *
 * @description
 * Halaman untuk menampilkan utas diskusi pada proses submission artikel.
 * Pengguna dapat melihat riwayat percakapan, membaca pesan dari setiap
 * partisipan, serta mengirim balasan selama proses editorial berlangsung.
 *
 * @route
 * GET /discussion
 * POST /discussion
 * POST /discussion/discussions/{parentMessage}/reply
 * POST /discussion/discussions/{message}/upload-attachment
 */

import MessageBubble from '@/components/MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Paperclip } from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: number;
    message: string;
    attachment?: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface Discussion {
    id: number;
    subject: string;
    stage: string;
    messages: Message[];
}

interface Props {
    discussions: Discussion[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Submission Discussion',
        href: '/discussion',
    },
];

export default function Thread({ discussions }: Props) {
    const { auth } = usePage<SharedData>().props;

    const currentUserId = auth.user.id;

    const [reply, setReply] = useState<Record<number, string>>({});
    const [attachments, setAttachments] = useState<Record<number, File | null>>({});
    const [activeReply, setActiveReply] = useState<number | null>(null);

    const submitReply = (parentMessageId: number) => {
        const formData = new FormData();

        formData.append('body', reply[parentMessageId] ?? '');

        if (attachments[parentMessageId]) {
            formData.append('attachment', attachments[parentMessageId]!);
        }

        router.post(route('discussion.reply', parentMessageId), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setReply((prev) => ({
                    ...prev,
                    [parentMessageId]: '',
                }));

                setAttachments((prev) => ({
                    ...prev,
                    [parentMessageId]: null,
                }));

                setActiveReply(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission Discussion" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Submission Discussion</h1>

                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div key={discussion.id} className="rounded-lg border border-sidebar-border/70 bg-card p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">{discussion.subject}</h2>

                                <p className="text-sm text-muted-foreground">Stage: {discussion.stage}</p>
                            </div>

                            <div className="space-y-6">
                                {discussion.messages.map((message) => (
                                    <div key={message.id} className="space-y-3">
                                        <MessageBubble message={message} isCurrentUser={message.user?.id === currentUserId} />

                                        <div className={`flex ${message.user?.id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveReply(activeReply === message.id ? null : message.id)}
                                            >
                                                Reply
                                            </Button>
                                        </div>

                                        {activeReply === message.id && (
                                            <div
                                                className={`space-y-3 rounded-lg border border-sidebar-border/70 bg-muted/20 p-4 ${message.user?.id === currentUserId ? 'ml-14' : 'mr-14'}`}
                                            >
                                                <Textarea
                                                    rows={4}
                                                    value={reply[message.id] ?? ''}
                                                    onChange={(e) =>
                                                        setReply((prev) => ({
                                                            ...prev,
                                                            [message.id]: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Tulis balasan..."
                                                />

                                                <div className="flex items-center gap-3">
                                                    <label
                                                        htmlFor={`attachment-${message.id}`}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                                                    >
                                                        <Paperclip className="h-4 w-4" />
                                                        Lampiran
                                                    </label>

                                                    <Input
                                                        id={`attachment-${message.id}`}
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            setAttachments((prev) => ({
                                                                ...prev,
                                                                [message.id]: e.target.files?.[0] ?? null,
                                                            }))
                                                        }
                                                    />

                                                    {attachments[message.id] && (
                                                        <span className="text-sm text-muted-foreground">{attachments[message.id]?.name}</span>
                                                    )}
                                                </div>

                                                <Button disabled={!reply[message.id]?.trim()} onClick={() => submitReply(message.id)}>
                                                    Kirim Reply
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-12 text-center">
                        <h3 className="text-lg font-semibold">Belum Ada Diskusi</h3>

                        <p className="mt-2 text-sm text-muted-foreground">Diskusi akan muncul di sini.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
