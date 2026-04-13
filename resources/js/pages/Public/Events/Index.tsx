import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Clock, Search } from 'lucide-react';
import { PaginatedData } from '@/types';
import { useState, FormEvent } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

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
        if (!dateString) return 'TBA';
        const d = new Date(dateString);
        return {
            day: d.toLocaleDateString('id-ID', { day: 'numeric' }),
            monthAndYear: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
        };
    };

    const dateFormatted = formatDate(agenda.date_start);
    const progressPercent = agenda.quota ? Math.min((agenda.registered_count / agenda.quota) * 100, 100) : 0;

    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
            <div className="relative aspect-video bg-muted overflow-hidden">
                {agenda.thumbnail_url ? (
                    <img
                        src={agenda.thumbnail_url}
                        alt={agenda.title}
                        className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <CalendarDays className="h-16 w-16 text-primary/30" />
                    </div>
                )}
                {/* Date Highlight Badge */}
                <div className="absolute top-4 right-4 bg-background/95 backdrop-blur rounded-xl shadow-lg border border-border/50 text-center overflow-hidden flex flex-col min-w-[60px]">
                    <div className="bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        {dateFormatted.monthAndYear !== 'TBA' ? new Date(agenda.date_start!).toLocaleDateString('id-ID', { month: 'short' }) : 'TBA'}
                    </div>
                    <div className="px-3 py-1.5 text-xl font-black text-foreground">
                        {dateFormatted.day}
                    </div>
                </div>

                {agenda.is_featured && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="default" className="shadow-md bg-yellow-400 text-yellow-950 hover:bg-yellow-500 border-none font-bold">Featured</Badge>
                    </div>
                )}
                {/* Countdown Overlay */}
                {countdown && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-2">
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            <span>{countdown}</span>
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="pb-3 flex-none pt-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                    {agenda.university && (
                        <div className="flex items-center gap-2">
                            {agenda.university.logo_url && (
                                <img src={agenda.university.logo_url} alt={agenda.university.name} className="w-5 h-5 object-contain" />
                            )}
                            <span className="text-xs font-medium text-muted-foreground line-clamp-1">{agenda.university.name}</span>
                        </div>
                    )}
                    <Badge variant="outline" className="shadow-sm capitalize whitespace-nowrap hidden sm:inline-flex">
                        {agenda.type}
                    </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg font-bold leading-snug">
                    <Link href={route('events.show', agenda.slug)} className="hover:text-primary transition-colors">
                        {agenda.title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="pb-4 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="space-y-2.5 text-sm text-foreground/80">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                            <span className="line-clamp-1 capitalize">
                                {agenda.location_type === 'online' ? 'Online' :
                                    agenda.location_type === 'hybrid' ? `Hybrid - ${agenda.location_venue || 'TBA'}` :
                                    (agenda.location_venue || 'Venue TBA')}
                            </span>
                        </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className={agenda.quota && agenda.registered_count >= agenda.quota ? "text-destructive font-bold" : "text-foreground"}>
                                {agenda.quota ? `${agenda.registered_count} / ${agenda.quota} Registered` : 'Unlimited Stats'}
                            </span>
                        </div>
                        {agenda.quota && (
                            <Progress value={progressPercent} className={`h-2 ${progressPercent >= 100 ? '[&>div]:bg-destructive' : '[&>div]:bg-emerald-500'}`} />
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 border-t mt-auto flex justify-between items-center bg-muted/30">
                <div className="text-sm font-semibold">
                    {agenda.price && parseFloat(agenda.price) > 0 ? (
                        `Rp ${parseFloat(agenda.price).toLocaleString('id-ID')}`
                    ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Free Event</span>
                    )}
                </div>
                <Button asChild size="sm" className="rounded-full shadow-sm hover:shadow">
                    <Link href={route('events.show', agenda.slug)}>
                        Details
                    </Link>
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
        router.get(route('events.index'), {
            search,
            type: type !== 'all' ? type : undefined
        }, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="Events & Agendas" />

            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-8 pb-12">
                    <h1
                        className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
                        style={{ fontFamily: '"El Messiri", serif' }}
                    >
                        Upcoming <span className="text-[#FCEE1F]">Events & Agendas</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Discover conferences, workshops, and calls for papers from universities across the network.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search events by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 pl-12 text-base rounded-full"
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
                        <Button type="submit" size="lg" className="w-full sm:w-auto rounded-full bg-[#079C4E] hover:bg-[#068A44] font-semibold px-8 h-12">Search</Button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
                {agendas.data.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No events found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || type !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => { setSearch(''); setType('all'); router.get(route('events.index')); }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
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
