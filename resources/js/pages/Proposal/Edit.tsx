import AppLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

type Proposal = {
    id: number;
    judul: string;
    deskripsi: string;
};

type ProposalForm = {
    judul: string;
    deskripsi: string;
};

export default function Edit({ proposal }: { proposal: Proposal }) {
    // Guard (biar nggak crash kalau data aneh)
    const { data, setData, put, processing, errors } = useForm<ProposalForm>({
        judul: proposal?.judul ?? '',
        deskripsi: proposal?.deskripsi ?? '',
    });

    if (!proposal) {
        return <div className="p-6">Data tidak ditemukan</div>;
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('proposal.update', { proposal: proposal.id }), {
            onSuccess: () => {
                console.log('Berhasil update');
            },
        });
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-2xl p-6">
                <div className="rounded-xl bg-white p-6 shadow">
                    <h1 className="mb-6 text-2xl font-bold">Edit Proposal</h1>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Judul */}
                        <div>
                            <label htmlFor="judul" className="mb-1 block text-sm font-medium">
                                Judul
                            </label>

                            <input
                                id="judul"
                                type="text"
                                value={data.judul}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('judul', e.target.value)}
                                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none ${
                                    errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />

                            {errors.judul && <p className="mt-1 text-sm text-red-500">{errors.judul}</p>}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label htmlFor="deskripsi" className="mb-1 block text-sm font-medium">
                                Deskripsi
                            </label>

                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('deskripsi', e.target.value)}
                                rows={4}
                                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none ${
                                    errors.deskripsi ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />

                            {errors.deskripsi && <p className="mt-1 text-sm text-red-500">{errors.deskripsi}</p>}
                        </div>

                        {/* Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
