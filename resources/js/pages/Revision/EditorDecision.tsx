/**
 * @route POST /api/revision/editor-decision/{id}
 * @features Proses keputusan hasil revisi dokumen dari Editor kepada Author
 * @description Halaman panel keputusan editor untuk menerima, menolak, atau meminta revisi kembali.
 */

import React from 'react';
import { useForm } from '@inertiajs/react';

interface Props {
    articleId: number;
}

export default function EditorDecision({ articleId }: Props) {
    // Menggunakan Inertia useForm sesuai instruksi dosen Anda
    const { data, setData, post, processing, errors } = useForm({
        decision: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirimkan form ke endpoint yang sesuai via Inertia
        post(`/api/revision/editor-decision/${articleId}`);
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            {/* Menggunakan token standard rounded-lg sesuai permintaan */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Keputusan Editor Atas Revisi</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Pilih Keputusan</label>
                        <select 
                            value={data.decision}
                            onChange={e => setData('decision', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">-- Pilih --</option>
                            <option value="Approved">Accept (Approved)</option>
                            <option value="Rejected">Return to Review (Rejected)</option>
                            <option value="Awaiting_Revision">Request More Revision</option>
                        </select>
                        {errors.decision && <span className="text-red-500 text-sm">{errors.decision}</span>}
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium mb-2">Catatan Editor</label>
                        <textarea 
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            rows={4}
                        />
                        {errors.notes && <span className="text-red-500 text-sm">{errors.notes}</span>}
                    </div>

                    {/* Menggunakan tombol palette Aurora (bg-primary) */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full bg-primary text-white p-3 rounded-lg font-bold disabled:opacity-50"
                    >
                        {processing ? 'Mengirim...' : 'Simpan Keputusan'}
                    </button>
                </form>
            </div>
        </div>
    );
}
