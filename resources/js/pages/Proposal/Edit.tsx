/**
 * Proposal/Edit — User (Dosen)
 *
 * @description
 * Halaman form edit proposal penelitian untuk peran User (Dosen).
 * Kolom diselaraskan dengan skema migrasi: title & description.
 *
 * @route GET /proposal/{proposal}/edit
 */
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proposal', href: '/proposal' },
    { title: 'Edit Proposal', href: '#' },
];

// ─── TypeScript ───────────────────────────────────────────────────────────────

type Proposal = {
    id: number;
    title: string;
    description: string;
};

type ProposalForm = {
    title: string;
    description: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Edit({ proposal }: { proposal: Proposal }) {
    const { data, setData, put, processing, errors } = useForm<ProposalForm>({
        title:       proposal?.title ?? '',
        description: proposal?.description ?? '',
    });

    if (!proposal) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-6 text-muted-foreground">Data tidak ditemukan.</div>
            </AppLayout>
        );
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('proposal.update', { proposal: proposal.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-2xl p-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold text-foreground">Edit Proposal</h1>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Judul */}
                        <div>
                            <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
                                Judul Proposal
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setData('title', e.target.value)
                                }
                                className={`w-full rounded-lg border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 ${
                                    errors.title
                                        ? 'border-destructive focus:ring-destructive/30'
                                        : 'border-border focus:ring-ring'
                                }`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
                                Deskripsi
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setData('description', e.target.value)
                                }
                                rows={4}
                                className={`w-full rounded-lg border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 ${
                                    errors.description
                                        ? 'border-destructive focus:ring-destructive/30'
                                        : 'border-border focus:ring-ring'
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                            )}
                        </div>

                        {/* Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-primary px-5 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
