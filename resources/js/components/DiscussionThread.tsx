import { useState } from 'react';

// 1. Definisi Tipe Data TypeScript (Interfaces)
interface User {
    id: number;
    name: string;
}

interface Discussion {
    id: number;
    subject?: string;
    message: string;
    created_at: string;
    user: User;
}

interface DiscussionThreadProps {
    discussions: Discussion[];
    loading?: boolean;
}

export default function DiscussionThread({
    discussions,
    loading = false,
}: DiscussionThreadProps) {
    // State untuk mencatat ID diskusi mana yang boks reply-nya sedang aktif terbuka
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    // State untuk menampung teks balasan yang sedang diketik user
    const [replyMessage, setReplyMessage] = useState('');

    // State penanganan loading component
    if (loading) {
        return (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500 animate-pulse">
                    Loading discussion...
                </p>
            </div>
        );
    }

    // Fungsi pemicu saat user menekan tombol 'Kirim Balasan'
    const handleSendReply = (discussionId: number) => {
        if (!replyMessage.trim()) return;

        // Kebutuhan Integrasi Backend:
        // Di sini nanti tempatmu memanggil request Laravel via Inertia router, contoh:
        // router.post(`/editorial/discussions/${discussionId}`, { message: replyMessage })
        
        console.log(`Mengirim balasan untuk diskusi ID ${discussionId}:`, replyMessage);
        
        // Reset kembali state input setelah proses kirim berhasil disimulasikan
        setReplyMessage('');
        setActiveReplyId(null);
    };

    return (
        <div className="rounded-xl border bg-white shadow-sm">
            {/* Header Judul Thread */}
            <div className="border-b p-4 bg-gray-50/50 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-800">
                    Discussion Thread
                </h3>
            </div>

            {/* Kontainer Utama List Pesan */}
            <div className="space-y-4 p-4">
                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div
                            key={discussion.id}
                            className="rounded-lg border p-4 transition hover:bg-gray-50/30 bg-white"
                        >
                            {/* Baris Meta: Subjek, Nama Pengirim, dan Waktu Kirim */}
                            <div className="flex items-start justify-between">
                                <div>
                                    {discussion.subject && (
                                        <h4 className="text-base font-semibold text-gray-900">
                                            {discussion.subject}
                                        </h4>
                                    )}

                                    <p className="mt-1 text-sm font-medium text-gray-600">
                                        {discussion.user?.name || 'User Tidak Dikenal'}
                                    </p>
                                </div>

                                <span className="text-xs text-gray-400">
                                    {new Date(discussion.created_at).toLocaleString('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </span>
                            </div>

                            {/* Isi Konten Pesan Utama */}
                            <div className="mt-4 border-l-2 border-gray-100 pl-3">
                                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                    {discussion.message}
                                </p>
                            </div>

                            {/* Baris Kontrol Tombol Aksi */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Jika tombol reply yang sama diklik lagi, boks input akan otomatis menutup (Toggle)
                                        if (activeReplyId === discussion.id) {
                                            setActiveReplyId(null);
                                        } else {
                                            setActiveReplyId(discussion.id);
                                        }
                                        setReplyMessage('');
                                    }}
                                    className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition ${
                                        activeReplyId === discussion.id
                                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {activeReplyId === discussion.id ? 'Cancel' : 'Reply'}
                                </button>
                            </div>

                            {/* Boks Input Form Balasan (Hanya merender secara dinamis jika ID-nya cocok) */}
                            {activeReplyId === discussion.id && (
                                <div className="mt-4 border-t pt-4 bg-gray-50/50 p-3 rounded-lg border border-dashed">
                                    <textarea
                                        rows={3}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Tulis balasan editorial atau tanggapan revisi Anda di sini..."
                                        className="w-full rounded-lg border-gray-300 p-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border bg-white"
                                    />
                                    <div className="mt-2 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveReplyId(null);
                                                setReplyMessage('');
                                            }}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSendReply(discussion.id)}
                                            disabled={!replyMessage.trim()}
                                            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Kirim Balasan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    /* Tampilan Fallback Jika Array Kosong */
                    <div className="py-10 text-center text-sm text-gray-500">
                        No discussions found.
                    </div>
                )}
            </div>
        </div>
    );
}