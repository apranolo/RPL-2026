import InlinePdfViewer from '@/components/InlinePdfViewer';
import { PageProps } from '@/types'; // Sesuaikan dengan path types Anda

// Wajib menyediakan tipe data TypeScript yang merujuk persis seperti data dari Controller
interface SubmissionFile {
    id_file: number;
    file_path: string;
    file_type: string;
}

interface Submission {
    id_submission: number;
    title: string;
    abstract: string;
    files: SubmissionFile[];
}

interface Props extends PageProps {
    submission: Submission;
}

export default function Show({ submission }: Props) {
    // Cari file naskah utama
    const mainManuscript = submission.files.find((f) => f.file_type === 'ManuscriptMain');
    const fileUrl = mainManuscript ? `/storage/${mainManuscript.file_path}` : '';

    return (
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
                <h1 className="text-2xl font-bold">{submission.title}</h1>
                <div className="rounded bg-white p-4 shadow">
                    <h2 className="mb-2 text-lg font-semibold">Dokumen Naskah</h2>
                    {fileUrl ? <InlinePdfViewer fileUrl={fileUrl} /> : <p className="text-red-500">File naskah tidak ditemukan.</p>}
                </div>
            </div>

            <div className="md:col-span-1">
                <div className="h-full rounded border bg-gray-50 p-4 shadow">
                    <h2 className="mb-4 text-lg font-semibold">Panel Riwayat & Keputusan</h2>
                    {/* Anda bisa menambahkan fetch ke route history() di sini atau merender props decisions */}
                    <p className="text-sm text-gray-600">Riwayat keputusan akan tampil di sini.</p>
                </div>
            </div>
        </div>
    );
}
