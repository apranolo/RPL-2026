import { useForm } from '@inertiajs/react'

export default function Review({ assignment }: any) {

    const { data, setData, post, processing, errors } = useForm({
        score: '',
        feedback: '',
        recommendation: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        post(route('reviewer.assignments.submit', assignment.id))
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">

            <h1 className="text-2xl font-bold mb-6">
                Form Penilaian Proposal
            </h1>

            {/* Informasi Proposal */}
            <div className="border rounded p-4 mb-6 bg-gray-50">
                <h2 className="font-semibold text-lg mb-2">
                    Informasi Proposal
                </h2>

                <p>
                    <strong>Judul:</strong>{' '}
                    {assignment.registration?.pembinaan?.title}
                </p>

                <p>
                    <strong>Reviewer:</strong>{' '}
                    {assignment.reviewer_id}
                </p>
            </div>

            {/* Form Review */}
            <form onSubmit={submit} className="space-y-5">

                {/* Score */}
                <div>
                    <label className="block mb-2 font-medium">
                        Nilai
                    </label>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={data.score}
                        onChange={(e) =>
                            setData('score', e.target.value)
                        }
                        className="w-full border rounded p-2"
                    />

                    {errors.score && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.score}
                        </div>
                    )}
                </div>

                {/* Feedback */}
                <div>
                    <label className="block mb-2 font-medium">
                        Feedback
                    </label>

                    <textarea
                        rows={5}
                        value={data.feedback}
                        onChange={(e) =>
                            setData('feedback', e.target.value)
                        }
                        className="w-full border rounded p-2"
                    />

                    {errors.feedback && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.feedback}
                        </div>
                    )}
                </div>

                {/* Recommendation */}
                <div>
                    <label className="block mb-2 font-medium">
                        Recommendation
                    </label>

                    <textarea
                        rows={4}
                        value={data.recommendation}
                        onChange={(e) =>
                            setData('recommendation', e.target.value)
                        }
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                >
                    Submit Review
                </button>

            </form>
        </div>
    )
}