import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Journal {
    id: number;
    name: string;
}

interface Pembinaan {
    id: number;
    name: string;
}

interface Registration {
    id: number;
    status: string;
    journal: Journal;
    pembinaan: Pembinaan;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string;
    registration: Registration;
}

interface Props {
    assignments: {
        data: Assignment[];
        current_page: number;
        last_page: number;
    };
}

export default function EvaluationIndex({ assignments }: Props) {
    return (
        <AppLayout>
            <Head title="Daftar Evaluasi" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Daftar Proposal yang Perlu Dievaluasi</h1>

                {assignments.data.length === 0 ? (
                    <p className="text-gray-500">Tidak ada proposal yang perlu dievaluasi.</p>
                ) : (
                    <div className="space-y-4">
                        {assignments.data.map((assignment) => (
                            <div key={assignment.id} className="border rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold text-lg">
                                            {assignment.registration?.journal?.name ?? '-'}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Program: {assignment.registration?.pembinaan?.name ?? '-'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Status: {assignment.status}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Ditugaskan: {new Date(assignment.assigned_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}