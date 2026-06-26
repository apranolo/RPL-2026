import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Registration {
    id: number;
    status: string;
    journal: {
        title: string;
        issn: string | null;
    };
    user: {
        name: string;
        email: string;
    };
    registered_at: string;
}

interface Props {
    registration: Registration;
}

export default function DeskReview({ registration }: Props) {
    const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');

    const { data, setData, post, processing, errors } = useForm({
        decision: '' as 'approved' | 'rejected' | '',
        rejection_reason: '',
    });

    const handleDecisionChange = (value: 'approved' | 'rejected') => {
        setDecision(value);
        setData({
            decision: value,
            rejection_reason: value === 'approved' ? '' : data.rejection_reason,
        });
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('editorial.desk.desk-review', { registration: registration.id }));
    };

    const isAlreadyProcessed = registration.status !== 'pending';

    return (
        <div className="mx-auto max-w-2xl p-6">

            {/* Header */}
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Desk Review</h1>
            <p className="mb-6 text-sm text-gray-500">
                Tinjau submission dan berikan keputusan penerimaan atau penolakan.
            </p>

            {/* Info Submission */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Detail Submission
                </h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Jurnal</span>
                        <span className="font-medium text-gray-900">{registration.journal.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">ISSN</span>
                        <span className="font-medium text-gray-900">{registration.journal.issn ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Pengelola</span>
                        <span className="font-medium text-gray-900">{registration.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Daftar</span>
                        <span className="font-medium text-gray-900">{registration.registered_at}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge status={registration.status} />
                    </div>
                </div>
            </div>

            {/* Sudah diproses */}
            {isAlreadyProcessed && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    Submission ini sudah diproses dan tidak dapat diubah lagi.
                </div>
            )}

            {/* Form Keputusan */}
            {!isAlreadyProcessed && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Keputusan <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            {/* Accept */}
                            <button
                                type="button"
                                onClick={() => handleDecisionChange('approved')}
                                className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${decision === 'approved'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                ✓ Terima untuk Review
                            </button>

                            {/* Reject */}
                            <button
                                type="button"
                                onClick={() => handleDecisionChange('rejected')}
                                className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${decision === 'rejected'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                ✕ Tolak Submission
                            </button>
                        </div>

                        {errors.decision && (
                            <p className="mt-1 text-sm text-red-600">{errors.decision}</p>
                        )}
                    </div>

                    {/* Catatan penolakan — wajib jika reject */}
                    {decision === 'rejected' && (
                        <div>
                            <label
                                htmlFor="rejection_reason"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Catatan Penolakan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="rejection_reason"
                                rows={4}
                                value={data.rejection_reason}
                                onChange={(e) => setData('rejection_reason', e.target.value)}
                                placeholder="Jelaskan alasan penolakan submission ini..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.rejection_reason && (
                                <p className="mt-1 text-sm text-red-600">{errors.rejection_reason}</p>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing || !decision}
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
}

// Helper component badge status
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        approved: { label: 'Diterima', className: 'bg-green-100 text-green-800' },
        rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
    };
    const { label, className } = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}