import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface EmailTemplate {
    id: string; // Menggunakan string untuk mendukung format UUID dari database backend
    name: string;
    subject: string;
    content: string;
}

interface EditProps {
    template: EmailTemplate; // Data template riil yang dikirim secara dinamis oleh Controller backend
}

export default function Edit({ template }: EditProps) {
    // Menggunakan Inertia useForm untuk mengelola state input dan proses pengiriman data ke backend
    const { data, setData, put, processing } = useForm({
        name: template?.name || '',
        subject: template?.subject || '',
        content: template?.content || '',
    });

    // State lokal hanya digunakan untuk menampung simulasi live preview
    const [previewContent, setPreviewContent] = useState<string>('');

    // Fungsi Live Preview untuk merubah teks variabel menjadi data simulasi secara realtime
    useEffect(() => {
        let text = data.content;
        text = text.replace(/{name}/g, 'Salsabila');
        text = text.replace(/{app_name}/g, 'JurnalMu App');
        setPreviewContent(text);
    }, [data.content]);

    // Fungsi submit menggunakan method PUT/PATCH Inertia ke database backend
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirimkan data ke endpoint update template email (misal: /email-templates/{id})
        put(`/email-templates/${template.id}`, {
            preserveScroll: true,
        });
    };

    // Fungsi format teks sederhana untuk Rich Text (Bold / Italic)
    const formatText = (command: string) => {
        document.execCommand(command, false, '');
        const editor = document.getElementById('rich-editor');
        if (editor) setData('content', editor.innerHTML);
    };

    return (
        <AppLayout>
            <div className="mx-auto min-h-screen max-w-6xl bg-gray-50 p-6">
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Template Email: {data.name}</h1>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Admin Panel</span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* PANEL KIRI: FORM EDIT */}
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-semibold text-gray-700">Form Editor</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600">Nama Template</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600">Subjek Email</label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Rich Text Editor */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600">Konten Email (Rich Text)</label>
                            <div className="overflow-hidden rounded-md border border-gray-300">
                                {/* Toolbar Editor */}
                                <div className="flex space-x-2 border-b border-gray-300 bg-gray-100 p-2">
                                    <button
                                        type="button"
                                        onClick={() => formatText('bold')}
                                        className="rounded border border-gray-300 bg-white px-3 py-1 text-sm font-bold hover:bg-gray-50"
                                    >
                                        B
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('italic')}
                                        className="rounded border border-gray-300 bg-white px-3 py-1 text-sm italic hover:bg-gray-50"
                                    >
                                        I
                                    </button>
                                    <span className="self-center pl-2 text-xs text-gray-400">
                                        Variabel tersedia: {'{name}'}, {'{app_name}'}
                                    </span>
                                </div>
                                {/* Area Ketik Editor */}
                                <div
                                    id="rich-editor"
                                    contentEditable
                                    dangerouslySetInnerHTML={{ __html: data.content }}
                                    onInput={(e) => setData('content', e.currentTarget.innerHTML)}
                                    className="prose min-h-[200px] max-w-none bg-white p-4 focus:outline-none"
                                    style={{ minHeight: '200px' }}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white transition duration-150 hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan (Update)'}
                            </button>
                        </div>
                    </form>

                    {/* PANEL KANAN: LIVE PREVIEW VARIABEL */}
                    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
                            <p className="text-xs text-gray-400">Simulasi tampilan email yang akan diterima user (Variabel sudah terisi otomatis)</p>
                        </div>

                        {/* Tampilan Mockup Email */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
                            <div className="space-y-1 border-b border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                                <div>
                                    <span className="font-semibold">Kepada:</span> salsabila@example.com
                                </div>
                                <div>
                                    <span className="font-semibold">Subjek:</span> {data.subject.replace(/{name}/g, 'Salsabila')}
                                </div>
                            </div>
                            {/* Isi Konten Email Hasil Render */}
                            <div className="prose flex-1 overflow-y-auto p-6" dangerouslySetInnerHTML={{ __html: previewContent }} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
