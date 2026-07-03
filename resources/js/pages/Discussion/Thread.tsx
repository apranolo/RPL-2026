import MessageBubble from '@/components/MessageBubble';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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

export default function Thread({ discussions }: Props) {
    const [reply, setReply] = useState<Record<number, string>>({});

    const submitReply = (discussionId: number) => {
        router.post(
            route('discussion.message.store', discussionId),
            {
                message: reply[discussionId],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReply((prev) => ({
                        ...prev,
                        [discussionId]: '',
                    }));
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Submission Discussion" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">
                    Submission Discussion
                </h1>

                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div
                            key={discussion.id}
                            className="rounded-lg border border-sidebar-border/70 bg-card p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    {discussion.subject}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Stage: {discussion.stage}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {discussion.messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 space-y-3">
                                <textarea
                                    value={
                                        reply[discussion.id] ?? ''
                                    }
                                    onChange={(e) =>
                                        setReply((prev) => ({
                                            ...prev,
                                            [discussion.id]:
                                                e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-md border p-3"
                                    rows={4}
                                    placeholder="Tulis balasan..."
                                />

                                <button
                                    onClick={() =>
                                        submitReply(discussion.id)
                                    }
                                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                                >
                                    Kirim Reply
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-12 text-center">
                        <h3 className="text-lg font-semibold">
                            Belum Ada Diskusi
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Diskusi akan muncul di sini.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}