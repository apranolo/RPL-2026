import React, { useEffect, useState } from 'react';

interface Submission {
    id: number;
    title: string;
    author_name: string;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export default function AssignCopyeditor() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [copyeditors, setCopyeditors] = useState<User[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<string>('');
    const [selectedCopyeditor, setSelectedCopyeditor] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Memuat data awal untuk simulasi panel admin
    useEffect(() => {
        setSubmissions([
            { id: 101, title: 'Analisis Algoritma Optimasi Skripsi', author_name: 'Septian Eko', status: 'Accepted' },
            { id: 102, title: 'Pengembangan Sistem E-Learning Berbasis Web', author_name: 'Aulia Luthfi', status: 'Accepted' },
        ]);

        setCopyeditors([
            { id: 5, name: 'Hafidz Chairul', email: 'hafidz@mail.com' },
            { id: 6, name: 'Alfin Ahmad', email: 'alfin@mail.com' },
        ]);
    }, []);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSubmission || !selectedCopyeditor) {
            setMessage({ type: 'error', text: 'Silakan pilih Submission dan Copyeditor terlebih dahulu!' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/copyediting/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    submission_id: parseInt(selectedSubmission),
                    user_id: parseInt(selectedCopyeditor),
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage({ type: 'success', text: result.message || 'Berhasil menugaskan Copyeditor!' });
                setSelectedSubmission('');
                setSelectedCopyeditor('');
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal melakukan penugasan.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan atau server.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                }}
            >
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>Panel Penugasan Copyeditor</h2>
                <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '0.875rem' }}>
                    Pilih artikel pasca-keputusan (Accept) dan tentukan staf Copyeditor yang bertanggung jawab.
                </p>

                {message && (
                    <div
                        style={{
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '0.875rem',
                            backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8',
                            color: message.type === 'success' ? '#03543f' : '#9b1c1c',
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAssign}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                            Pilih Submission (Artikel)
                        </label>
                        <select
                            value={selectedSubmission}
                            onChange={(e) => setSelectedSubmission(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        >
                            <option value="">-- Pilih Artikel --</option>
                            {submissions.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    ID: {sub.id} - {sub.title} ({sub.author_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Pilih Copyeditor</label>
                        <select
                            value={selectedCopyeditor}
                            onChange={(e) => setSelectedCopyeditor(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        >
                            <option value="">-- Pilih Nama Copyeditor --</option>
                            {copyeditors.map((editor) => (
                                <option key={editor.id} value={editor.id}>
                                    {editor.name} ({editor.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: loading ? '#9ca3af' : '#2563eb',
                            color: '#ffffff',
                        }}
                    >
                        {loading ? 'Memproses...' : 'Tugaskan Copyeditor'}
                    </button>
                </form>
            </div>
        </div>
    );
}
