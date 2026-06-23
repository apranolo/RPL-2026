import { useForm } from '@inertiajs/react';

export default function Review({ assignment }: any) {
    const { data, setData, post, processing, errors } = useForm({
        score: '',
        feedback: '',
        recommendation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('reviewer.assignments.submit', assignment.id));
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Form Penilaian Proposal</h1>

            {/* Informasi Proposal */}
            <div className="mb-6 rounded border bg-gray-50 p-4">
                <h2 className="mb-2 text-lg font-semibold">Informasi Proposal</h2>

                <p>
                    <strong>Judul:</strong> {assignment.registration?.pembinaan?.title}
                </p>

                <p>
                    <strong>Reviewer:</strong> {assignment.reviewer_id}
                </p>
            </div>

            {/* Form Review */}
            <form onSubmit={submit} className="space-y-5">
                {/* Score */}
                <div>
                    <label className="mb-2 block font-medium">Nilai</label>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={data.score}
                        onChange={(e) => setData('score', e.target.value)}
                        className="w-full rounded border p-2"
                    />

                    {errors.score && <div className="mt-1 text-sm text-red-500">{errors.score}</div>}
                </div>

                {/* Feedback */}
                <div>
                    <label className="mb-2 block font-medium">Feedback</label>

                    <textarea
                        rows={5}
                        value={data.feedback}
                        onChange={(e) => setData('feedback', e.target.value)}
                        className="w-full rounded border p-2"
                    />

                    {errors.feedback && <div className="mt-1 text-sm text-red-500">{errors.feedback}</div>}
                </div>

                {/* Recommendation */}
                <div>
                    <label className="mb-2 block font-medium">Recommendation</label>

                    <textarea
                        rows={4}
                        value={data.recommendation}
                        onChange={(e) => setData('recommendation', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={processing} className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
                    Submit Review
                </button>
            </form>
        </div>
    );
}
