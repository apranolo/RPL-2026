import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Galley {
    id: number;
    label: string;
    file_path: string;
    page_from: number | null;
    page_to: number | null;
    doi: string | null;
    issue: {
        id: number;
        volume: number;
        number: number;
        year: number;
        title: string | null;
    } | null;
}

interface Props {
    galley: Galley;
}

export default function SetMeta({ galley }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        page_from: galley.page_from ?? '',
        page_to: galley.page_to ?? '',
        doi: galley.doi ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('production.galley.updateMeta', galley.id));
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-2">Penetapan Halaman & DOI</h1>

                {/* Info Galley */}
                <div className="bg-gray-100 rounded p-4 mb-6">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">File:</span> {galley.label}
                    </p>
                    {galley.issue && (
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Issue:</span> Vol. {galley.issue.volume}, No. {galley.issue.number} ({galley.issue.year})
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nomor Halaman */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                                Halaman Awal
                            </label>
                            <input
                                type="number"
                                value={data.page_from}
                                onChange={e => setData('page_from', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Contoh: 1"
                                min={1}
                            />
                            {errors.page_from && (
                                <p className="text-red-500 text-xs mt-1">{errors.page_from}</p>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                                Halaman Akhir
                            </label>
                            <input
                                type="number"
                                value={data.page_to}
                                onChange={e => setData('page_to', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Contoh: 10"
                                min={1}
                            />
                            {errors.page_to && (
                                <p className="text-red-500 text-xs mt-1">{errors.page_to}</p>
                            )}
                        </div>
                    </div>

                    {/* DOI */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            DOI <span className="text-gray-400">(opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.doi}
                            onChange={e => setData('doi', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Contoh: 10.1234/example.2026"
                        />
                        {errors.doi && (
                            <p className="text-red-500 text-xs mt-1">{errors.doi}</p>
                        )}
                    </div>

                    {/* Tombol */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}