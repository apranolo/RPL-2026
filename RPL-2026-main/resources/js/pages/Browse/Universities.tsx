/**
 * Browse Universities Component
 *
 * @description
 * A public-facing page for browsing journals grouped by university.
 * Users can view all universities with their journal counts, select a university
 * to see all its approved journals, or use the filter dropdown for quick navigation.
 *
 * @features
 * - University grid/list showing name, code, and journal count
 * - Searchable university filter dropdown
 * - Expandable view showing all journals for selected university
 * - Pagination for journals with "View More" button
 * - Only shows approved, active journals
 * - Cached university statistics for performance
 *
 * @route GET /browse/universities
 * @route GET /browse/universities?university_id=5 (selected university)
 */
import JournalCard from '@/components/journal-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Building2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string | null;
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: number | null;
    sinta_rank_label: string | null;
    is_indexed_in_scopus: boolean;
}

interface UniversityStat {
    id: number;
    name: string;
    code: string;
    short_name: string;
    journals_count: number;
}

interface SelectedUniversity {
    id: number;
    name: string;
    code: string;
    short_name: string;
}

interface PaginatedJournals {
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
}

interface Props {
    universityStats: UniversityStat[];
    selectedUniversity: SelectedUniversity | null;
    journals: PaginatedJournals | null;
    filters: {
        university_id?: string;
    };
}

export default function BrowseUniversities({ universityStats, selectedUniversity, journals, filters }: Props) {
    const [universityFilter, setUniversityFilter] = useState(filters.university_id || '');

    const handleUniversityChange = (value: string) => {
        setUniversityFilter(value);
        if (value && value !== 'all') {
            router.get(route('browse.universities'), { university_id: value }, { preserveState: true });
        } else {
            router.get(route('browse.universities'), {}, { preserveState: true });
        }
    };

    const handleUniversityCardClick = (universityId: number) => {
        setUniversityFilter(universityId.toString());
        router.get(route('browse.universities'), { university_id: universityId }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <Head title="Browse by University" />

            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <div className="border-b bg-card/50 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Browse by University</h1>
                                <p className="mt-1 text-muted-foreground">Explore journals from Muhammadiyah universities across Indonesia</p>
                            </div>
                            <Link href={route('home')}>
                                <Button variant="outline">
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-8">
                        {/* University Filter Dropdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select University</CardTitle>
                                <CardDescription>Choose a university to view all its journals, or browse the list below</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UniversityFilterCombobox
                                    universities={universityStats.map((uni) => ({
                                        id: uni.id,
                                        name: uni.name,
                                        code: uni.code,
                                        short_name: uni.short_name,
                                    }))}
                                    value={universityFilter || 'all'}
                                    onValueChange={handleUniversityChange}
                                    placeholder="All Universities"
                                    className="h-12"
                                />
                            </CardContent>
                        </Card>

                        {/* Selected University Journals View */}
                        {selectedUniversity && journals ? (
                            <div className="space-y-6">
                                <Card className="border-2 border-primary/20 bg-card/50">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-2xl">{selectedUniversity.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {selectedUniversity.code}
                                                    </Badge>
                                                    <span className="ml-2">
                                                        {journals.total} {journals.total === 1 ? 'journal' : 'journals'} available
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => handleUniversityChange('all')}>
                                                <ChevronLeft className="mr-2 h-4 w-4" />
                                                Back to All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {journals.data.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                <p className="mt-4 text-muted-foreground">No journals available yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Journals Grid */}
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                    {journals.data.map((journal) => (
                                                        <JournalCard
                                                            key={journal.id}
                                                            id={journal.id}
                                                            title={journal.title}
                                                            issn={journal.issn}
                                                            e_issn={journal.e_issn}
                                                            sinta_rank={journal.sinta_rank_label}
                                                            external_url={journal.url}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {journals.last_page > 1 && (
                                                    <div className="flex items-center justify-center gap-2 pt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    journals.links.find((link) => link.label === '&laquo; Previous')?.url || null,
                                                                )
                                                            }
                                                            disabled={journals.current_page === 1}
                                                        >
                                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                                            Previous
                                                        </Button>

                                                        <div className="flex items-center gap-2">
                                                            {journals.links
                                                                .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                                                                .map((link, index) => (
                                                                    <Button
                                                                        key={index}
                                                                        variant={link.active ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handlePageChange(link.url)}
                                                                        disabled={!link.url}
                                                                    >
                                                                        {link.label}
                                                                    </Button>
                                                                ))}
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    journals.links.find((link) => link.label === 'Next &raquo;')?.url || null,
                                                                )
                                                            }
                                                            disabled={journals.current_page === journals.last_page}
                                                        >
                                                            Next
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            /* University Grid View */
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">All Universities ({universityStats.length})</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {universityStats.map((university) => (
                                        <Card
                                            key={university.id}
                                            className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                                            onClick={() => handleUniversityCardClick(university.id)}
                                        >
                                            <CardHeader>
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20">
                                                        <Building2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <CardTitle className="text-base leading-tight group-hover:text-primary">
                                                            {university.short_name || university.name}
                                                        </CardTitle>
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {university.code}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Journals</span>
                                                    <Badge variant="secondary" className="font-semibold">
                                                        {university.journals_count}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
