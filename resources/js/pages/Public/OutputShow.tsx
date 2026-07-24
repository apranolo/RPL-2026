/**
 * @file OutputShow.tsx
 * @description Halaman detail katalog luaran publik yang menampilkan rincian informasi publikasi/penelitian.
 * @author Tutur Pryambadha <@AamPryambadha>
 * @copyright 2026 RPL-2026 Project
 */

import { Button } from '@/components/ui/button'; // Komponen Button resmi proyek
import AppLayout from '@/layouts/app-layout'; // Path standard layout proyekmu
import { Head, Link } from '@inertiajs/react';

interface ResearchOutput {
    id: number;
    judul_luaran: string;
    jenis_luaran: string;
    status_verifikasi: string;
}

interface Props {
    output: ResearchOutput;
}

export default function OutputShow({ output }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Luaran - ${output.judul_luaran}`} />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden border border-zinc-200 bg-white shadow-sm sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="p-6 text-zinc-900 dark:text-zinc-100">
                        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
                            {output.jenis_luaran}
                        </span>

                        <h1 className="mt-3 mb-4 text-2xl font-bold">{output.judul_luaran}</h1>

                        <div className="my-6 grid grid-cols-1 gap-6 border-t border-b border-zinc-100 py-4 md:grid-cols-2 dark:border-zinc-800">
                            <div>
                                <span className="block text-xs text-zinc-500">Status Verifikasi</span>
                                <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 capitalize dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {output.status_verifikasi}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            {/* Menggunakan komponen Button standard UI dengan variant standard */}
                            <Link href={route('journals.index')}>
                                <Button variant="outline">Kembali ke Katalog</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
