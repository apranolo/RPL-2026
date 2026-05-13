import { useForm } from '@inertiajs/react'

export default function FormReview({ assignment }: any) {

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
        <div className="p-6 max-w-2xl mx-auto">

            <h1 className="text-2xl font-bold mb-6">
                Form Penilaian Proposal
            </h1>

            <form onSubmit={submit} className="space-y-5">

                <div>
                    <label className="block mb-2 font-medium">
                        Nilai
                    </label>

                    <input
                        type="number"
                        value={data.score}
                        onChange={(e) => setData('score', e.target.value)}
                        className="w-full border rounded p-2"
                    />

                    {errors.score && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.score}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Feedback
                    </label>

                    <textarea
                        value={data.feedback}
                        onChange={(e) => setData('feedback', e.target.value)}
                        className="w-full border rounded p-2"
                        rows={5}
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Recommendation
                    </label>

                    <textarea
                        value={data.recommendation}
                        onChange={(e) =>
                            setData('recommendation', e.target.value)
                        }
                        className="w-full border rounded p-2"
                        rows={4}
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                    Submit Review
                </button>

            </form>
        </div>
    )
}