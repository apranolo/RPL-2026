import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-sidebar-layout';
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
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white shadow rounded-xl p-6">

                    <h1 className="text-2xl font-bold mb-6">
                        Edit Proposal
                    </h1>

                    <form onSubmit={submit} className="space-y-6">

                        {/* Judul */}
                        <div>
                            <label htmlFor="judul" className="block text-sm font-medium mb-1">
                                Judul
                            </label>

                            <input
                                id="judul"
                                type="text"
                                value={data.judul}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setData('judul', e.target.value)
                                }
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                    errors.judul
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />

                            {errors.judul && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.judul}
                                </p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label htmlFor="deskripsi" className="block text-sm font-medium mb-1">
                                Deskripsi
                            </label>

                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setData('deskripsi', e.target.value)
                                }
                                rows={4}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                    errors.deskripsi
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />

                            {errors.deskripsi && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.deskripsi}
                                </p>
                            )}
                        </div>

                        {/* Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
