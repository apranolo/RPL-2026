/**
 * @route GET /journals/{journal}
 * @description Public journal detail page (Garuda Style)
 * @features Display comprehensive journal information, article filtering, stats, and 3-column layout
 */

import logoUrl from '@/assets/logo_dark.png';
import { SintaBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Article, type Journal, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, BookOpen, Calendar, ChevronRight, Download, FileText, Globe, Info, Mail, MapPin, Search, Target, User } from 'lucide-react';
import React, { useState } from 'react';
import Chart from 'react-apexcharts';

interface JournalsShowProps extends SharedData {
    journal: Journal & {
        articles_count?: number;
    };
    articles: {
        data: Article[];
        links: any[]; // Laravel pagination links array (numbered)
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
    };
    articlesByYear: Array<{ year: number; count: number }>;
    issuesList: Array<{ volume: string; issue: string; label: string; year: string }>;
    queries: Record<string, any>;
}

export default function JournalsShow() {
    const { journal, articles, articlesByYear, issuesList, auth, queries } = usePage<JournalsShowProps>().props;
    const [searchQuery, setSearchQuery] = useState(queries.search || '');
    const [yearFrom, setYearFrom] = useState<string>(queries.year_start || '');
    const [yearTo, setYearTo] = useState<string>(queries.year_end || '');
    const [showAbout, setShowAbout] = useState(false);
    const [showScope, setShowScope] = useState(false);

    // Dynamic year range from article data
    const minYear =
        articlesByYear.length > 0 ? Math.min(...articlesByYear.map((d) => d.year)) : (journal.first_published_year ?? new Date().getFullYear() - 5);
    const maxYear = articlesByYear.length > 0 ? Math.max(...articlesByYear.map((d) => d.year)) : new Date().getFullYear();

    // Chart Configuration for "Articles Per Year"
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            id: 'articles-chart',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        xaxis: {
            categories: articlesByYear.map((d) => d.year),
            labels: { style: { fontSize: '10px' } },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: { opacity: 0.5 },
        colors: ['hsl(var(--primary))'],
        grid: { show: true, borderColor: 'hsl(var(--border))' },
        theme: {
            mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        },
    };

    const chartSeries = [
        {
            name: 'Articles',
            data: articlesByYear.map((d) => d.count),
        },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('journals.show', journal.id), { ...queries, search: searchQuery, page: 1 }, { preserveScroll: true, preserveState: true });
    };

    const handleFilter = (key: string, value: any) => {
        const newQueries = { ...queries, [key]: value, page: 1 };
        // Remove empty filters
        if (!value) delete newQueries[key];

        router.get(route('journals.show', journal.id), newQueries, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        router.get(route('journals.show', journal.id));
    };

    // Display article titles in sentence case (first word capitalised, rest lowercase)
    // We transform display-side only so raw OAI source data is preserved in the DB.
    const toSentenceCase = (str: string): string => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <>
            <Head title={`${journal.title} | JurnalMu`}>
                <meta
                    name="description"
                    content={journal.about || `View details about ${journal.title}, an academic journal published by ${journal.university.name}`}
                />
                <meta property="og:title" content={journal.title} />
                <meta property="og:description" content={journal.about || `Academic journal from ${journal.university.name}`} />
                {journal.cover_image_url && <meta property="og:image" content={journal.cover_image_url} />}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-slate-50 font-sans text-foreground dark:bg-background">
                {/* NAVBAR */}
                <nav className="fixed top-0 z-50 w-full border-b border-primary/20 bg-primary text-white shadow-sm backdrop-blur-md transition-all dark:border-primary/30 dark:bg-primary">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                                <img src={logoUrl} alt="Majelis Diktilitbang" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-heading text-2xl font-bold" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                Journal MU
                            </span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href={route('journals.index')}>
                                <Button variant="ghost" className="px-2 text-white hover:bg-white/20 hover:text-white sm:px-4">
                                    <span className="hidden sm:inline">All Journals</span>
                                    <span className="sm:hidden">Journals</span>
                                </Button>
                            </Link>
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="secondary" className="border-0 bg-white px-3 font-bold text-[#079C4E] hover:bg-gray-100 sm:px-4">
                                        Dashboard
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
                                        <Button className="border-0 bg-[#FCEE1F] px-3 font-bold text-black hover:bg-[#e3d51b] sm:px-4">
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* BREADCRUMBS */}
                <div className="mx-auto max-w-7xl px-4 pt-24 pb-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link href={route('home')} className="transition-colors hover:text-primary dark:hover:text-primary">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={route('journals.index')} className="transition-colors hover:text-primary dark:hover:text-primary">
                            Journals
                        </Link>
                        <span>/</span>
                        <span className="truncate font-medium text-foreground">{journal.title}</span>
                    </div>
                </div>

                {/* MAIN CONTENT GRID (Garuda Layout: Left Sidebar - Main - Right Sidebar) */}
                <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:px-8">
                    {/* LEFT SIDEBAR (Journal Info & Menu) - 3 Columns */}
                    <aside className="space-y-6 lg:col-span-3">
                        {/* Cover Image */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-md transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
                            <div className="aspect-[3/4] w-full bg-muted dark:bg-muted">
                                {journal.cover_image || journal.cover_image_url ? (
                                    <img
                                        src={journal.cover_image ?? journal.cover_image_url}
                                        alt={journal.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <BookOpen className="h-16 w-16 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Article Per Year Chart */}
                        <div className="rounded-xl border bg-card p-4 shadow-md transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
                            <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">Article Per Year (5 Year)</h3>
                            {articlesByYear.length > 0 ? (
                                <div className="h-40 w-full">
                                    <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />
                                </div>
                            ) : (
                                <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <FileText className="h-8 w-8 opacity-30" />
                                    <span className="text-xs">No article data yet</span>
                                </div>
                            )}
                            <div className="mt-2 text-center text-xs text-gray-400">Total: {journal.articles_count} Articles</div>
                        </div>

                        {/* Menu Links */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-md dark:border-border dark:bg-card">
                            <div className="p-0">
                                <Link
                                    href={route('journals.show', journal.id)}
                                    className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted dark:border-border dark:hover:bg-muted"
                                >
                                    <ChevronRight className="h-4 w-4" /> Home Page
                                </Link>
                                {journal.oai_pmh_url && (
                                    <a
                                        href={journal.oai_pmh_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:border-border dark:hover:bg-muted"
                                    >
                                        <ChevronRight className="h-4 w-4" /> OAI Link
                                    </a>
                                )}
                                <a
                                    href={journal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:border-border dark:hover:bg-muted"
                                >
                                    <ChevronRight className="h-4 w-4" /> Editorial Team
                                </a>
                                <a
                                    href={`mailto:${journal.email}`}
                                    className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:border-border dark:hover:bg-muted"
                                >
                                    <ChevronRight className="h-4 w-4" /> Contact
                                </a>
                                <a
                                    href={`https://scholar.google.com/citations?view_op=search_authors&mauthors=${encodeURIComponent(journal.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:hover:bg-muted"
                                >
                                    <ChevronRight className="h-4 w-4" /> Google Scholar
                                </a>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="rounded-xl border bg-card p-5 shadow-md dark:border-border dark:bg-card">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="text-sm font-bold text-foreground">Contact Person</div>
                            </div>
                            <div className="space-y-3 text-xs text-muted-foreground">
                                {journal.editor_in_chief && (
                                    <div className="flex gap-2">
                                        <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                        <span>{journal.editor_in_chief}</span>
                                    </div>
                                )}
                                {journal.email && (
                                    <div className="flex gap-2">
                                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                        <span className="break-all">{journal.email}</span>
                                    </div>
                                )}
                                {/* Using university address as fallback */}
                                {(journal.university.address || journal.university.city) && (
                                    <div className="flex gap-2">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                        <span>
                                            {journal.university.address}
                                            {journal.university.city ? `, ${journal.university.city}` : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER CONTENT (Header & Articles) - 6 Columns */}
                    <div className="lg:col-span-6">
                        {/* Journal Header */}
                        <div className="mb-6 rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
                            <h1 className="font-heading mb-3 text-2xl leading-tight font-bold text-foreground">{journal.title}</h1>

                            <div className="mb-4 flex flex-wrap gap-3 text-xs">
                                {journal.issn && (
                                    <span className="font-medium text-muted-foreground">
                                        ISSN: <span className="text-foreground">{journal.issn}</span>
                                    </span>
                                )}
                                {journal.e_issn && (
                                    <>
                                        <span className="text-border">|</span>
                                        <span className="font-medium text-muted-foreground">
                                            E-ISSN: <span className="text-primary">{journal.e_issn}</span>
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">Published by:</span> {journal.publisher || journal.university.name}
                            </p>
                            {journal.scientific_field && (
                                <p className="mb-4 text-sm text-muted-foreground">
                                    <span className="font-semibold">Core Subject:</span> {journal.scientific_field.name}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                                <SintaBadge rank={journal.sinta_rank ?? null} />
                                {journal.accreditation_label && (
                                    <Badge
                                        variant="outline"
                                        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    >
                                        {journal.accreditation_label}
                                    </Badge>
                                )}
                                {journal.indexation_labels && journal.indexation_labels.length > 0 && (
                                    <>
                                        {journal.indexation_labels.map((indexation, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                            >
                                                {indexation}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                                <a href={journal.url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                                        <Globe className="mr-1 h-3 w-3" /> Website
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Journal Metadata Panel */}
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {journal.frequency_label && (
                                <div className="rounded-xl border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
                                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Frequency
                                    </div>
                                    <p className="text-sm font-bold text-foreground">{journal.frequency_label}</p>
                                </div>
                            )}
                            {journal.first_published_year && (
                                <div className="rounded-xl border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
                                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        <Info className="h-3.5 w-3.5" />
                                        Since
                                    </div>
                                    <p className="text-sm font-bold text-foreground">{journal.first_published_year}</p>
                                </div>
                            )}
                            {(journal.accreditation_start_year || journal.accreditation_end_year) && (
                                <div className="rounded-xl border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
                                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        <BadgeCheck className="h-3.5 w-3.5" />
                                        Accreditation Period
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        {journal.accreditation_start_year ?? '?'} &ndash; {journal.accreditation_end_year ?? '?'}
                                    </p>
                                </div>
                            )}
                            {journal.accreditation_sk_number && (
                                <div className="col-span-2 rounded-xl border bg-card p-4 shadow-sm sm:col-span-1 dark:border-border dark:bg-card">
                                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        <FileText className="h-3.5 w-3.5" />
                                        SK Number
                                    </div>
                                    <p className="text-xs font-medium break-all text-foreground">{journal.accreditation_sk_number}</p>
                                </div>
                            )}
                        </div>

                        {/* Description & Scope Section */}
                        {(journal.about || journal.scope) && (
                            <div className="mb-6 space-y-4">
                                {journal.about && (
                                    <div className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            About Journal
                                        </h2>
                                        <div className="relative">
                                            <p
                                                className={`text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground transition-all duration-300 ${
                                                    showAbout ? '' : 'line-clamp-4'
                                                }`}
                                            >
                                                {journal.about}
                                            </p>
                                            {!showAbout && (
                                                <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-card to-transparent" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowAbout((prev) => !prev)}
                                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                                        >
                                            {showAbout ? 'View Less ▲' : 'View More ▼'}
                                        </button>
                                    </div>
                                )}
                                {journal.scope && (
                                    <div className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                                            <Target className="h-5 w-5 text-primary" />
                                            Scope and Focus
                                        </h2>
                                        <div className="relative">
                                            <p
                                                className={`text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground transition-all duration-300 ${
                                                    showScope ? '' : 'line-clamp-4'
                                                }`}
                                            >
                                                {journal.scope}
                                            </p>
                                            {!showScope && (
                                                <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-card to-transparent" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowScope((prev) => !prev)}
                                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                                        >
                                            {showScope ? 'View Less ▲' : 'View More ▼'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="mb-6 flex gap-2">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search articles..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-[hsl(var(--accent-red))] text-white shadow-sm transition-all hover:bg-[hsl(var(--accent-red))]/90 hover:shadow-md"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            {(queries.search || queries.year_start || queries.volume) && (
                                <Button variant="outline" onClick={clearFilters} className="px-3">
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Article List Header */}
                        <div className="mb-4 flex items-center justify-between rounded-t-xl bg-muted p-4 dark:bg-muted">
                            <span className="text-sm font-semibold text-foreground">Articles</span>
                            <span className="text-xs text-muted-foreground">{articles.total ?? 0} Documents</span>
                        </div>

                        {/* Articles */}
                        <div className="space-y-4">
                            {articles.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-center dark:border-border dark:bg-card">
                                    <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                                    {queries.search || queries.year_start || queries.year_end || queries.volume || queries.issue ? (
                                        <>
                                            <p className="text-sm font-semibold text-foreground">No articles matched your filter</p>
                                            <p className="max-w-xs text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
                                            <button
                                                onClick={clearFilters}
                                                className="mt-1 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                                            >
                                                Clear all filters
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-foreground">No articles available yet</p>
                                            <p className="max-w-xs text-xs text-muted-foreground">
                                                Articles will appear here once they are harvested from the journal source.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                articles.data.map((article) => (
                                    <div
                                        key={article.id}
                                        className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-lg dark:border-border dark:bg-card dark:hover:border-primary"
                                    >
                                        {article.article_url ? (
                                            <a
                                                href={article.article_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mb-2 block text-lg font-bold text-primary decoration-2 underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
                                            >
                                                {toSentenceCase(article.title)}
                                            </a>
                                        ) : (
                                            <span className="mb-2 block text-lg font-bold text-foreground">{toSentenceCase(article.title)}</span>
                                        )}

                                        <div className="mb-2 text-xs text-muted-foreground">{article.authors_list || 'Unknown Author'}</div>

                                        <div className="mb-3 text-xs text-muted-foreground/80 italic">
                                            {journal.title}; Vol {article.volume || 0} No {article.issue || 0} (
                                            {new Date(article.publication_date).getFullYear()}); {article.pages ? `pp. ${article.pages}` : ''}
                                        </div>

                                        <div className="mb-4 flex items-center gap-4 text-xs">
                                            <span className="text-muted-foreground">Publisher: {journal.university.name}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-0 text-primary transition-colors hover:text-primary/80"
                                                onClick={() => {
                                                    const el = document.getElementById(`abs-${article.id}`);
                                                    if (el) el.classList.toggle('hidden');
                                                }}
                                            >
                                                Show Abstract
                                            </Button>
                                            <span className="text-border">|</span>
                                            {article.pdf_url && (
                                                <a
                                                    href={article.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
                                                >
                                                    <Download className="h-3 w-3" /> Download Original
                                                </a>
                                            )}
                                            {article.article_url && (
                                                <>
                                                    <span className="text-border">|</span>
                                                    <a
                                                        href={article.article_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
                                                    >
                                                        Original Source
                                                    </a>
                                                </>
                                            )}
                                            <span className="text-border">|</span>
                                            <a
                                                href={article.google_scholar_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
                                            >
                                                Check in Google Scholar
                                            </a>
                                        </div>

                                        <div
                                            id={`abs-${article.id}`}
                                            className="mt-4 hidden rounded-lg border border-border bg-muted p-4 text-sm text-foreground shadow-inner dark:border-border dark:bg-muted"
                                        >
                                            <h4 className="mb-1 font-bold">Abstract</h4>
                                            {article.abstract || 'No abstract available.'}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Pagination */}
                            {articles.data.length > 0 && (
                                <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                                    <span>
                                        Showing <span className="font-semibold text-foreground">{articles.from ?? 0}</span>–
                                        <span className="font-semibold text-foreground">{articles.to ?? 0}</span> of{' '}
                                        <span className="font-semibold text-foreground">{articles.total}</span> articles
                                    </span>
                                    <span>
                                        Page {articles.current_page} of {articles.last_page}
                                    </span>
                                </div>
                            )}
                            {articles.last_page > 1 && (
                                <div className="mt-8 flex justify-center gap-1">
                                    {articles.links.map((link, i) => {
                                        const isNavButton = link.label.includes('Previous') || link.label.includes('Next');
                                        const buttonClass = isNavButton ? 'px-3 py-2' : 'h-9 w-9';

                                        return link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`flex ${buttonClass} items-center justify-center rounded-lg border text-sm transition-all ${
                                                    link.active
                                                        ? 'border-[hsl(var(--accent-red))] bg-[hsl(var(--accent-red))] font-semibold text-white shadow-md'
                                                        : 'border-border bg-card text-foreground hover:bg-muted dark:bg-card dark:hover:bg-muted'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className={`flex ${buttonClass} items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground/50 dark:bg-muted`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR (Filters) - 3 Columns */}
                    <aside className="space-y-6 lg:col-span-3">
                        {/* Filter By Year */}
                        <div className="rounded-xl border bg-card shadow-md dark:border-border dark:bg-card">
                            <div className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground dark:border-border dark:bg-muted">
                                Filter by Year
                            </div>
                            <div className="p-4">
                                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{minYear}</span>
                                    <span>{maxYear}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="From"
                                        className="h-8 text-xs"
                                        value={yearFrom}
                                        min={minYear}
                                        max={maxYear}
                                        onChange={(e) => setYearFrom(e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="To"
                                        className="h-8 text-xs"
                                        value={yearTo}
                                        min={minYear}
                                        max={maxYear}
                                        onChange={(e) => setYearTo(e.target.value)}
                                    />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setYearFrom('');
                                            setYearTo('');
                                            clearFilters();
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="w-full bg-[hsl(var(--accent-red))] text-white shadow-sm hover:bg-[hsl(var(--accent-red))]/90"
                                        onClick={() => {
                                            const newQ: Record<string, any> = { ...queries, page: 1 };
                                            if (yearFrom) newQ.year_start = yearFrom;
                                            else delete newQ.year_start;
                                            if (yearTo) newQ.year_end = yearTo;
                                            else delete newQ.year_end;
                                            router.get(route('journals.show', journal.id), newQ, { preserveScroll: true, preserveState: true });
                                        }}
                                    >
                                        Filter
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Filter By Issues */}
                        <div className="rounded-xl border bg-card shadow-md dark:border-border dark:bg-card">
                            <div className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground dark:border-border dark:bg-muted">
                                Filter By Issues
                            </div>
                            <div className="max-h-[500px] overflow-y-auto p-4">
                                <div className="mb-2 border-b border-border pb-2">
                                    <button
                                        onClick={() => handleFilter('issue', '')}
                                        className={`block w-full text-left text-xs font-medium transition-colors ${!queries.volume ? 'font-bold text-[hsl(var(--accent-red))]' : 'text-muted-foreground hover:text-primary'}`}
                                    >
                                        All Issues
                                    </button>
                                </div>
                                {issuesList.length === 0 && (
                                    <p className="py-4 text-center text-xs text-muted-foreground">No issues available yet.</p>
                                )}
                                {issuesList.map((item, idx) => (
                                    <div key={idx} className="mb-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0">
                                        <button
                                            onClick={() => {
                                                router.get(
                                                    route('journals.show', journal.id),
                                                    { ...queries, volume: item.volume, issue: item.issue, page: 1 },
                                                    { preserveScroll: true, preserveState: true },
                                                );
                                            }}
                                            className={`block w-full text-left text-xs transition-colors ${
                                                queries.volume == item.volume && queries.issue == item.issue
                                                    ? 'font-bold text-[hsl(var(--accent-red))]'
                                                    : 'text-primary hover:text-primary/80'
                                            }`}
                                        >
                                            {item.label} ({item.year})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
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
