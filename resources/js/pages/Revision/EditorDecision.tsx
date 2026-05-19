import axios from 'axios';
import React, { useState } from 'react';

interface EditorDecisionProps {
    articleId: number | string;
    onSuccess?: () => void;
}

export default function EditorDecision({ articleId, onSuccess }: EditorDecisionProps) {
    const [decision, setDecision] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Memanggil method decide() di backend Laravel
            const response = await axios.post(`/api/revision/editor-decision/${articleId}`, {
                decision: decision,
                notes: notes,
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setDecision('');
                setNotes('');
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan sistem.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const isNotesRequired = decision === 'return_to_review' || decision === 'request_more_revision';

    return (
        <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Panel Keputusan Editor</h3>

            {message && (
                <div
                    className={`mb-4 rounded-lg p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pilihan Keputusan */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Pilih Keputusan</label>
                    <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- Pilih Keputusan --</option>
                        <option value="accept">Terima Revisi (Accept)</option>
                        <option value="return_to_review">Kembalikan ke Tahap Review</option>
                        <option value="request_more_revision">Minta Revisi Lagi</option>
                    </select>
                </div>

                {/* Catatan Editor */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Catatan Editor {isNotesRequired && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required={isNotesRequired}
                        placeholder={isNotesRequired ? 'Catatan wajib diisi untuk keputusan ini...' : 'Tambahkan catatan opsional jika diterima...'}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Tombol Aksi */}
                <button
                    type="submit"
                    disabled={loading || !decision}
                    className={`w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white transition-colors ${
                        loading || !decision ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                    }`}
                >
                    {loading ? 'Memproses...' : 'Kirim Keputusan'}
                </button>
            </form>
        </div>
    );
}
