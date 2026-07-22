import AppLayout from '@/layouts/app-layout';

interface Issue {
    id: number;
    volume: number;
    number: number;
    year: number;
    title: string | null;
    description: string | null;
    status: string;
    galleys_count: number;
}

interface Props {
    issue: Issue;
}

export default function Show({ issue }: Props) {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Vol. {issue.volume}, No. {issue.number} ({issue.year})
                </h1>

                <div className="bg-white border rounded-lg p-5 space-y-3">
                    <div>
                        <span className="text-sm font-semibold text-gray-500">Status:</span>
                        <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                            issue.status === 'Published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {issue.status}
                        </span>
                    </div>

                    {issue.title && (
                        <div>
                            <span className="text-sm font-semibold text-gray-500">Judul Tematik:</span>
                            <p className="mt-1">{issue.title}</p>
                        </div>
                    )}

                    {issue.description && (
                        <div>
                            <span className="text-sm font-semibold text-gray-500">Deskripsi:</span>
                            <p className="mt-1 text-gray-700">{issue.description}</p>
                        </div>
                    )}

                    <div>
                        <span className="text-sm font-semibold text-gray-500">Jumlah Artikel:</span>
                        <span className="ml-2">{issue.galleys_count} artikel</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}