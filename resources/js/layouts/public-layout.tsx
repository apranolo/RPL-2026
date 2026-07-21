import logoUrl from '@/assets/logo_dark.png';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;
    const pageProps = usePage<any>().props;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            {/* NAVBAR */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-1 items-center gap-8">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                Journal MU
                            </span>
                        </Link>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <Link href={route('events.index')} className="transition-colors hover:text-[#FCEE1F]">
                                Events
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="ghost" className="px-2 text-white hover:bg-white/20 hover:text-white sm:px-4">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button className="border-0 bg-[#FCEE1F] px-3 font-bold text-black hover:bg-[#e3d51b] sm:px-4">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-16">{children}</main>

            {/* FOOTER */}
            <footer className="mt-auto bg-[#0f172a] py-12 text-center text-sm text-gray-500">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-center gap-6">
                        <a href="#" className="hover:text-white">
                            About Us
                        </a>
                        <a href="#" className="hover:text-white">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-white">
                            Contact Support
                        </a>
                    </div>
                    <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Higher Education Research Network.</p>
                    {pageProps.laravelVersion && pageProps.phpVersion && (
                        <p className="mt-2">
                            Laravel v{pageProps.laravelVersion} (PHP v{pageProps.phpVersion})
                        </p>
                    )}
                </div>
            </footer>
        </div>
    );
}
