import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type ProposalItem = {
    id: number;
    title: string;
    researcher_name: string | null;
    review_count: number;
    average_score: number;
    min_score: number;
    max_score: number;
    recommendation: 'Diterima' | 'Ditolak' | 'Belum Bisa Diputuskan';
    status: string | null;
};

type PaginatedProposals = {
    data: ProposalItem[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type PageProps = {
    title: string;
    filters: {
        search?: string;
    };
    proposals: PaginatedProposals;
};

export default function Summary() {
    const { title, filters, proposals } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(route('admin.reviews.summary'), { search }, { preserveState: true, replace: true });
    };

    const handleDecide = (proposalId: number) => {
        if (!confirm('Tentukan keputusan proposal ini sekarang?')) return;

        router.post(route('admin.decisions.decide', proposalId));
    };

    return (
        <>
            <Head title={title} />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm text-gray-500">Rekap nilai hasil review proposal penelitian</p>
                </div>

                <form onSubmit={handleFilter} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul proposal / nama peneliti"
                        className="w-full rounded border px-3 py-2"
                    />
                    <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
                        Cari
                    </button>
                </form>

                <div className="overflow-x-auto rounded border bg-white">
                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2 text-left">No</th>
                                <th className="border px-3 py-2 text-left">Judul Proposal</th>
                                <th className="border px-3 py-2 text-left">Peneliti</th>
                                <th className="border px-3 py-2 text-center">Jumlah Reviewer</th>
                                <th className="border px-3 py-2 text-center">Nilai Min</th>
                                <th className="border px-3 py-2 text-center">Nilai Max</th>
                                <th className="border px-3 py-2 text-center">Rata-rata</th>
                                <th className="border px-3 py-2 text-center">Rekomendasi</th>
                                <th className="border px-3 py-2 text-center">Status</th>
                                <th className="border px-3 py-2 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.data.length > 0 ? (
                                proposals.data.map((proposal, index) => (
                                    <tr key={proposal.id}>
                                        <td className="border px-3 py-2">{index + 1}</td>
                                        <td className="border px-3 py-2">{proposal.title}</td>
                                        <td className="border px-3 py-2">{proposal.researcher_name ?? '-'}</td>
                                        <td className="border px-3 py-2 text-center">{proposal.review_count}</td>
                                        <td className="border px-3 py-2 text-center">{proposal.min_score}</td>
                                        <td className="border px-3 py-2 text-center">{proposal.max_score}</td>
                                        <td className="border px-3 py-2 text-center font-semibold">{proposal.average_score}</td>
                                        <td className="border px-3 py-2 text-center">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    proposal.recommendation === 'Diterima'
                                                        ? 'bg-green-100 text-green-700'
                                                        : proposal.recommendation === 'Ditolak'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {proposal.recommendation}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 text-center">{proposal.status ?? '-'}</td>
                                        <td className="border px-3 py-2 text-center">
                                            <button onClick={() => handleDecide(proposal.id)} className="rounded bg-indigo-600 px-3 py-1 text-white">
                                                Putuskan
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="border px-3 py-4 text-center text-gray-500">
                                        Belum ada data review.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {proposals.links?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {proposals.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`rounded border px-3 py-1 text-sm ${
                                    link.active ? 'bg-blue-600 text-white' : 'bg-white'
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
