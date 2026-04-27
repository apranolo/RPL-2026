import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Clock, MapPin, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface AgendaItem {
    id: number;
    title: string;
    slug: string;
    type: string;
    description: string;
    thumbnail_url: string | null;
    date_start: string | null;
    time_start: string | null;
    location_type: string;
    location_venue: string | null;
    price: string | null;
    quota: number | null;
    registered_count: number;
    is_featured: boolean;
    university: {
        name: string;
        logo_url: string | null;
    } | null;
}

function EventCard({ agenda }: { agenda: AgendaItem }) {
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        if (!agenda.date_start) return;

        const updateCountdown = () => {
            const startDateTime = new Date(`${agenda.date_start}T${agenda.time_start || '00:00'}`);
            const now = new Date();
            const diff = startDateTime.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown('Event Started');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setCountdown(`Starts in ${days}d ${hours}h`);
        };

        updateCountdown();

        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [agenda.date_start, agenda.time_start]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return { day: 'TBA', monthAndYear: 'TBA' };
        const d = new Date(dateString);
        return {
            day: d.toLocaleDateString('id-ID', { day: 'numeric' }),
            monthAndYear: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        };
    };

    const dateFormatted = formatDate(agenda.date_start);
    const progressPercent = agenda.quota ? Math.min((agenda.registered_count / agenda.quota) * 100, 100) : 0;

    return (
        <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {agenda.thumbnail_url ? (
                    <img
                        src={agenda.thumbnail_url}
                        alt={agenda.title}
                        className="h-full w-full transform object-cover transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                        <CalendarDays className="h-16 w-16 text-primary/30" />
                    </div>
                )}
                {/* Date Highlight Badge */}
                <div className="absolute top-4 right-4 flex min-w-[60px] flex-col overflow-hidden rounded-xl border border-border/50 bg-background/95 text-center shadow-lg backdrop-blur">
                    <div className="bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                        {agenda.date_start ? new Date(agenda.date_start).toLocaleDateString('id-ID', { month: 'short' }) : 'TBA'}
                    </div>
                    <div className="px-3 py-1.5 text-xl font-black text-foreground">{dateFormatted.day}</div>
                </div>

                {agenda.is_featured && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="default" className="border-none bg-yellow-400 font-bold text-yellow-950 shadow-md hover:bg-yellow-500">
                            Featured
                        </Badge>
                    </div>
                )}
                {/* Countdown Overlay */}
                {countdown && (
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            <span>{countdown}</span>
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="flex-none pt-5 pb-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                    {agenda.university && (
                        <div className="flex items-center gap-2">
                            {agenda.university.logo_url && (
                                <img src={agenda.university.logo_url} alt={agenda.university.name} className="h-5 w-5 object-contain" />
                            )}
                            <span className="line-clamp-1 text-xs font-medium text-muted-foreground">{agenda.university.name}</span>
                        </div>
                    )}
                    <Badge variant="outline" className="hidden whitespace-nowrap capitalize shadow-sm sm:inline-flex">
                        {agenda.type}
                    </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-snug font-bold">
                    <Link href={route('events.show', agenda.slug)} className="transition-colors hover:text-primary">
                        {agenda.title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-grow flex-col justify-between pb-4">
                <div className="space-y-4">
                    <div className="space-y-2.5 text-sm text-foreground/80">
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="line-clamp-1 capitalize">
                                {agenda.location_type.toLowerCase() === 'online'
                                    ? 'Online'
                                    : agenda.location_type.toLowerCase() === 'hybrid'
                                      ? `Hybrid - ${agenda.location_venue || 'TBA'}`
                                      : agenda.location_venue || 'Venue TBA'}
                            </span>
                        </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="border-t border-border/50 pt-2">
                        <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Capacity</span>
                            <span
                                className={agenda.quota && agenda.registered_count >= agenda.quota ? 'font-bold text-destructive' : 'text-foreground'}
                            >
                                {agenda.quota ? `${agenda.registered_count} / ${agenda.quota} Registered` : 'Unlimited Stats'}
                            </span>
                        </div>
                        {agenda.quota && (
                            <Progress
                                value={progressPercent}
                                className={`h-2 ${progressPercent >= 100 ? '[&>div]:bg-destructive' : '[&>div]:bg-emerald-500'}`}
                            />
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-auto flex items-center justify-between border-t bg-muted/30 pt-4">
                <div className="text-sm font-semibold">
                    {agenda.price && parseFloat(agenda.price) > 0 ? (
                        `Rp ${parseFloat(agenda.price).toLocaleString('id-ID')}`
                    ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Free Event</span>
                    )}
                </div>
                <Button asChild size="sm" className="rounded-full shadow-sm hover:shadow">
                    <Link href={route('events.show', agenda.slug)}>Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

interface Props {
    agendas: PaginatedData<AgendaItem>;
    filters?: { search?: string; type?: string };
    types?: string[];
}

export default function Index({ agendas, filters, types = [] }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('events.index'),
            {
                search,
                type: type !== 'all' ? type : undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <PublicLayout>
            <Head title="Events & Agendas" />

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        Upcoming <span className="text-[#FCEE1F]">Events & Agendas</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Discover conferences, workshops, and calls for papers from universities across the network.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-20 mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search events by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-full pl-12 text-base"
                            />
                        </div>
                        <div className="w-full sm:w-[250px]">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="Event Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t} value={t} className="capitalize">
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44] sm:w-auto"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                {agendas.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No events found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || type !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearch('');
                                    setType('all');
                                    router.get(route('events.index'));
                                }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                        {agendas.data.map((agenda) => (
                            <EventCard key={agenda.id} agenda={agenda} />
                        ))}
                    </div>
                )}

                {agendas.last_page > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination links={agendas.links} />
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
