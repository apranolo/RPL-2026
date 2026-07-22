import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
            <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Template Email: {data.name}</h1>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Admin Panel</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PANEL KIRI: FORM EDIT */}
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Form Editor</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nama Template</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Subjek Email</label>
                            <input 
                                type="text" 
                                value={data.subject} 
                                onChange={(e) => setData('subject', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        {/* Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Konten Email (Rich Text)</label>
                            <div className="border border-gray-300 rounded-md overflow-hidden">
                                {/* Toolbar Editor */}
                                <div className="bg-gray-100 p-2 border-b border-gray-300 flex space-x-2">
                                    <button type="button" onClick={() => formatText('bold')} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50">B</button>
                                    <button type="button" onClick={() => formatText('italic')} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm italic hover:bg-gray-50">I</button>
                                    <span className="text-xs text-gray-400 self-center pl-2">Variabel tersedia: {'{name}'}, {'{app_name}'}</span>
                                </div>
                                {/* Area Ketik Editor */}
                                <div 
                                    id="rich-editor"
                                    contentEditable
                                    dangerouslySetInnerHTML={{ __html: data.content }}
                                    onInput={(e) => setData('content', e.currentTarget.innerHTML)}
                                    className="p-4 min-h-[200px] focus:outline-none bg-white prose max-w-none"
                                    style={{ minHeight: '200px' }}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 font-medium transition duration-150 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan (Update)'}
                            </button>
                        </div>
                    </form>

                    {/* PANEL KANAN: LIVE PREVIEW VARIABEL */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
                            <p className="text-xs text-gray-400">Simulasi tampilan email yang akan diterima user (Variabel sudah terisi otomatis)</p>
                        </div>

                        {/* Tampilan Mockup Email */}
                        <div className="border border-gray-200 rounded-md flex-1 bg-white overflow-hidden flex flex-col">
                            <div className="bg-gray-50 p-3 border-b border-gray-200 text-sm text-gray-600 space-y-1">
                                <div><span className="font-semibold">Kepada:</span> salsabila@example.com</div>
                                <div><span className="font-semibold">Subjek:</span> {data.subject.replace(/{name}/g, 'Salsabila')}</div>
                            </div>
                            {/* Isi Konten Email Hasil Render */}
                            <div 
                                className="p-6 overflow-y-auto flex-1 prose"
                                dangerouslySetInnerHTML={{ __html: previewContent }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}