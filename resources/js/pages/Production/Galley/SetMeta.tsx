/**
 * SetMeta Component
 *
 * @description
 * Form page for setting metadata (page range & DOI) of a production galley.
 * Provides two separate input boxes (Halaman Awal & Halaman Akhir) for the
 * user to enter a page range, which are combined into a single "FROM-TO"
 * string and saved to the `pages` column in the database on submission.
 *
 * @component
 *
 * @interface Galley
 * @property {number} id - Unique galley identifier
 * @property {string} label - File type label (e.g., "PDF")
 * @property {string} file_path - Stored file path
 * @property {string|null} pages - Page range string, e.g., "10-15" or null
 * @property {string|null} doi - Digital Object Identifier
 * @property {object|null} issue - Related issue data
 *
 * @interface Props
 * @property {Galley} galley - The galley record to edit
 *
 * @param {Props} props - Component props
 * @param {Galley} props.galley - Galley whose metadata is being set
 *
 * @returns The rendered metadata form page
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Production/Galley/SetMeta.tsx
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';

interface Galley {
    id: number;
    label: string;
    file_path: string;
    pages: string | null;
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

/**
 * Parse the "FROM-TO" pages string back into separate from/to values for the UI.
 */
function parsePagesString(pages: string | null): { pageFrom: string; pageTo: string } {
    if (!pages) return { pageFrom: '', pageTo: '' };
    const parts = pages.split('-');
    if (parts.length === 2) {
        return { pageFrom: parts[0], pageTo: parts[1] };
    }
    // Single page number
    return { pageFrom: pages, pageTo: pages };
}

export default function SetMeta({ galley }: Props) {
    const { pageFrom, pageTo } = parsePagesString(galley.pages);

    const { data, setData, patch, processing, errors } = useForm({
        page_from: pageFrom,
        page_to: pageTo,
        doi: galley.doi ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('production.galley.updateMeta', galley.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produksi', href: '/production' },
        {
            title: galley.issue ? `Vol. ${galley.issue.volume}, No. ${galley.issue.number} (${galley.issue.year})` : 'Issue',
            href: galley.issue ? route('production.issue.show', galley.issue.id) : '/production',
        },
        { title: 'Penetapan Halaman & DOI', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-2xl p-6">
                <h1 className="mb-2 text-2xl font-bold">Penetapan Halaman &amp; DOI</h1>

                {/* Info Galley */}
                <div className="mb-6 rounded bg-gray-100 p-4">
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
                            <label className="mb-1 block text-sm font-medium">Halaman Awal</label>
                            <input
                                type="number"
                                value={data.page_from}
                                onChange={(e) => setData('page_from', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                                placeholder="Contoh: 1"
                                min={1}
                            />
                            {errors.page_from && <p className="mt-1 text-xs text-red-500">{errors.page_from}</p>}
                        </div>

                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium">Halaman Akhir</label>
                            <input
                                type="number"
                                value={data.page_to}
                                onChange={(e) => setData('page_to', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                                placeholder="Contoh: 10"
                                min={1}
                            />
                            {errors.page_to && <p className="mt-1 text-xs text-red-500">{errors.page_to}</p>}
                        </div>
                    </div>

                    {/* DOI */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            DOI <span className="text-gray-400">(opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.doi}
                            onChange={(e) => setData('doi', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            placeholder="Contoh: 10.1234/example.2026"
                        />
                        {errors.doi && <p className="mt-1 text-xs text-red-500">{errors.doi}</p>}
                    </div>

                    {/* Tombol */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
