import { Head, Link } from '@inertiajs/react';

export default function Error403() {
    return (
        <>
            <Head title="403 - Forbidden" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-6xl font-bold text-gray-900">403</h1>
                    <h2>Access Forbidden</h2>

                    {/* Message */}
                    <p className="mb-8 text-gray-600">
                        You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.
                    </p>

                    {/* Actions */}
                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard" className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
