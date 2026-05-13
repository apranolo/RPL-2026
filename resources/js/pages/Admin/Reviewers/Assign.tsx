/**
 * ReviewerAssign Component
 *
 * @description
 * Halaman antarmuka untuk Admin melakukan penunjukan (assignment) reviewer 
 * ke sebuah proposal yang tersedia.
 *
 * @component
 *
 * @returns The rendered assign reviewer form page
 *
 * @features
 * - Form penunjukan reviewer ke proposal
 * - Dropdown pilihan proposal dan reviewer
 * - Validasi error state dari server
 *
 * @route GET /admin/reviewer/assign
 *
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/layouts/app-layout
 * @requires lucide-react
 *
 * @author FARHAN NUR ICHSAN
 * @filepath /resources/js/pages/Admin/Reviewer/Assign.tsx
 */
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ClipboardList, UserCheck, Users } from 'lucide-react';
import { FormEventHandler } from 'react';

// Mendefinisikan tipe data untuk props yang dikirim dari Controller
interface Proposal {
    id: number;
    title: string;
}

interface Reviewer {
    id: number;
    name: string;
}

interface Props {
    proposals: Proposal[];
    reviewers: Reviewer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Reviewer',
        href: '/admin/reviewers',
    },
    {
        title: 'Assign Reviewer',
        href: '#',
    },
];

export default function AssignReviewer({ proposals = [], reviewers = [] }: Props) {
    // Inisialisasi Inertia form
    const { data, setData, post, processing, errors } = useForm({
        proposal_id: '',
        reviewer_id: '',
    });

    // Handler ketika form disubmit
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Sesuaikan route dengan nama route post yang Anda buat di web.php
        post(route('admin.assign.store')); 
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Reviewer - Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    
                    {/* Header Section */}
                    <div className="mb-8 flex items-center gap-4 border-b pb-6 dark:border-neutral-800">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                            <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Penunjukan Reviewer</h1>
                            <p className="text-sm text-muted-foreground">
                                Tugaskan reviewer yang tepat untuk menilai proposal yang diajukan.
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="mx-auto max-w-2xl rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Input: Proposal */}
                            <div className="space-y-2">
                                <label htmlFor="proposal_id" className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    Pilih Proposal
                                </label>
                                <select
                                    id="proposal_id"
                                    name="proposal_id"
                                    value={data.proposal_id}
                                    onChange={(e) => setData('proposal_id', e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>-- Pilih Proposal --</option>
                                    {proposals.map((proposal) => (
                                        <option key={proposal.id} value={proposal.id}>
                                            {proposal.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.proposal_id && (
                                    <p className="text-sm text-red-500">{errors.proposal_id}</p>
                                )}
                            </div>

                            {/* Input: Reviewer */}
                            <div className="space-y-2">
                                <label htmlFor="reviewer_id" className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    Pilih Reviewer
                                </label>
                                <select
                                    id="reviewer_id"
                                    name="reviewer_id"
                                    value={data.reviewer_id}
                                    onChange={(e) => setData('reviewer_id', e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>-- Pilih Reviewer --</option>
                                    {reviewers.map((reviewer) => (
                                        <option key={reviewer.id} value={reviewer.id}>
                                            {reviewer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.reviewer_id && (
                                    <p className="text-sm text-red-500">{errors.reviewer_id}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('admin.reviewers.index')}>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Tugaskan Reviewer'}
                                </Button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}