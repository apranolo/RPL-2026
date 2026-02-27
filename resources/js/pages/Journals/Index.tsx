/**
 * Public Journals Index Component
 *
 * @description
 * A public-facing list view page for browsing all active journals.
 * No authentication required - accessible from the welcome page.
 *
 * @features
 * - Search by title, ISSN, or e-ISSN
 * - Filter by university
 * - Filter by SINTA rank (1-6)
 * - Filter by scientific field
 * - Paginated results with navigation
 * - View journal details
 * - Premium modern design
 *
 * @route GET /journals
 */
import JournalCard from '@/components/journal-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, Home, Search } from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string;
    university: {
        id: number;
        name: string;
    };
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: string | null;
    sinta_rank_label: string;
}

interface University {
    id: number;
    name: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface FilterOption {
    value: string | number;
    label: string;
}

interface Props {
    journals: {
        data: Journal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        university_id?: number;
        sinta_rank?: string;
        scientific_field_id?: number;
        indexation?: string;
    };
    universities: University[];
    scientificFields: ScientificField[];
    sintaRanks: FilterOption[];
    indexationOptions: FilterOption[];
}

export default function JournalsIndex({ journals, filters, universities, scientificFields, sintaRanks, indexationOptions }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityFilter, setUniversityFilter] = useState(filters.university_id?.toString() || '');
    const [sintaRankFilter, setSintaRankFilter] = useState(filters.sinta_rank || '');
    const [scientificFieldFilter, setScientificFieldFilter] = useState(filters.scientific_field_id?.toString() || '');
    const [indexationFilter, setIndexationFilter] = useState(filters.indexation || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('journals.index'),
            {
                search,
                university_id: universityFilter,
                sinta_rank: sintaRankFilter,
                scientific_field_id: scientificFieldFilter,
                indexation: indexationFilter,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setUniversityFilter('');
        setSintaRankFilter('');
        setScientificFieldFilter('');
        setIndexationFilter('');
        router.get(route('journals.index'));
    };

    const hasActiveFilters = search || universityFilter || sintaRankFilter || scientificFieldFilter || indexationFilter;

    return (
        <>
            <Head title="Browse Journals - JurnalMu">
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
                            <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <img src="logo_dark.png" alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                                </div>
                                <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                    Journal MU
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="border-0 bg-white font-bold text-[#079C4E] hover:bg-gray-100">
                                        <Home className="mr-2 h-4 w-4" />
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

                {/* MAIN CONTENT */}
                <main className="pt-16">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1
                                className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
                                style={{ fontFamily: '"El Messiri", serif' }}
                            >
                                Browse <span className="text-[#FCEE1F]">All Journals</span>
                            </h1>
                            <p className="max-w-2xl text-lg text-emerald-50">
                                Explore {journals.total} academic journals from Muhammadiyah Universities across Indonesia
                            </p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                            <form onSubmit={handleSearch} className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by journal title, ISSN, or e-ISSN..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-12 pl-12 text-base"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                    {/* University Filter */}
                                    <UniversityFilterCombobox
                                        universities={universities}
                                        value={universityFilter}
                                        onValueChange={setUniversityFilter}
                                        className="h-12"
                                    />

                                    {/* Scientific Field Filter */}
                                    <Select
                                        value={scientificFieldFilter || 'all'}
                                        onValueChange={(value) => setScientificFieldFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Scientific Fields" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Scientific Fields</SelectItem>
                                            {scientificFields.map((field) => (
                                                <SelectItem key={field.id} value={field.id.toString()}>
                                                    {field.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* SINTA Rank Filter */}
                                    <Select
                                        value={sintaRankFilter || 'all'}
                                        onValueChange={(value) => setSintaRankFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All SINTA Ranks" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All SINTA Ranks</SelectItem>
                                            {sintaRanks.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Indexation Filter */}
                                    <Select
                                        value={indexationFilter || 'all'}
                                        onValueChange={(value) => setIndexationFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Indexation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Indexations</SelectItem>
                                            {indexationOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-2">
                                        <Button type="submit" className="h-12 flex-1 bg-[#079C4E] hover:bg-[#068A42]">
                                            Search
                                        </Button>
                                        {hasActiveFilters && (
                                            <Button type="button" variant="outline" onClick={handleClearFilters} className="h-12">
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                        {/* Results Count */}
                        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            Showing {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0} to{' '}
                            {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                        </div>

                        {/* Journal Grid */}
                        {journals.data.length === 0 ? (
                            <div className="rounded-2xl bg-white p-16 text-center shadow-lg dark:bg-zinc-900">
                                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No journals found</h3>
                                <p className="mb-6 text-gray-600 dark:text-gray-400">
                                    {hasActiveFilters ? 'Try adjusting your search filters' : 'No journals are currently available'}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {journals.data.map((journal) => (
                                    <JournalCard
                                        key={journal.id}
                                        id={journal.id}
                                        title={journal.title}
                                        sinta_rank={journal.sinta_rank}
                                        issn={journal.issn}
                                        e_issn={journal.e_issn}
                                        university={journal.university.name}
                                        external_url={journal.url}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {journals.last_page > 1 && (
                            <div className="mt-12 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {journals.current_page} of {journals.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {journals.links.map((link, index) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                                    Previous
                                                </Button>
                                            );
                                        }
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    Next
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                className={link.active ? 'bg-[#079C4E] hover:bg-[#068A42]' : ''}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex justify-center gap-6">
                            <Link href={route('home')} className="hover:text-white">
                                Home
                            </Link>
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
                    </div>
                </footer>
            </div>
        </>
    );
}
