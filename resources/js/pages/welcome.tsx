import logoUrl from '@/assets/logo_dark.png';
import JournalCard from '@/components/journal-card';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';

interface WelcomeProps extends SharedData {
    laravelVersion: string;
    phpVersion: string;
    featuredJournals: Array<{
        id: number;
        title: string;
        sinta_rank: string;
        sinta_rank_label: string;
        issn: string;
        e_issn: string;
        university: string;
        cover_image_url?: string;
        indexation_labels?: string[];
    }>;
    sintaStats: Record<string, number>;
    totalUniversities: number;
    totalJournals: number;
}

export default function Welcome() {
    const { auth, featuredJournals, sintaStats } = usePage<WelcomeProps>().props;
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            window.location.href = route('journals.index', { search: searchQuery });
        }
    };

    return (
        <>
            <Head title="JurnalMu - Muhammadiyah Journal Portal">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#079C4E] text-white backdrop-blur-md transition-all">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                Journal MU
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button className="border-0 bg-[#FCEE1F] font-bold text-black hover:bg-[#e3d51b]">Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <div className="relative pt-16">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] pb-32">
                        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                        <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>

                        <div
                            className="absolute inset-0 opacity-5"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                        ></div>
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                        <h1
                            className="font-heading mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl"
                            style={{ fontFamily: '"El Messiri", serif' }}
                        >
                            Discover Muhammadiyah's <br /> <span className="text-[#FCEE1F]">Scientific Excellence</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-emerald-50 sm:text-xl">
                            The central portal for academic journals, research papers, and scholarly works from Muhammadiyah Universities across
                            Indonesia.
                        </p>

                        {/* Search Bar */}
                        <div className="mx-auto max-w-2xl">
                            <div className="relative flex items-center rounded-full shadow-2xl">
                                <Search className="absolute left-4 h-6 w-6 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for journals, titles, or ISSN..."
                                    className="h-14 w-full rounded-full border-0 bg-white pr-4 pl-12 text-gray-900 placeholder:text-gray-500 focus:ring-4 focus:ring-[#FCEE1F]/50 sm:text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button
                                    className="absolute top-2 right-2 h-10 rounded-full bg-[#1A2A75] px-6 text-white hover:bg-[#131f57]"
                                    onClick={handleSearch}
                                >
                                    Search
                                </Button>
                            </div>
                            <div className="mt-4 flex justify-center gap-4 text-sm text-emerald-100">
                                <span>Can't find what you're looking for?</span>
                                <Link href={route('browse.universities')} className="font-semibold text-[#FCEE1F] hover:underline">
                                    Browse by University
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* STATS / ACCREDITATION CARDS - Temporarily hidden per meeting notes (Feb 11) */}
                    {/* TODO: Re-enable after finalizing chart design */}
                    {/*
                    <div className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {[1, 2, 3, 4, 5, 6].map((score) => (
                                <Link
                                    key={score}
                                    href={route('journals.index', { sinta_rank: `sinta_${score}` })}
                                    className="group cursor-pointer overflow-hidden rounded-xl border-b-4 bg-white p-4 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-800"
                                    style={{ borderColor: score <= 2 ? '#E11A1F' : score <= 4 ? '#FCEE1F' : '#1A2A75' }}
                                >
                                    <div className="mb-1 text-xs font-bold text-gray-400 uppercase">Accredited</div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">SINTA {score}</span>
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 transition-colors group-hover:bg-[#079C4E] group-hover:text-white dark:bg-zinc-700 dark:text-gray-300">
                                            {sintaStats[`sinta_${score}`] || 0} Journals
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    */}
                </div>

                {/* MAIN CONTENT AREA */}
                <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    {/* Featured Journals Section */}
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h2 className="font-heading text-3xl font-bold text-[#079C4E]" style={{ fontFamily: '"El Messiri", serif' }}>
                                Featured Journals
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">High-impact research from our network.</p>
                        </div>
                        <Link href={route('journals.index')} className="group flex items-center font-semibold text-[#1A2A75] hover:text-[#079C4E]">
                            View All Journals
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredJournals.map((journal) => (
                            <JournalCard
                                key={journal.id}
                                id={journal.id}
                                title={journal.title}
                                sinta_rank={journal.sinta_rank}
                                issn={journal.issn}
                                e_issn={journal.e_issn}
                                university={journal.university}
                                indexation_labels={journal.indexation_labels}
                            />
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-24 overflow-hidden rounded-3xl bg-[#1A2A75] text-white shadow-2xl">
                        <div className="relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] px-6 py-16 text-center sm:px-12 lg:py-20">
                            <div className="relative z-10 mx-auto max-w-3xl">
                                <h2
                                    className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
                                    style={{ fontFamily: '"El Messiri", serif' }}
                                >
                                    Publish Your Research With Us
                                </h2>
                                <p className="mt-4 text-lg text-blue-100">
                                    Join thousands of authors contributing to the advancement of science and technology through Muhammadiyah's network
                                    of accredited journals.
                                </p>
                                <div className="mt-8 flex justify-center gap-4">
                                    <Button size="lg" className="bg-[#FCEE1F] px-8 text-lg font-bold text-[#1A2A75] hover:bg-[#e3d51b]">
                                        Submit Manuscript
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-white px-8 text-white hover:bg-white hover:text-[#1A2A75]">
                                        Author Guidelines
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
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
                        <p className="mt-2">
                            Laravel v{usePage<WelcomeProps>().props.laravelVersion} (PHP v{usePage<WelcomeProps>().props.phpVersion})
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
