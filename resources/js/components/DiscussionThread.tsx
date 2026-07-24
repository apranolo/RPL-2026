/**
 * Komponen UI thread-style untuk diskusi editorial (Editor <-> Author).
 *
 * Menampilkan daftar thread diskusi (subjek + pesan-pesan di dalamnya) per
 * submission, serta form balas-pesan per thread dan form mulai thread baru.
 * Mengirim data ke `EditorialDiscussionController@store` lewat Inertia
 * router.
 *
 * @module resources/js/components/DiscussionThread
 */

import { router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

/** Satu pesan di dalam sebuah thread diskusi. */
export interface DiscussionMessage {
    id: number;
    message: string;
    created_at: string;
    user: User;
}

/** Satu thread diskusi (subjek) beserta pesan-pesan balasannya. */
export interface DiscussionThreadData {
    id: number;
    subject?: string | null;
    created_at: string;
    creator?: User;
    messages: DiscussionMessage[];
}

interface DiscussionThreadProps {
    submissionId: number;
    discussions: DiscussionThreadData[];
    loading?: boolean;
}

export default function DiscussionThread({ submissionId, discussions, loading = false }: DiscussionThreadProps) {
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const [showNewThread, setShowNewThread] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');

    if (loading) {
        return (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="animate-pulse text-sm text-gray-500">Loading discussion...</p>
            </div>
        );
    }

    // Mengirim balasan pada thread yang sudah ada
    const handleSendReply = (discussionId: number) => {
        if (!replyMessage.trim() || isSending) return;

        setIsSending(true);

        router.post(
            `/editorial/discussions/${submissionId}`,
            {
                discussion_id: discussionId,
                message: replyMessage,
            },
            {
                onSuccess: () => {
                    setReplyMessage('');
                    setActiveReplyId(null);
                },
                onFinish: () => {
                    setIsSending(false);
                },
            },
        );
    };

    // Membuat thread diskusi baru
    const handleCreateThread = () => {
        if (!newSubject.trim() || !newMessage.trim() || isSending) return;

        setIsSending(true);

        router.post(
            `/editorial/discussions/${submissionId}`,
            {
                subject: newSubject,
                message: newMessage,
            },
            {
                onSuccess: () => {
                    setNewSubject('');
                    setNewMessage('');
                    setShowNewThread(false);
                },
                onFinish: () => {
                    setIsSending(false);
                },
            },
        );
    };

    return (
        <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between rounded-t-xl border-b bg-gray-50/50 p-4">
                <h3 className="text-lg font-semibold text-gray-800">Discussion Thread</h3>
                <button
                    type="button"
                    onClick={() => setShowNewThread((prev) => !prev)}
                    className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    {showNewThread ? 'Batal' : '+ Diskusi Baru'}
                </button>
            </div>

            {showNewThread && (
                <div className="space-y-2 border-b bg-gray-50/50 p-4">
                    <input
                        type="text"
                        value={newSubject}
                        disabled={isSending}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Subjek diskusi..."
                        className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <textarea
                        rows={3}
                        value={newMessage}
                        disabled={isSending}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tulis pesan pembuka diskusi..."
                        className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCreateThread}
                            disabled={!newSubject.trim() || !newMessage.trim() || isSending}
                            className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSending ? 'Mengirim...' : 'Mulai Diskusi'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4 p-4">
                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div key={discussion.id} className="rounded-lg border bg-white p-4 transition hover:bg-gray-50/30">
                            <div className="flex items-start justify-between">
                                <div>
                                    {discussion.subject && <h4 className="text-base font-semibold text-gray-900">{discussion.subject}</h4>}
                                    <p className="mt-1 text-sm font-medium text-gray-600">{discussion.creator?.name || 'User Tidak Dikenal'}</p>
                                </div>

                                <span className="text-xs text-gray-400">
                                    {new Date(discussion.created_at).toLocaleString('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>

                            <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-3">
                                {discussion.messages.map((msg) => (
                                    <div key={msg.id}>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs font-medium text-gray-600">{msg.user?.name || 'User Tidak Dikenal'}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(msg.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{msg.message}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activeReplyId === discussion.id) {
                                            setActiveReplyId(null);
                                        } else {
                                            setActiveReplyId(discussion.id);
                                        }
                                        setReplyMessage('');
                                    }}
                                    className={`rounded-md border px-4 py-1.5 text-sm font-medium transition ${
                                        activeReplyId === discussion.id
                                            ? 'border-gray-300 bg-gray-100 text-gray-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {activeReplyId === discussion.id ? 'Cancel' : 'Reply'}
                                </button>
                            </div>

                            {activeReplyId === discussion.id && (
                                <div className="mt-4 rounded-lg border border-t border-dashed bg-gray-50/50 p-3 pt-4">
                                    <textarea
                                        rows={3}
                                        value={replyMessage}
                                        disabled={isSending}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Tulis balasan editorial atau tanggapan revisi Anda di sini..."
                                        className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <div className="mt-2 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            disabled={isSending}
                                            onClick={() => {
                                                setActiveReplyId(null);
                                                setReplyMessage('');
                                            }}
                                            className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-200"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSendReply(discussion.id)}
                                            disabled={!replyMessage.trim() || isSending}
                                            className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {isSending ? 'Mengirim...' : 'Kirim Balasan'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-sm text-gray-500">No discussions found.</div>
                )}
            </div>
        </div>
    );
}
