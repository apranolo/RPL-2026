/**
 * Halaman upload laporan hasil cek plagiasi.
 * Admin Kampus/Super Admin mengunggah PDF laporan beserta skor kemiripan untuk sebuah journal assessment.
 *
 * @module resources/js/pages/Editorial/Desk/Plagiarism
 */
import SimilarityBadge from '@/components/SimilarityBadge';
import { useForm } from '@inertiajs/react';

export default function Plagiarism() {
    const { data, setData, post, processing, errors } = useForm({
        journal_assessment_id: '',
        similarity_score: '',
        report_file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/plagiarism-check');
    };

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Upload Laporan Plagiasi</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block">Journal Assessment ID</label>
                    <input
                        type="number"
                        value={data.journal_assessment_id}
                        onChange={(e) => setData('journal_assessment_id', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                    {errors.journal_assessment_id && <p className="text-sm text-red-500">{errors.journal_assessment_id}</p>}
                </div>

                <div>
                    <label className="mb-1 block">Similarity Score</label>
                    <input
                        type="number"
                        value={data.similarity_score}
                        onChange={(e) => setData('similarity_score', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                    {errors.similarity_score && <p className="text-sm text-red-500">{errors.similarity_score}</p>}
                </div>

                <div>
                    <label className="mb-1 block">Upload Report PDF</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setData('report_file', e.target.files?.[0] || null)}
                        className="w-full rounded border p-2"
                    />
                    {errors.report_file && <p className="text-sm text-red-500">{errors.report_file}</p>}
                </div>

                <button type="submit" disabled={processing} className="rounded bg-blue-500 px-4 py-2 text-white">
                    Upload
                </button>
            </form>

            {data.similarity_score && (
                <div className="mt-6">
                    <p className="mb-2 font-medium">Preview Similarity:</p>
                    <SimilarityBadge percentage={Number(data.similarity_score)} />
                </div>
            )}
        </div>
    );
}
