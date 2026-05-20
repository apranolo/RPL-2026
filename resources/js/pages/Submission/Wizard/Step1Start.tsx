import { Head, useForm } from '@inertiajs/react';

interface Journal {
    id: number;
    title: string;
}

interface Props {
    journals: Journal[];
}

export default function Step1Start({ journals }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        journal_id: string;
        agreement: boolean;
    }>({
        journal_id: '',
        agreement: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('submission.step1.store'));
    };

    return (
        <>
            <Head title="Submission Step 1" />

            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h1 className="text-2xl font-bold mb-2">
                        Wizard Submission - Step 1
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Pilih jurnal tujuan dan setujui syarat serta lisensi
                        sebelum melanjutkan proses submission.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Pilihan Jurnal */}
                        <div className="mb-5">
                            <label className="block font-medium mb-2">
                                Pilih Jurnal
                            </label>

                            <select
                                value={data.journal_id}
                                onChange={(e) =>
                                    setData('journal_id', e.target.value)
                                }
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="">-- Pilih Jurnal --</option>

                                {journals.map((journal) => (
                                    <option key={journal.id} value={journal.id}>
                                        {journal.title}
                                    </option>
                                ))}
                            </select>

                            {errors.journal_id && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.journal_id}
                                </p>
                            )}
                        </div>

                        {/* Persetujuan */}
                        <div className="mb-6">
                            <label className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.agreement}
                                    onChange={(e) =>
                                        setData('agreement', e.target.checked)
                                    }
                                    className="mt-1"
                                />

                                <span className="text-sm text-gray-700">
                                    Saya menyetujui syarat, ketentuan,
                                    dan lisensi submission jurnal.
                                </span>
                            </label>

                            {errors.agreement && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.agreement}
                                </p>
                            )}
                        </div>

                        {/* Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                            >
                                Lanjut Step 2
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}