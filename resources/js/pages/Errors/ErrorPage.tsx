import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Globe, Home, Mail, RefreshCw, Share2 } from 'lucide-react';

type ErrorCode = 404 | 403 | 500;

type ActionType = 'home' | 'retry';

const ERROR_CONFIG: Record<
    ErrorCode,
    {
        label: string;
        title: string;
        description: string;
        action: { type: ActionType; text: string };
    }
> = {
    404: {
        label: 'NOT FOUND',
        title: 'Halaman Tidak\nDitemukan',
        description:
            'Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan. Silahkan kembali ke beranda atau periksa kembali alamat URL anda.',
        action: { type: 'home', text: 'Kembali ke Beranda' },
    },
    403: {
        label: 'FORBIDDEN ACCESS',
        title: 'Akses Dilarang',
        description:
            'Mohon maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silahkan hubungi administrator jika anda merasa ini adalah kesalahan.',
        action: { type: 'home', text: 'Kembali ke Beranda' },
    },
    500: {
        label: 'SERVER ERROR',
        title: 'Kesalahan Server\nInternal',
        description:
            'Terjadi masalah pada sistem kami. Tim teknis kami sedang berusaha memperbaikinya untuk memastikan akses penelitian Anda tidak terganggu lebih lama.',
        action: { type: 'retry', text: 'Coba Lagi Nanti' },
    },
};

/**
 * ErrorPage Component
 *
 * Display custom error pages for:
 * - 403 Forbidden
 * - 404 Not Found
 * - 500 Internal Server Error
 *
 * Features:
 * - Dynamic error content based on status code
 * - Responsive layout
 * - Custom navbar and footer
 * - Retry or back-to-home action
 * - Google Fonts integration
 *
 * Error Configuration:
 * Each error code contains:
 * - label
 * - title
 * - description
 * - action button
 *
 * Supported Actions:
 * - home  -> redirect to homepage
 * - retry -> go back to previous page
 *
 * Props:
 * - code: ErrorCode
 *   Value from Inertia page props.
 *
 * Example:
 * <ErrorPage />
 *
 * Notes:
 * - Unsupported codes automatically fallback to 404.
 * - Uses Tailwind CSS for styling.
 * - Uses Lucide React icons.
 */

export default function ErrorPage() {
    const { code } = usePage<{ code: ErrorCode }>().props;
    const safeCode: ErrorCode = [403, 404, 500].includes(code) ? code : 404;
    const config = ERROR_CONFIG[safeCode];
    const titleLines = config.title.split('\n');

    return (
        <>
            <Head title={`${safeCode} - ${config.title.replace('\n', ' ')}`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#F5F5F3] text-[#1b1b18]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {/* Navbar */}
                <nav className="w-full bg-[#0A5C36] px-6 py-4 lg:px-10">
                    <div className="mx-auto flex max-w-7xl items-center">
                        <Link href="/" className="flex items-center gap-2" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                            <BookOpen className="h-5 w-5 text-white" />
                            <span className="text-xl font-bold text-white">Journal MU</span>
                        </Link>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex flex-1 items-center px-6 py-16 lg:px-10">
                    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Left: Error code card */}
                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-[#F0F0EE] px-12 py-20 text-center shadow-sm">
                                <p
                                    className="text-[clamp(6rem,14vw,9rem)] leading-none font-bold text-[#0A5C36]"
                                    style={{ fontFamily: '"El Messiri", sans-serif' }}
                                >
                                    {safeCode}
                                </p>
                                <div className="mx-auto mt-4 h-px w-24 bg-gray-300" />
                                <p className="mt-4 text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">{config.label}</p>
                            </div>
                        </div>

                        {/* Right: Description */}
                        <div className="flex flex-col gap-6">
                            <h1
                                className="text-[clamp(2rem,5vw,3rem)] leading-tight font-bold text-[#0A5C36]"
                                style={{ fontFamily: '"El Messiri", sans-serif' }}
                            >
                                {titleLines.map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < titleLines.length - 1 && <br />}
                                    </span>
                                ))}
                            </h1>

                            <p className="max-w-md text-base leading-relaxed text-gray-600">{config.description}</p>

                            <div>
                                {config.action.type === 'home' ? (
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#0A5C36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084d2d] active:scale-95"
                                    >
                                        <Home className="h-4 w-4" />
                                        {config.action.text}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => window.history.back()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#0A5C36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084d2d] active:scale-95"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {config.action.text}
                                    </button>
                                )}
                            </div>

                            <hr className="border-gray-200" />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full bg-[#E8E8E5] px-6 py-10 lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col gap-3">
                                <Link href="/" className="text-xl font-bold text-[#0A5C36]" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                    Journal MU
                                </Link>
                                <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                                    Memajukan batas ilmu pengetahuan melalui publikasi penelitian berkualitas tinggi.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Policies</p>
                                <div className="flex flex-col gap-2">
                                    <Link href="#" className="text-sm text-gray-500 underline-offset-2 hover:text-[#0A5C36] hover:underline">
                                        Open Access Policy
                                    </Link>
                                    <Link href="#" className="text-sm text-gray-500 underline-offset-2 hover:text-[#0A5C36] hover:underline">
                                        Privacy Policy
                                    </Link>
                                    <Link href="#" className="text-sm text-gray-500 underline-offset-2 hover:text-[#0A5C36] hover:underline">
                                        Terms of Service
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Resources</p>
                                <div className="flex flex-col gap-2">
                                    <Link href="#" className="text-sm text-gray-500 underline-offset-2 hover:text-[#0A5C36] hover:underline">
                                        Institutional Access
                                    </Link>
                                    <Link href="#" className="text-sm text-gray-500 underline-offset-2 hover:text-[#0A5C36] hover:underline">
                                        Contact Support
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Social</p>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="text-gray-400 transition hover:text-[#0A5C36]" aria-label="Website">
                                        <Globe className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="text-gray-400 transition hover:text-[#0A5C36]" aria-label="Email">
                                        <Mail className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="text-gray-400 transition hover:text-[#0A5C36]" aria-label="Share">
                                        <Share2 className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-300 pt-6">
                            <p className="text-xs text-gray-400">
                                © 2024 Journal MU. All rights reserved. Institutional Partner of Global Research Network.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
