import { useForm } from '@inertiajs/react';

export default function Review({ assignment }: any) {
    const { data, setData, post, processing, errors } = useForm({
        score: '',
        feedback: '',
        recommendation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/reviewer/assignments/${assignment.id}/submit-review`);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Form Review Reviewer
            </h1>

            <form onSubmit={submit} className="space-y-4">

                <div>
                    <label>Score</label>

                    <input
                        type="number"
                        className="border p-2 w-full"
                        value={data.score}
                        onChange={(e) =>
                            setData('score', e.target.value)
                        }
                    />

                    {errors.score && (
                        <div className="text-red-500">
                            {errors.score}
                        </div>
                    )}
                </div>

                <div>
                    <label>Catatan Evaluasi</label>

                    <textarea
                        className="border p-2 w-full"
                        rows={5}
                        value={data.feedback}
                        onChange={(e) =>
                            setData('feedback', e.target.value)
                        }
                    />

                    {errors.feedback && (
                        <div className="text-red-500">
                            {errors.feedback}
                        </div>
                    )}
                </div>

                <div>
                    <label>Recommendation</label>

                    <textarea
                        className="border p-2 w-full"
                        rows={4}
                        value={data.recommendation}
                        onChange={(e) =>
                            setData('recommendation', e.target.value)
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
}