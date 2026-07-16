import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import ReviewerCandidateCard from '@/components/ReviewerCandidateCard';

// Definisi tipe data sesuai standar TypeScript
interface Submission {
    id: number;
    title: string;
    abstract: string;
}

interface Candidate {
    id: number;
    name: string;
    institution: string;
    skills: string[];
    active_reviews: number;
    completed_reviews: number;
}

interface Props {
    submission: Submission;
    candidates: Candidate[];
}

// Navigasi atas (Breadcrumbs)
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Naskah', href: '/editorial/inbox' },
    { title: 'Undang Reviewer', href: '#' },
];

export default function InviteReviewer({ submission, candidates }: Props) {
    const { post, processing } = useForm();

    // Fungsi untuk mengirim data ke Controller saat tombol "Undang" ditekan
    const handleInvite = (reviewerId: number) => {
        post(route('review.invite', {
            submission_id: submission.id,
            reviewer_id: reviewerId
        }), {
            preserveScroll: true, // Mencegah layar lompat ke atas saat loading
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pilih Kandidat Reviewer" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                
                {/* Header: Info Naskah */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-5">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Pilih Kandidat Reviewer
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                            <strong>Naskah:</strong> {submission.title}
                        </p>
                    </div>
                </div>

                {/* Grid: Daftar Kandidat */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Rekomendasi Pakar</h2>
                    
                    {!candidates || candidates.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-muted-foreground">Tidak ada kandidat reviewer yang tersedia saat ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map((candidate) => (
                                <ReviewerCandidateCard 
                                    key={candidate.id}
                                    id={candidate.id}
                                    name={candidate.name}
                                    institution={candidate.institution}
                                    skills={candidate.skills}
                                    activeReviews={candidate.active_reviews}
                                    completedReviews={candidate.completed_reviews}
                                    onInvite={handleInvite}
                                    processing={processing}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}