import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    assignmentId: number;
}

export default function Recommendation({ assignmentId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        recommendation: '',
        overall_comment: '',
        scores: {
            originality: 1,
            methodology: 1,
            novelty: 1,
            clarity: 1,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('review.submitRecommendation', assignmentId));
    };

    const saveDraft = () => {
        post(route('review.saveDraft', assignmentId));
    };

    return (
        <AppLayout>
            <Head title="Reviewer Recommendation" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold">
                        Final Recommendation
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recommendation */}
                        <div>
                            <label className="mb-2 block font-medium">
                                Recommendation
                            </label>

                            <select
                                value={data.recommendation}
                                onChange={(e) =>
                                    setData('recommendation', e.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="">
                                    Select Recommendation
                                </option>

                                <option value="accept">
                                    Accept
                                </option>

                                <option value="minor_revision">
                                    Minor Revision
                                </option>

                                <option value="major_revision">
                                    Major Revision
                                </option>

                                <option value="reject">
                                    Reject
                                </option>
                            </select>

                            {errors.recommendation && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.recommendation}
                                </p>
                            )}
                        </div>

                        {/* Rubric Scores */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">
                                Rubric Scores
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(data.scores).map(
                                    ([key, value]) => (
                                        <div key={key}>
                                            <label className="mb-2 block capitalize">
                                                {key}
                                            </label>

                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={value}
                                                onChange={(e) =>
                                                    setData('scores', {
                                                        ...data.scores,
                                                        [key]: Number(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full rounded-lg border p-3"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Overall Comment */}
                        <div>
                            <label className="mb-2 block font-medium">
                                Overall Comment
                            </label>

                            <textarea
                                rows={6}
                                value={data.overall_comment}
                                onChange={(e) =>
                                    setData(
                                        'overall_comment',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                                placeholder="Masukkan komentar reviewer..."
                            />

                            {errors.overall_comment && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.overall_comment}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={saveDraft}
                                className="rounded-lg border px-5 py-2"
                            >
                                Save Draft
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-black px-5 py-2 text-white"
                            >
                                Submit Recommendation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}